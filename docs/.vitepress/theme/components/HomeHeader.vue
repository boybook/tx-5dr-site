<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import AppearanceToggle from './AppearanceToggle.vue';

const props = defineProps<{
  locale: 'zh-CN' | 'en';
  repoUrl: string;
}>();

const languageLabel = computed(() => (props.locale === 'zh-CN' ? '中文' : 'EN'));
const languageHref = computed(() => withBase(props.locale === 'zh-CN' ? '/en/' : '/'));
</script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-3">
    <a
      :href="repoUrl"
      target="_blank"
      rel="noreferrer"
      class="tx-home-brand font-['Space_Grotesk'] text-lg font-bold tracking-[0.22em] text-rose-700 dark:text-rose-300"
    >
      TX-5DR
    </a>
    <div class="flex flex-wrap items-center justify-end gap-2 text-sm">
      <a
        :href="languageHref"
        class="tx-home-chip rounded-full border border-slate-300/70 bg-white/70 px-3 py-1.5 text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      >
        {{ languageLabel }}
      </a>
      <AppearanceToggle />
    </div>
  </header>
</template>
