<script setup lang="ts">
import { ref, watch, provide, onMounted, onBeforeUnmount, computed, nextTick, shallowRef } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import type { Extensions, JSONContent } from '@tiptap/core'
import type { EditorPreset, ToolbarConfig, UploadHandler, FileSizeLimits, ThemeConfig, UploadResult } from '../types'
import type { AIHandler, AIOptions, AIQuickAction } from '../types/ai'
import { useTheme } from '../composables/useTheme'
import { useVoiceToText } from '../composables/useVoiceToText'
import { useMobileDetect } from '../composables/useMobileDetect'
import { useAI } from '../composables/useAI'
import { basePreset as defaultPreset } from '../presets'
import { getAIPanelPosition } from '../utils/aiPanelPosition'
import { exportHTML } from '../utils/exportHTML'
import { exportJSON } from '../utils/exportJSON'
import { exportMarkdown } from '../utils/exportMarkdown'
import { exportDocx } from '../utils/exportDocx'
import { exportPDF } from '../utils/exportPDF'
import RTToolbar from './RTToolbar.vue'
import RTBubbleMenu from './RTBubbleMenu.vue'
import RTLinkDialog from './RTLinkDialog.vue'
import RTToast from './RTToast.vue'
import RTImageUpload from './RTImageUpload.vue'
import RTEmojiPicker from './RTEmojiPicker.vue'
import RTColorPicker from './RTColorPicker.vue'
import RTFormulaEditor from './RTFormulaEditor.vue'
import RTWordCountPopover from './RTWordCountPopover.vue'
import RTStampPicker from './RTStampPicker.vue'
import RTAIPanel from './RTAIPanel.vue'
import RTCommentBubble from './RTCommentBubble.vue'
import RTCommentSidebar from './RTCommentSidebar.vue'
import type { Stamp } from '../extensions/StampExtension'
import type { Comment, CommentThread, CommentStore } from '../types/comment'
import { AIKeyboardShortcut } from '../extensions/AIKeyboardShortcut'
import '../themes/default.css'
import '../themes/dark.css'
import '../themes/code.css'

// Props
const props = withDefaults(
  defineProps<{
    modelValue?: string
    preset?: EditorPreset
    extensions?: Extensions
    toolbar?: ToolbarConfig
    placeholder?: string
    readonly?: boolean
    uploadHandler?: UploadHandler
    fileSizeLimits?: Partial<FileSizeLimits>
    editable?: boolean
    autofocus?: boolean
    theme?: ThemeConfig
    aiHandler?: AIHandler
    aiOptions?: Partial<AIOptions>
    currentUserId?: string
    currentUserRole?: 'teacher' | 'student'
    currentUserName?: string
  }>(),
  {
    modelValue: '',
    editable: true,
    autofocus: false,
    readonly: false,
    currentUserId: 'user-1',
    currentUserRole: 'teacher',
    currentUserName: 'User',
  },
)

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:json': [value: JSONContent]
  'focus': []
  'blur': []
  'create': [editor: Editor]
  'destroy': []
  'error': [error: Error]
}>()

// Theme
const { currentTheme, isDark, applyTheme, setTheme } = useTheme()
if (props.theme?.name) {
  setTheme(props.theme.name)
}

// Mobile detection
const { isMobile, isTouch, isKeyboardOpen } = useMobileDetect()

// Editor state — shallowRef preserves class type through Vue reactivity
const editor = shallowRef<Editor | null>(null)
const isReady = ref(false)

// UI state
const isFullscreen = ref(false)
const isSidebarOpen = ref(false)
const linkDialogOpen = ref(false)
const linkDialogInitialUrl = ref('')
const emojiPickerOpen = ref(false)
const colorPickerOpen = ref(false)
const formulaEditorOpen = ref(false)
const wordCountOpen = ref(false)
const stampPickerOpen = ref(false)

// Template refs for click-outside handling
const emojiPickerRef = ref<HTMLElement | null>(null)
const colorPickerRef = ref<HTMLElement | null>(null)
const formulaEditorRef = ref<HTMLElement | null>(null)
const wordCountRef = ref<HTMLElement | null>(null)
const stampPickerRef = ref<HTMLElement | null>(null)
const aiPanelRef = ref<HTMLElement | null>(null)
const commentBubbleRef = ref<InstanceType<typeof RTCommentBubble> | null>(null)

