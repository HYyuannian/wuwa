<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ElementTag from '@/components/ElementTag.vue'
import EmptyState from '@/components/EmptyState.vue'
import { WEAPON_META } from '@/constants'
import { useDatasetStore } from '@/stores/dataset'

const route = useRoute()
const store = useDatasetStore()

const character = computed(() => store.getCharacter(String(route.params.id)))

const statEntries = computed(() => {
  const stats = character.value?.stats
  if (!stats) return []
  return [
    { label: '生命值', value: stats.hp },
    { label: '攻击力', value: stats.atk },
    { label: '防御力', value: stats.def },
    { label: '暴击率', value: stats.critRate, suffix: '%' },
    { label: '暴击伤害', value: stats.critDamage, suffix: '%' },
    { label: '共鸣效率', value: stats.energyRegen, suffix: '%' },
  ].filter(
    (item): item is { label: string; value: number; suffix?: string } =>
      typeof item.value === 'number',
  )
})

onMounted(() => {
  if (!store.loaded) {
    void store.ensureLoaded()
  }
})
</script>

<template>
  <div class="page">
    <RouterLink class="back-link" to="/characters">← 返回角色列表</RouterLink>

    <template v-if="character">
      <section class="detail-head panel">
        <div class="detail-head__avatar">
          <img v-if="character.avatar" :src="character.avatar" :alt="character.name" />
          <span v-else>{{ character.name.slice(0, 1) }}</span>
        </div>
        <div class="detail-head__body">
          <div class="detail-head__title">
            <h1>{{ character.name }}</h1>
            <span class="rarity">{{ '★'.repeat(character.rarity) }}</span>
          </div>
          <div class="detail-head__tags">
            <ElementTag :element="character.element" />
            <span class="tag">{{ WEAPON_META[character.weapon].label }}</span>
            <span v-for="role in character.roles" :key="role" class="tag">{{ role }}</span>
          </div>
          <p v-if="character.description" class="muted detail-head__desc">
            {{ character.description }}
          </p>
        </div>
      </section>

      <div class="detail-grid">
        <section class="panel panel--padded">
          <h2>
            基础属性
            <span v-if="character.stats" class="stat-level">
              Lv.{{ character.stats.level ?? 1 }}
            </span>
          </h2>
          <dl v-if="statEntries.length" class="stat-list">
            <div v-for="item in statEntries" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}{{ item.suffix ?? '' }}</dd>
            </div>
          </dl>
          <p v-else class="muted">
            该角色暂缺基础属性，重新运行 npm run import:data 可更新快照。
          </p>
        </section>

        <section class="panel panel--padded">
          <h2>技能</h2>
          <ul v-if="character.skills?.length" class="skill-list">
            <li v-for="skill in character.skills" :key="skill.name">
              <div class="skill-list__head">
                <strong>{{ skill.name }}</strong>
                <span class="tag">{{ skill.type }}</span>
              </div>
              <p class="muted">{{ skill.description }}</p>
            </li>
          </ul>
          <p v-else class="muted">技能数据待接入。</p>
        </section>
      </div>
    </template>

    <EmptyState
      v-else-if="store.loading"
      title="正在加载角色数据"
      description="请稍候。"
    />

    <EmptyState
      v-else
      title="没有找到这个角色"
      description="角色 ID 可能不正确，或者快照里还没有这名角色。"
    >
      <RouterLink class="tag tag--brand" to="/characters">返回角色列表</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 14px;
  color: var(--text-muted);
  font-size: 13px;
}

.back-link:hover {
  color: var(--brand-strong);
}

.detail-head {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 24px;
  background:
    radial-gradient(520px 220px at 90% 0%, var(--brand-soft), transparent 70%),
    var(--surface);
}

.detail-head__avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 96px;
  height: 96px;
  overflow: hidden;
  border-radius: 22px;
  background: linear-gradient(150deg, var(--brand-soft), var(--surface-2));
  color: var(--brand-strong);
  font-size: 40px;
  font-weight: 700;
}

.detail-head__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-head__body {
  display: grid;
  gap: 8px;
}

.detail-head__title {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: baseline;
}

.detail-head__title h1 {
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.03em;
}

.rarity {
  color: var(--brand);
  letter-spacing: 0.06em;
}

.detail-head__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detail-head__desc {
  font-size: 13px;
  max-width: 720px;
  white-space: pre-line;
}

.stat-level {
  margin-left: 6px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 400;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.detail-grid h2 {
  margin-bottom: 12px;
  font-size: 18px;
}

.stat-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin: 0;
}

.stat-list div {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
}

.stat-list dt {
  color: var(--text-muted);
  font-size: 12px;
}

.stat-list dd {
  margin: 2px 0 0;
  font-size: 18px;
  font-weight: 600;
}

.skill-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill-list li {
  display: grid;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border);
}

.skill-list li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.skill-list__head {
  display: flex;
  gap: 8px;
  align-items: center;
}

.skill-list p {
  font-size: 13px;
}

@media (max-width: 820px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
