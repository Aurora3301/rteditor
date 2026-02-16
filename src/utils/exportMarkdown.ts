/**
 * Convert TipTap/ProseMirror JSON document to Markdown string.
 * Supports GFM (GitHub Flavored Markdown) features.
 */

export interface ExportMarkdownOptions {
  /** Use GFM extensions (tables, task lists, strikethrough). Default: true */
  gfm?: boolean
  /** Heading style: 'atx' (#) or 'setext' (underline). Default: 'atx' */
  headingStyle?: 'atx' | 'setext'
}

interface DocNode {
  type: string
  content?: DocNode[]
  text?: string
  attrs?: Record<string, any>
  marks?: Array<{ type: string; attrs?: Record<string, any> }>
}

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1')
}

function processMarks(text: string, marks?: Array<{ type: string; attrs?: Record<string, any> }>): string {
  if (!marks || marks.length === 0) return text

  let result = text
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `**${result}**`
        break
      case 'italic':
        result = `*${result}*`
        break
      case 'underline':
        result = `<u>${result}</u>`
        break
      case 'strike':
        result = `~~${result}~~`
        break
      case 'code':
        result = `\`${result}\``
        break
      case 'link':
        result = `[${result}](${mark.attrs?.href || ''})`
        break
      case 'subscript':
        result = `<sub>${result}</sub>`
        break
      case 'superscript':
        result = `<sup>${result}</sup>`
        break
    }
  }
  return result
}

function inlineContent(content: DocNode[] | undefined, options: ExportMarkdownOptions): string {
  if (!content) return ''
  return content.map(n => {
    if (n.type === 'text') return processMarks(n.text || '', n.marks)
    if (n.type === 'hardBreak') return '  \n'
    if (n.type === 'image') return nodeToMarkdown(n, options)
    if (n.type === 'math') return nodeToMarkdown(n, options)
    return ''
  }).join('')
}

function nodeToMarkdown(node: DocNode, options: ExportMarkdownOptions, indent = ''): string {
  switch (node.type) {
    case 'doc':
      return (node.content || []).map(n => nodeToMarkdown(n, options, indent)).join('\n\n')

    case 'paragraph':
      return indent + inlineContent(node.content, options)

    case 'heading': {
      const level = node.attrs?.level || 1
      const text = inlineContent(node.content, options)
      if (options.headingStyle === 'setext' && level <= 2) {
        const underline = level === 1 ? '=' : '-'
        return `${text}\n${underline.repeat(Math.max(text.length, 3))}`
      }
      return `${'#'.repeat(level)} ${text}`
    }

    case 'bulletList':
      return (node.content || []).map(n => nodeToMarkdown(n, options, indent)).join('\n')

    case 'orderedList':
      return (node.content || []).map((n, i) => {
        const start = node.attrs?.start || 1
        const num = start + i
        return `${indent}${num}. ${inlineContent(n.content?.[0]?.content, options)}`
          + (n.content && n.content.length > 1
            ? '\n' + n.content.slice(1).map(c => nodeToMarkdown(c, options, indent + '   ')).join('\n')
            : '')
      }).join('\n')

    case 'listItem': {
      if (!node.content) return `${indent}- `
      const firstBlock = inlineContent(node.content[0]?.content, options)
      const rest = node.content.slice(1).map(c => nodeToMarkdown(c, options, indent + '  ')).join('\n')
      return `${indent}- ${firstBlock}${rest ? '\n' + rest : ''}`
    }

    case 'taskList':
      return (node.content || []).map(n => nodeToMarkdown(n, options, indent)).join('\n')

    case 'taskItem': {
      const checked = node.attrs?.checked ? 'x' : ' '
      const text = inlineContent(node.content?.[0]?.content, options)
      return `${indent}- [${checked}] ${text}`
    }

    case 'blockquote':
      return (node.content || []).map(n => '> ' + nodeToMarkdown(n, options)).join('\n> \n')

    case 'codeBlock': {
      const lang = node.attrs?.language || ''
      const code = node.content?.map(n => n.text || '').join('') || ''
      return `\`\`\`${lang}\n${code}\n\`\`\``
    }

    case 'horizontalRule':
      return '---'

    case 'image': {
      const src = node.attrs?.src || ''
      const alt = node.attrs?.alt || ''
      const title = node.attrs?.title
      return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
    }

    case 'table': {
      if (!options.gfm || !node.content) return ''
      const rows = node.content.filter(r => r.type === 'tableRow')
      if (rows.length === 0) return ''

      const headerRow = rows[0]
      const headerCells = (headerRow.content || []).map(cell =>
        inlineContent(cell.content?.[0]?.content, options)
      )
      const separator = headerCells.map(() => '---')
      const bodyRows = rows.slice(1).map(row =>
        (row.content || []).map(cell =>
          inlineContent(cell.content?.[0]?.content, options)
        )
      )

      const lines = [
        '| ' + headerCells.join(' | ') + ' |',
        '| ' + separator.join(' | ') + ' |',
        ...bodyRows.map(row => '| ' + row.join(' | ') + ' |'),
      ]
      return lines.join('\n')
    }

    case 'math': {
      const latex = node.attrs?.latex || ''
      const display = node.attrs?.display
      return display ? `$$\n${latex}\n$$` : `$${latex}$`
    }

    case 'hardBreak':
      return '  \n'

    case 'text':
      return processMarks(node.text || '', node.marks)

    default:
      // Fallback: try to render inline content
      if (node.content) {
        return (node.content || []).map(n => nodeToMarkdown(n, options, indent)).join('\n\n')
      }
      return ''
  }
}

/**
 * Export a TipTap JSON document to Markdown.
 */
export function exportMarkdown(json: Record<string, unknown>, options: ExportMarkdownOptions = {}): string {
  const opts: ExportMarkdownOptions = {
    gfm: true,
    headingStyle: 'atx',
    ...options,
  }
  return nodeToMarkdown(json as unknown as DocNode, opts)
}

/**
 * Export HTML string to Markdown (simplified conversion).
 */
export function htmlToMarkdown(html: string): string {
  // Basic HTML-to-Markdown conversion using regex
  let md = html
  // Headings
  md = md.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_, level, content) => '#'.repeat(parseInt(level)) + ' ' + content.replace(/<[^>]+>/g, ''))
  // Bold
  md = md.replace(/<(strong|b)>(.*?)<\/\1>/gi, '**$2**')
  // Italic
  md = md.replace(/<(em|i)>(.*?)<\/\1>/gi, '*$2*')
  // Strike
  md = md.replace(/<(del|s|strike)>(.*?)<\/\1>/gi, '~~$2~~')
  // Code
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`')
  // Links
  md = md.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
  // Images
  md = md.replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '  \n')
  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
  // Horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n')
  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '')
  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n').trim()
  return md
}

