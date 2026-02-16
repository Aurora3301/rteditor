import type { UploadResult } from '../types/upload'
import type { DKIMediaHandlerOptions, DKISaveAsFileResponse } from './dki-types'

/**
 * Extended UploadResult with DKI-specific metadata.
 */
export interface DKIUploadResultExtended extends UploadResult {
  dkiMeta: {
    hashName: string
    storagePath: string
    extension: string
    fileType: string
    thumbnailUrl?: string
    thumbnailFileSize?: number
    resizedUrl?: string
    resizedFileSize?: number
  }
}

/**
 * Create an upload handler for DKI's saveAsFileToStorage() backend.
 */
export function createDKIMediaHandler(options: DKIMediaHandlerOptions): (file: File) => Promise<UploadResult> {
  const storageBaseUrl = (options.storageBaseUrl ?? '/storage/media').replace(/\/$/, '')
  const thumbnailBaseUrl = (options.thumbnailBaseUrl ?? storageBaseUrl).replace(/\/$/, '')

  return async (file: File): Promise<UploadResult> => {
    // 1. Client-side validation
    if (options.maxFileSize && file.size > options.maxFileSize) {
      const limitMB = (options.maxFileSize / (1024 * 1024)).toFixed(1)
      throw new Error(`File too large: ${file.name} (max ${limitMB} MB)`)
    }

    if (options.allowedTypes?.length) {
      const isAllowed = options.allowedTypes.some((type) => {
        if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'))
        return file.type === type
      })
      if (!isAllowed) {
        throw new Error(`File type not allowed: ${file.type}`)
      }
    }

    // 2. Build FormData
    const formData = new FormData()
    formData.append('file', file)

    if (options.mediaType) {
      formData.append('media_type', options.mediaType)
    }

    if (options.additionalFields) {
      Object.entries(options.additionalFields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // 3. Get CSRF token
    const csrfToken = options.csrfToken
      ?? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
      ?? ''

    // 4. Upload via axios or fetch
    let responseData: DKISaveAsFileResponse

    if (options.axiosInstance) {
      const response = await options.axiosInstance.post(options.endpoint, formData, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          ...options.headers,
        },
        onUploadProgress: options.onProgress
          ? (e: any) => {
              if (e.total) {
                options.onProgress!({
                  loaded: e.loaded,
                  total: e.total,
                  percentage: Math.round((e.loaded / e.total) * 100),
                })
              }
            }
          : undefined,
      })
      responseData = response.data
    } else {
      if (options.onProgress) {
        responseData = await uploadWithXHR(options.endpoint, formData, csrfToken, options)
      } else {
        const response = await fetch(options.endpoint, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            Accept: 'application/json',
            ...options.headers,
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error((error as any).message ?? `Upload failed: ${response.status}`)
        }

        responseData = await response.json()
      }
    }

    // 5. Validate DKI response
    if (!responseData.status) {
      throw new Error(responseData.message ?? 'saveAsFileToStorage() returned status: false')
    }

    if (!responseData.output) {
      throw new Error('Invalid response: missing output field')
    }

    // 6. Map DKI response to RTEditor's UploadResult
    return mapDKIResponseToUploadResult(responseData, storageBaseUrl, thumbnailBaseUrl, options.preferResized ?? false)
  }
}

function mapDKIResponseToUploadResult(
  response: DKISaveAsFileResponse,
  storageBaseUrl: string,
  thumbnailBaseUrl: string,
  preferResized: boolean
): UploadResult {
  const output = response.output
  const basePath = output.path.replace(/^media\/?/, '')
  const primaryUrl = `${storageBaseUrl}/${basePath}/${output.hash_name}${output.extension}`

  let url = primaryUrl

  if (preferResized && output.resized) {
    const resizedPath = output.resized.replace(/^media\/?/, '')
    url = `${storageBaseUrl}/${resizedPath}`
  }

  const result: UploadResult = {
    url,
    alt: output.name,
    filename: `${output.name}${output.extension}`,
    filesize: output.file_size,
  }

  ;(result as DKIUploadResultExtended).dkiMeta = {
    hashName: output.hash_name,
    storagePath: output.path,
    extension: output.extension,
    fileType: output.file_type,
    thumbnailUrl: output.thumbnail
      ? `${thumbnailBaseUrl}/${output.thumbnail.replace(/^media\/?/, '')}`
      : undefined,
    thumbnailFileSize: output.thumbnail_file_size,
    resizedUrl: output.resized
      ? `${storageBaseUrl}/${output.resized.replace(/^media\/?/, '')}`
      : undefined,
    resizedFileSize: output.resized_file_size,
  }

  return result
}

function uploadWithXHR(
  url: string,
  formData: FormData,
  csrfToken: string,
  options: DKIMediaHandlerOptions
): Promise<DKISaveAsFileResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken)
    xhr.setRequestHeader('Accept', 'application/json')

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options.onProgress) {
        options.onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        })
      }
    })

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          reject(new Error('Invalid JSON response from DKI endpoint'))
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText)
          reject(new Error(error.message ?? `Upload failed: ${xhr.status}`))
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(formData)
  })
}

