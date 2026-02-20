import { Extension } from '@tiptap/core'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

export interface TableExtensionOptions {
  /** Allow table resizing. Default: true */
  resizable?: boolean
  /** Custom HTML attributes for the table element */
  HTMLAttributes?: Record<string, any>
  /** Allow selecting the entire table node. Default: false */
  allowTableNodeSelection?: boolean
}

export const TableExtension = Extension.create<TableExtensionOptions>({
  name: 'tableExtension',

  addOptions() {
    return {
      resizable: true,
      HTMLAttributes: {},
      allowTableNodeSelection: false,
    }
  },

  addKeyboardShortcuts() {
    return {
      'Tab': () => {
        if (this.editor.isActive('table')) {
          return this.editor.commands.goToNextCell()
        }
        return false
      },
      'Shift-Tab': () => {
        if (this.editor.isActive('table')) {
          return this.editor.commands.goToPreviousCell()
        }
        return false
      },
    }
  },

  addExtensions() {
    return [
      Table.configure({
        resizable: this.options.resizable ?? true,
        allowTableNodeSelection: this.options.allowTableNodeSelection ?? false,
        HTMLAttributes: {
          class: 'rte-table',
          ...this.options.HTMLAttributes,
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
    ]
  },
})

