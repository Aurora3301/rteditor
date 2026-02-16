# RTEditor — Detailed Working Plan for Augment Store Agents

**Source:** `REQUIREMENTS.md` v1.4 (2026-02-12)
**Created:** 2026-02-12
**Purpose:** Step-by-step implementation tasks for AI agents. Each task is self-contained with full context, files, acceptance criteria, and dependencies.

---

## How to Use This Plan

- Tasks are ordered by dependency — execute them in order within each phase.
- Each task lists **Dependencies** (prior tasks that must be completed first).
- Each task lists **Files to Create/Modify** — these are the ONLY files the agent should touch.
- The **Technical Details** section provides implementation-level specifics.
- The **Acceptance Criteria** section defines "done".
- The project root is `rteditor/` (an npm package under the `@timothyphchan` scope).

---

## PHASE 1 — MVP (Target: v0.1.0)

### P1-001: Project Scaffolding & Build Configuration

**Dependencies:** None (first task)
**Priority:** P0 — Must be done first

**Description:**
Initialize the npm package, install all core dependencies, and configure the build toolchain. This creates the project skeleton that all other tasks build upon.

**Files to Create:**
- `package.json` — npm package manifest
- `tsconfig.json` — TypeScript configuration
- `tsup.config.ts` — Build configuration (dual ESM + CJS + UMD output)
- `vite.config.ts` — Vite config for demo app
- `.eslintrc.js` — ESLint configuration with TypeScript ESLint
- `.prettierrc` — Prettier configuration
- `.gitignore` — Git ignore rules
- `LICENSE` — MIT license
- `src/index.ts` — Main entry point (empty placeholder)

**Technical Details:**
1. Run `npm init --scope=@timothyphchan` with name `@timothyphchan/rteditor`, version `0.1.0-alpha.1`
2. Install core dependencies:
   ```
   npm install @tiptap/core @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit @tiptap/extension-heading @tiptap/extension-bullet-list @tiptap/extension-ordered-list @tiptap/extension-link @tiptap/extension-image @tiptap/extension-history @tiptap/extension-underline @tiptap/extension-strike @tiptap/extension-text-align @tiptap/extension-horizontal-rule @tiptap/extension-subscript @tiptap/extension-superscript @tiptap/extension-placeholder dompurify katex
   ```
3. Install peer dependencies:
   ```
   npm install --save-peer vue@^3.3.0
   ```
4. Install dev dependencies:
   ```
   npm install -D typescript tsup vitest @vue/test-utils @vitejs/plugin-vue vite eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier vue-tsc
   ```
5. Configure `tsup.config.ts`:
   - Entry: `src/index.ts`
   - Format: `['esm', 'cjs']`
   - DTS: true (generate type declarations)
   - External: `['vue', '@tiptap/vue-3', '@tiptap/pm']` (peer deps)
   - Clean: true
6. Configure `tsconfig.json`:
   - `strict: true`, `target: "ES2020"`, `module: "ESNext"`, `moduleResolution: "bundler"`
   - Path alias: `"@/*": ["./src/*"]`
   - Include: `["src/**/*"]`
7. Configure `package.json` exports:
   ```json
   {
     "main": "./dist/index.cjs",
     "module": "./dist/index.mjs",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": { "import": "./dist/index.mjs", "require": "./dist/index.cjs", "types": "./dist/index.d.ts" },
       "./style.css": "./dist/style.css"
     },
     "sideEffects": ["*.css", "*.vue"],
     "files": ["dist"],
     "scripts": {
       "build": "tsup",
       "dev": "vite demo",
       "test": "vitest run",
       "test:watch": "vitest",
       "test:coverage": "vitest run --coverage",
       "lint": "eslint src --ext .ts,.vue",
       "format": "prettier --write src",
       "typecheck": "vue-tsc --noEmit"
     }
   }
   ```

**Acceptance Criteria:**
- [ ] `npm install` succeeds without errors
- [ ] `npm run build` produces `dist/index.mjs`, `dist/index.cjs`, `dist/index.d.ts`
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `package.json` has correct `name`, `version`, `peerDependencies`, `exports`
- [ ] `.gitignore` excludes `node_modules/`, `dist/`, `.env`

**Testing:** No tests yet (this is infrastructure). Verify build output exists.

---

### P1-002: TypeScript Type Definitions

**Dependencies:** P1-001
**Priority:** P0

**Description:**
Define all TypeScript interfaces and types used across the package. These are the contracts that all components, composables, and extensions depend on.

> **Phase 4 Note:** AI-related types (`AIHandler`, `AIRequest`, `AIResponse`, `AIOptions`, `AIMetadata`, `AIQuickAction`, `AIState`) are defined in P4-001. The `src/types/index.ts` barrel export will be extended in Phase 4.

**Files to Create:**
- `src/types/editor.ts` — Editor-related types
- `src/types/preset.ts` — Preset system types
- `src/types/upload.ts` — Upload handler types
- `src/types/index.ts` — Re-exports all types

**Technical Details:**

`src/types/editor.ts`:
```typescript
import type { Editor } from '@tiptap/core'
import type { Extension } from '@tiptap/core'

export interface RTEditorProps {
  modelValue?: string           // v-model (HTML string)
  preset?: EditorPreset         // Preset configuration
  extensions?: Extension[]      // Custom extensions (overrides preset)
  toolbar?: ToolbarConfig       // Custom toolbar (overrides preset)
  placeholder?: string          // Placeholder text
  readonly?: boolean            // Read-only mode (Phase 2)
  locale?: string               // i18n locale (Phase 2)
  uploadHandler?: UploadHandler // File upload callback
  editable?: boolean            // Whether editor is editable
  autofocus?: boolean           // Auto-focus on mount
}

export interface RTEditorEmits {
  'update:modelValue': [value: string]
  'update:json': [value: Record<string, any>]
  'focus': []
  'blur': []
  'create': [editor: Editor]
  'destroy': []
}

export type ToolbarItem =
  | 'bold' | 'italic' | 'underline' | 'strike'
  | 'subscript' | 'superscript'
  | 'heading' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'bulletList' | 'orderedList'
  | 'link' | 'image' | 'attachFile'
  | 'math'
  | 'alignLeft' | 'alignCenter' | 'alignRight'
  | 'horizontalRule'
  | 'undo' | 'redo'
  | '|'  // separator

export type ToolbarConfig = ToolbarItem[]
```

`src/types/preset.ts`:
```typescript
import type { Extension } from '@tiptap/core'
import type { ToolbarConfig } from './editor'

export interface EditorPreset {
  extensions: Extension[]
  toolbar: ToolbarConfig
  menuBar?: MenuBarConfig
  bubbleMenu?: BubbleMenuConfig
  theme?: ThemeConfig
  placeholder?: string
  editorProps?: Record<string, any>
}

export interface MenuBarConfig {
  enabled: boolean
  items?: string[]
}

export interface BubbleMenuConfig {
  enabled: boolean
  items?: string[]
}

export interface ThemeConfig {
  name: string
  cssFile?: string
  variables?: Record<string, string>
}
```

`src/types/upload.ts`:
```typescript
export interface UploadHandler {
  (file: File): Promise<UploadResult>
}

export interface UploadResult {
  url: string
  alt?: string
  title?: string
  filename?: string
  filesize?: number
}

export type FileCategory = 'image' | 'pdf' | 'document'

export interface FileSizeLimits {
  image: number   // bytes, default 5MB
  pdf: number     // bytes, default 1MB
  document: number // bytes, default 1MB
}

export const DEFAULT_FILE_SIZE_LIMITS: FileSizeLimits = {
  image: 5 * 1024 * 1024,
  pdf: 1 * 1024 * 1024,
  document: 1 * 1024 * 1024,
}

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
export const PDF_MIME_TYPES = ['application/pdf'] as const
export const DOCUMENT_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const

export function getFileCategory(mimeType: string): FileCategory | null {
  if ((IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) return 'image'
  if ((PDF_MIME_TYPES as readonly string[]).includes(mimeType)) return 'pdf'
  if ((DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType)) return 'document'
  return null
}
```

`src/types/index.ts`:
```typescript
export * from './editor'
export * from './preset'
export * from './upload'
```

**Acceptance Criteria:**
- [ ] All types compile without errors (`npm run typecheck`)
- [ ] No `any` types in public API
- [ ] All types are exported from `src/types/index.ts`
- [ ] `UploadHandler`, `UploadResult`, `EditorPreset`, `ToolbarConfig` are all defined
- [ ] `getFileCategory()` correctly categorizes all supported MIME types

**Testing:** Write unit tests for `getFileCategory()` in `tests/unit/types/upload.test.ts`.

---

### P1-003: HTML Sanitization Utility

**Dependencies:** P1-001
**Priority:** P0

**Description:**
Create the HTML sanitization utility using DOMPurify. This is used whenever user-provided HTML is imported into the editor, and when exporting HTML.

**Files to Create:**
- `src/utils/sanitize.ts`

**Technical Details:**
```typescript
import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'pre', 'code',
  'hr',
  'sub', 'sup',
  'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'src', 'alt', 'title', 'width', 'height',
  'class', 'style',
  'data-type', 'data-latex', 'data-comment-id',
  'colspan', 'rowspan',
]

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}

export function stripAllHTML(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
```

**Acceptance Criteria:**
- [ ] `sanitizeHTML()` removes `<script>` tags
- [ ] `sanitizeHTML()` removes `javascript:` URLs
- [ ] `sanitizeHTML()` preserves allowed formatting tags
- [ ] `sanitizeHTML()` preserves image `src` and `alt` attributes
- [ ] `stripAllHTML()` returns plain text only
- [ ] No `eval()` or `innerHTML` used directly

**Testing:** Write unit tests in `tests/unit/utils/sanitize.test.ts` covering XSS vectors, allowed tags, and edge cases.

---

### P1-004: Export HTML Utility

**Dependencies:** P1-001, P1-003
**Priority:** P0

**Description:**
Create utility to export editor content as a sanitized HTML string. Works with TipTap's `editor.getHTML()` output.

**Files to Create:**
- `src/utils/exportHTML.ts`

**Technical Details:**
```typescript
import type { Editor } from '@tiptap/core'
import { sanitizeHTML } from './sanitize'

export function exportHTML(editor: Editor): string {
  const html = editor.getHTML()
  return sanitizeHTML(html)
}

export function exportRawHTML(editor: Editor): string {
  return editor.getHTML()
}
```

**Acceptance Criteria:**
- [ ] `exportHTML()` returns sanitized HTML string from editor
- [ ] `exportRawHTML()` returns unsanitized HTML (for trusted contexts)
- [ ] Output uses semantic HTML (`<strong>`, `<em>`, not `<b>`, `<i>` from CKEditor)
- [ ] HTML is well-formed

**Testing:** Write unit tests in `tests/unit/utils/exportHTML.test.ts`.

---

### P1-005: Export JSON Utility

**Dependencies:** P1-001
**Priority:** P0

**Description:**
Create utility to export editor content as ProseMirror JSON. This preserves the full document structure for lossless round-trips.

**Files to Create:**
- `src/utils/exportJSON.ts`

**Technical Details:**
```typescript
import type { Editor } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'

export function exportJSON(editor: Editor): JSONContent {
  return editor.getJSON()
}

export function validateJSON(json: unknown): json is JSONContent {
  if (!json || typeof json !== 'object') return false
  const doc = json as Record<string, unknown>
  if (doc.type !== 'doc') return false
  if (!Array.isArray(doc.content)) return false
  return true
}
```

**Acceptance Criteria:**
- [ ] `exportJSON()` returns valid ProseMirror JSON
- [ ] `validateJSON()` accepts valid documents and rejects invalid ones
- [ ] JSON round-trip is lossless (export → import produces identical content)

**Testing:** Write unit tests in `tests/unit/utils/exportJSON.test.ts`.

---

### P1-006: Utils Index

**Dependencies:** P1-003, P1-004, P1-005
**Priority:** P0

**Description:**
Create the utils barrel export file.

**Files to Create:**
- `src/utils/index.ts`

**Technical Details:**
```typescript
export { sanitizeHTML, stripAllHTML } from './sanitize'
export { exportHTML, exportRawHTML } from './exportHTML'
export { exportJSON, validateJSON } from './exportJSON'
```

**Acceptance Criteria:**
- [ ] All utilities re-exported from index

**Testing:** None (barrel file).

---

### P1-007: useTheme Composable

**Dependencies:** P1-001, P1-002
**Priority:** P0

**Description:**
Create the Vue 3 composable for managing CSS custom properties theming. Applies theme variables to the editor container.

**Files to Create:**
- `src/composables/useTheme.ts`

**Technical Details:**
```typescript
import { ref, watch, onMounted } from 'vue'
import type { ThemeConfig } from '../types'

export function useTheme(config?: ThemeConfig) {
  const currentTheme = ref<string>(config?.name ?? 'default')

  function applyTheme(el: HTMLElement, variables?: Record<string, string>) {
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        el.style.setProperty(key, value)
      })
    }
  }

  function setTheme(name: string) {
    currentTheme.value = name
  }

  return { currentTheme, applyTheme, setTheme }
}
```

**Acceptance Criteria:**
- [ ] `useTheme()` returns reactive `currentTheme`
- [ ] `applyTheme()` sets CSS custom properties on element
- [ ] `setTheme()` updates current theme name
- [ ] Works with Vue 3 Composition API

**Testing:** Write unit tests in `tests/unit/composables/useTheme.test.ts`.

---

### P1-008: useUpload Composable

**Dependencies:** P1-001, P1-002
**Priority:** P0

**Description:**
Create the Vue 3 composable that wraps the consumer-provided upload handler. Provides file validation, progress tracking, and error handling.

**Files to Create:**
- `src/composables/useUpload.ts`

**Technical Details:**
```typescript
import { ref } from 'vue'
import type { UploadHandler, UploadResult, FileSizeLimits } from '../types'
import { getFileCategory, DEFAULT_FILE_SIZE_LIMITS, IMAGE_MIME_TYPES, PDF_MIME_TYPES, DOCUMENT_MIME_TYPES } from '../types'

export function useUpload(handler?: UploadHandler, limits?: Partial<FileSizeLimits>) {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)
  const fileSizeLimits: FileSizeLimits = { ...DEFAULT_FILE_SIZE_LIMITS, ...limits }

  const allAllowedTypes = [
    ...IMAGE_MIME_TYPES,
    ...PDF_MIME_TYPES,
    ...DOCUMENT_MIME_TYPES,
  ]

  function validateFile(file: File): string | null {
    const category = getFileCategory(file.type)
    if (!category) return `Unsupported file type: ${file.type}`
    const limit = fileSizeLimits[category]
    if (file.size > limit) {
      const limitMB = (limit / (1024 * 1024)).toFixed(0)
      return `File too large (max ${limitMB} MB for ${category})`
    }
    return null
  }

  async function upload(file: File): Promise<UploadResult | null> {
    if (!handler) {
      uploadError.value = 'No upload handler configured'
      return null
    }
    const validationError = validateFile(file)
    if (validationError) {
      uploadError.value = validationError
      return null
    }
    isUploading.value = true
    uploadError.value = null
    try {
      const result = await handler(file)
      return result
    } catch (err) {
      uploadError.value = err instanceof Error ? err.message : 'Upload failed'
      return null
    } finally {
      isUploading.value = false
    }
  }

  return { upload, isUploading, uploadError, validateFile, allAllowedTypes }
}
```

**Acceptance Criteria:**
- [ ] `upload()` calls consumer handler and returns result
- [ ] `validateFile()` rejects unsupported MIME types
- [ ] `validateFile()` rejects files exceeding size limits (5MB images, 1MB docs/PDFs)
- [ ] `isUploading` is reactive and tracks upload state
- [ ] `uploadError` provides clear error messages
- [ ] Custom `FileSizeLimits` can override defaults

**Testing:** Write unit tests in `tests/unit/composables/useUpload.test.ts` covering: valid upload, size exceeded, invalid type, handler error, no handler.

---

### P1-009: useEditor Composable

**Dependencies:** P1-001, P1-002, P1-007, P1-008
**Priority:** P0

**Description:**
Create the core Vue 3 composable that manages the TipTap editor instance lifecycle. This is the heart of the package — it initializes the editor, handles v-model binding, and cleans up on unmount.

**Files to Create:**
- `src/composables/useEditor.ts`
- `src/composables/index.ts`

**Technical Details:**

`src/composables/useEditor.ts`:
```typescript
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import { Editor } from '@tiptap/core'
import type { Extension, JSONContent } from '@tiptap/core'

export interface UseEditorOptions {
  content?: string | JSONContent
  extensions?: Extension[]
  editable?: boolean
  autofocus?: boolean | 'start' | 'end'
  placeholder?: string
  onUpdate?: (props: { editor: Editor }) => void
  onCreate?: (props: { editor: Editor }) => void
  onDestroy?: () => void
}

export function useEditor(options: UseEditorOptions) {
  const editor = shallowRef<Editor | null>(null)
  const isReady = ref(false)

  onMounted(() => {
    editor.value = new Editor({
      extensions: options.extensions ?? [],
      content: options.content ?? '',
      editable: options.editable ?? true,
      autofocus: options.autofocus ?? false,
      onUpdate: options.onUpdate,
      onCreate: (props) => {
        isReady.value = true
        options.onCreate?.(props)
      },
      onDestroy: () => {
        isReady.value = false
        options.onDestroy?.()
      },
    })
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
    editor.value = null
  })

  return { editor, isReady }
}
```

`src/composables/index.ts`:
```typescript
export { useEditor } from './useEditor'
export type { UseEditorOptions } from './useEditor'
export { useUpload } from './useUpload'
export { useTheme } from './useTheme'
```

**Acceptance Criteria:**
- [ ] `useEditor()` creates a TipTap Editor instance on mount
- [ ] Editor is destroyed on component unmount (no memory leaks)
- [ ] `isReady` becomes `true` after editor creation
- [ ] `editor` is a shallow ref (performance — avoids deep reactivity on ProseMirror state)
- [ ] All options are passed through to TipTap Editor constructor
- [ ] Composable follows Vue 3 Composition API patterns

**Testing:** Write unit tests in `tests/unit/composables/useEditor.test.ts` testing lifecycle, content initialization, and cleanup.

---

### P1-010: Default Theme CSS

**Dependencies:** P1-001
**Priority:** P0

**Description:**
Create the default theme CSS file with all CSS custom properties. This provides the beautiful out-of-the-box appearance.

**Files to Create:**
- `src/themes/default.css`
- `src/themes/index.ts`

**Technical Details:**

`src/themes/default.css` — Implement ALL CSS custom properties from Sections 7.1 and 19 of REQUIREMENTS.md:
- Colors: `--rte-primary`, `--rte-text`, `--rte-background`, `--rte-border`, etc.
- Typography: system font stack, 16px base, 1.6 line-height
- Spacing: 4px-based scale
- Toolbar: background, border, height, sticky top, z-index
- Editor: padding, `--rte-editor-max-width: 100%` (consumer controls width via parent)
- Full-screen mode: `--rte-fullscreen-bg`, `--rte-fullscreen-z-index`
- Toast notifications: `--rte-toast-bg`, `--rte-toast-text`, `--rte-toast-error-bg`, `--rte-toast-success-bg`
- Upload placeholder: `--rte-upload-placeholder-bg`, `--rte-upload-placeholder-border`
- Comment sidebar: `--rte-sidebar-width`, `--rte-sidebar-bg`, `--rte-sidebar-border`
- All `.rte-*` component classes

**Notion-Inspired Design Direction:**
Follow a content-first, clean minimal aesthetic (see REQUIREMENTS.md Section 19.1). Generous whitespace, subtle borders, hover-to-reveal controls, understated toolbar. Each block (paragraph, heading, list, image) is visually distinct.

Key CSS classes to define:
- `.rte-editor` — Main editor container (`width: 100%`)
- `.rte-editor--fullscreen` — Full-screen mode (`position: fixed; inset: 0; z-index: var(--rte-fullscreen-z-index)`)
- `.rte-toolbar` — Toolbar container (`position: sticky; top: var(--rte-toolbar-sticky-top); z-index: var(--rte-toolbar-z-index)`)
- `.rte-toolbar__button` — Individual toolbar button (48px height, hover/active/disabled states)
- `.rte-toolbar__separator` — Vertical separator (`|`)
- `.rte-toolbar__group` — Button group
- `.rte-toolbar__scroll-left`, `.rte-toolbar__scroll-right` — Scroll arrow buttons (mobile only)
- `.rte-body` — Flex row container for content + sidebar (`display: flex`)
- `.rte-content` — Editor content area (ProseMirror editable div, `flex: 1`)
- `.rte-sidebar` — Comment sidebar panel (`width: var(--rte-sidebar-width)`, hidden by default)
- `.rte-bubble-menu` — Floating bubble menu
- `.rte-toast-container` — Fixed toast notification area (bottom-right)
- `.rte-toast` — Individual toast notification
- `.rte-upload-placeholder` — Inline upload placeholder node (dashed border, spinner)
- Typography styles for content: `h1`–`h6`, `p`, `ul`, `ol`, `li`, `a`, `img`, `hr`, `blockquote`
- Focus indicators: `outline: 2px solid var(--rte-focus); outline-offset: 2px`
- WCAG AA contrast ratios for all text colors

**Mobile horizontal scroll toolbar** (see REQUIREMENTS.md Section 13.3):
```css
@media (max-width: 767px) {
  .rte-toolbar {
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none;
  }
  .rte-toolbar::-webkit-scrollbar { display: none; }
  .rte-toolbar__scroll-left,
  .rte-toolbar__scroll-right { display: flex; }
}
```

`src/themes/index.ts`:
```typescript
export const defaultTheme = {
  name: 'default',
  cssFile: 'default.css',
}
```

**Acceptance Criteria:**
- [ ] All CSS custom properties from Sections 7.1 and 19 are defined
- [ ] Body text contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] UI component contrast ratio ≥ 3:1
- [ ] Focus indicators visible on all interactive elements
- [ ] System font stack for performance
- [ ] Toolbar buttons have hover, active, disabled states
- [ ] Editor content has proper typography hierarchy (h1–h6)
- [ ] No CSS preprocessor used (plain CSS only)
- [ ] `@media (prefers-reduced-motion: reduce)` disables animations
- [ ] Sticky toolbar CSS: `position: sticky; top: 0; z-index: 10`
- [ ] Editor width defaults to 100% (no fixed max-width)
- [ ] Full-screen mode CSS (`.rte-editor--fullscreen`) with `position: fixed; inset: 0`
- [ ] Toast notification styles (`.rte-toast-container`, `.rte-toast`)
- [ ] Upload placeholder styles (`.rte-upload-placeholder`) with dashed border and spinner
- [ ] Comment sidebar styles (`.rte-sidebar`) with responsive breakpoints
- [ ] Mobile toolbar horizontal scroll with hidden scrollbar
- [ ] Scroll arrow buttons (`.rte-toolbar__scroll-left/right`) visible on mobile only
- [ ] Notion-inspired minimal aesthetic: subtle borders, generous whitespace, content-first

**Testing:** Visual inspection. Contrast ratios can be verified with automated tools in E2E tests (Phase 2).

---

### P1-011: Base Preset

**Dependencies:** P1-002
**Priority:** P0

**Description:**
Create the `basePreset` configuration object that bundles the minimum set of extensions and toolbar items for Phase 1 MVP.

> **Phase 4 Note:** In Phase 4, `basePreset` toolbar will include `'ai'` button. AI is enabled by default in base and teacher presets, hidden in student preset (P4-006, P4-012).

**Files to Create:**
- `src/presets/basePreset.ts`
- `src/presets/index.ts`

**Technical Details:**

`src/presets/basePreset.ts`:
```typescript
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Placeholder from '@tiptap/extension-placeholder'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import type { EditorPreset } from '../types'

export const basePreset: EditorPreset = {
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      history: { depth: 100 },
    }),
    Underline,
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    Image.configure({ inline: false, allowBase64: false }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Subscript,
    Superscript,
    Placeholder.configure({ placeholder: 'Start typing...' }),
    HorizontalRule,
  ],
  toolbar: [
    'undo', 'redo', '|',
    'heading', '|',
    'bold', 'italic', 'underline', 'strike', '|',
    'subscript', 'superscript', '|',
    'alignLeft', 'alignCenter', 'alignRight', '|',
    'bulletList', 'orderedList', '|',
    'link', 'image', '|',
    'horizontalRule',
  ],
  placeholder: 'Start typing...',
}
```

Note: `MathExtension` and `ImageUploadExtension` will be added to the preset after they are created in P1-017 and P1-018.

`src/presets/index.ts`:
```typescript
export { basePreset } from './basePreset'
// teacherPreset and studentPreset will be added in Phase 2
```

**Acceptance Criteria:**
- [ ] `basePreset` includes all Phase 1 extensions
- [ ] `basePreset.toolbar` lists all Phase 1 toolbar items
- [ ] `basePreset` conforms to `EditorPreset` interface
- [ ] Extensions are configured with sensible defaults
- [ ] Link extension configured with `rel="noopener noreferrer"` for security

**Testing:** Write unit tests in `tests/unit/presets/basePreset.test.ts` verifying preset structure and extension presence.

---

### P1-012: RTToolbar Component

**Dependencies:** P1-002, P1-010, P1-011
**Priority:** P0

**Description:**
Create the toolbar Vue component that renders formatting buttons based on the toolbar configuration. This is a core UI component.

> **Phase 4 Note:** An `'ai'` toolbar button (✨ icon) will be added in P4-006. The toolbar item registry will include an AI entry that opens the floating AI panel.

**Files to Create:**
- `src/components/RTToolbar.vue`

**Technical Details:**

The toolbar receives a TipTap `Editor` instance and a `ToolbarConfig` array as props. It renders buttons for each toolbar item. Each button:
- Has `aria-label` with shortcut info (e.g., "Bold (Ctrl+B)")
- Has `aria-pressed` for toggle state
- Has `disabled` state when action is unavailable
- Shows tooltip on hover and focus
- Uses `data-testid` for testing

Props:
```typescript
interface RTToolbarProps {
  editor: Editor | null
  toolbar: ToolbarConfig
}
```

Implementation approach:
- Use `<script setup lang="ts">`
- Create a toolbar item registry mapping `ToolbarItem` strings to `{ icon, label, shortcut, action, isActive }` objects
- Render buttons dynamically from the `toolbar` array
- Use `editor.isActive()` for toggle state
- Use `editor.can()` for disabled state
- Use `editor.chain().focus().<command>().run()` for actions
- Implement heading dropdown (not individual h1-h6 buttons)
- Add `role="toolbar"` and `aria-label="Formatting toolbar"` to container
- Tab/Shift+Tab navigation between buttons
- Grouping with `|` separator rendered as `<span class="rte-toolbar__separator">`

**Sticky positioning (REQUIREMENTS.md Section 19.3):**
- Apply `position: sticky; top: var(--rte-toolbar-sticky-top, 0); z-index: var(--rte-toolbar-z-index, 10)` to the toolbar container.
- Toolbar remains visible when user scrolls through long editor content.

**Horizontal scroll on mobile (REQUIREMENTS.md Section 19.3):**
- Toolbar container has `overflow-x: auto; white-space: nowrap; scrollbar-width: none` on mobile (< 768px).
- Left/right scroll arrow buttons (`.rte-toolbar__scroll-left`, `.rte-toolbar__scroll-right`) appear at the edges when toolbar items overflow.
- Arrows fade in/out based on scroll position (hidden when fully scrolled to that edge).
- Use `ref` to track scroll position and `IntersectionObserver` or `scrollLeft` checks for arrow visibility.

**New toolbar buttons:**
- `fullscreen` → Emits `toggle-fullscreen` event, toggles `.rte-editor--fullscreen` on parent RTEditor. Icon: expand/compress. See P2-021.
- `wordCount` → Toggles a floating popover showing word/character count and reading time. See P2-014.

Key toolbar item mappings:
- `bold` → `editor.chain().focus().toggleBold().run()`
- `italic` → `editor.chain().focus().toggleItalic().run()`
- `underline` → `editor.chain().focus().toggleUnderline().run()`
- `strike` → `editor.chain().focus().toggleStrike().run()`
- `heading` → Dropdown with H1–H6 and Paragraph options
- `bulletList` → `editor.chain().focus().toggleBulletList().run()`
- `orderedList` → `editor.chain().focus().toggleOrderedList().run()`
- `link` → Emits event to open RTLinkDialog
- `image` / `attachFile` → Opens file picker
- `undo` → `editor.chain().focus().undo().run()`
- `redo` → `editor.chain().focus().redo().run()`
- `horizontalRule` → `editor.chain().focus().setHorizontalRule().run()`
- `alignLeft/Center/Right` → `editor.chain().focus().setTextAlign('left'|'center'|'right').run()`
- `subscript` → `editor.chain().focus().toggleSubscript().run()`
- `superscript` → `editor.chain().focus().toggleSuperscript().run()`
- `fullscreen` → Emits `toggle-fullscreen` (handled by RTEditor parent)
- `wordCount` → Toggles word count popover (see P2-014)
- `commentSidebar` → Emits `toggle-sidebar` (handled by RTEditor parent, see P2-020)

**Acceptance Criteria:**
- [ ] Renders all Phase 1 toolbar buttons from config
- [ ] Bold/Italic/Underline/Strike buttons toggle correctly
- [ ] Heading dropdown shows H1–H6 + Paragraph
- [ ] Active state (aria-pressed) reflects current formatting
- [ ] Disabled state for unavailable actions (e.g., undo when no history)
- [ ] All buttons have `aria-label` with keyboard shortcut
- [ ] `role="toolbar"` on container
- [ ] Tooltip on hover and focus
- [ ] Separator (`|`) renders visual divider
- [ ] **Sticky toolbar:** Stays visible when scrolling long content
- [ ] **Mobile horizontal scroll:** Toolbar scrolls horizontally on < 768px with hidden scrollbar
- [ ] **Scroll arrows:** Left/right arrow buttons appear when toolbar overflows on mobile
- [ ] **Fullscreen button:** Emits `toggle-fullscreen` event when clicked
- [ ] **Word count button:** Toggles word count popover
- [ ] **Comment sidebar button:** Emits `toggle-sidebar` event when clicked

**Testing:** Write component tests in `tests/unit/components/RTToolbar.test.ts` testing rendering, button clicks, active states, sticky positioning class, scroll arrow visibility.

---

### P1-013: RTLinkDialog Component

**Dependencies:** P1-002, P1-010
**Priority:** P0

**Description:**
Create the link dialog component for inserting and editing links. Appears when user clicks the link toolbar button or selects text and presses Ctrl+K.

**Files to Create:**
- `src/components/RTLinkDialog.vue`

**Technical Details:**

Props:
```typescript
interface RTLinkDialogProps {
  editor: Editor | null
  isOpen: boolean
  initialUrl?: string
  initialText?: string
}
```

Emits:
```typescript
'close': []
'submit': [{ url: string, text?: string }]
```

Features:
- Modal dialog with URL input and optional text input
- Validates URL (must be `http://`, `https://`, or `mailto:`)
- "Open in new tab" checkbox (default: checked)
- "Remove link" button (when editing existing link)
- Focus trap inside dialog
- Escape key closes dialog
- Enter key submits
- `aria-label`, `role="dialog"`, `aria-modal="true"`
- Focus returns to editor on close

**Acceptance Criteria:**
- [ ] Dialog opens/closes via `isOpen` prop
- [ ] URL validation rejects `javascript:` URLs
- [ ] Submit inserts/updates link in editor
- [ ] Remove button removes link from selected text
- [ ] Focus trapped inside dialog
- [ ] Escape closes dialog
- [ ] Accessible with screen readers

**Testing:** Write component tests in `tests/unit/components/RTLinkDialog.test.ts`.

---

### P1-014: RTBubbleMenu Component

**Dependencies:** P1-002, P1-010
**Priority:** P0

**Description:**
Create the floating bubble menu component that appears when text is selected. Shows quick formatting options.

> **Phase 4 Note:** An "Ask AI" button will be added to the bubble menu in P4-009. When clicked, it opens the AI panel in transform mode with the selected text as context.

**Files to Create:**
- `src/components/RTBubbleMenu.vue`

**Technical Details:**

Uses TipTap's `BubbleMenu` component from `@tiptap/vue-3`:
```typescript
import { BubbleMenu } from '@tiptap/vue-3'
```

Props:
```typescript
interface RTBubbleMenuProps {
  editor: Editor | null
  items?: ToolbarItem[]  // Default: ['bold', 'italic', 'underline', 'link']
}
```

- Renders a small floating toolbar near selected text
- Default items: Bold, Italic, Underline, Link
- Uses same button rendering logic as RTToolbar
- Smart positioning to avoid viewport edges
- `aria-label="Quick formatting menu"`

**Acceptance Criteria:**
- [ ] Appears when text is selected
- [ ] Disappears when selection is cleared
- [ ] Formatting buttons work (bold, italic, underline)
- [ ] Link button opens link dialog
- [ ] Positioned near selection, not outside viewport
- [ ] Accessible with keyboard

**Testing:** Write component tests in `tests/unit/components/RTBubbleMenu.test.ts`.

---

### P1-015: RTImageUpload Component

**Dependencies:** P1-002, P1-008, P1-010
**Priority:** P0

**Description:**
Create the image upload UI component with file picker, drag & drop, progress indicator, and error display. This is the UI layer — the actual upload logic lives in `useUpload`.

**Files to Create:**
- `src/components/RTImageUpload.vue`

**Technical Details:**

This component is triggered when the user clicks the "attach file" / "image" toolbar button or drops a file onto the editor. For Phase 1, only image files are handled (PDF/doc support comes in Phase 2).

