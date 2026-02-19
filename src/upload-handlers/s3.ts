import type { UploadHandler, UploadResult } from '../types/upload'
import type { BaseUploadOptions, UploadProgress } from './types'
import { validateFile, uploadWithProgress } from './types'

/**
 * Options for the S3 pre-signed URL upload handler.
 */
export interface S3UploadOptions extends BaseUploadOptions {
  /** Backend endpoint that returns a pre-signed URL. POST with { filename, contentType } → { url, fields? } */
  presignEndpoint: string
  /** Additional headers for the presign request (e.g., Authorization). */
  headers?: Record<string, string>
}

/**
 * Expected response from the presign endpoint.
 */
interface PresignResponse {
  /** The pre-signed URL to upload to. */
  url: string
  /** Optional fields for multipart POST upload (used with S3 POST policy). */
  fields?: Record<string, string>
}

/**
 * Create an upload handler for AWS S3 using pre-signed URLs.
 *
 * Two-step flow:
 * 1. POST to presignEndpoint with { filename, contentType } → get { url, fields? }
 * 2. If fields present: multipart POST to S3. Otherwise: PUT to S3.
 */
export function createS3UploadHandler(options: S3UploadOptions): UploadHandler {
  return async (file: File): Promise<UploadResult> => {
    // 1. Validate file
    validateFile(file, options)

    // 2. Get pre-signed URL from backend
    const presignResponse = await fetch(options.presignEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    })

    if (!presignResponse.ok) {
      const error = await presignResponse.json().catch(() => ({}))
      throw new Error((error as any).message ?? `Failed to get presigned URL: ${presignResponse.status}`)
    }

    const presignData: PresignResponse = await presignResponse.json()

    if (!presignData.url) {
      throw new Error('Invalid presign response: missing url')
    }

    // 3. Upload to S3
    let fileUrl: string

    if (presignData.fields) {
      // Multipart POST (S3 POST policy)
      const formData = new FormData()
      Object.entries(presignData.fields).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('file', file)

      if (options.onProgress) {
        await uploadWithProgress<string>(
          presignData.url,
          'POST',
          formData,
          {},
          options.onProgress
        )
      } else {
        const uploadResponse = await fetch(presignData.url, {
          method: 'POST',
          body: formData,
        })
        if (!uploadResponse.ok) {
          throw new Error(`S3 upload failed: ${uploadResponse.status}`)
        }
      }

      // Construct URL from the S3 endpoint + key field
      const key = presignData.fields.key ?? presignData.fields.Key
      if (key) {
        const s3BaseUrl = new URL(presignData.url)
        fileUrl = `${s3BaseUrl.origin}/${key}`
      } else {
        fileUrl = presignData.url
      }
    } else {
      // Direct PUT upload
      const uploadHeaders: Record<string, string> = {
        'Content-Type': file.type,
      }

      if (options.onProgress) {
        await uploadWithProgress<string>(
          presignData.url,
          'PUT',
          file,
          uploadHeaders,
          options.onProgress
        )
      } else {
        const uploadResponse = await fetch(presignData.url, {
          method: 'PUT',
          headers: uploadHeaders,
          body: file,
        })
        if (!uploadResponse.ok) {
          throw new Error(`S3 upload failed: ${uploadResponse.status}`)
        }
      }

      // For PUT pre-signed URLs, the file URL is the URL without query params
      fileUrl = presignData.url.split('?')[0]
    }

    return {
      url: fileUrl,
      alt: file.name.replace(/\.[^/.]+$/, ''),
      filename: file.name,
      filesize: file.size,
    }
  }
}

