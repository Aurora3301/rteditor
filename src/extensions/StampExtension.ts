import { Mark, mergeAttributes } from '@tiptap/core'

export interface Stamp {
  id: string
  emoji: string
  label: string
  color: string
  category: 'praise' | 'encouragement' | 'correction' | 'custom'
}

export const DEFAULT_STAMPS: Stamp[] = [
  { id: 'great', emoji: '⭐', label: 'Great', color: '#FFD700', category: 'praise' },
  { id: 'excellent', emoji: '🌟', label: 'Excellent', color: '#FFA500', category: 'praise' },
  { id: 'good-effort', emoji: '💪', label: 'Good Effort', color: '#4CAF50', category: 'encouragement' },
  { id: 'keep-going', emoji: '🚀', label: 'Keep Going', color: '#2196F3', category: 'encouragement' },
  { id: 'needs-work', emoji: '📝', label: 'Needs Work', color: '#FF9800', category: 'correction' },
  { id: 'check-again', emoji: '🔍', label: 'Check Again', color: '#9C27B0', category: 'correction' },
  { id: 'thumbs-up', emoji: '👍', label: 'Thumbs Up', color: '#4CAF50', category: 'praise' },
  { id: 'love-it', emoji: '❤️', label: 'Love It', color: '#E91E63', category: 'praise' },
]

export interface StampExtensionOptions {
  /** Custom HTML attributes for stamp marks */
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    stamp: {
      /** Apply a stamp mark to the current selection */
      setStamp: (stamp: Stamp) => ReturnType
      /** Remove stamp marks from the current selection */
      removeStamp: () => ReturnType
    }
  }
}

export const StampExtension = Mark.create<StampExtensionOptions>({
  name: 'stamp',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      stampId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-stamp-id'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.stampId) return {}
          return { 'data-stamp-id': attributes.stampId }
        },
      },
      emoji: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-stamp-emoji'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.emoji) return {}
          return { 'data-stamp-emoji': attributes.emoji }
        },
      },
      label: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-stamp-label'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.label) return {}
          return { 'data-stamp-label': attributes.label }
        },
      },
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-stamp-color'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.color) return {}
          return {
            'data-stamp-color': attributes.color,
            style: `--stamp-color: ${attributes.color}`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-stamp-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { class: 'rte-stamp' },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ]
  },

  // Allow multiple overlapping stamps
  excludes: '',

  addCommands() {
    return {
      setStamp:
        (stamp: Stamp) =>
        ({ commands }) => {
          return commands.setMark(this.name, {
            stampId: stamp.id,
            emoji: stamp.emoji,
            label: stamp.label,
            color: stamp.color,
          })
        },

      removeStamp:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