Features:
- File picker opens on button click (accepts `image/jpeg,image/png,image/gif,image/webp`)
- Drag and drop support on editor content area
- **Inline upload placeholder** (see REQUIREMENTS.md Section 19.8): When upload starts, an inline placeholder ProseMirror node (`.rte-upload-placeholder`, `atom: true`) is inserted at the cursor position. The placeholder shows a loading spinner, file name, and upload progress percentage. It uses `--rte-upload-placeholder-bg` with a dashed border.
- **Toast notification for errors** (see REQUIREMENTS.md Section 19.8): On upload failure, the placeholder is removed and a toast notification appears in the bottom-right corner (`.rte-toast-container`). Toast shows an error icon and message (e.g., "Upload failed: file too large"). Toast auto-dismisses after 5 seconds or can be manually closed.
- After successful upload, placeholder is replaced by the final `<img>` node
- Image resize handles (use TipTap Image extension's built-in resize if available, or custom implementation)
- Image alignment (left, center, right via `data-align` attribute or wrapping `<figure>`)
- Alt text input (required for accessibility)

**Files to Create (additional):**
- `src/components/RTToast.vue` — Reusable toast notification component (used across the editor for upload errors and other messages). Props: `message`, `type` ('error' | 'success' | 'info'), `duration` (default: 5000ms), `dismissible` (default: true).
- `src/extensions/UploadPlaceholderExtension.ts` — ProseMirror node for the inline upload placeholder (`atom: true`, `draggable: false`, displays spinner + file name + progress).

**Acceptance Criteria:**
- [ ] File picker opens and accepts image MIME types only
- [ ] Drag and drop inserts images
- [ ] **Inline placeholder** appears in editor during upload with spinner and progress
- [ ] **Placeholder replaced** by final `<img>` on successful upload
- [ ] **Toast notification** appears on upload error (bottom-right, auto-dismiss 5s)
- [ ] Error toast shown for: file too large, invalid type, upload failed
- [ ] Successful upload inserts responsive `<img>` in editor
- [ ] Alt text is prompted/editable
- [ ] Files > 5MB rejected client-side

**Testing:** Write component tests in `tests/unit/components/RTImageUpload.test.ts` with mock upload handler. Test placeholder insertion/removal and toast display on error.

---

### P1-016: MathExtension (KaTeX)

**Dependencies:** P1-001, P1-002
**Priority:** P0

**Description:**
Create the custom TipTap extension for LaTeX math equations using KaTeX. Supports inline math (`$...$`) and block math (`$$...$$`).

**Files to Create:**
- `src/extensions/MathExtension.ts`
- `src/extensions/index.ts`

**Technical Details:**

The MathExtension is a TipTap Node extension that:
1. Defines a `math` node type in the ProseMirror schema
2. Stores the LaTeX source in a `latex` attribute
3. Renders using KaTeX (lazy-loaded)
4. Supports inline and block display modes

```typescript
import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

// Lazy load KaTeX
let katexPromise: Promise<typeof import('katex')> | null = null
const loadKaTeX = () => {
  if (!katexPromise) {
    katexPromise = import('katex')
  }
  return katexPromise
}
```

Node schema:
```typescript
{
  name: 'math',
  group: 'inline',    // or 'block' for display mode
  inline: true,
  atom: true,          // non-editable as a whole
  attrs: {
    latex: { default: '' },
    display: { default: false },  // inline vs block
  },
  parseDOM: [{ tag: 'span[data-type="math"]' }, { tag: 'div[data-type="math"]' }],
  renderHTML: ({ HTMLAttributes }) => ['span', mergeAttributes({ 'data-type': 'math' }, HTMLAttributes)],
}
```

Commands:
- `insertMath({ latex: string, display?: boolean })` — Insert math node
- `updateMath({ latex: string })` — Update selected math node

Node view (Vue component):
- Click to edit: opens inline editor with LaTeX source
- Renders KaTeX output in view mode
- Error state for invalid LaTeX (red border + error message)
- Uses `VueNodeViewRenderer` for Vue integration

`src/extensions/index.ts`:
```typescript
export { MathExtension } from './MathExtension'
export { ImageUploadExtension } from './ImageUploadExtension'
```

**Acceptance Criteria:**
- [ ] Inline math renders correctly (`$x^2$` displays as x²)
- [ ] Block math renders correctly (`$$\sum_{i=0}^n$$` displays centered)
- [ ] Click on math node opens editor
- [ ] Invalid LaTeX shows error state (not crash)
- [ ] KaTeX is lazy-loaded (not in initial bundle)
- [ ] Math nodes preserved in HTML export (`<span data-type="math" data-latex="...">`)
- [ ] Math nodes preserved in JSON export

**Testing:** Write extension tests in `tests/unit/extensions/MathExtension.test.ts` testing node creation, commands, and rendering.

---

### P1-017: ImageUploadExtension

**Dependencies:** P1-001, P1-002, P1-008
**Priority:** P0

**Description:**
Create the custom TipTap extension for handling image uploads. Integrates with the `useUpload` composable for file validation and upload, and extends TipTap's Image extension with upload capabilities.

**Files to Create:**
- `src/extensions/ImageUploadExtension.ts`

**Technical Details:**

Extends TipTap's Image extension to add:
1. Upload handler integration (calls consumer's `UploadHandler`)
2. Drag & drop handling (intercepts drop events with image files)
3. Paste handling (intercepts paste events with image data)
4. Client-side file validation (size, type)
5. Placeholder node during upload (shows loading state)

```typescript
import Image from '@tiptap/extension-image'
import type { UploadHandler } from '../types'

export interface ImageUploadOptions {
  uploadHandler?: UploadHandler
  maxFileSize?: number        // default: 5MB
  allowedMimeTypes?: string[] // default: IMAGE_MIME_TYPES
}

export const ImageUploadExtension = Image.extend<ImageUploadOptions>({
  // Override handleDrop to intercept image files
  // Override handlePaste to intercept pasted images
  // Add insertImageFromFile command
})
```

Commands:
- `insertImageFromFile(file: File)` — Validate, upload, and insert image
- `insertImageFromUrl(url: string, alt?: string)` — Insert image from URL directly

**Acceptance Criteria:**
- [ ] Drop image file onto editor triggers upload and insertion
- [ ] Paste image triggers upload and insertion
- [ ] Toolbar button triggers file picker → upload → insertion
- [ ] Loading placeholder shown during upload
- [ ] Error displayed if upload fails
- [ ] Files > 5MB rejected client-side
- [ ] Non-image files rejected
- [ ] Image node has `src`, `alt`, `title` attributes
- [ ] Images are responsive (max-width: 100%)

**Testing:** Write extension tests in `tests/unit/extensions/ImageUploadExtension.test.ts` with mock upload handler.

---

### P1-018: RTEditor Main Component

**Dependencies:** P1-002, P1-007, P1-008, P1-009, P1-010, P1-011, P1-012, P1-013, P1-014, P1-015, P1-016, P1-017
**Priority:** P0

**Description:**
Create the main `RTEditor.vue` component — the primary export of the package. This orchestrates all sub-components and provides the v-model interface.

> **Phase 4 Note:** In P4-012, RTEditor gains `ai-handler` and `ai-options` props, initializes `useAI` composable, renders `RTAIPanel`, and connects AI to toolbar/bubble menu/keyboard shortcuts.

**Files to Create:**
- `src/components/RTEditor.vue`

**Technical Details:**

This is the top-level component that consumers use:
```vue
<rt-editor v-model="content" :preset="basePreset" :upload-handler="handler" />
```

Props (from `RTEditorProps` interface in P1-002):
- `modelValue` (string) — v-model HTML content
- `preset` (EditorPreset) — Preset configuration (default: `basePreset`)
- `extensions` (Extension[]) — Override preset extensions
- `toolbar` (ToolbarConfig) — Override preset toolbar
- `placeholder` (string) — Override preset placeholder
- `readonly` (boolean) — Disable editing
- `uploadHandler` (UploadHandler) — Consumer upload handler
- `editable` (boolean) — Whether editor is editable
- `autofocus` (boolean) — Focus on mount

Emits:
- `update:modelValue` — v-model update with HTML string
- `update:json` — Optional JSON content update
- `focus` / `blur` — Editor focus events
- `create` / `destroy` — Lifecycle events

Implementation:
1. Uses `useEditor` composable to manage TipTap Editor instance
2. Uses `useUpload` composable for upload handling
3. Uses `useTheme` composable for theming
4. Renders: RTToolbar → .rte-body (flex row: EditorContent + optional sidebar) → RTBubbleMenu → RTToast container
5. Wires up v-model: `editor.on('update')` → `emit('update:modelValue', editor.getHTML())`
6. Watches `modelValue` prop for external content changes
7. Imports default theme CSS
8. Container has class `rte-editor` with ARIA attributes, `width: 100%`
9. Provides `editor` instance via Vue `provide()` for child components
10. Manages full-screen mode state (`isFullscreen` ref, toggled by RTToolbar `toggle-fullscreen` event)
11. Manages comment sidebar visibility (`isSidebarOpen` ref, toggled by RTToolbar `toggle-sidebar` event)
12. Provides toast notification system (reactive `toasts` array, `addToast()` / `removeToast()` methods)
13. Listens for `Escape` key to exit full-screen mode
14. Listens for `F11` / `Ctrl+Shift+F` / `Cmd+Shift+F` to toggle full-screen mode

Template structure (see REQUIREMENTS.md Section 19.2):
```html
<div
  class="rte-editor"
  :class="{
    'rte-editor--readonly': readonly,
    'rte-editor--fullscreen': isFullscreen,
    'rte-editor--sidebar-open': isSidebarOpen,
  }"
>
  <RTToolbar
    :editor="editor"
    :toolbar="toolbarConfig"
    @toggle-fullscreen="isFullscreen = !isFullscreen"
    @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
  />
  <div class="rte-body">
    <EditorContent :editor="editor" class="rte-content" />
    <aside v-if="isSidebarOpen" class="rte-sidebar">
      <!-- RTCommentSidebar rendered here (Phase 2, P2-020) -->
      <slot name="sidebar" />
    </aside>
  </div>
  <RTBubbleMenu :editor="editor" />
  <RTLinkDialog :editor="editor" :is-open="linkDialogOpen" @close="linkDialogOpen = false" />
  <div class="rte-toast-container" aria-live="polite">
    <RTToast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      @dismiss="removeToast(toast.id)"
    />
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] `v-model` works (two-way HTML binding)
- [ ] Preset applies extensions and toolbar configuration
- [ ] Custom extensions can override preset
- [ ] Custom toolbar can override preset
- [ ] Upload handler is passed to image upload components
- [ ] Editor is destroyed on unmount (no memory leaks)
- [ ] All sub-components render correctly
- [ ] ARIA attributes on container (`role="textbox"`, `aria-multiline="true"`)
- [ ] Works with Vue 3.3+ (Composition API, `<script setup>`)
- [ ] No console warnings
- [ ] **Editor width:** Container fills 100% of parent width
- [ ] **Full-screen mode:** `.rte-editor--fullscreen` fills viewport with `position: fixed; inset: 0`
- [ ] **Full-screen exit:** Escape key exits full-screen, keyboard shortcut toggles it
- [ ] **Sidebar slot:** `<aside class="rte-sidebar">` renders when `isSidebarOpen` is true
- [ ] **Toast container:** `.rte-toast-container` renders toast notifications from `toasts` array
- [ ] **Body flex layout:** `.rte-body` uses `display: flex` for content + sidebar layout

**Testing:** Write component tests in `tests/unit/components/RTEditor.test.ts` testing v-model, preset application, lifecycle, full-screen toggle, sidebar toggle, toast display.

---

### P1-019: Main Entry Point & Package Exports

**Dependencies:** P1-018 (and transitively all previous tasks)
**Priority:** P0

**Description:**
Create the main entry point that exports all public APIs. This defines the package's public surface area.

**Files to Create/Modify:**
- `src/index.ts` — Main entry point (update the placeholder from P1-001)

**Technical Details:**
```typescript
// Components
export { default as RTEditor } from './components/RTEditor.vue'
export { default as RTToolbar } from './components/RTToolbar.vue'
export { default as RTBubbleMenu } from './components/RTBubbleMenu.vue'
export { default as RTLinkDialog } from './components/RTLinkDialog.vue'
export { default as RTImageUpload } from './components/RTImageUpload.vue'

// Presets
export { basePreset } from './presets'

// Composables
export { useEditor, useUpload, useTheme } from './composables'

// Extensions
export { MathExtension, ImageUploadExtension } from './extensions'

// Utilities
export { exportHTML, exportRawHTML, exportJSON, validateJSON, sanitizeHTML } from './utils'

// Types (re-exported for consumers)
export type {
  RTEditorProps,
  RTEditorEmits,
  ToolbarItem,
  ToolbarConfig,
  EditorPreset,
  ThemeConfig,
  UploadHandler,
  UploadResult,
  FileCategory,
  FileSizeLimits,
} from './types'

// Theme CSS (consumers import separately)
// import '@timothyphchan/rteditor/style.css'
```

**Acceptance Criteria:**
- [ ] All public components, composables, presets, extensions, utilities, and types are exported
- [ ] `npm run build` produces working `dist/index.mjs` and `dist/index.cjs`
- [ ] Type declarations generated in `dist/index.d.ts`
- [ ] CSS output in `dist/style.css`
- [ ] Exports < 20 symbols (API surface area target)
- [ ] `import { RTEditor, basePreset } from '@timothyphchan/rteditor'` works

**Testing:** Verify build output. Import test in demo app (P1-024).

---

### P1-020: Unit Tests — Utilities & Types

**Dependencies:** P1-002, P1-003, P1-004, P1-005
**Priority:** P0

**Description:**
Write comprehensive unit tests for all utility functions and type helpers.

**Files to Create:**
- `tests/unit/utils/sanitize.test.ts`
- `tests/unit/utils/exportHTML.test.ts`
- `tests/unit/utils/exportJSON.test.ts`
- `tests/unit/types/upload.test.ts`

**Technical Details:**

`sanitize.test.ts` — Test cases:
- Removes `<script>` tags
- Removes `<script>` in attributes (`onerror`, `onclick`)
- Removes `javascript:` URLs in href
- Preserves `<strong>`, `<em>`, `<p>`, `<h1>`–`<h6>`
- Preserves `<img>` with `src`, `alt`
- Preserves `<a>` with `href` (http/https only)
- Handles empty input
- Handles null/undefined gracefully

`exportHTML.test.ts` — Test cases:
- Exports basic paragraph
- Exports formatted text (bold, italic)
- Exports headings
- Exports lists
- Exports links
- Output is sanitized

`exportJSON.test.ts` — Test cases:
- Exports valid ProseMirror JSON structure
- `validateJSON()` accepts valid docs
- `validateJSON()` rejects non-object input
- `validateJSON()` rejects missing `type: 'doc'`

`upload.test.ts` — Test cases:
- `getFileCategory()` returns 'image' for JPEG/PNG/GIF/WebP
- `getFileCategory()` returns 'pdf' for application/pdf
- `getFileCategory()` returns 'document' for Word/Excel/PPT MIME types
- `getFileCategory()` returns null for unsupported types

**Acceptance Criteria:**
- [ ] All tests pass (`npm run test`)
- [ ] Coverage > 90% for utility functions
- [ ] Edge cases tested (empty input, null, XSS vectors)

---

### P1-021: Unit Tests — Composables

**Dependencies:** P1-007, P1-008, P1-009
**Priority:** P0

**Description:**
Write unit tests for all composables.

**Files to Create:**
- `tests/unit/composables/useTheme.test.ts`
- `tests/unit/composables/useUpload.test.ts`
- `tests/unit/composables/useEditor.test.ts`
- `tests/mocks/editor.ts` — Mock editor instance

**Technical Details:**

`tests/mocks/editor.ts`:
```typescript
import { vi } from 'vitest'

export const createMockEditor = () => ({
  chain: () => ({
    focus: () => ({
      toggleBold: vi.fn().mockReturnThis(),
      toggleItalic: vi.fn().mockReturnThis(),
      toggleUnderline: vi.fn().mockReturnThis(),
      run: vi.fn(),
    }),
  }),
  getHTML: vi.fn().mockReturnValue('<p>Test</p>'),
  getJSON: vi.fn().mockReturnValue({ type: 'doc', content: [] }),
  isActive: vi.fn().mockReturnValue(false),
  can: vi.fn().mockReturnValue({ toggleBold: vi.fn().mockReturnValue(true) }),
  commands: {},
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
})
```

`useUpload.test.ts` — Test cases:
- Valid image upload succeeds
- File exceeding 5MB rejected for images
- File exceeding 1MB rejected for documents
- Unsupported MIME type rejected
- Handler error caught and reported
- No handler configured → error
- `isUploading` reactive state changes correctly
- Custom size limits override defaults

`useEditor.test.ts` — Test cases:
- Editor created on mount
- Editor destroyed on unmount
- `isReady` becomes true after creation
- Content option initializes editor

`useTheme.test.ts` — Test cases:
- Default theme is 'default'
- `setTheme()` updates `currentTheme`
- `applyTheme()` sets CSS custom properties

**Acceptance Criteria:**
- [ ] All composable tests pass
- [ ] Mock editor provides realistic API surface
- [ ] Upload validation thoroughly tested

---

### P1-022: Component Tests

**Dependencies:** P1-012, P1-013, P1-014, P1-015, P1-018
**Priority:** P0

**Description:**
Write component tests for all Vue components.

**Files to Create:**
- `tests/unit/components/RTEditor.test.ts`
- `tests/unit/components/RTToolbar.test.ts`
- `tests/unit/components/RTLinkDialog.test.ts`
- `tests/unit/components/RTBubbleMenu.test.ts`
- `tests/unit/components/RTImageUpload.test.ts`

**Technical Details:**

Use `@vue/test-utils` `mount()` with TipTap editor setup.

`RTEditor.test.ts`:
- Renders without errors
- v-model updates content
- Preset extensions are applied
- Upload handler is passed through
- Cleanup on unmount

`RTToolbar.test.ts`:
- Renders all toolbar buttons from config
- Bold button toggles bold
- Active state displayed for active formatting
- Disabled state for unavailable actions
- Separator renders correctly
- Heading dropdown works

`RTLinkDialog.test.ts`:
- Opens/closes via prop
- Validates URLs
- Rejects javascript: URLs
- Submit emits event with URL
- Escape closes dialog

`RTBubbleMenu.test.ts`:
- Renders formatting buttons
- Buttons trigger editor commands

`RTImageUpload.test.ts`:
- File picker opens
- Rejects oversized files
- Shows upload progress
- Shows error messages

**Acceptance Criteria:**
- [ ] All component tests pass
- [ ] Tests use `data-testid` selectors
- [ ] ARIA attributes verified in tests
- [ ] Coverage > 70% for components

---

### P1-023: Extension Tests

**Dependencies:** P1-016, P1-017
**Priority:** P0

**Description:**
Write tests for custom TipTap extensions.

**Files to Create:**
- `tests/unit/extensions/MathExtension.test.ts`
- `tests/unit/extensions/ImageUploadExtension.test.ts`
- `tests/fixtures/documents.ts` — Sample documents

**Technical Details:**

Extension tests create real TipTap Editor instances with the extension:
```typescript
const editor = new Editor({
  extensions: [StarterKit, MathExtension],
  content: '<p>Test</p>',
})
```

`MathExtension.test.ts`:
- Extension registers in editor
- `insertMath()` command inserts math node
- Math node has `latex` attribute
- Inline and block modes work
- Invalid LaTeX handled gracefully

`ImageUploadExtension.test.ts`:
- Extension registers in editor
- `insertImageFromFile()` calls upload handler
- Image node inserted after successful upload
- Upload failure handled
- File validation works (size, type)

`tests/fixtures/documents.ts`:
```typescript
export const sampleDocuments = {
  empty: { type: 'doc', content: [] },
  simpleParagraph: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello World' }] }] },
  withFormatting: { /* bold, italic, underline text */ },
  withHeadings: { /* h1, h2, h3 */ },
  withLists: { /* bullet and ordered lists */ },
  withImage: { /* image node */ },
  withMath: { /* math node */ },
}
```

**Acceptance Criteria:**
- [ ] All extension tests pass
- [ ] Extensions register without errors
- [ ] Commands work correctly
- [ ] Edge cases tested

---

### P1-024: Demo Application

**Dependencies:** P1-019 (all exports ready)
**Priority:** P1

**Description:**
Create a demo Vue 3 application that showcases RTEditor with different presets and configurations. This serves as both a development tool and documentation.

**Files to Create:**
- `demo/index.html`
- `demo/src/main.ts`
- `demo/src/App.vue`
- `demo/src/examples/BasicExample.vue`
- `demo/vite.config.ts`

**Technical Details:**

`demo/src/App.vue` — Simple page with examples:
- Basic editor with `basePreset`
- Editor with custom toolbar
- Editor with upload handler (mock — logs to console)
- Editor showing HTML output
- Editor showing JSON output

Use Vite for demo dev server. Import RTEditor from source (`../src`):
```typescript
import { RTEditor, basePreset } from '../src'
import '../src/themes/default.css'
```

**Acceptance Criteria:**
- [ ] `npm run dev` starts demo app
- [ ] Basic editor works with all Phase 1 features
- [ ] v-model binding demonstrated
- [ ] Upload handler demonstrated
- [ ] HTML/JSON output displayed

**Testing:** Manual testing via the demo app.

---

### P1-025: Accessibility — Phase 1

**Dependencies:** P1-012, P1-013, P1-014, P1-018
**Priority:** P0

**Description:**
Verify and enforce Phase 1 accessibility requirements across all components.

**Files to Modify:**
- `src/components/RTToolbar.vue` — Ensure ARIA attributes
- `src/components/RTEditor.vue` — Ensure ARIA attributes
- `src/components/RTLinkDialog.vue` — Focus trap, ARIA
- `src/components/RTBubbleMenu.vue` — ARIA
- `src/themes/default.css` — Focus indicators, contrast

**Technical Details:**

Checklist from REQUIREMENTS.md Section 12.8 Phase 1:
1. **Keyboard navigation** for all core features — Tab through toolbar, Enter to activate
2. **ARIA labels** on all interactive elements — `aria-label`, `aria-pressed`, `role="toolbar"`
3. **4.5:1 contrast ratio** for all text — Verify default theme colors
4. **Focus indicators visible** — `outline: 2px solid var(--rte-focus); outline-offset: 2px`
5. **Passes axe-core** automated tests — Install `vitest-axe` or `@axe-core/playwright`
6. **Manual screen reader testing** — Document testing checklist

Add `vitest-axe` for automated accessibility testing:
```
npm install -D vitest-axe
```

**Acceptance Criteria:**
- [ ] All toolbar buttons have `aria-label` with shortcut
- [ ] Active formatting announced via `aria-pressed`
- [ ] Editor has `role="textbox"`, `aria-multiline="true"`, `aria-label`
- [ ] Toolbar has `role="toolbar"`, `aria-label`
- [ ] Link dialog has focus trap, `role="dialog"`, `aria-modal`
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Focus indicators visible on all interactive elements
- [ ] No keyboard traps
- [ ] Tab order is logical

**Testing:** Add accessibility assertions to existing component tests using `vitest-axe`.

---

### P1-026: CI Setup (GitHub Actions)

**Dependencies:** P1-020, P1-021, P1-022, P1-023
**Priority:** P1

**Description:**
Create GitHub Actions workflow for automated testing on every push and PR.

**Files to Create:**
- `.github/workflows/test.yml`

**Technical Details:**
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build
      # Upload coverage (optional)
```

**Acceptance Criteria:**
- [ ] Workflow runs on push and PR
- [ ] TypeScript type checking passes
- [ ] ESLint passes
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Tests run on Node 18 and 20

**Testing:** Push to GitHub and verify workflow runs.

---

### P1-027: Build Verification & Bundle Size

**Dependencies:** P1-019
**Priority:** P1

**Description:**
Verify the final build output, check bundle size, and ensure all exports work correctly.

**Tasks:**
1. Run `npm run build` and verify output files
2. Check bundle size with `du -sh dist/*` or `bundlesize`
3. Verify CJS import works: `const { RTEditor } = require('./dist/index.cjs')`
4. Verify ESM import works: `import { RTEditor } from './dist/index.mjs'`
5. Verify types exist: `dist/index.d.ts`
6. Verify CSS output: `dist/style.css`

**Acceptance Criteria:**
- [ ] `dist/index.mjs` < 200KB uncompressed
- [ ] `dist/index.cjs` exists and is importable
- [ ] `dist/index.d.ts` exists with all type definitions
- [ ] `dist/style.css` exists with all theme CSS
- [ ] Gzip size < 50KB (core, without KaTeX)
- [ ] No `any` types in generated declarations

**Testing:** Script-based verification.

---

### P1-028: Documentation

**Dependencies:** P1-019 (all features complete)
**Priority:** P0

**Description:**
Write the README.md with installation, usage examples, and API reference. This is the first thing consumers see.

**Files to Create:**
- `README.md` (at package root, not the workspace root)

**Technical Details:**

README sections:
1. **Header** — Package name, badges (npm version, CI status, coverage)
2. **Introduction** — One-line description + screenshot placeholder
3. **Installation** — `npm install @timothyphchan/rteditor`
4. **Quick Start** — Minimal code example (5 lines)
5. **Presets** — `basePreset` usage
6. **Configuration** — Props table (modelValue, preset, toolbar, uploadHandler, etc.)
7. **Upload Handler** — How to implement with Laravel example
8. **Keyboard Shortcuts** — Table of all shortcuts
9. **Theming** — CSS custom properties example
10. **API Reference** — Components, composables, utilities, types
11. **Browser Support** — Chrome/Firefox/Safari/Edge last 2 versions
12. **License** — MIT

**Acceptance Criteria:**
- [ ] README has working code examples (copy-paste ready)
- [ ] All public APIs documented
- [ ] Installation instructions correct
- [ ] Upload handler example with Laravel/Axios
- [ ] Keyboard shortcuts table
- [ ] Theming customization example

**Testing:** Manual review. Verify code examples compile.

---

## PHASE 2 — Enhanced Features (Target: v0.2.0 - v0.4.0)

### P2-001: Comment Extension — Data Model & ProseMirror Mark

**Dependencies:** P1-001, P1-002, P1-019 (Phase 1 complete)
**Priority:** P1

**Description:**
Create the comment system TipTap extension. This implements the ProseMirror mark for inline comment highlights and provides commands for adding, resolving, and deleting comments. The comment mark stores a `commentId` that links to external comment data stored by the consumer.

**Files to Create:**
- `src/extensions/CommentExtension.ts`
- `src/types/comment.ts`

**Technical Details:**

`src/types/comment.ts`:
```typescript
export interface Comment {
  id: string
  documentId: string
  authorId: string
  authorName: string
  authorRole: 'teacher' | 'student'
  content: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  parentId?: string // For threading
  highlightRange: {
    from: number
    to: number
  }
  highlightedText: string
}

export interface CommentThread {
  rootComment: Comment
  replies: Comment[]
  isResolved: boolean
  participantCount: number
}

export interface CommentStore {
  comments: Map<string, Comment>
  threads: Map<string, CommentThread>
  addComment: (comment: Comment) => void
  getComment: (id: string) => Comment | undefined
  getThread: (id: string) => CommentThread | undefined
  resolveComment: (id: string, resolvedBy: string) => void
  deleteComment: (id: string) => void
  getAllComments: () => Comment[]
}
```

`src/extensions/CommentExtension.ts`:
- Define a TipTap `Mark` extension named `comment`
- Mark attrs: `commentId` (string), `threadId` (string)
- ParseDOM: `span[data-comment-id]`
- RenderHTML: `<span data-comment-id="..." data-thread-id="..." class="rte-comment-highlight">`
- Commands:
  - `addComment({ content, authorId, authorName, authorRole })` — Creates a comment mark on the current selection
  - `replyToComment({ commentId, content, authorId, authorName, authorRole })` — Adds a reply to an existing comment thread
  - `resolveComment(commentId)` — Marks a comment as resolved (changes highlight style)
  - `deleteComment(commentId)` — Removes the comment mark and data
- Events (via editor.emit):
  - `commentAdded` — Emitted when a new comment is created
  - `commentResolved` — Emitted when a comment is resolved
  - `commentDeleted` — Emitted when a comment is deleted
- Highlight CSS classes:
  - `.rte-comment-highlight` — Base highlight style
  - `.rte-comment-highlight--teacher` — Teacher comment (yellow-ish background)
  - `.rte-comment-highlight--student` — Student comment (blue-ish background)
  - `.rte-comment-highlight--resolved` — Resolved comment (gray background)

**Acceptance Criteria:**
- [ ] Comment mark renders inline highlight on selected text
- [ ] `addComment()` command creates comment mark with unique ID
- [ ] `resolveComment()` changes highlight to resolved style
- [ ] `deleteComment()` removes mark from text
- [ ] Comment marks preserved in HTML export (`<span data-comment-id="...">`)
- [ ] Comment marks preserved in JSON export
- [ ] Multiple comments on overlapping text selections work correctly
- [ ] Events emitted for add/resolve/delete operations

**Testing:** Write unit tests in `tests/unit/extensions/CommentExtension.test.ts`.

---

### P2-002: RTCommentBubble Component

**Dependencies:** P2-001
**Priority:** P1

**Description:**
Create the floating comment bubble UI component. This appears when the user clicks on highlighted (commented) text. Shows the comment thread, allows replies, and provides resolve/delete actions.

**Relationship to RTCommentSidebar (P2-020):**
RTEditor uses a **dual comment UI** (like Google Docs). RTCommentBubble is for quick, contextual interaction with a single comment — click on highlighted text and the bubble pops up. RTCommentSidebar (P2-020) is a separate panel listing ALL comments for full review. Both components read from the same `CommentStore` (P2-001). The bubble is the primary comment UI; the sidebar is complementary. They can be used independently or together.

**Files to Create:**
- `src/components/RTCommentBubble.vue`

**Technical Details:**

Props:
```typescript
interface RTCommentBubbleProps {
  editor: Editor | null
  comments: CommentStore
  currentUserId: string
  currentUserRole: 'teacher' | 'student'
}
```

Features:
- Positioned adjacent to the clicked comment highlight (smart positioning to avoid viewport edges)
- Width: 300px, Max height: 400px (scrollable)
- Shows root comment at top, then threaded replies indented 20px
- Each comment shows: author name, role badge (Teacher/Student), timestamp (relative: "2 hours ago"), content
- Actions per comment (permission-based):
  - Reply — Always available
  - Edit — Own comments only
  - Delete — Own comments, or any comment if teacher
  - Resolve — Teachers, or own root comment only
- Input field at bottom for new reply
- Visual distinction: teacher comments have yellow accent, student comments have blue accent
- Arrow/caret pointing to the highlighted text
- Close on click outside or Escape key
- **Emoji picker** in comment input: Inline emoji button (😀) that opens the RTEmojiPicker (P2-022) within the comment bubble. Users can insert emoji into their comment text.
- **File attachment** in comment input: Paperclip (📎) button next to the emoji button. Uses the same `UploadHandler` prop from RTEditor. Attached files display as mini download cards below the comment text. Accepted file types: images (displayed as thumbnails), PDFs, Word/Excel/PPT (displayed as file name + icon). File size limit: same as editor `fileSizeLimits`.
- Focus trap for keyboard accessibility
- `role="dialog"`, `aria-label="Comment thread"`

**Acceptance Criteria:**
- [ ] Bubble appears when clicking on comment highlight
- [ ] Shows comment thread with replies
- [ ] Reply input submits new comment
- [ ] Resolve button works (permission-checked)
- [ ] Delete button works with confirmation (permission-checked)
- [ ] Smart positioning (doesn't overflow viewport)
- [ ] Close on Escape and click outside
- [ ] Accessible (focus trap, ARIA attributes)
- [ ] Relative timestamps (e.g., "2 hours ago", "yesterday")
- [ ] Works alongside RTCommentSidebar (P2-020) — both read from same CommentStore
- [ ] Emoji picker opens inside comment bubble and inserts emoji into comment text
- [ ] File attach button triggers file upload within comment
- [ ] Attached files display as thumbnails (images) or mini cards (documents)
- [ ] File size limits respected for comment attachments

**Testing:** Write component tests in `tests/unit/components/RTCommentBubble.test.ts`.

---

### P2-003: Read-Only Mode

**Dependencies:** P1-018, P1-019
**Priority:** P1

**Description:**
Implement read-only mode for the editor. When `readonly` prop is `true`, the editor content is non-editable, the toolbar is hidden, and the content is displayed for viewing only. Links remain clickable.

**Files to Modify:**
- `src/components/RTEditor.vue` — Add readonly logic
- `src/themes/default.css` — Add readonly-specific styles

**Technical Details:**

In `RTEditor.vue`:
- Watch `readonly` prop, call `editor.setEditable(!readonly)` when it changes
- Conditionally render toolbar: `v-if="!readonly"`
- Hide bubble menu in read-only mode
- Add class `rte-editor--readonly` to container
- Content should still be selectable (for copy/paste)
- Links (`<a>` tags) should be clickable in read-only mode (use `editor.setOptions({ editorProps: { handleClickOn: ... } })`)
- All keyboard shortcuts disabled in read-only mode

CSS additions:
```css
.rte-editor--readonly .rte-content {
  cursor: default;
  user-select: text;
}
.rte-editor--readonly .ProseMirror {
  outline: none;
}
```

**Acceptance Criteria:**
- [ ] `readonly` prop disables all editing
- [ ] Toolbar is hidden in read-only mode
- [ ] Bubble menu is hidden in read-only mode
- [ ] Content is selectable (can copy text)
- [ ] Links are clickable
- [ ] No visual editing affordances (no cursor, no outline)
- [ ] Switching between readonly/editable works dynamically
- [ ] Keyboard shortcuts disabled in read-only mode

**Testing:** Add tests to `tests/unit/components/RTEditor.test.ts` for read-only mode behavior.

---

### P2-004: Auto-Save Callback

**Dependencies:** P1-018, P1-019
**Priority:** P1

**Description:**
Create the `useAutoSave` composable and integrate it into RTEditor. Provides debounced auto-save with visual status indicator and error handling.

**Files to Create:**
- `src/composables/useAutoSave.ts`

**Files to Modify:**
- `src/components/RTEditor.vue` — Add auto-save props and UI indicator
- `src/composables/index.ts` — Export useAutoSave
- `src/types/editor.ts` — Add auto-save props

**Technical Details:**

`src/composables/useAutoSave.ts`:
```typescript
import { ref, watch, onBeforeUnmount } from 'vue'
import type { Editor } from '@tiptap/core'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface AutoSaveHandler {
  (content: { html: string; json: any }): Promise<void>
}

export interface UseAutoSaveOptions {
  editor: Editor | null
  handler: AutoSaveHandler
  interval?: number        // default: 5000ms
  debounceMs?: number      // default: 1000ms
}

export function useAutoSave(options: UseAutoSaveOptions) {
  const status = ref<AutoSaveStatus>('idle')
  const lastSavedAt = ref<Date | null>(null)
  const error = ref<string | null>(null)

  // Implementation:
  // 1. Watch editor content changes (editor.on('update'))
  // 2. Debounce the save trigger (wait debounceMs after last change)
  // 3. Call handler with { html, json }
  // 4. Update status: 'saving' → 'saved' (or 'error')
  // 5. Reset status to 'idle' after 3 seconds
  // 6. Clean up timers on unmount

  return { status, lastSavedAt, error, saveNow }
}
```

RTEditor integration:
- New props: `autoSaveHandler?: AutoSaveHandler`, `autoSaveInterval?: number`
- Visual indicator in status bar: "Saving...", "Saved ✓", "Save failed ✗"
- `saveNow()` exposed for programmatic save

**Acceptance Criteria:**
- [ ] Auto-save triggers after configurable debounce interval
- [ ] Status indicator shows: idle, saving, saved, error
- [ ] Debounced to avoid excessive calls
- [ ] Error handling for failed saves (retries once)
- [ ] `saveNow()` forces immediate save
- [ ] Timers cleaned up on unmount
- [ ] Visual indicator in editor status bar
- [ ] Does not save in read-only mode

**Testing:** Write unit tests in `tests/unit/composables/useAutoSave.test.ts` testing debounce, status transitions, error handling, cleanup.

---

### P2-005: Dark Mode Theme

**Dependencies:** P1-010, P1-019
**Priority:** P1

**Description:**
Create the dark mode theme CSS file and integrate dark mode detection/toggle into RTEditor.

**Files to Create:**
- `src/themes/dark.css`

**Files to Modify:**
- `src/composables/useTheme.ts` — Add dark mode detection and toggle
- `src/components/RTEditor.vue` — Add dark mode class
- `src/themes/default.css` — Ensure CSS custom properties are overridable

**Technical Details:**

`src/themes/dark.css`:
```css
.rte-editor--dark,
.rte-editor[data-theme="dark"] {
  --rte-primary: #60a5fa;
  --rte-primary-hover: #93bbfd;
  --rte-text: #f9fafb;
  --rte-text-muted: #9ca3af;
  --rte-background: #1f2937;
  --rte-border: #374151;
  --rte-focus: #60a5fa;
  --rte-toolbar-bg: #111827;
  --rte-toolbar-border: #374151;
  --rte-comment-teacher: rgba(251, 191, 36, 0.2);
  --rte-comment-student: rgba(96, 165, 250, 0.2);
}

@media (prefers-color-scheme: dark) {
  .rte-editor--auto-dark {
    /* Same overrides as .rte-editor--dark */
  }
}
```

`useTheme.ts` enhancements:
- `isDark` reactive ref — tracks current dark mode state
- `setDarkMode(mode: 'light' | 'dark' | 'auto')` — manually set mode
- `auto` mode uses `window.matchMedia('(prefers-color-scheme: dark)')` listener
- Applies `rte-editor--dark` or `rte-editor--auto-dark` class to container

RTEditor new props:
- `darkMode?: 'light' | 'dark' | 'auto'` — Dark mode preference (default: 'light')

**Acceptance Criteria:**
- [ ] Dark mode applies correct color scheme to all elements
- [ ] `darkMode="auto"` detects system preference
- [ ] `darkMode="dark"` forces dark mode regardless of system
- [ ] `darkMode="light"` forces light mode
- [ ] Smooth transition between light/dark modes (CSS transition)
- [ ] All text maintains WCAG AA contrast in dark mode
- [ ] Images and media remain visible in dark mode
- [ ] Toolbar, bubble menu, link dialog all have dark variants
- [ ] Comment highlights visible in dark mode

**Testing:** Add theme tests to `tests/unit/composables/useTheme.test.ts`. Visual verification in demo app.

---

### P2-006: File Attachment Extension

**Dependencies:** P1-002, P1-008, P1-017, P1-019
**Priority:** P1

**Description:**
Create the `FileAttachmentExtension` for PDF inline preview and document download cards (Word, Excel, PowerPoint). This extends the upload system from Phase 1 to handle non-image files.

**Files to Create:**
- `src/extensions/FileAttachmentExtension.ts`
- `src/components/RTPdfPreview.vue`
- `src/components/RTDownloadCard.vue`

**Files to Modify:**
- `src/extensions/index.ts` — Export FileAttachmentExtension
- `src/components/RTToolbar.vue` — Wire up "attach file" button for all file types
- `src/components/RTImageUpload.vue` — Extend to handle non-image files (rename consideration)

**Technical Details:**

`src/extensions/FileAttachmentExtension.ts`:
- TipTap Node extension named `fileAttachment`
- Node attrs: `url` (string), `filename` (string), `filesize` (number), `filetype` ('pdf' | 'word' | 'excel' | 'powerpoint'), `mimeType` (string), `width` (number | null), `height` (number | null)
- ParseDOM: `div[data-type="file-attachment"]`, `iframe[data-type="pdf-preview"]`
- Uses `VueNodeViewRenderer` to render appropriate component:
  - PDF → `RTPdfPreview.vue` (inline `<iframe>`)
  - Word/Excel/PPT → `RTDownloadCard.vue` (styled card)
- Commands:
  - `insertFileAttachment({ url, filename, filesize, filetype, mimeType })`

**Resizable drag handles (REQUIREMENTS.md Section 19.9):**
Both PDF iframes and download cards are **resizable like images**, with drag handles on corners/edges when the node is selected. Implementation:
- Use the same resize handle mechanism as `ImageUploadExtension` (P1-017) — shared `useResizeHandles` composable or ProseMirror NodeView with resize observers.
- Node attrs `width` and `height` store the user-resized dimensions.
- Minimum size: 200px wide for download cards, 300px wide for PDF iframes.
- Maximum size: 100% of editor content width.
- PDF iframes default to aspect ratio 4:3 (lockable).
- On resize, update node attrs → triggers `editor.on('update')` → v-model syncs.

`src/components/RTPdfPreview.vue`:
- Renders `<iframe>` with `sandbox="allow-same-origin"` for security
- Configurable preview height (default: 400px, via node attr or prop)
- **Resizable:** Drag handles on corners/edges when selected (see resize spec above)
- Fallback: If `<iframe>` fails to load (CSP restriction), render download card instead
- Download link below the preview
- `<iframe>` has `title` attribute for accessibility: `"PDF Preview: {filename}"`
- Error handling for broken URLs

`src/components/RTDownloadCard.vue`:
- Styled card component (see design in REQUIREMENTS.md Section 5.2.5):
  ```
  ┌─────────────────────────────────────────┐
  │  📄  Lesson_Plan_Week3.docx             │
  │      245 KB · Word Document    ⬇ Download│
  └─────────────────────────────────────────┘
  ```
- **Resizable:** Drag handles on corners/edges when selected (see resize spec above)
- File type icons: distinct icons for Word (📄), Excel (📊), PowerPoint (📊), PDF (📕)
- Shows: file type icon, filename, human-readable file size, file type label, download button
- Download button as `<a>` with `download` attribute and `rel="noopener noreferrer"`
- Keyboard navigable (Tab to download link)
- `role="group"` with `aria-label="File attachment: {filename}"`

**Acceptance Criteria:**
- [ ] PDF files render as inline `<iframe>` preview
- [ ] PDF has fallback download card if `<iframe>` blocked
- [ ] PDF `<iframe>` is sandboxed (`sandbox="allow-same-origin"`)
- [ ] Word/Excel/PPT files render as styled download cards
- [ ] Download cards show correct file type icon, name, size, type
- [ ] Download button works with `download` attribute
- [ ] All file types upload via the same consumer-provided handler
- [ ] Files exceeding 1 MB rejected client-side with clear error message
- [ ] File attachment nodes preserved in HTML export
- [ ] Can delete any attachment node from editor
- [ ] Accessible (keyboard navigable, screen reader friendly)
- [ ] **PDF iframes are resizable** with drag handles (min 300px, max 100%, default 4:3 aspect)
- [ ] **Download cards are resizable** with drag handles (min 200px, max 100%)
- [ ] Resized dimensions persist in HTML export (stored as node attrs)

**Testing:** Write tests in `tests/unit/extensions/FileAttachmentExtension.test.ts` and `tests/unit/components/RTPdfPreview.test.ts`, `tests/unit/components/RTDownloadCard.test.ts`. Test resize handle interaction and dimension persistence.

---

### P2-007: Table Extension

**Dependencies:** P1-001, P1-019
**Priority:** P1

**Description:**
Integrate TipTap's table extensions for full table editing support: insert tables, add/remove rows and columns, merge cells, and header row styling.

**Files to Create:**
- `src/extensions/TableExtension.ts` (wrapper around TipTap table extensions)

**Files to Modify:**
- `src/extensions/index.ts` — Export TableExtension
- `src/components/RTToolbar.vue` — Add table toolbar button with dropdown
- `src/types/editor.ts` — Add 'table' to `ToolbarItem` type
- `src/themes/default.css` — Add table styles
- `src/presets/basePreset.ts` — Add table extension (optional, can be in teacherPreset only)

**Technical Details:**

Install TipTap table extensions:
```
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
```

`src/extensions/TableExtension.ts`:
```typescript
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

export const TableExtension = [
  Table.configure({ resizable: true, HTMLAttributes: { class: 'rte-table' } }),
  TableRow,
  TableCell,
  TableHeader,
]
```

Toolbar integration — "Table" button opens a dropdown with:
- Insert table (3x3 default, or grid picker)
- Add row before/after
- Add column before/after
- Delete row/column
- Merge cells / Split cell
- Delete table
- Toggle header row

CSS for tables:
```css
.rte-table { border-collapse: collapse; width: 100%; margin: 1em 0; }
.rte-table td, .rte-table th { border: 1px solid var(--rte-border); padding: var(--rte-spacing-sm); min-width: 80px; }
.rte-table th { background: var(--rte-toolbar-bg); font-weight: var(--rte-heading-font-weight); }
.rte-table .selectedCell { background: rgba(59, 130, 246, 0.1); }
```

**Acceptance Criteria:**
- [ ] Can insert tables via toolbar button
- [ ] Add/remove rows and columns
- [ ] Merge and split cells
- [ ] Header row has distinct styling
- [ ] Table is responsive (horizontal scroll on overflow)
- [ ] Keyboard navigation within table cells (Tab, Shift+Tab)
- [ ] Copy/paste table data works
- [ ] Tables export to valid HTML (`<table>`, `<tr>`, `<td>`, `<th>`)
- [ ] Tables import from CKEditor 4 HTML (with `border`, `cellpadding` attributes)
- [ ] Column resize handles

**Testing:** Write tests in `tests/unit/extensions/TableExtension.test.ts`.

---

### P2-008: Slash Commands

**Dependencies:** P1-018, P1-019
**Priority:** P2

**Description:**
Implement Notion-style slash commands. Typing `/` at the start of a line (or after a space) opens a command menu with quick-insert options. Supports fuzzy search and keyboard navigation.

> **Phase 4 Note:** A `/ai` slash command will be added in P4-008. It opens the AI panel in generate mode. Listed under an "AI" category in the command menu.

**Files to Create:**
- `src/extensions/SlashCommandExtension.ts`
- `src/components/RTSlashCommandMenu.vue`

**Files to Modify:**
- `src/extensions/index.ts` — Export SlashCommandExtension

**Technical Details:**

`src/extensions/SlashCommandExtension.ts`:
- TipTap Extension (not Node or Mark) using the `suggestion` utility from `@tiptap/suggestion`
- Install: `npm install @tiptap/suggestion`
- Triggers on `/` character at start of empty block or after space
- Provides a list of available commands based on current extensions
- Commands filter as user types (fuzzy matching)

Command registry (populated based on available extensions):
```typescript
interface SlashCommand {
  name: string
  label: string        // Display name (e.g., "Heading 1")
  description: string  // Short description (e.g., "Large heading")
  icon: string         // Icon identifier
  category: string     // 'format' | 'insert' | 'list' | 'media'
  action: (editor: Editor) => void
}

const defaultCommands: SlashCommand[] = [
  { name: 'heading1', label: 'Heading 1', description: 'Large heading', icon: 'h1', category: 'format', action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { name: 'heading2', label: 'Heading 2', description: 'Medium heading', icon: 'h2', category: 'format', action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { name: 'heading3', label: 'Heading 3', description: 'Small heading', icon: 'h3', category: 'format', action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { name: 'bulletList', label: 'Bullet List', description: 'Unordered list', icon: 'list', category: 'list', action: (e) => e.chain().focus().toggleBulletList().run() },
  { name: 'orderedList', label: 'Numbered List', description: 'Ordered list', icon: 'ordered-list', category: 'list', action: (e) => e.chain().focus().toggleOrderedList().run() },
  { name: 'image', label: 'Image', description: 'Upload an image', icon: 'image', category: 'media', action: ... },
  { name: 'table', label: 'Table', description: 'Insert a table', icon: 'table', category: 'insert', action: ... },
  { name: 'horizontalRule', label: 'Divider', description: 'Horizontal line', icon: 'hr', category: 'insert', action: ... },
  { name: 'math', label: 'Math Equation', description: 'LaTeX math', icon: 'math', category: 'insert', action: ... },
]
```

`src/components/RTSlashCommandMenu.vue`:
- Floating menu positioned below the cursor
- Shows filtered command list grouped by category
- Arrow keys navigate, Enter selects, Escape closes
- Fuzzy matching on name + label + description
- `role="listbox"`, `aria-label="Commands"`, items have `role="option"`
- Max 10 visible items, scrollable
- Shows "No results" when filter matches nothing

**Acceptance Criteria:**
- [ ] `/` triggers command menu at start of line or after space
- [ ] Menu shows all available commands
- [ ] Typing filters commands (fuzzy search)
- [ ] Arrow Up/Down navigates commands
- [ ] Enter selects and executes command
- [ ] Escape closes menu without action
- [ ] Commands insert correct content (headings, lists, images, etc.)
- [ ] Menu positioned near cursor, doesn't overflow viewport
- [ ] Accessible (listbox role, keyboard navigation)
- [ ] Menu closes after selection

**Testing:** Write tests in `tests/unit/extensions/SlashCommandExtension.test.ts` and `tests/unit/components/RTSlashCommandMenu.test.ts`.

---

### P2-009: Checklist / Todo Extension

**Dependencies:** P1-001, P1-019
**Priority:** P2

**Description:**
Implement interactive checklists using TipTap's TaskList and TaskItem extensions. Checkboxes toggle completion state, and completed items show strikethrough text.

**Files to Create:**
- `src/extensions/ChecklistExtension.ts`

**Files to Modify:**
- `src/extensions/index.ts` — Export ChecklistExtension
- `src/components/RTToolbar.vue` — Add checklist toolbar button
- `src/types/editor.ts` — Add 'checklist' to `ToolbarItem` type
- `src/themes/default.css` — Add checklist styles

**Technical Details:**

Install TipTap checklist extensions:
```
npm install @tiptap/extension-task-list @tiptap/extension-task-item
```

`src/extensions/ChecklistExtension.ts`:
```typescript
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

export const ChecklistExtension = [
  TaskList.configure({ HTMLAttributes: { class: 'rte-checklist' } }),
  TaskItem.configure({ nested: true, HTMLAttributes: { class: 'rte-checklist-item' } }),
]
```

Toolbar: Add `checklist` button that toggles task list.

CSS:
```css
.rte-checklist { list-style: none; padding-left: 0; }
.rte-checklist-item { display: flex; align-items: flex-start; gap: var(--rte-spacing-sm); }
.rte-checklist-item input[type="checkbox"] { margin-top: 4px; cursor: pointer; width: 18px; height: 18px; }
.rte-checklist-item[data-checked="true"] > div > p { text-decoration: line-through; color: var(--rte-text-muted); }
```

**Acceptance Criteria:**
- [ ] Checklist toolbar button creates task list
- [ ] Checkboxes toggle in editor
- [ ] Completed items have strikethrough text and muted color
- [ ] Nested checklists supported
- [ ] Can convert between bullet list and checklist
- [ ] Checklist state persists in HTML and JSON export
- [ ] Keyboard accessible (Space to toggle checkbox)
- [ ] Works in read-only mode (checkboxes visible but not interactive)

**Testing:** Write tests in `tests/unit/extensions/ChecklistExtension.test.ts`.

---

### P2-010: Text Highlight Colors Extension

**Dependencies:** P1-001, P1-019
**Priority:** P2

**Description:**
Implement text highlight (background color) and text color marks. Provides a color picker or preset palette in the toolbar. The user must be able to change both the text foreground color AND the text background/highlight color from the toolbar palette.

**Files to Create:**
- `src/extensions/HighlightExtension.ts`
- `src/components/RTColorPicker.vue`

**Files to Modify:**
- `src/extensions/index.ts` — Export HighlightExtension
- `src/components/RTToolbar.vue` — Add highlight/color toolbar buttons
- `src/types/editor.ts` — Add 'highlight', 'textColor' to `ToolbarItem` type
- `src/themes/default.css` — Add color picker and highlight styles

**Technical Details:**

Install TipTap highlight extension:
```
npm install @tiptap/extension-highlight @tiptap/extension-color @tiptap/extension-text-style
```

`src/extensions/HighlightExtension.ts`:
```typescript
import Highlight from '@tiptap/extension-highlight'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'

export const HighlightExtension = [
  TextStyle,
  Color.configure({ types: ['textStyle'] }),
  Highlight.configure({ multicolor: true }),
]
```

`src/components/RTColorPicker.vue`:
- Dropdown component with preset color palette
- Separate sections for "Text Color" and "Highlight Color"
- Preset colors (8-12 education-friendly colors):
  ```
  Red, Orange, Yellow, Green, Blue, Purple, Pink, Gray
  ```
- "Remove color" / "Remove highlight" button
- Current color indicator on toolbar button
- Accessible: each color has `aria-label` (e.g., "Red highlight")

**Acceptance Criteria:**
- [ ] Can set text color from palette
- [ ] Can set highlight (background) color from palette
- [ ] Can remove text color (reset to default)
- [ ] Can remove highlight
- [ ] Colors preserved in HTML export (as inline styles)
- [ ] Colors work with CKEditor 4 HTML import (inline styles)
- [ ] Color picker is accessible (labeled colors, keyboard navigation)
- [ ] Sufficient contrast for highlighted text (WCAG AA)
- [ ] Multiple highlight colors available

**Testing:** Write tests in `tests/unit/extensions/HighlightExtension.test.ts` and `tests/unit/components/RTColorPicker.test.ts`.

---

### P2-011: Teacher Preset (teacherPreset)

**Dependencies:** P1-011, P2-001, P2-006, P2-007, P2-009, P2-010
**Priority:** P2

**Description:**
Create the `teacherPreset` configuration object that bundles all Phase 2 extensions and toolbar items for teacher-focused workflows. Includes lesson plan template structures and template quick-insert via slash commands.

> **Phase 4 Note:** In Phase 4, `teacherPreset` will have AI enabled by default with education-specific quick actions (Generate Questions, Create Rubric). Student preset will have AI hidden by default.

**Files to Create:**
- `src/presets/teacherPreset.ts`

**Files to Modify:**
- `src/presets/index.ts` — Add `teacherPreset` export
- `src/index.ts` — Add `teacherPreset` to package exports

**Technical Details:**

`src/presets/teacherPreset.ts`:
```typescript
import { basePreset } from './basePreset'
import { CommentExtension } from '../extensions/CommentExtension'
import { FileAttachmentExtension } from '../extensions/FileAttachmentExtension'
import { ChecklistExtension } from '../extensions/ChecklistExtension'
import { HighlightExtension } from '../extensions/HighlightExtension'
import { SlashCommandExtension } from '../extensions/SlashCommandExtension'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import type { EditorPreset } from '../types'

export interface LessonPlanTemplate {
  name: string
  label: string
  sections: LessonPlanSection[]
}

export interface LessonPlanSection {
  heading: string
  placeholder: string
}

export const defaultLessonPlanTemplates: LessonPlanTemplate[] = [
  {
    name: 'standard',
    label: 'Standard Lesson Plan',
    sections: [
      { heading: 'Objectives', placeholder: 'What will students learn?' },
      { heading: 'Materials', placeholder: 'List required materials...' },
      { heading: 'Activities', placeholder: 'Describe lesson activities...' },
      { heading: 'Assessment', placeholder: 'How will learning be assessed?' },
    ],
  },
  {
    name: '5e',
    label: '5E Model',
    sections: [
      { heading: 'Engage', placeholder: 'Hook activity...' },
      { heading: 'Explore', placeholder: 'Student exploration...' },
      { heading: 'Explain', placeholder: 'Direct instruction...' },
      { heading: 'Elaborate', placeholder: 'Extension activities...' },
      { heading: 'Evaluate', placeholder: 'Assessment strategy...' },
    ],
  },
]

export function buildLessonPlanHTML(template: LessonPlanTemplate): string {
  return template.sections
    .map((s) => `<h2>${s.heading}</h2><p>${s.placeholder}</p>`)
    .join('')
}

export const teacherPreset: EditorPreset = {
  extensions: [
    ...basePreset.extensions,
    CommentExtension,
    FileAttachmentExtension,
    ChecklistExtension,
    HighlightExtension.configure({ multicolor: true }),
    SlashCommandExtension.configure({
      commands: [
        // Standard slash commands plus template insertion
      ],
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  toolbar: [
    'undo', 'redo', '|',
    'heading', '|',
    'bold', 'italic', 'underline', 'strike', '|',
    'subscript', 'superscript', '|',
    'highlight', '|',
    'alignLeft', 'alignCenter', 'alignRight', '|',
    'bulletList', 'orderedList', 'checklist', '|',
    'link', 'image', 'attachFile', '|',
    'table', '|',
    'math', '|',
    'comment', '|',
    'horizontalRule',
  ],
  placeholder: 'Start writing your lesson plan...',
}
```

Slash command integration for templates:
```typescript
// Inside SlashCommandExtension configuration for teacherPreset
{
  name: 'lesson-plan',
  label: 'Lesson Plan Template',
  description: 'Insert a lesson plan structure',
  icon: '📋',
  action: (editor, template?: LessonPlanTemplate) => {
    const html = buildLessonPlanHTML(template ?? defaultLessonPlanTemplates[0])
    editor.chain().focus().insertContent(html).run()
  },
}
```

**Acceptance Criteria:**
- [ ] `teacherPreset` includes all Phase 1 extensions from `basePreset`
- [ ] `teacherPreset` includes CommentExtension, FileAttachmentExtension, ChecklistExtension, HighlightExtension, SlashCommandExtension, Table extensions
- [ ] Toolbar includes all Phase 2 items: `comment`, `highlight`, `checklist`, `attachFile`, `table`
- [ ] `defaultLessonPlanTemplates` provides at least 2 template structures
- [ ] `buildLessonPlanHTML()` generates valid HTML from template definition
- [ ] Templates are insertable via slash commands (`/lesson-plan`)
- [ ] Templates are customizable — consumer can provide custom `LessonPlanTemplate[]`
- [ ] `teacherPreset` conforms to `EditorPreset` interface
- [ ] Exported from `src/presets/index.ts` and `src/index.ts`

**Testing:** Write unit tests in `tests/unit/presets/teacherPreset.test.ts` verifying preset structure, extension presence, template HTML generation, and slash command registration.

---

### P2-012: Student Preset (studentPreset)

**Dependencies:** P1-011, P2-009
**Priority:** P2

**Description:**
Create the `studentPreset` configuration object with a simplified toolbar optimized for quick note-taking. Minimal distractions — no tables, no file attachments, no slash commands.

**Files to Create:**
- `src/presets/studentPreset.ts`

**Files to Modify:**
- `src/presets/index.ts` — Add `studentPreset` export

---

### P2-013: Export to PDF / Markdown

**Dependencies:** P1-004, P1-005, P1-019
**Priority:** P2

**Description:**
Create export utilities for PDF and Markdown formats. PDF export uses html2pdf.js (lazy-loaded, optional peer dependency). Markdown export converts ProseMirror JSON to GitHub-flavored Markdown. Math equations render as KaTeX in PDF and use `$...$` syntax in Markdown.

**Files to Create:**
- `src/utils/exportPDF.ts`
- `src/utils/exportMarkdown.ts`

**Files to Modify:**
- `src/utils/index.ts` — Add exports for `exportPDF` and `exportMarkdown`
- `src/index.ts` — Add `exportPDF` and `exportMarkdown` to package exports

**Technical Details:**

`src/utils/exportPDF.ts`:
```typescript
import type { Editor } from '@tiptap/core'

export interface PDFExportOptions {
  filename?: string          // default: 'document.pdf'
  margin?: number            // default: 10 (mm)
  pageSize?: 'a4' | 'letter' // default: 'a4'
  orientation?: 'portrait' | 'landscape'
  includeImages?: boolean    // default: true
  headerText?: string
  footerText?: string
}

// Lazy-load html2pdf.js — optional peer dependency
let html2pdfPromise: Promise<any> | null = null
const loadHtml2Pdf = () => {
  if (!html2pdfPromise) {
    html2pdfPromise = import('html2pdf.js').catch(() => {
      throw new Error(
        'html2pdf.js is required for PDF export. Install it with: npm install html2pdf.js'
      )
    })
  }
  return html2pdfPromise
}

export async function exportPDF(
  editor: Editor,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const html2pdf = await loadHtml2Pdf()
  const html = editor.getHTML()

  const {
    filename = 'document.pdf',
    margin = 10,
    pageSize = 'a4',
    orientation = 'portrait',
    includeImages = true,
  } = options

  // Create a temporary container with print-friendly styles
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.fontFamily = 'serif'
  container.style.fontSize = '12pt'
  container.style.lineHeight = '1.6'
  container.style.color = '#000'

  if (!includeImages) {
    container.querySelectorAll('img').forEach((img) => img.remove())
  }

  const pdfBlob: Blob = await html2pdf.default()
    .set({
      margin,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: pageSize, orientation },
    })
    .from(container)
    .outputPdf('blob')

  return pdfBlob
}

export async function downloadPDF(
  editor: Editor,
  options: PDFExportOptions = {}
): Promise<void> {
  const blob = await exportPDF(editor, options)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = options.filename ?? 'document.pdf'
  a.click()
  URL.revokeObjectURL(url)
}
```

`src/utils/exportMarkdown.ts`:
```typescript
import type { Editor } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'

export interface MarkdownExportOptions {
  gfm?: boolean              // GitHub-flavored Markdown (default: true)
  mathSyntax?: '$' | '\\('   // Math delimiter style (default: '$')
  imageBaseUrl?: string       // Prepend to relative image URLs
}

export function exportMarkdown(
  editor: Editor,
  options: MarkdownExportOptions = {}
): string {
  const json = editor.getJSON()
  return jsonToMarkdown(json, options)
}

export function jsonToMarkdown(
  doc: JSONContent,
  options: MarkdownExportOptions = {}
): string {
  const { gfm = true, mathSyntax = '$' } = options
  if (!doc.content) return ''
  return doc.content.map((node) => nodeToMarkdown(node, options)).join('\n\n')
}

function nodeToMarkdown(
  node: JSONContent,
  options: MarkdownExportOptions
): string {
  switch (node.type) {
    case 'paragraph':
      return inlineToMarkdown(node.content ?? [], options)
    case 'heading': {
      const level = node.attrs?.level ?? 1
      const prefix = '#'.repeat(level)
      return `${prefix} ${inlineToMarkdown(node.content ?? [], options)}`
    }
    case 'bulletList':
      return (node.content ?? [])
        .map((li) => `- ${listItemToMarkdown(li, options)}`)
        .join('\n')
    case 'orderedList':
      return (node.content ?? [])
        .map((li, i) => `${i + 1}. ${listItemToMarkdown(li, options)}`)
        .join('\n')
    case 'taskList':
      return (node.content ?? [])
        .map((li) => {
          const checked = li.attrs?.checked ? 'x' : ' '
          return `- [${checked}] ${listItemToMarkdown(li, options)}`
        })
        .join('\n')
    case 'blockquote':
      return (node.content ?? [])
        .map((child) => `> ${nodeToMarkdown(child, options)}`)
        .join('\n')
    case 'codeBlock': {
      const lang = node.attrs?.language ?? ''
      const code = node.content?.map((c) => c.text ?? '').join('') ?? ''
      return `\`\`\`${lang}\n${code}\n\`\`\``
    }
    case 'horizontalRule':
      return '---'
    case 'image': {
      const src = node.attrs?.src ?? ''
      const alt = node.attrs?.alt ?? ''
      const fullSrc = options.imageBaseUrl
        ? `${options.imageBaseUrl}${src}`
        : src
      return `![${alt}](${fullSrc})`
    }
    case 'math': {
      const latex = node.attrs?.latex ?? ''
      const display = node.attrs?.display
      if (display) return `$$\n${latex}\n$$`
      return options.mathSyntax === '$' ? `$${latex}$` : `\\(${latex}\\)`
    }
    case 'table':
      return tableToMarkdown(node, options)
    default:
      return inlineToMarkdown(node.content ?? [], options)
  }
}

