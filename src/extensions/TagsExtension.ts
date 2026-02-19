import { Extension } from '@tiptap/core'

export interface TagsStorage {
  tags: string[]
  category: string | null
}

export interface TagsExtensionOptions {
  /** Maximum number of tags allowed. Default: 10 */
  maxTags?: number
  /** Autocomplete suggestions for tags */
  suggestions?: string[]
  /** Available categories for single-select */
  categories?: string[]
  /** Callback when tags change */
  onTagsChange?: (tags: string[]) => void
  /** Callback when category changes */
  onCategoryChange?: (category: string | null) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tags: {
      /** Add a tag to the document */
      addTag: (tag: string) => ReturnType
      /** Remove a tag from the document */
      removeTag: (tag: string) => ReturnType
      /** Set the document category */
      setCategory: (category: string | null) => ReturnType
      /** Get all tags (returns true, read tags from storage) */
      getTags: () => ReturnType
      /** Get the current category (returns true, read category from storage) */
      getCategory: () => ReturnType
    }
  }
}

export const TagsExtension = Extension.create<TagsExtensionOptions>({
  name: 'tags',

  addOptions() {
    return {
      maxTags: 10,
      suggestions: [],
      categories: [],
      onTagsChange: undefined,
      onCategoryChange: undefined,
    }
  },

  addStorage() {
    return {
      tags: [] as string[],
      category: null as string | null,
    } as TagsStorage
  },

  addCommands() {
    return {
      addTag:
        (tag: string) =>
        () => {
          const trimmed = tag.trim()
          if (!trimmed) return false

          const storage = this.storage as TagsStorage
          const maxTags = this.options.maxTags ?? 10

          // Duplicate prevention (case-insensitive)
          const lowerTag = trimmed.toLowerCase()
          if (storage.tags.some((t) => t.toLowerCase() === lowerTag)) {
            return false
          }

          // Max tags enforcement
          if (storage.tags.length >= maxTags) {
            return false
          }

          storage.tags = [...storage.tags, trimmed]
          this.options.onTagsChange?.(storage.tags)
          return true
        },

      removeTag:
        (tag: string) =>
        () => {
          const storage = this.storage as TagsStorage
          const lowerTag = tag.toLowerCase()
          const index = storage.tags.findIndex(
            (t) => t.toLowerCase() === lowerTag,
          )

          if (index === -1) return false

          storage.tags = storage.tags.filter((_, i) => i !== index)
          this.options.onTagsChange?.(storage.tags)
          return true
        },

      setCategory:
        (category: string | null) =>
        () => {
          const storage = this.storage as TagsStorage

          // Validate category if categories list is provided
          if (
            category !== null &&
            this.options.categories &&
            this.options.categories.length > 0 &&
            !this.options.categories.includes(category)
          ) {
            return false
          }

          storage.category = category
          this.options.onCategoryChange?.(category)
          return true
        },

      getTags:
        () =>
        () => {
          // Tags can be read from editor.storage.tags.tags
          const storage = this.storage as TagsStorage
          return storage.tags.length >= 0 // always returns true
        },

      getCategory:
        () =>
        () => {
          // Category can be read from editor.storage.tags.category
          const storage = this.storage as TagsStorage
          return storage.category !== undefined // always returns true
        },
    }
  },
})

