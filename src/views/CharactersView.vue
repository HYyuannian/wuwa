<script setup lang="ts">
import { computed, ref } from 'vue'
import ElementTag from '@/components/ElementTag.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import { ELEMENT_META, ELEMENT_ORDER, WEAPON_META, WEAPON_ORDER } from '@/constants'
import { useDatasetStore } from '@/stores/dataset'
import type { ElementKey, WeaponType } from '@/types'

const store = useDatasetStore()

const keyword = ref('')
const element = ref<ElementKey | ''>('')
const weapon = ref<WeaponType | ''>('')
const rarity = ref<number | ''>('')

const filtered = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  return store.dataset.characters.filter((character) => {
    if (key && !character.name.toLowerCase().includes(key)) return false
    if (element.value && character.element !== element.value) return false
    if (weapon.value && character.weapon !== weapon.value) return false
    if (rarity.value && character.rarity !== rarity.value) return false
    return true
  })
})

const hasFilter = computed(
  () => Boolean(keyword.value || element.value || weapon.value || rarity.value),
)

function resetFilters() {
  keyword.value = ''
  element.value = ''
  weapon.value = ''
  rarity.value = ''
}
</script>

<template>
  <div class="page">
    <PageHeader title="角色" description="按属性、武器与稀有度筛选，点击卡片查看详情。">
      <template #actions>
        <el-button :loading="store.loading" @click="store.ensureLoaded(true)">
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
      <span class="muted result-count">共 {{ filtered.length }} 位角色</span>
    </div>

    <div v-if="filtered.length" class="character-grid">
      <RouterLink
        v-for="character in filtered"
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
            <span class="tag">{{ WEAPON_META[character.weapon].label }}</span>
          </div>
          <p v-if="character.roles?.length" class="muted card-roles">
            {{ character.roles.join(' · ') }}
          </p>
        </div>
      </RouterLink>
    </div>

    <EmptyState
      v-else
      :title="hasFilter ? '没有匹配的角色' : '暂无角色数据'"
      :description="
        hasFilter
          ? '试试放宽筛选条件，或重置筛选。'
          : '运行 npm run import:data 生成真实角色快照。'
      "
    >
      <el-button v-if="hasFilter" @click="resetFilters">重置筛选</el-button>
    </EmptyState>
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

.card-roles {
  font-size: 12px;
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