function listItemToMarkdown(
  node: JSONContent,
  options: MarkdownExportOptions
): string {
  return (node.content ?? [])
    .map((child) => inlineToMarkdown(child.content ?? [], options))
    .join('\n')
}

function inlineToMarkdown(
  content: JSONContent[],
  options: MarkdownExportOptions
): string {
  return content
    .map((node) => {
      if (node.type === 'text') {
        let text = node.text ?? ''
        const marks = node.marks ?? []
        for (const mark of marks) {
          switch (mark.type) {
            case 'bold':
              text = `**${text}**`
              break
            case 'italic':
              text = `*${text}*`
              break
            case 'strike':
              text = `~~${text}~~`
              break
            case 'code':
              text = `\`${text}\``
              break
            case 'link':
              text = `[${text}](${mark.attrs?.href ?? ''})`
              break
          }
        }
        return text
      }
      if (node.type === 'hardBreak') return '  \n'
      if (node.type === 'math') {
        const latex = node.attrs?.latex ?? ''
        return options.mathSyntax === '$' ? `$${latex}$` : `\\(${latex}\\)`
      }
      return ''
    })
    .join('')
}

function tableToMarkdown(
  node: JSONContent,
  options: MarkdownExportOptions
): string {
  const rows = node.content ?? []
  if (rows.length === 0) return ''

  const lines: string[] = []
  rows.forEach((row, rowIndex) => {
    const cells = (row.content ?? []).map((cell) =>
      inlineToMarkdown(cell.content?.[0]?.content ?? [], options)
    )
    lines.push(`| ${cells.join(' | ')} |`)
    if (rowIndex === 0) {
      lines.push(`| ${cells.map(() => '---').join(' | ')} |`)
    }
  })
  return lines.join('\n')
}
```

**Acceptance Criteria:**
- [ ] `exportPDF()` returns a PDF Blob from editor content
- [ ] `downloadPDF()` triggers browser download with specified filename
- [ ] PDF preserves text formatting (bold, italic, headings, lists)
- [ ] PDF renders images (with `useCORS: true` for cross-origin)
- [ ] PDF renders KaTeX math equations
- [ ] html2pdf.js is lazy-loaded — not included in core bundle
- [ ] Clear error message if html2pdf.js is not installed
- [ ] `exportMarkdown()` returns GitHub-flavored Markdown string
- [ ] Markdown headings use `#` syntax
- [ ] Markdown bold/italic/strike use `**`, `*`, `~~` syntax
- [ ] Markdown lists use `-` and `1.` syntax
- [ ] Markdown checklists use `- [x]` / `- [ ]` syntax
- [ ] Markdown math uses `$...$` (inline) and `$$...$$` (block) syntax
- [ ] Markdown tables use GFM pipe syntax
- [ ] Markdown images use `![alt](src)` syntax
- [ ] Markdown links use `[text](url)` syntax

**Testing:** Write unit tests in `tests/unit/utils/exportPDF.test.ts` (mock html2pdf.js) and `tests/unit/utils/exportMarkdown.test.ts` (test all node types, marks, and edge cases).

---

### P2-014: Word Count Extension

**Dependencies:** P1-019
**Priority:** P2

**Description:**
Create a TipTap extension that provides real-time word count, character count (with and without spaces), and reading time estimate. Displayed via a **toolbar toggle button** that shows/hides a floating popover panel — NOT a persistent status bar (see REQUIREMENTS.md Section 19.6). The popover dismisses on click outside or pressing the toggle button again.

**Files to Create:**
- `src/extensions/WordCountExtension.ts`
- `src/components/RTWordCountPopover.vue`

**Files to Modify:**
- `src/extensions/index.ts` — Add `WordCountExtension` export
- `src/types/editor.ts` — Add `'wordCount'` to `ToolbarItem` type
- `src/components/RTToolbar.vue` — The `wordCount` toolbar button toggles this popover (button already mapped in P1-012 update)
- `src/index.ts` — Add `WordCountExtension` and `RTWordCountPopover` to package exports

**Technical Details:**

`src/extensions/WordCountExtension.ts`:
```typescript
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface WordCountOptions {
  enabled?: boolean           // default: true
  showWordCount?: boolean     // default: true
  showCharCount?: boolean     // default: true
  showReadingTime?: boolean   // default: true
  wordsPerMinute?: number     // default: 200
  onUpdate?: (stats: WordCountStats) => void
}

export interface WordCountStats {
  words: number
  characters: number
  charactersWithSpaces: number
  readingTimeMinutes: number
}

export const wordCountPluginKey = new PluginKey('wordCount')

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  // Handle CJK characters (each character = 1 word)
  const cjkChars = (trimmed.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length
  // Handle Latin words
  const latinWords = trimmed
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  return cjkChars + latinWords
}

export const WordCountExtension = Extension.create<WordCountOptions>({
  name: 'wordCount',

  addOptions() {
    return {
      enabled: true,
      showWordCount: true,
      showCharCount: true,
      showReadingTime: true,
      wordsPerMinute: 200,
      onUpdate: undefined,
    }
  },

  addStorage() {
    return {
      words: 0,
      characters: 0,
      charactersWithSpaces: 0,
      readingTimeMinutes: 0,
    } as WordCountStats
  },

  addProseMirrorPlugins() {
    const extension = this
    return [
      new Plugin({
        key: wordCountPluginKey,
        view: () => ({
          update: (view) => {
            if (!extension.options.enabled) return
            const text = view.state.doc.textContent
            const stats: WordCountStats = {
              words: countWords(text),
              characters: text.replace(/\s/g, '').length,
              charactersWithSpaces: text.length,
              readingTimeMinutes: Math.max(
                1,
                Math.ceil(countWords(text) / (extension.options.wordsPerMinute ?? 200))
              ),
            }
            extension.storage.words = stats.words
            extension.storage.characters = stats.characters
            extension.storage.charactersWithSpaces = stats.charactersWithSpaces
            extension.storage.readingTimeMinutes = stats.readingTimeMinutes
            extension.options.onUpdate?.(stats)
          },
        }),
      }),
    ]
  },
})
```

`src/components/RTWordCountPopover.vue`:

This is a **floating popover** anchored to the `wordCount` toolbar button. It is NOT a persistent status bar. It appears/disappears when the user clicks the toolbar button (toggle behavior).

```vue
<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  editor: Editor | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const popoverRef = ref<HTMLElement | null>(null)

const stats = computed(() => {
  if (!props.editor) return null
  const storage = props.editor.storage.wordCount
  if (!storage) return null
  return {
    words: storage.words ?? 0,
    characters: storage.characters ?? 0,
    charactersWithSpaces: storage.charactersWithSpaces ?? 0,
    readingTime: storage.readingTimeMinutes ?? 0,
  }
})

// Close on click outside
function handleClickOutside(e: MouseEvent) {
  if (popoverRef.value && !popoverRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

// Close on Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="isOpen && stats"
    ref="popoverRef"
    class="rte-word-count-popover"
    role="status"
    aria-live="polite"
    aria-label="Document statistics"
  >
    <div class="rte-word-count-popover__row" data-testid="word-count">
      <span class="rte-word-count-popover__label">Words</span>
      <span class="rte-word-count-popover__value">{{ stats.words }}</span>
    </div>
    <div class="rte-word-count-popover__row" data-testid="char-count">
      <span class="rte-word-count-popover__label">Characters</span>
      <span class="rte-word-count-popover__value">{{ stats.characters }}</span>
    </div>
    <div class="rte-word-count-popover__row" data-testid="char-with-spaces-count">
      <span class="rte-word-count-popover__label">Characters (with spaces)</span>
      <span class="rte-word-count-popover__value">{{ stats.charactersWithSpaces }}</span>
    </div>
    <div class="rte-word-count-popover__row" data-testid="reading-time">
      <span class="rte-word-count-popover__label">Reading time</span>
      <span class="rte-word-count-popover__value">{{ stats.readingTime }} min</span>
    </div>
  </div>
</template>
```

Styling notes:
- `.rte-word-count-popover`: `position: absolute`, anchored below/above the toolbar button (smart positioning to stay in viewport), `min-width: 220px`, subtle shadow, rounded corners, Notion-like clean style.
- Each `.rte-word-count-popover__row`: flex row with label (left) and value (right), subtle separator between rows.
- Smooth fade-in animation (`opacity 0→1, translateY -4px→0`), respects `prefers-reduced-motion`.

**Acceptance Criteria:**
- [ ] `WordCountExtension` provides real-time word count, character count (with and without spaces), reading time
- [ ] Word count accurately excludes HTML tags (counts plain text only)
- [ ] CJK characters counted correctly (each character = 1 word)
- [ ] Reading time calculated at configurable words-per-minute (default: 200)
- [ ] **Toolbar toggle button:** Clicking `wordCount` button in toolbar opens/closes the popover
- [ ] **Popover displays:** words, characters, characters with spaces, reading time
- [ ] **Popover dismisses:** on click outside, Escape key, or clicking toggle button again
- [ ] **No persistent status bar** — word count is ONLY visible when popover is toggled open
- [ ] `onUpdate` callback fires with `WordCountStats` on every document change
- [ ] Stats accessible via `editor.storage.wordCount`
- [ ] Popover has `role="status"` and `aria-live="polite"` for screen readers
- [ ] `'wordCount'` added to `ToolbarItem` type union
- [ ] Empty document shows 0 words, 0 characters, 1 min read
- [ ] Popover is positioned to avoid overflowing viewport edges

**Testing:** Write unit tests in `tests/unit/extensions/WordCountExtension.test.ts` testing: word counting (English, CJK, mixed), character counting, reading time calculation, empty document, and `onUpdate` callback. Write component tests in `tests/unit/components/RTWordCountPopover.test.ts` testing: popover open/close toggle, dismiss on click outside, dismiss on Escape, stats display.

---

### P2-015: i18n System

**Dependencies:** P1-019
**Priority:** P2

