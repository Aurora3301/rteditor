import type { UploadHandler, UploadResult } from '../types/upload'
import type { BaseUploadOptions } from './types'
import { validateFile, uploadWithProgress } from './types'

/**
 * Options for the Cloudinary upload handler.
 */
export interface CloudinaryUploadOptions extends BaseUploadOptions {
  /** Your Cloudinary cloud name. */
  cloudName: string
  /** Upload preset for unsigned uploads. Either this or signatureEndpoint is required. */
  uploadPreset?: string
  /** Backend endpoint for signed uploads. POST with { timestamp, folder? } → { signature, api_key, timestamp } */
  signatureEndpoint?: string
  /** Optional folder path in Cloudinary. */
  folder?: string
}

/**
 * Cloudinary upload API response (partial).
 */
interface CloudinaryResponse {
  secure_url: string
  public_id: string
  original_filename: string
  bytes: number
  format: string
  width?: number
  height?: number
}

/**
 * Signature response from backend for signed uploads.
 */
interface SignatureResponse {
  signature: string
  api_key: string
  timestamp: number
}

/**
 * Create an upload handler for Cloudinary.
 *
 * Supports both unsigned uploads (using uploadPreset) and signed uploads
 * (using signatureEndpoint to get server-generated signatures).
 */
export function createCloudinaryUploadHandler(options: CloudinaryUploadOptions): UploadHandler {
  if (!options.uploadPreset && !options.signatureEndpoint) {
    throw new Error('Cloudinary handler requires either uploadPreset (unsigned) or signatureEndpoint (signed)')
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${options.cloudName}/auto/upload`

  return async (file: File): Promise<UploadResult> => {
    // 1. Validate file
    validateFile(file, options)

    // 2. Build FormData
    const formData = new FormData()
    formData.append('file', file)

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    if (options.uploadPreset) {
      // Unsigned upload
      formData.append('upload_preset', options.uploadPreset)
    } else if (options.signatureEndpoint) {
      // Signed upload — get signature from backend
      const timestamp = Math.round(Date.now() / 1000)
      const signPayload: Record<string, any> = { timestamp }
      if (options.folder) {
        signPayload.folder = options.folder
      }

      const signResponse = await fetch(options.signatureEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(signPayload),
      })

      if (!signResponse.ok) {
        const error = await signResponse.json().catch(() => ({}))
        throw new Error((error as any).message ?? `Failed to get Cloudinary signature: ${signResponse.status}`)
      }

      const signData: SignatureResponse = await signResponse.json()

      formData.append('api_key', signData.api_key)
      formData.append('timestamp', String(signData.timestamp))
      formData.append('signature', signData.signature)
    }

    // 3. Upload to Cloudinary
    let responseData: CloudinaryResponse

    if (options.onProgress) {
      responseData = await uploadWithProgress<CloudinaryResponse>(
        uploadUrl,
        'POST',
        formData,
        {},
        options.onProgress
      )
    } else {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error((error as any).error?.message ?? `Cloudinary upload failed: ${response.status}`)
      }

      responseData = await response.json()
    }

    // 4. Map response to UploadResult
    return {
      url: responseData.secure_url,
      alt: responseData.original_filename,
      filename: `${responseData.original_filename}.${responseData.format}`,
      filesize: responseData.bytes,
    }
  }
}

