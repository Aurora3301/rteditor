import { ref } from 'vue'
import type { UploadHandler, UploadResult, FileSizeLimits } from '../types'
import {
  getFileCategory,
  DEFAULT_FILE_SIZE_LIMITS,
  IMAGE_MIME_TYPES,
  PDF_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
} from '../types'

export function useUpload(handler?: UploadHandler, limits?: Partial<FileSizeLimits>) {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)
  const fileSizeLimits: FileSizeLimits = { ...DEFAULT_FILE_SIZE_LIMITS, ...limits }

  const allAllowedTypes = [
    ...IMAGE_MIME_TYPES,
    ...PDF_MIME_TYPES,
    ...DOCUMENT_MIME_TYPES,
  ]

  function validateFile(file: File): string | null {
    const category = getFileCategory(file.type)
    if (!category) return `Unsupported file type: ${file.type}`
    const limit = fileSizeLimits[category]
    if (file.size > limit) {
      const limitMB = (limit / (1024 * 1024)).toFixed(0)
      return `File too large (max ${limitMB} MB for ${category})`
    }
    return null
  }

  async function upload(file: File): Promise<UploadResult | null> {
    if (!handler) {
      uploadError.value = 'No upload handler configured'
      return null
    }
    const validationError = validateFile(file)
    if (validationError) {
      uploadError.value = validationError
      return null
    }
    isUploading.value = true
    uploadError.value = null
    try {
      const result = await handler(file)
      return result
    } catch (err) {
      uploadError.value = err instanceof Error ? err.message : 'Upload failed'
      return null
    } finally {
      isUploading.value = false
    }
  }

  return { upload, isUploading, uploadError, validateFile, allAllowedTypes }
}