**Description:**
Create a built-in internationalization system with no external dependencies. Provides `setLocale()` API and `<RTEditor locale="zh-TW" />` prop. Ships with English and Traditional Chinese translations. All UI text is translatable: toolbar labels, dialog titles, error messages, ARIA labels, placeholders.

**Files to Create:**
- `src/i18n/index.ts` — i18n core (locale registry, `setLocale`, `t` function)
- `src/i18n/en.ts` — English locale
- `src/i18n/zh-TW.ts` — Traditional Chinese locale
- `src/composables/useI18n.ts` — Vue composable for reactive i18n

**Files to Modify:**
- `src/index.ts` — Add `setLocale`, `useI18n` to package exports
- `src/components/RTToolbar.vue` — Use `t()` for all button labels and tooltips
- `src/components/RTLinkDialog.vue` — Use `t()` for dialog text
- `src/components/RTImageUpload.vue` — Use `t()` for error messages
- `src/components/RTBubbleMenu.vue` — Use `t()` for labels
- `src/components/RTStatusBar.vue` — Use `t()` for status text
- `src/components/RTEditor.vue` — Accept `locale` prop, provide i18n context

**Technical Details:**

`src/i18n/index.ts`:
```typescript
import en from './en'

export type LocaleMessages = typeof en
export type LocaleKey = keyof LocaleMessages
export type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K
      : never
    }[keyof T]
  : never

const locales: Record<string, LocaleMessages> = { en }
let currentLocale = 'en'

export function registerLocale(name: string, messages: LocaleMessages): void {
  locales[name] = messages
}

export function setLocale(locale: string): void {
  if (!locales[locale]) {
    console.warn(`[RTEditor] Locale "${locale}" not registered. Falling back to "en".`)
    return
  }
  currentLocale = locale
}

export function getLocale(): string {
  return currentLocale
}

export function t(key: string, params?: Record<string, string | number>): string {
  const messages = locales[currentLocale] ?? locales.en
  const value = key.split('.').reduce<any>((obj, k) => obj?.[k], messages)
  if (typeof value !== 'string') return key
  if (!params) return value
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    value
  )
}

// Auto-register built-in locales
import zhTW from './zh-TW'
registerLocale('zh-TW', zhTW)
```

`src/i18n/en.ts`:
```typescript
export default {
  toolbar: {
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strike: 'Strikethrough',
    subscript: 'Subscript',
    superscript: 'Superscript',
    heading: 'Heading',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    paragraph: 'Paragraph',
    bulletList: 'Bullet List',
    orderedList: 'Numbered List',
    checklist: 'Checklist',
    link: 'Insert Link',
    image: 'Insert Image',
    attachFile: 'Attach File',
    table: 'Insert Table',
    math: 'Insert Math',
    comment: 'Add Comment',
    highlight: 'Highlight',
    alignLeft: 'Align Left',
    alignCenter: 'Align Center',
    alignRight: 'Align Right',
    horizontalRule: 'Horizontal Rule',
    undo: 'Undo',
    redo: 'Redo',
  },
  dialog: {
    insertLink: 'Insert Link',
    editLink: 'Edit Link',
    linkUrl: 'URL',
    linkText: 'Text',
    openInNewTab: 'Open in new tab',
    removeLink: 'Remove Link',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
  },
  upload: {
    dropHere: 'Drop file here or click to upload',
    uploading: 'Uploading...',
    uploadFailed: 'Upload failed. Please try again.',
    fileTooLarge: 'File too large (max {limit} MB for {type})',
    unsupportedType: 'Unsupported file type: {type}',
    noHandler: 'No upload handler configured',
  },
  comment: {
    addComment: 'Add comment',
    reply: 'Reply',
    resolve: 'Resolve',
    reopen: 'Reopen',
    delete: 'Delete',
    deleteConfirm: 'Delete this comment?',
    resolved: 'Resolved',
    placeholder: 'Write a comment...',
    replyPlaceholder: 'Write a reply...',
  },
  status: {
    words: '{count} words',
    characters: '{count} characters',
    readingTime: '{count} min read',
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes',
    saveFailed: 'Save failed',
  },
  placeholder: {
    default: 'Start typing...',
    teacher: 'Start writing your lesson plan...',
    student: 'Start taking notes...',
  },
  accessibility: {
    toolbar: 'Formatting toolbar',
    editor: 'Rich text editor',
    bubbleMenu: 'Quick formatting menu',
    linkDialog: 'Link dialog',
    commentBubble: 'Comment thread',
  },
} as const
```

`src/i18n/zh-TW.ts`:
```typescript
import type en from './en'

const zhTW: typeof en = {
  toolbar: {
    bold: '粗體',
    italic: '斜體',
    underline: '底線',
    strike: '刪除線',
    subscript: '下標',
    superscript: '上標',
    heading: '標題',
    h1: '標題 1',
    h2: '標題 2',
    h3: '標題 3',
    h4: '標題 4',
    h5: '標題 5',
    h6: '標題 6',
    paragraph: '段落',
    bulletList: '項目符號清單',
    orderedList: '編號清單',
    checklist: '核取清單',
    link: '插入連結',
    image: '插入圖片',
    attachFile: '附加檔案',
    table: '插入表格',
    math: '插入數學公式',
    comment: '新增評論',
    highlight: '螢光標記',
    alignLeft: '靠左對齊',
    alignCenter: '置中對齊',
    alignRight: '靠右對齊',
    horizontalRule: '水平線',
    undo: '復原',
    redo: '重做',
  },
  dialog: {
    insertLink: '插入連結',
    editLink: '編輯連結',
    linkUrl: '網址',
    linkText: '文字',
    openInNewTab: '在新分頁開啟',
    removeLink: '移除連結',
    cancel: '取消',
    confirm: '確認',
    delete: '刪除',
  },
  upload: {
    dropHere: '拖放檔案至此或點擊上傳',
    uploading: '上傳中...',
    uploadFailed: '上傳失敗，請重試。',
    fileTooLarge: '檔案過大（{type}上限 {limit} MB）',
    unsupportedType: '不支援的檔案類型：{type}',
    noHandler: '未設定上傳處理程式',
  },
  comment: {
    addComment: '新增評論',
    reply: '回覆',
    resolve: '解決',
    reopen: '重新開啟',
    delete: '刪除',
    deleteConfirm: '確定要刪除此評論？',
    resolved: '已解決',
    placeholder: '撰寫評論...',
    replyPlaceholder: '撰寫回覆...',
  },
  status: {
    words: '{count} 字',
    characters: '{count} 字元',
    readingTime: '閱讀時間 {count} 分鐘',
    saved: '已儲存',
    saving: '儲存中...',
    unsaved: '未儲存的變更',
    saveFailed: '儲存失敗',
  },
  placeholder: {
    default: '開始輸入...',
    teacher: '開始撰寫教案...',
    student: '開始做筆記...',
  },
  accessibility: {
    toolbar: '格式工具列',
    editor: '富文本編輯器',
    bubbleMenu: '快速格式選單',
    linkDialog: '連結對話框',
    commentBubble: '評論討論串',
  },
} as const

export default zhTW
```

`src/composables/useI18n.ts`:
```typescript
import { ref, computed, watch } from 'vue'
import { t, setLocale as setGlobalLocale, getLocale, registerLocale } from '../i18n'
import type { LocaleMessages } from '../i18n'

export function useI18n(initialLocale?: string) {
  const locale = ref(initialLocale ?? getLocale())

  function setLocale(newLocale: string) {
    setGlobalLocale(newLocale)
    locale.value = newLocale
  }

  function translate(key: string, params?: Record<string, string | number>): string {
    return t(key, params)
  }

  // Format date/time using Intl.DateTimeFormat
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  function formatRelativeTime(date: Date): string {
    const now = Date.now()
    const diff = now - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return locale.value.startsWith('zh') ? '剛才' : 'Just now'
    if (minutes < 60) return locale.value.startsWith('zh') ? `${minutes} 分鐘前` : `${minutes}m ago`
    if (hours < 24) return locale.value.startsWith('zh') ? `${hours} 小時前` : `${hours}h ago`
    return locale.value.startsWith('zh') ? `${days} 天前` : `${days}d ago`
  }

  return { locale, setLocale, t: translate, formatDate, formatRelativeTime, registerLocale }
}
```

**Acceptance Criteria:**
- [ ] `setLocale('zh-TW')` switches all UI text to Traditional Chinese
- [ ] `<RTEditor locale="zh-TW" />` prop sets locale for that editor instance
- [ ] `t('toolbar.bold')` returns localized string ('Bold' or '粗體')
- [ ] `t('upload.fileTooLarge', { limit: 5, type: 'image' })` interpolates parameters
- [ ] Missing translation keys fall back to English
- [ ] Unknown locale falls back to English with console warning
- [ ] `registerLocale()` allows consumers to add custom locales
- [ ] All toolbar button labels use `t()` function
- [ ] All dialog titles and messages use `t()` function
- [ ] All error messages use `t()` function
- [ ] All ARIA labels use `t()` function
- [ ] All placeholder text uses `t()` function
- [ ] `formatDate()` uses `Intl.DateTimeFormat` with current locale
- [ ] `formatRelativeTime()` returns locale-aware relative time strings
- [ ] Language switching is seamless (no page reload required)
- [ ] No external i18n dependencies (vue-i18n not required)

**Testing:** Write unit tests in `tests/unit/i18n/index.test.ts` testing: `t()` function, `setLocale()`, parameter interpolation, fallback behavior, `registerLocale()`. Write tests in `tests/unit/composables/useI18n.test.ts` testing: `formatDate()`, `formatRelativeTime()`, locale switching.

---

### P2-016: E2E Tests (Playwright)

**Dependencies:** P2-001, P2-002, P2-003, P2-005, P2-006, P2-007, P2-009, P2-010, P2-011, P2-012, P2-014, P2-015
**Priority:** P2

**Description:**
Add end-to-end tests using Playwright covering critical user paths across the editor. Tests run in Chrome, Firefox, and Safari (WebKit). Include accessibility audits via axe-core integration. Visual regression snapshots for key states. Tests validate real browser behavior for editing, uploading, commenting, dark mode, i18n, slash commands, and table editing.

**Files to Create:**
- `tests/e2e/playwright.config.ts`
- `tests/e2e/basic-editing.spec.ts`
- `tests/e2e/upload-flow.spec.ts`
- `tests/e2e/comment-flow.spec.ts`
- `tests/e2e/read-only-mode.spec.ts`
- `tests/e2e/dark-mode.spec.ts`
- `tests/e2e/slash-commands.spec.ts`
- `tests/e2e/table-editing.spec.ts`
- `tests/e2e/i18n.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- `tests/e2e/fixtures/editor-page.ts` — Page Object Model for the editor

**Files to Modify:**
- `package.json` — Add `@playwright/test`, `@axe-core/playwright` as dev dependencies, add `test:e2e` script

**Technical Details:**

`tests/e2e/playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:5173/demo',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
})
```

`tests/e2e/fixtures/editor-page.ts`:
```typescript
import type { Page, Locator } from '@playwright/test'

export class EditorPage {
  readonly page: Page
  readonly editor: Locator
  readonly toolbar: Locator

  constructor(page: Page) {
    this.page = page
    this.editor = page.locator('.ProseMirror')
    this.toolbar = page.locator('[role="toolbar"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.editor.waitFor()
  }

  async typeText(text: string) {
    await this.editor.click()
    await this.page.keyboard.type(text)
  }

  async selectAll() {
    await this.editor.click()
    await this.page.keyboard.press('ControlOrMeta+a')
  }

  async clickToolbarButton(testId: string) {
    await this.toolbar.locator(`[data-testid="${testId}"]`).click()
  }

  async getEditorHTML(): Promise<string> {
    return this.editor.innerHTML()
  }
}
```

`tests/e2e/basic-editing.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'
import { EditorPage } from './fixtures/editor-page'

test.describe('Basic Editing', () => {
  let editorPage: EditorPage

  test.beforeEach(async ({ page }) => {
    editorPage = new EditorPage(page)
    await editorPage.goto()
  })

  test('should type and format text with bold', async () => {
    await editorPage.typeText('Hello World')
    await editorPage.selectAll()
    await editorPage.clickToolbarButton('bold-button')
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('<strong>Hello World</strong>')
  })

  test('should create headings', async () => {
    await editorPage.typeText('My Heading')
    await editorPage.selectAll()
    await editorPage.clickToolbarButton('heading-dropdown')
    await editorPage.page.click('[data-testid="heading-1"]')
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('<h1>My Heading</h1>')
  })

  test('should create bullet list', async () => {
    await editorPage.typeText('Item 1')
    await editorPage.clickToolbarButton('bullet-list-button')
    const html = await editorPage.getEditorHTML()
    expect(html).toContain('<li>')
  })

  test('should undo and redo', async () => {
    await editorPage.typeText('Hello')
    await editorPage.page.keyboard.press('ControlOrMeta+z')
    const htmlAfterUndo = await editorPage.getEditorHTML()
    expect(htmlAfterUndo).not.toContain('Hello')
    await editorPage.page.keyboard.press('ControlOrMeta+Shift+z')
    const htmlAfterRedo = await editorPage.getEditorHTML()
    expect(htmlAfterRedo).toContain('Hello')
  })
})
```

`tests/e2e/accessibility.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { EditorPage } from './fixtures/editor-page'

test.describe('Accessibility', () => {
  test('should pass axe-core audit on default editor', async ({ page }) => {
    const editorPage = new EditorPage(page)
    await editorPage.goto()

    const results = await new AxeBuilder({ page })
      .include('.rte-editor')
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('should pass axe-core audit in dark mode', async ({ page }) => {
    const editorPage = new EditorPage(page)
    await editorPage.goto()
    await editorPage.clickToolbarButton('dark-mode-toggle')

    const results = await new AxeBuilder({ page })
      .include('.rte-editor')
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('should have accessible toolbar with role and labels', async ({ page }) => {
    const editorPage = new EditorPage(page)
    await editorPage.goto()

    const toolbar = page.locator('[role="toolbar"]')
    await expect(toolbar).toHaveAttribute('aria-label')

    const buttons = toolbar.locator('button')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toHaveAttribute('aria-label')
    }
  })
})
```

**Acceptance Criteria:**
- [ ] Playwright config supports Chrome, Firefox, and Safari (WebKit)
- [ ] Basic editing flow tested: type text, bold, italic, headings, lists
- [ ] Upload flow tested: image upload via toolbar, drag-and-drop
- [ ] Comment flow tested: add comment, reply, resolve
- [ ] Read-only mode tested: toolbar hidden, content not editable
- [ ] Dark mode tested: toggle switch, colors change, contrast passes audit
- [ ] Slash commands tested: type `/`, select command, content inserted
- [ ] Table editing tested: insert, add row/column, delete
- [ ] i18n tested: switch locale, verify toolbar labels change
- [ ] axe-core accessibility audit passes with zero violations
- [ ] Visual regression snapshots captured for key states
- [ ] Screenshots captured on test failure
- [ ] Tests run in CI pipeline (`npm run test:e2e`)
- [ ] Page Object Model used for maintainable test structure

**Testing:** These ARE the tests. Verify by running `npx playwright test` across all three browsers. Ensure all tests pass on CI.

---

### P2-017: CKEditor HTML Import Utility

**Dependencies:** P1-003, P1-019
**Priority:** P2

**Description:**
Create a utility function `importCKEditorHTML()` to normalize CKEditor 4 HTML for consumption by RTEditor. DKI and DSI store rich text as HTML strings in MySQL created by CKEditor 4. This utility sanitizes the HTML with DOMPurify first, then converts CKEditor-specific patterns (inline styles for font-size/color/background-color/line-height, `ENTER_BR` mode `<br>` line breaks, table border/cellpadding attributes, images with inline width/height styles) into clean HTML that TipTap/ProseMirror can parse. Also create `exportForLegacy()` for outputting HTML compatible with existing DKI/DSI Blade templates.

**Files to Create:**
- `src/utils/importCKEditorHTML.ts`

**Files to Modify:**
- `src/utils/index.ts` — Add `importCKEditorHTML`, `exportForLegacy` exports
- `src/index.ts` — Add `importCKEditorHTML`, `exportForLegacy` to package exports

**Technical Details:**

`src/utils/importCKEditorHTML.ts`:
```typescript
import type { Editor } from '@tiptap/core'
import DOMPurify from 'dompurify'

export interface ImportCKEditorOptions {
  /** Preserve inline styles from CKEditor (font-size, color, etc.) */
  preserveInlineStyles?: boolean  // default: true
  /** Preserve relative image URLs (e.g., /uploads/image.jpg) */
  preserveRelativeUrls?: boolean  // default: true
  /** Convert CKEditor ENTER_BR mode <br> to hard breaks */
  convertBrToHardBreak?: boolean  // default: true
  /** Additional DOMPurify config */
  purifyConfig?: DOMPurify.Config
}

const DEFAULT_PURIFY_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
    'sub', 'sup', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img', 'span', 'div',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
    'style', 'class', 'colspan', 'rowspan',
    'border', 'cellpadding', 'cellspacing',
  ],
}

/**
 * Import and normalize CKEditor 4 HTML for RTEditor consumption.
 *
 * CKEditor 4 patterns handled:
 * - `<br>` line breaks (ENTER_BR mode) → preserved as hardBreak
 * - Inline styles: font-size, color, background-color, line-height
 * - `<strong>`, `<em>`, `<u>` tags → standard marks
 * - Table border/cellpadding attributes → cleaned for ProseMirror
 * - Images with inline width/height styles → preserved
 * - CKEditor-specific class names → stripped
 */
export function importCKEditorHTML(
  html: string,
  options: ImportCKEditorOptions = {}
): string {
  const {
    preserveInlineStyles = true,
    preserveRelativeUrls = true,
    convertBrToHardBreak = true,
    purifyConfig,
  } = options

  // Step 1: Sanitize with DOMPurify
  const sanitized = DOMPurify.sanitize(html, {
    ...DEFAULT_PURIFY_CONFIG,
    ...purifyConfig,
  })

  // Step 2: Parse into DOM for transformation
  const parser = new DOMParser()
  const doc = parser.parseFromString(sanitized, 'text/html')

  // Step 3: Strip CKEditor-specific class names
  doc.querySelectorAll('[class]').forEach((el) => {
    const classes = Array.from(el.classList)
    const ckClasses = classes.filter(
      (c) => c.startsWith('cke_') || c.startsWith('cke-')
    )
    ckClasses.forEach((c) => el.classList.remove(c))
    if (el.classList.length === 0) el.removeAttribute('class')
  })

  // Step 4: Normalize table attributes
  doc.querySelectorAll('table').forEach((table) => {
    table.removeAttribute('border')
    table.removeAttribute('cellpadding')
    table.removeAttribute('cellspacing')
  })

  // Step 5: Convert inline style patterns if preserving
  if (preserveInlineStyles) {
    doc.querySelectorAll('span[style]').forEach((span) => {
      const style = (span as HTMLElement).style
      // Preserve font-size, color, background-color, line-height
      // These will be handled by Phase 2 extensions (TextColor, FontSize, etc.)
      const preserved: string[] = []
      if (style.fontSize) preserved.push(`font-size:${style.fontSize}`)
      if (style.color) preserved.push(`color:${style.color}`)
      if (style.backgroundColor) preserved.push(`background-color:${style.backgroundColor}`)
      if (style.lineHeight) preserved.push(`line-height:${style.lineHeight}`)

      if (preserved.length > 0) {
        ;(span as HTMLElement).setAttribute('style', preserved.join(';'))
      } else {
        // No relevant styles — unwrap the span
        const parent = span.parentNode
        while (span.firstChild) {
          parent?.insertBefore(span.firstChild, span)
        }
        parent?.removeChild(span)
      }
    })
  }

  // Step 6: Normalize image dimensions from inline styles to attributes
  doc.querySelectorAll('img[style]').forEach((img) => {
    const style = (img as HTMLElement).style
    if (style.width && !img.getAttribute('width')) {
      img.setAttribute('width', style.width.replace('px', ''))
    }
    if (style.height && !img.getAttribute('height')) {
      img.setAttribute('height', style.height.replace('px', ''))
    }
  })

  // Step 7: Ensure links have safe attributes
  doc.querySelectorAll('a').forEach((a) => {
    if (a.getAttribute('target') === '_blank') {
      a.setAttribute('rel', 'noopener noreferrer')
    }
  })

  return doc.body.innerHTML
}

/**
 * Export editor HTML in a format compatible with existing DKI/DSI
 * Blade templates. Ensures output uses tags that DKI/DSI CSS already styles.
 */
export function exportForLegacy(editor: Editor): string {
  const html = editor.getHTML()

  // Ensure output uses standard tags:
  // - <strong> for bold (not <b>)
  // - <em> for italic (not <i>)
  // - <u> for underline
  // TipTap already outputs these tags by default, so minimal transformation needed
  return html
}
```

**Acceptance Criteria:**
- [ ] `importCKEditorHTML()` sanitizes input with DOMPurify before processing
- [ ] CKEditor `ENTER_BR` mode HTML (`<p>Line one<br>Line two</p>`) loads correctly
- [ ] Inline styles (`font-size`, `color`, `background-color`, `line-height`) preserved
- [ ] `<strong>`, `<em>`, `<u>` tags render correctly in RTEditor
- [ ] CKEditor table HTML (with `border`, `cellpadding` attributes) normalizes cleanly
- [ ] Images with inline `width`/`height` styles are preserved
- [ ] Relative image URLs (e.g., `/uploads/image.jpg`) are not modified
- [ ] CKEditor-specific CSS class names (`cke_*`) are stripped
- [ ] Links with `target="_blank"` get `rel="noopener noreferrer"` added
- [ ] XSS payloads in CKEditor HTML are sanitized (no script execution)
- [ ] `exportForLegacy()` outputs HTML compatible with DKI/DSI Blade views
- [ ] No data loss when round-tripping: CKEditor → DB → RTEditor → DB → Blade
- [ ] Empty HTML input returns empty string (no errors)

**Testing:** Write unit tests in `tests/unit/utils/importCKEditorHTML.test.ts` testing: DOMPurify sanitization, CKEditor HTML patterns (inline styles, BR mode, tables, images), XSS prevention, round-trip preservation, empty/null input handling.

---

### P2-018: Accessibility — Phase 2 Enhancements

**Dependencies:** P1-025, P2-001, P2-003
**Priority:** P2

**Description:**
Enhance accessibility for all Phase 2 features. Add ARIA live regions for auto-save status and comment notifications. Implement `prefers-reduced-motion` support across all animated components. Ensure comment bubbles are fully keyboard-accessible. Add keyboard navigation for table cells (Tab/Shift+Tab, arrow keys). Verify dark mode contrast meets WCAG AA requirements. Conduct screen reader testing with NVDA, JAWS, and VoiceOver.

**Files to Create:**
- `src/styles/reduced-motion.css` — `@media (prefers-reduced-motion)` overrides
- `src/utils/a11y.ts` — Accessibility helper utilities (announceToScreenReader, trapFocus)

**Files to Modify:**
- `src/components/RTEditor.vue` — Add ARIA live region for status announcements
- `src/components/RTToolbar.vue` — Add `aria-pressed` for toggle buttons, `aria-expanded` for dropdowns
- `src/components/RTBubbleMenu.vue` — Add `role="dialog"`, focus trap, Escape key dismissal
- `src/components/RTStatusBar.vue` — Ensure `aria-live="polite"` for status updates
- `src/extensions/CommentExtension.ts` — Keyboard shortcuts for comment navigation
- `src/extensions/TableExtension.ts` — Tab/Shift+Tab navigation between cells
- `src/styles/theme.css` — Add dark mode contrast fixes, focus indicator styles
- `src/styles/editor.css` — Import `reduced-motion.css`

**Technical Details:**

`src/utils/a11y.ts`:
```typescript
/**
 * Announce a message to screen readers via an ARIA live region.
 * Creates a temporary visually-hidden element with role="status".
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const el = document.createElement('div')
  el.setAttribute('role', priority === 'assertive' ? 'alert' : 'status')
  el.setAttribute('aria-live', priority)
  el.setAttribute('aria-atomic', 'true')
  el.className = 'rte-sr-only'
  el.textContent = message
  document.body.appendChild(el)

  // Remove after screen reader has time to announce
  setTimeout(() => {
    document.body.removeChild(el)
  }, 1000)
}

/**
 * Trap focus within a container element (for modals/dialogs).
 * Returns a cleanup function to remove the trap.
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableSelectors = [
    'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
    'input:not([disabled])', 'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  container.addEventListener('keydown', handleKeyDown)
  return () => container.removeEventListener('keydown', handleKeyDown)
}

/**
 * Get keyboard shortcut label based on platform (Ctrl vs Cmd).
 */
export function getShortcutLabel(key: string, modifier: 'ctrl' | 'shift' | 'alt' = 'ctrl'): string {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
  const modKey = modifier === 'ctrl'
    ? (isMac ? '⌘' : 'Ctrl')
    : modifier === 'shift'
    ? (isMac ? '⇧' : 'Shift')
    : (isMac ? '⌥' : 'Alt')
  return `${modKey}+${key}`
}
```

`src/styles/reduced-motion.css`:
```css
/* Respect prefers-reduced-motion user preference */
@media (prefers-reduced-motion: reduce) {
  .rte-toolbar,
  .rte-bubble-menu,
  .rte-dialog,
  .rte-comment-bubble,
  .rte-status-bar,
  .rte-slash-menu,
  .rte-image-upload,
  .rte-file-attachment {
    transition: none !important;
    animation: none !important;
  }

  .rte-editor .ProseMirror {
    scroll-behavior: auto;
  }

  /* Keep opacity changes for visibility (not motion) */
  .rte-toolbar {
    transition: opacity 0s !important;
  }
}
```

Table keyboard navigation addition to `TableExtension.ts`:
```typescript
// Add keyboard handler for Tab navigation between table cells
addKeyboardShortcuts() {
  return {
    Tab: () => {
      if (this.editor.isActive('table')) {
        return this.editor.chain().focus().goToNextCell().run()
      }
      return false
    },
    'Shift-Tab': () => {
      if (this.editor.isActive('table')) {
        return this.editor.chain().focus().goToPreviousCell().run()
      }
      return false
    },
  }
},
```

Comment keyboard navigation:
```typescript
// Add to CommentExtension — keyboard shortcuts for comment threads
addKeyboardShortcuts() {
  return {
    // Navigate to next comment
    'Alt-ArrowDown': () => {
      // Find and focus next comment highlight in document
      announceToScreenReader('Navigated to next comment')
      return this.editor.commands.goToNextComment()
    },
    // Navigate to previous comment
    'Alt-ArrowUp': () => {
      announceToScreenReader('Navigated to previous comment')
      return this.editor.commands.goToPreviousComment()
    },
  }
},
```

**Acceptance Criteria:**
- [ ] ARIA live region announces auto-save status changes (Saved, Saving, Save failed)
- [ ] ARIA live region announces comment activity (new comment, reply, resolved)
- [ ] `prefers-reduced-motion` disables all CSS transitions and animations
- [ ] Comment bubbles are keyboard-accessible (Tab to focus, Enter to open, Escape to close)
- [ ] Comment threads support focus trap when open
- [ ] Table cells navigable with Tab (forward) and Shift+Tab (backward)
- [ ] Alt+ArrowDown/Up navigates between comment highlights in document
- [ ] Dark mode passes WCAG AA contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] All toggle buttons have `aria-pressed` state
- [ ] All dropdown menus have `aria-expanded` state
- [ ] Bubble menu has `role="dialog"` and focus trap
- [ ] Focus indicators visible in both light and dark mode (3:1 contrast)
- [ ] `announceToScreenReader()` utility works with NVDA, JAWS, VoiceOver
- [ ] Screen reader testing documented for all Phase 2 features
- [ ] Keyboard shortcut labels show correct modifier (Ctrl vs ⌘) based on platform

**Testing:** Write unit tests in `tests/unit/utils/a11y.test.ts` for `announceToScreenReader`, `trapFocus`, `getShortcutLabel`. Add accessibility-focused tests to existing component test files. Include axe-core audit in E2E tests (P2-016).


---

### P2-019: DKI saveAsFileToStorage() Upload Handler — Dual Upload Strategy

**Dependencies:** P1-002, P1-008, P1-017, P2-006
**Priority:** P1

**Description:**
Create a DKI-specific upload handler that maps RTEditor's `UploadHandler` interface to DKI's `saveAsFileToStorage()` backend pattern. This enables **two upload strategies** for images and PDFs:

- **Pattern A (Original — Generic Callback):** Consumer provides any `UploadHandler` callback `(file: File) => Promise<UploadResult>`. RTEditor is backend-agnostic. This is already designed in P1-008, P1-017, P2-006, and P3-010.
- **Pattern B (DKI — saveAsFileToStorage):** A pre-built handler factory `createDKIMediaHandler()` that posts FormData to a Laravel endpoint which internally calls DKI's `AbstractMediaService::saveAsFileToStorage()`. The handler maps DKI's response format (`hash_name`, `path`, `thumbnail`, `file_size`, `file_type`) to RTEditor's `UploadResult` format (`url`, `alt`, `filename`, `filesize`).

Both patterns conform to the same `UploadHandler` interface, so RTEditor's core code is unaware of which strategy is in use. The consumer chooses at configuration time.

**Why this exists:** DKI (and eventually DSI) already has a battle-tested file upload pipeline via `saveAsFileToStorage()` — it handles hash-based directory structures, EXIF rotation, thumbnail generation, and resized image creation. Rather than duplicating this logic, RTEditor consumers in DKI should be able to reuse the existing backend by simply pointing RTEditor at the right Laravel endpoint.

**Relationship to P3-010:** P3-010 defines a generic `createLaravelUploadHandler()` that expects a simple `{ url, alt }` JSON response. P2-019's `createDKIMediaHandler()` is **DKI-specific** — it understands `saveAsFileToStorage()`'s unique response structure (`output.path`, `output.hash_name`, `output.extension`, `output.thumbnail`, `output.resized`, etc.) and constructs the correct file URLs from those fields. The generic Laravel handler in P3-010 does NOT understand this format.

**Files to Create:**
- `src/upload-handlers/dki.ts` — DKI-specific handler factory + types
- `src/upload-handlers/dki-types.ts` — DKI media config and response type definitions

**Files to Modify:**
- `src/upload-handlers/index.ts` — Add `createDKIMediaHandler` export and `DKIMediaHandlerOptions` type export
- `src/upload-handlers/types.ts` — (if needed) Ensure `UploadProgress` type is exported

**Technical Details:**

`src/upload-handlers/dki-types.ts`:
```typescript
/**
 * DKI Media Configuration — mirrors DKI's config/media.php structure.
 * Used to tell the handler what type of media is being uploaded so the
 * Laravel endpoint can pass the correct config to saveAsFileToStorage().
 */
export interface DKIMediaConfig {
  /** Storage sub-path (e.g., '/student_photos', '/digital_channel/') */
  path: string
  /** Use hash-based nested directory structure (default: true) */
  hashNamePath?: boolean
  /** Allowed file formats as comma-separated extensions (e.g., '.jpg, .jpeg, .png, .gif, .pdf') */
  format?: string
  /** Max file size in bytes */
  size?: number
  /** Whether to generate a thumbnail */
  requireThumb?: boolean
  /** Thumbnail width in pixels */
  thumbnailWidth?: number
  /** Thumbnail height in pixels */
  thumbnailHeight?: number
  /** Whether to generate a resized version */
  requireResize?: boolean
  /** Resized image max width in pixels */
  imageWidth?: number
  /** Resized image max height in pixels */
  imageHeight?: number
  /** Max directory depth for hash-based paths (default: 5) */
  uploadMaxPath?: number
}

/**
 * Response from DKI's saveAsFileToStorage() method.
 * This is the shape of the JSON returned by the Laravel endpoint
 * after calling saveAsFileToStorage().
 */
export interface DKISaveAsFileResponse {
  status: boolean
  output: {
    /** Original filename without extension */
    name: string
    /** Storage path (e.g., 'media/student_photos/a/b/c/d/e') */
    path: string
    /** File extension with dot (e.g., '.jpg') */
    extension: string
    /** Hash-based filename (e.g., 'abc123def456') */
    hash_name: string
    /** File size in bytes */
    file_size: number
    /** MIME type (e.g., 'image/jpeg') */
    file_type: string
    /** Thumbnail relative path (if generated) */
    thumbnail?: string
    /** Thumbnail file size in bytes */
    thumbnail_file_size?: number
    /** Thumbnail MIME type */
    thumbnail_file_type?: string
    /** Resized image relative path (if generated) */
    resized?: string
    /** Resized file size in bytes */
    resized_file_size?: number
    /** Resized MIME type */
    resized_file_type?: string
  }
  /** Error message if status is false */
  message?: string
}

/**
 * Options for creating a DKI media upload handler.
 */
export interface DKIMediaHandlerOptions {
  /**
   * Laravel endpoint URL that accepts FormData and calls saveAsFileToStorage().
   * Example: '/api/rteditor/upload' or '/my-digital-channel/abc123/upload-media'
   */
  endpoint: string

  /**
   * CSRF token for Laravel. If not provided, auto-reads from:
   * `<meta name="csrf-token" content="...">`
   */
  csrfToken?: string

  /**
   * Media type key sent to the Laravel endpoint so it knows which
   * config/media.php entry to use (e.g., 'student_photo', 'digital_channel_media').
   * The Laravel controller uses this to load the correct $file_config array.
   */
  mediaType?: string

  /**
   * Base URL for constructing full file URLs from storage paths.
   * DKI stores files in storage/app/media/ — this base URL maps to that.
   * Example: '/storage/media' or 'https://dki.example.com/storage/media'
   * Default: '/storage/media'
   */
  storageBaseUrl?: string

  /**
   * Base URL for constructing thumbnail URLs.
   * Default: same as storageBaseUrl
   */
  thumbnailBaseUrl?: string

  /**
   * Prefer resized version URL over original (for images).
   * If true and a resized version exists, UploadResult.url will point to the resized file.
   * Default: false
   */
  preferResized?: boolean

  /**
   * Allowed MIME types (validated client-side before upload).
   * Default: IMAGE_MIME_TYPES + PDF_MIME_TYPES
   */
  allowedTypes?: string[]

  /**
   * Max file size in bytes (validated client-side before upload).
   * Default: 5MB for images, 1MB for PDFs (uses RTEditor's defaults)
   */
  maxFileSize?: number

  /**
   * Progress callback.
   */
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void

  /**
   * Additional headers to include in the request.
   */
  headers?: Record<string, string>

  /**
   * Additional FormData fields to send with the upload.
   * Useful for passing context (e.g., album_id, document_type).
   */
  additionalFields?: Record<string, string>

  /**
   * Axios instance to use instead of fetch.
   * If provided, uses axios.post() with onUploadProgress.
   */
  axiosInstance?: any
}
```

`src/upload-handlers/dki.ts`:
```typescript
import type { UploadResult } from '../types/upload'
import type { DKIMediaHandlerOptions, DKISaveAsFileResponse } from './dki-types'

/**
 * Create an upload handler for DKI's saveAsFileToStorage() backend.
 *
 * This handler posts a file as FormData to a Laravel endpoint that
 * internally calls AbstractMediaService::saveAsFileToStorage().
 * It then maps the DKI-specific response format to RTEditor's
 * standard UploadResult interface.
 *
 * ## Pattern A vs Pattern B
 *
 * RTEditor supports two upload strategies:
 *
 * **Pattern A — Generic Callback (default):**
 * ```typescript
 * // Consumer provides their own upload logic
 * <RTEditor
 *   v-model="content"
 *   :upload-handler="async (file) => {
 *     const formData = new FormData()
 *     formData.append('file', file)
 *     const res = await fetch('/my-api/upload', { method: 'POST', body: formData })
 *     const data = await res.json()
 *     return { url: data.url, alt: file.name }
 *   }"
 * />
 * ```
 *
 * **Pattern B — DKI saveAsFileToStorage() (this handler):**
 * ```typescript
 * import { createDKIMediaHandler } from '@timothyphchan/rteditor/upload-handlers'
 *
 * const dkiHandler = createDKIMediaHandler({
 *   endpoint: '/api/rteditor/upload',
 *   mediaType: 'digital_channel_media',
 *   storageBaseUrl: '/storage/media',
 *   preferResized: true,
 * })
 *
 * <RTEditor v-model="content" :upload-handler="dkiHandler" />
 * ```
 *
 * Both patterns produce the same `UploadResult` — RTEditor's core
 * code is unaware of which strategy is in use.
 *
 * ## Required Laravel Endpoint
 *
 * The DKI consumer must create a Laravel route + controller that:
 * 1. Accepts a multipart/form-data POST with a 'file' field
 * 2. Reads the optional 'media_type' field to determine config
 * 3. Calls saveAsFileToStorage($file, $media_config)
 * 4. Returns the saveAsFileToStorage() result as JSON
 *
 * Example Laravel Controller:
 * ```php
 * // routes/web.php
 * Route::post('/api/rteditor/upload', 'RTEditorUploadController@upload');
 *
 * // app/Http/Controllers/RTEditorUploadController.php
 * class RTEditorUploadController extends Controller
 * {
 *     public function upload(Request $request)
 *     {
 *         $file = $request->file('file');
 *         $media_type = $request->input('media_type', 'digital_channel_media');
 *         $media_config = config("media.{$media_type}");
 *
 *         $media_service = app()->make(config('env.MEDIA_SERVICE'));
 *         $result = $media_service->saveAsFileToStorage($file, $media_config);
 *
 *         return response()->json($result);
 *     }
 * }
 * ```
 */
export function createDKIMediaHandler(options: DKIMediaHandlerOptions): (file: File) => Promise<UploadResult> {
  const storageBaseUrl = (options.storageBaseUrl ?? '/storage/media').replace(/\/$/, '')
  const thumbnailBaseUrl = (options.thumbnailBaseUrl ?? storageBaseUrl).replace(/\/$/, '')

  return async (file: File): Promise<UploadResult> => {
    // 1. Client-side validation
    if (options.maxFileSize && file.size > options.maxFileSize) {
      const limitMB = (options.maxFileSize / (1024 * 1024)).toFixed(1)
      throw new Error(`File too large: ${file.name} (max ${limitMB} MB)`)
    }

    if (options.allowedTypes?.length) {
      const isAllowed = options.allowedTypes.some((type) => {
        if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'))
        return file.type === type
      })
      if (!isAllowed) {
        throw new Error(`File type not allowed: ${file.type}`)
      }
    }

    // 2. Build FormData
    const formData = new FormData()
    formData.append('file', file)

    if (options.mediaType) {
      formData.append('media_type', options.mediaType)
    }

    if (options.additionalFields) {
      Object.entries(options.additionalFields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // 3. Get CSRF token
    const csrfToken = options.csrfToken
      ?? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
      ?? ''

    // 4. Upload via axios or fetch
    let responseData: DKISaveAsFileResponse

    if (options.axiosInstance) {
      const response = await options.axiosInstance.post(options.endpoint, formData, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          ...options.headers,
        },
        onUploadProgress: options.onProgress
          ? (e: any) => {
              if (e.total) {
                options.onProgress!({
                  loaded: e.loaded,
                  total: e.total,
                  percentage: Math.round((e.loaded / e.total) * 100),
                })
              }
            }
          : undefined,
      })
      responseData = response.data
    } else {
      // Use fetch with XHR fallback for progress
      if (options.onProgress) {
        responseData = await uploadWithXHR(options.endpoint, formData, csrfToken, options)
      } else {
        const response = await fetch(options.endpoint, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            Accept: 'application/json',
            ...options.headers,
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error((error as any).message ?? `Upload failed: ${response.status}`)
        }

        responseData = await response.json()
      }
    }

    // 5. Validate DKI response
    if (!responseData.status) {
      throw new Error(responseData.message ?? 'saveAsFileToStorage() returned status: false')
    }

    if (!responseData.output) {
      throw new Error('Invalid response: missing output field')
    }

    // 6. Map DKI response to RTEditor's UploadResult
    return mapDKIResponseToUploadResult(responseData, storageBaseUrl, thumbnailBaseUrl, options.preferResized ?? false)
  }
}

/**
 * Maps DKI's saveAsFileToStorage() response to RTEditor's UploadResult.
 *
 * DKI stores files at: storage/app/media/{path}/{hash_chars}/{hash_name}{extension}
 * The public URL is constructed as: {storageBaseUrl}/{path}/{hash_name}{extension}
 *
 * For images with thumbnails:
 *   thumbnail URL = {thumbnailBaseUrl}/{output.thumbnail}
 *
 * For images with resized versions:
 *   resized URL = {storageBaseUrl}/{output.resized}
 */
function mapDKIResponseToUploadResult(
  response: DKISaveAsFileResponse,
  storageBaseUrl: string,
  thumbnailBaseUrl: string,
  preferResized: boolean
): UploadResult {
  const output = response.output

  // Construct the primary file URL
  // DKI path format: "media/student_photos/a/b/c/d/e"
  // DKI hash_name: "abc123def456"
  // DKI extension: ".jpg"
  // Full path: {storageBaseUrl}/{path}/{hash_name}{extension}
  // But output.path already includes the media prefix, so we use storageBaseUrl as the root
  const basePath = output.path.replace(/^media\/?/, '')
  const primaryUrl = `${storageBaseUrl}/${basePath}/${output.hash_name}${output.extension}`

  // Determine which URL to use
  let url = primaryUrl

  if (preferResized && output.resized) {
    // Use resized version if available and preferred
    const resizedPath = output.resized.replace(/^media\/?/, '')
    url = `${storageBaseUrl}/${resizedPath}`
  }

  const result: UploadResult = {
    url,
    alt: output.name,
    filename: `${output.name}${output.extension}`,
    filesize: output.file_size,
  }

  // Attach DKI-specific metadata as extra fields for consumers who need them.
  // These are not part of RTEditor's core UploadResult but can be accessed
  // by DKI-specific code via type assertion.
  ;(result as DKIUploadResultExtended).dkiMeta = {
    hashName: output.hash_name,
    storagePath: output.path,
    extension: output.extension,
    fileType: output.file_type,
    thumbnailUrl: output.thumbnail
      ? `${thumbnailBaseUrl}/${output.thumbnail.replace(/^media\/?/, '')}`
      : undefined,
    thumbnailFileSize: output.thumbnail_file_size,
    resizedUrl: output.resized
      ? `${storageBaseUrl}/${output.resized.replace(/^media\/?/, '')}`
      : undefined,
    resizedFileSize: output.resized_file_size,
  }

  return result
}

/**
 * Extended UploadResult with DKI-specific metadata.
 * Use type assertion to access: `(result as DKIUploadResultExtended).dkiMeta`
 */
export interface DKIUploadResultExtended extends UploadResult {
  dkiMeta: {
    hashName: string
    storagePath: string
    extension: string
    fileType: string
    thumbnailUrl?: string
    thumbnailFileSize?: number
    resizedUrl?: string
    resizedFileSize?: number
  }
}

/**
 * Upload with XHR for progress tracking (used when no axios instance).
 */
function uploadWithXHR(
  url: string,
  formData: FormData,
  csrfToken: string,
  options: DKIMediaHandlerOptions
): Promise<DKISaveAsFileResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken)
    xhr.setRequestHeader('Accept', 'application/json')

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options.onProgress) {
        options.onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        })
      }
    })

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          reject(new Error('Invalid JSON response from DKI endpoint'))
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText)
          reject(new Error(error.message ?? `Upload failed: ${xhr.status}`))
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(formData)
  })
}
```

`src/upload-handlers/index.ts` — Add DKI exports:
```typescript
// ... existing exports from P3-010 ...

