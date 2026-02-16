import { ref } from 'vue'
import { en } from './en'
import { zhTW } from './zh-TW'

export type TranslationKey = keyof typeof en

export type TranslationMessages = Record<string, string>

const currentLocale = ref('en')
const locales: Record<string, TranslationMessages> = {
  en,
  'zh-TW': zhTW,
}

/**
 * Get translation for a key. Falls back to English, then returns the key itself.
 */
export function t(key: string): string {
  const messages = locales[currentLocale.value]
  if (messages && key in messages) return messages[key]
  // Fallback to English
  if (locales.en && key in locales.en) return locales.en[key]
  return key
}

/**
 * Set the active locale.
 */
export function setLocale(locale: string) {
  if (locales[locale]) {
    currentLocale.value = locale
  } else if (import.meta.env?.DEV) {
    console.warn(`[RTEditor i18n] Unknown locale: "${locale}". Available: ${Object.keys(locales).join(', ')}`)
  }
}

/**
 * Register a new locale or override existing translations.
 */
export function registerLocale(locale: string, messages: TranslationMessages) {
  locales[locale] = { ...(locales[locale] || {}), ...messages }
}

/**
 * Get the current locale value.
 */
export function getLocale(): string {
  return currentLocale.value
}

export { currentLocale }

