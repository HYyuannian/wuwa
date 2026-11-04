<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  hint?: string
}>()
</script>

<template>
  <div class="stat-card panel">
    <span class="stat-card__label">{{ label }}</span>
    <strong class="stat-card__value">{{ value }}</strong>
    <span v-if="hint" class="stat-card__hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  display: grid;
  gap: 4px;
  padding: 18px 20px;
  background: linear-gradient(150deg, var(--surface), var(--surface-2));
}

.stat-card__label {
  color: var(--text-muted);
  font-size: 13px;
}

.stat-card__value {
  font-size: 32px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.stat-card__hint {
  color: var(--text-muted);
  font-size: 12px;
}
</style>
