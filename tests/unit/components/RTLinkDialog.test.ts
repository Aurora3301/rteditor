import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RTLinkDialog from '../../../src/components/RTLinkDialog.vue'

function createLinkMockEditor() {
  return {
    chain: vi.fn().mockReturnValue({
      focus: vi.fn().mockReturnValue({
        setLink: vi.fn().mockReturnValue({ run: vi.fn() }),
        unsetLink: vi.fn().mockReturnValue({ run: vi.fn() }),
        insertContent: vi.fn().mockReturnValue({ run: vi.fn() }),
      }),
    }),
    state: { selection: { from: 0, to: 5 } },
    getAttributes: vi.fn().mockReturnValue({}),
  }
}

describe('RTLinkDialog', () => {
  it('does not render when isOpen is false', () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: false },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('[data-testid="rte-link-dialog"]').exists()).toBe(false)
  })

  it('renders dialog when isOpen is true', () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('[data-testid="rte-link-dialog"]').exists()).toBe(true)
  })

  it('has role="dialog" and aria-modal="true"', () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    const dialog = wrapper.find('[data-testid="rte-link-dialog"]')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
  })

  it('URL input field exists with correct test id', () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('[data-testid="rte-link-url-input"]').exists()).toBe(true)
  })

  it('submit button exists', () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('[data-testid="rte-link-submit-btn"]').exists()).toBe(true)
  })

  it('cancel button emits close', async () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('[data-testid="rte-link-cancel-btn"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('validates empty URL and shows error', async () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    // URL field is empty by default, click submit
    await wrapper.find('[data-testid="rte-link-submit-btn"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').text()).toContain('URL is required')
  })

  it('rejects javascript: URLs', async () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    const input = wrapper.find('[data-testid="rte-link-url-input"]')
    await input.setValue('javascript:alert(1)')
    await wrapper.find('[data-testid="rte-link-submit-btn"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').text()).toContain('Invalid URL protocol')
  })

  it('accepts valid https URL', async () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    const input = wrapper.find('[data-testid="rte-link-url-input"]')
    await input.setValue('https://example.com')
    await wrapper.find('[data-testid="rte-link-submit-btn"]').trigger('click')
    await nextTick()
    // Should not show error
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    // Should emit close (since submit calls emit close)
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('escape key emits close', async () => {
    const wrapper = mount(RTLinkDialog, {
      props: { editor: createLinkMockEditor() as any, isOpen: true },
      global: { stubs: { Teleport: true } },
    })
    const overlay = wrapper.find('[data-testid="rte-link-dialog"]')
    await overlay.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})

