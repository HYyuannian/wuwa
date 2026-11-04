<script setup lang="ts">
import { computed } from 'vue'
import ElementChart from '@/components/ElementChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import RarityChart from '@/components/RarityChart.vue'
import StatCard from '@/components/StatCard.vue'
import WeaponTypeChart from '@/components/WeaponTypeChart.vue'
import { useDatasetStore } from '@/stores/dataset'

const store = useDatasetStore()

const isMock = computed(() => store.dataset.meta.mock)
const generatedAt = computed(
  () => store.dataset.meta.generatedAt || '尚未生成',
)
</script>

<template>
  <div class="page">
    <section class="hero panel">
      <div class="hero__content">
        <span class="tag tag--brand">非官方粉丝项目</span>
        <h1>鸣潮数据看板</h1>
        <p class="hero__desc">
          角色、武器、声骸与配队的一站式检索与可视化。当前为可运行骨架，
          数据层使用本地快照，构建前从社区数据仓库生成。
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

    <div v-if="isMock" class="notice">
      <strong>当前为示例数据</strong>
      <span>
        运行 <code>npm run import:data</code> 从社区数据仓库生成
        <code>public/data</code> 下的真实快照。
      </span>
    </div>

    <section class="stat-grid">
      <StatCard label="角色" :value="store.stats.characters" hint="属性 / 武器 / 稀有度筛选" />
      <StatCard label="武器" :value="store.stats.weapons" hint="按武器类型检索" />
      <StatCard label="声骸套装" :value="store.stats.echoes" hint="套装效果与搭配" />
      <StatCard label="配队" :value="store.stats.teams" hint="Day 2 扩展模块" />
    </section>

    <section class="home-grid">
      <div class="panel panel--padded">
        <div class="section-head">
          <h2>属性分布</h2>
          <span class="muted">按角色数量统计</span>
        </div>
        <ElementChart v-if="store.stats.characters" />
        <EmptyState
          v-else
          title="暂无角色数据"
          description="运行 npm run import:data 后，这里会显示属性分布图。"
        />
      </div>

      <aside class="panel panel--padded side">
        <h2>数据状态</h2>
        <dl class="meta-list">
          <div>
            <dt>数据来源</dt>
            <dd>{{ store.dataset.meta.source }}</dd>
          </div>
          <div>
            <dt>快照时间</dt>
            <dd>{{ generatedAt }}</dd>
          </div>
          <div>
            <dt>运行模式</dt>
            <dd>{{ isMock ? '示例 / 待接入' : '真实快照' }}</dd>
          </div>
        </dl>
        <p class="muted side__note">
          页面读取构建时生成的 <code>public/data</code> 快照，部署后不依赖第三方接口。
        </p>
        <RouterLink class="text-link" to="/teams">了解配队模块 →</RouterLink>
      </aside>
    </section>

    <section class="home-grid home-grid--charts">
      <div class="panel panel--padded">
        <div class="section-head">
          <h2>角色稀有度</h2>
          <span class="muted">5 星 / 4 星</span>
        </div>
        <RarityChart v-if="store.stats.characters" />
        <EmptyState
          v-else
          title="暂无角色数据"
          description="运行 npm run import:data 后生成分布图。"
        />
      </div>

      <div class="panel panel--padded">
        <div class="section-head">
          <h2>武器类型分布</h2>
          <span class="muted">全部稀有度</span>
        </div>
        <WeaponTypeChart v-if="store.stats.weapons" />
        <EmptyState
          v-else
          title="暂无武器数据"
          description="运行 npm run import:data 后生成分布图。"
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