export { createDKIMediaHandler } from './dki'
export type { DKIMediaHandlerOptions, DKISaveAsFileResponse, DKIMediaConfig } from './dki-types'
export type { DKIUploadResultExtended } from './dki'
```

**Integration Example — Both Patterns Side by Side:**

```vue
<template>
  <!-- PATTERN A: Generic callback — consumer provides their own upload logic -->
  <RTEditor v-model="content" :upload-handler="customHandler" />

  <!-- PATTERN B: DKI saveAsFileToStorage() — pre-built handler -->
  <RTEditor v-model="content" :upload-handler="dkiHandler" />
</template>

<script setup lang="ts">
import { RTEditor } from '@timothyphchan/rteditor'
import { createDKIMediaHandler } from '@timothyphchan/rteditor/upload-handlers'
import type { UploadResult } from '@timothyphchan/rteditor'

// ──────────────────────────────────────────────
// PATTERN A: Generic callback (backend-agnostic)
// ──────────────────────────────────────────────
// Consumer writes their own upload logic.
// RTEditor only cares about the returned { url, alt, filename, filesize }.
const customHandler = async (file: File): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/my-custom-api/upload', {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  return { url: data.url, alt: file.name, filename: data.filename, filesize: data.size }
}

// ──────────────────────────────────────────────
// PATTERN B: DKI saveAsFileToStorage()
// ──────────────────────────────────────────────
// Uses createDKIMediaHandler() which knows how to:
// 1. POST FormData to a Laravel endpoint
// 2. Map DKI's saveAsFileToStorage() response to UploadResult
//
// The Laravel endpoint must:
// - Accept multipart/form-data POST with 'file' field
// - Call saveAsFileToStorage($file, $media_config)
// - Return the result as JSON
const dkiHandler = createDKIMediaHandler({
  // Laravel endpoint that wraps saveAsFileToStorage()
  endpoint: '/api/rteditor/upload',

  // Which media.php config entry to use (sent as 'media_type' form field)
  mediaType: 'digital_channel_media',

  // Base URL mapping to storage/app/media/
  storageBaseUrl: '/storage/media',

  // Use resized version for images if available
  preferResized: true,

  // File size limit (client-side validation)
  maxFileSize: 5 * 1024 * 1024,

  // Progress tracking
  onProgress: (p) => console.log(`Upload: ${p.percentage}%`),
})
</script>
```

**Required Laravel Endpoint for Pattern B:**

```php
// ======================================================
// routes/web.php (or routes/api.php)
// ======================================================
Route::post('/api/rteditor/upload', 'RTEditorUploadController@upload')
    ->middleware(['auth', 'web']);

