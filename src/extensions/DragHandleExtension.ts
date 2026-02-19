import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'

export interface DragHandleOptions {
  /** Custom class for the drag handle element */
  handleClass?: string
  /** Custom class for the drop indicator element */
  dropIndicatorClass?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dragHandle: {
      /** Move the current block node up */
      moveNodeUp: () => ReturnType
      /** Move the current block node down */
      moveNodeDown: () => ReturnType
    }
  }
}

/** SVG icon for the 6-dot drag grip */
const DRAG_HANDLE_SVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="4.5" cy="2.5" r="1.5"/><circle cx="9.5" cy="2.5" r="1.5"/><circle cx="4.5" cy="7" r="1.5"/><circle cx="9.5" cy="7" r="1.5"/><circle cx="4.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="11.5" r="1.5"/></svg>`

const dragHandlePluginKey = new PluginKey('dragHandle')

/**
 * Get the document offset of the i-th top-level child.
 */
function childOffset(doc: PMNode, index: number): number {
  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += doc.child(i).nodeSize
  }
  return offset
}

/**
 * Find the top-level block node at the given position.
 * Returns { pos, node, index } or null.
 */
function resolveTopLevelBlock(doc: PMNode, pos: number) {
  let offset = 0
  for (let i = 0; i < doc.childCount; i++) {
    const child = doc.child(i)
    const end = offset + child.nodeSize
    if (pos >= offset && pos < end) {
      return { pos: offset, node: child, index: i }
    }
    offset = end
  }
  return null
}

