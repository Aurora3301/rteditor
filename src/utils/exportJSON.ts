import type { Editor, JSONContent } from '@tiptap/core'

export function exportJSON(editor: Editor): JSONContent {
  return editor.getJSON()
}

export function validateJSON(json: unknown): json is JSONContent {
  if (!json || typeof json !== 'object') return false
  const doc = json as Record<string, unknown>
  if (doc.type !== 'doc') return false
  if (!Array.isArray(doc.content)) return false
  return true
}