// ======================================================
// app/Http/Controllers/RTEditorUploadController.php
// ======================================================
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class RTEditorUploadController extends Controller
{
    /**
     * Handle RTEditor file upload.
     * Receives a file via FormData and saves it using saveAsFileToStorage().
     * Returns the saveAsFileToStorage() result as JSON for the frontend handler to map.
     */
    public function upload(Request $request)
    {
        // 1. Validate the incoming file
        $request->validate([
            'file' => 'required|file|max:5120', // 5MB max
            'media_type' => 'nullable|string|in:student_photo,digital_channel_media,admission_document',
        ]);

        $file = $request->file('file');
        $media_type = $request->input('media_type', 'digital_channel_media');

        // 2. Load media config from config/media.php
        $media_config = config("media.{$media_type}");

        if (!$media_config) {
            return response()->json([
                'status' => false,
                'message' => "Unknown media type: {$media_type}",
            ], 422);
        }

        // 3. Call saveAsFileToStorage()
        $media_service = app()->make(config('env.MEDIA_SERVICE'));
        $result = $media_service->saveAsFileToStorage($file, $media_config);

        // 4. Return the result as-is — the frontend handler maps the format
        return response()->json($result);
    }
}
```

**DKI Media Config Reference:**

The `mediaType` option maps to entries in DKI's `config/media.php`:
```php
// config/media.php — existing DKI configuration
return [
    'media_path' => 'media',
    'upload_max_path' => 5,

    'student_photo' => [
        'path' => '/student_photos',
        'hash_name_path' => true,
        'format' => '.jpg, .jpeg, .png, .gif',
        'size' => 5 * 1024 * 1024,
        'require_thumb' => true,
        'thumbnail_width' => 144,
        'thumbnail_height' => 180,
    ],

    'digital_channel_media' => [
        'path' => '/digital_channel/',
        'require_resize' => true,
        'require_thumb' => true,
        'image_width' => '2048',
        'image_height' => '2048',
    ],

    'admission_document' => [
        'path' => '/admission_document',
        'format' => '.jpg, .jpeg, .png, .gif, .pdf',
        'size' => 5 * 1024 * 1024,
    ],

    // NEW — Add this entry for RTEditor general uploads
    'rteditor_upload' => [
        'path' => '/rteditor',
        'hash_name_path' => true,
        'format' => '.jpg, .jpeg, .png, .gif, .webp, .pdf',
        'size' => 5 * 1024 * 1024,
        'require_thumb' => true,
        'thumbnail_width' => 300,
        'thumbnail_height' => 300,
        'require_resize' => true,
        'image_width' => 1920,
        'image_height' => 1920,
    ],
];
```

**Cross-references to existing tasks:**

| Task | Relationship |
|------|-------------|
| P1-002 | Defines `UploadHandler`, `UploadResult`, `FileCategory` types — P2-019 implements the `UploadHandler` interface |
| P1-008 | `useUpload` composable wraps the handler — works identically with Pattern A or Pattern B |
| P1-017 | `ImageUploadExtension` calls `useUpload.upload()` — agnostic to which pattern is in use |
| P2-006 | `FileAttachmentExtension` calls `useUpload.upload()` for PDF/doc uploads — agnostic to which pattern |
| P3-010 | Generic `createLaravelUploadHandler()` expects simple `{ url, alt }` JSON. P2-019's `createDKIMediaHandler()` understands DKI's richer response format. Both are separate handlers consumers can choose from |

**Acceptance Criteria:**
- [ ] `createDKIMediaHandler()` returns a function matching `UploadHandler` signature: `(file: File) => Promise<UploadResult>`
- [ ] Handler constructs FormData with 'file' field and optional 'media_type' field
- [ ] CSRF token auto-detected from `<meta name="csrf-token">` if not provided
- [ ] DKI's `saveAsFileToStorage()` response correctly mapped to `UploadResult`:
  - `output.path + '/' + output.hash_name + output.extension` → `UploadResult.url`
  - `output.name` → `UploadResult.alt`
  - `output.name + output.extension` → `UploadResult.filename`
  - `output.file_size` → `UploadResult.filesize`
- [ ] `preferResized: true` uses `output.resized` path for URL when available
- [ ] Thumbnail URL correctly constructed from `output.thumbnail`
- [ ] `dkiMeta` extended field available via type assertion for DKI-specific consumers
- [ ] Works with both `fetch` and Axios (via `axiosInstance` option)
- [ ] Upload progress callback works with both fetch (XHR fallback) and Axios
- [ ] Client-side file type and size validation before upload
- [ ] Clear error messages for: failed uploads, invalid response format, saveAsFileToStorage() returning `status: false`
- [ ] Handler is tree-shakeable — only included if consumer imports it
- [ ] Exported from `@timothyphchan/rteditor/upload-handlers` entry point
- [ ] Both Pattern A and Pattern B produce identical `UploadResult` from RTEditor's perspective
- [ ] TypeScript types fully documented with JSDoc
- [ ] Example Laravel controller provided in documentation

**Testing:** Write unit tests in `tests/unit/upload-handlers/dki.test.ts` covering:
- Successful upload with mock DKI response → correct UploadResult mapping
- URL construction from DKI path/hash_name/extension fields
- Thumbnail URL construction
- Resized URL used when `preferResized: true`
- CSRF token auto-detection from meta tag
- Client-side file validation (type + size)
- Error handling: network error, non-200 status, `status: false` response, missing output field
- FormData includes 'media_type' when configured
- Additional fields appended to FormData
- Progress callback invoked during upload (mock XHR)
- Works with mock Axios instance
- Each test should verify the handler conforms to the `UploadHandler` signature
- Target: ≥90% coverage

---

### P2-020: RTCommentSidebar Component

**Dependencies:** P2-001, P2-002
**Priority:** P1

**Description:**
Create a comment sidebar panel (like Google Docs) that lists ALL comments in the document for full review. This is the second half of the **dual comment UI** system (see REQUIREMENTS.md Section 19.5). While RTCommentBubble (P2-002) provides quick, contextual comment interaction on a single thread, RTCommentSidebar provides a comprehensive view of all comments — essential for teachers reviewing student work.

**Files to Create:**
- `src/components/RTCommentSidebar.vue`

**Files to Modify:**
- `src/components/RTEditor.vue` — Render RTCommentSidebar inside the `<aside class="rte-sidebar">` slot (scaffolded in P1-018)
- `src/types/editor.ts` — Add `'commentSidebar'` to `ToolbarItem` type if not already present
- `src/index.ts` — Export `RTCommentSidebar`

**Technical Details:**

The sidebar is a right-side panel (`.rte-sidebar`) listing all comments in document order. It reads from the same `CommentStore` (P2-001) as RTCommentBubble.

Props:
```typescript
interface RTCommentSidebarProps {
  editor: Editor | null
  comments: CommentStore
  currentUserId: string
  currentUserRole: 'teacher' | 'student'
  isOpen: boolean
}
```

Emits:
```typescript
interface RTCommentSidebarEmits {
  close: []
  'scroll-to-comment': [commentId: string]
}
```

Features:
- Lists all comment threads in document order (top-to-bottom based on their position in the ProseMirror document)
- Each entry shows: highlighted text snippet (truncated to ~50 chars), root comment author + content, reply count badge, resolved/unresolved status
- Clicking a comment entry scrolls the editor to the associated highlighted text and briefly pulses the highlight (`.rte-comment-highlight--active` class for 1.5s)
- Resolved comments shown in a collapsed "Resolved" section at the bottom (expandable)
- Unresolved comments shown prominently at the top
- Quick actions per thread: Reply, Resolve (permission-checked), Delete (permission-checked)
- Filter/sort options: All / Unresolved only / By author
- Comment count badge in header (e.g., "Comments (12)")
- Empty state: "No comments yet" message
- Close button (×) in sidebar header

**Responsive behavior (REQUIREMENTS.md Section 19.5, 13.3):**
- **Desktop (≥ 1024px):** Sidebar rendered beside the editor content in a flex row. Width: `var(--rte-sidebar-width, 320px)`. Background: `var(--rte-sidebar-bg, #f9fafb)`. Left border: `var(--rte-sidebar-border, 1px solid #e5e7eb)`.
- **Tablet (768–1023px):** Sidebar renders as a **drawer overlay** sliding in from the right edge, with a semi-transparent backdrop. Width: 320px. Z-index above editor content.
- **Mobile (< 768px):** Sidebar renders as a **bottom panel** sliding up from the bottom, `max-height: 50vh`, with a drag handle to dismiss.

Keyboard accessibility:
- `role="complementary"` with `aria-label="Comment sidebar"`
- Focus trap when sidebar is open on tablet/mobile (overlay mode)
- Escape key closes the sidebar
- Arrow keys navigate between comment entries
- Enter key opens/focuses the selected comment thread

**Acceptance Criteria:**
- [ ] Sidebar lists all comments in document order
- [ ] Clicking a comment scrolls editor to the associated text and pulses the highlight
- [ ] Resolved comments collapsed in a separate section
- [ ] Quick actions (Reply, Resolve, Delete) work with proper permissions
- [ ] Filter by All / Unresolved / By author works
- [ ] Comment count badge shows correct number
- [ ] Empty state shown when no comments exist
- [ ] Close button dismisses the sidebar
- [ ] **Desktop:** Renders beside editor in flex row (320px width)
- [ ] **Tablet:** Renders as right-edge drawer overlay with backdrop
- [ ] **Mobile:** Renders as bottom panel (max-height 50vh)
- [ ] Accessible: `role="complementary"`, keyboard navigation, focus trap on overlay
- [ ] Works alongside RTCommentBubble (P2-002) — both read from same CommentStore
- [ ] Toggled by toolbar `commentSidebar` button (mapped in P1-012)

**Testing:** Write component tests in `tests/unit/components/RTCommentSidebar.test.ts` testing: comment list rendering, click-to-scroll interaction, filter/sort, responsive layout classes, keyboard navigation, open/close behavior.

---

### P2-021: Full-Screen / Distraction-Free Mode

**Dependencies:** P1-018, P1-012
**Priority:** P2

**Description:**
Implement a full-screen / distraction-free writing mode (see REQUIREMENTS.md Section 19.7). Toggled via toolbar button (`fullscreen`) or keyboard shortcut (F11 / Ctrl+Shift+F / Cmd+Shift+F). In full-screen mode, the editor fills the entire viewport with minimal chrome, providing an immersive writing experience. All editor state is preserved — toggling full-screen does not lose content or undo history.

**Files to Modify:**
- `src/components/RTEditor.vue` — Full-screen state already scaffolded in P1-018 update (`isFullscreen` ref, `.rte-editor--fullscreen` class, Escape/F11 key handlers). This task adds the polished implementation: smooth transitions, content centering, toolbar minimization, and `prefers-reduced-motion` support.
- `src/themes/default.css` — Add `.rte-editor--fullscreen` styles (already scaffolded in P1-010 update). This task adds the detailed styling: centered content width, background, transition animations, toolbar slim mode.
- `src/components/RTToolbar.vue` — Full-screen button already mapped in P1-012 update. This task adds the icon swap (expand ↔ compress) and `aria-pressed` state to reflect full-screen status.

**Technical Details:**

Full-screen mode CSS (`.rte-editor--fullscreen`):
```css
.rte-editor--fullscreen {
  position: fixed;
  inset: 0;
  z-index: var(--rte-fullscreen-z-index, 9999);
  background: var(--rte-fullscreen-bg, #ffffff);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.rte-editor--fullscreen .rte-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.rte-editor--fullscreen .rte-toolbar {
  /* Slim toolbar: reduced padding, slightly smaller buttons */
  padding: 4px 16px;
  border-bottom: 1px solid var(--rte-border-color, #e5e7eb);
  flex-shrink: 0;
}

.rte-editor--fullscreen .rte-sidebar {
  /* Sidebar hidden by default in full-screen (can be re-opened) */
  display: none;
}

.rte-editor--fullscreen .rte-sidebar.rte-sidebar--visible {
  /* When explicitly re-opened, show as overlay */
  display: block;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10000;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
}
```

Transition animation:
```css
.rte-editor {
  transition: all 0.2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .rte-editor {
    transition: none;
  }
}
```

Implementation in RTEditor.vue:
- `isFullscreen` ref (already in P1-018 scaffold)
- `toggleFullscreen()` method: toggles `isFullscreen`, calls `document.documentElement.requestFullscreen()` for true browser full-screen (with fallback to CSS-only full-screen if Fullscreen API not available or denied)
- `exitFullscreen()` method: sets `isFullscreen = false`, calls `document.exitFullscreen()` if in browser full-screen
- **Escape key** exits full-screen (already in P1-018 scaffold)
- **F11 key** toggles full-screen (prevent default browser behavior)
- **Ctrl+Shift+F / Cmd+Shift+F** toggles full-screen
- Sidebar visibility: entering full-screen auto-hides sidebar, but user can re-open it (shows as overlay)
- Body scroll lock: when full-screen, add `overflow: hidden` to `<body>` to prevent background scrolling. Remove on exit.
- Focus management: on entering full-screen, focus the editor content area

Toolbar button behavior:
- `fullscreen` toolbar button: icon changes from "expand" (⛶) to "compress" (⊡) when in full-screen mode
- `aria-pressed` reflects full-screen state
- `aria-label`: "Enter full-screen (F11)" / "Exit full-screen (Escape)"

**Acceptance Criteria:**
- [ ] Toolbar `fullscreen` button toggles full-screen mode
- [ ] Full-screen fills entire viewport (`position: fixed; inset: 0`)
- [ ] Content area centered at comfortable reading width (~720px max) with generous padding
- [ ] Toolbar remains visible in slim/minimal style
- [ ] Escape key exits full-screen
- [ ] F11 key toggles full-screen (default browser behavior prevented)
- [ ] Ctrl+Shift+F / Cmd+Shift+F toggles full-screen
- [ ] Sidebar auto-hides on entering full-screen, can be re-opened as overlay
- [ ] Editor state fully preserved (content, undo history, selection)
- [ ] Smooth transition animation (fade/scale) when entering/exiting
- [ ] `prefers-reduced-motion` respected — no animation if user prefers reduced motion
- [ ] Body scroll locked during full-screen
- [ ] Icon changes from expand to compress in full-screen
- [ ] `aria-pressed` on toolbar button reflects full-screen state
- [ ] Background color uses `var(--rte-fullscreen-bg, #ffffff)`

**Testing:** Write component tests in `tests/unit/components/RTEditor.test.ts` (extend existing) testing: full-screen toggle via button, toggle via keyboard shortcuts, Escape to exit, sidebar behavior in full-screen, body scroll lock, `prefers-reduced-motion` class behavior. Write integration test verifying editor state preserved across full-screen toggles.

---

### P2-022: Emoji Picker Extension

**Dependencies:** P1-018, P1-019
**Priority:** P1

**Description:**
Create an emoji picker component (`RTEmojiPicker`) that integrates into the toolbar and comment bubble. The picker provides categorized emoji browsing, search, and frequently-used emoji tracking. Clicking an emoji inserts it at the cursor position in the editor (or comment input when used inside RTCommentBubble).

**Files to Create:**
- `src/components/RTEmojiPicker.vue`
- `src/data/emoji.ts`

**Files to Modify:**
- `src/components/RTToolbar.vue` — Add emoji toolbar button that opens the picker
- `src/components/RTBubbleMenu.vue` — Optionally support emoji in bubble menu
- `src/types/editor.ts` — Add `'emoji'` to `ToolbarItem` type
- `src/themes/default.css` — Add emoji picker styles

**Technical Details:**

`src/data/emoji.ts`:
- Curated emoji dataset organized by category:
  ```typescript
  export interface EmojiCategory {
    name: string
    icon: string
    emojis: string[]
  }

  export const emojiCategories: EmojiCategory[] = [
    { name: 'Smileys', icon: '😀', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', ...] },
    { name: 'Gestures', icon: '👋', emojis: ['👍', '👎', '👋', '✋', '🤚', '🖐', ...] },
    { name: 'Hearts', icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', ...] },
    { name: 'Objects', icon: '📚', emojis: ['📚', '📖', '📝', '✏️', '📏', '📐', ...] },
    { name: 'Symbols', icon: '✅', emojis: ['✅', '❌', '⭐', '❗', '❓', '💯', ...] },
  ]
  ```
- Education-relevant emoji prioritized in the default set
- ~200-300 curated emoji (not the full Unicode set — keep bundle size small)

`src/components/RTEmojiPicker.vue`:
- Props: `onSelect: (emoji: string) => void`, `triggerRef?: HTMLElement` (for positioning)
- Floating panel (positioned below toolbar button or inline in comment bubble)
- Width: 320px, Height: 280px
- Layout:
  ```
  ┌──────────────────────────────────┐
  │ 🔍 Search emoji...               │
  ├──────────────────────────────────┤
  │ 😀 👋 ❤️ 📚 ✅   (category tabs) │
  ├──────────────────────────────────┤
  │ 😀 😃 😄 😁 😆 😅 😂 🤣        │
  │ 😊 😇 🙂 🙃 😉 😌 😍 🥰        │
  │ ...                              │
  └──────────────────────────────────┘
  ```
- Category tabs at top (icon-only, with tooltip showing category name)
- Search field filters emoji by name/keyword
- Grid layout: 8 columns of emoji buttons
- Each emoji button: 36px × 36px, hover shows slightly enlarged emoji
- Click inserts emoji and optionally closes picker
- Frequently used section (stored in localStorage, top 16 recent emoji)
- Keyboard navigation: arrow keys move between emoji, Enter selects, Escape closes
- `role="dialog"`, `aria-label="Emoji picker"`
- Close on click outside or Escape

Toolbar integration:
- Emoji button (😀 icon) in toolbar opens/closes the picker dropdown
- When emoji selected, inserts as plain text at cursor position via `editor.chain().focus().insertContent(emoji).run()`
- No TipTap extension needed — emoji are just Unicode text characters

**Acceptance Criteria:**
- [ ] Emoji picker opens from toolbar button
- [ ] Categories display correct emoji groups
- [ ] Search filters emoji by keyword
- [ ] Clicking emoji inserts it at editor cursor position
- [ ] Frequently used section tracks recent emoji (localStorage)
- [ ] Keyboard navigation works (arrows, Enter, Escape)
- [ ] Picker closes on selection, Escape, or click outside
- [ ] Accessible: `role="dialog"`, `aria-label`, emoji buttons have `aria-label`
- [ ] Picker reusable in comment bubble (P2-002) via props
- [ ] Bundle size impact minimal (~5-10KB for curated emoji data)

**Testing:** Write component tests in `tests/unit/components/RTEmojiPicker.test.ts`.

---

### P2-023: Toolbar Button Tooltips

**Dependencies:** P1-012, P1-019
**Priority:** P1

**Description:**
Add descriptive tooltips to every toolbar button. When hovering over a button, a small tooltip appears showing the button's name and keyboard shortcut (if applicable). Uses native CSS tooltips (no external library) for zero bundle size impact.

**Files to Modify:**
- `src/components/RTToolbar.vue` — Add `data-tooltip` attributes and tooltip CSS
- `src/components/RTBubbleMenu.vue` — Add tooltips to bubble menu buttons
- `src/themes/default.css` — Add tooltip styles

**Technical Details:**

Tooltip implementation via CSS `::after` pseudo-element with `data-tooltip` attribute:

```css
[data-tooltip] {
  position: relative;
}
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: var(--rte-tooltip-bg, #1f2937);
  color: var(--rte-tooltip-text, #ffffff);
  font-size: var(--rte-font-size-xs, 12px);
  border-radius: var(--rte-radius-sm, 4px);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 150ms ease;
  z-index: 1000;
}
[data-tooltip]:hover::after {
  opacity: 1;
}
```

Tooltip text for each toolbar button:
| Button | Tooltip |
|--------|---------|
| Bold | `Bold (Ctrl+B)` |
| Italic | `Italic (Ctrl+I)` |
| Underline | `Underline (Ctrl+U)` |
| Strikethrough | `Strikethrough (Ctrl+Shift+S)` |
| Heading 1 | `Heading 1` |
| Heading 2 | `Heading 2` |
| Heading 3 | `Heading 3` |
| Paragraph | `Paragraph` |
| Bullet List | `Bullet List` |
| Ordered List | `Ordered List` |
| Link | `Insert Link (Ctrl+K)` |
| Image | `Insert Image` |
| Align Left | `Align Left` |
| Align Center | `Align Center` |
| Align Right | `Align Right` |
| Horizontal Rule | `Horizontal Rule` |
| Subscript | `Subscript` |
| Superscript | `Superscript` |
| Undo | `Undo (Ctrl+Z)` |
| Redo | `Redo (Ctrl+Shift+Z)` |
| Math | `Insert Math Equation` |
| Emoji | `Insert Emoji` |
| Fullscreen | `Fullscreen (F11)` |

- On macOS, show `⌘` instead of `Ctrl` (detect via `navigator.platform` or `navigator.userAgent`)
- CSS custom properties: `--rte-tooltip-bg`, `--rte-tooltip-text`, `--rte-tooltip-radius`
- Delay: 300ms hover delay before showing (via `transition-delay`)
- Tooltip hidden when button is disabled
- `aria-describedby` not needed — the `aria-label` already provides accessible name

**Acceptance Criteria:**
- [ ] Every toolbar button shows tooltip on hover
- [ ] Tooltips show button name and keyboard shortcut where applicable
- [ ] macOS shows ⌘ instead of Ctrl
- [ ] Tooltip appears above the button (or below if near top edge)
- [ ] Tooltip has 300ms delay before showing
- [ ] Tooltip disappears immediately on mouse leave
- [ ] Pure CSS implementation (no JS tooltip library)
- [ ] Tooltips themed via CSS custom properties
- [ ] Bubble menu buttons also have tooltips
- [ ] Tooltips do not appear on touch devices (use `@media (hover: hover)`)

**Testing:** Write tests in `tests/unit/components/RTToolbar.test.ts` (extend existing) verifying `data-tooltip` attributes are present on all buttons.

---

### P2-024: Bubble Menu Text Size (Paragraph & Heading)

**Dependencies:** P1-013, P1-019
**Priority:** P1

**Description:**
Enhance the bubble menu (hover toolbar on text selection) to include a text size dropdown for switching between paragraph and heading levels (Paragraph, H1, H2, H3, H4, H5, H6). This gives users quick access to text size changes without reaching for the main toolbar.

**Files to Modify:**
- `src/components/RTBubbleMenu.vue` — Add heading/paragraph dropdown to bubble menu items
- `src/types/editor.ts` — Add `'textSize'` to `ToolbarItem` type for bubble menu support
- `src/themes/default.css` — Add bubble menu dropdown styles

**Technical Details:**

Update `RTBubbleMenu.vue` to support a new `textSize` item type in its `items` array:

Default bubble menu items change from:
```typescript
items: () => ['bold', 'italic', 'underline', 'link'] as ToolbarItem[]
```
to:
```typescript
items: () => ['textSize', 'bold', 'italic', 'underline', 'link'] as ToolbarItem[]
```

The `textSize` item renders as a compact dropdown button in the bubble menu:
```
┌──────────────────────────────────────────────────┐
│ [Paragraph ▾] │ B │ I │ U │ 🔗 │               │
└──────────────────────────────────────────────────┘
         │
         ▼ (dropdown when clicked)
┌────────────────┐
│  Paragraph     │
│  Heading 1     │
│  Heading 2     │
│  Heading 3     │
│  Heading 4     │
│  Heading 5     │
│  Heading 6     │
└────────────────┘
```

- Dropdown button shows current text level (e.g., "Paragraph", "H1", "H2")
- Compact display: shows abbreviated label in bubble menu button (e.g., "¶", "H1", "H2")
- Dropdown items styled with visual size preview (larger font for H1, smaller for H6)
- Clicking an option applies the heading level or resets to paragraph
- Uses existing editor commands: `editor.chain().focus().toggleHeading({ level }).run()` or `editor.chain().focus().setParagraph().run()`
- Current active level highlighted in dropdown
- Dropdown closes after selection
- Keyboard: Enter/Space opens dropdown, Arrow keys navigate, Enter selects, Escape closes
- Dropdown positioned below the bubble menu item (with viewport boundary detection)

**Acceptance Criteria:**
- [ ] Bubble menu shows text size dropdown as first item
- [ ] Dropdown displays Paragraph + Heading 1-6 options
- [ ] Current text level is highlighted/indicated
- [ ] Clicking an option applies the heading level
- [ ] Switching to "Paragraph" resets heading to normal text
- [ ] Dropdown closes after selection
- [ ] Keyboard navigation works (arrows, Enter, Escape)
- [ ] Compact display fits within bubble menu width
- [ ] Accessible: `role="listbox"`, `aria-label="Text size"`
- [ ] Works alongside existing bubble menu items (bold, italic, etc.)

**Testing:** Write tests in `tests/unit/components/RTBubbleMenu.test.ts` (extend existing) verifying text size dropdown renders, options apply heading levels, and keyboard navigation works.

---

### P2-025: Scientific Formula Extension

**Dependencies:** P1-019, existing MathExtension (P1-016)
**Priority:** P1

**Description:**
Enhance the existing MathExtension to support full scientific formula insertion with a visual formula editor UI. While Phase 1's MathExtension supports raw LaTeX input, this task adds a user-friendly formula toolbar/panel with common scientific symbols, operators, Greek letters, and formula templates that users can click to build equations without memorizing LaTeX syntax. The rendered output still uses KaTeX.

**Files to Create:**
- `src/components/RTFormulaEditor.vue`
- `src/data/formulaSymbols.ts`

**Files to Modify:**
- `src/components/RTToolbar.vue` — Add formula button (or enhance existing math button)
- `src/extensions/MathExtension.ts` — Add `editMath` command for editing existing math nodes
- `src/types/editor.ts` — Add `'formula'` to `ToolbarItem` type
- `src/themes/default.css` — Add formula editor panel styles

**Technical Details:**

`src/data/formulaSymbols.ts`:
```typescript
export interface FormulaSymbol {
  label: string
  latex: string
  category: string
  preview?: string // Optional pre-rendered preview
}

export interface FormulaTemplate {
  label: string
  latex: string
  description: string
  placeholders?: string[] // e.g., ['numerator', 'denominator']
}

export const formulaCategories = [
  {
    name: 'Common',
    icon: '∑',
    symbols: [
      { label: 'Fraction', latex: '\\frac{□}{□}', category: 'common' },
      { label: 'Square root', latex: '\\sqrt{□}', category: 'common' },
      { label: 'Nth root', latex: '\\sqrt[□]{□}', category: 'common' },
      { label: 'Exponent', latex: '{□}^{□}', category: 'common' },
      { label: 'Subscript', latex: '{□}_{□}', category: 'common' },
      { label: 'Summation', latex: '\\sum_{□}^{□}', category: 'common' },
      { label: 'Product', latex: '\\prod_{□}^{□}', category: 'common' },
      { label: 'Integral', latex: '\\int_{□}^{□}', category: 'common' },
    ],
  },
  {
    name: 'Greek Letters',
    icon: 'α',
    symbols: [
      { label: 'alpha', latex: '\\alpha', category: 'greek' },
      { label: 'beta', latex: '\\beta', category: 'greek' },
      { label: 'gamma', latex: '\\gamma', category: 'greek' },
      { label: 'delta', latex: '\\delta', category: 'greek' },
      { label: 'theta', latex: '\\theta', category: 'greek' },
      { label: 'lambda', latex: '\\lambda', category: 'greek' },
      { label: 'pi', latex: '\\pi', category: 'greek' },
      { label: 'sigma', latex: '\\sigma', category: 'greek' },
      { label: 'omega', latex: '\\omega', category: 'greek' },
      // ... more
    ],
  },
  {
    name: 'Operators',
    icon: '±',
    symbols: [
      { label: 'Plus-minus', latex: '\\pm', category: 'operators' },
      { label: 'Times', latex: '\\times', category: 'operators' },
      { label: 'Divide', latex: '\\div', category: 'operators' },
      { label: 'Not equal', latex: '\\neq', category: 'operators' },
      { label: 'Less than or equal', latex: '\\leq', category: 'operators' },
      { label: 'Greater than or equal', latex: '\\geq', category: 'operators' },
      { label: 'Approximately', latex: '\\approx', category: 'operators' },
      { label: 'Infinity', latex: '\\infty', category: 'operators' },
    ],
  },
  {
    name: 'Chemistry',
    icon: '⚗',
    symbols: [
      { label: 'Right arrow', latex: '\\rightarrow', category: 'chemistry' },
      { label: 'Equilibrium', latex: '\\rightleftharpoons', category: 'chemistry' },
      { label: 'Degree', latex: '^{\\circ}', category: 'chemistry' },
    ],
  },
]

export const formulaTemplates: FormulaTemplate[] = [
  { label: 'Quadratic formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Quadratic equation solution' },
  { label: "Einstein's equation", latex: 'E = mc^2', description: 'Mass-energy equivalence' },
  { label: "Pythagorean theorem", latex: 'a^2 + b^2 = c^2', description: 'Right triangle relationship' },
  { label: 'Chemical equation', latex: '2H_2 + O_2 \\rightarrow 2H_2O', description: 'Water formation' },
]
```

`src/components/RTFormulaEditor.vue`:
- Opens as a dialog/panel when the formula toolbar button is clicked
- Layout:
  ```
  ┌─────────────────────────────────────────────────┐
  │ Scientific Formula Editor                    ✕  │
  ├─────────────────────────────────────────────────┤
  │ ∑ Common │ α Greek │ ± Operators │ ⚗ Chemistry │
  ├─────────────────────────────────────────────────┤
  │ [½] [√] [ⁿ√] [x²] [x₁] [∑] [∏] [∫]          │
  │                                                 │
  ├─────────────────────────────────────────────────┤
  │ Templates:                                      │
  │ [Quadratic] [Einstein] [Pythagorean] [Chemical] │
  ├─────────────────────────────────────────────────┤
  │ LaTeX: \frac{-b \pm \sqrt{b^2-4ac}}{2a}       │
  ├─────────────────────────────────────────────────┤
  │ Preview:  (KaTeX rendered preview)              │
  │           x = (-b ± √(b²-4ac)) / 2a            │
  ├─────────────────────────────────────────────────┤
  │                        [Cancel]  [Insert]       │
  └─────────────────────────────────────────────────┘
  ```
- LaTeX input textarea where users can type/edit LaTeX directly
- Live KaTeX preview below the input (re-renders on every keystroke, debounced 200ms)
- Symbol buttons insert LaTeX snippets at cursor position in the textarea
- Template buttons replace the entire LaTeX input with the template
- Error handling: if LaTeX is invalid, show error message below preview
- Edit mode: when clicking an existing math node, opens the editor pre-populated with that node's LaTeX
- Insert button calls `editor.chain().focus().insertMath({ latex, display }).run()`
- Toggle: inline math vs. block (display) math
- Width: 500px, responsive to smaller screens
- Focus trap, Escape to close
- `role="dialog"`, `aria-label="Formula editor"`

**Acceptance Criteria:**
- [ ] Formula editor opens from toolbar button
- [ ] Symbol buttons insert LaTeX snippets into the input
- [ ] Category tabs switch between symbol groups
- [ ] Template buttons load pre-built formulas
- [ ] Live KaTeX preview renders as user types
- [ ] Invalid LaTeX shows error message
- [ ] Insert button adds math node to editor
- [ ] Edit mode: clicking existing math node opens editor with pre-populated LaTeX
- [ ] Inline vs. block math toggle
- [ ] Focus trap and Escape to close
- [ ] Accessible: `role="dialog"`, `aria-label`, labeled buttons
- [ ] Greek letters, operators, chemistry symbols all available

**Testing:** Write tests in `tests/unit/components/RTFormulaEditor.test.ts`.

---

### P2-026: Code Snippet Extension

**Dependencies:** P1-001, P1-019
**Priority:** P1

**Description:**
Create a code snippet extension that allows users to insert syntax-highlighted code blocks with language selection. Uses TipTap's CodeBlock extension with a custom Vue NodeView that provides a language selector dropdown and optional line numbers. Syntax highlighting is done via CSS classes (no heavy library like Prism/Highlight.js in the bundle — classes are added, consumers can load their preferred highlighting CSS).

**Files to Create:**
- `src/extensions/CodeSnippetExtension.ts`
- `src/components/RTCodeBlock.vue`
- `src/themes/code.css`

**Files to Modify:**
- `src/extensions/index.ts` — Export CodeSnippetExtension
- `src/components/RTToolbar.vue` — Add code block toolbar button
- `src/types/editor.ts` — Add `'codeBlock'` to `ToolbarItem` type
- `src/themes/default.css` — Import code.css styles
- `src/index.ts` — Export `CodeSnippetExtension` and related types

**Technical Details:**

`src/extensions/CodeSnippetExtension.ts`:
```typescript
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
// OR custom CodeBlock with language attribute

export interface CodeSnippetOptions {
  languages: string[]
  defaultLanguage: string
  showLineNumbers: boolean
}

// Extension based on TipTap CodeBlock with:
// - `language` attribute (stored in node attrs)
// - Custom NodeView rendering RTCodeBlock.vue
// - Commands: insertCodeBlock({ language })
```

Install TipTap code block:
```
npm install @tiptap/extension-code-block
```

`src/components/RTCodeBlock.vue`:
- Vue NodeView rendered inside the editor
- Layout:
  ```
  ┌─────────────────────────────────────────────┐
  │ [JavaScript ▾]              [Copy] [Delete] │
  ├─────────────────────────────────────────────┤
  │  1 │ function hello() {                     │
  │  2 │   console.log('Hello World')           │
  │  3 │ }                                      │
  └─────────────────────────────────────────────┘
  ```
- Language selector dropdown with common languages:
  ```typescript
  const languages = [
    'plaintext', 'javascript', 'typescript', 'python', 'java',
    'c', 'cpp', 'csharp', 'html', 'css', 'json', 'xml',
    'sql', 'bash', 'php', 'ruby', 'go', 'rust', 'swift',
    'kotlin', 'matlab', 'r', 'latex',
  ]
  ```
- Changing language updates the node's `language` attribute
- Optional line numbers (toggle via button or extension option)
- Copy button: copies code content to clipboard (with toast "Copied!")
- Delete button: removes the code block node
- Code area uses `<pre><code>` with monospace font
- Tab key inserts 2 spaces (instead of moving focus)
- Enter key creates new line within code block
- Shift+Enter or clicking outside exits the code block
- CSS class: `rte-code-block`, `rte-code-block__header`, `rte-code-block__content`
- Language stored in HTML as: `<pre data-language="javascript"><code>...</code></pre>`

`src/themes/code.css`:
- Default code block styling (dark background, monospace font)
- CSS custom properties:
  ```css
  --rte-code-bg: #1e1e1e;
  --rte-code-text: #d4d4d4;
  --rte-code-font: 'Fira Code', 'Consolas', 'Monaco', monospace;
  --rte-code-font-size: 14px;
  --rte-code-line-height: 1.5;
  --rte-code-padding: 16px;
  --rte-code-header-bg: #2d2d2d;
  --rte-code-border: #3e3e3e;
  --rte-code-line-number-color: #858585;
  ```
- Line number styling (gutter)
- Responsive: horizontal scroll for long lines

Toolbar integration:
- Code block button (`</>` icon) in toolbar
- Click inserts an empty code block with default language
- If text is selected, wraps selection in code block

**Acceptance Criteria:**
- [ ] Code block inserts from toolbar button
- [ ] Language selector dropdown with 20+ languages
- [ ] Changing language updates the node attribute
- [ ] Line numbers display correctly (optional toggle)
- [ ] Copy button copies code to clipboard
- [ ] Tab inserts spaces within code block
- [ ] Monospace font renders correctly
- [ ] Code block preserved in HTML export (`<pre data-language="..."><code>`)
- [ ] CSS custom properties for full theming
- [ ] Delete button removes code block
- [ ] Keyboard: Shift+Enter or arrow-down-at-end exits code block
- [ ] Accessible: `aria-label="Code block"`, language selector labeled

**Testing:** Write tests in `tests/unit/extensions/CodeSnippetExtension.test.ts` and `tests/unit/components/RTCodeBlock.test.ts`.

---

## PHASE 3 — Advanced Features (Target: v0.5.0+)

### P3-001: Real-Time Collaboration (Yjs + WebSocket)

**Dependencies:** P1-019, P2-001
**Priority:** P3

**Description:**
Add real-time collaborative editing using Yjs (CRDT library) with `y-prosemirror` for TipTap integration. Provider-agnostic architecture — consumers supply their own WebSocket URL or Yjs provider. Includes cursor presence indicators (colored cursors with user names), awareness protocol for user status, and CRDT-based conflict resolution. Yjs, y-prosemirror, and y-websocket are optional peer dependencies — not included in core bundle.

**Files to Create:**
- `src/extensions/CollaborationExtension.ts`
- `src/extensions/CollaborationCursorExtension.ts`
- `src/composables/useCollaboration.ts`
- `src/types/collaboration.ts`

**Files to Modify:**
- `src/extensions/index.ts` — Add collaboration extension exports
- `src/index.ts` — Add collaboration exports to package
- `package.json` — Add `yjs`, `y-prosemirror`, `y-websocket` as optional peer dependencies

**Technical Details:**

`src/types/collaboration.ts`:
```typescript
export interface CollaborationUser {
  name: string
  color: string
  avatar?: string
}

export interface CollaborationOptions {
  /** Yjs document — consumer provides this */
  document: any  // Y.Doc (typed as any to avoid hard dep)
  /** Field name in Y.Doc for editor content */
  field?: string  // default: 'default'
  /** Current user info for cursor presence */
  user: CollaborationUser
  /** Awareness protocol instance (optional — auto-created if not provided) */
  awareness?: any
}

export interface CollaborationCursorOptions {
  user: CollaborationUser
  /** Render function for cursor label */
  render?: (user: CollaborationUser) => HTMLElement
}
```

`src/extensions/CollaborationExtension.ts`:
```typescript
import { Extension } from '@tiptap/core'
import type { CollaborationOptions } from '../types/collaboration'

/**
 * Real-time collaboration extension using Yjs CRDT.
 * Requires yjs and y-prosemirror as peer dependencies.
 *
 * Usage:
 * ```typescript
 * import * as Y from 'yjs'
 * import { WebsocketProvider } from 'y-websocket'
 *
 * const ydoc = new Y.Doc()
 * const provider = new WebsocketProvider('wss://your-server.com', 'room-id', ydoc)
 *
 * const editor = useEditor({
 *   extensions: [
 *     CollaborationExtension.configure({
 *       document: ydoc,
 *       field: 'content',
 *       user: { name: 'Alice', color: '#f783ac' },
 *     }),
 *   ],
 * })
 * ```
 */
export const CollaborationExtension = Extension.create<CollaborationOptions>({
  name: 'collaboration',

  addOptions() {
    return {
      document: null,
      field: 'default',
      user: { name: 'Anonymous', color: '#6b7280' },
    }
  },

  async addProseMirrorPlugins() {
    const { ySyncPlugin, yUndoPlugin } = await import('y-prosemirror').catch(() => {
      throw new Error(
        'y-prosemirror is required for collaboration. Install: npm install yjs y-prosemirror'
      )
    })

    const yXmlFragment = this.options.document.getXmlFragment(this.options.field ?? 'default')

    return [
      ySyncPlugin(yXmlFragment),
      yUndoPlugin(),
    ]
  },
})
```

`src/extensions/CollaborationCursorExtension.ts`:
```typescript
import { Extension } from '@tiptap/core'
import type { CollaborationCursorOptions, CollaborationUser } from '../types/collaboration'

export const CollaborationCursorExtension = Extension.create<CollaborationCursorOptions>({
  name: 'collaborationCursor',

  addOptions() {
    return {
      user: { name: 'Anonymous', color: '#6b7280' },
      render: undefined,
    }
  },

  async addProseMirrorPlugins() {
    const { yCursorPlugin } = await import('y-prosemirror').catch(() => {
      throw new Error(
        'y-prosemirror is required for collaboration cursors. Install: npm install yjs y-prosemirror'
      )
    })

    const defaultRender = (user: CollaborationUser): HTMLElement => {
      const cursor = document.createElement('span')
      cursor.className = 'rte-collaboration-cursor'
      cursor.style.borderColor = user.color

      const label = document.createElement('span')
      label.className = 'rte-collaboration-cursor__label'
      label.style.backgroundColor = user.color
      label.textContent = user.name
      cursor.appendChild(label)

      return cursor
    }

    return [
      yCursorPlugin(
        this.options.user,
        this.options.render ?? defaultRender
      ),
    ]
  },
})
```

`src/composables/useCollaboration.ts`:
```typescript
import { ref, onBeforeUnmount } from 'vue'
import type { CollaborationUser } from '../types/collaboration'

export interface UseCollaborationOptions {
  /** WebSocket server URL */
  serverUrl: string
  /** Room identifier */
  roomId: string
  /** Current user */
  user: CollaborationUser
}

export function useCollaboration(options: UseCollaborationOptions) {
  const connected = ref(false)
  const users = ref<CollaborationUser[]>([])
  let provider: any = null
  let ydoc: any = null

  async function connect() {
    const Y = await import('yjs').catch(() => {
      throw new Error('yjs is required for collaboration. Install: npm install yjs')
    })
    const { WebsocketProvider } = await import('y-websocket').catch(() => {
      throw new Error('y-websocket is required. Install: npm install y-websocket')
    })

    ydoc = new Y.Doc()
    provider = new WebsocketProvider(options.serverUrl, options.roomId, ydoc)

    provider.on('status', (event: { status: string }) => {
      connected.value = event.status === 'connected'
    })

    provider.awareness.setLocalStateField('user', options.user)
    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().values())
      users.value = states
        .map((state: any) => state.user)
        .filter(Boolean) as CollaborationUser[]
    })
  }

  function disconnect() {
    provider?.destroy()
    ydoc?.destroy()
    connected.value = false
    users.value = []
  }

  onBeforeUnmount(() => disconnect())

  return { ydoc, provider, connected, users, connect, disconnect }
}
```

**Acceptance Criteria:**
- [ ] `CollaborationExtension` integrates Yjs with TipTap via `y-prosemirror`
- [ ] Consumer provides their own `Y.Doc` and WebSocket provider (provider-agnostic)
- [ ] Multiple users can edit simultaneously with CRDT conflict resolution
- [ ] Cursor presence shows colored cursors with user names
- [ ] User awareness updates when users join/leave
- [ ] `yjs`, `y-prosemirror`, `y-websocket` are optional peer deps (not in core bundle)
- [ ] Clear error message if peer dependencies are not installed
- [ ] `useCollaboration()` composable manages connection lifecycle
- [ ] Undo/redo works correctly in collaborative mode (per-user undo)
- [ ] No data loss on concurrent edits (CRDT guarantees convergence)
- [ ] Collaboration cursor styles use CSS custom properties for theming
- [ ] Graceful degradation when WebSocket disconnects (offline editing, reconnect sync)

**Testing:** Write unit tests in `tests/unit/extensions/CollaborationExtension.test.ts` (mock yjs/y-prosemirror). Write tests in `tests/unit/composables/useCollaboration.test.ts` testing: connect/disconnect, user awareness, connection status.

---

### P3-002: Drag & Drop Block Reordering

**Dependencies:** P1-019
**Priority:** P3

**Description:**
Add drag handles to block-level nodes (paragraphs, headings, lists, blockquotes, tables, images, code blocks) allowing users to reorder content by dragging. Display a visual drop indicator showing where the block will be placed. Provide a keyboard alternative using Ctrl+Shift+Up/Down to move blocks. Integrate with TipTap's built-in node view drag handling. Smooth animations for the reordering transition.

**Files to Create:**
- `src/extensions/DragHandleExtension.ts`
- `src/components/RTDragHandle.vue`
- `src/styles/drag-handle.css`

**Files to Modify:**
- `src/extensions/index.ts` — Add `DragHandleExtension` export
- `src/index.ts` — Add `DragHandleExtension` to package exports
- `src/styles/editor.css` — Import `drag-handle.css`

**Technical Details:**

`src/extensions/DragHandleExtension.ts`:
```typescript
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface DragHandleOptions {
  enabled?: boolean           // default: true
  dragHandleWidth?: number    // default: 24 (px)
  showOnHover?: boolean       // default: true
}

export const dragHandlePluginKey = new PluginKey('dragHandle')

export const DragHandleExtension = Extension.create<DragHandleOptions>({
  name: 'dragHandle',

  addOptions() {
    return {
      enabled: true,
      dragHandleWidth: 24,
      showOnHover: true,
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-ArrowUp': () => {
        return this.editor.commands.moveNodeUp()
      },
      'Mod-Shift-ArrowDown': () => {
        return this.editor.commands.moveNodeDown()
      },
    }
  },

  addCommands() {
    return {
      moveNodeUp: () => ({ state, dispatch }) => {
        const { $from } = state.selection
        const blockStart = $from.start($from.depth)
        if (blockStart <= 1) return false // Already at top

        const blockBefore = state.doc.resolve(blockStart - 1)
        const beforeStart = blockBefore.start(blockBefore.depth)

        if (dispatch) {
          const node = state.doc.nodeAt(blockStart - 1)
          // Swap current block with previous block using transaction
          const tr = state.tr
          // Implementation: cut current block, insert before previous
          dispatch(tr)
        }
        return true
      },
      moveNodeDown: () => ({ state, dispatch }) => {
        const { $from } = state.selection
        const blockEnd = $from.end($from.depth)
        if (blockEnd >= state.doc.content.size - 1) return false // Already at bottom

        if (dispatch) {
          const tr = state.tr
          dispatch(tr)
        }
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    const options = this.options
    return [
      new Plugin({
        key: dragHandlePluginKey,
        props: {
          handleDOMEvents: {
            mouseover(view, event) {
              if (!options.enabled || !options.showOnHover) return false
              const target = event.target as HTMLElement
              const pos = view.posAtDOM(target, 0)
              if (pos == null) return false
              // Show drag handle near the hovered block
              return false
            },
          },
          decorations(state) {
            if (!options.enabled) return DecorationSet.empty
            // Add drag handle widgets to each top-level block node
            const decorations: Decoration[] = []
            state.doc.forEach((node, offset) => {
              decorations.push(
                Decoration.widget(offset, () => {
                  const handle = document.createElement('div')
                  handle.className = 'rte-drag-handle'
                  handle.setAttribute('draggable', 'true')
                  handle.setAttribute('aria-label', 'Drag to reorder')
                  handle.setAttribute('role', 'button')
                  handle.innerHTML = '⠿' // Drag handle icon (grip dots)
                  return handle
                }, { side: -1 })
              )
            })
            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})
```

`src/styles/drag-handle.css`:
```css
.rte-drag-handle {
  position: absolute;
  left: -28px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  border-radius: 4px;
  color: var(--rte-color-text-muted, #9ca3af);
  opacity: 0;
  transition: opacity 0.15s ease;
  user-select: none;
}

.rte-drag-handle:hover {
  background: var(--rte-color-bg-hover, #f3f4f6);
  color: var(--rte-color-text, #1f2937);
  opacity: 1;
}

.rte-drag-handle:active {
  cursor: grabbing;
}

/* Show handle on block hover */
.ProseMirror > *:hover > .rte-drag-handle,
.ProseMirror > *:focus-within > .rte-drag-handle {
  opacity: 0.5;
}

/* Drop indicator */
.rte-drop-indicator {
  height: 2px;
  background: var(--rte-color-primary, #3b82f6);
  border-radius: 1px;
  margin: -1px 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .rte-drag-handle {
    transition: none;
  }
}
```

**Acceptance Criteria:**
- [ ] Drag handle appears on hover for all block-level nodes
- [ ] Blocks can be dragged and dropped to reorder
- [ ] Visual drop indicator shows insertion point during drag
- [ ] Ctrl+Shift+Up moves current block up (keyboard alternative)
- [ ] Ctrl+Shift+Down moves current block down (keyboard alternative)
- [ ] Undo/redo works after block reordering
- [ ] Drag handle has `role="button"` and `aria-label` for accessibility
- [ ] Smooth animation during reorder (respects `prefers-reduced-motion`)
- [ ] Drag handle uses CSS custom properties for theming
- [ ] Works with all block types: paragraph, heading, list, blockquote, table, image, code block
- [ ] Drag handle hidden in read-only mode

**Testing:** Write unit tests in `tests/unit/extensions/DragHandleExtension.test.ts` testing: keyboard shortcuts (moveNodeUp, moveNodeDown), extension registration, and options. E2E drag-and-drop tests added to Playwright suite (P2-016).

---

### P3-003: Voice-to-Text

**Dependencies:** P1-019, P2-015
**Priority:** P3

**Description:**
Add voice dictation using the Web Speech API (`SpeechRecognition`). Provides a dictation mode toggle in the toolbar. Supports language selection tied to the i18n locale. Graceful degradation in browsers that don't support the Speech Recognition API (button hidden, no errors). Privacy notice displayed before first microphone access. Continuous recognition mode inserts text at the cursor position.

**Files to Create:**
- `src/extensions/VoiceToTextExtension.ts`
- `src/composables/useVoiceToText.ts`
- `src/components/RTVoiceButton.vue`

**Files to Modify:**
- `src/extensions/index.ts` — Add `VoiceToTextExtension` export
- `src/types/editor.ts` — Add `'voiceToText'` to `ToolbarItem` type
- `src/index.ts` — Add `VoiceToTextExtension`, `useVoiceToText` to package exports

**Technical Details:**

`src/composables/useVoiceToText.ts`:
```typescript
import { ref, computed, onBeforeUnmount } from 'vue'

export interface UseVoiceToTextOptions {
  language?: string           // BCP 47 language tag (default: 'en-US')
  continuous?: boolean        // Keep listening (default: true)
  interimResults?: boolean    // Show partial results (default: true)
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export function useVoiceToText(options: UseVoiceToTextOptions = {}) {
  const isListening = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  let recognition: any = null

  // Check browser support
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null
  isSupported.value = !!SpeechRecognition

  function start() {
    if (!SpeechRecognition) return

    recognition = new SpeechRecognition()
    recognition.lang = options.language ?? 'en-US'
    recognition.continuous = options.continuous ?? true
    recognition.interimResults = options.interimResults ?? true

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      transcript.value = finalTranscript || interimTranscript
      options.onResult?.(transcript.value, !!finalTranscript)
    }

    recognition.onerror = (event: any) => {
      options.onError?.(event.error)
      if (event.error !== 'no-speech') {
        isListening.value = false
      }
    }

    recognition.onend = () => {
      // Restart if continuous mode and still supposed to be listening
      if (isListening.value && options.continuous !== false) {
        recognition.start()
      } else {
        isListening.value = false
      }
    }

    recognition.start()
    isListening.value = true
  }

  function stop() {
    recognition?.stop()
    isListening.value = false
  }

  function toggle() {
    if (isListening.value) {
      stop()
    } else {
      start()
    }
  }

  onBeforeUnmount(() => stop())

  return { isListening, isSupported, transcript, start, stop, toggle }
}
```

`src/extensions/VoiceToTextExtension.ts`:
```typescript
import { Extension } from '@tiptap/core'

export interface VoiceToTextOptions {
  language?: string
  continuous?: boolean
}

export const VoiceToTextExtension = Extension.create<VoiceToTextOptions>({
  name: 'voiceToText',

  addOptions() {
    return {
      language: 'en-US',
      continuous: true,
    }
  },

  addCommands() {
    return {
      insertDictatedText: (text: string) => ({ editor, chain }) => {
        return chain().focus().insertContent(text).run()
      },
    }
  },
})
```

**Acceptance Criteria:**
- [ ] Voice dictation button appears in toolbar (when browser supports Speech API)
- [ ] Button hidden in unsupported browsers (no errors)
- [ ] Clicking button starts dictation mode (microphone icon changes to indicate active)
- [ ] Dictated text is inserted at current cursor position
- [ ] Language selection respects i18n locale (en-US, zh-TW, etc.)
- [ ] Continuous mode keeps listening until user stops
- [ ] Interim (partial) results shown as user speaks
- [ ] Privacy notice displayed before first microphone access
- [ ] Dictation can be stopped by clicking button again or pressing Escape
- [ ] Error states handled gracefully (microphone denied, no speech detected)
- [ ] `useVoiceToText()` composable available for custom integration
- [ ] `'voiceToText'` added to `ToolbarItem` type union

**Testing:** Write unit tests in `tests/unit/composables/useVoiceToText.test.ts` (mock SpeechRecognition API) testing: start/stop, browser support detection, transcript updates, error handling. Write unit tests in `tests/unit/extensions/VoiceToTextExtension.test.ts` testing: extension registration, insertDictatedText command.

---

### P3-004: Quick Stamps / Reactions

**Dependencies:** P1-019, P2-001
**Priority:** P3

**Description:**
Add a stamp/reaction system for teacher feedback. Pre-defined stamps include "Great!", "Excellent!", "Needs Work", "Good Effort", custom emoji stamps. Stamps appear as inline decorations attached to selected text or as block-level decorations. Consumers can define custom stamps via configuration. Stamps are stored in the document JSON and exported in HTML. Stamps can be removed by clicking.

**Files to Create:**
- `src/extensions/StampExtension.ts`
- `src/components/RTStampPicker.vue`
- `src/styles/stamps.css`

**Files to Modify:**
- `src/extensions/index.ts` — Add `StampExtension` export
- `src/types/editor.ts` — Add `'stamp'` to `ToolbarItem` type
- `src/index.ts` — Add `StampExtension` to package exports

**Technical Details:**

`src/extensions/StampExtension.ts`:
```typescript
import { Mark } from '@tiptap/core'

export interface StampDefinition {
  id: string
  label: string
  emoji: string
  color: string
  category?: 'praise' | 'encouragement' | 'correction' | 'custom'
}

export interface StampOptions {
  stamps?: StampDefinition[]
  allowCustom?: boolean     // default: true
}

export const DEFAULT_STAMPS: StampDefinition[] = [
  { id: 'great', label: 'Great!', emoji: '⭐', color: '#f59e0b', category: 'praise' },
  { id: 'excellent', label: 'Excellent!', emoji: '🌟', color: '#eab308', category: 'praise' },
  { id: 'good-effort', label: 'Good Effort', emoji: '💪', color: '#3b82f6', category: 'encouragement' },
  { id: 'keep-going', label: 'Keep Going!', emoji: '🚀', color: '#8b5cf6', category: 'encouragement' },
  { id: 'needs-work', label: 'Needs Work', emoji: '📝', color: '#ef4444', category: 'correction' },
  { id: 'check-again', label: 'Check Again', emoji: '🔍', color: '#f97316', category: 'correction' },
  { id: 'thumbs-up', label: 'Thumbs Up', emoji: '👍', color: '#22c55e', category: 'praise' },
  { id: 'heart', label: 'Love It!', emoji: '❤️', color: '#ec4899', category: 'praise' },
]

export const StampExtension = Mark.create<StampOptions>({
  name: 'stamp',

  addOptions() {
    return {
      stamps: DEFAULT_STAMPS,
      allowCustom: true,
    }
  },

  addAttributes() {
    return {
      stampId: { default: null },
      emoji: { default: null },
      label: { default: null },
      color: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-stamp]',
        getAttrs: (el) => {
          const element = el as HTMLElement
          return {
            stampId: element.getAttribute('data-stamp'),
            emoji: element.getAttribute('data-stamp-emoji'),
            label: element.getAttribute('data-stamp-label'),
            color: element.getAttribute('data-stamp-color'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        'data-stamp': HTMLAttributes.stampId,
        'data-stamp-emoji': HTMLAttributes.emoji,
        'data-stamp-label': HTMLAttributes.label,
        'data-stamp-color': HTMLAttributes.color,
        class: 'rte-stamp',
        style: `--stamp-color: ${HTMLAttributes.color}`,
        title: HTMLAttributes.label,
      },
      0,
    ]
  },

  addCommands() {
    return {
      setStamp: (stampId: string) => ({ commands }) => {
        const stamp = this.options.stamps?.find((s) => s.id === stampId)
        if (!stamp) return false
        return commands.setMark(this.name, {
          stampId: stamp.id,
          emoji: stamp.emoji,
          label: stamp.label,
          color: stamp.color,
        })
      },
      removeStamp: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
```

**Acceptance Criteria:**
- [ ] Pre-defined stamps available: Great, Excellent, Good Effort, Keep Going, Needs Work, Check Again, Thumbs Up, Love It
- [ ] Stamp picker opens from toolbar button
- [ ] Selected text receives stamp decoration (emoji + colored underline)
- [ ] Stamps are stored in document JSON (`data-stamp` attributes)
- [ ] Stamps render in exported HTML with emoji and color
- [ ] Stamps can be removed by clicking or via command
- [ ] Consumers can add custom stamps via `stamps` option
- [ ] Stamps categorized: praise, encouragement, correction, custom
- [ ] `'stamp'` added to `ToolbarItem` type union
- [ ] Stamp picker is keyboard-accessible (arrow keys, Enter to select)
- [ ] Stamps visible in both light and dark mode

**Testing:** Write unit tests in `tests/unit/extensions/StampExtension.test.ts` testing: setStamp command, removeStamp command, parseHTML, renderHTML, custom stamps, default stamps list.

---

### P3-005: Tags / Categories

**Dependencies:** P1-019
**Priority:** P3

**Description:**
Add document-level metadata support for tags and categories. Tags are stored as document attributes (not inline content). Provides a tag input component with autocomplete from a consumer-supplied tag list. Multiple tags per document. Categories are single-select from a consumer-defined list. Tags and categories are accessible via `editor.storage.tags` and emitted via events. Consumers use this for document organization and filtering.

**Files to Create:**
- `src/extensions/TagsExtension.ts`
- `src/components/RTTagInput.vue`

**Files to Modify:**
- `src/extensions/index.ts` — Add `TagsExtension` export
- `src/types/editor.ts` — Add `TagsConfig` interface
- `src/index.ts` — Add `TagsExtension`, `RTTagInput` to package exports

**Technical Details:**

`src/extensions/TagsExtension.ts`:
```typescript
import { Extension } from '@tiptap/core'

export interface TagsOptions {
  /** Available tags for autocomplete */
  suggestions?: string[]
  /** Available categories (single-select) */
  categories?: string[]
  /** Initial tags */
  tags?: string[]
  /** Initial category */
  category?: string
  /** Max tags per document */
  maxTags?: number  // default: 10
  /** Callback when tags change */
  onTagsChange?: (tags: string[]) => void
  /** Callback when category changes */
  onCategoryChange?: (category: string | null) => void
}

export const TagsExtension = Extension.create<TagsOptions>({
  name: 'tags',

  addOptions() {
    return {
      suggestions: [],
      categories: [],
      tags: [],
      category: undefined,
      maxTags: 10,
      onTagsChange: undefined,
      onCategoryChange: undefined,
    }
  },

  addStorage() {
    return {
      tags: this.options.tags ?? [],
      category: this.options.category ?? null,
    }
  },

  addCommands() {
    return {
      addTag: (tag: string) => ({ editor }) => {
        const tags = [...(editor.storage.tags.tags as string[])]
        const maxTags = this.options.maxTags ?? 10
        if (tags.includes(tag) || tags.length >= maxTags) return false
        tags.push(tag)
        editor.storage.tags.tags = tags
        this.options.onTagsChange?.(tags)
        return true
      },
      removeTag: (tag: string) => ({ editor }) => {
        const tags = (editor.storage.tags.tags as string[]).filter((t) => t !== tag)
        editor.storage.tags.tags = tags
        this.options.onTagsChange?.(tags)
        return true
      },
      setCategory: (category: string | null) => ({ editor }) => {
        editor.storage.tags.category = category
        this.options.onCategoryChange?.(category)
        return true
      },
      getTags: () => ({ editor }) => {
        return editor.storage.tags.tags as string[]
      },
      getCategory: () => ({ editor }) => {
        return editor.storage.tags.category as string | null
      },
    }
  },
})
```

`src/components/RTTagInput.vue`:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  tags: string[]
  suggestions?: string[]
  maxTags?: number
}>()

const emit = defineEmits<{
  (e: 'add', tag: string): void
  (e: 'remove', tag: string): void
}>()

const input = ref('')
const showSuggestions = ref(false)

const filteredSuggestions = computed(() => {
  if (!input.value || !props.suggestions) return []
  const query = input.value.toLowerCase()
  return props.suggestions
    .filter((s) => s.toLowerCase().includes(query))
    .filter((s) => !props.tags.includes(s))
    .slice(0, 5)
})

function addTag(tag: string) {
  const trimmed = tag.trim()
  if (!trimmed) return
  if (props.maxTags && props.tags.length >= props.maxTags) return
  emit('add', trimmed)
  input.value = ''
  showSuggestions.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && input.value) {
    e.preventDefault()
    addTag(input.value)
  }
  if (e.key === 'Backspace' && !input.value && props.tags.length) {
    emit('remove', props.tags[props.tags.length - 1])
  }
}
</script>

