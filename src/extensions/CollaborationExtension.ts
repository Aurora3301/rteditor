import { Extension } from '@tiptap/core'

// eslint-disable-next-line @typescript-eslint/no-require-imports
declare const require: (id: string) => any

export interface CollaborationExtensionOptions {
  document: unknown
  field?: string
}

export const CollaborationExtension = Extension.create<CollaborationExtensionOptions>({
  name: 'collaboration',

  addOptions() {
    return { document: null, field: 'default' }
  },

  addProseMirrorPlugins() {
    const { document, field } = this.options
    if (!document) {
      console.warn('[RTEditor] CollaborationExtension requires a Y.Doc')
      return []
    }

    // Dynamic import y-prosemirror
    try {
      // Will throw if not installed - that's expected
      const { ySyncPlugin, yUndoPlugin } = require('y-prosemirror')
      const ydoc = document as any
      const type = ydoc.getXmlFragment(field)
      return [ySyncPlugin(type), yUndoPlugin()]
    } catch (e) {
      console.warn('[RTEditor] Install yjs and y-prosemirror for collaboration: npm install yjs y-prosemirror')
      return []
    }
  }
})
