<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import { WEAPON_META, WEAPON_ORDER } from '@/constants'
import { useWeaponsQuery } from '@/queries/useWeapons'
import type { WeaponType } from '@/types'

const route = useRoute()
const router = useRouter()

const keyword = ref(
  typeof route.query.q === 'string' ? route.query.q : '',
)
const type = ref<WeaponType | ''>(
  (route.query.type as WeaponType) || '',
)
const rarity = ref<number | ''>(
  route.query.rarity ? Number(route.query.rarity) : '',
)
const page = ref(Math.max(1, Number(route.query.page) || 1))
const pageSize = 24
const debouncedKeyword = useDebouncedRef(keyword, 300)

const query = useWeaponsQuery(
  computed(() => ({
    q: debouncedKeyword.value.trim(),
    type: type.value,
    rarity: rarity.value,
    page: page.value,
    pageSize,
  })),
)

const items = computed(() => query.data.value?.items ?? [])
const total = computed(() => query.data.value?.total ?? 0)
const isLoading = query.isLoading
const isFetching = query.isFetching
const isError = query.isError
const hasFilter = computed(() =>
  Boolean(keyword.value || type.value || rarity.value),
)

watch([debouncedKeyword, type, rarity], () => {
  page.value = 1
})

watch(
  [debouncedKeyword, type, rarity, page],
  () => {
    const nextQuery: Record<string, string> = {}

    if (debouncedKeyword.value.trim()) nextQuery.q = debouncedKeyword.value.trim()
    if (type.value) nextQuery.type = type.value
    if (rarity.value) nextQuery.rarity = String(rarity.value)
    if (page.value > 1) nextQuery.page = String(page.value)

    void router.replace({ query: nextQuery })
  },
  { deep: true },
)

function resetFilters() {
  keyword.value = ''
  type.value = ''
  rarity.value = ''
  page.value = 1
}

function weaponLabel(value: WeaponType) {
  return WEAPON_META[value]?.label ?? value
}

function hideOnError(event: Event) {
  const image = event.target as HTMLImageElement
  image.style.display = 'none'
}
</script>

<template>
  <div class="page">
    <PageHeader title="武器" description="按类型与稀有度检索武器，数据来自 Supabase。">
      <template #actions>
        <el-button :loading="isFetching" @click="query.refetch()">
          刷新数据
        </el-button>
      </template>
    </PageHeader>

    <div class="filters panel panel--padded">
      <el-input
        v-model="keyword"
        class="filter-search"
        placeholder="搜索武器名"
        clearable
      />
      <el-select v-model="type" placeholder="类型" clearable class="filter-select">
        <el-option
          v-for="key in WEAPON_ORDER"
          :key="key"
          :label="WEAPON_META[key].label"
          :value="key"
        />
      </el-select>
      <el-select v-model="rarity" placeholder="稀有度" clearable class="filter-select">
        <el-option label="5 星" :value="5" />
        <el-option label="4 星" :value="4" />
        <el-option label="3 星" :value="3" />
        <el-option label="2 星" :value="2" />
        <el-option label="1 星" :value="1" />
      </el-select>
      <el-button v-if="hasFilter" text @click="resetFilters">重置</el-button>
      <span class="muted result-count">共 {{ total }} 把武器</span>
    </div>

    <div v-if="isLoading && !items.length" class="panel panel--padded loading-panel">
      正在加载武器数据…
    </div>

    <EmptyState
      v-else-if="isError"
      title="武器数据加载失败"
      description="请检查 API 连接，或稍后重试。"
    >
      <el-button @click="query.refetch()">重试</el-button>
    </EmptyState>

    <div v-else-if="items.length" class="panel table-panel">
      <el-table :data="items" stripe style="width: 100%">
        <el-table-column label="" width="58" align="center">
          <template #default="{ row }">
            <img
              v-if="row.icon"
              class="weapon-icon"
              :src="row.icon"
              :alt="row.name"
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="hideOnError"
            />
            <span v-else class="weapon-icon weapon-icon--empty">武</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column label="类型" width="110">
          <template #default="{ row }">{{ weaponLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column label="稀有度" width="110">
          <template #default="{ row }">
            <span class="rarity">{{ '★'.repeat(row.rarity) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="副属性" width="140">
          <template #default="{ row }">{{ row.subStat || '待导入' }}</template>
        </el-table-column>
        <el-table-column label="说明" min-width="240">
          <template #default="{ row }">
            <span class="muted">{{ row.description || '待导入' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <EmptyState
      v-else
      :title="hasFilter ? '没有匹配的武器' : '暂无武器数据'"
      :description="
        hasFilter
          ? '试试放宽筛选条件，或重置筛选。'
          : '数据同步完成后会显示在这里。'
      "
    >
      <el-button v-if="hasFilter" @click="resetFilters">重置筛选</el-button>
    </EmptyState>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<style scoped>
.filters {
  margin-bottom: 16px;
}

.filter-search {
  width: 220px;
}

.filter-select {
  width: 130px;
}

.result-count {
  margin-left: auto;
  font-size: 13px;
}

.loading-panel {
  min-height: 160px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 14px;
}

.table-panel {
  overflow-x: auto;
}

.table-panel :deep(.el-table) {
  min-width: 720px;
}

.rarity {
  color: var(--brand);
  font-size: 12px;
  white-space: nowrap;
}

.weapon-icon {
  display: block;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  border-radius: 9px;
  object-fit: contain;
  background: var(--surface-2);
}

.weapon-icon--empty {
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .filter-search,
  .filter-select {
    width: 100%;
  }

  .result-count {
    margin-left: 0;
  }
}
</style>
