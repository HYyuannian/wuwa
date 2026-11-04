<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '暂无数据',
    description: '数据导入后会显示在这里。',
  },
)
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__mark">∅</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 48px 24px;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: var(--surface-2);
}

.empty-state__mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand-strong);
  font-size: 20px;
}

.empty-state p {
  color: var(--text-muted);
  max-width: 420px;
}
</style>