<template>
  <div class="rte-tag-input" role="group" aria-label="Document tags">
    <span
      v-for="tag in tags"
      :key="tag"
      class="rte-tag"
    >
      {{ tag }}
      <button
        type="button"
        class="rte-tag__remove"
        :aria-label="`Remove tag ${tag}`"
        @click="emit('remove', tag)"
      >×</button>
    </span>
    <input
      v-model="input"
      type="text"
      class="rte-tag-input__field"
      placeholder="Add tag..."
      aria-label="Add tag"
      @keydown="handleKeydown"
      @focus="showSuggestions = true"
      @blur="setTimeout(() => showSuggestions = false, 200)"
    />
    <ul v-if="showSuggestions && filteredSuggestions.length" class="rte-tag-suggestions" role="listbox">
      <li
        v-for="suggestion in filteredSuggestions"
        :key="suggestion"
        role="option"
        class="rte-tag-suggestion"
        @mousedown.prevent="addTag(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>
```

**Acceptance Criteria:**
- [ ] Tags stored as document-level metadata (not inline content)
- [ ] `addTag()` and `removeTag()` commands available
- [ ] Duplicate tags prevented
- [ ] Maximum tags enforced (default: 10)
- [ ] Tag autocomplete from consumer-supplied suggestions list
- [ ] Category single-select from consumer-defined categories
- [ ] Tags and category accessible via `editor.storage.tags`
- [ ] `onTagsChange` and `onCategoryChange` callbacks fire on changes
- [ ] `RTTagInput` component provides keyboard-friendly tag management
- [ ] Backspace removes last tag when input is empty
- [ ] Enter adds current input as tag
- [ ] Tag input and suggestions are keyboard-accessible
- [ ] Tags exported in document JSON

**Testing:** Write unit tests in `tests/unit/extensions/TagsExtension.test.ts` testing: addTag, removeTag, setCategory, duplicate prevention, maxTags limit, callbacks. Write component tests in `tests/unit/components/RTTagInput.test.ts` testing: keyboard interactions, autocomplete, add/remove events.

---

### P3-006: Code Blocks with Syntax Highlighting

**Dependencies:** P1-019
**Priority:** P3

**Description:**
Add code blocks with syntax highlighting using `@tiptap/extension-code-block-lowlight` and `lowlight` (a syntax highlighter based on highlight.js). Lowlight is lazy-loaded as an optional peer dependency. Provides language selection dropdown, line numbers, and a copy-to-clipboard button. Supports common languages: JavaScript, TypeScript, Python, HTML, CSS, PHP, SQL, JSON, Bash. Theme matches editor theme (light/dark).

**Files to Create:**
- `src/extensions/CodeBlockExtension.ts`
- `src/components/RTCodeBlock.vue`
- `src/styles/code-block.css`

**Files to Modify:**
- `src/extensions/index.ts` — Add `CodeBlockExtension` export
- `src/types/editor.ts` — Add `'codeBlock'` to `ToolbarItem` type
- `src/index.ts` — Add `CodeBlockExtension` to package exports

**Technical Details:**

`src/extensions/CodeBlockExtension.ts`:
```typescript
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import RTCodeBlock from '../components/RTCodeBlock.vue'

export interface CodeBlockOptions {
  /** Languages to register (default: common set) */
  languages?: string[]
  /** Show line numbers (default: true) */
  lineNumbers?: boolean
  /** Show copy button (default: true) */
  showCopyButton?: boolean
  /** Default language (default: 'plaintext') */
  defaultLanguage?: string
}

// Lazy-load lowlight with common languages
let lowlightPromise: Promise<any> | null = null
const loadLowlight = async () => {
  if (!lowlightPromise) {
    lowlightPromise = import('lowlight').then(async (mod) => {
      const lowlight = mod.createLowlight(mod.common)
      return lowlight
    }).catch(() => {
      throw new Error(
        'lowlight is required for code syntax highlighting. Install: npm install lowlight'
      )
    })
  }
  return lowlightPromise
}

export const createCodeBlockExtension = async (options: CodeBlockOptions = {}) => {
  const lowlight = await loadLowlight()

  return CodeBlockLowlight.extend({
    addNodeView() {
      return VueNodeViewRenderer(RTCodeBlock)
    },
  }).configure({
    lowlight,
    defaultLanguage: options.defaultLanguage ?? 'plaintext',
  })
}
```

`src/components/RTCodeBlock.vue`:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'

const props = defineProps<{
  node: any
  updateAttributes: (attrs: Record<string, any>) => void
  extension: any
}>()

const copied = ref(false)

const language = computed({
  get: () => props.node.attrs.language ?? 'plaintext',
  set: (val: string) => props.updateAttributes({ language: val }),
})

const languages = [
  'plaintext', 'javascript', 'typescript', 'python', 'html',
  'css', 'php', 'sql', 'json', 'bash', 'java', 'csharp',
  'ruby', 'go', 'rust', 'markdown', 'yaml', 'xml',
]

async function copyCode() {
  const code = props.node.textContent
  await navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <NodeViewWrapper class="rte-code-block">
    <div class="rte-code-block__header">
      <select
        v-model="language"
        class="rte-code-block__language"
        aria-label="Code language"
      >
        <option v-for="lang in languages" :key="lang" :value="lang">
          {{ lang }}
        </option>
      </select>
      <button
        type="button"
        class="rte-code-block__copy"
        :aria-label="copied ? 'Copied!' : 'Copy code'"
        @click="copyCode"
      >
        {{ copied ? '✓ Copied' : 'Copy' }}
      </button>
    </div>
    <pre class="rte-code-block__pre"><NodeViewContent as="code" /></pre>
  </NodeViewWrapper>
</template>
```

**Acceptance Criteria:**
- [ ] Code blocks render with syntax highlighting for supported languages
- [ ] Language selection dropdown with 18+ languages
- [ ] Copy-to-clipboard button works and shows confirmation
- [ ] Line numbers displayed (configurable)
- [ ] Default language is "plaintext" (no highlighting)
- [ ] `lowlight` lazy-loaded — not in core bundle
- [ ] Clear error if lowlight not installed
- [ ] Code block theme adapts to light/dark mode
- [ ] Code blocks are accessible (semantic `<pre><code>` structure)
- [ ] `'codeBlock'` added to `ToolbarItem` type union
- [ ] Code blocks render correctly in exported HTML
- [ ] Tab key inserts spaces within code block (not tab-navigate away)

**Testing:** Write unit tests in `tests/unit/extensions/CodeBlockExtension.test.ts` testing: language selection, copy functionality, extension configuration. Write component tests in `tests/unit/components/RTCodeBlock.test.ts` testing: language dropdown, copy button, rendering.

---

### P3-007: Mobile Optimization

**Dependencies:** P1-019, P2-003
**Priority:** P3

**Description:**
Optimize the editor for mobile devices (iOS Safari, Android Chrome). Touch-friendly toolbar with 44×44px minimum tap targets (WCAG 2.5.5). Responsive layout that avoids horizontal scrolling on viewports down to 320px. Virtual keyboard handling — toolbar repositions above the virtual keyboard on focus. Mobile-specific gestures: swipe to indent/outdent lists, long-press for context menu. Collapsible toolbar groups on small screens to save space. Floating toolbar option that follows scroll position.

**Files to Create:**
- `src/styles/mobile.css`
- `src/composables/useMobileDetect.ts`
- `src/components/RTMobileToolbar.vue`

**Files to Modify:**
- `src/styles/editor.css` — Import `mobile.css`
- `src/components/RTToolbar.vue` — Add responsive breakpoints and mobile layout
- `src/composables/useEditor.ts` — Integrate mobile detection
- `src/index.ts` — Add `useMobileDetect` to package exports

**Technical Details:**

`src/composables/useMobileDetect.ts`:
```typescript
import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface MobileInfo {
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isTouchDevice: boolean
  viewportWidth: number
  isKeyboardOpen: boolean
}

export function useMobileDetect() {
  const isMobile = ref(false)
  const isIOS = ref(false)
  const isAndroid = ref(false)
  const isTouchDevice = ref(false)
  const viewportWidth = ref(0)
  const isKeyboardOpen = ref(false)

  let initialViewportHeight = 0

  function update() {
    if (typeof window === 'undefined') return

    const ua = navigator.userAgent
    isIOS.value = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    isAndroid.value = /Android/.test(ua)
    isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    viewportWidth.value = window.innerWidth
    isMobile.value = viewportWidth.value < 768 || (isTouchDevice.value && viewportWidth.value < 1024)

    // Detect virtual keyboard by comparing viewport height
    const currentHeight = window.visualViewport?.height ?? window.innerHeight
    isKeyboardOpen.value = initialViewportHeight > 0 && currentHeight < initialViewportHeight * 0.75
  }

  function onResize() {
    update()
  }

  function onVisualViewportResize() {
    const currentHeight = window.visualViewport?.height ?? window.innerHeight
    isKeyboardOpen.value = initialViewportHeight > 0 && currentHeight < initialViewportHeight * 0.75
  }

  onMounted(() => {
    initialViewportHeight = window.visualViewport?.height ?? window.innerHeight
    update()
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onVisualViewportResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    window.visualViewport?.removeEventListener('resize', onVisualViewportResize)
  })

  return { isMobile, isIOS, isAndroid, isTouchDevice, viewportWidth, isKeyboardOpen }
}
```

`src/styles/mobile.css`:
```css
/* Mobile-responsive editor styles */
@media (max-width: 767px) {
  .rte-toolbar {
    flex-wrap: wrap;
    gap: 2px;
    padding: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }

  .rte-toolbar::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .rte-toolbar__button {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
    font-size: 16px; /* Prevent iOS zoom on focus */
  }

  .rte-toolbar__separator {
    display: none; /* Hide separators on mobile to save space */
  }

  .rte-editor {
    min-height: 200px;
    font-size: 16px; /* Prevent iOS zoom */
  }

  .rte-editor .ProseMirror {
    padding: 12px;
  }

  /* Collapsible toolbar groups */
  .rte-toolbar__group--collapsible {
    display: none;
  }

  .rte-toolbar__group--collapsible.is-expanded {
    display: flex;
  }

  .rte-toolbar__overflow-toggle {
    display: flex;
    min-width: 44px;
    min-height: 44px;
    align-items: center;
    justify-content: center;
  }
}

/* Virtual keyboard adjustment */
.rte-container--keyboard-open .rte-toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--rte-color-bg-toolbar, #ffffff);
  border-bottom: 1px solid var(--rte-color-border, #e5e7eb);
}

/* Touch-friendly bubble menu */
@media (pointer: coarse) {
  .rte-bubble-menu {
    padding: 8px;
  }

  .rte-bubble-menu__button {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Prevent horizontal overflow */
.rte-container {
  max-width: 100%;
  overflow-x: hidden;
}

@media (max-width: 320px) {
  .rte-toolbar__button {
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
  }
}
```

**Acceptance Criteria:**
- [ ] Works on iOS Safari 15+ and Android Chrome 100+
- [ ] No horizontal scrolling on viewports down to 320px
- [ ] Toolbar buttons have minimum 44×44px tap targets on touch devices
- [ ] Virtual keyboard detection via `visualViewport` API
- [ ] Toolbar remains accessible when virtual keyboard is open
- [ ] `useMobileDetect()` composable detects iOS, Android, touch, viewport width
- [ ] Font size ≥ 16px on mobile (prevents iOS auto-zoom on input focus)
- [ ] Toolbar groups collapse on small screens with overflow toggle
- [ ] Touch-friendly bubble menu with enlarged tap targets
- [ ] `prefers-reduced-motion` respected for mobile animations
- [ ] Editor content area has appropriate padding on mobile
- [ ] Separator bars hidden on mobile to save toolbar space

**Testing:** Write unit tests in `tests/unit/composables/useMobileDetect.test.ts` testing: iOS/Android detection, viewport width, keyboard detection. Add mobile viewport tests to Playwright E2E suite (P2-016) using `page.setViewportSize({ width: 375, height: 812 })` for iPhone and `{ width: 360, height: 740 }` for Android.

---

### P3-008: Print-Friendly CSS

**Dependencies:** P1-019, P1-024
**Priority:** P3

**Description:**
Add a `@media print` stylesheet that produces clean, professional printouts of editor content. Hide all UI chrome (toolbar, bubble menu, status bar, drag handles, collaboration cursors). Ensure images scale to fit within page margins. Optimize colors for printing (darker text, no background colors on highlights unless explicitly set). Support CSS page break control for headings (avoid orphan headings at page bottom). Optional header/footer support via CSS `@page` margin content. Provide a `printContent()` utility function that opens a print-friendly preview.

**Files to Create:**
- `src/styles/print.css`
- `src/utils/print.ts`

**Files to Modify:**
- `src/styles/editor.css` — Import `print.css`
- `src/index.ts` — Add `printContent` to package exports

**Technical Details:**

`src/styles/print.css`:
```css
@media print {
  /* Hide all editor UI chrome */
  .rte-toolbar,
  .rte-bubble-menu,
  .rte-status-bar,
  .rte-drag-handle,
  .rte-collaboration-cursor,
  .rte-collaboration-cursor__label,
  .rte-slash-commands,
  .rte-stamp-picker,
  .rte-tag-input,
  .rte-voice-button {
    display: none !important;
  }

  /* Editor container — remove borders and shadows */
  .rte-container {
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .rte-editor {
    border: none !important;
    min-height: auto !important;
    padding: 0 !important;
  }

  .rte-editor .ProseMirror {
    padding: 0 !important;
  }

  /* Typography — optimize for print */
  .rte-editor .ProseMirror {
    color: #000 !important;
    font-size: 12pt !important;
    line-height: 1.5 !important;
  }

  .rte-editor .ProseMirror h1 {
    font-size: 18pt !important;
    page-break-after: avoid;
  }

  .rte-editor .ProseMirror h2 {
    font-size: 16pt !important;
    page-break-after: avoid;
  }

  .rte-editor .ProseMirror h3 {
    font-size: 14pt !important;
    page-break-after: avoid;
  }

  /* Prevent orphaned headings */
  .rte-editor .ProseMirror h1,
  .rte-editor .ProseMirror h2,
  .rte-editor .ProseMirror h3,
  .rte-editor .ProseMirror h4 {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* Keep lists together */
  .rte-editor .ProseMirror li {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Images — scale to fit page */
  .rte-editor .ProseMirror img {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Tables — improve print readability */
  .rte-editor .ProseMirror table {
    page-break-inside: auto;
    border-collapse: collapse !important;
  }

  .rte-editor .ProseMirror tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .rte-editor .ProseMirror th,
  .rte-editor .ProseMirror td {
    border: 1px solid #000 !important;
    padding: 4pt 8pt !important;
    color: #000 !important;
  }

  .rte-editor .ProseMirror th {
    background: #e5e7eb !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Blockquotes */
  .rte-editor .ProseMirror blockquote {
    border-left: 3pt solid #000 !important;
    color: #333 !important;
    padding-left: 10pt !important;
  }

  /* Code blocks */
  .rte-editor .ProseMirror pre {
    background: #f5f5f5 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    border: 1px solid #ccc !important;
    padding: 8pt !important;
    page-break-inside: avoid;
    break-inside: avoid;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
  }

  .rte-code-block__header {
    display: none !important;
  }

  /* Links — show URL after link text */
  .rte-editor .ProseMirror a[href]::after {
    content: ' (' attr(href) ')';
    font-size: 9pt;
    color: #666;
  }

  /* Stamps — ensure visibility */
  .rte-editor .ProseMirror .rte-stamp {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Highlights — preserve if explicitly set */
  .rte-editor .ProseMirror mark {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Comments — hide comment markers */
  .rte-editor .ProseMirror .rte-comment-marker {
    background: none !important;
    border-bottom: none !important;
  }

  /* Page setup */
  @page {
    margin: 2cm;
    size: A4;
  }

  @page :first {
    margin-top: 3cm;
  }
}
```

`src/utils/print.ts`:
```typescript
/**
 * Print the editor content in a clean, print-friendly format.
 * Opens a new window with only the editor content and triggers print.
 */
export function printContent(editorElement: HTMLElement, options?: {
  title?: string
  stylesheets?: string[]
}): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Unable to open print window. Check popup blocker settings.')
  }

  const title = options?.title ?? 'Print Preview'
  const content = editorElement.querySelector('.ProseMirror')?.innerHTML ?? editorElement.innerHTML

  // Collect editor stylesheets
  const styleSheets = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n')
      } catch {
        return '' // Skip cross-origin stylesheets
      }
    })
    .join('\n')

  const additionalStyles = (options?.stylesheets ?? [])
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join('\n')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>${styleSheets}</style>
      ${additionalStyles}
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #000;
          line-height: 1.5;
          padding: 0;
          margin: 0;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="rte-editor"><div class="ProseMirror">${content}</div></div>
    </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()

  // Delay to ensure styles are loaded
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}
```

**Acceptance Criteria:**
- [ ] Toolbar, bubble menu, status bar, drag handles hidden when printing
- [ ] Editor container has no borders, shadows, or background when printing
- [ ] Images scale to fit within page margins (no overflow)
- [ ] Headings never orphaned at bottom of page (`page-break-after: avoid`)
- [ ] Tables have visible borders in print (even if borderless on screen)
- [ ] Table rows don't break across pages
- [ ] Code blocks have background preserved and don't break across pages
- [ ] Links show URL in parentheses after link text
- [ ] Colors optimized for print (darker text, high contrast)
- [ ] `printContent()` utility opens print-friendly preview window
- [ ] `@page` rules set A4 with 2cm margins
- [ ] Stamps and highlights preserved with `print-color-adjust: exact`
- [ ] Works correctly in Chrome, Firefox, and Safari print dialogs

**Testing:** Write unit tests in `tests/unit/utils/print.test.ts` testing: `printContent()` function (mock `window.open`), HTML generation, error handling. Visual regression tests for print layout added to Playwright E2E suite using `page.emulateMedia({ media: 'print' })`.

---

### P3-009: CI/CD Automated Publishing

**Dependencies:** P1-019
**Priority:** P3

**Description:**
Set up GitHub Actions CI/CD pipeline for automated testing, building, and npm publishing. Includes: (1) CI workflow that runs on every PR — lint, type-check, unit tests, build verification; (2) Release workflow triggered by version tags (`v*`) — runs full test suite, builds package, publishes to npm, generates changelog; (3) Semantic versioning enforcement using conventional commits; (4) Automated changelog generation from commit history. Uses `npm provenance` for supply chain security.

**Files to Create:**
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.github/workflows/preview.yml`
- `.changeset/config.json` (if using changesets) or `release.config.js`

**Files to Modify:**
- `package.json` — Add `release`, `changelog`, `prepublishOnly` scripts

**Technical Details:**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - name: Upload coverage
        if: matrix.node-version == 20
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - name: Upload E2E report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist/ | cut -f1)
          echo "Bundle size: $SIZE bytes"
          # Fail if bundle exceeds 500KB (excluding source maps)
          CORE_SIZE=$(find dist -name '*.js' -not -name '*.map' | xargs du -cb | tail -1 | cut -f1)
          echo "Core JS size: $CORE_SIZE bytes"
          if [ "$CORE_SIZE" -gt 512000 ]; then
            echo "::error::Bundle size exceeds 500KB limit: $CORE_SIZE bytes"
            exit 1
          fi
```

`.github/workflows/release.yml`:
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for changelog
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run build

      # Publish to npm with provenance
      - name: Publish to npm
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      # Generate changelog from commits
      - name: Generate Changelog
        id: changelog
        run: |
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
          if [ -n "$PREV_TAG" ]; then
            CHANGELOG=$(git log ${PREV_TAG}..HEAD --pretty=format:"- %s (%h)" --no-merges)
          else
            CHANGELOG=$(git log --pretty=format:"- %s (%h)" --no-merges -20)
          fi
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      # Create GitHub Release
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: Release ${{ github.ref_name }}
          body: |
            ## Changes
            ${{ steps.changelog.outputs.changelog }}

            ## Installation
            ```bash
            npm install @timothyphchan/rteditor@${{ github.ref_name }}
            ```
          draft: false
          prerelease: ${{ contains(github.ref_name, '-beta') || contains(github.ref_name, '-alpha') }}
```

`package.json` scripts to add:
```json
{
  "scripts": {
    "prepublishOnly": "npm run lint && npm run type-check && npm run test:unit && npm run build",
    "release:patch": "npm version patch && git push --follow-tags",
    "release:minor": "npm version minor && git push --follow-tags",
    "release:major": "npm version major && git push --follow-tags"
  }
}
```

**Acceptance Criteria:**
- [ ] CI runs on every PR: lint, type-check, unit tests, build
- [ ] Unit tests run across Node.js 18, 20, 22 matrix
- [ ] E2E tests run with Playwright in CI (Chromium)
- [ ] Build step verifies bundle size stays under 500KB
- [ ] Release workflow triggers on `v*` tags
- [ ] npm publish uses `--provenance` for supply chain security
- [ ] GitHub Release created with auto-generated changelog
- [ ] Pre-release tags (`-beta`, `-alpha`) marked as prerelease on GitHub
- [ ] `prepublishOnly` script prevents accidental broken publishes
- [ ] Coverage artifacts uploaded for PR review
- [ ] Playwright report uploaded on E2E failure for debugging
- [ ] Concurrent CI runs cancelled when new commits pushed to same PR
- [ ] Semantic versioning enforced (`release:patch`, `release:minor`, `release:major` scripts)

**Testing:** CI/CD workflows tested by creating a test tag on a feature branch. Verify: all jobs pass, npm publish dry-run succeeds (`npm publish --dry-run`), changelog generation produces correct output.

---

### P3-010: Pre-built Upload Handlers

**Dependencies:** P1-007
**Priority:** P3

**Description:**
Provide optional, tree-shakeable upload handler utilities for common backends. These are convenience utilities — not required dependencies. Each handler implements the `UploadHandler` signature (`(file: File) => Promise<UploadResult>`) from P1-007. Handlers for: (1) AWS S3 pre-signed URL upload, (2) Cloudinary direct upload, (3) Laravel/Axios upload (for DKI/DSI downstream consumers). Each handler includes security best practices (pre-signed URLs with expiry, CSRF tokens, file type validation). Well-documented with usage examples. Exported from a separate entry point (`@timothyphchan/rteditor/upload-handlers`) to keep core bundle lean.

**Files to Create:**
- `src/upload-handlers/index.ts`
- `src/upload-handlers/s3.ts`
- `src/upload-handlers/cloudinary.ts`
- `src/upload-handlers/laravel.ts`
- `src/upload-handlers/types.ts`

**Files to Modify:**
- `package.json` — Add `./upload-handlers` export map entry
- `tsup.config.ts` — Add `upload-handlers` as separate entry point

**Technical Details:**

`src/upload-handlers/types.ts`:
```typescript
import type { UploadResult } from '../types/editor'

/**
 * Standard upload handler signature.
 * Matches the UploadHandler type from the core editor.
 */
export type UploadHandler = (file: File) => Promise<UploadResult>

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface BaseUploadOptions {
  /** Allowed MIME types (default: image/*, application/pdf) */
  allowedTypes?: string[]
  /** Max file size in bytes (default: 10MB) */
  maxFileSize?: number
  /** Progress callback */
  onProgress?: (progress: UploadProgress) => void
  /** Additional headers */
  headers?: Record<string, string>
}
```

`src/upload-handlers/s3.ts`:
```typescript
import type { UploadResult } from '../types/editor'
import type { BaseUploadOptions, UploadHandler, UploadProgress } from './types'

export interface S3UploadOptions extends BaseUploadOptions {
  /**
   * Endpoint that returns a pre-signed URL.
   * The editor will POST { filename, contentType, fileSize } to this endpoint.
   * Expected response: { uploadUrl: string, fileUrl: string, fields?: Record<string, string> }
   */
  presignEndpoint: string
  /** AWS region (for URL validation) */
  region?: string
  /** Custom fetch function (for auth headers, etc.) */
  fetchFn?: typeof fetch
}

/**
 * Create an upload handler for AWS S3 using pre-signed URLs.
 *
 * Usage:
 * ```typescript
 * import { createS3UploadHandler } from '@timothyphchan/rteditor/upload-handlers'
 *
 * const uploadHandler = createS3UploadHandler({
 *   presignEndpoint: '/api/uploads/presign',
 *   maxFileSize: 5 * 1024 * 1024, // 5MB
 *   onProgress: (p) => console.log(`${p.percentage}%`),
 * })
 * ```
 */
export function createS3UploadHandler(options: S3UploadOptions): UploadHandler {
  const fetchFn = options.fetchFn ?? fetch

  return async (file: File): Promise<UploadResult> => {
    // Validate file
    validateFile(file, options)

    // 1. Request pre-signed URL from server
    const presignResponse = await fetchFn(options.presignEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      }),
    })

    if (!presignResponse.ok) {
      throw new Error(`Failed to get pre-signed URL: ${presignResponse.status}`)
    }

    const { uploadUrl, fileUrl, fields } = await presignResponse.json()

    // 2. Upload file to S3 using pre-signed URL
    if (fields) {
      // Multipart form upload (POST to S3)
      const formData = new FormData()
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
      formData.append('file', file)

      const uploadResponse = await uploadWithProgress(uploadUrl, {
        method: 'POST',
        body: formData,
      }, options.onProgress)

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.status}`)
      }
    } else {
      // Direct PUT upload
      const uploadResponse = await uploadWithProgress(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      }, options.onProgress)

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.status}`)
      }
    }

    return { url: fileUrl, alt: file.name }
  }
}

function validateFile(file: File, options: BaseUploadOptions): void {
  const maxSize = options.maxFileSize ?? 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`File size ${file.size} exceeds maximum ${maxSize} bytes`)
  }

  if (options.allowedTypes?.length) {
    const isAllowed = options.allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'))
      }
      return file.type === type
    })
    if (!isAllowed) {
      throw new Error(`File type ${file.type} is not allowed`)
    }
  }
}

async function uploadWithProgress(
  url: string,
  init: RequestInit,
  onProgress?: (progress: UploadProgress) => void
): Promise<Response> {
  if (!onProgress) return fetch(url, init)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(init.method ?? 'PUT', url)

    if (init.headers) {
      Object.entries(init.headers as Record<string, string>).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        })
      }
    })

    xhr.onload = () => resolve(new Response(xhr.response, { status: xhr.status }))
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(init.body as any)
  })
}
```

`src/upload-handlers/cloudinary.ts`:
```typescript
import type { UploadResult } from '../types/editor'
import type { BaseUploadOptions, UploadHandler } from './types'

export interface CloudinaryUploadOptions extends BaseUploadOptions {
  /** Cloudinary cloud name */
  cloudName: string
  /** Upload preset (unsigned) or API key (signed) */
  uploadPreset?: string
  /** API key for signed uploads */
  apiKey?: string
  /** Signature endpoint for signed uploads */
  signatureEndpoint?: string
  /** Upload folder */
  folder?: string
  /** Transform URL (e.g., 'w_800,c_limit') */
  transformation?: string
}

/**
 * Create an upload handler for Cloudinary.
 *
 * Usage (unsigned):
 * ```typescript
 * import { createCloudinaryUploadHandler } from '@timothyphchan/rteditor/upload-handlers'
 *
 * const uploadHandler = createCloudinaryUploadHandler({
 *   cloudName: 'your-cloud',
 *   uploadPreset: 'your-preset',
 *   folder: 'editor-uploads',
 * })
 * ```
 */
export function createCloudinaryUploadHandler(options: CloudinaryUploadOptions): UploadHandler {
  return async (file: File): Promise<UploadResult> => {
    // Validate file
    const maxSize = options.maxFileSize ?? 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`File size ${file.size} exceeds maximum ${maxSize} bytes`)
    }

    const formData = new FormData()
    formData.append('file', file)

    if (options.uploadPreset) {
      // Unsigned upload
      formData.append('upload_preset', options.uploadPreset)
    } else if (options.signatureEndpoint && options.apiKey) {
      // Signed upload — get signature from server
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const sigResponse = await fetch(options.signatureEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: JSON.stringify({ timestamp, folder: options.folder }),
      })
      if (!sigResponse.ok) throw new Error('Failed to get Cloudinary signature')
      const { signature } = await sigResponse.json()

      formData.append('api_key', options.apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
    } else {
      throw new Error('Cloudinary requires either uploadPreset (unsigned) or apiKey + signatureEndpoint (signed)')
    }

    if (options.folder) formData.append('folder', options.folder)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${options.cloudName}/auto/upload`

    const response = await fetch(uploadUrl, { method: 'POST', body: formData })
    if (!response.ok) throw new Error(`Cloudinary upload failed: ${response.status}`)

    const data = await response.json()

    let url = data.secure_url
    if (options.transformation) {
      // Insert transformation into URL
      url = url.replace('/upload/', `/upload/${options.transformation}/`)
    }

    return { url, alt: file.name }
  }
}
```

`src/upload-handlers/laravel.ts`:
```typescript
import type { UploadResult } from '../types/editor'
import type { BaseUploadOptions, UploadHandler } from './types'

export interface LaravelUploadOptions extends BaseUploadOptions {
  /** Upload endpoint URL */
  uploadUrl: string
  /** CSRF token (reads from meta tag if not provided) */
  csrfToken?: string
  /** Form field name for the file (default: 'file') */
  fieldName?: string
  /** Additional form fields to send */
  additionalFields?: Record<string, string>
  /** Axios instance (optional — uses fetch if not provided) */
  axiosInstance?: any
}

/**
 * Create an upload handler for Laravel backends.
 * Designed for DKI/DSI downstream applications.
 *
 * Usage:
 * ```typescript
 * import { createLaravelUploadHandler } from '@timothyphchan/rteditor/upload-handlers'
 *
 * const uploadHandler = createLaravelUploadHandler({
 *   uploadUrl: '/api/uploads',
 *   // CSRF token auto-detected from <meta name="csrf-token">
 * })
 *
 * // With Axios:
 * import axios from 'axios'
 * const uploadHandler = createLaravelUploadHandler({
 *   uploadUrl: '/api/uploads',
 *   axiosInstance: axios,
 * })
 * ```
 */
export function createLaravelUploadHandler(options: LaravelUploadOptions): UploadHandler {
  return async (file: File): Promise<UploadResult> => {
    // Validate file
    const maxSize = options.maxFileSize ?? 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`File size ${file.size} exceeds maximum ${maxSize} bytes`)
    }

    if (options.allowedTypes?.length) {
      const isAllowed = options.allowedTypes.some((type) => {
        if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'))
        return file.type === type
      })
      if (!isAllowed) throw new Error(`File type ${file.type} is not allowed`)
    }

    // Get CSRF token
    const csrfToken = options.csrfToken
      ?? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
      ?? ''

    const fieldName = options.fieldName ?? 'file'
    const formData = new FormData()
    formData.append(fieldName, file)

    // Add additional fields
    if (options.additionalFields) {
      Object.entries(options.additionalFields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    if (options.axiosInstance) {
      // Use Axios
      const response = await options.axiosInstance.post(options.uploadUrl, formData, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          ...options.headers,
        },
        onUploadProgress: options.onProgress
          ? (e: any) => {
              options.onProgress!({
                loaded: e.loaded,
                total: e.total,
                percentage: Math.round((e.loaded / e.total) * 100),
              })
            }
          : undefined,
      })

      return { url: response.data.url, alt: response.data.alt ?? file.name }
    }

    // Use fetch
    const response = await fetch(options.uploadUrl, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': csrfToken,
        Accept: 'application/json',
        ...options.headers,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message ?? `Upload failed: ${response.status}`)
    }

    const data = await response.json()
    return { url: data.url, alt: data.alt ?? file.name }
  }
}
```

`src/upload-handlers/index.ts`:
```typescript
export { createS3UploadHandler } from './s3'
export type { S3UploadOptions } from './s3'

export { createCloudinaryUploadHandler } from './cloudinary'
export type { CloudinaryUploadOptions } from './cloudinary'

export { createLaravelUploadHandler } from './laravel'
export type { LaravelUploadOptions } from './laravel'

export type { UploadHandler, UploadProgress, BaseUploadOptions } from './types'
```

`package.json` export map entry:
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./upload-handlers": {
      "import": "./dist/upload-handlers/index.mjs",
      "require": "./dist/upload-handlers/index.cjs",
      "types": "./dist/upload-handlers/index.d.ts"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `createS3UploadHandler()` works with pre-signed URL flow (both POST multipart and PUT direct)
- [ ] `createCloudinaryUploadHandler()` supports both unsigned (preset) and signed uploads
- [ ] `createLaravelUploadHandler()` auto-detects CSRF token from `<meta>` tag
- [ ] Laravel handler works with both `fetch` and Axios
- [ ] All handlers implement `UploadHandler` signature: `(file: File) => Promise<UploadResult>`
- [ ] File type validation enforced before upload attempt
- [ ] File size validation enforced (default: 10MB)
- [ ] Upload progress callback supported (via `onProgress`)
- [ ] Handlers are tree-shakeable (only imported handlers included in consumer bundle)
- [ ] Separate entry point: `import { ... } from '@timothyphchan/rteditor/upload-handlers'`
- [ ] Not included in core bundle — zero impact on consumers who don't use them
- [ ] Clear error messages for misconfigurations
- [ ] Security: pre-signed URLs (S3), signed uploads (Cloudinary), CSRF tokens (Laravel)
- [ ] Well-documented with JSDoc and usage examples

**Testing:** Write unit tests in `tests/unit/upload-handlers/s3.test.ts`, `cloudinary.test.ts`, `laravel.test.ts` testing: file validation, upload flow (mock fetch/XHR), progress callbacks, error handling, CSRF detection. Each handler should have ≥90% coverage.


---

## PHASE 4 — AI Assistant (Target: v0.6.0)

### P4-001: AI Type Definitions

**Dependencies:** P1-001, P1-002

**Priority:** P4

**Description:** Define all TypeScript interfaces and types for the AI feature: `AIHandler`, `AIRequest`, `AIResponse`, `AIMetadata`, `AIOptions`, `AIQuickAction`, `AIContextLevel`, `AIState`.

**Files to Create:**
- `src/types/ai.ts`

**Files to Modify:**
- `src/types/index.ts` — add AI type exports

**Technical Details:**

```typescript
// src/types/ai.ts
export type AIQuickAction = 'simplify' | 'translate' | 'grammar' | 'summarize' | 'expand' | 'explain' | 'continue' | 'questions' | 'rubric'

export type AIContextLevel = 'minimal' | 'standard' | 'full'

export interface AIMetadata {
  documentTitle?: string
  subject?: string
  gradeLevel?: number | string
  language?: string
  userRole?: 'teacher' | 'student'
  customFields?: Record<string, any>
}

export interface AIRequest {
  prompt: string
  selectedText?: string
  surroundingText?: string
  documentText?: string
  metadata?: AIMetadata
  action?: AIQuickAction
  locale?: string
}

export interface AIResponse {
  content: string
  format: 'html' | 'text'
  metadata?: Record<string, any>
}

export interface AIHandler {
  generate: (request: AIRequest) => Promise<AIResponse>
}

export interface AIOptions {
  /** AI handler — consumer-provided function that calls AI backend */
  handler?: AIHandler
  /** Context level: minimal, standard (default), or full */
  contextLevel?: AIContextLevel
  /** Max context characters before smart truncation (default: 4000) */
  maxContextLength?: number
  /** Include document metadata in AI requests (default: true) */
  includeMetadata?: boolean
  /** Document metadata to send with AI requests */
  metadata?: AIMetadata
  /** Customizable list of quick actions shown in panel */
  quickActions?: AIQuickAction[]
  /** Enable/disable AI feature entirely (default: true) */
  enabled?: boolean
  /** Content moderation callback — return null to block, modified response to allow */
  contentFilter?: (response: AIResponse) => AIResponse | null
  /** Custom system prompt prefix prepended to AI system prompt */
  systemPromptPrefix?: string
}

export interface AIState {
  isOpen: boolean
  isLoading: boolean
  mode: 'generate' | 'transform'
  prompt: string
  response: AIResponse | null
  error: string | null
  selectedText: string | null
}
```

