import { reactive, type ShallowRef } from 'vue'
import type { Editor } from '@tiptap/core'
import type { AIHandler, AIOptions, AIState, AIQuickAction, AIRequest, AIContextLevel } from '../types/ai'
import { sanitizeHTML } from '../utils/sanitize'

export interface UseAIOptions {
  editor: ShallowRef<Editor | null>
  handler?: AIHandler
  options?: Partial<AIOptions>
}

export interface UseAIReturn {
  state: AIState
  open: (mode?: 'prompt') => void
  close: () => void
  submit: (prompt: string, action?: AIQuickAction) => Promise<void>
  accept: () => void
  acceptAndEdit: () => void
  reject: () => void
  retry: () => void
}

function smartTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength)
  const lastSentence = truncated.lastIndexOf('.')
  const lastNewline = truncated.lastIndexOf('\n')
  const breakPoint = Math.max(lastSentence, lastNewline)
  if (breakPoint > maxLength * 0.5) {
    return truncated.slice(0, breakPoint + 1)
  }
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '…'
  }
  return truncated + '…'
}

export function useAI({ editor, handler, options }: UseAIOptions): UseAIReturn {
  const contextLevel: AIContextLevel = options?.contextLevel ?? 'standard'
  const maxContextLength = options?.maxContextLength ?? 4000

  const state = reactive<AIState>({
    isOpen: false,
    isLoading: false,
    mode: 'prompt',
    prompt: '',
    response: '',
    error: null,
    selectedText: '',
    lastAction: undefined,
  })

  function getSelectedText(): string {
    const ed = editor.value
    if (!ed) return ''
    const { from, to, empty } = ed.state.selection
    if (empty) return ''
    return ed.state.doc.textBetween(from, to, ' ')
  }

  function buildContext(): AIRequest {
    const ed = editor.value
    const selectedText = state.selectedText
    let surroundingContext = ''
    let fullDocument = ''

    if (ed) {
      const docText = ed.state.doc.textContent
      fullDocument = contextLevel === 'full' ? smartTruncate(docText, maxContextLength) : ''

      if (contextLevel === 'standard' || contextLevel === 'full') {
        const { from, to } = ed.state.selection
        const docSize = ed.state.doc.content.size
        const contextStart = Math.max(0, from - 500)
        const contextEnd = Math.min(docSize, to + 500)
        surroundingContext = smartTruncate(
          ed.state.doc.textBetween(contextStart, contextEnd, ' '),
          maxContextLength,
        )
      }
    }

    return {
      prompt: state.prompt,
      action: state.lastAction,
      selectedText: selectedText || undefined,
      surroundingContext: surroundingContext || undefined,
      fullDocument: fullDocument || undefined,
      contextLevel,
      metadata: {
        documentLength: ed?.state.doc.content.size,
        selectionLength: selectedText.length || undefined,
        cursorPosition: ed?.state.selection.from,
        timestamp: Date.now(),
      },
    }
  }

  function open(_mode?: 'prompt') {
    state.selectedText = getSelectedText()
    state.isOpen = true
    state.mode = 'prompt'
    state.response = ''
    state.error = null
    state.prompt = ''
  }

  function close() {
    state.isOpen = false
    state.isLoading = false
    state.mode = 'prompt'
    state.prompt = ''
    state.response = ''
    state.error = null
    state.selectedText = ''
    state.lastAction = undefined
  }

  async function submit(prompt: string, action?: AIQuickAction) {
    if (!handler) {
      state.error = 'No AI handler configured'
      state.mode = 'error'
      return
    }
    state.prompt = prompt
    state.lastAction = action
    state.isLoading = true
    state.error = null
    state.mode = 'prompt'
    try {
      const request = buildContext()
      request.prompt = prompt
      request.action = action
      const result = await handler.generate(request)
      state.response = sanitizeHTML(result.content)
      state.mode = 'response'
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'AI request failed'
      state.mode = 'error'
    } finally {
      state.isLoading = false
    }
  }

  function accept() {
    const ed = editor.value
    if (!ed || !state.response) return
    const { from, to, empty } = ed.state.selection
    if (!empty && state.selectedText) {
      ed.chain().focus().deleteRange({ from, to }).insertContent(state.response).run()
    } else {
      ed.chain().focus().insertContent(state.response).run()
    }
    close()
  }

  function acceptAndEdit() {
    const ed = editor.value
    if (!ed || !state.response) return
    const { from, to, empty } = ed.state.selection
    const wrappedContent = `<span class="rte-ai-inserted">${state.response}</span>`
    if (!empty && state.selectedText) {
      ed.chain().focus().deleteRange({ from, to }).insertContent(wrappedContent).run()
    } else {
      ed.chain().focus().insertContent(wrappedContent).run()
    }
    close()
  }

  function reject() {
    state.response = ''
    state.mode = 'prompt'
  }

  function retry() {
    if (state.prompt) {
      submit(state.prompt, state.lastAction)
    }
  }

  return {
    state,
    open,
    close,
    submit,
    accept,
    acceptAndEdit,
    reject,
    retry,
  }
}
