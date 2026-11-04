<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { SITE } from '@/constants'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const navItems = [
  { name: 'home', label: '总览', path: '/' },
  { name: 'characters', label: '角色', path: '/characters' },
  { name: 'weapons', label: '武器', path: '/weapons' },
  { name: 'echoes', label: '声骸', path: '/echoes' },
  { name: 'teams', label: '配队', path: '/teams' },
]

const activeName = computed(() => {
  if (route.name === 'character-detail') return 'characters'
  return typeof route.name === 'string' ? route.name : 'home'
})
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="site-header__inner">
        <RouterLink class="brand" to="/">
          <span class="brand__mark">W</span>
          <span class="brand__text">
            <strong>{{ SITE.name }}</strong>
            <small>{{ SITE.subtitle }}</small>
          </span>
        </RouterLink>

        <nav class="site-nav" aria-label="主导航">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            class="site-nav__link"
            :class="{ 'is-active': activeName === item.name }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="site-actions">
          <a
            v-if="SITE.repoUrl"
            :href="SITE.repoUrl"
            class="ghost-link"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <button
            class="icon-button"
            type="button"
            :aria-label="appStore.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
            @click="appStore.toggleTheme()"
          >
            <el-icon>
              <component :is="appStore.theme === 'dark' ? Sunny : Moon" />
            </el-icon>
          </button>
        </div>
      </div>
    </header>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <p>{{ SITE.disclaimer }}</p>
      <p class="site-footer__meta">数据来源：GitHub 社区数据快照 · 非官方项目</p>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(14px);
}

.site-header__inner {
  display: flex;
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 12px 24px;
  align-items: center;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(140deg, var(--brand), var(--brand-strong));
  color: #15130c;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.04em;
  box-shadow: 0 6px 18px var(--brand-soft);
}

.brand__text {
  display: grid;
  line-height: 1.2;
}

.brand__text strong {
  font-size: 15px;
  white-space: nowrap;
}

.brand__text small {
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 0.22em;
}

.site-nav {
  display: flex;
  flex: 1;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.site-nav::-webkit-scrollbar {
  display: none;
}

.site-nav__link {
  padding: 7px 13px;
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 14px;
  white-space: nowrap;
  transition: color 0.2s, background 0.2s;
}

.site-nav__link:hover {
  color: var(--text);
  background: var(--surface-2);
}

.site-nav__link.is-active {
  color: var(--brand-strong);
  background: var(--brand-soft);
}

.site-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ghost-link {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 13px;
}

.ghost-link:hover {
  color: var(--text);
  border-color: var(--brand);
}

.icon-button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.icon-button:hover {
  border-color: var(--brand);
  transform: translateY(-1px);
}

.site-main {
  flex: 1;
}

.site-footer {
  display: grid;
  gap: 4px;
  padding: 24px;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}

.site-footer__meta {
  opacity: 0.75;
}

@media (max-width: 720px) {
  .site-header__inner {
    flex-wrap: wrap;
    gap: 10px 16px;
    padding: 10px 16px;
  }

  .site-nav {
    order: 3;
    flex-basis: 100%;
  }

  .site-actions {
    margin-left: auto;
  }

  .brand__text small {
    display: none;
  }
}
</style>
