import { describe, it, expect } from 'vitest'
import { sanitizeHTML, stripAllHTML } from '../../../src/utils/sanitize'

describe('sanitizeHTML', () => {
  it('removes <script> tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
    expect(result).toContain('<p>Hello</p>')
  })

  it('removes event handler attributes (onerror)', () => {
    const input = '<img src="x.png" onerror="alert(1)">'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('onerror')
  })

  it('removes event handler attributes (onclick)', () => {
    const input = '<p onclick="alert(1)">Click me</p>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('onclick')
    expect(result).toContain('<p>Click me</p>')
  })

  it('removes javascript: URLs in href', () => {
    const input = '<a href="javascript:alert(1)">Link</a>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('javascript:')
  })

  it('preserves allowed tags: <strong>, <em>', () => {
    const input = '<strong>bold</strong> and <em>italic</em>'
    const result = sanitizeHTML(input)
    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('<em>italic</em>')
  })

  it('preserves <p> tags', () => {
    const input = '<p>paragraph</p>'
    expect(sanitizeHTML(input)).toContain('<p>paragraph</p>')
  })

  it('preserves heading tags <h1> through <h6>', () => {
    for (let i = 1; i <= 6; i++) {
      const input = `<h${i}>Heading ${i}</h${i}>`
      const result = sanitizeHTML(input)
      expect(result).toContain(`<h${i}>Heading ${i}</h${i}>`)
    }
  })

  it('preserves list tags <ul>, <ol>, <li>', () => {
    const input = '<ul><li>item 1</li></ul><ol><li>item 2</li></ol>'
    const result = sanitizeHTML(input)
    expect(result).toContain('<ul>')
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>')
  })

  it('preserves <img> with src and alt attributes', () => {
    const input = '<img src="https://example.com/img.png" alt="An image">'
    const result = sanitizeHTML(input)
    expect(result).toContain('src="https://example.com/img.png"')
    expect(result).toContain('alt="An image"')
  })

  it('preserves <a> with http/https href', () => {
    const input = '<a href="https://example.com">Link</a>'
    const result = sanitizeHTML(input)
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('>Link</a>')
  })

  it('handles empty string input', () => {
    expect(sanitizeHTML('')).toBe('')
  })
})

describe('stripAllHTML', () => {
  it('removes all HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    const result = stripAllHTML(input)
    expect(result).not.toContain('<p>')
    expect(result).not.toContain('<strong>')
    expect(result).toBe('Hello world')
  })

  it('removes all tags including img and a', () => {
    const input = '<a href="https://example.com">Link</a> and <img src="x.png">'
    const result = stripAllHTML(input)
    expect(result).not.toContain('<a')
    expect(result).not.toContain('<img')
    expect(result).toBe('Link and ')
  })

  it('handles empty string input', () => {
    expect(stripAllHTML('')).toBe('')
  })
})

