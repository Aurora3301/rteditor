import { computed } from 'vue'
import { t, setLocale, registerLocale, getLocale, currentLocale } from '../i18n'
import type { TranslationMessages } from '../i18n'

export function useI18n() {
  const locale = computed(() => currentLocale.value)

  return {
    /** Translate a key */
    t,
    /** Current locale (reactive) */
    locale,
    /** Set active locale */
    setLocale,
    /** Register a new locale or add translations */
    registerLocale,
    /** Get current locale string */
    getLocale,
  }
}

export type { TranslationMessages }

