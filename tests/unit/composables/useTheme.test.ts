import { describe, it, expect } from 'vitest'
import { useTheme } from '../../../src/composables/useTheme'

describe('useTheme', () => {
  describe('default theme', () => {
    it('returns "default" as the current theme name when no config is provided', () => {
      const { currentTheme } = useTheme()
      expect(currentTheme.value).toBe('default')
    })

    it('returns the configured theme name when config is provided', () => {
      const { currentTheme, setTheme } = useTheme()
      setTheme('dark')
      expect(currentTheme.value).toBe('dark')
      // Reset for other tests
      setTheme('default')
    })
  })

  describe('setTheme', () => {
    it('updates the current theme name', () => {
      const { currentTheme, setTheme } = useTheme()
      expect(currentTheme.value).toBe('default')

      setTheme('dark')
      expect(currentTheme.value).toBe('dark')
    })

    it('can be called multiple times', () => {
      const { currentTheme, setTheme } = useTheme()

      setTheme('dark')
      expect(currentTheme.value).toBe('dark')

      setTheme('light')
      expect(currentTheme.value).toBe('light')
    })
  })

  describe('applyTheme', () => {
    it('sets CSS custom properties on the given element', () => {
      const { applyTheme } = useTheme()
      const el = document.createElement('div')

      applyTheme(el, {
        '--rte-bg': '#ffffff',
        '--rte-text': '#000000',
      })

      expect(el.style.getPropertyValue('--rte-bg')).toBe('#ffffff')
      expect(el.style.getPropertyValue('--rte-text')).toBe('#000000')
    })

    it('does nothing when no variables are provided', () => {
      const { applyTheme } = useTheme()
      const el = document.createElement('div')

      applyTheme(el)

      expect(el.style.cssText).toBe('')
    })

    it('does nothing when variables is undefined', () => {
      const { applyTheme } = useTheme()
      const el = document.createElement('div')

      applyTheme(el, undefined)

      expect(el.style.cssText).toBe('')
    })

    it('applies custom theme variables from config', () => {
      const { applyTheme, setTheme } = useTheme()
      setTheme('custom')
      const el = document.createElement('div')

      applyTheme(el, {
        '--rte-font-size': '16px',
        '--rte-line-height': '1.5',
      })

      expect(el.style.getPropertyValue('--rte-font-size')).toBe('16px')
      expect(el.style.getPropertyValue('--rte-line-height')).toBe('1.5')
    })

    it('handles empty variables object', () => {
      const { applyTheme } = useTheme()
      const el = document.createElement('div')

      applyTheme(el, {})

      expect(el.style.cssText).toBe('')
    })
  })
})

