<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ElementTag from '@/components/ElementTag.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useDebouncedRef } from '@/composables/useDebouncedRef'
import {
  ELEMENT_META,
  ELEMENT_ORDER,
  WEAPON_META,
  WEAPON_ORDER,
} from '@/constants'
import { useCharactersQuery } from '@/queries/useCharacters'
import type { ElementKey, WeaponType } from '@/types'

const route = useRoute()
const router = useRouter()

const keyword = ref(
  typeof route.query.q === 'string' ? route.query.q : '',
)
const element = ref<ElementKey | ''>(
  (route.query.element as ElementKey) || '',
)
const weapon = ref<WeaponType | ''>(
  (route.query.weapon as WeaponType) || '',
)
const rarity = ref<number | ''>(
  route.query.rarity ? Number(route.query.rarity) : '',
)
const page = ref(Math.max(1, Number(route.query.page) || 1))
const pageSize = 24
const debouncedKeyword = useDebouncedRef(keyword, 300)

const query = useCharactersQuery(
  computed(() => ({
    q: debouncedKeyword.value.trim(),
    element: element.value,
    weapon: weapon.value,
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
  Boolean(keyword.value || element.value || weapon.value || rarity.value),
)

watch([debouncedKeyword, element, weapon, rarity], () => {
  page.value = 1
})

watch(
  [debouncedKeyword, element, weapon, rarity, page],
  () => {
    const nextQuery: Record<string, string> = {}

    if (debouncedKeyword.value.trim()) nextQuery.q = debouncedKeyword.value.trim()
    if (element.value) nextQuery.element = element.value
    if (weapon.value) nextQuery.weapon = weapon.value
    if (rarity.value) nextQuery.rarity = String(rarity.value)
    if (page.value > 1) nextQuery.page = String(page.value)

    void router.replace({ query: nextQuery })
  },
  { deep: true },
)

function resetFilters() {
  keyword.value = ''
  element.value = ''
  weapon.value = ''
  rarity.value = ''
  page.value = 1
}

function hideOnError(event: Event) {
  const image = event.target as HTMLImageElement
  image.style.display = 'none'
}

function weaponLabel(value: WeaponType) {
  return WEAPON_META[value]?.label ?? value
}
</script>

<template>
  <div class="page">
    <PageHeader title="角色" description="按属性、武器与稀有度筛选，点击卡片查看详情。">
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
        placeholder="搜索角色名"
        clearable
      />
      <el-select v-model="element" placeholder="属性" clearable class="filter-select">
        <el-option
          v-for="key in ELEMENT_ORDER"
          :key="key"
          :label="ELEMENT_META[key].label"
          :value="key"
        />
      </el-select>
      <el-select v-model="weapon" placeholder="武器" clearable class="filter-select">
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
      </el-select>
      <el-button v-if="hasFilter" text @click="resetFilters">重置</el-button>
      <span class="muted result-count">共 {{ total }} 位角色</span>
    </div>

    <div v-if="isLoading && !items.length" class="panel panel--padded loading-panel">
      正在加载角色数据…
    </div>

    <EmptyState
      v-else-if="isError"
      title="角色数据加载失败"
      description="请检查 API 连接，或稍后重试。"
    >
      <el-button @click="query.refetch()">重试</el-button>
    </EmptyState>

    <div v-else-if="items.length" class="character-grid">
      <RouterLink
        v-for="character in items"
        :key="character.id"
        class="character-card panel"
        :to="`/characters/${character.id}`"
      >
        <div class="character-card__avatar">
          <img
            v-if="character.avatar"
            :src="character.avatar"
            :alt="character.name"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="hideOnError"
          />
          <span v-else>{{ character.name.slice(0, 1) }}</span>
        </div>
        <div class="character-card__body">
          <div class="character-card__title">
            <strong>{{ character.name }}</strong>
            <span class="rarity">{{ '★'.repeat(character.rarity) }}</span>
          </div>
          <div class="character-card__tags">
            <ElementTag :element="character.element" />
            <span class="tag">{{ weaponLabel(character.weapon) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>

    <EmptyState
      v-else
      :title="hasFilter ? '没有匹配的角色' : '暂无角色数据'"
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

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.character-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.character-card:hover {
  transform: translateY(-2px);
  border-color: var(--brand);
}

.character-card__avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 62px;
  height: 62px;
  overflow: hidden;
  border-radius: 14px;
  background: linear-gradient(150deg, var(--brand-soft), var(--surface-2));
  color: var(--brand-strong);
  font-size: 26px;
  font-weight: 700;
}

.character-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-card__body {
  display: grid;
  align-content: start;
  gap: 6px;
  min-width: 0;
}

.character-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.character-card__title strong {
  font-size: 16px;
}

.rarity {
  color: var(--brand);
  font-size: 12px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.character-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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
