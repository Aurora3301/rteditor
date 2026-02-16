import { Mark, mergeAttributes } from '@tiptap/core'

export interface CommentExtensionOptions {
  /** Custom CSS class for comment highlights. Default: 'rte-comment-highlight' */
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /** Add a comment mark to the current selection */
      addComment: (attrs: { commentId: string; threadId: string }) => ReturnType
      /** Remove comment marks with the given commentId */
      removeComment: (commentId: string) => ReturnType
      /** Resolve a comment by updating its class to resolved */
      resolveComment: (commentId: string) => ReturnType
    }
  }
}

export const CommentExtension = Mark.create<CommentExtensionOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.commentId) {
            return {}
          }
          return { 'data-comment-id': attributes.commentId }
        },
      },
      threadId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-thread-id'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.threadId) {
            return {}
          }
          return { 'data-thread-id': attributes.threadId }
        },
      },
      resolved: {
        default: false,
        parseHTML: (element: HTMLElement) => element.classList.contains('rte-comment-highlight--resolved'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.resolved) {
            return {}
          }
          return { class: 'rte-comment-highlight--resolved' }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { class: 'rte-comment-highlight' },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ]
  },

  // Allow multiple overlapping comments
  excludes: '',

  addCommands() {
    return {
      addComment:
        (attrs: { commentId: string; threadId: string }) =>
        ({ commands }) => {
          return commands.setMark(this.name, {
            commentId: attrs.commentId,
            threadId: attrs.threadId,
          })
        },

      removeComment:
        (commentId: string) =>
        ({ tr, state, dispatch }) => {
          const { doc } = state
          let found = false

          doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (
                mark.type.name === this.name &&
                mark.attrs.commentId === commentId
              ) {
                found = true
                if (dispatch) {
                  tr.removeMark(pos, pos + node.nodeSize, mark)
                }
              }
            })
          })

          return found
        },

      resolveComment:
        (commentId: string) =>
        ({ tr, state, dispatch }) => {
          const { doc } = state
          let found = false

          doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (
                mark.type.name === this.name &&
                mark.attrs.commentId === commentId
              ) {
                found = true
                if (dispatch) {
                  const newMark = mark.type.create({
                    ...mark.attrs,
                    resolved: true,
                  })
                  tr.removeMark(pos, pos + node.nodeSize, mark)
                  tr.addMark(pos, pos + node.nodeSize, newMark)
                }
              }
            })
          })

          return found
        },
    }
  },
})
