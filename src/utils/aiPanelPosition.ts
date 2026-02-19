import type { Editor } from '@tiptap/core'

export interface AIPanelPosition {
  top: number
  left: number
}

const MARGIN = 16
const PANEL_WIDTH = 380
const PANEL_HEIGHT = 320

/**
 * Calculates the position for the AI panel relative to the current cursor/selection.
 * Smart positioning: below cursor by default, flips above if near bottom.
 * Shifts left/right to stay in viewport with minimum 16px margin from edges.
 */
export function getAIPanelPosition(editor: Editor): AIPanelPosition {
  const { view, state } = editor
  const { from, to } = state.selection

  // Get coordinates of the selection
  const start = view.coordsAtPos(from)
  const end = view.coordsAtPos(to)

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Position below the selection by default
  let top = end.bottom + 8
  let left = start.left

  // If panel would go below viewport, flip above cursor
  if (top + PANEL_HEIGHT + MARGIN > viewportHeight) {
    top = start.top - PANEL_HEIGHT - 8
  }

  // Ensure top is not above viewport
  if (top < MARGIN) {
    top = MARGIN
  }

  // Shift left if panel would overflow right edge
  if (left + PANEL_WIDTH + MARGIN > viewportWidth) {
    left = viewportWidth - PANEL_WIDTH - MARGIN
  }

  // Ensure left is not off-screen
  if (left < MARGIN) {
    left = MARGIN
  }

  return { top, left }
}

