export const sampleDocuments = {
  empty: { type: 'doc', content: [] },
  simpleParagraph: {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello World' }] }],
  },
  withFormatting: {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Bold ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'Italic' },
      ],
    }],
  },
  withHeadings: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'H1' }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'H2' }] },
    ],
  },
  withMath: {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Equation: ' },
        { type: 'math', attrs: { latex: 'E=mc^2', display: false } },
      ],
    }],
  },
}
