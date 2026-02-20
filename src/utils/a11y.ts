/**
 * Accessibility helper utilities for the rich text editor.
 */

/**
 * Announces a message to screen readers using a temporary live region.
 * @param message - The message to announce
 * @param priority - 'polite' waits for idle; 'assertive' interrupts immediately
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const el = document.createElement('div')
  el.setAttribute('role', priority === 'assertive' ? 'alert' : 'status')
  el.setAttribute('aria-live', priority)
  el.setAttribute('aria-atomic', 'true')
  el.className = 'rte-sr-only'
  el.textContent = message
  document.body.appendChild(el)

  setTimeout(() => {
    document.body.removeChild(el)
  }, 1000)
}

/**
 * Traps keyboard focus within a container element.
 * Handles Tab and Shift+Tab to cycle through focusable elements.
 * @param container - The HTML element to trap focus within
 * @returns A cleanup function that removes the keydown event listener
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return

    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Returns a human-readable keyboard shortcut label, adapting modifier keys for Mac.
 * @param key - The key character (e.g. 'B', 'I', 'Z')
 * @param modifier - The modifier key name: 'ctrl', 'shift', or 'alt'
 * @returns A formatted shortcut string like '⌘+B' (Mac) or 'Ctrl+B' (other)
 */
export function getShortcutLabel(
  key: string,
  modifier: 'ctrl' | 'shift' | 'alt' = 'ctrl'
): string {
  const isMac = navigator.platform.indexOf('Mac') !== -1

  const modifierMap: Record<string, string> = isMac
    ? { ctrl: '⌘', shift: '⇧', alt: '⌥' }
    : { ctrl: 'Ctrl', shift: 'Shift', alt: 'Alt' }

  const modKey = modifierMap[modifier]
  return `${modKey}+${key}`
}

