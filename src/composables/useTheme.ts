import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const currentTheme = ref<string>('default')
const isDark = ref(false)
const themeMode = ref<ThemeMode>('light')

let mediaQueryCleanup: (() => void) | null = null

function applyTheme(el: HTMLElement, variables?: Record<string, string>) {
  if (!variables) return
  for (const [key, value] of Object.entries(variables)) {
    el.style.setProperty(key, value)
  }
}

function setTheme(name: string) {
  currentTheme.value = name
}

function updateDarkFromSystem() {
  if (themeMode.value === 'auto') {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

function setDarkMode(mode: ThemeMode) {
  themeMode.value = mode

  // Clean up previous listener
  if (mediaQueryCleanup) {
    mediaQueryCleanup()
    mediaQueryCleanup = null
  }

  if (mode === 'dark') {
    isDark.value = true
  } else if (mode === 'light') {
    isDark.value = false
  } else {
    // Auto mode - listen to system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      isDark.value = e.matches
    }
    mql.addEventListener('change', handler)
    mediaQueryCleanup = () => mql.removeEventListener('change', handler)
  }
}

export function useTheme() {
  return {
    currentTheme,
    isDark,
    themeMode,
    applyTheme,
    setTheme,
    setDarkMode,
  }
}
