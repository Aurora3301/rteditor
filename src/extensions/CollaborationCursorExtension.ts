import { Extension } from '@tiptap/core'

// eslint-disable-next-line @typescript-eslint/no-require-imports
declare const require: (id: string) => any

export interface CollaborationCursorOptions {
  provider: unknown
  user: { name: string; color: string }
}

export const CollaborationCursorExtension = Extension.create<CollaborationCursorOptions>({
  name: 'collaborationCursor',

  addProseMirrorPlugins() {
    const { provider, user } = this.options
    if (!provider) return []

    try {
      const { yCursorPlugin } = require('y-prosemirror')
      return [yCursorPlugin((provider as any).awareness, { user })]
    } catch (e) {
      console.warn('[RTEditor] Install y-prosemirror for collaboration cursors')
      return []
    }
  }
})