// Reactive CommentStore
const commentStoreComments = ref<Map<string, Comment>>(new Map())
const commentStoreThreads = ref<Map<string, CommentThread>>(new Map())

const commentStore: CommentStore = {
  get comments() { return commentStoreComments.value },
  get threads() { return commentStoreThreads.value },
  addComment(comment: Comment) {
    commentStoreComments.value.set(comment.id, comment)
    if (!comment.parentId) {
      // Root comment — create a new thread keyed by comment.id
      commentStoreThreads.value.set(comment.id, {
        rootComment: comment,
        replies: [],
        isResolved: false,
        participantCount: 1,
      })
    } else {
      // Reply — add to existing thread
      const thread = commentStoreThreads.value.get(comment.parentId)
      if (thread) {
        thread.replies.push(comment)
        // Count unique participants
        const participants = new Set([thread.rootComment.authorId, ...thread.replies.map(r => r.authorId)])
        thread.participantCount = participants.size
      }
    }
    // Trigger reactivity
    commentStoreComments.value = new Map(commentStoreComments.value)
    commentStoreThreads.value = new Map(commentStoreThreads.value)
  },
  getComment(id: string) {
    return commentStoreComments.value.get(id)
  },
  getThread(id: string) {
    return commentStoreThreads.value.get(id)
  },
  resolveComment(id: string, resolvedBy: string) {
    const thread = commentStoreThreads.value.get(id)
    if (thread) {
      thread.isResolved = !thread.isResolved
      thread.rootComment.resolvedAt = thread.isResolved ? new Date() : undefined
      thread.rootComment.resolvedBy = thread.isResolved ? resolvedBy : undefined
      commentStoreThreads.value = new Map(commentStoreThreads.value)
    }
  },
  deleteComment(id: string) {
    // If it's a root comment, remove the whole thread
    if (commentStoreThreads.value.has(id)) {
      const thread = commentStoreThreads.value.get(id)!
      // Remove all replies
      thread.replies.forEach(r => commentStoreComments.value.delete(r.id))
      commentStoreComments.value.delete(id)
      commentStoreThreads.value.delete(id)
    } else {
      // It's a reply — find and remove from thread
      commentStoreComments.value.delete(id)
      commentStoreThreads.value.forEach(thread => {
        thread.replies = thread.replies.filter(r => r.id !== id)
      })
    }
    commentStoreComments.value = new Map(commentStoreComments.value)
    commentStoreThreads.value = new Map(commentStoreThreads.value)
  },
  getAllComments() {
    return Array.from(commentStoreComments.value.values())
  },
}

// Toasts
interface ToastItem {
  id: number
  message: string
  type: 'error' | 'success' | 'info'
}

let toastId = 0
const toasts = ref<ToastItem[]>([])

