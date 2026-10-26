<script setup lang="ts">
import type { NormalizedAsset, NormalizedManifest } from '../../../../src/lib/types';
import DownloadCard from './DownloadCard.vue';
import { withBase } from 'vitepress';
const emit = defineEmits<{ 'update:channel': [value: 'release' | 'nightly'] }>();

defineProps<{
  channel: 'release' | 'nightly';
  loading: boolean;
  cards: Array<{
    assets: NormalizedAsset[];
    key: string;
    manifest: NormalizedManifest | null;
    recommended: NormalizedAsset | null;
    title: string;
  }>;
  formatBytes: (value: number | undefined) => string;
  formatTime: (value: string | null) => string;
  getAssetCardTitle: (asset: NormalizedAsset, fallbackTitle: string) => string;
  getPackageExtensionLabel: (fileName: string) => string;
  getSourceLabel: (source: 'oss' | 'github' | 'auto') => string;
  showCnTag?: boolean;
  t: (key: string) => string;
}>();
</script>

<template>
  <section id="downloads" class="mt-20 scroll-mt-8 space-y-6">
    <div>
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="tx-section-title font-['Space_Grotesk'] text-3xl font-bold text-slate-950 dark:text-white">{{ t('labels.allDownloads') }}</h2>
        <span
          v-if="showCnTag"
          class="tx-cn-badge rounded-full border border-rose-500/18 bg-rose-500/8 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
        >
          CN
        </span>
        <div class="ml-auto flex items-center gap-4 text-sm" :aria-label="t('nav.channelLabel')">
          <button type="button" :aria-pressed="channel === 'release'" :class="channel === 'release' ? 'font-semibold text-rose-600 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'" @click="emit('update:channel', 'release')">{{ t('nav.channelRelease') }}</button>
          <button type="button" :aria-pressed="channel === 'nightly'" :class="channel === 'nightly' ? 'font-semibold text-rose-600 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'" @click="emit('update:channel', 'nightly')">{{ t('nav.channelNightly') }}</button>
        </div>
      </div>
      <p v-if="!loading && cards.every(card => !card.manifest)" class="tx-section-subtitle mt-3 text-sm text-slate-600 dark:text-slate-300">{{ t('nav.channelEmpty') }}</p>
      <p v-else-if="channel === 'nightly'" class="tx-section-subtitle mt-3 text-sm text-slate-600 dark:text-slate-300">{{ t('nav.nightlyWarning') }}</p>
      <a :href="withBase('/guide/maintenance.html#更新频道与正式版迁移')" class="mt-2 inline-block text-sm text-slate-500 transition hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300">{{ t('nav.migrationGuide') }}</a>
    </div>
    <div class="grid gap-6 xl:grid-cols-2">
      <DownloadCard
        v-for="card in cards"
        :key="card.key"
        :assets="card.assets"
        :format-bytes="formatBytes"
        :format-time="formatTime"
        :get-asset-card-title="getAssetCardTitle"
        :get-package-extension-label="getPackageExtensionLabel"
        :get-source-label="getSourceLabel"
        :manifest="card.manifest"
        :recommended="card.recommended"
        :t="t"
        :title="card.title"
      />
    </div>
  </section>
</template>
