import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { HighlightExtension } from '../extensions/HighlightExtension'
import { ChecklistExtension } from '../extensions/ChecklistExtension'
import { WordCountExtension } from '../extensions/WordCountExtension'
import type { EditorPreset } from '../types'

/**
 * Student preset — a simplified, distraction-free editor configuration
 * optimized for quick note-taking and basic formatting.
 *
 * Excluded features: tables, code blocks, file attachments, math/formula,
 * slash commands, comment authoring, subscript/superscript, images.
 */
export const studentPreset: EditorPreset = {
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      undoRedo: { depth: 50 },
      horizontalRule: false,
      link: false,
      underline: false,
      codeBlock: false,
    }),
    Underline,
    Link.configure({
      openOnClick: true,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: 'Write your response here...',
    }),
    HighlightExtension,
    ChecklistExtension,
    WordCountExtension,
  ],
  toolbar: [
    'undo', 'redo', '|',
    'heading', '|',
    'bold', 'italic', 'underline', '|',
    'highlight', '|',
    'bulletList', 'orderedList', 'checklist', '|',
    'link', 'emoji', '|',
    'wordCount',
  ],
  bubbleMenu: {
    enabled: true,
    items: ['bold', 'italic', 'underline', 'link', 'highlight'],
  },
  placeholder: 'Write your response here...',
}

