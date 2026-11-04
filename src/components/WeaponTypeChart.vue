<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { WEAPON_META, WEAPON_ORDER } from '@/constants'
import { useAppStore } from '@/stores/app'
import { useDatasetStore } from '@/stores/dataset'

const appStore = useAppStore()
const store = useDatasetStore()

const isDark = computed(() => appStore.theme === 'dark')
const axisColor = computed(() => (isDark.value ? '#9aa3b2' : '#6b7280'))
const splitColor = computed(() => (isDark.value ? '#2a303c' : '#e2dccf'))

const option = computed<EChartsOption>(() => {
  const counts = WEAPON_ORDER.map(
    (type) =>
      store.dataset.weapons.filter((weapon) => weapon.type === type).length,
  )

  return {
    grid: { left: 8, right: 8, top: 20, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: WEAPON_ORDER.map((type) => WEAPON_META[type].label),
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
        data: counts.map((value) => ({
          value,
          itemStyle: { color: '#e5c05a', borderRadius: [6, 6, 0, 0] },
        })),
      },
    ],
  }
})
</script>

<template>
  <VChart class="mini-chart" :option="option" autoresize />
</template>

<style scoped>
.mini-chart {
  width: 100%;
  height: 240px;
}
</style>
