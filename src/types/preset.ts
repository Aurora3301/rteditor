import type { Extensions } from '@tiptap/core'
import type { ToolbarConfig } from './editor'

export interface EditorPreset {
  extensions: Extensions
  toolbar: ToolbarConfig
  menuBar?: MenuBarConfig
  bubbleMenu?: BubbleMenuConfig
  theme?: ThemeConfig
  placeholder?: string
  editorProps?: Record<string, unknown>
}

export interface MenuBarConfig {
  enabled: boolean
  items?: string[]
}

export interface BubbleMenuConfig {
  enabled: boolean
  items?: string[]
}

export interface ThemeConfig {
  name: string
  cssFile?: string
  variables?: Record<string, string>
}

