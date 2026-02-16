export interface UploadHandler {
  (file: File): Promise<UploadResult>
}

export interface UploadResult {
  url: string
  alt?: string
  title?: string
  filename?: string
  filesize?: number
}

export type FileCategory = 'image' | 'pdf' | 'document'

export interface FileSizeLimits {
  image: number
  pdf: number
  document: number
}

export const DEFAULT_FILE_SIZE_LIMITS: FileSizeLimits = {
  image: 5 * 1024 * 1024,
  pdf: 1 * 1024 * 1024,
  document: 1 * 1024 * 1024,
}

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
export const PDF_MIME_TYPES = ['application/pdf'] as const
export const DOCUMENT_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const

export function getFileCategory(mimeType: string): FileCategory | null {
  if ((IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) return 'image'
  if ((PDF_MIME_TYPES as readonly string[]).includes(mimeType)) return 'pdf'
  if ((DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType)) return 'document'
  return null
}

