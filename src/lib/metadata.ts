import { loadCachedJson, saveCachedJson } from './cache';
import type {
  DetectedSystem,
  NormalizedAsset,
  NormalizedManifest,
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
const GITHUB_RELEASES_API = 'https://api.github.com/repos/boybook/tx-5dr/releases?per_page=20';
const RAW_GITHUB_BASE = 'https://raw.githubusercontent.com/boybook/tx-5dr';
const OSS_BASE_URL = 'https://tx5dr.oss-cn-hangzhou.aliyuncs.com';
const CATALOG_CACHE_MS = 15 * 60 * 1000;
const baseVersionCache = new Map<string, Promise<string | null>>();

type RawManifestAsset = {
  name?: string;
  url?: string;
  sha256?: string;
  size?: number;
  platform?: string;
  arch?: string;
  package_type?: string;
};

type RawManifest = {
  product?: ProductType;
  channel?: ReleaseChannel;
  tag?: string;
  version?: string;
  commit?: string;
  published_at?: string;
  release_notes?: string;
  base_url?: string;
  assets?: RawManifestAsset[];
};

type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
  size?: number;
};

type GitHubRelease = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  published_at?: string;
  body?: string;
  assets?: GitHubReleaseAsset[];
};

type GitHubCatalog = ReleaseCatalog;

type ParsedBody = {
  commitShort: string | null;
  commitFull: string | null;
  builtAt: string | null;
};

const emptyCatalog = (): ReleaseCatalog => ({
  app: { nightly: null, release: null },
  server: { nightly: null, release: null },
  countryCode: null,
  preferredSource: 'github',
});

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
  return input;
}

function normalizePackageType(value: string | null | undefined): string {
  const input = (value || '').trim();
  if (!input) return 'unknown';
  return input === 'AppImage' ? 'appimage' : input.toLowerCase();
}

function trimTagVersion(value: string): string {
  return value.replace(/^v/i, '').replace(/-server$/, '');
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
    platform: (asset.platform as SystemPlatform | 'unknown') || detected.platform,
    arch: asset.arch || detected.arch,
    packageType: normalizePackageType(asset.package_type) || detected.packageType,
  };
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

