import { describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import StarterKit from '@tiptap/starter-kit'
import { useEditor } from '../../../src/composables/useEditor'

function createTestComponent(options: Parameters<typeof useEditor>[0] = {}) {
  return defineComponent({
    setup() {
      const { editor, isReady } = useEditor(options)
      return { editor, isReady }
    },
    template: '<div />',
  })
}

describe('useEditor', () => {
  describe('editor creation', () => {
    it('creates an editor instance after mount', async () => {
      const TestComp = createTestComponent({
        extensions: [StarterKit],
        content: '<p>Hello</p>',
      })

      const wrapper = mount(TestComp)
      await nextTick()

      expect(wrapper.vm.editor).not.toBeNull()
      expect(wrapper.vm.editor).toBeDefined()

      wrapper.unmount()
    })

    it('editor is null before mount completes', () => {
      // Verify the initial ref value by checking the setup return
      // before Vue lifecycle hooks fire
      let capturedEditor: unknown = 'not-set'

      const TestComp = defineComponent({
        setup() {
          const { editor, isReady } = useEditor({
            extensions: [StarterKit],
          })
          // Capture the value synchronously during setup (before onMounted)
          capturedEditor = editor.value
          return { editor, isReady }
        },
        template: '<div />',
      })

      const wrapper = mount(TestComp)
      // capturedEditor was read during setup, before onMounted
      expect(capturedEditor).toBeNull()

      wrapper.unmount()
    })
  })

  describe('isReady state', () => {
    it('becomes true after editor is created', async () => {
      const TestComp = createTestComponent({
        extensions: [StarterKit],
        content: '<p>Test</p>',
      })

      const wrapper = mount(TestComp)
      await nextTick()
      // The onCreate callback sets isReady to true
      // Allow time for the editor's onCreate to fire
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(wrapper.vm.isReady).toBe(true)

      wrapper.unmount()
    })
  })

  describe('editor destruction', () => {
    it('destroys the editor and sets it to null on unmount', async () => {
      const TestComp = createTestComponent({
        extensions: [StarterKit],
        content: '<p>Hello</p>',
      })

      const wrapper = mount(TestComp)
      await nextTick()

      const editorInstance = wrapper.vm.editor
      expect(editorInstance).not.toBeNull()

      wrapper.unmount()

      // After unmount, the editor ref should be null
      // We can't access wrapper.vm after unmount, but we can verify
      // the editor was destroyed by checking the instance
      expect(editorInstance!.isDestroyed).toBe(true)
    })
  })

  describe('editor options', () => {
    it('passes content option to the editor', async () => {
      const TestComp = createTestComponent({
        extensions: [StarterKit],
        content: '<p>Custom content</p>',
      })

      const wrapper = mount(TestComp)
      await nextTick()

      const html = wrapper.vm.editor!.getHTML()
      expect(html).toContain('Custom content')

      wrapper.unmount()
    })

    it('calls onCreate callback when editor is created', async () => {
      const onCreateSpy = vi.fn()
      const TestComp = createTestComponent({
        extensions: [StarterKit],
        onCreate: onCreateSpy,
      })

      const wrapper = mount(TestComp)
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onCreateSpy).toHaveBeenCalled()

      wrapper.unmount()
    })

    it('respects editable option set to false', async () => {
      const TestComp = createTestComponent({
        extensions: [StarterKit],
        editable: false,
      })

      const wrapper = mount(TestComp)
      await nextTick()

      expect(wrapper.vm.editor!.isEditable).toBe(false)

      wrapper.unmount()
    })

    it('defaults to editable when option is not provided', async () => {
      const TestComp = createTestComponent({
        extensions: [StarterKit],
      })

      const wrapper = mount(TestComp)
      await nextTick()

      expect(wrapper.vm.editor!.isEditable).toBe(true)

      wrapper.unmount()
    })
  })
})

