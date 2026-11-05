<script setup lang="ts">
import { computed } from 'vue'
import ElementChart from '@/components/ElementChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import RarityChart from '@/components/RarityChart.vue'
import StatCard from '@/components/StatCard.vue'
import WeaponTypeChart from '@/components/WeaponTypeChart.vue'
import { hasSupabaseRest } from '@/api/supabase'
import { useStatsQuery } from '@/queries/useStats'

const query = useStatsQuery()

const counts = computed(
  () =>
    query.data.value?.counts ?? {
      characters: 0,
      weapons: 0,
      echoes: 0,
    },
)
const meta = computed(() => query.data.value?.meta ?? null)
const updatedAt = computed(() => {
  const value = meta.value?.finishedAt ?? meta.value?.startedAt
  return value ? new Date(value).toLocaleString('zh-CN') : '尚未同步'
})
const isLoading = query.isLoading
const isError = query.isError
const hasCharacters = computed(() => counts.value.characters > 0)
const hasWeapons = computed(() => counts.value.weapons > 0)
const isSnapshot = computed(
  () => meta.value?.status === 'snapshot',
)
const sourceLabel = computed(() =>
  isSnapshot.value ? '本地快照（GitHub Pages 镜像）' : 'Supabase / encore.moe',
)
const sourceNote = computed(() => {
  if (isSnapshot.value) {
    return '当前使用构建时快照；配置 Supabase anon key 后会直连数据库。'
  }

  return hasSupabaseRest
    ? '前端通过 Supabase REST（只读 RLS）直连数据库。'
    : '前端通过 /api 只读查询，角色、武器和声骸数据都存储在 Supabase。'
})
</script>

<template>
  <div class="page">
    <section class="hero panel">
      <div class="hero__content">
        <span class="tag tag--brand">非官方粉丝项目</span>
        <h1>鸣潮数据看板</h1>
        <p class="hero__desc">
          角色、武器、声骸与配队的一站式检索与可视化。Vercel 主站通过
          Supabase API 只读查询；GitHub Pages 镜像使用本地快照。
        </p>
        <div class="hero__actions">
          <RouterLink class="btn btn--primary" to="/characters">
            浏览角色
          </RouterLink>
          <RouterLink class="btn" to="/weapons">查看武器</RouterLink>
        </div>
      </div>
      <div class="hero__orb" aria-hidden="true">
        <span>W</span>
      </div>
    </section>

    <div v-if="isError" class="notice">
      <strong>数据加载失败</strong>
      <span>请检查 API 连接，或稍后重试。</span>
      <el-button size="small" @click="query.refetch()">重试</el-button>
    </div>

    <section class="stat-grid">
      <StatCard
        label="角色"
        :value="counts.characters"
        hint="属性 / 武器 / 稀有度筛选"
      />
      <StatCard label="武器" :value="counts.weapons" hint="按武器类型检索" />
      <StatCard label="声骸套装" :value="counts.echoes" hint="套装效果与搭配" />
      <StatCard label="配队" :value="0" hint="模块规划中" />
    </section>

    <section class="home-grid">
      <div class="panel panel--padded">
        <div class="section-head">
          <h2>属性分布</h2>
          <span class="muted">按角色数量统计</span>
        </div>
        <ElementChart v-if="hasCharacters" />
        <p v-else-if="isLoading" class="muted chart-loading">加载中…</p>
        <EmptyState
          v-else
          title="暂无角色数据"
          description="数据同步完成后，这里会显示属性分布图。"
        />
      </div>

      <aside class="panel panel--padded side">
        <h2>数据状态</h2>
        <dl class="meta-list">
          <div>
            <dt>数据来源</dt>
            <dd>{{ sourceLabel }}</dd>
          </div>
          <div>
            <dt>最近同步</dt>
            <dd>{{ updatedAt }}</dd>
          </div>
          <div>
            <dt>同步状态</dt>
            <dd>{{ meta?.status ?? '未知' }}</dd>
          </div>
        </dl>
        <p class="muted side__note">{{ sourceNote }}</p>
        <RouterLink class="text-link" to="/teams">了解配队模块 →</RouterLink>
      </aside>
    </section>

    <section class="home-grid home-grid--charts">
      <div class="panel panel--padded">
        <div class="section-head">
          <h2>角色稀有度</h2>
          <span class="muted">5 星 / 4 星</span>
        </div>
        <RarityChart v-if="hasCharacters" />
        <p v-else-if="isLoading" class="muted chart-loading">加载中…</p>
        <EmptyState
          v-else
          title="暂无角色数据"
          description="数据同步完成后生成分布图。"
        />
      </div>

      <div class="panel panel--padded">
        <div class="section-head">
          <h2>武器类型分布</h2>
          <span class="muted">全部稀有度</span>
        </div>
        <WeaponTypeChart v-if="hasWeapons" />
        <p v-else-if="isLoading" class="muted chart-loading">加载中…</p>
        <EmptyState
          v-else
          title="暂无武器数据"
          description="数据同步完成后生成分布图。"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;
  padding: 44px;
  background:
    radial-gradient(600px 260px at 85% 20%, var(--brand-soft), transparent 70%),
    var(--surface);
}

.hero__content {
  display: grid;
  justify-items: start;
  gap: 14px;
  max-width: 620px;
}

.hero h1 {
  font-size: clamp(34px, 5vw, 54px);
  letter-spacing: -0.04em;
}

.hero__desc {
  color: var(--text-muted);
}

.hero__actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 18px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text);
  font-size: 14px;
  transition: transform 0.2s, border-color 0.2s;
}

.btn:hover {
  transform: translateY(-1px);
  border-color: var(--brand);
}

.btn--primary {
  border-color: transparent;
  background: linear-gradient(140deg, var(--brand), var(--brand-strong));
  color: #18140a;
  font-weight: 600;
}

.hero__orb {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background:
    radial-gradient(circle at 35% 30%, var(--brand-soft), transparent 60%),
    var(--surface-2);
  color: var(--brand-strong);
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -0.06em;
  box-shadow: inset 0 0 60px var(--brand-soft), var(--shadow);
}

.notice {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin-top: 16px;
  padding: 12px 16px;
  border: 1px dashed var(--brand);
  border-radius: 12px;
  background: var(--brand-soft);
  color: var(--text);
  font-size: 13px;
}

.notice span {
  color: var(--text-muted);
}

.notice code,
.side__note code {
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--surface-2);
  font-size: 12px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.8fr);
  gap: 16px;
  margin-top: 16px;
}

.home-grid--charts {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.section-head h2,
.side h2 {
  font-size: 18px;
}

.side {
  display: grid;
  align-content: start;
  gap: 14px;
}

.meta-list {
  display: grid;
  gap: 10px;
  margin: 0;
}

.meta-list div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border);
}

.meta-list dt {
  color: var(--text-muted);
  font-size: 13px;
}

.meta-list dd {
  margin: 0;
  font-size: 13px;
  text-align: right;
}

.side__note {
  font-size: 13px;
}

.text-link {
  color: var(--brand-strong);
  font-size: 13px;
  font-weight: 600;
}

.chart-loading {
  display: grid;
  place-items: center;
  height: 240px;
  font-size: 13px;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-grid,
  .home-grid--charts {
    grid-template-columns: 1fr;
  }

  .hero {
    padding: 30px;
  }

  .hero__orb {
    display: none;
  }
}

@media (max-width: 520px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
