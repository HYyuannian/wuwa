<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { ELEMENT_META, ELEMENT_ORDER } from '@/constants'
import { useAppStore } from '@/stores/app'
import { useDatasetStore } from '@/stores/dataset'

const appStore = useAppStore()
const datasetStore = useDatasetStore()

const isDark = computed(() => appStore.theme === 'dark')
const axisColor = computed(() => (isDark.value ? '#9aa3b2' : '#6b7280'))
const splitColor = computed(() => (isDark.value ? '#2a303c' : '#e2dccf'))

const option = computed<EChartsOption>(() => {
  const counts = new Map<string, number>()
  for (const character of datasetStore.dataset.characters) {
    counts.set(character.element, (counts.get(character.element) ?? 0) + 1)
  }

  const labels = ELEMENT_ORDER.map((key) => ELEMENT_META[key].label)
  const values = ELEMENT_ORDER.map((key) => counts.get(key) ?? 0)
  const colors = ELEMENT_ORDER.map((key) => ELEMENT_META[key].color)

  return {
    grid: { left: 8, right: 8, top: 20, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: splitColor.value } },
      axisTick: { show: false },
      axisLabel: { color: axisColor.value },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: axisColor.value },
      splitLine: { lineStyle: { color: splitColor.value } },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 42,
        data: values.map((value, index) => ({
          value,
          itemStyle: { color: colors[index], borderRadius: [6, 6, 0, 0] },
        })),
      },
    ],
  }
})
</script>

<template>
  <VChart class="element-chart" :option="option" autoresize />
</template>

<style scoped>
.element-chart {
  height: 260px;
  width: 100%;
}
</style>