function parseGithubBody(body: string | null | undefined): ParsedBody {
  const content = body || '';
  const commitFull = content.match(/\/commit\/([0-9a-f]{7,40})/i)?.[1] ?? null;
  const commitShort = content.match(/\*\*Commit\*\*[^[]*\[([0-9a-f]{7,40})\]/i)?.[1] ?? commitFull?.slice(0, 7) ?? null;
  const builtAt = content.match(/\*\*Built at\*\*[^:]*:\s*([^\n]+)/i)?.[1]?.trim() ?? null;

  return {
    commitShort,
    commitFull,
    builtAt,
  };
}

function toNightlyStamp(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = [
    date.getUTCFullYear(),
    `${date.getUTCMonth() + 1}`.padStart(2, '0'),
    `${date.getUTCDate()}`.padStart(2, '0'),
    `${date.getUTCHours()}`.padStart(2, '0'),
    `${date.getUTCMinutes()}`.padStart(2, '0'),
  ];
  return parts.join('');
}

export function buildNightlyVersion(baseVersion: string, builtAt: string | null, shortCommit: string | null): string | null {
  const stamp = builtAt ? toNightlyStamp(builtAt) : null;
  if (!baseVersion || !stamp || !shortCommit) {
    return null;
  }
  return `${trimTagVersion(baseVersion)}-nightly.${stamp}+${shortCommit}`;
}

async function fetchBaseVersionForCommit(commit: string | null): Promise<string | null> {
  if (!commit) {
    return null;
  }

  if (!baseVersionCache.has(commit)) {
    baseVersionCache.set(commit, (async () => {
      try {
        const data = await fetchJson<{ version?: string }>(`${RAW_GITHUB_BASE}/${commit}/package.json`, 8000);
        return data.version ? trimTagVersion(data.version) : null;
      } catch {
        return null;
      }
    })());
  }

  return baseVersionCache.get(commit) ?? Promise.resolve(null);
}

async function buildGithubManifest(release: GitHubRelease, product: ProductType, channel: ReleaseChannel): Promise<NormalizedManifest> {
  const parsedBody = parseGithubBody(release.body);
  const releaseAssets = (release.assets || []).filter((asset) => asset.name !== 'latest.json');
  const assets = releaseAssets
    .map((asset) => toNormalizedAsset({
      name: asset.name,
      url: asset.browser_download_url,
      size: asset.size,
    }, product))
    .filter((asset): asset is NormalizedAsset => Boolean(asset));

  let version: string | null;
  const publishedAt = parsedBody.builtAt || release.published_at || null;

  if (channel === 'nightly') {
    const baseVersion = await fetchBaseVersionForCommit(parsedBody.commitFull);
    version = buildNightlyVersion(baseVersion || '', publishedAt, parsedBody.commitShort);
  } else {
    version = trimTagVersion(release.tag_name);
  }

  return {
    product,
    channel,
    tag: release.tag_name,
    version,
    commit: parsedBody.commitShort,
    publishedAt,
    releaseNotes: release.body || null,
    source: 'github',
    assets,
  };
}

function isNightlyAppRelease(release: GitHubRelease): boolean {
  return release.tag_name === 'nightly-app' && !release.draft;
}

function isNightlyServerRelease(release: GitHubRelease): boolean {
  return release.tag_name === 'nightly-server' && !release.draft;
}

function isStableAppRelease(release: GitHubRelease): boolean {
  if (release.draft || release.prerelease) return false;
  if (release.tag_name.startsWith('nightly-')) return false;
  if (release.tag_name.endsWith('-server') || release.tag_name.endsWith('-docker')) return false;
  return true;
}

function isStableServerRelease(release: GitHubRelease): boolean {
  if (release.draft || release.prerelease) return false;
  if (release.tag_name.startsWith('nightly-')) return false;
  return release.tag_name.endsWith('-server');
}

async function fetchGithubCatalog(): Promise<GitHubCatalog> {
  try {
    const releases = await fetchJson<GitHubRelease[]>(GITHUB_RELEASES_API, 8000);
    const appNightly = releases.find(isNightlyAppRelease);
    const serverNightly = releases.find(isNightlyServerRelease);
    const appRelease = releases.find(isStableAppRelease);
    const serverRelease = releases.find(isStableServerRelease);

    return {
      app: {
        nightly: appNightly ? await buildGithubManifest(appNightly, 'app', 'nightly') : null,
        release: appRelease ? await buildGithubManifest(appRelease, 'app', 'release') : null,
      },
      server: {
        nightly: serverNightly ? await buildGithubManifest(serverNightly, 'server', 'nightly') : null,
        release: serverRelease ? await buildGithubManifest(serverRelease, 'server', 'release') : null,
      },
      countryCode: null,
      preferredSource: 'github',
    };
  } catch {
    return emptyCatalog();
  }
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

function pickManifest(
  primary: ReleaseCatalog,
  secondary: ReleaseCatalog,
  product: ProductType,
  channel: ReleaseChannel,
): NormalizedManifest | null {
  return primary[product][channel] || secondary[product][channel] || null;
}

export async function fetchReleaseCatalog(policy: SourcePolicy): Promise<ReleaseCatalog> {
  const cacheKey = `tx5dr-site:catalog:${policy}`;
  const cached = loadCachedJson<ReleaseCatalog>(cacheKey, CATALOG_CACHE_MS);
  if (cached && hasCatalogData(cached)) {
    return cached;
  }

  const { preferredSource, countryCode } = await resolvePreferredSource(policy);
  const [ossCatalog, githubCatalog] = await Promise.all([fetchOssCatalog(), fetchGithubCatalog()]);
  const primary = preferredSource === 'oss' ? ossCatalog : githubCatalog;
  const secondary = preferredSource === 'oss' ? githubCatalog : ossCatalog;

  const catalog: ReleaseCatalog = {
    app: {
      nightly: pickManifest(primary, secondary, 'app', 'nightly'),
      release: pickManifest(primary, secondary, 'app', 'release'),
    },
    server: {
      nightly: pickManifest(primary, secondary, 'server', 'nightly'),
      release: pickManifest(primary, secondary, 'server', 'release'),
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

export function parseGithubBodyForTesting(body: string): ParsedBody {
  return parseGithubBody(body);
}

export function hasCatalogDataForTesting(catalog: ReleaseCatalog): boolean {
  return hasCatalogData(catalog);
}
