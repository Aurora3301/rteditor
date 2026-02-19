/**
 * Shared types for all upload handlers.
 */

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface BaseUploadOptions {
  /** Max file size in bytes. Default: 10MB */
  maxFileSize?: number
  /** Allowed MIME types. Supports wildcard like 'image/*'. */
  allowedTypes?: string[]
  /** Progress callback. Uses XHR internally for upload progress support. */
  onProgress?: (progress: UploadProgress) => void
}

export interface UploadValidationError extends Error {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED'
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Validate a file against size and type constraints.
 * Throws an UploadValidationError on failure.
 */
export function validateFile(file: File, options: BaseUploadOptions): void {
  const maxSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE

  if (file.size > maxSize) {
    const limitMB = (maxSize / (1024 * 1024)).toFixed(1)
    const error = new Error(`File too large: ${file.name} (max ${limitMB} MB)`) as UploadValidationError
    error.code = 'FILE_TOO_LARGE'
    throw error
  }

  if (options.allowedTypes?.length) {
    const isAllowed = options.allowedTypes.some((type) => {
      if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'))
      return file.type === type
    })
    if (!isAllowed) {
      const error = new Error(`File type not allowed: ${file.type}`) as UploadValidationError
      error.code = 'INVALID_TYPE'
      throw error
    }
  }
}

/**
 * Upload FormData using XHR with progress support.
 * Used internally by handlers that need upload progress tracking.
 */
export function uploadWithProgress<T>(
  url: string,
  method: 'POST' | 'PUT',
  body: FormData | File,
  headers: Record<string, string>,
  onProgress?: (progress: UploadProgress) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          })
        }
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as T)
        } catch {
          reject(createUploadError('Invalid JSON response from server'))
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText)
          reject(createUploadError(error.message ?? `Upload failed: ${xhr.status}`))
        } catch {
          reject(createUploadError(`Upload failed: ${xhr.status}`))
        }
      }
    }

    xhr.onerror = () => reject(createUploadError('Network error during upload'))
    xhr.send(body)
  })
}

function createUploadError(message: string): UploadValidationError {
  const error = new Error(message) as UploadValidationError
  error.code = 'UPLOAD_FAILED'
  return error
}

