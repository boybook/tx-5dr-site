<script setup lang="ts">
import type { NormalizedAsset, NormalizedManifest } from '../../../../src/lib/types';

defineProps<{
  asset: NormalizedAsset | null;
  formatBytes: (value: number | undefined) => string;
  manifest: NormalizedManifest | null;
  t: (key: string) => string;
}>();
</script>

<template>
  <section class="tx-android-section relative isolate mt-8 overflow-hidden rounded-[2rem] border border-rose-500/18 bg-white/75 shadow-[0_30px_90px_rgba(190,18,60,0.12)] [clip-path:inset(0_round_2rem)] backdrop-blur dark:border-rose-300/15 dark:bg-white/5 dark:shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
      <div class="absolute -left-24 -top-28 size-64 rounded-full bg-rose-400/20 blur-3xl dark:bg-rose-500/18" />
    </div>
    <div class="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
      <div class="relative flex min-h-56 flex-col p-6 sm:p-7">
        <div class="relative flex flex-1 flex-col">
          <div>
            <p class="text-sm uppercase leading-none tracking-[0.24em] text-rose-700 dark:text-rose-300">{{ t('labels.androidClient') }}</p>
            <h2 class="mt-5 font-['Space_Grotesk'] text-3xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white">
              {{ t('androidClient.title') }}
            </h2>
            <p class="tx-android-description mt-5 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              {{ t('androidClient.description') }}
            </p>
            <p class="tx-android-meta mt-5 text-sm font-medium text-rose-700 dark:text-rose-300">
              {{ t('androidClient.meta') }}
            </p>
          </div>
          <div class="mt-auto flex flex-wrap items-center gap-3 pt-5">
            <a
              v-if="asset"
              :href="asset.url"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold !text-white no-underline shadow-[0_18px_45px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-rose-700 hover:!text-white dark:bg-white dark:!text-slate-950 dark:hover:bg-rose-100 dark:hover:!text-slate-950"
            >
              {{ t('androidClient.download') }}
            </a>
          </div>
        </div>
      </div>

      <div class="border-t border-rose-500/18 bg-white/35 p-6 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 lg:border-l lg:border-t-0 sm:p-7">
        <div class="grid h-full content-center gap-3">
          <div class="rounded-3xl border border-slate-200/70 bg-white/65 p-3.5 dark:border-white/10 dark:bg-white/6">
            <p class="text-xs uppercase leading-none tracking-[0.2em] text-rose-700 dark:text-rose-200">{{ t('androidClient.version') }}</p>
            <p class="mt-2 break-all text-base font-semibold leading-tight text-slate-950 dark:text-white">{{ manifest?.version || '—' }}</p>
          </div>
          <div class="rounded-3xl border border-slate-200/70 bg-white/65 p-3.5 dark:border-white/10 dark:bg-white/6">
            <p class="text-xs uppercase leading-none tracking-[0.2em] text-rose-700 dark:text-rose-200">{{ t('androidClient.size') }}</p>
            <p class="mt-2 text-base font-semibold leading-tight text-slate-950 dark:text-white">{{ formatBytes(asset?.size) }}</p>
          </div>
          <p class="tx-android-file break-all text-xs text-slate-500 dark:text-slate-400">
            {{ asset?.name || '—' }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
