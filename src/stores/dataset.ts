import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loadDataset } from '@/api/dataset'
import type { Dataset } from '@/types'

const EMPTY_DATASET: Dataset = {
  meta: { source: 'local snapshot', generatedAt: '', mock: true },
  characters: [],
  weapons: [],
  echoes: [],
  teams: [],
}

export const useDatasetStore = defineStore('dataset', () => {
  const dataset = ref<Dataset>(EMPTY_DATASET)
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref('')

  async function ensureLoaded(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = ''
    try {
      dataset.value = await loadDataset()
      loaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '数据加载失败'
    } finally {
      loading.value = false
    }
  }

  const stats = computed(() => ({
    characters: dataset.value.characters.length,
    weapons: dataset.value.weapons.length,
    echoes: dataset.value.echoes.length,
    teams: dataset.value.teams.length,
  }))

  const getCharacter = (id: string) =>
    dataset.value.characters.find((item) => item.id === id)

  return {
    dataset,
    loading,
    loaded,
    error,
    stats,
    ensureLoaded,
    getCharacter,
  }
})
