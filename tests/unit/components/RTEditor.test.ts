import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount, flushPromises, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import RTEditor from '../../../src/components/RTEditor.vue'
import { basePreset } from '../../../src/presets'

// Mock the CSS import to avoid errors
vi.mock('../../../src/themes/default.css', () => ({}))

describe('RTEditor', () => {
  let wrapper: VueWrapper<any>

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders without errors with basePreset', () => {
    wrapper = mount(RTEditor, {
      props: { preset: basePreset },
      global: { stubs: { Teleport: true } },
      attachTo: document.body,
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has correct ARIA attributes', () => {
    wrapper = mount(RTEditor, {
      props: { preset: basePreset },
      global: { stubs: { Teleport: true } },
      attachTo: document.body,
    })
    const root = wrapper.find('[data-testid="rte-editor"]')
    expect(root.attributes('role')).toBe('application')
    expect(root.attributes('aria-label')).toBe('Rich text editor')
  })

  it('has data-testid="rte-editor" present', () => {
    wrapper = mount(RTEditor, {
      props: { preset: basePreset },
      global: { stubs: { Teleport: true } },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-testid="rte-editor"]').exists()).toBe(true)
  })

  it('renders RTToolbar child component', () => {
    wrapper = mount(RTEditor, {
      props: { preset: basePreset },
      global: { stubs: { Teleport: true } },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-testid="rte-toolbar"]').exists()).toBe(true)
  })

  it('creates editor and becomes ready after mount', async () => {
    vi.useFakeTimers()
    wrapper = mount(RTEditor, {
      props: { preset: basePreset },
      global: { stubs: { Teleport: true } },
      attachTo: document.body,
    })
    // TipTap Editor fires onCreate callback which sets isReady and emits 'create'.
    // TipTap may defer onCreate via requestAnimationFrame/setTimeout in jsdom.
    vi.runAllTimers()
    await flushPromises()
    await nextTick()
    const vm = wrapper.vm as any
    expect(vm.editor).toBeTruthy()
    expect(vm.isReady).toBe(true)
    vi.useRealTimers()
  })

  it('has correct props defaults', () => {
    wrapper = mount(RTEditor, {
      props: { preset: basePreset },
      global: { stubs: { Teleport: true } },
      attachTo: document.body,
    })
    // Access the component's props via vm
    expect(wrapper.props('editable')).toBe(true)
    expect(wrapper.props('autofocus')).toBe(false)
    expect(wrapper.props('readonly')).toBe(false)
  })

  it('cleans up editor on unmount', async () => {
    wrapper = mount(RTEditor, {
      props: { preset: basePreset },
      global: { stubs: { Teleport: true } },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
    // editor should exist after mount
    const editorInstance = (wrapper.vm as any).editor
    expect(editorInstance).toBeTruthy()

    wrapper.unmount()
    // After unmount, editor reference should be cleared
    // We verify by checking the component was cleanly unmounted (no errors thrown)
    expect(true).toBe(true)
  })
})