export const DragHandleExtension = Extension.create<DragHandleOptions>({
  name: 'dragHandle',

  addOptions() {
    return {
      handleClass: 'rte-drag-handle',
      dropIndicatorClass: 'rte-drop-indicator',
    }
  },

  addCommands() {
    return {
      moveNodeUp:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection, doc } = state
          const block = resolveTopLevelBlock(doc, selection.from)
          if (!block || block.index === 0) return false

          if (dispatch) {
            const prevPos = childOffset(doc, block.index - 1)
            const nodeSlice = doc.slice(block.pos, block.pos + block.node.nodeSize)
            tr.delete(block.pos, block.pos + block.node.nodeSize)
            tr.insert(prevPos, nodeSlice.content)
            tr.setSelection(TextSelection.create(tr.doc, prevPos + 1))
          }
          return true
        },

      moveNodeDown:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection, doc } = state
          const block = resolveTopLevelBlock(doc, selection.from)
          if (!block || block.index >= doc.childCount - 1) return false

          if (dispatch) {
            const nextBlock = doc.child(block.index + 1)
            const nextEnd = childOffset(doc, block.index + 1) + nextBlock.nodeSize
            const nodeSlice = doc.slice(block.pos, block.pos + block.node.nodeSize)
            tr.insert(nextEnd, nodeSlice.content)
            tr.delete(block.pos, block.pos + block.node.nodeSize)
            const newPos = nextEnd - block.node.nodeSize
            tr.setSelection(TextSelection.create(tr.doc, newPos + 1))
          }
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-ArrowUp': () => this.editor.commands.moveNodeUp(),
      'Mod-Shift-ArrowDown': () => this.editor.commands.moveNodeDown(),
    }
  },

  addProseMirrorPlugins() {
    const handleClass = this.options.handleClass ?? 'rte-drag-handle'
    const dropIndicatorClass =
      this.options.dropIndicatorClass ?? 'rte-drop-indicator'

    let draggedBlockIndex: number | null = null
    let dropTargetIndex: number | null = null
    let dropIndicatorEl: HTMLElement | null = null

    const editor = this.editor

    return [
      new Plugin({
        key: dragHandlePluginKey,
        props: {
          decorations: (state) => {
            const { doc } = state
            if (!editor.isEditable) return DecorationSet.empty
            const decorations: Decoration[] = []

            doc.forEach((node, offset, index) => {
              const widget = Decoration.widget(
                offset,
                () => {
                  const handle = document.createElement('button')
                  handle.className = handleClass
                  handle.setAttribute('type', 'button')
                  handle.setAttribute('aria-label', 'Drag to reorder')
                  handle.setAttribute('draggable', 'true')
                  handle.setAttribute('contenteditable', 'false')
                  handle.setAttribute('data-block-index', String(index))
                  handle.innerHTML = DRAG_HANDLE_SVG
                  return handle
                },
                { side: -1, key: `drag-handle-${index}` },
              )
              decorations.push(widget)
            })

            return DecorationSet.create(doc, decorations)
          },

          handleDOMEvents: {
            dragstart: (view, event) => {
              const target = event.target as HTMLElement
              if (!target.classList?.contains(handleClass)) return false

              const blockIndex = Number(target.getAttribute('data-block-index'))
              if (Number.isNaN(blockIndex)) return false

              draggedBlockIndex = blockIndex
              event.dataTransfer?.setData('text/plain', String(blockIndex))
              if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move'
              }
              target.style.cursor = 'grabbing'
              return false
            },

            dragover: (view, event) => {
              if (draggedBlockIndex === null) return false
              event.preventDefault()
              if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move'
              }

              const { doc } = view.state
              const coords = { left: event.clientX, top: event.clientY }
              const posAtCoords = view.posAtCoords(coords)
              if (!posAtCoords) return false

              const block = resolveTopLevelBlock(doc, posAtCoords.pos)
              if (!block) return false

              dropTargetIndex = block.index
              // Show drop indicator
              if (!dropIndicatorEl) {
                dropIndicatorEl = document.createElement('div')
                dropIndicatorEl.className = dropIndicatorClass
                view.dom.parentElement?.appendChild(dropIndicatorEl)
              }

              const blockDom = view.nodeDOM(block.pos)
              if (blockDom && blockDom instanceof HTMLElement) {
                const rect = blockDom.getBoundingClientRect()
                const parentRect = view.dom.parentElement?.getBoundingClientRect()
                if (parentRect) {
                  const midY = rect.top + rect.height / 2
                  const insertBefore = event.clientY < midY
                  const indicatorTop = insertBefore
                    ? rect.top - parentRect.top
                    : rect.bottom - parentRect.top
                  dropIndicatorEl.style.top = `${indicatorTop}px`
                  if (!insertBefore && dropTargetIndex !== null) {
                    dropTargetIndex = block.index + 1
                  }
                }
              }

              return false
            },

            drop: (view, event) => {
              if (draggedBlockIndex === null || dropTargetIndex === null) return false
              event.preventDefault()

              const fromIndex = draggedBlockIndex
              let toIndex = dropTargetIndex

              // Clean up
              draggedBlockIndex = null
              dropTargetIndex = null
              if (dropIndicatorEl) {
                dropIndicatorEl.remove()
                dropIndicatorEl = null
              }

              if (fromIndex === toIndex || fromIndex + 1 === toIndex) return false

              const { doc } = view.state
              if (fromIndex >= doc.childCount) return false

              const node = doc.child(fromIndex)
              const fromPos = childOffset(doc, fromIndex)
              const { tr } = view.state

              // Delete original
              tr.delete(fromPos, fromPos + node.nodeSize)

              // Calculate insertion position after deletion
              let insertPos: number
              if (toIndex > fromIndex) {
                // Adjust for deletion shift
                const adjustedIndex = toIndex - 1
                if (adjustedIndex >= tr.doc.childCount) {
                  insertPos = tr.doc.content.size
                } else {
                  insertPos = childOffset(tr.doc, adjustedIndex)
                }
              } else {
                if (toIndex >= tr.doc.childCount) {
                  insertPos = tr.doc.content.size
                } else {
                  insertPos = childOffset(tr.doc, toIndex)
                }
              }

              tr.insert(insertPos, node)
              view.dispatch(tr)
              return true
            },

            dragend: (_view, _event) => {
              draggedBlockIndex = null
              dropTargetIndex = null
              if (dropIndicatorEl) {
                dropIndicatorEl.remove()
                dropIndicatorEl = null
              }
              return false
            },
          },
        },
      }),
    ]
  },
})
