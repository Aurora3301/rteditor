import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RTBubbleMenu from '../../../src/components/RTBubbleMenu.vue'

// Mock the BubbleMenuPlugin import since it requires a real editor
vi.mock('@tiptap/extension-bubble-menu', () => ({
  BubbleMenuPlugin: vi.fn().mockReturnValue({}),
}))

function createBubbleMockEditor() {
  const chain = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleUnderline: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    run: vi.fn(),
  }
  return {
    chain: vi.fn().mockReturnValue(chain),
    isActive: vi.fn().mockReturnValue(false),
    registerPlugin: vi.fn(),
    unregisterPlugin: vi.fn(),
  }
}

describe('RTBubbleMenu', () => {
  it('renders with role="dialog", aria-modal="true", and aria-label="Text formatting"', () => {
    const editor = createBubbleMockEditor()
    const wrapper = mount(RTBubbleMenu, {
      props: { editor: editor as any },
    })
    const menu = wrapper.find('[data-testid="rte-bubble-menu"]')
    expect(menu.attributes('role')).toBe('dialog')
    expect(menu.attributes('aria-modal')).toBe('true')
    expect(menu.attributes('aria-label')).toBe('Text formatting')
  })

  it('renders default items (bold, italic, underline, link)', () => {
    const editor = createBubbleMockEditor()
    const wrapper = mount(RTBubbleMenu, {
      props: { editor: editor as any },
    })
    expect(wrapper.find('[data-testid="rte-bubble-bold"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rte-bubble-italic"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rte-bubble-underline"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rte-bubble-link"]').exists()).toBe(true)
  })

  it('bold button has aria-label="Bold"', () => {
    const editor = createBubbleMockEditor()
    const wrapper = mount(RTBubbleMenu, {
      props: { editor: editor as any },
    })
    const boldBtn = wrapper.find('[data-testid="rte-bubble-bold"]')
    expect(boldBtn.attributes('aria-label')).toBe('Bold')
  })

  it('has data-testid="rte-bubble-menu" present', () => {
    const editor = createBubbleMockEditor()
    const wrapper = mount(RTBubbleMenu, {
      props: { editor: editor as any },
    })
    expect(wrapper.find('[data-testid="rte-bubble-menu"]').exists()).toBe(true)
  })

  it('click on bold calls editor chain', async () => {
    const editor = createBubbleMockEditor()
    const wrapper = mount(RTBubbleMenu, {
      props: { editor: editor as any },
    })
    await wrapper.find('[data-testid="rte-bubble-bold"]').trigger('click')
    expect(editor.chain).toHaveBeenCalled()
    const chainReturn = editor.chain()
    expect(chainReturn.focus).toHaveBeenCalled()
    expect(chainReturn.toggleBold).toHaveBeenCalled()
    expect(chainReturn.run).toHaveBeenCalled()
  })

  it('buttons have aria-pressed attribute', () => {
    const editor = createBubbleMockEditor()
    const wrapper = mount(RTBubbleMenu, {
      props: { editor: editor as any },
    })
    const boldBtn = wrapper.find('[data-testid="rte-bubble-bold"]')
    // isActive returns false, so aria-pressed should be "false"
    expect(boldBtn.attributes('aria-pressed')).toBe('false')
  })
})

