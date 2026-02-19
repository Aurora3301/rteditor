<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { UploadHandler, UploadResult, FileSizeLimits } from '../types'
import {
  getFileCategory,
  DEFAULT_FILE_SIZE_LIMITS,
} from '../types'

const props = defineProps<{
  editor: Editor | null
  uploadHandler?: UploadHandler
  fileSizeLimits?: Partial<FileSizeLimits>
}>()

const emit = defineEmits<{
  'upload-start': [file: File]
  'upload-success': [result: UploadResult]
  'upload-error': [error: string]
}>()

const isUploading = ref(false)
const isDragging = ref(false)

function getFileSizeLimits(): FileSizeLimits {
  return { ...DEFAULT_FILE_SIZE_LIMITS, ...props.fileSizeLimits }
}

function validateFile(file: File): string | null {
  const category = getFileCategory(file.type)
  if (!category) return `Unsupported file type: ${file.type}`
  const limits = getFileSizeLimits()
  const limit = limits[category]
  if (file.size > limit) {
    const limitMB = (limit / (1024 * 1024)).toFixed(0)
    return `File too large (max ${limitMB} MB for ${category})`
  }
  return null
}

async function handleFile(file: File) {
  if (!props.editor) return

  // Always get the current uploadHandler from props (reactive)
  const handler = props.uploadHandler
  if (!handler) {
    emit('upload-error', 'No upload handler configured')
    return
  }

  const validationError = validateFile(file)
  if (validationError) {
    emit('upload-error', validationError)
    return
  }

  emit('upload-start', file)
  isUploading.value = true

  try {
    const result = await handler(file)
    if (result) {
      // Insert the image into the editor
      props.editor
        .chain()
        .focus()
        .setImage({ src: result.url, alt: result.alt || '', title: result.title || '' })
        .run()
      emit('upload-success', result)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    emit('upload-error', message)
  } finally {
    isUploading.value = false
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files?.length) {
    handleFile(files[0])
  }
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        e.preventDefault()
        handleFile(file)
        return
      }
    }
  }
}

// Expose for parent component to trigger programmatically
function triggerUpload(file: File) {
  handleFile(file)
}

defineExpose({ triggerUpload, handleDrop, handlePaste, isUploading })
</script>

<template>
  <!-- This is a utility component — no visible UI in the editor.
       It handles drag/drop/paste events and processes files. -->
  <div
    v-if="isDragging"
    class="rte-upload-dropzone"
    data-testid="rte-upload-dropzone"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <p>Drop image here</p>
  </div>
</template>
