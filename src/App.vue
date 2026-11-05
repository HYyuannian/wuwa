<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

appStore.init()
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>
