/**
 * Print utility for editor content.
 * Opens a new window with styled content and triggers the browser print dialog.
 */

export interface PrintOptions {
  /** Document title shown in the print header */
  title?: string
  /** Additional CSS styles to inject */
  styles?: string
  /** Paper size for the @page rule */
  pageSize?: 'A4' | 'letter' | 'legal'
}

const PAGE_SIZE_CSS: Record<NonNullable<PrintOptions['pageSize']>, string> = {
  A4: 'size: A4;',
  letter: 'size: letter;',
  legal: 'size: legal;',
}

/**
 * Print HTML content by opening a new window, injecting styles, and triggering
 * the browser's native print dialog.
 *
 * @param html - The HTML string to print
 * @param options - Optional configuration for title, styles, and page size
 */
export function printContent(html: string, options: PrintOptions = {}): void {
  const {
    title = 'Document',
    styles = '',
    pageSize = 'A4',
  } = options

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups for this site.')
  }

  const pageSizeCSS = PAGE_SIZE_CSS[pageSize] || PAGE_SIZE_CSS.A4

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    @page {
      margin: 2cm;
      ${pageSizeCSS}
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 100%;
      padding: 0;
      margin: 0;
    }
    h1, h2, h3, h4 { page-break-after: avoid; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; }
    table, th, td { border: 1px solid #000; }
    th, td { padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    tr { page-break-inside: avoid; }
    pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      white-space: pre-wrap;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
    }
    blockquote {
      border-left: 3px solid #ddd;
      margin-left: 0;
      padding-left: 16px;
      color: #666;
    }
    a[href]::after {
      content: ' (' attr(href) ')';
      font-size: 0.8em;
      color: #666;
    }
    a[href^="#"]::after,
    a[href^="javascript"]::after {
      content: '';
    }
    ${styles}
  </style>
</head>
<body>${html}</body>
</html>`)
  printWindow.document.close()

  // Wait for content (especially images) to load, then trigger print
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }

  // Fallback if onload doesn't fire (some browsers)
  setTimeout(() => {
    try {
      printWindow.print()
      printWindow.close()
    } catch {
      /* window may already be closed */
    }
  }, 1000)
}

