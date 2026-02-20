/**
 * Export editor HTML content as a .docx file using @turbodocx/html-to-docx.
 * This library is browser-compatible (no Node.js dependencies).
 */

export interface ExportDocxOptions {
  /** Document title */
  title?: string
  /** Page margins in mm */
  margin?: number
}

/**
 * Convert HTML to a .docx Blob using @turbodocx/html-to-docx.
 */
export async function exportDocx(html: string, options: ExportDocxOptions = {}): Promise<Blob> {
  const { title = 'Document', margin = 20 } = options

  // Wrap in a full HTML document fragment
  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head><title>${title}</title></head>
    <body>${html}</body>
    </html>
  `

  // Dynamic import to keep it tree-shakeable
  const mod = await import('@turbodocx/html-to-docx')
  const HTMLtoDOCX = typeof mod.default === 'function' ? mod.default : typeof mod === 'function' ? mod : (mod as any)
  if (typeof HTMLtoDOCX !== 'function') {
    throw new Error('Failed to load DOCX converter — html-to-docx module did not export a function')
  }

  const blob = await HTMLtoDOCX(wrappedHtml, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    header: false,
    margins: {
      top: margin * 56.7,    // mm to twips (1mm ≈ 56.7 twips)
      bottom: margin * 56.7,
      left: margin * 56.7,
      right: margin * 56.7,
    },
  })

  return blob as Blob
}

