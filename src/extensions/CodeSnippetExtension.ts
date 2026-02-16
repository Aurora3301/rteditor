import CodeBlock from '@tiptap/extension-code-block'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { Component } from 'vue'
import RTCodeBlock from '../components/RTCodeBlock.vue'

export const SUPPORTED_LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'java',
  'c', 'cpp', 'csharp', 'html', 'css', 'json', 'xml',
  'sql', 'bash', 'php', 'ruby', 'go', 'rust', 'swift',
  'kotlin', 'matlab', 'r', 'latex',
] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

export interface CodeSnippetOptions {
  /** Available languages for selection. Default: SUPPORTED_LANGUAGES */
  languages?: string[]
  /** Default language for new code blocks. Default: 'plaintext' */
  defaultLanguage?: string
  /** Show line numbers. Default: true */
  showLineNumbers?: boolean
  /** Custom HTML attributes */
  HTMLAttributes?: Record<string, any>
}

export const CodeSnippetExtension = CodeBlock.extend<CodeSnippetOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      ...this.parent?.(),
      languages: [...SUPPORTED_LANGUAGES],
      defaultLanguage: 'plaintext',
      showLineNumbers: true,
      HTMLAttributes: {
        class: 'rte-code-block',
      },
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: this.options.defaultLanguage ?? 'plaintext',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-language') || this.options.defaultLanguage || 'plaintext',
        renderHTML: (attributes: Record<string, any>) => ({
          'data-language': attributes.language,
        }),
      },
      showLineNumbers: {
        default: this.options.showLineNumbers ?? true,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-line-numbers') !== 'false',
        renderHTML: (attributes: Record<string, any>) => ({
          'data-line-numbers': attributes.showLineNumbers ? 'true' : 'false',
        }),
      },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(RTCodeBlock as Component)
  },
})

