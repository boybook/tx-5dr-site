<script setup lang="ts">
import type { NormalizedAsset, NormalizedManifest } from '../../../../src/lib/types';

defineProps<{
  assets: NormalizedAsset[];
  formatBytes: (value: number | undefined) => string;
  formatTime: (value: string | null) => string;
  getAssetCardTitle: (asset: NormalizedAsset, fallbackTitle: string) => string;
  getPackageExtensionLabel: (fileName: string) => string;
  getSourceLabel: (source: 'oss' | 'github' | 'auto') => string;
  manifest: NormalizedManifest | null;
  recommended: NormalizedAsset | null;
  t: (key: string) => string;
  title: string;
}>();
</script>

<template>
  <section class="tx-download-card rounded-3xl border border-white/15 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="tx-card-title font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">{{ title }}</h3>
        <p class="tx-card-subline mt-1 text-sm text-slate-600 dark:text-slate-300">
          {{ manifest?.version || '—' }} · {{ manifest ? getSourceLabel(manifest.source) : '—' }}
        </p>
      </div>
      <span
        v-if="manifest?.publishedAt"
        class="tx-card-date rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300"
      >
        {{ formatTime(manifest.publishedAt) }}
      </span>
    </div>

    <div class="mt-4 space-y-3">
      <div
        v-if="assets.length === 0"
        class="tx-card-empty rounded-2xl border border-dashed border-slate-300/70 px-4 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400"
      >
        {{ t('hero.unavailable') }}
      </div>

      <a
        v-for="asset in assets"
        :key="asset.name"
        :href="asset.url"
        target="_blank"
        rel="noreferrer"
        class="tx-download-link group block rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-lg dark:border-white/10 dark:bg-slate-950/35"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="tx-download-link-title font-semibold text-slate-900 dark:text-white">{{ getAssetCardTitle(asset, title) }}</span>
          <span
            v-if="recommended?.name === asset.name"
            class="tx-download-recommend rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300"
          >
            {{ t('labels.recommended') }}
          </span>
          <span class="tx-download-package rounded-full bg-slate-900/5 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {{ getPackageExtensionLabel(asset.name) }}
          </span>
        </div>
        <div class="tx-download-meta mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
          <span>{{ t('labels.size') }}: {{ formatBytes(asset.size) }}</span>
          <span v-if="asset.sha256">{{ t('labels.sha256') }}: {{ asset.sha256.slice(0, 12) }}…</span>
        </div>
        <p class="tx-download-filename mt-3 break-all text-xs text-slate-500 transition group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
          {{ asset.name }}
        </p>
      </a>
    </div>

    <details class="tx-release-details mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-950/35">
      <summary class="tx-release-summary cursor-pointer list-none text-sm font-semibold text-slate-900 dark:text-white">
        {{ t('labels.releaseNotes') }}
      </summary>
      <p class="tx-release-notes mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
        {{ manifest?.releaseNotes || t('labels.noNotes') }}
      </p>
    </details>
  </section>
</template>
