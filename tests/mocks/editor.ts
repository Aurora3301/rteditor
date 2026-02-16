import { vi } from 'vitest'

export function createMockEditor() {
  return {
    chain: vi.fn().mockReturnValue({
      focus: vi.fn().mockReturnValue({
        toggleBold: vi.fn().mockReturnThis(),
        toggleItalic: vi.fn().mockReturnThis(),
        toggleUnderline: vi.fn().mockReturnThis(),
        setImage: vi.fn().mockReturnThis(),
        run: vi.fn(),
      }),
    }),
    getHTML: vi.fn().mockReturnValue('<p>Test</p>'),
    getJSON: vi.fn().mockReturnValue({ type: 'doc', content: [] }),
    isActive: vi.fn().mockReturnValue(false),
    can: vi.fn().mockReturnValue({ toggleBold: vi.fn().mockReturnValue(true) }),
    commands: { setContent: vi.fn() },
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    setEditable: vi.fn(),
  }
}

