<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import ElementTag from '@/components/ElementTag.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useEchoesQuery } from '@/queries/useEchoes'

const query = useEchoesQuery()
const echoes = computed(() => query.data.value?.items ?? [])
const isLoading = query.isLoading
const isFetching = query.isFetching
const isError = query.isError

function hideOnError(event: Event) {
  const image = event.target as HTMLImageElement
  image.style.display = 'none'
}
</script>

<template>
  <div class="page">
    <PageHeader title="声骸" description="声骸套装与效果汇总，数据来自 Supabase。">
      <template #actions>
        <el-button :loading="isFetching" @click="query.refetch()">
          刷新数据
        </el-button>
      </template>
    </PageHeader>

    <div v-if="isLoading && !echoes.length" class="panel panel--padded loading-panel">
      正在加载声骸数据…
    </div>

    <EmptyState
      v-else-if="isError"
      title="声骸数据加载失败"
      description="请检查 API 连接，或稍后重试。"
    >
      <el-button @click="query.refetch()">重试</el-button>
    </EmptyState>

    <div v-else-if="echoes.length" class="echo-grid">
      <article
        v-for="echo in echoes"
        :key="echo.id"
        class="echo-card panel panel--padded"
      >
        <header class="echo-card__head">
          <div class="echo-card__title">
            <img
              v-if="echo.icon"
              class="echo-icon"
              :src="echo.icon"
              :alt="echo.name"
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="hideOnError"
            />
            <h2>{{ echo.name }}</h2>
          </div>
          <ElementTag v-if="echo.element" :element="echo.element" />
        </header>
        <div class="echo-card__effects">
          <div>
            <span class="tag tag--brand">2 件套</span>
            <p>{{ echo.twoPiece || '效果待导入' }}</p>
          </div>
          <div>
            <span class="tag tag--brand">5 件套</span>
            <p>{{ echo.fivePiece || '效果待导入' }}</p>
          </div>
        </div>
      </article>
    </div>

    <EmptyState
      v-else
      title="暂无声骸数据"
      description="数据同步完成后会显示在这里。"
    />
  </div>
</template>

<style scoped>
.loading-panel {
  min-height: 160px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 14px;
}

.echo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.echo-card {
  display: grid;
  align-content: start;
  gap: 14px;
}

.echo-card__head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.echo-card__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.echo-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  object-fit: contain;
  background: var(--surface-2);
}

.echo-card__head h2 {
  font-size: 18px;
}

.echo-card__effects {
  display: grid;
  gap: 12px;
}

.echo-card__effects p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
