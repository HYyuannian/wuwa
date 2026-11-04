import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'wuwa-theme'

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>('dark')

  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  function setTheme(next: ThemeMode) {
    theme.value = next
    localStorage.setItem(THEME_KEY, next)
    applyTheme()
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function init() {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') {
      theme.value = saved
    }
    applyTheme()
  }

  return { theme, init, setTheme, toggleTheme }
})
