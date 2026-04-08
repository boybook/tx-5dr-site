<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { useData } from 'vitepress';

type AppearanceMode = 'auto' | 'light' | 'dark';
const APPEARANCE_STORAGE_KEY = 'vitepress-theme-appearance';

const props = defineProps<{
  locale: 'zh-CN' | 'en';
}>();

const { isDark } = useData();
const toggleAppearance = inject<() => void>('toggle-appearance', () => {
  isDark.value = !isDark.value;
});
const activeMode = ref<AppearanceMode>('auto');
let mediaQuery: MediaQueryList | null = null;

const title = computed(() => {
  if (props.locale === 'zh-CN') {
    if (activeMode.value === 'auto') {
      return isDark.value ? '当前跟随系统（深色），点击切换为浅色' : '当前跟随系统（浅色），点击切换为深色';
    }

    return isDark.value ? '当前手动深色，点击切换为浅色' : '当前手动浅色，点击切换为深色';
  }

  if (activeMode.value === 'auto') {
    return isDark.value ? 'Following system (dark now), click to switch to light' : 'Following system (light now), click to switch to dark';
  }

  return isDark.value ? 'Manual dark, click to switch to light' : 'Manual light, click to switch to dark';
});

function readAppearanceMode(): AppearanceMode {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  const stored = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);

  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored;
  }

  return 'auto';
}

function syncAppearanceMode() {
  activeMode.value = readAppearanceMode();
}

function handleSystemThemeChange() {
  if (activeMode.value === 'auto') {
    syncAppearanceMode();
  }
}

function handleStorageChange(event: StorageEvent) {
  if (event.key === APPEARANCE_STORAGE_KEY) {
    syncAppearanceMode();
  }
}

function handleToggleAppearance() {
  toggleAppearance();
  window.requestAnimationFrame(syncAppearanceMode);
}

onMounted(() => {
  if (typeof window === 'undefined') {
    return;
  }

  syncAppearanceMode();
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  window.addEventListener('storage', handleStorageChange);
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleSystemThemeChange);
  window.removeEventListener('storage', handleStorageChange);
});
</script>

<template>
  <button
    type="button"
    class="tx-home-icon-button inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-slate-300/70 bg-white/70 text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
    :aria-label="title"
    :title="title"
    @click="handleToggleAppearance"
  >
    <svg
      v-if="activeMode === 'auto'"
      viewBox="0 0 20 20"
      aria-hidden="true"
      width="18"
      height="18"
      fill="none"
    >
      <rect x="3" y="4" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.6" />
      <path d="M7 16h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="10" cy="8.5" r="2.1" fill="currentColor" opacity="0.9" />
    </svg>
    <svg v-else-if="isDark" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="currentColor">
      <path d="M21 14.2A8.9 8.9 0 1 1 9.8 3a.75.75 0 0 1 .76 1.04 7.1 7.1 0 0 0 9.4 9.4A.75.75 0 0 1 21 14.2Z" />
    </svg>
    <svg v-else viewBox="0 0 20 20" aria-hidden="true" width="18" height="18" fill="none">
      <circle cx="10" cy="10" r="3.1" fill="currentColor" opacity="0.14" stroke="currentColor" stroke-width="1.7" />
      <path d="M10 2.5v2.2M10 15.3v2.2M17.5 10h-2.2M4.7 10H2.5M15.2 4.8l-1.6 1.6M6.4 13.6l-1.6 1.6M15.2 15.2l-1.6-1.6M6.4 6.4 4.8 4.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
    </svg>
  </button>
</template>
