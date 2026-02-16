/**
 * Export editor content as PDF using the browser's print API.
 * This is a lightweight approach that doesn't require external libraries.
 */

export interface ExportPDFOptions {
  /** Document title for the PDF */
  title?: string
  /** CSS styles to include in the PDF */
  styles?: string
  /** Page margins */
  margin?: string
  /** Paper size */
  paperSize?: 'a4' | 'letter'
}

/**
 * Export HTML content as a downloadable PDF using a print window.
 */
export function exportPDF(html: string, options: ExportPDFOptions = {}): void {
  const { title = 'Document', styles = '', margin = '20mm', paperSize = 'a4' } = options

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups for this site.')
  }

  const pageCSS = paperSize === 'a4'
    ? '@page { size: A4; margin: ' + margin + '; }'
    : '@page { size: letter; margin: ' + margin + '; }'

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        ${pageCSS}
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 100%;
          padding: 0;
          margin: 0;
        }
        img { max-width: 100%; height: auto; }
        pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
        code { font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        blockquote { border-left: 3px solid #ddd; margin-left: 0; padding-left: 16px; color: #666; }
        h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
        ${styles}
      </style>
    </head>
    <body>${html}</body>
    </html>
  `)
  printWindow.document.close()

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
  // Fallback if onload doesn't fire
  setTimeout(() => {
    try {
      printWindow.print()
      printWindow.close()
    } catch { /* window may already be closed */ }
  }, 1000)
}

/**
 * Download HTML content as a PDF file.
 * Uses print-to-PDF approach — user selects "Save as PDF" in print dialog.
 */
export function downloadPDF(html: string, options: ExportPDFOptions = {}): void {
  exportPDF(html, options)
}

