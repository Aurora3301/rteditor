import Image from '@tiptap/extension-image'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import RTResizableImage from '../components/RTResizableImage.vue'

export interface ResizableImageOptions {
  /** Allow inline images (default: false) */
  inline?: boolean
  /** Allow base64 data URIs (default: false) */
  allowBase64?: boolean
  /** Minimum width in pixels (default: 50) */
  minWidth?: number
  /** Maximum width in pixels (default: none — uses container width) */
  maxWidth?: number
  /** Minimum height in pixels (default: 50) */
  minHeight?: number
  /** HTML attributes applied to the wrapper */
  HTMLAttributes?: Record<string, any>
}

export const ResizableImageExtension = Image.extend<ResizableImageOptions>({
  name: 'image',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: false,
      minWidth: 50,
      maxWidth: undefined,
      minHeight: 50,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const width = element.getAttribute('width') || element.style.width
          return width ? parseInt(width, 10) || null : null
        },
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const height = element.getAttribute('height') || element.style.height
          return height ? parseInt(height, 10) || null : null
        },
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },
      aspectRatio: {
        default: null,
        renderHTML: () => ({}),
      },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(RTResizableImage as any)
  },
})

