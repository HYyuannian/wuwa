<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import ElementTag from '@/components/ElementTag.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useDatasetStore } from '@/stores/dataset'

const store = useDatasetStore()
</script>

<template>
  <div class="page">
    <PageHeader title="声骸" description="声骸套装与效果汇总。套装搭配推荐计划在 Day 2 完成。">
      <template #actions>
        <el-button :loading="store.loading" @click="store.ensureLoaded(true)">
          刷新数据
        </el-button>
      </template>
    </PageHeader>

    <div v-if="store.dataset.echoes.length" class="echo-grid">
      <article
        v-for="echo in store.dataset.echoes"
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
      description="运行 npm run import:data 从社区数据仓库生成声骸快照。"
    />
  </div>
</template>

<style scoped>
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
