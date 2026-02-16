import { describe, it, expect, vi, afterEach } from 'vitest'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { ImageUploadExtension } from '../../../src/extensions/ImageUploadExtension'

function createFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

describe('ImageUploadExtension', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('registers in editor without errors', () => {
    editor = new Editor({
      extensions: [StarterKit, ImageUploadExtension],
    })

    expect(editor).toBeDefined()
    expect(editor.isDestroyed).toBe(false)
  })

  it('insertImageFromFile command exists', () => {
    editor = new Editor({
      extensions: [StarterKit, ImageUploadExtension],
    })

    expect(editor.commands.insertImageFromFile).toBeDefined()
    expect(typeof editor.commands.insertImageFromFile).toBe('function')
  })

  it('insertImageFromUrl command exists', () => {
    editor = new Editor({
      extensions: [StarterKit, ImageUploadExtension],
    })

    expect(editor.commands.insertImageFromUrl).toBeDefined()
    expect(typeof editor.commands.insertImageFromUrl).toBe('function')
  })

  it('rejects non-image files', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    editor = new Editor({
      extensions: [
        StarterKit,
        ImageUploadExtension.configure({
          uploadHandler: vi.fn().mockResolvedValue({ url: 'https://example.com/img.jpg' }),
        }),
      ],
    })

    const textFile = createFile('doc.txt', 100, 'text/plain')
    const result = editor.commands.insertImageFromFile(textFile)

    expect(result).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith('[RTEditor] File is not an image:', 'text/plain')

    warnSpy.mockRestore()
  })

  it('rejects oversized files', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    editor = new Editor({
      extensions: [
        StarterKit,
        ImageUploadExtension.configure({
          uploadHandler: vi.fn().mockResolvedValue({ url: 'https://example.com/img.jpg' }),
          maxFileSize: 1024, // 1KB limit
        }),
      ],
    })

    const largeFile = createFile('big.png', 2048, 'image/png')
    const result = editor.commands.insertImageFromFile(largeFile)

    expect(result).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith('[RTEditor] File too large:', 2048)

    warnSpy.mockRestore()
  })

  it('returns false when no upload handler configured', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    editor = new Editor({
      extensions: [StarterKit, ImageUploadExtension],
    })

    const imageFile = createFile('photo.jpg', 100, 'image/jpeg')
    const result = editor.commands.insertImageFromFile(imageFile)

    expect(result).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith('[RTEditor] No upload handler configured')

    warnSpy.mockRestore()
  })

  it('insertImageFromUrl inserts image node with given URL', () => {
    editor = new Editor({
      extensions: [StarterKit, ImageUploadExtension],
      content: '<p></p>',
    })

    editor.commands.insertImageFromUrl('https://example.com/photo.jpg', 'A photo')

    const json = editor.getJSON()
    const imageNodes: any[] = []
    const findImage = (node: any) => {
      if (node.type === 'imageUpload' || node.type === 'image') imageNodes.push(node)
      if (node.content) node.content.forEach(findImage)
    }
    findImage(json)

    expect(imageNodes.length).toBe(1)
    expect(imageNodes[0].attrs.src).toBe('https://example.com/photo.jpg')
    expect(imageNodes[0].attrs.alt).toBe('A photo')
  })

  it('calls upload handler with valid image file', async () => {
    const mockHandler = vi.fn().mockResolvedValue({
      url: 'https://example.com/uploaded.jpg',
      alt: 'test',
    })

    editor = new Editor({
      extensions: [
        StarterKit,
        ImageUploadExtension.configure({
          uploadHandler: mockHandler,
        }),
      ],
      content: '<p></p>',
    })

    const imageFile = createFile('photo.jpg', 100, 'image/jpeg')
    const result = editor.commands.insertImageFromFile(imageFile)

    expect(result).toBe(true)
    expect(mockHandler).toHaveBeenCalledWith(imageFile)
  })
})
