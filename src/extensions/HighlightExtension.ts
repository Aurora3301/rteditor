import { Extension } from '@tiptap/core'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'

export const DEFAULT_TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
]

export const DEFAULT_HIGHLIGHT_COLORS = [
  '#fef3c7', '#fde68a', '#fcd34d',
  '#d1fae5', '#a7f3d0', '#6ee7b7',
  '#dbeafe', '#bfdbfe', '#93c5fd',
  '#fce7f3', '#fbcfe8', '#f9a8d4',
  '#e0e7ff', '#c7d2fe', '#a5b4fc',
  '#ffedd5', '#fed7aa', '#fdba74',
]

export interface HighlightExtensionOptions {
  /** Allow multiple highlight colors. Default: true */
  multicolor?: boolean
  /** Preset text foreground colors */
  textColors?: string[]
  /** Preset background/highlight colors */
  highlightColors?: string[]
}

export const HighlightExtension = Extension.create<HighlightExtensionOptions>({
  name: 'highlightExtension',

  addOptions() {
    return {
      multicolor: true,
      textColors: DEFAULT_TEXT_COLORS,
      highlightColors: DEFAULT_HIGHLIGHT_COLORS,
    }
  },

  addExtensions() {
    return [
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: this.options.multicolor ?? true,
      }),
    ]
  },
})

