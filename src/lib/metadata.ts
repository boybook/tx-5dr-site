import { loadCachedJson, saveCachedJson } from './cache';
import type {
  DetectedSystem,
  NormalizedAsset,
  NormalizedManifest,
  NormalizedRecentCommit,
  ProductType,
  ReleaseCatalog,
  ReleaseChannel,
  ReleaseSource,
  SourcePolicy,
  SystemPlatform,
} from './types';

const COUNTRY_LOOKUP_URLS = [
  'https://ipinfo.io/country',
  'https://ifconfig.co/country-iso',
  'https://ipapi.co/country/',
  'https://api.country.is/',
] as const;
const RECENT_COMMITS_LIMIT = 10;
const OSS_BASE_URL = 'https://dl.tx5dr.com';
const CATALOG_CACHE_MS = 15 * 60 * 1000;

type RawManifestAsset = {
  name?: string;
  url?: string;
  url_cn?: string;
  url_global?: string;
  url_oss?: string;
  url_github?: string;
  sha256?: string;
  size?: number;
  platform?: string;
  arch?: string;
  package_type?: string;
};

type RawManifestRecentCommit = {
  id?: string;
  short_id?: string;
  title?: string;
  published_at?: string;
};

type RawManifest = {
  product?: ProductType;
  channel?: ReleaseChannel;
  tag?: string;
  version?: string;
  commit?: string;
  commit_title?: string;
  published_at?: string;
  release_notes?: string;
  base_url?: string;
  recent_commits?: RawManifestRecentCommit[];
  assets?: RawManifestAsset[];
};

function hasCatalogData(catalog: ReleaseCatalog): boolean {
  return Boolean(
    catalog.app.nightly
    || catalog.app.release
    || catalog.server.nightly
    || catalog.server.release,
  );
}

function normalizeCountryCode(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(trimmed)) {
    return trimmed;
  }
  const jsonMatch = trimmed.match(/"COUNTRY"\s*:\s*"([A-Z]{2})"/i);
  return jsonMatch?.[1] ?? null;
}

function normalizeArchKey(value: string | null | undefined): string {
  const input = (value || '').trim().toLowerCase();
  if (input === 'amd64') return 'x64';
  if (input === 'aarch64') return 'arm64';
  if (input === 'appimage') return 'appimage';
  return input || 'unknown';
}

function normalizePackageType(value: string | null | undefined): string {
  const input = (value || '').trim();
  if (!input) return 'unknown';
  return input === 'AppImage' ? 'appimage' : input.toLowerCase();
}

function joinUrl(base: string, suffix: string): string {
  return `${base.replace(/\/+$/, '')}/${suffix.replace(/^\/+/, '')}`;
}

function getOssManifestUrl(product: ProductType, channel: ReleaseChannel): string {
  return joinUrl(OSS_BASE_URL, `tx-5dr/${product}/${channel}/latest.json`);
}

