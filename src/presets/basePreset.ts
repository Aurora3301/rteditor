import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { ResizableImageExtension } from '../extensions/ResizableImageExtension'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Placeholder from '@tiptap/extension-placeholder'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { HighlightExtension } from '../extensions/HighlightExtension'
import { ChecklistExtension } from '../extensions/ChecklistExtension'
import { TableExtension } from '../extensions/TableExtension'
import { CommentExtension } from '../extensions/CommentExtension'
import { FileAttachmentExtension } from '../extensions/FileAttachmentExtension'
import { CodeSnippetExtension } from '../extensions/CodeSnippetExtension'
import { MathExtension } from '../extensions/MathExtension'
import { WordCountExtension } from '../extensions/WordCountExtension'
import { SlashCommandExtension } from '../extensions/SlashCommandExtension'
import { StampExtension } from '../extensions/StampExtension'
import { DragHandleExtension } from '../extensions/DragHandleExtension'
import type { EditorPreset } from '../types'

export const basePreset: EditorPreset = {
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      undoRedo: { depth: 100 },
      horizontalRule: false,
      link: false,
      underline: false,
      codeBlock: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    ResizableImageExtension.configure({
      inline: false,
      allowBase64: false,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Subscript,
    Superscript,
    Placeholder.configure({
      placeholder: 'Start typing...',
    }),
    HorizontalRule,
    HighlightExtension,
    ChecklistExtension,
    TableExtension,
    CommentExtension,
    FileAttachmentExtension,
    CodeSnippetExtension,
    MathExtension,
    WordCountExtension,
    SlashCommandExtension,
    StampExtension,
    DragHandleExtension,
  ],
  toolbar: [
    'undo', 'redo', '|',
    'heading', '|',
    'bold', 'italic', 'underline', 'strike', '|',
    'subscript', 'superscript', '|',
    'textColor', 'highlight', '|',
    'alignLeft', 'alignCenter', 'alignRight', '|',
    'bulletList', 'orderedList', 'checklist', '|',
    'link', 'image', 'emoji', 'attachFile', '|',
    'table', 'codeBlock', 'math', '|',
    'comment', 'horizontalRule', '|',
    'wordCount', 'fullscreen', 'save',
  ],
  placeholder: 'Start typing...',
}
