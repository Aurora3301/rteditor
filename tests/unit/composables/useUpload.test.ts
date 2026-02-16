import { describe, it, expect, vi } from 'vitest'
import { useUpload } from '../../../src/composables/useUpload'

function createFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

describe('useUpload', () => {
  describe('valid image upload', () => {
    it('uploads a valid image file and returns the result', async () => {
      const mockHandler = vi.fn().mockResolvedValue({
        url: 'https://example.com/image.png',
        alt: 'test image',
      })
      const { upload, isUploading, uploadError } = useUpload(mockHandler)

      const file = createFile('test.png', 1024, 'image/png')
      const result = await upload(file)

      expect(result).toEqual({
        url: 'https://example.com/image.png',
        alt: 'test image',
      })
      expect(mockHandler).toHaveBeenCalledWith(file)
      expect(isUploading.value).toBe(false)
      expect(uploadError.value).toBeNull()
    })
  })

  describe('oversized files', () => {
    it('rejects an image file exceeding the default size limit (5 MB)', async () => {
      const mockHandler = vi.fn()
      const { upload, uploadError } = useUpload(mockHandler)

      const file = createFile('large.png', 6 * 1024 * 1024, 'image/png')
      const result = await upload(file)

      expect(result).toBeNull()
      expect(uploadError.value).toBe('File too large (max 5 MB for image)')
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('rejects a PDF file exceeding the default size limit (1 MB)', async () => {
      const mockHandler = vi.fn()
      const { upload, uploadError } = useUpload(mockHandler)

      const file = createFile('large.pdf', 2 * 1024 * 1024, 'application/pdf')
      const result = await upload(file)

      expect(result).toBeNull()
      expect(uploadError.value).toBe('File too large (max 1 MB for pdf)')
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('respects custom size limits', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ url: 'https://example.com/img.png' })
      const { upload, uploadError } = useUpload(mockHandler, {
        image: 10 * 1024 * 1024,
      })

      const file = createFile('big.png', 8 * 1024 * 1024, 'image/png')
      const result = await upload(file)

      expect(result).toEqual({ url: 'https://example.com/img.png' })
      expect(uploadError.value).toBeNull()
    })
  })

  describe('unsupported MIME types', () => {
    it('rejects a file with an unsupported MIME type', async () => {
      const mockHandler = vi.fn()
      const { upload, uploadError } = useUpload(mockHandler)

      const file = createFile('script.sh', 100, 'application/x-sh')
      const result = await upload(file)

      expect(result).toBeNull()
      expect(uploadError.value).toBe('Unsupported file type: application/x-sh')
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('rejects a file with text/plain MIME type', async () => {
      const mockHandler = vi.fn()
      const { upload, uploadError } = useUpload(mockHandler)

      const file = createFile('notes.txt', 100, 'text/plain')
      const result = await upload(file)

      expect(result).toBeNull()
      expect(uploadError.value).toBe('Unsupported file type: text/plain')
    })
  })

  describe('missing upload handler', () => {
    it('produces an error when no handler is configured', async () => {
      const { upload, uploadError } = useUpload()

      const file = createFile('test.png', 1024, 'image/png')
      const result = await upload(file)

      expect(result).toBeNull()
      expect(uploadError.value).toBe('No upload handler configured')
    })
  })

  describe('reactive state', () => {
    it('sets isUploading to true during upload and false after', async () => {
      let resolveUpload: (value: { url: string }) => void
      const mockHandler = vi.fn().mockImplementation(
        () => new Promise((resolve) => { resolveUpload = resolve })
      )
      const { upload, isUploading } = useUpload(mockHandler)

      expect(isUploading.value).toBe(false)

      const file = createFile('test.png', 1024, 'image/png')
      const uploadPromise = upload(file)

      expect(isUploading.value).toBe(true)

      resolveUpload!({ url: 'https://example.com/test.png' })
      await uploadPromise

      expect(isUploading.value).toBe(false)
    })

    it('sets isUploading to false and uploadError on handler failure', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Network error'))
      const { upload, isUploading, uploadError } = useUpload(mockHandler)

      const file = createFile('test.png', 1024, 'image/png')
      const result = await upload(file)

      expect(result).toBeNull()
      expect(isUploading.value).toBe(false)
      expect(uploadError.value).toBe('Network error')
    })

    it('handles non-Error thrown values gracefully', async () => {
      const mockHandler = vi.fn().mockRejectedValue('string error')
      const { upload, uploadError } = useUpload(mockHandler)

      const file = createFile('test.png', 1024, 'image/png')
      await upload(file)

      expect(uploadError.value).toBe('Upload failed')
    })

    it('clears previous error on successful upload', async () => {
      const mockHandler = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce({ url: 'https://example.com/test.png' })
      const { upload, uploadError } = useUpload(mockHandler)

      const file = createFile('test.png', 1024, 'image/png')

      await upload(file)
      expect(uploadError.value).toBe('First failure')

      await upload(file)
      expect(uploadError.value).toBeNull()
    })
  })

  describe('validateFile', () => {
    it('returns null for a valid image file', () => {
      const { validateFile } = useUpload()
      const file = createFile('test.png', 1024, 'image/png')
      expect(validateFile(file)).toBeNull()
    })

    it('returns error string for unsupported type', () => {
      const { validateFile } = useUpload()
      const file = createFile('test.zip', 1024, 'application/zip')
      expect(validateFile(file)).toBe('Unsupported file type: application/zip')
    })
  })

  describe('allAllowedTypes', () => {
    it('contains all image, PDF, and document MIME types', () => {
      const { allAllowedTypes } = useUpload()
      expect(allAllowedTypes).toContain('image/png')
      expect(allAllowedTypes).toContain('image/jpeg')
      expect(allAllowedTypes).toContain('application/pdf')
      expect(allAllowedTypes).toContain('application/msword')
    })
  })
})

