import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { Component } from 'vue'
import MathNodeView from '../components/MathNodeView.vue'

export interface MathExtensionOptions {
  /** Whether to enable inline math */
  inline: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      /** Insert a math node */
      insertMath: (attrs: { latex: string; display?: boolean }) => ReturnType
    }
  }
}

export const MathExtension = Node.create<MathExtensionOptions>({
  name: 'math',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      inline: true,
    }
  },

  addAttributes() {
    return {
      latex: {
        default: '',
      },
      display: {
        default: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math"]',
      },
      {
        tag: 'div[data-type="math"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const tag = HTMLAttributes.display ? 'div' : 'span'
    return [
      tag,
      mergeAttributes(
        {
          'data-type': 'math',
          'data-latex': HTMLAttributes.latex,
          'data-display': HTMLAttributes.display ? 'true' : undefined,
        },
        HTMLAttributes,
      ),
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathNodeView as Component)
  },

  addCommands() {
    return {
      insertMath:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          })
        },
    }
  },
})
