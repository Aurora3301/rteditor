import { ref, watch, onUnmounted, type Ref } from 'vue'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UseAutoSaveOptions {
  /** Content to watch for changes */
  content: Ref<string>
  /** Save function called on content change */
  onSave: (content: string) => Promise<void> | void
  /** Debounce delay in milliseconds. Default: 2000 */
  delay?: number
  /** Whether auto-save is enabled. Default: true */
  enabled?: boolean
  /** Callback on save error */
  onError?: (error: Error) => void
}

export interface UseAutoSaveReturn {
  /** Current auto-save status */
  status: Ref<AutoSaveStatus>
  /** Last saved timestamp */
  lastSaved: Ref<Date | null>
  /** Force an immediate save */
  saveNow: () => Promise<void>
  /** Enable/disable auto-save */
  setEnabled: (enabled: boolean) => void
  /** Whether auto-save is currently enabled */
  isEnabled: Ref<boolean>
}

export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn {
  const status = ref<AutoSaveStatus>('idle')
  const lastSaved = ref<Date | null>(null)
  const isEnabled = ref(options.enabled ?? true)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const delay = options.delay ?? 2000

  async function performSave(content: string) {
    if (status.value === 'saving') return
    status.value = 'saving'
    try {
      await options.onSave(content)
      status.value = 'saved'
      lastSaved.value = new Date()
      // Reset to idle after 2 seconds
      setTimeout(() => {
        if (status.value === 'saved') {
          status.value = 'idle'
        }
      }, 2000)
    } catch (err) {
      status.value = 'error'
      options.onError?.(err instanceof Error ? err : new Error(String(err)))
    }
  }

  const stopWatch = watch(
    () => options.content.value,
    (newContent) => {
      if (!isEnabled.value) return
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        performSave(newContent)
      }, delay)
    },
  )

  async function saveNow() {
    if (debounceTimer) clearTimeout(debounceTimer)
    await performSave(options.content.value)
  }

  function setEnabled(enabled: boolean) {
    isEnabled.value = enabled
    if (!enabled && debounceTimer) {
      clearTimeout(debounceTimer)
    }
  }

  onUnmounted(() => {
    stopWatch()
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return {
    status,
    lastSaved,
    saveNow,
    setEnabled,
    isEnabled,
  }
}
