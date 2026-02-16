import { ref, onMounted, onBeforeUnmount, shallowRef, type Ref } from 'vue'
import { Editor } from '@tiptap/vue-3'
import type { Editor as CoreEditor, Extensions, JSONContent } from '@tiptap/core'

export interface UseEditorOptions {
  content?: string | JSONContent
  extensions?: Extensions
  editable?: boolean
  autofocus?: boolean | 'start' | 'end'
  placeholder?: string
  onUpdate?: (props: { editor: CoreEditor }) => void
  onCreate?: (props: { editor: CoreEditor }) => void
  onDestroy?: () => void
  onError?: (error: Error) => void
}

export interface UseEditorReturn {
  editor: Ref<Editor | null>
  isReady: Ref<boolean>
  error: Ref<Error | null>
}

export function useEditor(options: UseEditorOptions): UseEditorReturn {
  const editor = shallowRef<Editor | null>(null)
  const isReady = ref(false)
  const error = ref<Error | null>(null)

  onMounted(() => {
    try {
      editor.value = new Editor({
        extensions: options.extensions ?? [],
        content: options.content ?? '',
        editable: options.editable ?? true,
        autofocus: options.autofocus ?? false,
        onUpdate: options.onUpdate,
        onCreate: (props) => {
          isReady.value = true
          options.onCreate?.(props)
        },
        onDestroy: () => {
          isReady.value = false
          options.onDestroy?.()
        },
      })
    } catch (err) {
      const editorError = err instanceof Error ? err : new Error(String(err))
      console.error('[useEditor] Failed to initialize editor:', editorError)
      error.value = editorError
      options.onError?.(editorError)
      // editor.value remains null, isReady remains false — safe degraded state
    }
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
    editor.value = null
  })

  return { editor, isReady, error }
}
