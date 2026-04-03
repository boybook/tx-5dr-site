import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ContentSection } from './components/ContentSection';
import { DownloadsSection } from './components/DownloadsSection';
import { InstallCommandSection } from './components/InstallCommandSection';
import {
  NIGHTLY_APP_RELEASE_URL,
  NIGHTLY_SERVER_INSTALL_COMMAND,
  REPO_URL,
} from './config/site';
import { useDetectedSystem } from './hooks/useDetectedSystem';
import { useLanguage } from './hooks/useLanguage';
import { useReleaseCatalog } from './hooks/useReleaseCatalog';
import { resolveTheme, useTheme } from './hooks/useTheme';
import { buildHeroDownloadOptions, getPlatformLabel } from './lib/downloads';
import { sortAssetsForDisplay } from './lib/metadata';

function App() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { theme, setThemePreference } = useTheme();
  const { catalog, loading, error } = useReleaseCatalog();
  const system = useDetectedSystem();

  const effectiveDesktopManifest = catalog?.app.nightly ?? null;
  const effectiveServerManifest = catalog?.server.nightly ?? null;
  const desktopAssets = sortAssetsForDisplay(effectiveDesktopManifest, system);
  const serverAssets = sortAssetsForDisplay(effectiveServerManifest).filter((asset) => asset.packageType !== 'sh');
  const platformScopedDesktopAssets = desktopAssets.filter((asset) => asset.platform === system.platform);
  const windowsDesktopAssets = desktopAssets.filter((asset) => asset.platform === 'windows');
  const macosDesktopAssets = desktopAssets.filter((asset) => asset.platform === 'macos');
  const linuxDesktopAssets = desktopAssets.filter((asset) => asset.platform === 'linux');
  const showCnDownloadTag = [effectiveDesktopManifest, effectiveServerManifest].some((manifest) => manifest?.source === 'oss');
  const heroDownloadOptions = useMemo(
    () => buildHeroDownloadOptions(platformScopedDesktopAssets, system.platform, system.arch),
    [platformScopedDesktopAssets, system.arch, system.platform],
  );
  const platformLabel = getPlatformLabel(system.platform, t);

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
      {
        title: t('deployments.desktopTitle'),
        body: t('deployments.desktopBody'),
        meta: t('deployments.desktopMeta'),
      },
      {
        title: t('deployments.serverTitle'),
        body: t('deployments.serverBody'),
        meta: t('deployments.serverMeta'),
      },
      {
        title: t('deployments.dockerTitle'),
        body: t('deployments.dockerBody'),
        meta: t('deployments.dockerMeta'),
      },
    ],
    [t],
  );

  const downloadCards = useMemo(
    () => [
      {
        key: 'windows',
        title: `${getPlatformLabel('windows', t)} ${t('labels.desktop')}`,
        assets: windowsDesktopAssets,
        recommended: windowsDesktopAssets[0] ?? null,
        manifest: effectiveDesktopManifest,
      },
      {
        key: 'macos',
        title: `${getPlatformLabel('macos', t)} ${t('labels.desktop')}`,
        assets: macosDesktopAssets,
        recommended: macosDesktopAssets[0] ?? null,
        manifest: effectiveDesktopManifest,
      },
      {
        key: 'linux-desktop',
        title: `${getPlatformLabel('linux', t)} ${t('labels.desktop')}`,
        assets: linuxDesktopAssets,
        recommended: linuxDesktopAssets[0] ?? null,
        manifest: effectiveDesktopManifest,
      },
      {
        key: 'linux-server',
        title: t('labels.server'),
        assets: serverAssets,
        recommended: null,
        manifest: effectiveServerManifest,
      },
    ],
    [
      effectiveDesktopManifest,
      effectiveServerManifest,
      linuxDesktopAssets,
      macosDesktopAssets,
      serverAssets,
      t,
      windowsDesktopAssets,
    ],
  );

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <Header
          language={language}
          onToggleLanguage={() => setLanguage((current) => (current === 'zh-CN' ? 'en' : 'zh-CN'))}
          onToggleTheme={() => setThemePreference((current) => (resolveTheme(current) === 'dark' ? 'light' : 'dark'))}
          repoUrl={REPO_URL}
          t={t}
          theme={theme}
        />

        <main className="flex-1">
          <HeroSection
            error={error}
            heroAlternateAssets={heroDownloadOptions.alternates}
            heroPrimaryAsset={heroDownloadOptions.primary}
            language={language}
            loading={loading}
            manifest={effectiveDesktopManifest}
            platformLabel={platformLabel}
            repoUrl={REPO_URL}
            system={system}
            t={t}
          />

          <ContentSection
            title={t('labels.highlights')}
            items={highlightItems}
            gridClassName="md:grid-cols-2 xl:grid-cols-3"
          />

          <ContentSection
            title={t('labels.deployments')}
            items={deploymentItems}
            gridClassName="lg:grid-cols-3"
          />

          <InstallCommandSection command={NIGHTLY_SERVER_INSTALL_COMMAND} t={t} />

          <DownloadsSection cards={downloadCards} showCnTag={showCnDownloadTag} t={t} />
        </main>

        <Footer appReleaseUrl={NIGHTLY_APP_RELEASE_URL} repoUrl={REPO_URL} t={t} />
      </div>
    </div>
  );
}

export default App;
