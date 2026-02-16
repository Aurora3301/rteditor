/**
 * Import and normalize CKEditor 4 HTML content for use in TipTap/ProseMirror.
 * Handles CKEditor-specific classes, attributes, and structures.
 */

export interface ImportCKEditorOptions {
  /** Remove CKEditor-specific classes and attributes. Default: true */
  cleanAttributes?: boolean
  /** Convert deprecated HTML elements. Default: true */
  convertDeprecated?: boolean
  /** Strip empty paragraphs. Default: false */
  stripEmptyParagraphs?: boolean
}

/**
 * Normalize CKEditor 4 HTML for TipTap consumption.
 */
export function importCKEditorHTML(html: string, options: ImportCKEditorOptions = {}): string {
  const {
    cleanAttributes = true,
    convertDeprecated = true,
    stripEmptyParagraphs = false,
  } = options

  let result = html

  if (convertDeprecated) {
    // Convert <b> to <strong>
    result = result.replace(/<b(\s|>)/gi, '<strong$1')
    result = result.replace(/<\/b>/gi, '</strong>')
    // Convert <i> to <em> (but not <img> etc)
    result = result.replace(/<i(\s|>)/gi, '<em$1')
    result = result.replace(/<\/i>/gi, '</em>')
    // Convert <u> stays as <u> (TipTap supports it)
    // Convert <font color="..."> to <span style="color: ...">
    result = result.replace(/<font\s+color="([^"]*)"[^>]*>(.*?)<\/font>/gi,
      '<span style="color: $1">$2</span>')
    // Convert <font size="..."> — remove since TipTap uses headings
    result = result.replace(/<font[^>]*>(.*?)<\/font>/gi, '$1')
    // Convert <center> to <div style="text-align: center">
    result = result.replace(/<center>(.*?)<\/center>/gi,
      '<div style="text-align: center">$1</div>')
  }

  if (cleanAttributes) {
    // Remove CKEditor-specific attributes
    result = result.replace(/\s+data-cke-[a-z-]+="[^"]*"/gi, '')
    // Remove contenteditable attributes
    result = result.replace(/\s+contenteditable="[^"]*"/gi, '')
    // Remove CKEditor widget wrappers
    result = result.replace(/<span[^>]*class="[^"]*cke_widget[^"]*"[^>]*>(.*?)<\/span>/gi, '$1')
    // Remove CKEditor filler elements
    result = result.replace(/<br\s+data-cke-filler="true"\s*\/?>/gi, '')
    // Remove empty style attributes
    result = result.replace(/\s+style=""/gi, '')
    // Remove empty class attributes
    result = result.replace(/\s+class=""/gi, '')
  }

  if (stripEmptyParagraphs) {
    // Remove empty paragraphs (with optional &nbsp; or <br>)
    result = result.replace(/<p[^>]*>(\s*(&nbsp;)?\s*(<br\s*\/?>)?\s*)<\/p>/gi, '')
  }

  // Normalize whitespace between tags
  result = result.replace(/>\s+</g, '> <')

  return result.trim()
}

/**
 * Export TipTap HTML in a format compatible with CKEditor 4.
 * Useful for systems that still use CKEditor 4 on other pages.
 */
export function exportForLegacy(html: string): string {
  let result = html

  // Convert TipTap's data attributes to standard HTML
  result = result.replace(/\s+data-language="([^"]*)"/gi, ' class="language-$1"')

  // Ensure paragraphs have standard format
  // TipTap sometimes outputs <p></p> for empty lines — convert to <p>&nbsp;</p>
  result = result.replace(/<p><\/p>/gi, '<p>&nbsp;</p>')

  return result.trim()
}

