<script setup lang="ts">
import { reactive } from 'vue';
import ContentSection from './ContentSection.vue';
import DownloadsSection from './DownloadsSection.vue';
import HeroSection from './HeroSection.vue';
import HomeHeader from './HomeHeader.vue';
import InstallCommandSection from './InstallCommandSection.vue';
import SiteFooter from './SiteFooter.vue';
import { useHomeData } from '../composables/useHomeData';

const home = reactive(useHomeData());
</script>

<template>
  <div class="tx-home relative min-h-screen overflow-hidden text-slate-900 dark:text-white">
    <div class="tx-home-shell mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
      <HomeHeader :locale="home.locale" :repo-url="home.REPO_URL" />

      <main class="flex-1">
        <HeroSection
          :error="home.error"
          :format-time="home.formatTime"
          :get-arch-label="home.getArchLabel"
          :get-hero-asset-label="home.getHeroAssetLabel"
          :get-package-label="home.getPackageLabel"
          :get-platform-label="home.getPlatformLabel"
          :hero-alternate-assets="home.heroDownloadOptions.alternates"
          :hero-primary-asset="home.heroDownloadOptions.primary"
          :loading="home.loading"
          :locale="home.locale"
          :manifest="home.effectiveDesktopManifest"
          :platform-label="home.platformLabel"
          :repo-url="home.REPO_URL"
          :system="home.system"
          :t="home.t"
        />

        <ContentSection
          :title="home.t('labels.highlights')"
          :items="home.highlightItems"
          grid-class-name="md:grid-cols-2 xl:grid-cols-3"
        />

        <ContentSection
          :title="home.t('labels.deployments')"
          :items="home.deploymentItems"
          grid-class-name="lg:grid-cols-3"
        />

        <InstallCommandSection :command="home.NIGHTLY_SERVER_INSTALL_COMMAND" :t="home.t" />

        <DownloadsSection
          :cards="home.downloadCards"
          :format-bytes="home.formatBytes"
          :format-time="home.formatTime"
          :get-asset-card-title="home.getAssetCardTitle"
          :get-package-extension-label="home.getPackageExtensionLabel"
          :get-source-label="home.getSourceLabel"
          :show-cn-tag="home.showCnDownloadTag"
          :t="home.t"
        />
      </main>

      <SiteFooter :app-release-url="home.NIGHTLY_APP_RELEASE_URL" :repo-url="home.REPO_URL" :t="home.t" />
    </div>
  </div>
</template>