**Acceptance Criteria:**
- [ ] All AI-related types exported from `src/types/ai.ts`
- [ ] Types re-exported via `src/types/index.ts`
- [ ] No `any` types in public API (except `customFields`)
- [ ] JSDoc comments on all public interfaces and properties
- [ ] `AIQuickAction` is a union type of string literals
- [ ] `AIOptions` has sensible defaults documented in JSDoc

**Testing:** Write unit tests in `tests/unit/types/ai.test.ts` — verify type exports exist, verify default values documented.

### P4-002: useAI Composable

**Dependencies:** P4-001, P1-009

**Priority:** P4

**Description:** Create the core AI composable that manages AI state, builds context from the editor, calls the AI handler, and handles the response lifecycle (loading, success, error). This is the engine that powers all AI interactions.

**Files to Create:**
- `src/composables/useAI.ts`

**Files to Modify:**
- `src/composables/index.ts` — add `useAI` export

**Technical Details:**

```typescript
// src/composables/useAI.ts
import { ref, computed, type Ref } from 'vue'
import type { Editor } from '@tiptap/core'
import type { AIHandler, AIRequest, AIResponse, AIOptions, AIState, AIQuickAction, AIContextLevel } from '../types/ai'
import { sanitizeHTML } from '../utils/sanitize'

export function useAI(editor: Ref<Editor | undefined>, options: Ref<AIOptions>) {
  const state = ref<AIState>({
    isOpen: false,
    isLoading: false,
    mode: 'generate',
    prompt: '',
    response: null,
    error: null,
    selectedText: null,
  })

  const isEnabled = computed(() => options.value.enabled !== false && !!options.value.handler)

  function open(mode: 'generate' | 'transform' = 'generate') {
    if (!isEnabled.value) return
    const { from, to } = editor.value!.state.selection
    const selectedText = from !== to ? editor.value!.state.doc.textBetween(from, to) : null
    state.value = {
      isOpen: true,
      isLoading: false,
      mode: selectedText ? 'transform' : 'generate',
      prompt: '',
      response: null,
      error: null,
      selectedText,
    }
  }

  function close() {
    state.value.isOpen = false
    state.value.response = null
    state.value.error = null
    state.value.prompt = ''
  }

  function buildContext(): Partial<AIRequest> {
    const ed = editor.value
    if (!ed) return {}

    const level: AIContextLevel = options.value.contextLevel ?? 'standard'
    const maxLen = options.value.maxContextLength ?? 4000
    const result: Partial<AIRequest> = {}

    // Selected text
    const { from, to } = ed.state.selection
    if (from !== to) {
      result.selectedText = ed.state.doc.textBetween(from, to)
    }

    // Surrounding text (standard + full)
    if (level === 'standard' || level === 'full') {
      result.surroundingText = getSurroundingText(ed, from, to, maxLen)
    }

    // Full document (full only)
    if (level === 'full') {
      const fullText = ed.state.doc.textContent
      result.documentText = smartTruncate(fullText, maxLen)
    }

    // Metadata
    if (options.value.includeMetadata !== false && options.value.metadata) {
      result.metadata = options.value.metadata
    }

    return result
  }

  async function submit(prompt: string, action?: AIQuickAction) {
    if (!options.value.handler) {
      state.value.error = 'No AI handler configured'
      return
    }

    state.value.prompt = prompt
    state.value.isLoading = true
    state.value.error = null
    state.value.response = null

    try {
      const context = buildContext()
      const request: AIRequest = {
        prompt,
        ...context,
        action,
        locale: options.value.metadata?.language,
      }

      let response = await options.value.handler.generate(request)

      // Content filter
      if (options.value.contentFilter) {
        const filtered = options.value.contentFilter(response)
        if (!filtered) {
          state.value.error = 'Response blocked by content filter'
          return
        }
        response = filtered
      }

      // Sanitize HTML responses
      if (response.format === 'html') {
        response.content = sanitizeHTML(response.content)
      }

      state.value.response = response
    } catch (err: any) {
      state.value.error = err.message || 'AI generation failed'
    } finally {
      state.value.isLoading = false
    }
  }

  function accept() {
    if (!state.value.response || !editor.value) return
    const content = state.value.response.content
    const format = state.value.response.format

    if (state.value.mode === 'transform') {
      // Replace selection
      if (format === 'html') {
        editor.value.chain().focus().deleteSelection().insertContent(content).run()
      } else {
        editor.value.chain().focus().deleteSelection().insertContent(`<p>${content}</p>`).run()
      }
    } else {
      // Insert at cursor
      if (format === 'html') {
        editor.value.chain().focus().insertContent(content).run()
      } else {
        editor.value.chain().focus().insertContent(`<p>${content}</p>`).run()
      }
    }
    close()
  }

  function acceptAndEdit() {
    if (!state.value.response || !editor.value) return
    // Same as accept but wraps in a span with highlight class
    const content = state.value.response.content
    const wrappedContent = `<span class="rte-ai-inserted">${content}</span>`
    if (state.value.mode === 'transform') {
      editor.value.chain().focus().deleteSelection().insertContent(wrappedContent).run()
    } else {
      editor.value.chain().focus().insertContent(wrappedContent).run()
    }
    close()
  }

  function reject() {
    close()
  }

  function retry() {
    if (state.value.prompt) {
      submit(state.value.prompt, undefined)
    }
  }

  return {
    state: computed(() => state.value),
    isEnabled,
    open,
    close,
    submit,
    accept,
    acceptAndEdit,
    reject,
    retry,
  }
}

// Helper: get ~3 paragraphs surrounding cursor
function getSurroundingText(editor: Editor, from: number, to: number, maxLen: number): string {
  const doc = editor.state.doc
  const resolvedFrom = doc.resolve(from)

  // Get 3 nodes before and after
  const blocks: string[] = []
  let currentPos = 0
  doc.descendants((node, pos) => {
    if (node.isBlock && node.textContent.trim()) {
      const distance = Math.abs(pos - from)
      if (distance < 2000) { // within ~2000 chars of cursor
        blocks.push(node.textContent)
      }
    }
  })

  const text = blocks.join('\n\n')
  return smartTruncate(text, maxLen)
}

// Helper: smart truncation — keep beginning + end, drop middle
function smartTruncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const halfLen = Math.floor(maxLen / 2) - 10
  return text.slice(0, halfLen) + '\n\n[...truncated...]\n\n' + text.slice(-halfLen)
}
```

**Acceptance Criteria:**
- [ ] `useAI` composable exports `state`, `isEnabled`, `open`, `close`, `submit`, `accept`, `acceptAndEdit`, `reject`, `retry`
- [ ] `open()` detects selected text and sets mode to 'transform' or 'generate'
- [ ] `buildContext()` correctly gathers context based on `contextLevel` setting
- [ ] `submit()` calls handler, handles loading/error/success states
- [ ] Content filter blocks responses when returning `null`
- [ ] HTML responses sanitized through DOMPurify
- [ ] `accept()` inserts at cursor (generate) or replaces selection (transform)
- [ ] `acceptAndEdit()` wraps content with `.rte-ai-inserted` class
- [ ] `reject()` closes panel without editor changes
- [ ] `retry()` re-runs the same prompt
- [ ] `smartTruncate()` keeps beginning + end, drops middle
- [ ] `isEnabled` returns false when no handler or `enabled: false`

**Testing:** Write unit tests in `tests/unit/composables/useAI.test.ts` — test: state management, context building for each level, submit flow (mock handler), accept/reject/retry actions, content filter, HTML sanitization, smart truncation. Target ≥90% coverage.

### P4-003: RTAIPanel Component

**Dependencies:** P4-001, P4-002, P1-010

**Priority:** P4

**Description:** Create the main floating AI panel Vue component. This is the Cursor/Notion-style inline panel that appears at cursor position, containing: prompt input, quick action buttons, response display, and action buttons (accept/reject/retry/edit).

**Files to Create:**
- `src/components/RTAIPanel.vue`

**Files to Modify:**
- `src/components/index.ts` — add RTAIPanel export

**Technical Details:**

The component uses `<script setup lang="ts">` and receives props for AI state and emits actions.

```vue
<!-- src/components/RTAIPanel.vue -->
<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { AIState, AIQuickAction } from '../types/ai'

const props = defineProps<{
  state: AIState
  quickActions: AIQuickAction[]
  position: { top: number; left: number }
}>()

const emit = defineEmits<{
  submit: [prompt: string, action?: AIQuickAction]
  accept: []
  acceptAndEdit: []
  reject: []
  retry: []
  close: []
}>()

const promptInput = ref<HTMLTextAreaElement>()
const panelRef = ref<HTMLDivElement>()
const localPrompt = ref('')

// Quick action labels (i18n keys)
const quickActionLabels: Record<AIQuickAction, string> = {
  simplify: 'ai.action.simplify',
  translate: 'ai.action.translate',
  grammar: 'ai.action.grammar',
  summarize: 'ai.action.summarize',
  expand: 'ai.action.expand',
  explain: 'ai.action.explain',
  continue: 'ai.action.continue',
  questions: 'ai.action.questions',
  rubric: 'ai.action.rubric',
}

// Focus trap
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleSubmit()
  }
}

function handleSubmit() {
  if (localPrompt.value.trim()) {
    emit('submit', localPrompt.value.trim())
  }
}

function handleQuickAction(action: AIQuickAction) {
  emit('submit', action, action)
}

// Auto-focus prompt input when panel opens
watch(() => props.state.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => promptInput.value?.focus())
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.isOpen"
      ref="panelRef"
      class="rte-ai-panel"
      role="dialog"
      aria-label="AI Assistant"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }"
    >
      <!-- Quick Actions -->
      <div v-if="!state.response && !state.isLoading" class="rte-ai-panel__actions">
        <button
          v-for="action in quickActions"
          :key="action"
          class="rte-ai-panel__quick-btn"
          :aria-label="quickActionLabels[action]"
          @click="handleQuickAction(action)"
        >
          {{ quickActionLabels[action] }}
        </button>
      </div>

      <!-- Prompt Input -->
      <div v-if="!state.response && !state.isLoading" class="rte-ai-panel__input-area">
        <textarea
          ref="promptInput"
          v-model="localPrompt"
          class="rte-ai-panel__textarea"
          :placeholder="state.mode === 'transform' ? 'How should I change this text?' : 'What should I write?'"
          rows="2"
          @keydown.enter.ctrl.prevent="handleSubmit"
          @keydown.enter.meta.prevent="handleSubmit"
        />
        <button
          class="rte-ai-panel__submit-btn"
          :disabled="!localPrompt.trim()"
          @click="handleSubmit"
        >
          Submit ↵
        </button>
      </div>

      <!-- Loading -->
      <div v-if="state.isLoading" class="rte-ai-panel__loading" aria-live="polite">
        <span class="rte-ai-panel__spinner" />
        Generating...
      </div>

      <!-- Response -->
      <div v-if="state.response" class="rte-ai-panel__response">
        <div
          class="rte-ai-panel__response-content"
          v-html="state.response.format === 'html' ? state.response.content : undefined"
          v-text="state.response.format === 'text' ? state.response.content : undefined"
        />
        <div class="rte-ai-panel__response-actions">
          <button class="rte-ai-panel__btn rte-ai-panel__btn--accept" @click="emit('accept')">✓ Accept</button>
          <button class="rte-ai-panel__btn rte-ai-panel__btn--edit" @click="emit('acceptAndEdit')">✎ Accept & Edit</button>
          <button class="rte-ai-panel__btn rte-ai-panel__btn--reject" @click="emit('reject')">✗ Reject</button>
          <button class="rte-ai-panel__btn rte-ai-panel__btn--retry" @click="emit('retry')">↻ Retry</button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="state.error" class="rte-ai-panel__error" role="alert">
        {{ state.error }}
        <button class="rte-ai-panel__btn" @click="emit('retry')">↻ Retry</button>
      </div>
    </div>
  </Teleport>
</template>
```

CSS classes follow BEM naming and use CSS custom properties:
- `.rte-ai-panel` — main container, absolute positioned, uses `--rte-ai-panel-*` variables
- `.rte-ai-panel__actions` — quick action button row
- `.rte-ai-panel__input-area` — prompt input area
- `.rte-ai-panel__response` — response display area
- `.rte-ai-panel__response-actions` — accept/reject/retry buttons
- `.rte-ai-panel__loading` — loading spinner
- `.rte-ai-panel__error` — error display

Accessibility:
- `role="dialog"`, `aria-label="AI Assistant"`
- Focus trap within panel
- `aria-live="polite"` for loading state
- `role="alert"` for errors
- All buttons have text labels (not icon-only)

**Acceptance Criteria:**
- [ ] Panel renders at specified position
- [ ] Quick action buttons displayed when no response
- [ ] Prompt textarea with placeholder text based on mode
- [ ] Submit via button or Ctrl+Enter / Cmd+Enter
- [ ] Loading spinner shown during generation
- [ ] Response content displayed (HTML rendered, text as-is)
- [ ] Accept, Accept & Edit, Reject, Retry buttons functional
- [ ] Escape key closes panel
- [ ] Focus trap: Tab cycles within panel
- [ ] Panel uses Teleport to render at body level
- [ ] All CSS via custom properties for theming
- [ ] `aria-live` announces loading state
- [ ] `role="alert"` for error messages

**Testing:** Write component tests in `tests/unit/components/RTAIPanel.test.ts` — test: rendering in open/closed state, quick action clicks, prompt submission, response display, action button emissions, keyboard events (Escape, Ctrl+Enter), accessibility attributes. Mount with `@vue/test-utils`.

### P4-004: AI Panel Positioning Logic

**Dependencies:** P4-003, P1-009

**Priority:** P4

**Description:** Implement the positioning logic that places the AI panel at the cursor position in the editor, with viewport boundary detection to keep the panel visible. The panel should appear below the cursor (or above if near bottom), and shift horizontally to stay in viewport.

**Files to Create:**
- `src/utils/aiPanelPosition.ts`

**Files to Modify:**
- `src/utils/index.ts` — add export

**Technical Details:**

```typescript
// src/utils/aiPanelPosition.ts
import type { Editor } from '@tiptap/core'

export interface PanelPosition {
  top: number
  left: number
}

const PANEL_WIDTH = 420  // --rte-ai-panel-width default
const PANEL_MAX_HEIGHT = 480  // --rte-ai-panel-max-height default
const OFFSET_Y = 8  // gap between cursor and panel

export function getAIPanelPosition(editor: Editor): PanelPosition {
  const { state } = editor
  const { from, to } = state.selection

  // Get cursor coordinates from ProseMirror
  const coords = editor.view.coordsAtPos(from)

  // Get viewport dimensions
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let top = coords.bottom + OFFSET_Y
  let left = coords.left

  // If panel would overflow bottom, place above cursor
  if (top + PANEL_MAX_HEIGHT > viewportHeight) {
    top = coords.top - PANEL_MAX_HEIGHT - OFFSET_Y
  }

  // If panel would overflow right, shift left
  if (left + PANEL_WIDTH > viewportWidth) {
    left = viewportWidth - PANEL_WIDTH - 16
  }

  // If panel would overflow left, shift right
  if (left < 16) {
    left = 16
  }

  // Ensure top is not negative
  if (top < 16) {
    top = 16
  }

  return { top, left }
}
```

**Acceptance Criteria:**
- [ ] `getAIPanelPosition()` returns `{ top, left }` based on ProseMirror cursor coords
- [ ] Panel positioned below cursor by default (with 8px offset)
- [ ] Panel flips above cursor when near viewport bottom
- [ ] Panel shifts left when near viewport right edge
- [ ] Panel shifts right when near viewport left edge
- [ ] Minimum 16px margin from viewport edges
- [ ] Works with scrolled editor content

**Testing:** Write unit tests in `tests/unit/utils/aiPanelPosition.test.ts` — test: center position, near-bottom flip, near-right shift, near-left shift, edge cases. Mock `editor.view.coordsAtPos` and `window.innerWidth/innerHeight`.

### P4-005: AI CSS Styles

**Dependencies:** P4-003, P1-010

**Priority:** P4

**Description:** Create the CSS styles for the AI panel following Notion-inspired design. All values via CSS custom properties. Includes styles for panel container, quick action buttons, prompt input, response area, action buttons, loading spinner, error state, and the `.rte-ai-inserted` highlight class.

**Files to Create:**
- `src/styles/ai.css`

**Files to Modify:**
- `src/styles/index.css` — import ai.css

**Technical Details:**

```css
/* src/styles/ai.css */

/* CSS Custom Properties (defaults) */
.rte-editor {
  --rte-ai-panel-bg: var(--rte-bg-primary, #ffffff);
  --rte-ai-panel-border: var(--rte-border-color, #e2e8f0);
  --rte-ai-panel-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  --rte-ai-panel-radius: 12px;
  --rte-ai-panel-width: 420px;
  --rte-ai-panel-max-height: 480px;
  --rte-ai-panel-z-index: 50;
  --rte-ai-response-bg: #f8fafc;
  --rte-ai-response-border: #e2e8f0;
  --rte-ai-accent: #6366f1;
  --rte-ai-button-bg: var(--rte-ai-accent);
  --rte-ai-button-hover: #4f46e5;
  --rte-ai-inserted-bg: rgba(99, 102, 241, 0.08);
  --rte-ai-loading-color: var(--rte-ai-accent);
}

/* Panel container */
.rte-ai-panel {
  position: fixed;
  width: var(--rte-ai-panel-width);
  max-height: var(--rte-ai-panel-max-height);
  background: var(--rte-ai-panel-bg);
  border: 1px solid var(--rte-ai-panel-border);
  border-radius: var(--rte-ai-panel-radius);
  box-shadow: var(--rte-ai-panel-shadow);
  z-index: var(--rte-ai-panel-z-index);
  overflow-y: auto;
  padding: 12px;
  font-family: var(--rte-font-family, inherit);
}

/* Quick action buttons row */
.rte-ai-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.rte-ai-panel__quick-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--rte-ai-panel-border);
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  color: var(--rte-text-primary, #1a202c);
  transition: background-color 0.15s, border-color 0.15s;
}

.rte-ai-panel__quick-btn:hover {
  background: var(--rte-ai-response-bg);
  border-color: var(--rte-ai-accent);
}

/* Prompt input */
.rte-ai-panel__textarea {
  width: 100%;
  border: 1px solid var(--rte-ai-panel-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
  background: var(--rte-ai-panel-bg);
  color: var(--rte-text-primary, #1a202c);
}

.rte-ai-panel__textarea:focus {
  outline: none;
  border-color: var(--rte-ai-accent);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.rte-ai-panel__submit-btn {
  margin-top: 6px;
  padding: 6px 16px;
  background: var(--rte-ai-button-bg);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  float: right;
}

.rte-ai-panel__submit-btn:hover {
  background: var(--rte-ai-button-hover);
}

.rte-ai-panel__submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Response area */
.rte-ai-panel__response {
  margin-top: 8px;
  padding: 10px 12px;
  background: var(--rte-ai-response-bg);
  border: 1px solid var(--rte-ai-response-border);
  border-radius: 8px;
}

.rte-ai-panel__response-content {
  font-size: 14px;
  line-height: 1.6;
  max-height: 240px;
  overflow-y: auto;
}

.rte-ai-panel__response-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--rte-ai-response-border);
}

/* Action buttons */
.rte-ai-panel__btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--rte-ai-panel-border);
  font-size: 13px;
  cursor: pointer;
  background: transparent;
  color: var(--rte-text-primary, #1a202c);
}

.rte-ai-panel__btn--accept {
  background: var(--rte-ai-button-bg);
  color: #ffffff;
  border-color: var(--rte-ai-button-bg);
}

.rte-ai-panel__btn--reject {
  color: #ef4444;
  border-color: #fca5a5;
}

/* Loading spinner */
.rte-ai-panel__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  font-size: 14px;
  color: var(--rte-text-secondary, #64748b);
}

.rte-ai-panel__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--rte-ai-panel-border);
  border-top-color: var(--rte-ai-loading-color);
  border-radius: 50%;
  animation: rte-ai-spin 0.8s linear infinite;
}

@keyframes rte-ai-spin {
  to { transform: rotate(360deg); }
}

/* Error */
.rte-ai-panel__error {
  padding: 10px 12px;
  color: #ef4444;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Accept & Edit highlight */
.rte-ai-inserted {
  background: var(--rte-ai-inserted-bg);
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .rte-ai-panel__spinner {
    animation: none;
  }
  .rte-ai-panel {
    transition: none;
  }
}
```

**Acceptance Criteria:**
- [ ] All AI panel styles use CSS custom properties
- [ ] Panel follows Notion-inspired clean minimal design
- [ ] Quick action buttons styled as pill-shaped chips
- [ ] Loading spinner animates (respects `prefers-reduced-motion`)
- [ ] Response area has distinct background
- [ ] Accept button is primary color, Reject is red-tinted
- [ ] `.rte-ai-inserted` highlight class applied to Accept & Edit content
- [ ] Styles imported via `src/styles/index.css`

**Testing:** Visual review — no unit tests needed for CSS. Verify custom properties override correctly by setting `--rte-ai-accent` to different color.

### P4-006: AI Toolbar Button Integration

**Dependencies:** P4-002, P4-003, P4-004, P1-012

**Priority:** P4

**Description:** Wire the AI panel into the RTToolbar. Add an "✨ AI" toolbar button that opens the AI panel. Register the button in the toolbar item mapping so consumers can position it in their toolbar layout.

**Files to Modify:**
- `src/components/RTToolbar.vue` — add `ai` button mapping and click handler
- `src/types/toolbar.ts` — add `'ai'` to `ToolbarItem` union type

**Technical Details:**

In RTToolbar, add `'ai'` to the toolbar item map:

```typescript
const toolbarItemMap: Record<ToolbarItem, ToolbarButtonConfig> = {
  // ... existing items ...
  ai: {
    icon: 'sparkles',  // ✨ icon
    label: 'toolbar.ai',  // i18n key
    action: () => emit('ai:open'),
    isActive: () => aiState.value.isOpen,
    isVisible: () => aiEnabled,
  },
}
```

The RTEditor main component handles the `ai:open` event to call `useAI.open()`.

**Acceptance Criteria:**
- [ ] `'ai'` is a valid `ToolbarItem` value
- [ ] AI toolbar button renders ✨ icon
- [ ] Clicking button opens AI panel
- [ ] Button hidden when AI is disabled (no handler or `enabled: false`)
- [ ] Button shows active state when panel is open
- [ ] Button has accessible label

**Testing:** Write component test verifying button renders, emits event, and hides when disabled.

### P4-007: AI Keyboard Shortcut Integration

**Dependencies:** P4-002, P1-018

**Priority:** P4

**Description:** Register `Ctrl+K` (Windows/Linux) and `Cmd+K` (Mac) keyboard shortcut to open the AI panel at cursor position. Implemented as a TipTap extension keyboard shortcut.

**Files to Create:**
- `src/extensions/AIKeyboardShortcut.ts`

**Technical Details:**

```typescript
// src/extensions/AIKeyboardShortcut.ts
import { Extension } from '@tiptap/core'

export interface AIKeyboardShortcutOptions {
  onTrigger: () => void
}

export const AIKeyboardShortcut = Extension.create<AIKeyboardShortcutOptions>({
  name: 'aiKeyboardShortcut',

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => {
        this.options.onTrigger()
        return true
      },
    }
  },
})
```

The `onTrigger` callback calls `useAI.open()` in RTEditor main component.

**Acceptance Criteria:**
- [ ] `Ctrl+K` opens AI panel on Windows/Linux
- [ ] `Cmd+K` opens AI panel on Mac
- [ ] Shortcut does nothing when AI is disabled
- [ ] Shortcut registered as TipTap extension

**Testing:** Write unit test verifying keyboard shortcut registration and callback invocation.

### P4-008: AI Slash Command Integration

**Dependencies:** P4-002, P2-008

**Priority:** P4

**Description:** Add `/ai` as a slash command option in the existing slash command menu (P2-008). When selected, it opens the AI panel in generate mode at the cursor position.

**Files to Modify:**
- `src/extensions/SlashCommandExtension.ts` — add AI command to the default commands list

**Technical Details:**

Add to the default slash commands list:

```typescript
{
  name: 'ai',
  label: 'slashCommand.ai',  // i18n: "Ask AI"
  icon: 'sparkles',
  description: 'slashCommand.aiDescription',  // i18n: "Generate content with AI"
  category: 'ai',
  action: (editor) => {
    // Emit event or call callback to open AI panel
    editor.commands.openAIPanel?.()
  },
  isVisible: (options) => options.aiEnabled !== false,
}
```

The command should appear under an "AI" category in the slash command menu. Only visible when AI is enabled.

**Acceptance Criteria:**
- [ ] `/ai` appears in slash command menu
- [ ] Selecting it opens AI panel in generate mode
- [ ] Hidden when AI is disabled
- [ ] Has ✨ icon and descriptive label
- [ ] Localized label (en + zh-TW)

**Testing:** Write test verifying `/ai` command appears and triggers AI panel open.

### P4-009: AI Bubble Menu Integration

**Dependencies:** P4-002, P1-014

**Priority:** P4

**Description:** Add "Ask AI" option to the RTBubbleMenu that appears on text selection. When clicked, it opens the AI panel in transform mode with the selected text as context.

**Files to Modify:**
- `src/components/RTBubbleMenu.vue` — add "Ask AI" button

**Technical Details:**

Add an AI button to RTBubbleMenu:

```vue
<button
  v-if="aiEnabled"
  class="rte-bubble-menu__btn rte-bubble-menu__btn--ai"
  :aria-label="t('bubbleMenu.askAI')"
  @click="emit('ai:transform')"
>
  ✨ {{ t('bubbleMenu.askAI') }}
</button>
```

The RTEditor main component handles `ai:transform` to call `useAI.open('transform')`.

**Acceptance Criteria:**
- [ ] "Ask AI" button appears in bubble menu when text is selected
- [ ] Clicking opens AI panel in transform mode
- [ ] Selected text is captured as context
- [ ] Hidden when AI is disabled
- [ ] Has ✨ icon and accessible label

**Testing:** Write component test verifying button renders in bubble menu and emits event.

### P4-010: Pre-built AI Handler Factories

**Dependencies:** P4-001

**Priority:** P4

**Description:** Create two pre-built AI handler factory functions shipped as a separate tree-shakeable entry point. `createProxyAIHandler` for generic proxy endpoints. `createDKIAIHandler` for DKI-specific integration (auto CSRF, Axios).

**Files to Create:**
- `src/ai-handlers/proxyHandler.ts`
- `src/ai-handlers/dkiHandler.ts`
- `src/ai-handlers/index.ts` (barrel export)

**Files to Modify:**
- `package.json` — add `./ai-handlers` export map entry
- `tsup.config.ts` — add `src/ai-handlers/index.ts` as separate entry point

**Technical Details:**

`src/ai-handlers/proxyHandler.ts`:

```typescript
import type { AIHandler, AIRequest, AIResponse } from '../types/ai'

export interface ProxyAIHandlerOptions {
  /** URL of the AI proxy endpoint */
  endpoint: string
  /** Additional headers (e.g., Authorization) */
  headers?: Record<string, string>
  /** Transform AIRequest before sending (optional) */
  transformRequest?: (request: AIRequest) => any
  /** Transform raw response into AIResponse (optional) */
  transformResponse?: (response: any) => AIResponse
}

export function createProxyAIHandler(options: ProxyAIHandlerOptions): AIHandler {
  return {
    async generate(request: AIRequest): Promise<AIResponse> {
      const body = options.transformRequest
        ? options.transformRequest(request)
        : request

      const response = await fetch(options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      return options.transformResponse
        ? options.transformResponse(data)
        : data as AIResponse
    },
  }
}
```

`src/ai-handlers/dkiHandler.ts`:

```typescript
import type { AIHandler, AIRequest, AIResponse } from '../types/ai'

export interface DKIAIHandlerOptions {
  /** Laravel API endpoint (default: '/api/rteditor/ai') */
  endpoint?: string
  /** Axios instance (default: window.axios) */
  axiosInstance?: any
}

export function createDKIAIHandler(options: DKIAIHandlerOptions = {}): AIHandler {
  const endpoint = options.endpoint || '/api/rteditor/ai'

  function getAxios() {
    return options.axiosInstance || (window as any).axios
  }

  return {
    async generate(request: AIRequest): Promise<AIResponse> {
      const axios = getAxios()
      if (!axios) {
        throw new Error('Axios not available. Provide axiosInstance option or ensure window.axios exists.')
      }

      // DKI's Axios already has CSRF token configured via bootstrap.js
      const response = await axios.post(endpoint, {
        prompt: request.prompt,
        selectedText: request.selectedText || '',
        surroundingText: request.surroundingText || '',
        documentText: request.documentText || '',
        action: request.action || null,
        locale: request.locale || 'en',
        metadata: request.metadata || {},
      })

      return {
        content: response.data.content,
        format: response.data.format || 'text',
        metadata: response.data.metadata,
      }
    },
  }
}
```

`src/ai-handlers/index.ts`:

```typescript
export { createProxyAIHandler, type ProxyAIHandlerOptions } from './proxyHandler'
export { createDKIAIHandler, type DKIAIHandlerOptions } from './dkiHandler'
```

Package.json export map addition:

```json
"./ai-handlers": {
  "import": "./dist/ai-handlers.mjs",
  "require": "./dist/ai-handlers.cjs",
  "types": "./dist/ai-handlers.d.ts"
}
```

**Acceptance Criteria:**
- [ ] `createProxyAIHandler()` makes fetch POST to specified endpoint
- [ ] Proxy handler supports custom headers and request/response transformers
- [ ] `createDKIAIHandler()` uses Axios with auto CSRF (via DKI's `window.axios`)
- [ ] DKI handler defaults to `/api/rteditor/ai` endpoint
- [ ] DKI handler accepts custom Axios instance
- [ ] Both handlers implement `AIHandler` interface
- [ ] AI handlers are tree-shakeable (separate entry point `@timothyphchan/rteditor/ai-handlers`)
- [ ] Not included in core bundle — zero impact when unused
- [ ] Errors throw with descriptive messages
- [ ] TypeScript types properly exported

**Testing:** Write unit tests in `tests/unit/ai-handlers/proxyHandler.test.ts` and `dkiHandler.test.ts` — test: successful request/response, error handling, custom headers, CSRF detection, transform functions. Mock `fetch` and `axios`.

### P4-011: AI i18n Strings

**Dependencies:** P4-003, P2-009

**Priority:** P4

**Description:** Add English (en) and Traditional Chinese (zh-TW) translation strings for all AI panel UI text: toolbar button, quick action labels, prompt placeholders, action buttons, loading text, error messages.

**Files to Modify:**
- `src/i18n/en.ts` — add AI-related strings
- `src/i18n/zh-TW.ts` — add AI-related strings

**Technical Details:**

English strings:

```typescript
ai: {
  toolbar: 'AI Assistant',
  action: {
    simplify: 'Simplify',
    translate: 'Translate',
    grammar: 'Fix Grammar',
    summarize: 'Summarize',
    expand: 'Expand',
    explain: 'Explain',
    continue: 'Continue Writing',
    questions: 'Generate Questions',
    rubric: 'Create Rubric',
  },
  prompt: {
    generatePlaceholder: 'What should I write?',
    transformPlaceholder: 'How should I change this text?',
  },
  button: {
    submit: 'Submit',
    accept: 'Accept',
    acceptEdit: 'Accept & Edit',
    reject: 'Reject',
    retry: 'Retry',
  },
  loading: 'Generating...',
  error: {
    noHandler: 'No AI handler configured',
    failed: 'AI generation failed',
    blocked: 'Response blocked by content filter',
  },
  bubbleMenu: 'Ask AI',
  slashCommand: 'Ask AI',
  slashCommandDescription: 'Generate content with AI',
}
```

Traditional Chinese strings:

```typescript
ai: {
  toolbar: 'AI 助手',
  action: {
    simplify: '簡化',
    translate: '翻譯',
    grammar: '修正文法',
    summarize: '摘要',
    expand: '擴展',
    explain: '解釋',
    continue: '繼續寫作',
    questions: '生成問題',
    rubric: '建立評量標準',
  },
  prompt: {
    generatePlaceholder: '需要我寫什麼？',
    transformPlaceholder: '需要如何修改這段文字？',
  },
  button: {
    submit: '提交',
    accept: '接受',
    acceptEdit: '接受並編輯',
    reject: '拒絕',
    retry: '重試',
  },
  loading: '生成中...',
  error: {
    noHandler: '未設定 AI 處理器',
    failed: 'AI 生成失敗',
    blocked: '回應已被內容過濾器封鎖',
  },
  bubbleMenu: '詢問 AI',
  slashCommand: '詢問 AI',
  slashCommandDescription: '使用 AI 生成內容',
}
```

**Acceptance Criteria:**
- [ ] All AI panel text uses i18n keys (no hardcoded strings in components)
- [ ] English translations complete and natural
- [ ] Traditional Chinese translations complete and natural
- [ ] Keys follow existing i18n naming convention
- [ ] Quick action labels localized
- [ ] Error messages localized

**Testing:** Write tests verifying all AI i18n keys exist in both locale files and none are missing.

### P4-012: RTEditor Main — AI Integration

**Dependencies:** P4-002, P4-003, P4-004, P4-005, P4-006, P4-007

**Priority:** P4

**Description:** Wire everything together in the RTEditor main component. Add `ai-handler` and `ai-options` props, initialize `useAI` composable, render RTAIPanel, connect toolbar/bubble menu/keyboard events, and handle accept/reject actions.

**Files to Modify:**
- `src/components/RTEditor.vue` — add AI props, composable, panel rendering, event handlers

**Technical Details:**

Add to RTEditor props:

```typescript
const props = defineProps<{
  // ... existing props ...
  aiHandler?: AIHandler
  aiOptions?: Omit<AIOptions, 'handler'>
}>()
```

In setup, initialize useAI:

```typescript
const aiOptionsRef = computed<AIOptions>(() => ({
  ...props.aiOptions,
  handler: props.aiHandler ? { generate: props.aiHandler.generate } : undefined,
}))

const ai = useAI(editorRef, aiOptionsRef)
const aiPanelPosition = computed(() => {
  if (!ai.state.value.isOpen || !editorRef.value) return { top: 0, left: 0 }
  return getAIPanelPosition(editorRef.value)
})
```

In template, add RTAIPanel:

```vue
<RTAIPanel
  :state="ai.state.value"
  :quick-actions="aiOptionsRef.quickActions ?? ['simplify', 'translate', 'grammar', 'summarize']"
  :position="aiPanelPosition"
  @submit="ai.submit"
  @accept="ai.accept"
  @accept-and-edit="ai.acceptAndEdit"
  @reject="ai.reject"
  @retry="ai.retry"
  @close="ai.close"
/>
```

Connect toolbar `ai:open` event to `ai.open()`.
Connect bubble menu `ai:transform` event to `ai.open('transform')`.
Register `AIKeyboardShortcut` extension with `onTrigger: () => ai.open()`.

**Acceptance Criteria:**
- [ ] `ai-handler` prop accepts `AIHandler` object
- [ ] `ai-options` prop accepts `AIOptions` configuration
- [ ] AI panel renders when `ai.state.isOpen` is true
- [ ] Toolbar AI button → opens panel in generate mode
- [ ] Bubble menu "Ask AI" → opens panel in transform mode
- [ ] `Ctrl+K` / `Cmd+K` → opens panel
- [ ] Accept inserts content into editor
- [ ] Accept & Edit inserts with highlight
- [ ] Reject closes panel
- [ ] Retry re-runs prompt
- [ ] AI panel positioned at cursor location
- [ ] AI completely absent when no handler provided (tree-shaking)
- [ ] Preset `enabled: false` hides all AI entry points

**Testing:** Write integration tests in `tests/unit/components/RTEditor-ai.test.ts` — test: AI panel opens via each entry point, submit/accept/reject flow, handler called with correct context, disabled state hides all entry points. Mock AI handler.