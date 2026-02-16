/**
 * DKI Media Configuration — mirrors DKI's config/media.php structure.
 */
export interface DKIMediaConfig {
  path: string
  hashNamePath?: boolean
  format?: string
  size?: number
  requireThumb?: boolean
  thumbnailWidth?: number
  thumbnailHeight?: number
  requireResize?: boolean
  imageWidth?: number
  imageHeight?: number
  uploadMaxPath?: number
}

/**
 * Response from DKI's saveAsFileToStorage() method.
 */
export interface DKISaveAsFileResponse {
  status: boolean
  output: {
    name: string
    path: string
    extension: string
    hash_name: string
    file_size: number
    file_type: string
    thumbnail?: string
    thumbnail_file_size?: number
    thumbnail_file_type?: string
    resized?: string
    resized_file_size?: number
    resized_file_type?: string
  }
  message?: string
}

/**
 * Options for creating a DKI media upload handler.
 */
export interface DKIMediaHandlerOptions {
  /** Laravel endpoint URL that accepts FormData and calls saveAsFileToStorage(). */
  endpoint: string
  /** CSRF token for Laravel. Auto-reads from meta[name="csrf-token"] if not provided. */
  csrfToken?: string
  /** Media type key sent to the Laravel endpoint. */
  mediaType?: string
  /** Base URL for constructing full file URLs from storage paths. Default: '/storage/media' */
  storageBaseUrl?: string
  /** Base URL for constructing thumbnail URLs. Default: same as storageBaseUrl */
  thumbnailBaseUrl?: string
  /** Prefer resized version URL over original (for images). Default: false */
  preferResized?: boolean
  /** Allowed MIME types (validated client-side before upload). */
  allowedTypes?: string[]
  /** Max file size in bytes (validated client-side before upload). */
  maxFileSize?: number
  /** Progress callback. */
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  /** Additional headers to include in the request. */
  headers?: Record<string, string>
  /** Additional FormData fields to send with the upload. */
  additionalFields?: Record<string, string>
  /** Axios instance to use instead of fetch. If provided, uses axios.post(). */
  axiosInstance?: any
}

