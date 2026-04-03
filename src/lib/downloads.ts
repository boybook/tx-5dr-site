import type { TFunction } from 'i18next';
import type { Locale } from './preferences';
import type { DetectedSystem, NormalizedAsset } from './types';

function getPackagePriorityForPlatform(platform: DetectedSystem['platform'], packageType: string): number {
  const normalized = packageType.toLowerCase();
  const order = platform === 'windows'
    ? ['msi', '7z', 'zip']
    : platform === 'macos'
      ? ['dmg', 'zip']
      : platform === 'linux'
        ? ['deb', 'rpm', 'zip', 'appimage']
        : ['zip', '7z', 'msi', 'dmg', 'deb', 'rpm'];
  const index = order.indexOf(normalized);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function getDefaultArchForPlatform(platform: DetectedSystem['platform']): string {
  return platform === 'macos' ? 'arm64' : 'x64';
}

function pickAssetForArch(
  assets: NormalizedAsset[],
  platform: DetectedSystem['platform'],
  arch: string,
): NormalizedAsset | null {
  const matches = assets.filter((asset) => asset.arch.toLowerCase() === arch.toLowerCase());
  if (matches.length === 0) {
    return null;
  }

  return [...matches].sort((left, right) => {
    const leftPriority = getPackagePriorityForPlatform(platform, left.packageType);
    const rightPriority = getPackagePriorityForPlatform(platform, right.packageType);
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return left.name.localeCompare(right.name);
  })[0] ?? null;
}

export function getPackageLabel(packageType: string, t: TFunction): string {
  const normalized = packageType.toLowerCase();
  switch (normalized) {
    case 'msi':
    case 'dmg':
    case 'zip':
    case '7z':
    case 'deb':
    case 'rpm':
    case 'sh':
    case 'appimage':
      return t(`packageType.${normalized}`);
    default:
      return t('packageType.unknown');
  }
}

export function getPackageExtensionLabel(fileName: string): string {
  const trimmed = fileName.trim();
  const lastDotIndex = trimmed.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === trimmed.length - 1) {
    return '';
  }
  return trimmed.slice(lastDotIndex);
}

export function getPlatformLabel(platform: DetectedSystem['platform'], t: TFunction): string {
  switch (platform) {
    case 'windows':
      return t('system.windows');
    case 'macos':
      return t('system.macos');
    case 'linux':
      return t('system.linux');
    case 'android':
      return 'Android';
    case 'ios':
      return 'iOS';
    default:
      return t('system.unknown');
  }
}

export function getArchLabel(arch: string, t: TFunction): string {
  switch (arch.toLowerCase()) {
    case 'x64':
    case 'amd64':
      return t('system.x64');
    case 'arm64':
    case 'aarch64':
      return t('system.arm64');
    default:
      return t('system.unknownArch');
  }
}

export function formatTime(value: string | null, locale: Locale): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function formatBytes(value: number | undefined): string {
  if (!value || value <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let next = value;
  let unitIndex = 0;
  while (next >= 1024 && unitIndex < units.length - 1) {
    next /= 1024;
    unitIndex += 1;
  }
  return `${next.toFixed(next >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getSourceLabel(source: 'oss' | 'github' | 'auto', t: TFunction): string {
  if (source === 'oss') return t('source.oss');
  if (source === 'github') return t('source.github');
  return t('source.auto');
}

export function buildHeroDownloadOptions(
  assets: NormalizedAsset[],
  platform: DetectedSystem['platform'],
  arch: DetectedSystem['arch'],
): { primary: NormalizedAsset | null; alternates: NormalizedAsset[] } {
  if (assets.length === 0) {
    return { primary: null, alternates: [] };
  }

  const archOrder = Array.from(new Set(assets.map((asset) => asset.arch.toLowerCase())));
  const preferredArch = arch !== 'unknown' ? arch : getDefaultArchForPlatform(platform);
  const primary = pickAssetForArch(assets, platform, preferredArch)
    ?? pickAssetForArch(assets, platform, getDefaultArchForPlatform(platform))
    ?? pickAssetForArch(assets, platform, archOrder[0] || '')
    ?? null;

  if (!primary) {
    return { primary: null, alternates: [] };
  }

  const alternates = archOrder
    .filter((candidateArch) => candidateArch !== primary.arch.toLowerCase())
    .map((candidateArch) => pickAssetForArch(assets, platform, candidateArch))
    .filter((asset): asset is NormalizedAsset => Boolean(asset));

  return { primary, alternates };
}

export function getHeroAssetLabel(asset: NormalizedAsset, platformLabel: string, t: TFunction): string {
  const parts = [t('hero.primaryCta', { platform: platformLabel })];
  if (asset.packageType.toLowerCase() !== 'unknown') {
    parts.push(getPackageLabel(asset.packageType, t));
  }
  parts.push(getArchLabel(asset.arch, t));
  return parts.join(' · ');
}

export function getAssetCardTitle(asset: NormalizedAsset, fallbackTitle: string, t: TFunction): string {
  const parts: string[] = [];

  if (asset.platform !== 'unknown') {
    parts.push(getPlatformLabel(asset.platform, t));
  } else {
    parts.push(fallbackTitle);
  }

  if (asset.arch.toLowerCase() !== 'unknown') {
    parts.push(getArchLabel(asset.arch, t));
  }

  return parts.join(' · ');
}