async function fetchText(url: string, timeoutMs = 8000): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json, text/plain;q=0.9, */*;q=0.8' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`request_failed:${response.status}`);
  }
  return response.text();
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const text = await fetchText(url, timeoutMs);
  return JSON.parse(text) as T;
}

function detectAppAssetMetadata(fileName: string): Pick<NormalizedAsset, 'platform' | 'arch' | 'packageType'> {
  const lower = fileName.toLowerCase();
  const platform: SystemPlatform | 'unknown' = lower.includes('-windows-')
    ? 'windows'
    : lower.includes('-macos-')
      ? 'macos'
      : lower.includes('-linux-')
        ? 'linux'
        : 'unknown';
  const arch = lower.includes('-arm64') ? 'arm64' : lower.includes('-amd64') ? 'amd64' : lower.includes('-x64') ? 'x64' : 'unknown';
  const extension = fileName.includes('.') ? fileName.split('.').pop() || 'unknown' : 'unknown';
  return {
    platform,
    arch,
    packageType: normalizePackageType(extension),
  };
}

function detectServerAssetMetadata(fileName: string): Pick<NormalizedAsset, 'platform' | 'arch' | 'packageType'> {
  if (fileName === 'install-online.sh') {
    return { platform: 'unknown', arch: 'unknown', packageType: 'sh' };
  }
  const match = fileName.match(/server-linux-(amd64|arm64)\.(deb|rpm)$/i);
  if (!match) {
    return { platform: 'unknown', arch: 'unknown', packageType: 'unknown' };
  }
  return {
    platform: 'linux',
    arch: match[1].toLowerCase(),
    packageType: normalizePackageType(match[2]),
  };
}

function normalizeAssetPlatform(value: string | null | undefined, fallback: NormalizedAsset['platform']): NormalizedAsset['platform'] {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'windows' || normalized === 'macos' || normalized === 'linux' || normalized === 'android' || normalized === 'ios') {
    return normalized;
  }
  return fallback;
}

function normalizeAssetArch(value: string | null | undefined, fallback: string): string {
  const normalized = normalizeArchKey(value);
  return normalized !== 'unknown' ? normalized : fallback;
}

function normalizeAssetPackageType(value: string | null | undefined, fallback: string): string {
  const normalized = normalizePackageType(value);
  return normalized !== 'unknown' ? normalized : fallback;
}

function toNormalizedAsset(asset: RawManifestAsset, product: ProductType): NormalizedAsset | null {
  if (!asset.name || !asset.url) {
    return null;
  }

  const detected = product === 'server'
    ? detectServerAssetMetadata(asset.name)
    : detectAppAssetMetadata(asset.name);

  return {
    name: asset.name,
    url: asset.url,
    sha256: asset.sha256,
    size: asset.size,
    platform: normalizeAssetPlatform(asset.platform, detected.platform),
    arch: normalizeAssetArch(asset.arch, detected.arch),
    packageType: normalizeAssetPackageType(asset.package_type, detected.packageType),
    urlCn: asset.url_cn,
    urlGlobal: asset.url_global,
    urlOss: asset.url_oss || asset.url,
    urlGithub: asset.url_github,
  };
}

function normalizeRecentCommit(commit: RawManifestRecentCommit): NormalizedRecentCommit | null {
  const id = (commit.id || '').trim();
  const shortId = (commit.short_id || id.slice(0, 7)).trim();
  const title = (commit.title || '').trim();
  const publishedAt = (commit.published_at || '').trim();

  if (!id && !shortId && !title && !publishedAt) {
    return null;
  }

  return {
    id: id || shortId,
    shortId,
    title,
    publishedAt: publishedAt || null,
  };
}

function normalizeRecentCommits(raw: RawManifest): NormalizedRecentCommit[] {
  const commits = (raw.recent_commits || [])
    .map((commit) => normalizeRecentCommit(commit))
    .filter((commit): commit is NormalizedRecentCommit => Boolean(commit))
    .slice(0, RECENT_COMMITS_LIMIT);

  if (commits.length > 0) {
    return commits;
  }

  const commit = (raw.commit || '').trim();
  const commitTitle = (raw.commit_title || '').trim();
  const publishedAt = (raw.published_at || '').trim();
  if (!commit && !commitTitle && !publishedAt) {
    return [];
  }

  return [{
    id: commit,
    shortId: commit.slice(0, 7),
    title: commitTitle,
    publishedAt: publishedAt || null,
  }];
}

function normalizeManifest(raw: RawManifest, source: ReleaseSource): NormalizedManifest | null {
  if (!raw.product || !raw.channel || !raw.tag) {
    return null;
  }

  const assets = (raw.assets || [])
    .map((asset) => toNormalizedAsset(asset, raw.product!))
    .filter((asset): asset is NormalizedAsset => Boolean(asset));

  return {
    product: raw.product,
    channel: raw.channel,
    tag: raw.tag,
    version: raw.version || null,
    commit: raw.commit || null,
    commitTitle: raw.commit_title || null,
    recentCommits: normalizeRecentCommits(raw),
    publishedAt: raw.published_at || null,
    releaseNotes: raw.release_notes || null,
    source,
    baseUrl: raw.base_url,
    assets,
  };
}

async function fetchCountryCode(): Promise<string | null> {
  for (const url of COUNTRY_LOOKUP_URLS) {
    try {
      const text = await fetchText(url, 4000);
      const country = normalizeCountryCode(text);
      if (country) return country;
    } catch {
      // ignore
    }
  }
  return null;
}

async function resolvePreferredSource(policy: SourcePolicy): Promise<{ preferredSource: ReleaseSource; countryCode: string | null }> {
  if (policy === 'github' || policy === 'oss') {
    return { preferredSource: policy, countryCode: null };
  }

  const countryCode = await fetchCountryCode();
  return {
    preferredSource: countryCode === 'CN' ? 'oss' : 'github',
    countryCode,
  };
}

async function fetchOssManifest(product: ProductType, channel: ReleaseChannel): Promise<NormalizedManifest | null> {
  try {
    const raw = await fetchJson<RawManifest>(getOssManifestUrl(product, channel), 8000);
    return normalizeManifest(raw, 'oss');
  } catch {
    return null;
  }
}

async function fetchOssCatalog(): Promise<ReleaseCatalog> {
  const [appNightly, appRelease, serverNightly, serverRelease] = await Promise.all([
    fetchOssManifest('app', 'nightly'),
    fetchOssManifest('app', 'release'),
    fetchOssManifest('server', 'nightly'),
    fetchOssManifest('server', 'release'),
  ]);

  return {
    app: {
      nightly: appNightly,
      release: appRelease,
    },
    server: {
      nightly: serverNightly,
      release: serverRelease,
    },
    countryCode: null,
    preferredSource: 'oss',
  };
}

function resolveAssetUrl(asset: NormalizedAsset, preferredSource: ReleaseSource): { url: string; source: ReleaseSource } {
  const candidates: Array<{ source: ReleaseSource; url: string | null }> = preferredSource === 'oss'
    ? [
      { source: 'oss', url: asset.urlCn || asset.urlOss || asset.url || null },
      { source: 'github', url: asset.urlGlobal || asset.urlGithub || null },
      { source: 'oss', url: asset.url || null },
    ]
    : [
      { source: 'github', url: asset.urlGlobal || asset.urlGithub || null },
      { source: 'oss', url: asset.urlCn || asset.urlOss || asset.url || null },
      { source: 'oss', url: asset.url || null },
    ];

  for (const candidate of candidates) {
    if (candidate.url) {
      return { url: candidate.url, source: candidate.source };
    }
  }

  return { url: asset.url, source: 'oss' };
}

function resolveManifestAssets(manifest: NormalizedManifest | null, preferredSource: ReleaseSource): NormalizedManifest | null {
  if (!manifest) return null;

  return {
    ...manifest,
    assets: manifest.assets.map((asset) => {
      const resolved = resolveAssetUrl(asset, preferredSource);
      return {
        ...asset,
        url: resolved.url,
        resolvedUrl: resolved.url,
        resolvedSource: resolved.source,
      };
    }),
  };
}

export async function fetchReleaseCatalog(policy: SourcePolicy): Promise<ReleaseCatalog> {
  const cacheKey = `tx5dr-site:catalog:${policy}`;
  const cached = loadCachedJson<ReleaseCatalog>(cacheKey, CATALOG_CACHE_MS);
  if (cached && hasCatalogData(cached)) {
    return cached;
  }

  const { preferredSource, countryCode } = await resolvePreferredSource(policy);
  const ossCatalog = await fetchOssCatalog();

  const catalog: ReleaseCatalog = {
    app: {
      nightly: resolveManifestAssets(ossCatalog.app.nightly, preferredSource),
      release: resolveManifestAssets(ossCatalog.app.release, preferredSource),
    },
    server: {
      nightly: resolveManifestAssets(ossCatalog.server.nightly, preferredSource),
      release: resolveManifestAssets(ossCatalog.server.release, preferredSource),
    },
    countryCode,
    preferredSource,
  };

  if (hasCatalogData(catalog)) {
    saveCachedJson(cacheKey, catalog);
  }
  return catalog;
}

function packagePriority(product: ProductType, platform: SystemPlatform | 'unknown', packageType: string): number {
  const normalizedType = normalizePackageType(packageType);
  const order = product === 'server'
    ? ['sh', 'deb', 'rpm']
    : platform === 'windows'
      ? ['msi', '7z', 'zip']
      : platform === 'macos'
        ? ['dmg', 'zip']
        : platform === 'linux'
          ? ['deb', 'rpm', 'zip', 'appimage']
          : ['zip', '7z', 'msi', 'dmg', 'deb', 'rpm', 'sh'];
  const index = order.indexOf(normalizedType);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function sortAssetsForDisplay(
  manifest: NormalizedManifest | null,
  system?: DetectedSystem,
): NormalizedAsset[] {
  if (!manifest) return [];

  const platform = system?.platform ?? 'unknown';
  return [...manifest.assets].sort((left, right) => {
    const leftPlatformScore = left.platform === platform ? 0 : left.platform === 'unknown' ? 2 : 1;
    const rightPlatformScore = right.platform === platform ? 0 : right.platform === 'unknown' ? 2 : 1;
    if (leftPlatformScore !== rightPlatformScore) {
      return leftPlatformScore - rightPlatformScore;
    }

    const leftPriority = packagePriority(manifest.product, left.platform, left.packageType);
    const rightPriority = packagePriority(manifest.product, right.platform, right.packageType);
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.name.localeCompare(right.name);
  });
}

export function getRecommendedAsset(
  manifest: NormalizedManifest | null,
  system: DetectedSystem,
): NormalizedAsset | null {
  if (!manifest) return null;

  const platformMatches = manifest.assets.filter((asset) => asset.platform === system.platform);
  if (platformMatches.length === 0) {
    return null;
  }

  const uniqueArchitectures = new Set(platformMatches.map((asset) => normalizeArchKey(asset.arch)).filter(Boolean));
  let candidates = platformMatches;

  if (system.arch !== 'unknown') {
    const archMatches = platformMatches.filter((asset) => normalizeArchKey(asset.arch) === system.arch);
    if (archMatches.length > 0) {
      candidates = archMatches;
    } else if (uniqueArchitectures.size > 1) {
      return null;
    }
  } else if (uniqueArchitectures.size > 1) {
    return null;
  }

  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort((left, right) => {
    const leftPriority = packagePriority(manifest.product, left.platform, left.packageType);
    const rightPriority = packagePriority(manifest.product, right.platform, right.packageType);
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return left.name.localeCompare(right.name);
  })[0] ?? null;
}

export function resolveAssetUrlForTesting(asset: NormalizedAsset, preferredSource: ReleaseSource): { url: string; source: ReleaseSource } {
  return resolveAssetUrl(asset, preferredSource);
}

export function hasCatalogDataForTesting(catalog: ReleaseCatalog): boolean {
  return hasCatalogData(catalog);
}
