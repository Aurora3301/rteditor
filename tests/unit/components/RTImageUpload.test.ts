import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RTImageUpload from '../../../src/components/RTImageUpload.vue'

function createImageMockEditor() {
  return {
    chain: vi.fn().mockReturnValue({
      focus: vi.fn().mockReturnValue({
        setImage: vi.fn().mockReturnValue({ run: vi.fn() }),
      }),
    }),
  }
}

describe('RTImageUpload', () => {
  it('renders without errors', () => {
    const editor = createImageMockEditor()
    const wrapper = mount(RTImageUpload, {
      props: { editor: editor as any },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('exposes triggerUpload, handleDrop, handlePaste methods', () => {
    const editor = createImageMockEditor()
    const wrapper = mount(RTImageUpload, {
      props: { editor: editor as any },
    })
    expect(typeof wrapper.vm.triggerUpload).toBe('function')
    expect(typeof wrapper.vm.handleDrop).toBe('function')
    expect(typeof wrapper.vm.handlePaste).toBe('function')
  })

  it('emits upload-error for unsupported file type', async () => {
    const mockHandler = vi.fn().mockResolvedValue({ url: 'https://example.com/img.png' })
    const editor = createImageMockEditor()
    const wrapper = mount(RTImageUpload, {
      props: { editor: editor as any, uploadHandler: mockHandler },
    })
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    wrapper.vm.triggerUpload(invalidFile)
    // Wait for any async operations
    await vi.dynamicImportSettled()
    expect(wrapper.emitted('upload-error')).toBeTruthy()
    expect(wrapper.emitted('upload-error')![0][0]).toContain('Unsupported file type')
  })

  it('emits upload-start when upload begins with valid file and handler', async () => {
    const mockHandler = vi.fn().mockResolvedValue({ url: 'https://example.com/img.png' })
    const editor = createImageMockEditor()
    const wrapper = mount(RTImageUpload, {
      props: {
        editor: editor as any,
        uploadHandler: mockHandler,
      },
    })
    const validFile = new File(['img'], 'test.png', { type: 'image/png' })
    wrapper.vm.triggerUpload(validFile)
    // upload-start should be emitted synchronously before async upload
    expect(wrapper.emitted('upload-start')).toBeTruthy()
    expect(wrapper.emitted('upload-start')![0][0]).toBeInstanceOf(File)
  })
})

