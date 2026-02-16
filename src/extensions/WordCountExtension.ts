import { Extension } from '@tiptap/core'

export interface WordCountStorage {
  words: number
  characters: number
  charactersWithSpaces: number
  sentences: number
  readingTime: number // in minutes
}

export interface WordCountExtensionOptions {
  /** Words per minute for reading time calculation. Default: 200 */
  wordsPerMinute?: number
  /** Callback when word count changes */
  onUpdate?: (stats: WordCountStorage) => void
}

/**
 * Count words in text, with CJK character support.
 * CJK characters are counted as individual words.
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0

  // Count CJK characters (each is a "word")
  const cjkRegex =
    /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uf900-\ufaff\u2e80-\u2eff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g
  const cjkMatches = text.match(cjkRegex)
  const cjkCount = cjkMatches ? cjkMatches.length : 0

  // Remove CJK characters and count remaining words
  const withoutCJK = text.replace(cjkRegex, ' ')
  const wordMatches = withoutCJK.trim().split(/\s+/).filter((w) => w.length > 0)
  const wordCount = wordMatches.length

  return cjkCount + wordCount
}

export const WordCountExtension = Extension.create<WordCountExtensionOptions>({
  name: 'wordCount',

  addOptions() {
    return {
      wordsPerMinute: 200,
      onUpdate: undefined,
    }
  },

  addStorage() {
    return {
      words: 0,
      characters: 0,
      charactersWithSpaces: 0,
      sentences: 0,
      readingTime: 0,
    } as WordCountStorage
  },

  onUpdate() {
    const text = this.editor.state.doc.textContent
    const words = countWords(text)
    const characters = text.replace(/\s/g, '').length
    const charactersWithSpaces = text.length
    const sentences = text
      .split(/[.!?。！？]+/)
      .filter((s) => s.trim().length > 0).length
    const wpm = this.options.wordsPerMinute ?? 200
    const readingTime = Math.max(1, Math.ceil(words / wpm))

    this.storage.words = words
    this.storage.characters = characters
    this.storage.charactersWithSpaces = charactersWithSpaces
    this.storage.sentences = sentences
    this.storage.readingTime = readingTime

    this.options.onUpdate?.(this.storage as WordCountStorage)
  },

  onCreate() {
    // Calculate initial counts
    this.options.onUpdate?.(this.storage as WordCountStorage)
  },
})

