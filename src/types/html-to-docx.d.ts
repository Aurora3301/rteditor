declare module '@turbodocx/html-to-docx' {
  interface DocxOptions {
    table?: { row?: { cantSplit?: boolean } }
    footer?: boolean
    header?: boolean
    margins?: {
      top?: number
      bottom?: number
      left?: number
      right?: number
    }
  }

  export default function HTMLtoDOCX(
    html: string,
    headerHTMLString: string | null,
    options?: DocxOptions
  ): Promise<Blob>
}

