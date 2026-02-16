import Image from '@tiptap/extension-image'
import type { UploadHandler } from '../types'
import { getFileCategory, IMAGE_MIME_TYPES, DEFAULT_FILE_SIZE_LIMITS } from '../types'

export interface ImageUploadOptions {
  uploadHandler?: UploadHandler
  maxFileSize?: number
  allowedMimeTypes?: readonly string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      /** Upload a file and insert it as an image */
      insertImageFromFile: (file: File) => ReturnType
      /** Insert an image from a direct URL */
      insertImageFromUrl: (url: string, alt?: string) => ReturnType
    }
  }
}

export const ImageUploadExtension = Image.extend<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      ...this.parent?.(),
      uploadHandler: undefined,
      maxFileSize: DEFAULT_FILE_SIZE_LIMITS.image,
      allowedMimeTypes: IMAGE_MIME_TYPES,
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),

      insertImageFromFile:
        (file: File) =>
        ({ commands, editor }) => {
          const handler = this.options.uploadHandler
          if (!handler) {
            console.warn('[RTEditor] No upload handler configured')
            return false
          }

          // Validate file type
          const category = getFileCategory(file.type)
          if (category !== 'image') {
            console.warn('[RTEditor] File is not an image:', file.type)
            return false
          }

          // Validate file size
          const maxSize = this.options.maxFileSize ?? DEFAULT_FILE_SIZE_LIMITS.image
          if (file.size > maxSize) {
            console.warn('[RTEditor] File too large:', file.size)
            return false
          }

          // Perform upload asynchronously
          handler(file)
            .then((result) => {
              if (result?.url) {
                editor
                  .chain()
                  .focus()
                  .setImage({
                    src: result.url,
                    alt: result.alt || file.name,
                    title: result.title || '',
                  })
                  .run()
              }
            })
            .catch((err) => {
              console.error('[RTEditor] Image upload failed:', err)
            })

          return true
        },

      insertImageFromUrl:
        (url: string, alt?: string) =>
        ({ commands }) => {
          return commands.setImage({ src: url, alt: alt || '' })
        },
    }
  },

  addProseMirrorPlugins() {
    const handler = this.options.uploadHandler
    const extension = this

    return [
      ...(this.parent?.() ?? []),
      // We'll handle drag/drop and paste at the component level
      // since it integrates better with Vue's event system
    ]
  },
})
