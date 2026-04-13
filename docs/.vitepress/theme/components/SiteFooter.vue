<script setup lang="ts">
import type { SupportedLocale } from '../../../../src/i18n';

defineProps<{
  appReleaseUrl: string;
  locale: SupportedLocale;
  repoUrl: string;
  t: (key: string) => string;
}>();
</script>

<template>
  <footer class="tx-footer mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-slate-300/60 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span>TX-5DR © 2026</span>
      <a
        v-if="locale === 'zh-CN'"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noreferrer"
        class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300"
      >
        {{ t('footer.icp') }}
      </a>
    </div>
    <div class="flex flex-wrap gap-4">
      <a :href="repoUrl" target="_blank" rel="noreferrer" class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300">{{ t('footer.github') }}</a>
      <a :href="appReleaseUrl" target="_blank" rel="noreferrer" class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300">{{ t('footer.releases') }}</a>
      <a :href="`${repoUrl}#readme`" target="_blank" rel="noreferrer" class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300">{{ t('footer.readme') }}</a>
      <a :href="`${repoUrl}/issues`" target="_blank" rel="noreferrer" class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300">{{ t('footer.issues') }}</a>
    </div>
  </footer>
</template>
