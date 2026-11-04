<script setup lang="ts">
import { computed, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import { WEAPON_META, WEAPON_ORDER } from '@/constants'
import { useDatasetStore } from '@/stores/dataset'
import type { WeaponType } from '@/types'

const store = useDatasetStore()

const keyword = ref('')
const type = ref<WeaponType | ''>('')
const rarity = ref<number | ''>('')

const filtered = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  return store.dataset.weapons.filter((weapon) => {
    if (key && !weapon.name.toLowerCase().includes(key)) return false
    if (type.value && weapon.type !== type.value) return false
    if (rarity.value && weapon.rarity !== rarity.value) return false
    return true
  })
})

const hasFilter = computed(
  () => Boolean(keyword.value || type.value || rarity.value),
)

function resetFilters() {
  keyword.value = ''
  type.value = ''
  rarity.value = ''
}

function weaponLabel(value: WeaponType) {
  return WEAPON_META[value]?.label ?? value
}
</script>

<template>
  <div class="page">
    <PageHeader title="武器" description="按类型与稀有度检索武器，详情字段随数据接入补全。">
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
      <span class="muted result-count">共 {{ filtered.length }} 把武器</span>
    </div>

    <div v-if="filtered.length" class="panel table-panel">
      <el-table :data="filtered" stripe style="width: 100%">
        <el-table-column label="" width="58" align="center">
          <template #default="{ row }">
            <img
              v-if="row.icon"
              class="weapon-icon"
              :src="row.icon"
              :alt="row.name"
              loading="lazy"
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
          : '运行 npm run import:data 生成真实武器快照。'
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

.table-panel {
  overflow: hidden;
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
