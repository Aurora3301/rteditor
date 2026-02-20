import type { Editor, Extensions } from '@tiptap/core'

export type { TagsExtensionOptions, TagsStorage } from '../extensions/TagsExtension'

export type ToolbarItem =
  | 'bold' | 'italic' | 'underline' | 'strike'
  | 'subscript' | 'superscript'
  | 'heading' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'bulletList' | 'orderedList'
  | 'link' | 'image' | 'attachFile'
  | 'math' | 'formula'
  | 'alignLeft' | 'alignCenter' | 'alignRight'
  | 'horizontalRule'
  | 'undo' | 'redo'
  | 'fullscreen'
  | 'wordCount'
  | 'commentSidebar'
  | 'highlight' | 'textColor'
  | 'emoji'
  | 'codeBlock'
  | 'checklist'
  | 'table'
  | 'comment'
  | 'textSize'
  | 'voiceToText'
  | 'stamp'
  | 'ai'
  | 'save'
  | 'clearFormatting'
  | '|'

export type ToolbarConfig = ToolbarItem[]

export interface RTEditorProps {
  modelValue?: string
  preset?: import('./preset').EditorPreset
  extensions?: Extensions
  toolbar?: ToolbarConfig
  placeholder?: string
  readonly?: boolean
  locale?: string
  uploadHandler?: import('./upload').UploadHandler
  editable?: boolean
  autofocus?: boolean
}

export interface RTEditorEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:json', value: Record<string, unknown>): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'create', editor: Editor): void
  (e: 'destroy'): void
  (e: 'error', error: Error): void
}

