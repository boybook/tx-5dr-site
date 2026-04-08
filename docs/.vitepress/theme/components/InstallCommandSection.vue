<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

const props = defineProps<{
  command: string;
  t: (key: string) => string;
}>();

const copied = ref(false);
let resetTimer: number | null = null;

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.command);
    copied.value = true;
    if (resetTimer) {
      window.clearTimeout(resetTimer);
    }
    resetTimer = window.setTimeout(() => {
      copied.value = false;
      resetTimer = null;
    }, 1800);
  } catch {
    copied.value = false;
  }
}

onBeforeUnmount(() => {
  if (resetTimer) {
    window.clearTimeout(resetTimer);
  }
});
</script>

<template>
  <section class="tx-install-section mt-20 rounded-[2rem] border border-white/15 bg-slate-950 px-6 py-8 text-slate-100 shadow-[0_30px_90px_rgba(15,23,42,0.32)] dark:border-white/10 dark:bg-slate-950/80 sm:px-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="tx-install-kicker text-sm uppercase tracking-[0.24em] text-rose-300">{{ t('server.title') }}</p>
        <p class="tx-install-description mt-3 max-w-3xl text-sm leading-7 text-slate-300">{{ t('server.description') }}</p>
      </div>
    </div>
    <div class="tx-install-shell mt-6 flex items-center gap-3 rounded-2xl border border-white/12 bg-slate-950/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <code class="tx-install-code min-w-0 flex-1 overflow-x-auto text-sm text-rose-200">{{ command }}</code>
      <button
        type="button"
        class="tx-install-copy inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 text-slate-100 transition hover:border-rose-400 hover:bg-white/12 hover:text-white"
        :aria-label="copied ? t('server.copied') : t('server.copy')"
        :title="copied ? t('server.copied') : t('server.copy')"
        @click="void handleCopy()"
      >
        <svg v-if="copied" viewBox="0 0 20 20" aria-hidden="true" class="size-5" fill="none">
          <path d="m5 10 3.2 3.2L15 6.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else viewBox="0 0 20 20" aria-hidden="true" class="size-5" fill="none">
          <rect x="6.5" y="4.5" width="9" height="11" rx="2" stroke="currentColor" stroke-width="1.6" />
          <path d="M4.5 12.5V6.5c0-1.1.9-2 2-2h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </section>
</template>
