import { Extension } from '@tiptap/core'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

export interface ChecklistExtensionOptions {
  /** Allow nested checklist items. Default: true */
  nested?: boolean
  /** Custom HTML attributes for the task list element */
  HTMLAttributes?: Record<string, any>
}

/**
 * ChecklistExtension — a meta-extension that bundles TipTap's TaskList and
 * TaskItem into a single, pre-configured extension with toggleable checkboxes.
 *
 * @example
 * ```ts
 * import { ChecklistExtension } from '@timothyphchan/rteditor'
 *
 * const editor = new Editor({
 *   extensions: [
 *     ChecklistExtension.configure({ nested: true }),
 *   ],
 * })
 * ```
 */
export const ChecklistExtension = Extension.create<ChecklistExtensionOptions>({
  name: 'checklist',

  addOptions() {
    return {
      nested: true,
      HTMLAttributes: {},
    }
  },

  addExtensions() {
    return [
      TaskList.configure({
        HTMLAttributes: {
          class: 'rte-checklist',
          ...this.options.HTMLAttributes,
        },
      }),
      TaskItem.configure({
        nested: this.options.nested ?? true,
      }),
    ]
  },
})

