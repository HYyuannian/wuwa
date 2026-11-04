<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useDatasetStore } from '@/stores/dataset'

const store = useDatasetStore()

function memberName(id: string) {
  return store.getCharacter(id)?.name ?? id
}
</script>

<template>
  <div class="page">
    <PageHeader
      title="配队"
      description="配队推荐与成员组合。第一版先做静态展示，编辑器为可选项。"
    >
      <template #actions>
        <el-button :loading="store.loading" @click="store.ensureLoaded(true)">
          刷新数据
        </el-button>
      </template>
    </PageHeader>

    <div v-if="store.dataset.teams.length" class="team-grid">
      <article
        v-for="team in store.dataset.teams"
        :key="team.id"
        class="team-card panel panel--padded"
      >
        <h2>{{ team.name }}</h2>
        <div class="team-members">
          <RouterLink
            v-for="member in team.members"
            :key="member"
            class="team-member"
            :to="`/characters/${member}`"
          >
            <span class="team-member__avatar">{{ memberName(member).slice(0, 1) }}</span>
            <span>{{ memberName(member) }}</span>
          </RouterLink>
        </div>
        <p v-if="team.note" class="muted">{{ team.note }}</p>
      </article>
    </div>

    <EmptyState
      v-else
      title="配队数据待接入"
      description="Day 2 目标：支持按角色组合展示推荐配队；编辑器与保存功能为可选项。"
    >
      <RouterLink class="tag tag--brand" to="/characters">先去挑选角色</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.team-card {
  display: grid;
  gap: 12px;
}

.team-card h2 {
  font-size: 18px;
}

.team-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.team-member {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-2);
  font-size: 13px;
}

.team-member:hover {
  border-color: var(--brand);
}

.team-member__avatar {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand-strong);
  font-size: 12px;
  font-weight: 700;
}
</style>
