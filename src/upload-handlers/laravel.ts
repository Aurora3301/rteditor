import type { UploadHandler, UploadResult } from '../types/upload'
import type { BaseUploadOptions } from './types'
import { validateFile, uploadWithProgress } from './types'

/**
 * Options for the generic Laravel upload handler.
 */
export interface LaravelUploadOptions extends BaseUploadOptions {
  /** Laravel endpoint URL that accepts file uploads. */
  endpoint: string
  /** CSRF token. Auto-detected from <meta name="csrf-token"> if not provided. */
  csrfToken?: string
  /** Form field name for the file. Default: 'file' */
  fieldName?: string
  /** Additional headers to include in the upload request. */
  headers?: Record<string, string>
  /** Additional FormData fields to send with the upload. */
  additionalFields?: Record<string, string>
}

/**
 * Expected JSON response from the Laravel upload endpoint.
 */
interface LaravelUploadResponse {
  /** The URL of the uploaded file. Required. */
  url: string
  /** Alternative text for the file. */
  alt?: string
  /** Original filename. */
  filename?: string
  /** File size in bytes. */
  filesize?: number
  /** Any additional data from the server. */
  [key: string]: any
}

/**
 * Create a generic upload handler for Laravel backends.
 *
 * Features:
 * - Auto-detects CSRF token from <meta name="csrf-token">
 * - Uses XHR for upload progress support
 * - Configurable field name and additional form fields
 */
export function createLaravelUploadHandler(options: LaravelUploadOptions): UploadHandler {
  return async (file: File): Promise<UploadResult> => {
    // 1. Validate file
    validateFile(file, options)

    // 2. Build FormData
    const fieldName = options.fieldName ?? 'file'
    const formData = new FormData()
    formData.append(fieldName, file)

    if (options.additionalFields) {
      Object.entries(options.additionalFields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // 3. Get CSRF token (auto-detect from meta tag if not provided)
    const csrfToken = options.csrfToken
      ?? (typeof document !== 'undefined'
        ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
        : undefined)
      ?? ''

    // 4. Build headers
    const headers: Record<string, string> = {
      'X-CSRF-TOKEN': csrfToken,
      Accept: 'application/json',
      ...options.headers,
    }

    // 5. Upload
    let responseData: LaravelUploadResponse

    if (options.onProgress) {
      responseData = await uploadWithProgress<LaravelUploadResponse>(
        options.endpoint,
        'POST',
        formData,
        headers,
        options.onProgress
      )
    } else {
      const response = await fetch(options.endpoint, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error((error as any).message ?? `Upload failed: ${response.status}`)
      }

      responseData = await response.json()
    }

    // 6. Validate response
    if (!responseData.url) {
      throw new Error('Invalid server response: missing url field')
    }

    // 7. Map response to UploadResult
    return {
      url: responseData.url,
      alt: responseData.alt ?? file.name.replace(/\.[^/.]+$/, ''),
      filename: responseData.filename ?? file.name,
      filesize: responseData.filesize ?? file.size,
    }
  }
}