function addToast(message: string, type: 'error' | 'success' | 'info' = 'info') {
  const id = ++toastId
  toasts.value.push({ id, message, type })
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

// Computed preset config
const activePreset = computed(() => props.preset || defaultPreset)
const toolbarConfig = computed(() => props.toolbar || activePreset.value.toolbar)

// AI state
const aiEnabled = computed(() => !!props.aiHandler)
const aiPanelPosition = ref<{ top: number; left: number }>({ top: 0, left: 0 })

const {
  state: aiState,
  open: aiOpen,
  close: aiClose,
  submit: aiSubmit,
  accept: aiAccept,
  acceptAndEdit: aiAcceptAndEdit,
  reject: aiReject,
  retry: aiRetry,
} = useAI({
  editor,
  handler: props.aiHandler,
  options: props.aiOptions,
})

function handleAIOpen() {
  if (!aiEnabled.value || !editor.value) return
  aiPanelPosition.value = getAIPanelPosition(editor.value)
  aiOpen()
}

function handleAISubmit(prompt: string, action?: AIQuickAction) {
  aiSubmit(prompt, action)
}

// Build editor extensions with AI shortcut if AI is enabled
const editorExtensions = computed(() => {
  const base = props.extensions || activePreset.value.extensions
  if (aiEnabled.value) {
    return [
      ...base,
      AIKeyboardShortcut.configure({
        onTrigger: () => handleAIOpen(),
      }),
    ]
  }
  return base
})

// Image upload ref
const imageUploadRef = ref<InstanceType<typeof RTImageUpload> | null>(null)

// Internal flag to prevent update loops
let isUpdatingFromProp = false

// Create editor on mount
onMounted(() => {
  try {
    const editorInstance = new Editor({
      extensions: editorExtensions.value,
      content: props.modelValue || '',
      editable: props.editable && !props.readonly,
      autofocus: props.autofocus,
      onUpdate: ({ editor: ed }) => {
        if (!isUpdatingFromProp) {
          emit('update:modelValue', ed.getHTML())
          emit('update:json', ed.getJSON())
        }
      },
      onCreate: ({ editor: ed }) => {
        isReady.value = true
        // TipTap callbacks type `ed` as core Editor, but it's actually the Vue Editor instance
        emit('create', ed as unknown as Editor)
      },
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
      onDestroy: () => {
        isReady.value = false
        emit('destroy')
      },
    })

    editor.value = editorInstance

    // Apply theme if provided
    if (props.theme?.variables) {
      nextTick(() => {
        const el = document.querySelector('.rte-editor') as HTMLElement | null
        if (el) applyTheme(el, props.theme!.variables!)
      })
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('[RTEditor] Failed to initialize editor:', error)
    emit('error', error)
    addToast(`Editor failed to initialize: ${error.message}`, 'error')
    // editor.value remains null, isReady remains false — safe degraded state
  }
})

// Cleanup
onBeforeUnmount(() => {
  editor.value?.destroy()
  editor.value = null
})

// Watch modelValue for external updates
watch(
  () => props.modelValue,
  (newValue) => {
    if (!editor.value) return
    const currentHTML = editor.value.getHTML()
    if (newValue !== currentHTML) {
      isUpdatingFromProp = true
      editor.value.commands.setContent(newValue || '')
      isUpdatingFromProp = false
    }
  },
)

// Watch editable/readonly
watch(
  () => [props.editable, props.readonly],
  () => {
    editor.value?.setEditable(props.editable && !props.readonly)
  },
)

// Provide editor for child components
provide('editor', editor)
provide('addToast', addToast)

// Fullscreen keyboard handler
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
  if ((e.key === 'F11' || (e.key === 'f' && (e.ctrlKey || e.metaKey) && e.shiftKey))) {
    e.preventDefault()
    isFullscreen.value = !isFullscreen.value
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutsidePopovers, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutsidePopovers, true)
})

// Click-outside handler for all popovers
function handleClickOutsidePopovers(event: MouseEvent) {
  const target = event.target as Node
  if (emojiPickerOpen.value && emojiPickerRef.value && !emojiPickerRef.value.contains(target)) {
    emojiPickerOpen.value = false
  }
  if (colorPickerOpen.value && colorPickerRef.value && !colorPickerRef.value.contains(target)) {
    colorPickerOpen.value = false
  }
  if (formulaEditorOpen.value && formulaEditorRef.value && !formulaEditorRef.value.contains(target)) {
    formulaEditorOpen.value = false
  }
  if (wordCountOpen.value && wordCountRef.value && !wordCountRef.value.contains(target)) {
    wordCountOpen.value = false
  }
  if (stampPickerOpen.value && stampPickerRef.value && !stampPickerRef.value.contains(target)) {
    stampPickerOpen.value = false
  }
  if (aiState.isOpen && aiPanelRef.value && !aiPanelRef.value.contains(target)) {
    aiClose()
  }
}

// Handle link dialog open from toolbar/bubble
function openLinkDialog() {
  if (!editor.value) return
  // If cursor is on a link, pre-fill URL
  const attrs = editor.value.getAttributes('link')
  linkDialogInitialUrl.value = attrs?.href || ''
  linkDialogOpen.value = true
}

// Handle image upload from toolbar
function handleImageUpload(file: File) {
  imageUploadRef.value?.triggerUpload(file)
}

function handleUploadError(error: string) {
  addToast(error, 'error')
}

function handleUploadSuccess(_result: UploadResult) {
  addToast('Image uploaded successfully', 'success')
}

// Phase 2 handlers
function handleEmojiSelect(emoji: string) {
  if (editor.value) {
    editor.value.chain().focus().insertContent(emoji).run()
  }
  emojiPickerOpen.value = false
}

function handleTextColorSelect(color: string | null) {
  if (!editor.value) return
  if (color) {
    editor.value.chain().focus().setColor(color).run()
  } else {
    editor.value.chain().focus().unsetColor().run()
  }
}

