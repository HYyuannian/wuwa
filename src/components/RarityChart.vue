<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { useAppStore } from '@/stores/app'
import { useDatasetStore } from '@/stores/dataset'

const appStore = useAppStore()
const store = useDatasetStore()

const textColor = computed(() =>
  appStore.theme === 'dark' ? '#9aa3b2' : '#6b7280',
)

const surfaceColor = computed(() =>
  appStore.theme === 'dark' ? '#161a22' : '#fffdf8',
)

const option = computed<EChartsOption>(() => {
  const five = store.dataset.characters.filter(
    (character) => character.rarity === 5,
  ).length
  const four = store.dataset.characters.filter(
    (character) => character.rarity === 4,
  ).length

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: { color: textColor.value },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['50%', '44%'],
        itemStyle: {
          borderColor: surfaceColor.value,
          borderWidth: 2,
          borderRadius: 6,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 600,
            color: textColor.value,
          },
        },
        data: [
          { value: five, name: '5 星', itemStyle: { color: '#e5c05a' } },
          { value: four, name: '4 星', itemStyle: { color: '#7a8cf0' } },
        ],
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
