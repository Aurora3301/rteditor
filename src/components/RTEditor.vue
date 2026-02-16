<script setup lang="ts">
import { ref, watch, provide, onMounted, onBeforeUnmount, computed, nextTick, shallowRef } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import type { Extensions, JSONContent } from '@tiptap/core'
import type { EditorPreset, ToolbarConfig, UploadHandler, FileSizeLimits, ThemeConfig, UploadResult } from '../types'
import { useTheme } from '../composables/useTheme'
import { basePreset as defaultPreset } from '../presets'
import RTToolbar from './RTToolbar.vue'
import RTBubbleMenu from './RTBubbleMenu.vue'
import RTLinkDialog from './RTLinkDialog.vue'
import RTToast from './RTToast.vue'
import RTImageUpload from './RTImageUpload.vue'
import RTEmojiPicker from './RTEmojiPicker.vue'
import RTColorPicker from './RTColorPicker.vue'
import RTFormulaEditor from './RTFormulaEditor.vue'
import RTWordCountPopover from './RTWordCountPopover.vue'
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
  }>(),
  {
    modelValue: '',
    editable: true,
    autofocus: false,
    readonly: false,
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
const editorExtensions = computed(() => props.extensions || activePreset.value.extensions)

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
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

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

// Listen for custom image upload event from toolbar
onMounted(() => {
  const editorEl = document.querySelector('.rte-editor')
  if (editorEl) {
    editorEl.addEventListener('rte-image-upload', ((e: CustomEvent) => {
      const file = e.detail?.file
      if (file) handleImageUpload(file)
    }) as EventListener)
  }
})

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
        <slot name="sidebar" />
      </aside>
    </div>

    <RTBubbleMenu
      v-if="!readonly"
      :editor="editor"
      @open-link-dialog="openLinkDialog"
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
    <RTEmojiPicker
      v-if="emojiPickerOpen"
      :on-select="handleEmojiSelect"
      @close="emojiPickerOpen = false"
    />

    <!-- Phase 2: Color Picker -->
    <RTColorPicker
      v-if="colorPickerOpen"
      @select-text-color="handleTextColorSelect"
      @select-highlight-color="handleHighlightColorSelect"
      @close="colorPickerOpen = false"
    />

    <!-- Phase 2: Formula Editor -->
    <RTFormulaEditor
      v-if="formulaEditorOpen"
      @insert="handleFormulaInsert"
      @cancel="formulaEditorOpen = false"
    />

    <!-- Phase 2: Word Count Popover -->
    <RTWordCountPopover
      :is-open="wordCountOpen"
      :stats="wordCountStats"
    />

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