function handleHighlightColorSelect(color: string | null) {
  if (!editor.value) return
  if (color) {
    editor.value.chain().focus().toggleHighlight({ color }).run()
  } else {
    editor.value.chain().focus().unsetHighlight().run()
  }
}

function handleFormulaInsert(payload: { latex: string; display: boolean }) {
  if (!editor.value) return
  editor.value.chain().focus().insertContent({
    type: 'math',
    attrs: { latex: payload.latex, display: payload.display },
  }).run()
  formulaEditorOpen.value = false
}

// Phase 3: Stamp handlers
function handleStampSelect(stamp: Stamp) {
  if (!editor.value) return
  const { selection } = editor.value.state
  if (selection.empty) {
    addToast('Select text to apply a stamp', 'info')
    return
  }
  editor.value.chain().focus().setStamp(stamp).run()
  stampPickerOpen.value = false
}

function handleStampRemove() {
  if (!editor.value) return
  editor.value.chain().focus().removeStamp().run()
  stampPickerOpen.value = false
}

// Fullscreen body scroll lock
watch(isFullscreen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Word count stats
const wordCountStats = computed(() => {
  if (!editor.value) return { words: 0, characters: 0, charactersWithSpaces: 0, sentences: 0, readingTime: 0 }
  const storage = (editor.value.storage as Record<string, any>)?.wordCount
  if (storage) {
    return {
      words: storage.words ?? 0,
      characters: storage.characters ?? 0,
      charactersWithSpaces: storage.charactersWithSpaces ?? 0,
      sentences: storage.sentences ?? 0,
      readingTime: storage.readingTime ?? 0,
    }
  }
  return { words: 0, characters: 0, charactersWithSpaces: 0, sentences: 0, readingTime: 0 }
})

// Comment handler
function handleAddComment() {
  if (!editor.value) return
  const { selection } = editor.value.state
  if (selection.empty) {
    addToast('Select text to add a comment', 'info')
    return
  }

  // Prompt user for comment text
  const commentText = window.prompt('Add a comment:')
  if (!commentText || !commentText.trim()) return

  const commentId = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const threadId = commentId // thread is keyed by root comment ID

  // Get highlighted text from selection
  const { from, to } = selection
  const highlightedText = editor.value.state.doc.textBetween(from, to, ' ')

  // Create Comment object
  const comment: Comment = {
    id: commentId,
    documentId: 'doc-1',
    authorId: props.currentUserId,
    authorName: props.currentUserName,
    authorRole: props.currentUserRole,
    content: commentText.trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
    highlightRange: { from, to },
    highlightedText,
  }

  // Add comment mark to editor
  editor.value.chain().focus().addComment({ commentId, threadId }).run()

  // Add to store
  commentStore.addComment(comment)

  isSidebarOpen.value = true
}

// Comment event handlers
function handleCommentReply(payload: { threadId: string; content: string; attachments?: File[] }) {
  const replyId = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const thread = commentStore.getThread(payload.threadId)
  if (!thread) return

  const reply: Comment = {
    id: replyId,
    documentId: 'doc-1',
    authorId: props.currentUserId,
    authorName: props.currentUserName,
    authorRole: props.currentUserRole,
    content: payload.content,
    createdAt: new Date(),
    updatedAt: new Date(),
    parentId: payload.threadId,
    highlightRange: thread.rootComment.highlightRange,
    highlightedText: thread.rootComment.highlightedText,
  }

  commentStore.addComment(reply)
}

function handleCommentResolve(commentId: string) {
  commentStore.resolveComment(commentId, props.currentUserId)
}

function handleCommentDelete(commentId: string) {
  commentStore.deleteComment(commentId)
  // Also remove the comment mark from the editor if it's a root comment
  if (editor.value) {
    try {
      editor.value.chain().focus().removeComment(commentId).run()
    } catch {
      // Comment mark might already be removed
    }
  }
}

function handleScrollToComment(commentId: string) {
  if (!editor.value) return
  const { doc } = editor.value.state
  doc.descendants((node: any, pos: number) => {
    node.marks?.forEach((mark: any) => {
      if (mark.type.name === 'comment' && (mark.attrs.commentId === commentId || mark.attrs.threadId === commentId)) {
        try {
          const domNode = editor.value!.view.domAtPos(pos)
          const el = domNode.node instanceof HTMLElement ? domNode.node : (domNode.node as any).parentElement
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            const commentEl = el.closest?.('[data-comment-id]') || el
            commentEl.classList?.add('rte-comment-highlight--active')
            setTimeout(() => {
              commentEl.classList?.remove('rte-comment-highlight--active')
            }, 1500)
          }
        } catch {
          // Ignore scroll errors
        }
      }
    })
  })
}

