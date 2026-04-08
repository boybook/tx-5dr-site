<script setup lang="ts">
defineProps<{
  title: string;
  items: Array<{ title: string; body: string; meta?: string }>;
  gridClassName: string;
}>();
</script>

<template>
  <section class="mt-20">
    <h2 class="tx-section-title font-['Space_Grotesk'] text-3xl font-bold text-slate-950 dark:text-white">{{ title }}</h2>
    <div :class="`mt-6 grid gap-4 ${gridClassName}`">
      <article
        v-for="item in items"
        :key="item.title"
        class="tx-glass-card rounded-3xl border border-white/15 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
      >
        <h3 class="tx-card-title font-['Space_Grotesk'] text-xl font-bold text-slate-950 dark:text-white">{{ item.title }}</h3>
        <p class="tx-card-body mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{{ item.body }}</p>
        <p v-if="item.meta" class="tx-card-meta mt-4 text-sm font-medium text-rose-700 dark:text-rose-300">{{ item.meta }}</p>
      </article>
    </div>
  </section>
</template>
