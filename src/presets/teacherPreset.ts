import { basePreset } from './basePreset'
import { defaultSlashCommands, SlashCommandExtension } from '../extensions/SlashCommandExtension'
import type { SlashCommand } from '../extensions/SlashCommandExtension'
import type { Editor } from '@tiptap/core'
import type { EditorPreset } from '../types'

export interface LessonPlanSection {
  heading: string
  placeholder: string
}

export interface LessonPlanTemplate {
  name: string
  label: string
  sections: LessonPlanSection[]
}

export const defaultLessonPlanTemplates: LessonPlanTemplate[] = [
  {
    name: 'standard',
    label: 'Standard Lesson Plan',
    sections: [
      { heading: 'Objectives', placeholder: 'What will students learn?' },
      { heading: 'Materials', placeholder: 'List required materials...' },
      { heading: 'Activities', placeholder: 'Describe lesson activities...' },
      { heading: 'Assessment', placeholder: 'How will learning be assessed?' },
    ],
  },
  {
    name: '5e',
    label: '5E Model',
    sections: [
      { heading: 'Engage', placeholder: 'Hook activity...' },
      { heading: 'Explore', placeholder: 'Student exploration...' },
      { heading: 'Explain', placeholder: 'Direct instruction...' },
      { heading: 'Elaborate', placeholder: 'Extension activities...' },
      { heading: 'Evaluate', placeholder: 'Assessment strategy...' },
    ],
  },
]

export function buildLessonPlanHTML(template: LessonPlanTemplate): string {
  return template.sections
    .map((s) => `<h2>${s.heading}</h2><p>${s.placeholder}</p>`)
    .join('')
}

const teacherSlashCommands: SlashCommand[] = [
  ...defaultSlashCommands,
  {
    name: 'lesson-plan',
    label: 'Lesson Plan Template',
    description: 'Insert a lesson plan structure',
    icon: '📋',
    category: 'insert',
    action: (editor: Editor) => {
      const html = buildLessonPlanHTML(defaultLessonPlanTemplates[0])
      editor.chain().focus().insertContent(html).run()
    },
  },
  {
    name: '5e-model',
    label: '5E Model Template',
    description: 'Insert a 5E model lesson plan',
    icon: '📝',
    category: 'insert',
    action: (editor: Editor) => {
      const html = buildLessonPlanHTML(defaultLessonPlanTemplates[1])
      editor.chain().focus().insertContent(html).run()
    },
  },
]

// Replace SlashCommandExtension with teacher-configured version
const teacherExtensions = basePreset.extensions.filter(
  (ext) => {
    const name = (ext as any)?.name ?? (ext as any)?.config?.name
    return name !== 'slashCommand'
  }
)

export const teacherPreset: EditorPreset = {
  extensions: [
    ...teacherExtensions,
    SlashCommandExtension.configure({
      commands: teacherSlashCommands,
    }),
  ],
  toolbar: [
    'undo', 'redo', '|',
    'heading', 'textSize', '|',
    'bold', 'italic', 'underline', 'strike', '|',
    'subscript', 'superscript', '|',
    'textColor', 'highlight', '|',
    'alignLeft', 'alignCenter', 'alignRight', '|',
    'bulletList', 'orderedList', 'checklist', '|',
    'link', 'image', 'emoji', 'attachFile', '|',
    'table', 'codeBlock', 'math', '|',
    'comment', 'commentSidebar', 'horizontalRule', '|',
    'stamp', '|',
    'wordCount', 'fullscreen', 'save',
  ],
  bubbleMenu: {
    enabled: true,
    items: ['bold', 'italic', 'underline', 'strike', 'link', 'highlight', 'comment'],
  },
  placeholder: 'Start writing your lesson content...',
}

