<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="description" class="page-header__desc">{{ description }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

h1 {
  font-size: clamp(26px, 3vw, 34px);
  letter-spacing: -0.02em;
}

.page-header__desc {
  margin-top: 6px;
  color: var(--text-muted);
  max-width: 640px;
}

.page-header__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
