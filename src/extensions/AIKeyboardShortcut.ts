import { Extension } from '@tiptap/core'

export interface AIKeyboardShortcutOptions {
  /** Callback when the AI shortcut is triggered */
  onTrigger?: () => void
}

/**
 * Registers Mod-k (Ctrl+K / Cmd+K) keyboard shortcut to open the AI panel.
 */
export const AIKeyboardShortcut = Extension.create<AIKeyboardShortcutOptions>({
  name: 'aiKeyboardShortcut',

  addOptions() {
    return {
      onTrigger: undefined,
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => {
        // Only trigger if there's no active link (Mod-k is also used for link in some editors)
        // Check if the editor has a link extension active - if cursor is on link, skip AI
        if (this.editor.isActive('link')) {
          return false
        }
        this.options.onTrigger?.()
        return true
      },
    }
  },
})

