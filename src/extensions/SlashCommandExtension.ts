import { Extension } from '@tiptap/core'
import { Suggestion } from '@tiptap/suggestion'
import type { Editor } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue-3'
import RTSlashCommandMenu from '../components/RTSlashCommandMenu.vue'

export interface SlashCommand {
  name: string
  label: string
  description: string
  icon: string
  category: 'format' | 'insert' | 'list' | 'media'
  action: (editor: Editor) => void
}

export interface SlashCommandOptions {
  commands?: SlashCommand[]
  suggestion?: Partial<any>
}

export const defaultSlashCommands: SlashCommand[] = [
  { name: 'heading1', label: 'Heading 1', description: 'Large heading', icon: 'H1', category: 'format', action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { name: 'heading2', label: 'Heading 2', description: 'Medium heading', icon: 'H2', category: 'format', action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { name: 'heading3', label: 'Heading 3', description: 'Small heading', icon: 'H3', category: 'format', action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { name: 'bulletList', label: 'Bullet List', description: 'Unordered list', icon: '•', category: 'list', action: (e) => e.chain().focus().toggleBulletList().run() },
  { name: 'orderedList', label: 'Numbered List', description: 'Ordered list', icon: '1.', category: 'list', action: (e) => e.chain().focus().toggleOrderedList().run() },
  { name: 'checklist', label: 'Checklist', description: 'Task list with checkboxes', icon: '☑', category: 'list', action: (e) => e.chain().focus().toggleTaskList().run() },
  { name: 'codeBlock', label: 'Code Block', description: 'Code snippet', icon: '<>', category: 'insert', action: (e) => e.chain().focus().toggleCodeBlock().run() },
  { name: 'blockquote', label: 'Quote', description: 'Block quote', icon: '"', category: 'format', action: (e) => e.chain().focus().toggleBlockquote().run() },
  { name: 'horizontalRule', label: 'Divider', description: 'Horizontal line', icon: '—', category: 'insert', action: (e) => e.chain().focus().setHorizontalRule().run() },
  { name: 'table', label: 'Table', description: 'Insert a table', icon: '⊞', category: 'insert', action: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
]

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return true
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

export const SlashCommandExtension = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      commands: defaultSlashCommands,
      suggestion: {
        char: '/',
        startOfLine: false,
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: this.options.suggestion?.char ?? '/',
        items: ({ query }: { query: string }) => {
          const commands = this.options.commands ?? defaultSlashCommands
          if (!query) return commands
          return commands.filter(cmd =>
            fuzzyMatch(query, cmd.name) ||
            fuzzyMatch(query, cmd.label) ||
            fuzzyMatch(query, cmd.description)
          )
        },
        render: () => {
          let component: VueRenderer | null = null
          let popup: HTMLElement | null = null

          return {
            onStart: (props: any) => {
              component = new VueRenderer(RTSlashCommandMenu, {
                props: {
                  items: props.items,
                  command: (item: SlashCommand) => {
                    props.command(item)
                  },
                },
                editor: props.editor,
              })

              if (!component.element) return

              popup = document.createElement('div')
              popup.className = 'rte-slash-command-popup'
              popup.style.position = 'absolute'
              popup.style.zIndex = '50'
              popup.appendChild(component.element)
              document.body.appendChild(popup)

              const { view } = props.editor
              const coords = view.coordsAtPos(props.range.from)
              popup.style.left = `${coords.left}px`
              popup.style.top = `${coords.bottom + 4}px`
            },
            onUpdate: (props: any) => {
              component?.updateProps({
                items: props.items,
                command: (item: SlashCommand) => {
                  props.command(item)
                },
              })

              if (popup) {
                const { view } = props.editor
                const coords = view.coordsAtPos(props.range.from)
                popup.style.left = `${coords.left}px`
                popup.style.top = `${coords.bottom + 4}px`
              }
            },
            onKeyDown: (props: any) => {
              if (props.event.key === 'Escape') {
                popup?.remove()
                popup = null
                component?.destroy()
                component = null
                return true
              }
              return component?.ref?.onKeyDown?.(props.event) ?? false
            },
            onExit: () => {
              popup?.remove()
              popup = null
              component?.destroy()
              component = null
            },
          }
        },
        command: ({ editor, range, props: item }: { editor: Editor; range: any; props: SlashCommand }) => {
          editor.chain().focus().deleteRange(range).run()
          item.action(editor)
        },
      }),
    ]
  },
})

