import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { Component } from 'vue'
import RTFileAttachment from '../components/RTFileAttachment.vue'

export type FileAttachmentType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'unknown'

export interface FileAttachmentOptions {
  HTMLAttributes?: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileAttachment: {
      /** Insert a file attachment node */
      insertFileAttachment: (attrs: {
        url: string
        filename?: string
        filesize?: number
        filetype?: FileAttachmentType
        mimeType?: string
        width?: number | null
        height?: number | null
      }) => ReturnType
    }
  }
}

export const FileAttachmentExtension = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      url: { default: null },
      filename: { default: 'file' },
      filesize: { default: 0 },
      filetype: { default: 'unknown' },
      mimeType: { default: '' },
      width: { default: null },
      height: { default: null },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="file-attachment"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes ?? {}, HTMLAttributes, { 'data-type': 'file-attachment' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(RTFileAttachment as Component)
  },

  addCommands() {
    return {
      insertFileAttachment: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        })
      },
    }
  },
})
