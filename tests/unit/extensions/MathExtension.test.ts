import { describe, it, expect, afterEach } from 'vitest'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { MathExtension } from '../../../src/extensions/MathExtension'

describe('MathExtension', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('registers in editor without errors', () => {
    editor = new Editor({
      extensions: [StarterKit, MathExtension],
    })

    expect(editor).toBeDefined()
    expect(editor.isDestroyed).toBe(false)
  })

  it('insertMath command exists on the editor', () => {
    editor = new Editor({
      extensions: [StarterKit, MathExtension],
    })

    expect(editor.commands.insertMath).toBeDefined()
    expect(typeof editor.commands.insertMath).toBe('function')
  })

  it('insertMath inserts a math node with given attrs', () => {
    editor = new Editor({
      extensions: [StarterKit, MathExtension],
      content: '<p>Test</p>',
    })

    editor.commands.insertMath({ latex: 'x^2 + y^2 = z^2', display: false })

    const json = editor.getJSON()
    const mathNodes: any[] = []
    const findMath = (node: any) => {
      if (node.type === 'math') mathNodes.push(node)
      if (node.content) node.content.forEach(findMath)
    }
    findMath(json)

    expect(mathNodes.length).toBe(1)
    expect(mathNodes[0].attrs.latex).toBe('x^2 + y^2 = z^2')
  })

  it('math node has correct latex and display attributes', () => {
    editor = new Editor({
      extensions: [StarterKit, MathExtension],
      content: '<p></p>',
    })

    editor.commands.insertMath({ latex: '\\frac{a}{b}', display: true })

    const json = editor.getJSON()
    const mathNodes: any[] = []
    const findMath = (node: any) => {
      if (node.type === 'math') mathNodes.push(node)
      if (node.content) node.content.forEach(findMath)
    }
    findMath(json)

    expect(mathNodes.length).toBe(1)
    expect(mathNodes[0].attrs.latex).toBe('\\frac{a}{b}')
    expect(mathNodes[0].attrs.display).toBe(true)
  })

  it('default display is false (inline)', () => {
    editor = new Editor({
      extensions: [StarterKit, MathExtension],
      content: '<p></p>',
    })

    editor.commands.insertMath({ latex: 'a + b' })

    const json = editor.getJSON()
    const mathNodes: any[] = []
    const findMath = (node: any) => {
      if (node.type === 'math') mathNodes.push(node)
      if (node.content) node.content.forEach(findMath)
    }
    findMath(json)

    expect(mathNodes.length).toBe(1)
    expect(mathNodes[0].attrs.display).toBe(false)
  })
})
