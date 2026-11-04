<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAppStore } from '@/stores/app'
import { useDatasetStore } from '@/stores/dataset'

const appStore = useAppStore()
const datasetStore = useDatasetStore()

appStore.init()
onMounted(() => {
  void datasetStore.ensureLoaded()
})
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>
