import { describe, it, expect } from 'vitest'
import { exportHTML, exportRawHTML } from '../../../src/utils/exportHTML'

describe('exportHTML', () => {
  it('returns sanitized HTML from editor', () => {
    const mockEditor = {
      getHTML: () => '<p>Hello <strong>world</strong></p>',
    } as any

    const result = exportHTML(mockEditor)
    expect(result).toContain('<p>Hello <strong>world</strong></p>')
  })

  it('sanitizes dangerous content from editor HTML', () => {
    const mockEditor = {
      getHTML: () => '<p>Hello</p><script>alert("xss")</script>',
    } as any

    const result = exportHTML(mockEditor)
    expect(result).not.toContain('<script>')
    expect(result).toContain('<p>Hello</p>')
  })

  it('strips event handlers from editor HTML', () => {
    const mockEditor = {
      getHTML: () => '<p onclick="alert(1)">Click</p>',
    } as any

    const result = exportHTML(mockEditor)
    expect(result).not.toContain('onclick')
    expect(result).toContain('<p>Click</p>')
  })
})

describe('exportRawHTML', () => {
  it('returns raw HTML from editor without sanitization', () => {
    const mockEditor = {
      getHTML: () => '<p>Hello <strong>world</strong></p>',
    } as any

    const result = exportRawHTML(mockEditor)
    expect(result).toBe('<p>Hello <strong>world</strong></p>')
  })

  it('returns HTML as-is including potentially unsafe content', () => {
    const rawHTML = '<p>Hello</p><script>alert("xss")</script>'
    const mockEditor = {
      getHTML: () => rawHTML,
    } as any

    const result = exportRawHTML(mockEditor)
    expect(result).toBe(rawHTML)
  })
})

