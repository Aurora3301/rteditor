import { describe, it, expect } from 'vitest'
import {
  getFileCategory,
  IMAGE_MIME_TYPES,
  PDF_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
  DEFAULT_FILE_SIZE_LIMITS,
} from '../../../src/types/upload'

describe('getFileCategory', () => {
  it('returns "image" for image/jpeg', () => {
    expect(getFileCategory('image/jpeg')).toBe('image')
  })

  it('returns "image" for image/png', () => {
    expect(getFileCategory('image/png')).toBe('image')
  })

  it('returns "image" for image/gif', () => {
    expect(getFileCategory('image/gif')).toBe('image')
  })

  it('returns "image" for image/webp', () => {
    expect(getFileCategory('image/webp')).toBe('image')
  })

  it('returns "pdf" for application/pdf', () => {
    expect(getFileCategory('application/pdf')).toBe('pdf')
  })

  it('returns "document" for application/msword', () => {
    expect(getFileCategory('application/msword')).toBe('document')
  })

  it('returns "document" for Word .docx MIME type', () => {
    expect(
      getFileCategory('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ).toBe('document')
  })

  it('returns "document" for Excel .xls MIME type', () => {
    expect(getFileCategory('application/vnd.ms-excel')).toBe('document')
  })

  it('returns "document" for Excel .xlsx MIME type', () => {
    expect(
      getFileCategory('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ).toBe('document')
  })

  it('returns "document" for PowerPoint .ppt MIME type', () => {
    expect(getFileCategory('application/vnd.ms-powerpoint')).toBe('document')
  })

  it('returns "document" for PowerPoint .pptx MIME type', () => {
    expect(
      getFileCategory('application/vnd.openxmlformats-officedocument.presentationml.presentation')
    ).toBe('document')
  })

  it('returns null for unsupported type text/plain', () => {
    expect(getFileCategory('text/plain')).toBeNull()
  })

  it('returns null for unsupported type application/json', () => {
    expect(getFileCategory('application/json')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getFileCategory('')).toBeNull()
  })
})

describe('DEFAULT_FILE_SIZE_LIMITS', () => {
  it('has an image property', () => {
    expect(DEFAULT_FILE_SIZE_LIMITS).toHaveProperty('image')
    expect(typeof DEFAULT_FILE_SIZE_LIMITS.image).toBe('number')
  })

  it('has a pdf property', () => {
    expect(DEFAULT_FILE_SIZE_LIMITS).toHaveProperty('pdf')
    expect(typeof DEFAULT_FILE_SIZE_LIMITS.pdf).toBe('number')
  })

  it('has a document property', () => {
    expect(DEFAULT_FILE_SIZE_LIMITS).toHaveProperty('document')
    expect(typeof DEFAULT_FILE_SIZE_LIMITS.document).toBe('number')
  })

  it('image limit is 5MB', () => {
    expect(DEFAULT_FILE_SIZE_LIMITS.image).toBe(5 * 1024 * 1024)
  })
})

describe('IMAGE_MIME_TYPES', () => {
  it('contains image/jpeg', () => {
    expect(IMAGE_MIME_TYPES).toContain('image/jpeg')
  })

  it('contains image/png', () => {
    expect(IMAGE_MIME_TYPES).toContain('image/png')
  })

  it('contains image/gif', () => {
    expect(IMAGE_MIME_TYPES).toContain('image/gif')
  })

  it('contains image/webp', () => {
    expect(IMAGE_MIME_TYPES).toContain('image/webp')
  })
})

