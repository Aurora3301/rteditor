// @timothyphchan/rteditor - Main entry point
// Components
export { default as RTEditor } from './components/RTEditor.vue'
export { default as RTToolbar } from './components/RTToolbar.vue'
export { default as RTBubbleMenu } from './components/RTBubbleMenu.vue'
export { default as RTLinkDialog } from './components/RTLinkDialog.vue'
export { default as RTImageUpload } from './components/RTImageUpload.vue'
export { default as RTToast } from './components/RTToast.vue'
export { default as RTColorPicker } from './components/RTColorPicker.vue'
export { default as RTCodeBlock } from './components/RTCodeBlock.vue'
export { default as RTWordCountPopover } from './components/RTWordCountPopover.vue'
export { default as RTFormulaEditor } from './components/RTFormulaEditor.vue'
export { default as RTSlashCommandMenu } from './components/RTSlashCommandMenu.vue'
export { default as RTFileAttachment } from './components/RTFileAttachment.vue'
export { default as RTCommentBubble } from './components/RTCommentBubble.vue'
export { default as RTCommentSidebar } from './components/RTCommentSidebar.vue'

// Presets
export { basePreset } from './presets'

// Composables
export { useEditor, useAutoSave, useUpload, useTheme, useI18n } from './composables'
export type { UseEditorOptions, UseEditorReturn, ThemeMode } from './composables'
export type { UseAutoSaveOptions, UseAutoSaveReturn, AutoSaveStatus } from './composables'
export type { TranslationMessages } from './composables'

// i18n
export { t, setLocale, registerLocale, getLocale } from './i18n'

// Extensions
export { ChecklistExtension, MathExtension, ImageUploadExtension, CodeSnippetExtension, SUPPORTED_LANGUAGES, WordCountExtension, countWords, HighlightExtension, DEFAULT_TEXT_COLORS, DEFAULT_HIGHLIGHT_COLORS, FileAttachmentExtension, CommentExtension, SlashCommandExtension, defaultSlashCommands } from './extensions'
export type { ChecklistExtensionOptions, MathExtensionOptions, ImageUploadOptions, CodeSnippetOptions, SupportedLanguage, WordCountExtensionOptions, WordCountStorage, HighlightExtensionOptions, FileAttachmentOptions, FileAttachmentType, CommentExtensionOptions, SlashCommandOptions, SlashCommand } from './extensions'

// Utilities
export { sanitizeHTML, stripAllHTML } from './utils'
export { exportHTML, exportRawHTML } from './utils'
export { exportJSON, validateJSON } from './utils'
export { exportPDF, downloadPDF } from './utils'
export type { ExportPDFOptions } from './utils'
export { exportMarkdown, htmlToMarkdown } from './utils'
export type { ExportMarkdownOptions } from './utils'
export { importCKEditorHTML, exportForLegacy } from './utils'
export type { ImportCKEditorOptions } from './utils'
export { safeLoadExtensions } from './utils'

// Types
export type {
  RTEditorProps,
  RTEditorEmits,
  ToolbarItem,
  ToolbarConfig,
  EditorPreset,
  MenuBarConfig,
  BubbleMenuConfig,
  ThemeConfig,
  UploadHandler,
  UploadResult,
  FileCategory,
  FileSizeLimits,
  Comment,
  CommentThread,
  CommentStore,
} from './types'

// Constants
export {
  DEFAULT_FILE_SIZE_LIMITS,
  IMAGE_MIME_TYPES,
  PDF_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
  getFileCategory,
} from './types'

// Upload handlers
export { createDKIMediaHandler } from './upload-handlers'
export type { DKIUploadResultExtended, DKIMediaHandlerOptions, DKISaveAsFileResponse, DKIMediaConfig } from './upload-handlers'
