<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
</script>

<template>
  <div class="page">
    <PageHeader
      title="配队"
      description="配队模块规划中，后续会基于 Supabase 角色数据提供推荐配队。"
    />

    <EmptyState
      title="配队数据待接入"
      description="当前版本先完成角色、武器、声骸的 API 化；配队推荐会在后续版本补充。"
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
