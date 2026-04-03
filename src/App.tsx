import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { fetchReleaseCatalog, sortAssetsForDisplay } from './lib/metadata';
import { detectSystem } from './lib/system';
import type { DetectedSystem, NormalizedAsset, NormalizedManifest, ReleaseCatalog } from './lib/types';

type ThemeMode = 'light' | 'dark';
type ThemePreference = ThemeMode | 'system';
type Locale = 'en' | 'zh-CN';

const REPO_URL = 'https://github.com/boybook/tx-5dr';
const NIGHTLY_APP_RELEASE_URL = 'https://github.com/boybook/tx-5dr/releases/tag/nightly-app';
const NIGHTLY_SERVER_INSTALL_SCRIPT_URL = 'https://github.com/boybook/tx-5dr/releases/download/nightly-server/install-online.sh';
const NIGHTLY_SERVER_INSTALL_COMMAND = `curl -fsSL ${NIGHTLY_SERVER_INSTALL_SCRIPT_URL} | sudo bash`;

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.59 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.32 9.32 0 0 1 12 6.84a9.3 9.3 0 0 1 2.5.35c1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.95-2.35 4.81-4.59 5.07.36.32.69.94.69 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.24C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="none">
      <path
        d="M5 7.5 10 12.5l5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="none">
      <rect x="6.5" y="4.5" width="9" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 12.5V6.5c0-1.1.9-2 2-2h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="none">
      <path
        d="m5 10 3.2 3.2L15 6.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className} fill="none">
      <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 2.5v2.1M10 15.4v2.1M17.5 10h-2.1M4.6 10H2.5M15.3 4.7l-1.5 1.5M6.2 13.8l-1.5 1.5M15.3 15.3l-1.5-1.5M6.2 6.2 4.7 4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path
        d="M21 14.2A8.9 8.9 0 1 1 9.8 3a.75.75 0 0 1 .76 1.04 7.1 7.1 0 0 0 9.4 9.4A.75.75 0 0 1 21 14.2Z"
      />
    </svg>
  );
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function removeStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function getStoredThemePreference(): ThemePreference {
  const stored = readStorage('tx5dr-site:theme');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return 'system';
}

