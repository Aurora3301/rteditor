# @timothyphchan/rteditor

> Education-focused rich text editor for Vue 3, built on TipTap/ProseMirror

[![CI](https://github.com/timothyphchan/rteditor/actions/workflows/test.yml/badge.svg)](https://github.com/timothyphchan/rteditor/actions)
[![npm version](https://img.shields.io/npm/v/@timothyphchan/rteditor.svg)](https://www.npmjs.com/package/@timothyphchan/rteditor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-ready, Notion-inspired rich text editor component for Vue 3. Designed for educational platforms with built-in math equation support, image uploads, HTML sanitization, and full theming via CSS custom properties.

## Features

- ✨ **Rich text editing** — Bold, italic, underline, strikethrough, headings (H1–H6), bullet & ordered lists, text alignment, horizontal rules, subscript, superscript
- 🔗 **Link insertion** — Dialog with URL validation, edit & remove from bubble menu
- 🖼️ **Image upload** — Drag & drop, paste, click to upload with configurable size limits
- 📐 **Math equations** — KaTeX rendering for inline and block math (lazy-loaded for performance)
- 🤖 **AI Assistant** — Notion/Cursor-style AI panel with local LLaMA support (Ollama), quick actions, and custom prompts
- 🎨 **Theming** — 20+ CSS custom properties, Notion-inspired defaults, dark mode via props
- ♿ **Accessible** — ARIA attributes, keyboard navigation, focus trap, `:focus-visible` indicators
- 📦 **Lightweight** — ~14.6 KB gzip total (JS + CSS), tree-shakeable exports
- 🔒 **Secure** — HTML sanitization via DOMPurify
- 📝 **TypeScript** — Full type definitions with zero `any` types

## Installation

```bash
npm install @timothyphchan/rteditor
```

### Peer Dependencies

| Package | Version |
|---------|---------|
| `vue` | ^3.3.0 |

All other dependencies (TipTap, DOMPurify, KaTeX) are bundled — no extra installs needed.

## Quick Start

```vue
<script setup>
import { ref } from 'vue'
import { RTEditor, basePreset } from '@timothyphchan/rteditor'
import '@timothyphchan/rteditor/style.css'

const content = ref('<p>Hello World</p>')
</script>

<template>
  <RTEditor v-model="content" :preset="basePreset" />
</template>
```

> **Important:** You must import `@timothyphchan/rteditor/style.css` for the editor to render correctly.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | HTML content (v-model) |
| `preset` | `EditorPreset` | `basePreset` | Editor configuration preset |
| `extensions` | `Extensions` | — | Override preset extensions |
| `toolbar` | `ToolbarConfig` | — | Override preset toolbar items |
| `placeholder` | `string` | — | Placeholder text |
| `readonly` | `boolean` | `false` | Read-only mode |
| `editable` | `boolean` | `true` | Whether content is editable |
| `autofocus` | `boolean` | `false` | Focus editor on mount |
| `uploadHandler` | `UploadHandler` | — | Async function to handle file uploads |
| `fileSizeLimits` | `Partial<FileSizeLimits>` | `{ image: 5MB, pdf: 1MB, document: 1MB }` | File size limits per type |
| `theme` | `ThemeConfig` | — | Theme configuration |
| `aiHandler` | `AIHandler` | — | AI handler for content generation |
| `aiOptions` | `AIOptions` | — | AI configuration (context level, quick actions) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | HTML content changed |
| `update:json` | `JSONContent` | JSON content changed |
| `focus` | — | Editor focused |
| `blur` | — | Editor blurred |
| `create` | `Editor` | Editor instance created |
| `destroy` | — | Editor destroyed |

## Upload Handler

Provide an async function that uploads a file and returns a URL:

```typescript
import type { UploadHandler } from '@timothyphchan/rteditor'

const uploadHandler: UploadHandler = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  return { url: data.url, alt: file.name }
}
```

The handler must return an `UploadResult`:

```typescript
interface UploadResult {
  url: string
  alt?: string
  title?: string
  filename?: string
  filesize?: number
}
```

### Laravel Example

```typescript
const uploadHandler: UploadHandler = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await window.axios.post('/api/upload', formData)
  return { url: data.url, alt: data.original_name }
}
```

### Full Example with Upload

```vue
<script setup>
import { ref } from 'vue'
import { RTEditor, basePreset } from '@timothyphchan/rteditor'
import '@timothyphchan/rteditor/style.css'

const content = ref('')

const uploadHandler = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const data = await res.json()
  return { url: data.url, alt: file.name }
}
</script>

<template>
  <RTEditor
    v-model="content"
    :preset="basePreset"
    :upload-handler="uploadHandler"
    placeholder="Start writing..."
  />
</template>
```

## AI Assistant

RTEditor includes a Notion/Cursor-style AI assistant panel for content generation and transformation.

### Quick Start with Local LLaMA (Ollama)

```vue
<script setup>
import { ref } from 'vue'
import { RTEditor, basePreset, createLlamaAIHandler } from '@timothyphchan/rteditor'
import '@timothyphchan/rteditor/style.css'

const content = ref('')

// Connect to local Ollama server
const aiHandler = createLlamaAIHandler({
  endpoint: 'http://localhost:11434/api/generate',
  model: 'llama3.2',  // or: mistral, codellama, deepseek-r1, etc.
  systemPrompt: 'You are a helpful writing assistant.',
  timeout: 120000,  // 2 minutes
})

// Add 'ai' button to toolbar
const preset = {
  ...basePreset,
  toolbar: [...basePreset.toolbar, '|', 'ai'],
}
</script>

<template>
  <RTEditor
    v-model="content"
    :preset="preset"
    :ai-handler="aiHandler"
    :ai-options="{
      contextLevel: 'standard',
      quickActions: ['simplify', 'grammar', 'summarize', 'expand', 'translate'],
    }"
  />
</template>
```

### Prerequisites (Ollama)

```bash
# Install Ollama
brew install ollama  # macOS
# or visit https://ollama.ai for other platforms

# Pull a model
ollama pull llama3.2

# Start server (usually runs automatically)
ollama serve
```

### AI Handler Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `endpoint` | `string` | `http://localhost:11434/api/generate` | Ollama API endpoint |
| `model` | `string` | `llama3.2` | Model name |
| `systemPrompt` | `string` | — | System prompt prepended to requests |
| `timeout` | `number` | `60000` | Request timeout in ms |

### AI Options (Props)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contextLevel` | `'minimal' \| 'standard' \| 'full'` | `'standard'` | How much context to send |
| `quickActions` | `AIQuickAction[]` | All actions | Quick action buttons to show |
| `maxContextLength` | `number` | `4000` | Max characters of context |
| `systemPrompt` | `string` | — | Additional system prompt |
| `enabled` | `boolean` | `true` | Enable/disable AI feature |

### Quick Actions

| Action | Description |
|--------|-------------|
| `simplify` | Simplify selected text |
| `grammar` | Fix grammar and spelling |
| `summarize` | Summarize content |
| `expand` | Expand with more detail |
| `translate` | Translate to another language |
| `explain` | Explain the content |
| `continue` | Continue writing |
| `questions` | Generate questions |
| `rubric` | Create a rubric |

### How to Use

1. **Toolbar Button** — Click the ✨ AI button
2. **Keyboard Shortcut** — Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
3. **Bubble Menu** — Select text and click "Ask AI"
4. **Slash Command** — Type `/ai` in the editor

### Custom AI Handler (OpenAI, Anthropic, etc.)

```typescript
import { createProxyAIHandler } from '@timothyphchan/rteditor'

const aiHandler = createProxyAIHandler({
  endpoint: '/api/ai/generate',
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
  transformRequest: (request) => ({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful writing assistant.' },
      { role: 'user', content: request.prompt },
    ],
  }),
  transformResponse: (response) => ({
    content: response.choices[0].message.content,
  }),
})
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + B` | Bold |
| `Ctrl/⌘ + I` | Italic |
| `Ctrl/⌘ + U` | Underline |
| `Ctrl/⌘ + Shift + S` | Strikethrough |
| `Ctrl/⌘ + K` | Open AI Assistant |
| `Ctrl/⌘ + Z` | Undo |
| `Ctrl/⌘ + Shift + Z` | Redo |
| `F11` | Toggle fullscreen |
| `Escape` | Exit fullscreen / Close dialog |

## Theming

### CSS Custom Properties

Override any of the 20+ CSS custom properties to match your design:

```css
.rte-editor {
  --rte-font-family: 'Inter', sans-serif;
  --rte-font-size: 16px;
  --rte-text: #1a1a2e;
  --rte-background: #ffffff;
  --rte-border: #e2e8f0;
  --rte-primary: #2563eb;
  --rte-toolbar-bg: #f8fafc;
  --rte-radius-lg: 8px;
}
```

### Theme via Props (Dark Mode Example)

```vue
<RTEditor
  v-model="content"
  :preset="basePreset"
  :theme="{
    name: 'dark',
    variables: {
      '--rte-background': '#1a1a2e',
      '--rte-text': '#e2e8f0',
      '--rte-editor-bg': '#1a1a2e',
      '--rte-toolbar-bg': '#111827',
      '--rte-border': '#374151',
    },
  }"
/>
```

### All CSS Custom Properties

| Category | Properties |
|----------|-----------|
| **Colors** | `--rte-primary`, `--rte-primary-hover`, `--rte-primary-light`, `--rte-text`, `--rte-text-secondary`, `--rte-text-placeholder`, `--rte-background`, `--rte-border`, `--rte-border-hover`, `--rte-focus`, `--rte-error`, `--rte-success`, `--rte-warning` |
| **Typography** | `--rte-font-family`, `--rte-font-size`, `--rte-line-height`, `--rte-font-size-sm`, `--rte-font-size-xs` |
| **Spacing** | `--rte-spacing-xs` (4px), `--rte-spacing-sm` (8px), `--rte-spacing-md` (16px), `--rte-spacing-lg` (24px), `--rte-spacing-xl` (32px) |
| **Border Radius** | `--rte-radius` (6px), `--rte-radius-sm` (4px), `--rte-radius-lg` (8px) |
| **Toolbar** | `--rte-toolbar-bg`, `--rte-toolbar-border`, `--rte-toolbar-height`, `--rte-toolbar-button-size` |
| **Editor** | `--rte-editor-bg`, `--rte-editor-padding`, `--rte-editor-max-width`, `--rte-editor-min-height` |

See [`src/themes/default.css`](src/themes/default.css) for the complete list.

## API Reference

### Components

| Component | Description |
|-----------|-------------|
| `RTEditor` | Main editor component — use this in your templates |
| `RTToolbar` | Toolbar with formatting buttons (used internally by RTEditor) |
| `RTBubbleMenu` | Floating menu on text selection (used internally) |
| `RTLinkDialog` | Link insertion/edit dialog (used internally) |
| `RTImageUpload` | Image upload with drag & drop (used internally) |
| `RTAIPanel` | AI assistant floating panel (used internally) |
| `RTToast` | Toast notification (used internally) |

### Composables

| Composable | Description |
|------------|-------------|
| `useEditor(options)` | Create and manage a TipTap editor instance |
| `useTheme(config?)` | Theme management — `currentTheme`, `applyTheme`, `setTheme` |
| `useUpload(handler?, limits?)` | File upload with validation and reactive state |
| `useAI(editor, options)` | AI assistant state and actions — `open`, `close`, `submit`, `accept`, `reject` |

### Utilities

| Function | Signature | Description |
|----------|-----------|-------------|
| `sanitizeHTML` | `(html: string) => string` | Sanitize HTML via DOMPurify |
| `stripAllHTML` | `(html: string) => string` | Remove all HTML tags |
| `exportHTML` | `(editor: Editor) => string` | Export sanitized HTML from editor |
| `exportRawHTML` | `(editor: Editor) => string` | Export raw HTML from editor |
| `exportJSON` | `(editor: Editor) => JSONContent` | Export ProseMirror JSON |
| `validateJSON` | `(json: unknown) => boolean` | Validate ProseMirror JSON structure |
| `getAIPanelPosition` | `(editor: Editor) => { top, left }` | Calculate AI panel position at cursor |

### Extensions

| Extension | Description |
|-----------|-------------|
| `MathExtension` | KaTeX math equations — inline (`$...$`) and block (`$$...$$`) |
| `ImageUploadExtension` | Drag-and-drop image upload with progress placeholder |
| `AIKeyboardShortcut` | Registers Cmd/Ctrl+K shortcut for AI panel |

### AI Handlers

| Factory Function | Description |
|------------------|-------------|
| `createLlamaAIHandler(options)` | Connect to local Ollama/llama.cpp server |
| `createProxyAIHandler(options)` | Generic proxy for any AI backend (OpenAI, Anthropic, etc.) |
| `createDKIAIHandler(options)` | DKI/Laravel-specific handler with Axios CSRF |

### Presets

| Preset | Included Extensions |
|--------|-------------------|
| `basePreset` | StarterKit (headings 1–6, undo/redo depth 100), Underline, Link, Image, TextAlign, Subscript, Superscript, Placeholder, HorizontalRule |

### Types

All types are exported from the package entry point:

```typescript
import type {
  RTEditorProps,
  RTEditorEmits,
  ToolbarItem,
  ToolbarConfig,
  EditorPreset,
  MenuBarConfig,
  BubbleMenuConfig,
  ThemeConfig,
  UploadHandler,
  UploadResult,
  FileCategory,
  FileSizeLimits,
  UseEditorOptions,
  MathExtensionOptions,
  ImageUploadOptions,
  // AI Types
  AIHandler,
  AIRequest,
  AIResponse,
  AIOptions,
  AIState,
  AIQuickAction,
  AIContextLevel,
  AIMetadata,
} from '@timothyphchan/rteditor'
```

### Constants

```typescript
import {
  DEFAULT_FILE_SIZE_LIMITS,  // { image: 5MB, pdf: 1MB, document: 1MB }
  IMAGE_MIME_TYPES,           // ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  PDF_MIME_TYPES,             // ['application/pdf']
  DOCUMENT_MIME_TYPES,        // Word, Excel, PPT mime types
  getFileCategory,            // (mimeType: string) => FileCategory
} from '@timothyphchan/rteditor'
```

## Build Output

| File | Size | Gzip |
|------|------|------|
| `dist/index.mjs` | 42.49 KB | 11.43 KB |
| `dist/index.cjs` | 32.69 KB | 10.24 KB |
| `dist/style.css` | 15.10 KB | 3.21 KB |
| `dist/index.d.ts` | Full types | — |
| **Total** | — | **~14.6 KB** |

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |

## Development

```bash
git clone https://github.com/timothyphchan/rteditor.git
cd rteditor
npm install
npm test          # 130 tests
npm run build     # Build to dist/
npm run dev       # Demo app on port 3000
```

## License

[MIT](LICENSE) © timothyphchan