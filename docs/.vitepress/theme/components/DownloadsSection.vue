<script setup lang="ts">
import type { NormalizedAsset, NormalizedManifest } from '../../../../src/lib/types';
import DownloadCard from './DownloadCard.vue';

defineProps<{
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
      </div>
      <p class="tx-section-subtitle mt-3 text-sm text-slate-600 dark:text-slate-300">{{ t('nav.channelNightly') }}</p>
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
