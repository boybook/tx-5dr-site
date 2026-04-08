<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import type { DetectedSystem, NormalizedAsset, NormalizedManifest } from '../../../../src/lib/types';

const props = defineProps<{
  error: string | null;
  formatTime: (value: string | null) => string;
  getArchLabel: (arch: string) => string;
  getHeroAssetLabel: (asset: NormalizedAsset, platformLabel: string) => string;
  getPackageLabel: (packageType: string) => string;
  getPlatformLabel: (platform: DetectedSystem['platform']) => string;
  heroAlternateAssets: NormalizedAsset[];
  heroPrimaryAsset: NormalizedAsset | null;
  loading: boolean;
  locale: 'zh-CN' | 'en';
  manifest: NormalizedManifest | null;
  platformLabel: string;
  repoUrl: string;
  system: DetectedSystem;
  t: (key: string, vars?: Record<string, string>) => string;
}>();

const previewImageSet = computed(() => {
  const localePrefix = props.locale === 'zh-CN' ? 'zh' : 'en';
  return {
    day: withBase(`/tx5dr-pic/${localePrefix}-day.png`),
    night: withBase(`/tx5dr-pic/${localePrefix}-night.png`),
  };
});
</script>

<template>
  <section class="relative mx-auto mt-14 max-w-4xl text-center sm:mt-20">
    <h1
      class="tx-hero-title mt-8 font-['Space_Grotesk'] text-5xl font-bold tracking-tight text-slate-950 sm:text-7xl dark:text-white"
    >
      {{ t('hero.title') }}
    </h1>
    <p
      class="tx-hero-subtitle mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300"
    >
      {{ t('hero.subtitle') }}
    </p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <div
        v-if="heroPrimaryAsset"
        class="relative inline-flex items-stretch rounded-full bg-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:bg-white"
      >
        <a
          :href="heroPrimaryAsset.url"
          target="_blank"
          rel="noreferrer"
          class="tx-hero-primary-link inline-flex items-center justify-center rounded-l-full px-6 py-3 pr-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:text-slate-950"
        >
          {{ getHeroAssetLabel(heroPrimaryAsset, system.platform === 'unknown' ? t('labels.desktop') : platformLabel) }}
        </a>
        <details class="group relative">
          <summary class="flex h-full cursor-pointer list-none items-center justify-center rounded-r-full border-l border-white/15 px-4 text-white/85 transition hover:text-white dark:border-slate-200 dark:text-slate-700 dark:hover:text-slate-950 [&::-webkit-details-marker]:hidden">
            <span class="sr-only">{{ t('hero.otherArchitectures') }}</span>
            <svg viewBox="0 0 20 20" aria-hidden="true" class="size-4 transition group-open:rotate-180" fill="none">
              <path d="M5 7.5 10 12.5l5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </summary>
          <div class="absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-64 rounded-3xl border border-slate-200/70 bg-white/95 p-2 text-left shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
            <a
              v-for="asset in heroAlternateAssets"
              :key="asset.name"
              :href="asset.url"
              target="_blank"
              rel="noreferrer"
              class="tx-hero-menu-link flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/8 dark:hover:text-white"
            >
              <span class="font-medium">
                {{ getPlatformLabel(asset.platform) }} · {{ getArchLabel(asset.arch) }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                {{ getPackageLabel(asset.packageType) }}
              </span>
            </a>
            <a
              href="#downloads"
              class="tx-hero-menu-link flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/8 dark:hover:text-white"
            >
              <span class="font-medium">{{ t('hero.allPlatforms') }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">#downloads</span>
            </a>
          </div>
        </details>
      </div>
      <a
        v-else
        :href="repoUrl"
        target="_blank"
        rel="noreferrer"
        class="tx-hero-secondary-link inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="size-5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.59 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.32 9.32 0 0 1 12 6.84a9.3 9.3 0 0 1 2.5.35c1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.95-2.35 4.81-4.59 5.07.36.32.69.94.69 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.24C22 6.59 17.52 2 12 2Z" />
        </svg>
        {{ t('hero.fallback') }}
      </a>
      <a
        v-if="heroPrimaryAsset"
        :href="repoUrl"
        target="_blank"
        rel="noreferrer"
        class="tx-hero-secondary-link inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="size-5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.59 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.32 9.32 0 0 1 12 6.84a9.3 9.3 0 0 1 2.5.35c1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.95-2.35 4.81-4.59 5.07.36.32.69.94.69 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.24C22 6.59 17.52 2 12 2Z" />
        </svg>
        {{ t('hero.fallback') }}
      </a>
    </div>

    <div class="tx-hero-preview relative left-1/2 mt-10 w-[calc(100vw-1.5rem)] max-w-[1120px] -translate-x-1/2 sm:w-[calc(100vw-2.5rem)] lg:w-[min(1120px,calc(100vw-4rem))]">
      <figure class="tx-hero-preview-frame">
        <img
          :src="previewImageSet.day"
          :alt="t('hero.previewAlt')"
          class="tx-hero-preview-image tx-hero-preview-image-day block w-full rounded-[1rem] sm:rounded-[1.4rem]"
          decoding="async"
          loading="eager"
        >
        <img
          :src="previewImageSet.night"
          :alt="t('hero.previewAlt')"
          class="tx-hero-preview-image tx-hero-preview-image-night block w-full rounded-[1rem] sm:rounded-[1.4rem]"
          decoding="async"
          loading="eager"
        >
      </figure>
    </div>

    <div class="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
      <div class="rounded-3xl border border-white/15 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{{ t('hero.version') }}</p>
        <p class="mt-2 text-base font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white">{{ manifest?.version || '—' }}</p>
      </div>
      <div class="rounded-3xl border border-white/15 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{{ t('hero.commit') }}</p>
        <p class="mt-2 text-base font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white">{{ manifest?.commit || '—' }}</p>
      </div>
      <div class="rounded-3xl border border-white/15 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{{ t('hero.builtAt') }}</p>
        <p class="mt-2 text-base font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white">{{ formatTime(manifest?.publishedAt || null) }}</p>
      </div>
    </div>

    <p v-if="loading" class="mt-6 text-sm text-slate-500 dark:text-slate-400">{{ t('hero.loading') }}</p>
    <div v-if="error" class="mx-auto mt-6 max-w-2xl rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-sm text-amber-900 dark:text-amber-100">
      <p>{{ t('hero.error') }}</p>
      <a
        :href="repoUrl"
        target="_blank"
        rel="noreferrer"
        class="mt-3 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.59 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.32 9.32 0 0 1 12 6.84a9.3 9.3 0 0 1 2.5.35c1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.95-2.35 4.81-4.59 5.07.36.32.69.94.69 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.24C22 6.59 17.52 2 12 2Z" />
        </svg>
        {{ t('hero.fallback') }}
      </a>
    </div>
  </section>
</template>
