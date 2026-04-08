<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { computed, onBeforeUnmount, watchEffect } from 'vue';
import { useData } from 'vitepress';
import HomePage from './components/HomePage.vue';

const { frontmatter } = useData();
const isCustomHome = computed(() => frontmatter.value.layout === 'custom-home');

watchEffect(() => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.toggle('tx-page-home', isCustomHome.value);
});

onBeforeUnmount(() => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.remove('tx-page-home');
});
</script>

<template>
  <HomePage v-if="isCustomHome" />
  <DefaultTheme.Layout v-else />
</template>
