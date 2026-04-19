import { computed, onMounted, ref } from 'vue';
import { NIGHTLY_APP_RELEASE_URL, NIGHTLY_SERVER_INSTALL_COMMAND, REPO_URL } from '../../../../src/config/site';
import { buildHeroDownloadOptions, getPlatformLabel, getSourceLabel, formatBytes, formatTime, getAssetCardTitle, getHeroAssetLabel, getPackageExtensionLabel, getPackageLabel, getArchLabel } from '../../../../src/lib/downloads';
import { fetchReleaseCatalog, sortAssetsForDisplay } from '../../../../src/lib/metadata';
import type { Locale } from '../../../../src/lib/preferences';
import { detectSystem } from '../../../../src/lib/system';
import type { DetectedSystem } from '../../../../src/lib/types';
import { useHomeI18n } from './useHomeI18n';

const UNKNOWN_SYSTEM: DetectedSystem = {
  platform: 'unknown',
  arch: 'unknown',
  label: 'Unknown system',
};

export function useHomeData() {
  const { locale, t } = useHomeI18n();
  const catalog = ref<Awaited<ReturnType<typeof fetchReleaseCatalog>> | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const system = ref<DetectedSystem>(UNKNOWN_SYSTEM);

  onMounted(() => {
    void detectSystem().then((nextSystem) => {
      system.value = nextSystem;
    });

    void fetchReleaseCatalog('auto')
      .then((nextCatalog) => {
        catalog.value = nextCatalog;
        loading.value = false;
      })
      .catch((cause) => {
        console.error('failed to load release catalog', cause);
        error.value = 'load_failed';
        loading.value = false;
      });
  });

  const effectiveDesktopManifest = computed(() => catalog.value?.app.nightly ?? null);
  const effectiveServerManifest = computed(() => catalog.value?.server.nightly ?? null);
  const desktopAssets = computed(() => sortAssetsForDisplay(effectiveDesktopManifest.value, system.value));
  const serverAssets = computed(() => sortAssetsForDisplay(effectiveServerManifest.value).filter((asset) => asset.packageType !== 'sh'));
  const platformScopedDesktopAssets = computed(() => desktopAssets.value.filter((asset) => asset.platform === system.value.platform));
  const windowsDesktopAssets = computed(() => desktopAssets.value.filter((asset) => asset.platform === 'windows'));
  const macosDesktopAssets = computed(() => desktopAssets.value.filter((asset) => asset.platform === 'macos'));
  const linuxDesktopAssets = computed(() => desktopAssets.value.filter((asset) => asset.platform === 'linux'));
  const showCnDownloadTag = computed(() => catalog.value?.preferredSource === 'oss');
  const heroDownloadOptions = computed(() => buildHeroDownloadOptions(platformScopedDesktopAssets.value, system.value.platform, system.value.arch));
  const platformLabel = computed(() => getPlatformLabel(system.value.platform, t));

  const highlightItems = computed(() => [
    { title: t('highlights.item1Title'), body: t('highlights.item1Body') },
    { title: t('highlights.item2Title'), body: t('highlights.item2Body') },
    { title: t('highlights.item3Title'), body: t('highlights.item3Body') },
    { title: t('highlights.item4Title'), body: t('highlights.item4Body') },
    { title: t('highlights.item5Title'), body: t('highlights.item5Body') },
    { title: t('highlights.item6Title'), body: t('highlights.item6Body') },
  ]);

  const deploymentItems = computed(() => [
    { title: t('deployments.desktopTitle'), body: t('deployments.desktopBody'), meta: t('deployments.desktopMeta') },
    { title: t('deployments.serverTitle'), body: t('deployments.serverBody'), meta: t('deployments.serverMeta') },
    { title: t('deployments.dockerTitle'), body: t('deployments.dockerBody'), meta: t('deployments.dockerMeta') },
  ]);

  const downloadCards = computed(() => [
    {
      key: 'windows',
      title: `${getPlatformLabel('windows', t)} ${t('labels.desktop')}`,
      assets: windowsDesktopAssets.value,
      recommended: windowsDesktopAssets.value[0] ?? null,
      manifest: effectiveDesktopManifest.value,
    },
    {
      key: 'macos',
      title: `${getPlatformLabel('macos', t)} ${t('labels.desktop')}`,
      assets: macosDesktopAssets.value,
      recommended: macosDesktopAssets.value[0] ?? null,
      manifest: effectiveDesktopManifest.value,
    },
    {
      key: 'linux-desktop',
      title: `${getPlatformLabel('linux', t)} ${t('labels.desktop')}`,
      assets: linuxDesktopAssets.value,
      recommended: linuxDesktopAssets.value[0] ?? null,
      manifest: effectiveDesktopManifest.value,
    },
    {
      key: 'linux-server',
      title: t('labels.server'),
      assets: serverAssets.value,
      recommended: null,
      manifest: effectiveServerManifest.value,
    },
  ]);

  return {
    NIGHTLY_APP_RELEASE_URL,
    NIGHTLY_SERVER_INSTALL_COMMAND,
    REPO_URL,
    catalog,
    deploymentItems,
    downloadCards,
    effectiveDesktopManifest,
    error,
    formatBytes,
    formatTime: (value: string | null) => formatTime(value, locale.value as Locale),
    getArchLabel: (arch: string) => getArchLabel(arch, t),
    getAssetCardTitle: (name: Parameters<typeof getAssetCardTitle>[0], fallbackTitle: string) => getAssetCardTitle(name, fallbackTitle, t),
    getHeroAssetLabel: (asset: Parameters<typeof getHeroAssetLabel>[0], nextPlatformLabel: string) => getHeroAssetLabel(asset, nextPlatformLabel, t),
    getPackageExtensionLabel,
    getPackageLabel: (packageType: string) => getPackageLabel(packageType, t),
    getSourceLabel: (source: 'oss' | 'github' | 'auto') => getSourceLabel(source, t),
    getPlatformLabel: (platform: DetectedSystem['platform']) => getPlatformLabel(platform, t),
    heroDownloadOptions,
    highlightItems,
    loading,
    locale,
    platformLabel,
    showCnDownloadTag,
    system,
    t,
  };
}
