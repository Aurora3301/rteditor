import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { Component } from 'vue'
import { common, createLowlight } from 'lowlight'
import RTCodeBlock from '../components/RTCodeBlock.vue'

/**
 * Pre-configured lowlight instance with common languages (~37 languages).
 * Consumers can import this to check registered languages or register additional ones.
 */
export const lowlightInstance = createLowlight(common)

export const SUPPORTED_LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'java',
  'c', 'cpp', 'csharp', 'css', 'go', 'graphql', 'json',
  'kotlin', 'lua', 'markdown', 'php', 'r', 'ruby', 'rust',
  'sql', 'shell', 'swift', 'xml', 'yaml',
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

export const CodeSnippetExtension = CodeBlockLowlight.extend<CodeSnippetOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      ...this.parent?.(),
      lowlight: lowlightInstance,
      languages: [...SUPPORTED_LANGUAGES],
      defaultLanguage: 'plaintext',
      showLineNumbers: true,
      enableTabIndentation: true,
      tabSize: 2,
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

