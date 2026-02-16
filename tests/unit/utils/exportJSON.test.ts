import { describe, it, expect } from 'vitest'
import { exportJSON, validateJSON } from '../../../src/utils/exportJSON'

describe('exportJSON', () => {
  it('returns JSON object from editor', () => {
    const mockEditor = {
      getJSON: () => ({ type: 'doc', content: [{ type: 'paragraph' }] }),
    } as any

    const result = exportJSON(mockEditor)
    expect(result).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] })
  })

  it('returns the exact object from editor.getJSON()', () => {
    const jsonContent = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      ],
    }
    const mockEditor = { getJSON: () => jsonContent } as any

    const result = exportJSON(mockEditor)
    expect(result).toBe(jsonContent)
  })
})

describe('validateJSON', () => {
  it('accepts valid doc structure', () => {
    const valid = { type: 'doc', content: [{ type: 'paragraph' }] }
    expect(validateJSON(valid)).toBe(true)
  })

  it('accepts doc with empty content array', () => {
    const valid = { type: 'doc', content: [] }
    expect(validateJSON(valid)).toBe(true)
  })

  it('rejects null', () => {
    expect(validateJSON(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(validateJSON(undefined)).toBe(false)
  })

  it('rejects numbers', () => {
    expect(validateJSON(42)).toBe(false)
  })

  it('rejects strings', () => {
    expect(validateJSON('hello')).toBe(false)
  })

  it('rejects objects without type: "doc"', () => {
    expect(validateJSON({ type: 'paragraph', content: [] })).toBe(false)
    expect(validateJSON({ content: [{ type: 'paragraph' }] })).toBe(false)
  })

  it('rejects objects without content array', () => {
    expect(validateJSON({ type: 'doc' })).toBe(false)
    expect(validateJSON({ type: 'doc', content: 'not an array' })).toBe(false)
    expect(validateJSON({ type: 'doc', content: null })).toBe(false)
  })
})

