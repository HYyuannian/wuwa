import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '总览' },
  },
  {
    path: '/characters',
    name: 'characters',
    component: () => import('@/views/CharactersView.vue'),
    meta: { title: '角色' },
  },
  {
    path: '/characters/:id',
    name: 'character-detail',
    component: () => import('@/views/CharacterDetailView.vue'),
    meta: { title: '角色详情' },
  },
  {
    path: '/weapons',
    name: 'weapons',
    component: () => import('@/views/WeaponsView.vue'),
    meta: { title: '武器' },
  },
  {
    path: '/echoes',
    name: 'echoes',
    component: () => import('@/views/EchoesView.vue'),
    meta: { title: '声骸' },
  },
  {
    path: '/teams',
    name: 'teams',
    component: () => import('@/views/TeamsView.vue'),
    meta: { title: '配队' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : ''
  document.title = title ? `${title} | 鸣潮数据看板` : '鸣潮数据看板'
})

export default router
