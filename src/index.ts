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
export { default as RTVoiceButton } from './components/RTVoiceButton.vue'
export { default as RTTagInput } from './components/RTTagInput.vue'
export { default as RTStampPicker } from './components/RTStampPicker.vue'
export { default as RTAIPanel } from './components/RTAIPanel.vue'
export { default as RTResizableImage } from './components/RTResizableImage.vue'

// Presets
export { basePreset, teacherPreset, studentPreset, defaultLessonPlanTemplates, buildLessonPlanHTML } from './presets'
export type { LessonPlanTemplate, LessonPlanSection } from './presets'

// Composables
export { useEditor, useAutoSave, useUpload, useTheme, useI18n, useVoiceToText, useMobileDetect, useAI } from './composables'
export type { UseEditorOptions, UseEditorReturn, ThemeMode } from './composables'
export type { UseAutoSaveOptions, UseAutoSaveReturn, AutoSaveStatus } from './composables'
export type { TranslationMessages, VoiceToTextOptions } from './composables'
export type { UseAIOptions, UseAIReturn } from './composables'

// i18n
export { t, setLocale, registerLocale, getLocale } from './i18n'

// Extensions
export { ChecklistExtension, MathExtension, ImageUploadExtension, CodeSnippetExtension, SUPPORTED_LANGUAGES, lowlightInstance, WordCountExtension, countWords, HighlightExtension, DEFAULT_TEXT_COLORS, DEFAULT_HIGHLIGHT_COLORS, FileAttachmentExtension, CommentExtension, SlashCommandExtension, defaultSlashCommands, TagsExtension, StampExtension, DEFAULT_STAMPS, VoiceToTextExtension, DragHandleExtension, CollaborationExtension, CollaborationCursorExtension, AIKeyboardShortcut, ResizableImageExtension } from './extensions'
export type { ChecklistExtensionOptions, MathExtensionOptions, ImageUploadOptions, CodeSnippetOptions, SupportedLanguage, WordCountExtensionOptions, WordCountStorage, HighlightExtensionOptions, FileAttachmentOptions, FileAttachmentType, CommentExtensionOptions, SlashCommandOptions, SlashCommand, TagsExtensionOptions, TagsStorage, StampExtensionOptions, Stamp, VoiceToTextExtensionOptions, DragHandleOptions, CollaborationExtensionOptions, CollaborationCursorOptions, AIKeyboardShortcutOptions, ResizableImageOptions } from './extensions'

// Utilities
export { sanitizeHTML, stripAllHTML, getAIPanelPosition } from './utils'
export { announceToScreenReader, trapFocus, getShortcutLabel } from './utils'
export type { AIPanelPosition } from './utils'
export { exportHTML, exportRawHTML } from './utils'
export { exportJSON, validateJSON } from './utils'
export { exportPDF, downloadPDF } from './utils'
export type { ExportPDFOptions } from './utils'
export { exportMarkdown, htmlToMarkdown } from './utils'
export type { ExportMarkdownOptions } from './utils'
export { importCKEditorHTML, exportForLegacy } from './utils'
export type { ImportCKEditorOptions } from './utils'
export { safeLoadExtensions } from './utils'
export { printContent } from './utils'
export type { PrintOptions } from './utils'

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
  CollaborationUser,
  CollaborationOptions,
  AIQuickAction,
  AIContextLevel,
  AIMetadata,
  AIRequest,
  AIResponse,
  AIHandler,
  AIOptions,
  AIState,
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
export { validateFile, uploadWithProgress } from './upload-handlers'
export type { UploadProgress, BaseUploadOptions, UploadValidationError } from './upload-handlers'
export { createS3UploadHandler } from './upload-handlers'
export type { S3UploadOptions } from './upload-handlers'
export { createCloudinaryUploadHandler } from './upload-handlers'
export type { CloudinaryUploadOptions } from './upload-handlers'
export { createLaravelUploadHandler } from './upload-handlers'
export type { LaravelUploadOptions } from './upload-handlers'
export { createDKIMediaHandler } from './upload-handlers'
export type { DKIUploadResultExtended, DKIMediaHandlerOptions, DKISaveAsFileResponse, DKIMediaConfig } from './upload-handlers'

// AI Handlers
export { createProxyAIHandler, createDKIAIHandler, createLlamaAIHandler } from './ai-handlers'
export type { ProxyAIHandlerOptions, DKIAIHandlerOptions, LlamaAIHandlerOptions } from './ai-handlers'
