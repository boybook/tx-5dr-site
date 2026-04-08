<script setup lang="ts">
defineProps<{
  appReleaseUrl: string;
  repoUrl: string;
  t: (key: string) => string;
}>();
</script>

<template>
  <footer class="tx-footer mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-slate-300/60 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
    <span>TX-5DR © 2026</span>
    <div class="flex flex-wrap gap-4">
      <a :href="repoUrl" target="_blank" rel="noreferrer" class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300">{{ t('footer.github') }}</a>
      <a :href="appReleaseUrl" target="_blank" rel="noreferrer" class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300">{{ t('footer.releases') }}</a>
      <a :href="`${repoUrl}#readme`" target="_blank" rel="noreferrer" class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300">{{ t('footer.readme') }}</a>
      <a :href="`${repoUrl}/issues`" target="_blank" rel="noreferrer" class="tx-footer-link hover:text-rose-600 dark:hover:text-rose-300">{{ t('footer.issues') }}</a>
    </div>
  </footer>
</template>
