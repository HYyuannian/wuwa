<script setup lang="ts">
import { computed } from 'vue'
import { ELEMENT_META } from '@/constants'
import type { ElementKey } from '@/types'

const props = defineProps<{
  element: ElementKey
}>()

const meta = computed(() => ELEMENT_META[props.element])
</script>

<template>
  <span
    class="element-tag"
    :style="{ '--tag-color': meta.color }"
  >
    <i class="element-tag__dot" />
    {{ meta.label }}
  </span>
</template>

<style scoped>
.element-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--tag-color);
  background: color-mix(in srgb, var(--tag-color) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tag-color) 35%, transparent);
}

.element-tag__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tag-color);
}
</style>
