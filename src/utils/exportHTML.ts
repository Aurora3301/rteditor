import type { Editor } from '@tiptap/core'
import { sanitizeHTML } from './sanitize'

export function exportHTML(editor: Editor): string {
  const html = editor.getHTML()
  return sanitizeHTML(html)
}

export function exportRawHTML(editor: Editor): string {
  return editor.getHTML()
}

