import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RTToolbar from '../../../src/components/RTToolbar.vue'
import type { ToolbarItem } from '../../../src/types'

function createToolbarMockEditor() {
  const chain = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleUnderline: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    setTextAlign: vi.fn().mockReturnThis(),
    setHorizontalRule: vi.fn().mockReturnThis(),
    undo: vi.fn().mockReturnThis(),
    redo: vi.fn().mockReturnThis(),
    toggleSubscript: vi.fn().mockReturnThis(),
    toggleSuperscript: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    setParagraph: vi.fn().mockReturnThis(),
    run: vi.fn(),
  }
  return {
    chain: vi.fn().mockReturnValue(chain),
    isActive: vi.fn().mockReturnValue(false),
    can: vi.fn().mockReturnValue({
      undo: vi.fn().mockReturnValue(true),
      redo: vi.fn().mockReturnValue(true),
    }),
    getAttributes: vi.fn().mockReturnValue({}),
  }
}

describe('RTToolbar', () => {
  it('renders toolbar with role="toolbar" and aria-label', () => {
    const editor = createToolbarMockEditor()
    const wrapper = mount(RTToolbar, {
      props: { editor: editor as any, toolbar: ['bold'] as ToolbarItem[] },
    })
    const toolbar = wrapper.find('[data-testid="rte-toolbar"]')
    expect(toolbar.attributes('role')).toBe('toolbar')
    expect(toolbar.attributes('aria-label')).toBe('Formatting toolbar')
  })

  it('renders buttons for each item in toolbar config', () => {
    const editor = createToolbarMockEditor()
    const toolbar: ToolbarItem[] = ['bold', 'italic', 'underline']
    const wrapper = mount(RTToolbar, {
      props: { editor: editor as any, toolbar },
    })
    expect(wrapper.find('[data-testid="rte-toolbar-bold"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rte-toolbar-italic"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rte-toolbar-underline"]').exists()).toBe(true)
  })

  it('bold button has correct aria-label "Bold (Ctrl+B)"', () => {
    const editor = createToolbarMockEditor()
    const wrapper = mount(RTToolbar, {
      props: { editor: editor as any, toolbar: ['bold'] as ToolbarItem[] },
    })
    const btn = wrapper.find('[data-testid="rte-toolbar-bold"]')
    expect(btn.attributes('aria-label')).toBe('Bold (Ctrl+B)')
  })

  it('separator renders with role="separator"', () => {
    const editor = createToolbarMockEditor()
    const wrapper = mount(RTToolbar, {
      props: { editor: editor as any, toolbar: ['bold', '|', 'italic'] as ToolbarItem[] },
    })
    expect(wrapper.find('[role="separator"]').exists()).toBe(true)
  })

  it('heading dropdown renders', () => {
    const editor = createToolbarMockEditor()
    const wrapper = mount(RTToolbar, {
      props: { editor: editor as any, toolbar: ['heading'] as ToolbarItem[] },
    })
    const trigger = wrapper.find('[data-testid="rte-heading-dropdown"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
  })

  it('click on bold button calls editor.chain().focus().toggleBold().run()', async () => {
    const editor = createToolbarMockEditor()
    const wrapper = mount(RTToolbar, {
      props: { editor: editor as any, toolbar: ['bold'] as ToolbarItem[] },
    })
    await wrapper.find('[data-testid="rte-toolbar-bold"]').trigger('click')
    expect(editor.chain).toHaveBeenCalled()
    const chainReturn = editor.chain()
    expect(chainReturn.focus).toHaveBeenCalled()
    expect(chainReturn.toggleBold).toHaveBeenCalled()
    expect(chainReturn.run).toHaveBeenCalled()
  })

  it('active state applies CSS class rte-toolbar__button--active', () => {
    const editor = createToolbarMockEditor()
    editor.isActive.mockReturnValue(true)
    const wrapper = mount(RTToolbar, {
      props: { editor: editor as any, toolbar: ['bold'] as ToolbarItem[] },
    })
    const btn = wrapper.find('[data-testid="rte-toolbar-bold"]')
    expect(btn.classes()).toContain('rte-toolbar__button--active')
  })

  it('image button has data-testid="rte-toolbar-image"', () => {
    const editor = createToolbarMockEditor()
    const wrapper = mount(RTToolbar, {
      props: { editor: editor as any, toolbar: ['image'] as ToolbarItem[] },
    })
    expect(wrapper.find('[data-testid="rte-toolbar-image"]').exists()).toBe(true)
  })
})

