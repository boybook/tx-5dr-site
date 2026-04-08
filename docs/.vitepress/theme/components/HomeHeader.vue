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
const docNavItems = computed(() => {
  if (props.locale === 'zh-CN') {
    return [
      { text: '指南', href: withBase('/guide/') },
      { text: 'Wiki', href: withBase('/wiki/') },
      { text: '插件 API', href: withBase('/plugin-api/') },
    ];
  }

  return [
    { text: 'Guide', href: withBase('/guide/') },
    { text: 'Wiki', href: withBase('/wiki/') },
    { text: 'Plugin API', href: withBase('/plugin-api/') },
  ];
});
</script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
      <a
        :href="repoUrl"
        target="_blank"
        rel="noreferrer"
        class="tx-home-brand font-['Space_Grotesk'] text-lg font-bold tracking-[0.22em] text-rose-700 dark:text-rose-300"
      >
        TX-5DR
      </a>
      <nav class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" aria-label="Document sections">
        <a
          v-for="item in docNavItems"
          :key="item.href"
          :href="item.href"
          class="tx-home-toplink text-sm text-slate-600 transition hover:text-rose-700 dark:text-slate-300 dark:hover:text-rose-300"
        >
          {{ item.text }}
        </a>
      </nav>
    </div>

    <div class="flex items-center justify-end gap-2 text-sm">
      <a
        :href="languageHref"
        class="tx-home-chip rounded-full border border-slate-300/70 bg-white/70 px-3 py-1.5 text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      >
        {{ languageLabel }}
      </a>
      <AppearanceToggle :locale="locale" />
    </div>
  </header>
</template>