function resolveTheme(preference: ThemePreference): ThemeMode {
  if (preference === 'dark' || preference === 'light') {
    return preference;
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function getInitialLanguage(): Locale {
  const stored = readStorage('tx5dr-site:language');
  if (stored === 'zh-CN' || stored === 'en') {
    return stored;
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
}

function getPackageLabel(packageType: string, t: ReturnType<typeof useTranslation>['t']): string {
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

function getPackageExtensionLabel(fileName: string): string {
  const trimmed = fileName.trim();
  const lastDotIndex = trimmed.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === trimmed.length - 1) {
    return '';
  }
  return trimmed.slice(lastDotIndex);
}

function getPlatformLabel(platform: DetectedSystem['platform'], t: ReturnType<typeof useTranslation>['t']): string {
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

function getArchLabel(arch: string, t: ReturnType<typeof useTranslation>['t']): string {
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

function formatTime(value: string | null, locale: Locale): string {
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

function formatBytes(value: number | undefined): string {
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

function getSourceLabel(source: 'oss' | 'github' | 'auto', t: ReturnType<typeof useTranslation>['t']): string {
  if (source === 'oss') return t('source.oss');
  if (source === 'github') return t('source.github');
  return t('source.auto');
}

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

function buildHeroDownloadOptions(
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

function getHeroAssetLabel(
  asset: NormalizedAsset,
  platformLabel: string,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const parts = [t('hero.primaryCta', { platform: platformLabel })];
  if (asset.packageType.toLowerCase() !== 'unknown') {
    parts.push(getPackageLabel(asset.packageType, t));
  }
  parts.push(getArchLabel(asset.arch, t));
  return parts.join(' · ');
}

function getAssetCardTitle(
  asset: NormalizedAsset,
  fallbackTitle: string,
  t: ReturnType<typeof useTranslation>['t'],
): string {
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

function DownloadCard({
  title,
  manifest,
  assets,
  recommended,
  t,
}: {
  title: string;
  manifest: NormalizedManifest | null;
  assets: NormalizedAsset[];
  recommended: NormalizedAsset | null;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <section className="rounded-3xl border border-white/15 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {manifest?.version || '—'} · {manifest ? getSourceLabel(manifest.source, t) : '—'}
          </p>
        </div>
        {manifest?.publishedAt ? (
          <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
            {formatTime(manifest.publishedAt, i18n.language === 'zh-CN' ? 'zh-CN' : 'en')}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {assets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300/70 px-4 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            {t('hero.unavailable')}
          </div>
        ) : null}

        {assets.map((asset) => {
          const isRecommended = recommended?.name === asset.name;
          return (
            <a
              key={asset.name}
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-lg dark:border-white/10 dark:bg-slate-950/35"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">{getAssetCardTitle(asset, title, t)}</span>
                {isRecommended ? (
                  <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                    {t('labels.recommended')}
                  </span>
                ) : null}
                <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {getPackageExtensionLabel(asset.name)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                <span>{t('labels.size')}: {formatBytes(asset.size)}</span>
                {asset.sha256 ? <span>{t('labels.sha256')}: {asset.sha256.slice(0, 12)}…</span> : null}
              </div>
              <p className="mt-3 break-all text-xs text-slate-500 transition group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
                {asset.name}
              </p>
            </a>
          );
        })}
      </div>

      <details className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-950/35">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 dark:text-white">
          {t('labels.releaseNotes')}
        </summary>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
          {manifest?.releaseNotes || t('labels.noNotes')}
        </p>
      </details>
    </section>
  );
}

function App() {
  const { t } = useTranslation();
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredThemePreference);
  const [theme, setTheme] = useState<ThemeMode>(() => resolveTheme(getStoredThemePreference()));
  const [language, setLanguage] = useState<Locale>(getInitialLanguage);
  const [system, setSystem] = useState<DetectedSystem>({ platform: 'unknown', arch: 'unknown', label: 'Unknown system' });
  const [catalog, setCatalog] = useState<ReleaseCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installCommandCopied, setInstallCommandCopied] = useState(false);

  useEffect(() => {
    void detectSystem().then(setSystem);
  }, []);

  useEffect(() => {
    setTheme(resolveTheme(themePreference));
    if (themePreference === 'system') {
      removeStorage('tx5dr-site:theme');
    } else {
      writeStorage('tx5dr-site:theme', themePreference);
    }
  }, [themePreference]);

  useEffect(() => {
    if (themePreference !== 'system' || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(mediaQuery.matches ? 'dark' : 'light');
    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    void i18n.changeLanguage(language);
    writeStorage('tx5dr-site:language', language);
  }, [language]);

  useEffect(() => {
    void fetchReleaseCatalog('auto')
      .then((nextCatalog) => {
        setCatalog(nextCatalog);
        setLoading(false);
      })
      .catch((cause) => {
        console.error('failed to load release catalog', cause);
        setError('load_failed');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!installCommandCopied) {
      return;
    }

    const timer = window.setTimeout(() => {
      setInstallCommandCopied(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [installCommandCopied]);

  const effectiveDesktopManifest = catalog?.app.nightly ?? null;
  const effectiveServerManifest = catalog?.server.nightly ?? null;
  const desktopAssets = sortAssetsForDisplay(effectiveDesktopManifest, system);
  const serverAssets = sortAssetsForDisplay(effectiveServerManifest).filter((asset) => asset.packageType !== 'sh');
  const platformScopedDesktopAssets = desktopAssets.filter((asset) => asset.platform === system.platform);
  const windowsDesktopAssets = desktopAssets.filter((asset) => asset.platform === 'windows');
  const macosDesktopAssets = desktopAssets.filter((asset) => asset.platform === 'macos');
  const linuxDesktopAssets = desktopAssets.filter((asset) => asset.platform === 'linux');
  const heroDownloadOptions = useMemo(
    () => buildHeroDownloadOptions(platformScopedDesktopAssets, system.platform, system.arch),
    [platformScopedDesktopAssets, system.platform, system.arch],
  );
  const heroPrimaryAsset = heroDownloadOptions.primary;
  const heroAlternateAssets = heroDownloadOptions.alternates;

  const platformLabel = getPlatformLabel(system.platform, t);
  const primaryPlatformLabel = system.platform === 'unknown' ? t('labels.desktop') : platformLabel;
  const languageLabel = language === 'zh-CN' ? '中文' : 'EN';
  const allDownloadCards = useMemo(
    () => [
      {
        key: 'windows',
        title: `${getPlatformLabel('windows', t)} ${t('labels.desktop')}`,
        assets: windowsDesktopAssets,
        recommended: windowsDesktopAssets[0] ?? null,
      },
      {
        key: 'macos',
        title: `${getPlatformLabel('macos', t)} ${t('labels.desktop')}`,
        assets: macosDesktopAssets,
        recommended: macosDesktopAssets[0] ?? null,
      },
      {
        key: 'linux-desktop',
        title: `${getPlatformLabel('linux', t)} ${t('labels.desktop')}`,
        assets: linuxDesktopAssets,
        recommended: linuxDesktopAssets[0] ?? null,
      },
      {
        key: 'linux-server',
        title: t('labels.server'),
        assets: serverAssets,
        recommended: null,
      },
    ],
    [linuxDesktopAssets, macosDesktopAssets, serverAssets, t, windowsDesktopAssets],
  );

  const highlightItems = useMemo(
    () => [
      { title: t('highlights.item1Title'), body: t('highlights.item1Body') },
      { title: t('highlights.item2Title'), body: t('highlights.item2Body') },
      { title: t('highlights.item3Title'), body: t('highlights.item3Body') },
      { title: t('highlights.item4Title'), body: t('highlights.item4Body') },
      { title: t('highlights.item5Title'), body: t('highlights.item5Body') },
      { title: t('highlights.item6Title'), body: t('highlights.item6Body') },
    ],
    [t],
  );

  const deploymentItems = useMemo(
    () => [
      { title: t('deployments.desktopTitle'), body: t('deployments.desktopBody'), meta: t('deployments.desktopMeta') },
      { title: t('deployments.serverTitle'), body: t('deployments.serverBody'), meta: t('deployments.serverMeta') },
      { title: t('deployments.dockerTitle'), body: t('deployments.dockerBody'), meta: t('deployments.dockerMeta') },
    ],
    [t],
  );

  const handleCopyInstallCommand = async () => {
    try {
      await navigator.clipboard.writeText(NIGHTLY_SERVER_INSTALL_COMMAND);
      setInstallCommandCopied(true);
    } catch {
      setInstallCommandCopied(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-['Space_Grotesk'] text-lg font-bold tracking-[0.22em] text-rose-700 dark:text-rose-300">
            TX-5DR
          </a>
          <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <button
              type="button"
              onClick={() => setLanguage((current) => (current === 'zh-CN' ? 'en' : 'zh-CN'))}
              className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1.5 text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              {languageLabel}
            </button>
            <button
              type="button"
              onClick={() => setThemePreference((current) => (resolveTheme(current) === 'dark' ? 'light' : 'dark'))}
              className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-slate-300/70 bg-white/70 text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              aria-label={theme === 'dark' ? t('nav.themeDark') : t('nav.themeLight')}
              title={theme === 'dark' ? t('nav.themeDark') : t('nav.themeLight')}
            >
              {theme === 'dark' ? <MoonIcon className="size-[18px]" /> : <SunIcon className="size-[18px]" />}
            </button>
          </div>
        </header>

        <main className="flex-1">
          <section className="relative mx-auto mt-14 max-w-4xl text-center sm:mt-20">
            <h1 className="mt-8 font-['Space_Grotesk'] text-5xl font-bold tracking-tight text-slate-950 sm:text-7xl dark:text-white">
              {t('hero.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {heroPrimaryAsset ? (
                <div className="relative inline-flex items-stretch rounded-full bg-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:bg-white">
                  <a
                    href={heroPrimaryAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-l-full px-6 py-3 pr-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:text-slate-950"
                  >
                    {getHeroAssetLabel(heroPrimaryAsset, primaryPlatformLabel, t)}
                  </a>
                  <details className="group relative">
                    <summary className="flex h-full cursor-pointer list-none items-center justify-center rounded-r-full border-l border-white/15 px-4 text-white/85 transition hover:text-white dark:border-slate-200 dark:text-slate-700 dark:hover:text-slate-950 [&::-webkit-details-marker]:hidden">
                      <span className="sr-only">{t('hero.otherArchitectures')}</span>
                      <ChevronDownIcon className="size-4 transition group-open:rotate-180" />
                    </summary>
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-64 rounded-3xl border border-slate-200/70 bg-white/95 p-2 text-left shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
                      {heroAlternateAssets.map((asset) => (
                        <a
                          key={asset.name}
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/8 dark:hover:text-white"
                        >
                          <span className="font-medium">
                            {getArchLabel(asset.arch, t)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {getPackageLabel(asset.packageType, t)}
                          </span>
                        </a>
                      ))}
                      <a
                        href="#downloads"
                        className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/8 dark:hover:text-white"
                      >
                        <span className="font-medium">{t('hero.allPlatforms')}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">#downloads</span>
                      </a>
                    </div>
                  </details>
                </div>
              ) : (
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <GitHubIcon className="size-5" />
                  {t('hero.fallback')}
                </a>
              )}

              {heroPrimaryAsset ? (
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <GitHubIcon className="size-5" />
                  {t('hero.fallback')}
                </a>
              ) : null}
            </div>

            <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
              <div className="rounded-3xl border border-white/15 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('hero.version')}</p>
                <p className="mt-2 text-base font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white">{effectiveDesktopManifest?.version || '—'}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('hero.commit')}</p>
                <p className="mt-2 text-base font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white">{effectiveDesktopManifest?.commit || '—'}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('hero.builtAt')}</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                  {formatTime(effectiveDesktopManifest?.publishedAt || null, language)}
                </p>
              </div>
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">{t('hero.loading')}</p>
            ) : null}
            {error ? (
              <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-sm text-amber-900 dark:text-amber-100">
                <p>{t('hero.error')}</p>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
                >
                  <GitHubIcon className="size-4" />
                  {t('hero.fallback')}
                </a>
              </div>
            ) : null}
          </section>

          <section className="mt-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-slate-950 dark:text-white">{t('labels.highlights')}</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {highlightItems.map((item) => (
                <article key={item.title} className="rounded-3xl border border-white/15 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-slate-950 dark:text-white">{t('labels.deployments')}</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {deploymentItems.map((item) => (
                <article key={item.title} className="rounded-3xl border border-white/15 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
                  <p className="mt-4 text-sm font-medium text-rose-700 dark:text-rose-300">{item.meta}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20 rounded-[2rem] border border-white/15 bg-slate-950 px-6 py-8 text-slate-100 shadow-[0_30px_90px_rgba(15,23,42,0.32)] dark:border-white/10 dark:bg-slate-950/80 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-rose-300">{t('server.title')}</p>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{t('server.description')}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/12 bg-slate-950/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <code className="min-w-0 flex-1 overflow-x-auto text-sm text-rose-200">
                {NIGHTLY_SERVER_INSTALL_COMMAND}
              </code>
              <button
                type="button"
                onClick={() => { void handleCopyInstallCommand(); }}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 text-slate-100 transition hover:border-rose-400 hover:bg-white/12 hover:text-white"
                aria-label={installCommandCopied ? t('server.copied') : t('server.copy')}
                title={installCommandCopied ? t('server.copied') : t('server.copy')}
              >
                {installCommandCopied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
              </button>
            </div>
          </section>

          <section id="downloads" className="mt-20 scroll-mt-8 space-y-6">
            <div>
              <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-slate-950 dark:text-white">{t('labels.allDownloads')}</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('nav.channelNightly')}</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              {allDownloadCards.map((card) => (
                <DownloadCard
                  key={card.key}
                  title={card.title}
                  manifest={card.key === 'linux-server' ? effectiveServerManifest : effectiveDesktopManifest}
                  assets={card.assets}
                  recommended={card.recommended}
                  t={t}
                />
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-slate-300/60 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span>TX-5DR © 2026</span>
          <div className="flex flex-wrap gap-4">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-rose-600 dark:hover:text-rose-300">{t('footer.github')}</a>
            <a href={NIGHTLY_APP_RELEASE_URL} target="_blank" rel="noreferrer" className="hover:text-rose-600 dark:hover:text-rose-300">{t('footer.releases')}</a>
            <a href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer" className="hover:text-rose-600 dark:hover:text-rose-300">{t('footer.readme')}</a>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" className="hover:text-rose-600 dark:hover:text-rose-300">{t('footer.issues')}</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