// File attachment handler
function getFileType(file: File): 'pdf' | 'word' | 'excel' | 'powerpoint' | 'unknown' {
  const mime = file.type.toLowerCase()
  if (mime === 'application/pdf') return 'pdf'
  if (mime.includes('word') || mime.includes('document')) return 'word'
  if (mime.includes('spreadsheet') || mime.includes('excel')) return 'excel'
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'powerpoint'
  return 'unknown'
}

async function handleFileAttachment(file: File) {
  if (!editor.value) return
  if (!props.uploadHandler) {
    addToast('No upload handler configured for file attachments', 'error')
    return
  }
  try {
    const result = await props.uploadHandler(file)
    if (result) {
      editor.value.chain().focus().insertFileAttachment({
        url: result.url,
        filename: result.filename || file.name,
        filesize: result.filesize || file.size,
        filetype: getFileType(file),
      }).run()
      addToast('File attached successfully', 'success')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'File upload failed'
    addToast(message, 'error')
  }
}

// Image and file upload handlers are now called directly via @image-upload and @file-upload events from RTToolbar

// Save / Download handler
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function handleSaveDownload(format: string) {
  if (!editor.value) return
  try {
    const timestamp = new Date().toISOString().slice(0, 10)
    const baseName = `document-${timestamp}`

    switch (format) {
      case 'html': {
        const html = exportHTML(editor.value)
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        triggerBlobDownload(blob, `${baseName}.html`)
        break
      }
      case 'json': {
        const json = exportJSON(editor.value)
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json;charset=utf-8' })
        triggerBlobDownload(blob, `${baseName}.json`)
        break
      }
      case 'markdown': {
        const json = exportJSON(editor.value)
        const md = exportMarkdown(json)
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
        triggerBlobDownload(blob, `${baseName}.md`)
        break
      }
      case 'docx': {
        const html = exportHTML(editor.value)
        const blob = await exportDocx(html, { title: baseName })
        triggerBlobDownload(blob, `${baseName}.docx`)
        break
      }
      case 'pdf': {
        const html = exportHTML(editor.value)
        exportPDF(html, { title: baseName })
        break
      }
      case 'txt': {
        const text = editor.value.getText()
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
        triggerBlobDownload(blob, `${baseName}.txt`)
        break
      }
      default:
        addToast(`Unknown format: ${format}`, 'error')
        return
    }
    addToast(`Downloaded as ${format.toUpperCase()}`, 'success')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Download failed'
    addToast(message, 'error')
  }
}

// Voice-to-text
const {
  isSupported: voiceSupported,
  isListening: voiceListening,
  error: voiceError,
  start: voiceStart,
  stop: voiceStop,
} = useVoiceToText({
  onResult: (text, isFinal) => {
    if (isFinal && editor.value) {
      editor.value.chain().focus().insertContent(text).run()
    }
  },
  onError: (errMsg) => {
    addToast(errMsg, 'error')
  },
})

function handleToggleVoice() {
  if (voiceListening.value) {
    voiceStop()
  } else {
    voiceStart()
  }
}

// Expose editor for parent components
defineExpose({ editor, isReady, addToast })
</script>

<template>
  <div
    class="rte-editor"
    :class="{
      'rte-editor--readonly': readonly,
      'rte-editor--fullscreen': isFullscreen,
      'rte-editor--sidebar-open': isSidebarOpen,
      'rte-editor--dark': isDark,
      'rte-keyboard-open': isKeyboardOpen,
      'rte-mobile': isMobile,
      'rte-touch': isTouch,
    }"
    role="application"
    aria-label="Rich text editor"
    data-testid="rte-editor"
  >
    <RTToolbar
      v-if="!readonly"
      :editor="editor"
      :toolbar="toolbarConfig"
      @toggle-fullscreen="isFullscreen = !isFullscreen"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      @open-link-dialog="openLinkDialog"
      @open-emoji-picker="emojiPickerOpen = !emojiPickerOpen"
      @open-color-picker="colorPickerOpen = !colorPickerOpen"
      @open-formula-editor="formulaEditorOpen = true"
      @toggle-word-count="wordCountOpen = !wordCountOpen"
      @add-comment="handleAddComment"
      @toggle-voice="handleToggleVoice"
      @open-stamp-picker="stampPickerOpen = !stampPickerOpen"
      @image-upload="handleImageUpload"
      @file-upload="handleFileAttachment"
      @ai:open="handleAIOpen"
      @save:download="handleSaveDownload"
    />

    <div class="rte-body">
      <EditorContent
        v-if="editor"
        :editor="editor"
        class="rte-content"
        @drop.prevent="imageUploadRef?.handleDrop($event)"
        @paste="imageUploadRef?.handlePaste($event)"
      />
      <aside v-if="isSidebarOpen" class="rte-sidebar">
        <RTCommentSidebar
          :editor="editor"
          :comments="commentStore"
          :current-user-id="currentUserId"
          :current-user-role="currentUserRole"
          :is-open="isSidebarOpen"
          @close="isSidebarOpen = false"
          @scroll-to-comment="handleScrollToComment"
          @resolve="handleCommentResolve"
          @delete="handleCommentDelete"
        />
        <slot name="sidebar" />
      </aside>
    </div>

    <!-- Comment Bubble (appears when clicking on highlighted comment text) -->
    <RTCommentBubble
      ref="commentBubbleRef"
      :editor="editor"
      :comments="commentStore"
      :current-user-id="currentUserId"
      :current-user-role="currentUserRole"
      @reply="handleCommentReply"
      @resolve="handleCommentResolve"
      @delete="handleCommentDelete"
      @close="() => {}"
    />

    <RTBubbleMenu
      v-if="!readonly"
      :editor="editor"
      @open-link-dialog="openLinkDialog"
      @ai:transform="handleAIOpen"
    />

    <RTLinkDialog
      :editor="editor"
      :is-open="linkDialogOpen"
      :initial-url="linkDialogInitialUrl"
      @close="linkDialogOpen = false"
    />

    <RTImageUpload
      ref="imageUploadRef"
      :editor="editor"
      :upload-handler="uploadHandler"
      :file-size-limits="fileSizeLimits"
      @upload-error="handleUploadError"
      @upload-success="handleUploadSuccess"
    />

    <!-- Phase 2: Emoji Picker -->
    <div v-if="emojiPickerOpen" ref="emojiPickerRef">
      <RTEmojiPicker
        :on-select="handleEmojiSelect"
        @close="emojiPickerOpen = false"
      />
    </div>

    <!-- Phase 2: Color Picker -->
    <div v-if="colorPickerOpen" ref="colorPickerRef">
      <RTColorPicker
        @select-text-color="handleTextColorSelect"
        @select-highlight-color="handleHighlightColorSelect"
        @close="colorPickerOpen = false"
      />
    </div>

    <!-- Phase 2: Formula Editor -->
    <div v-if="formulaEditorOpen" ref="formulaEditorRef">
      <RTFormulaEditor
        @insert="handleFormulaInsert"
        @cancel="formulaEditorOpen = false"
      />
    </div>

    <!-- Phase 2: Word Count Popover -->
    <div ref="wordCountRef">
      <RTWordCountPopover
        :is-open="wordCountOpen"
        :stats="wordCountStats"
      />
    </div>

    <!-- Phase 3: Stamp Picker -->
    <div v-if="stampPickerOpen" ref="stampPickerRef">
      <RTStampPicker
        @select-stamp="handleStampSelect"
        @remove-stamp="handleStampRemove"
        @close="stampPickerOpen = false"
      />
    </div>

    <!-- Phase 4: AI Panel -->
    <div v-if="aiEnabled" ref="aiPanelRef">
      <RTAIPanel
        :state="aiState"
        :position="aiPanelPosition"
        :quick-actions="aiOptions?.quickActions"
        @submit="handleAISubmit"
        @accept="aiAccept"
        @accept-and-edit="aiAcceptAndEdit"
        @reject="aiReject"
        @retry="aiRetry"
        @close="aiClose"
      />
    </div>

    <div class="rte-toast-container" aria-live="polite">
      <RTToast
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        @dismiss="removeToast(toast.id)"
      />
    </div>
  </div>
</template>

