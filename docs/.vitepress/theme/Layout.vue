<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { computed } from 'vue';
import { useData } from 'vitepress';
import HomePage from './components/HomePage.vue';

const { frontmatter } = useData();
const isCustomHome = computed(() => frontmatter.value.layout === 'custom-home');
</script>

<template>
  <HomePage v-if="isCustomHome" />
  <DefaultTheme.Layout v-else />
</template>
