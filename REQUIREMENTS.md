# Requirements Document: @timothyphchan/rteditor

**Version:** 1.7
**Date:** 2026-02-16
**Status:** Approved for Implementation

---

## 1. Project Overview

### 1.1 Product Identity

- **Package Name:** `@timothyphchan/rteditor`
- **Product Name:** RTEditor (Rich Text Editor)
- **Type:** Headless rich text editor with beautiful default theme
- **Starting Version:** 0.1.0
- **License:** MIT (recommended for npm packages)

### 1.2 Positioning Statement

> "Education-focused TipTap extension kit with beautiful defaults for teacher feedback and student collaboration"

RTEditor is a design-focused, headless rich text editor built on TipTap/ProseMirror, specifically tailored for educational use cases. It provides a beautiful default theme out-of-the-box while maintaining full customization capabilities for developers building PHP+Vue education systems.

### 1.3 Differentiators

- **Design-First Approach:** Beautiful default theme that works immediately without configuration
- **Education-Focused:** Purpose-built presets for teacher feedback and student collaboration
- **Headless + Opinionated:** Flexibility of headless architecture with opinionated beautiful defaults
- **Backend-Agnostic:** Configurable upload handlers work with any PHP/backend system
- **Composable:** Mix and match features through preset configurations

### 1.4 Target Audience

**Primary Consumers:** Developers building PHP+Vue education systems

**End Users:**
- Teachers (lesson planning, student feedback, annotations)
- Students (society jot notes, collaborative note-taking)

### 1.5 Distribution

- **Installation:** `npm install @timothyphchan/rteditor`
- **Registry:** npm public registry
- **Scope:** `@timothyphchan` (scoped package)

---

## 2. User Roles & Use Cases

### 2.1 Teacher Role

#### Use Case 1: Teacher Comment Bubbles
**As a teacher**, I want to annotate and comment on student work so that I can provide detailed, contextual feedback.

**Acceptance Criteria:**
- Select text in student submission and add inline comments
- View all comments in a sidebar or floating bubble
- Reply to student questions within comment threads
- Highlight important sections with visual markers
- Export annotated work with comments visible

#### Use Case 2: Lesson Plan Creation
**As a teacher**, I want to create rich lesson plans with formatting, images, and equations so that I can organize and share teaching materials.

**Acceptance Criteria:**
- Format text with headings, lists, bold, italic
- Insert mathematical equations using LaTeX
- Upload and position images within the lesson plan
- Save lesson plans in HTML/JSON format
- Use templates to speed up lesson plan creation

### 2.2 Student Role

#### Use Case 3: Society Jot Notes
**As a student**, I want to take quick notes during society meetings so that I can capture key points and action items.

**Acceptance Criteria:**
- Quickly format notes with lists and headings
- Add checkboxes for action items
- Insert images or diagrams
- Auto-save notes to prevent data loss
- Export notes for sharing with other members

#### Use Case 4: Collaborative Note-Taking
**As a student**, I want to collaborate with peers on shared notes so that we can build comprehensive study materials together.

**Acceptance Criteria:**
- Multiple students can edit the same document (Phase 3)
- See who made which changes
- Add comments and questions for clarification
- Highlight important sections

---

## 3. Technical Stack

### 3.1 Core Technologies

| Technology | Choice | Justification |
|------------|--------|---------------|
| **Framework** | Vue 3 | Target audience uses PHP+Vue; Composition API for better TypeScript support |
| **Editor Engine** | TipTap | Modern, extensible, built on ProseMirror; excellent Vue integration |
| **Language** | TypeScript | Type safety, better DX, industry standard for npm packages |
| **Build Tool** | tsup | Fast, zero-config bundler for TypeScript libraries |
| **Module Format** | Dual ESM + CJS | Maximum compatibility with modern and legacy build systems |
| **CSS Strategy** | Plain CSS + Custom Properties | No preprocessor dependencies; easy theming via CSS variables |
| **Math Rendering** | KaTeX | Faster than MathJax; widely used in education |

### 3.2 Development Dependencies

- **Testing:** Vitest (fast, Vite-native)
- **Linting:** ESLint + TypeScript ESLint
- **Formatting:** Prettier
- **Type Checking:** TypeScript compiler
- **Documentation:** Markdown (README, guides)

### 3.3 Peer Dependencies

```json
{
  "vue": "^3.3.0",
  "@tiptap/vue-3": "^2.x",
  "@tiptap/pm": "^2.x"
}
```

### 3.4 Runtime Dependencies

- `@tiptap/core`
- `@tiptap/starter-kit`
- `@tiptap/extension-*` (specific extensions as needed)
- `katex` (for LaTeX math)
- Additional TipTap extensions as features are added

---

## 4. Architecture

### 4.1 Component Architecture

```
@timothyphchan/rteditor
├── Core Components
│   ├── RTEditor (base component)
│   ├── RTToolbar (toolbar UI)
│   ├── RTMenuBar (menu bar UI)
│   └── RTBubbleMenu (floating menu)
├── Presets
│   ├── teacherPreset (teacher-focused configuration)
│   ├── studentPreset (student-focused configuration)
│   └── basePreset (minimal configuration)
├── Extensions
│   ├── MathExtension (LaTeX support)
│   ├── ImageUploadExtension (image handling)
│   ├── FileAttachmentExtension (PDF preview + document download cards, Phase 2)
│   ├── CommentExtension (Phase 2)
│   └── Custom extension support
├── Composables
│   ├── useEditor (editor instance management)
│   ├── useUpload (upload handler logic)
│   └── useTheme (theme customization)
└── Utilities
    ├── exportHTML
    ├── exportJSON
    └── sanitizeContent
```

### 4.2 Composable Preset System

**Design Pattern:** Configuration objects that define editor behavior

```typescript
// Example usage
import { RTEditor, teacherPreset, studentPreset } from '@timothyphchan/rteditor'

// Use preset
<RTEditor :preset="teacherPreset" />

// Customize preset
<RTEditor :preset="{ ...teacherPreset, extensions: [...teacherPreset.extensions, customExt] }" />

// Build from scratch
<RTEditor :extensions="[...]" :toolbar="[...]" />
```

**Preset Structure:**
```typescript
interface EditorPreset {
  extensions: Extension[]
  toolbar: ToolbarConfig
  menuBar?: MenuBarConfig
  bubbleMenu?: BubbleMenuConfig
  theme?: ThemeConfig
  placeholder?: string
  editorProps?: Record<string, any>
}
```

### 4.3 Extension System

**Built-in Extensions (Phase 1):**
- StarterKit (basic formatting)
- Heading
- BulletList / OrderedList
- Link
- Image (with upload handler)
- Mathematics (LaTeX via KaTeX)
- History (undo/redo)

**Custom Extension Support:**
Consumers can add any TipTap extension:
```typescript
import { CustomExtension } from 'some-tiptap-extension'

<RTEditor :extensions="[...basePreset.extensions, CustomExtension]" />
```

### 4.4 Upload Handler Interface

**Design:** Callback-based, backend-agnostic, unified for all file types

RTEditor uses a **single upload handler** for all file types (images, PDFs, documents). The handler is provided by the consumer and RTEditor determines how to display the uploaded file based on its MIME type.

```typescript
interface UploadHandler {
  (file: File): Promise<UploadResult>
}

interface UploadResult {
  url: string
  alt?: string
  title?: string
  filename?: string   // Original file name (for download cards)
  filesize?: number   // File size in bytes (for download cards)
}

// File type categories (determined by RTEditor client-side)
type FileCategory = 'image' | 'pdf' | 'document'

// How each category is displayed in the editor:
// - image:    Inline image with resize handles and alignment
// - pdf:      Inline preview via <iframe> with fallback download link
// - document: Styled download card (file name, size, icon)
```

**File Size Limits (client-side, configurable):**
| Category | Default Limit | Allowed MIME Types |
|----------|--------------|-------------------|
| Image | 5 MB | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| PDF | 1 MB | `application/pdf` |
| Document | 1 MB | `application/msword`, `application/vnd.openxmlformats-officedocument.*`, `application/vnd.ms-excel`, `application/vnd.ms-powerpoint` |

```typescript
// Consumer implementation (single handler for all file types)
const handleUpload: UploadHandler = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()
  return {
    url: data.url,
    filename: file.name,
    filesize: file.size
  }
}

<RTEditor :upload-handler="handleUpload" />
```

**Unified "Attach File" Button:**
The toolbar provides a single **attach file** button that opens a file picker accepting all supported types. RTEditor inspects the selected file's MIME type and renders it accordingly (inline image, PDF preview, or download card).

**Security Rationale:**
- Consumer controls authentication, authorization, validation
- Works with any PHP backend (Laravel, Symfony, etc.)
- No hardcoded backend assumptions
- Consumer can implement virus scanning, file type validation, etc.
- Client-side size/type checks are UX only — server must re-validate

---

## 5. Feature Requirements

### 5.1 Phase 1 — MVP (Target: v0.1.0)

#### 5.1.1 Basic Formatting
**Priority:** P0 (Must Have)

- **Bold** (Ctrl+B / Cmd+B)
- **Italic** (Ctrl+I / Cmd+I)
- **Underline** (Ctrl+U / Cmd+U)
- **Strikethrough** (Ctrl+Shift+X / Cmd+Shift+X)

**Acceptance Criteria:**
- Toolbar buttons toggle formatting
- Keyboard shortcuts work
- Formatting persists in HTML/JSON output
- Multiple formats can be combined

#### 5.1.2 Headings
**Priority:** P0 (Must Have)

- H1 through H6
- Keyboard shortcuts (Ctrl+Alt+1 through Ctrl+Alt+6)
- Dropdown selector in toolbar

**Acceptance Criteria:**
- Headings render with appropriate semantic HTML
- Visual hierarchy is clear in default theme
- Can convert paragraph to heading and vice versa

#### 5.1.3 Lists
**Priority:** P0 (Must Have)

- Unordered lists (bullet points)
- Ordered lists (numbered)
- Nested lists (indent/outdent)
- Keyboard shortcuts (Ctrl+Shift+8 for bullets, Ctrl+Shift+9 for numbers)

**Acceptance Criteria:**
- Tab key indents list items
- Shift+Tab outdents
- Enter creates new list item
- Enter twice exits list

#### 5.1.4 Links
**Priority:** P0 (Must Have)

- Insert link with URL and optional text
- Edit existing links
- Remove links
- Open links in new tab (Ctrl+Click)

**Acceptance Criteria:**
- Link dialog/bubble appears on selection
- Valid URLs are clickable in read-only mode
- Links are styled distinctly in default theme

#### 5.1.5 LaTeX Math Equations
**Priority:** P0 (Must Have)

- Inline math: `$equation$`
- Block math: `$$equation$$`
- KaTeX rendering
- Syntax highlighting in editor

**Acceptance Criteria:**
- Math renders correctly in editor and output
- Invalid LaTeX shows error state
- Can edit equations by clicking
- Common symbols are easily accessible

#### 5.1.6 Image Upload
**Priority:** P0 (Must Have)

- Upload via unified "attach file" toolbar button (see Section 4.4) or drag and drop
- RTEditor auto-detects image MIME type and renders inline
- In-editor resize (drag handles)
- Alignment (left, center, right)
- Alt text support
- Configurable upload handler (consumer-provided)
- Client-side file size limit: **5 MB** (configurable)
- Supported formats: JPEG, PNG, GIF, WebP

**Acceptance Criteria:**
- Images upload via consumer-provided handler
- Upload progress indicator
- Error handling for failed uploads (size exceeded, invalid type, network error)
- Images are responsive in output
- Can delete images
- Files exceeding 5 MB are rejected client-side with clear error message

#### 5.1.7 Undo/Redo
**Priority:** P0 (Must Have)

- Undo (Ctrl+Z / Cmd+Z)
- Redo (Ctrl+Shift+Z / Cmd+Shift+Z)
- Toolbar buttons

**Acceptance Criteria:**
- History tracks all changes
- Undo/redo works across all features
- History limit is configurable

#### 5.1.8 Keyboard Shortcuts
**Priority:** P0 (Must Have)

- All formatting shortcuts work
- Shortcuts are documented
- Shortcuts are customizable (Phase 2)

**Acceptance Criteria:**
- Shortcuts work on Windows, Mac, Linux
- No conflicts with browser shortcuts
- Tooltip shows shortcuts on hover

#### 5.1.9 Toolbar
**Priority:** P0 (Must Have)

- Simple, clean design
- Grouped by function
- Responsive (collapses on mobile)
- Tooltips on hover

**Acceptance Criteria:**
- All Phase 1 features accessible from toolbar
- Active state shows current formatting
- Disabled state for unavailable actions

#### 5.1.10 HTML/JSON Output
**Priority:** P0 (Must Have)

- Export to HTML
- Export to JSON (ProseMirror format)
- Import from HTML
- Import from JSON

**Acceptance Criteria:**
- HTML is semantic and clean
- JSON preserves all editor state
- Round-trip (export → import) is lossless

#### 5.1.11 Vue 3 Component
**Priority:** P0 (Must Have)

- Single-file component
- Composition API
- TypeScript support
- Props for configuration
- Events for changes

**Acceptance Criteria:**
- Works with Vue 3.3+
- SSR compatible (Phase 2 verification)
- No console warnings
- Proper cleanup on unmount

#### 5.1.12 TypeScript Types
**Priority:** P0 (Must Have)

- Full type definitions
- Exported interfaces
- Generic types for extensibility

**Acceptance Criteria:**
- No `any` types in public API
- IntelliSense works in VS Code
- Type errors caught at compile time

#### 5.1.13 Beautiful Default Theme
**Priority:** P0 (Must Have)

- Clean, modern design
- Good typography
- Accessible colors (WCAG AA)
- Consistent spacing

**Acceptance Criteria:**
- Works without any CSS customization
- Looks professional out-of-the-box
- Responsive design
- Print-friendly (Phase 2 enhancement)

#### 5.1.14 Basic Documentation
**Priority:** P0 (Must Have)

- README with installation, usage, examples
- API reference (props, events, types)
- Basic customization guide

**Acceptance Criteria:**
- README has working code examples
- All public APIs are documented
- Common use cases are covered

---

### 5.2 Phase 2 — Enhanced Features (Target: v0.2.0 - v0.4.0)

#### 5.2.1 Comment Bubbles (Hybrid System)
**Priority:** P1 (High Priority)

**Architecture:** Inline Highlight → Floating Bubble → Threading

**Step 1: Inline Highlight**
- User selects text
- Clicks "Add Comment" button
- Text is highlighted with visual marker
- Highlight color indicates comment presence

**Step 2: Floating Bubble**
- Click highlighted text to open bubble
- Bubble shows comment content
- Positioned near highlighted text
- Can be minimized/expanded

**Step 3: Threading**
- Reply to comments
- Nested conversation threads
- Author attribution
- Timestamp display

**Acceptance Criteria:**
- Can add comments to any text selection
- Comments persist in JSON output
- Can resolve/delete comments
- Bidirectional: teachers can reply to students, students can create comments
- Visual distinction between comment types (teacher vs student)
- Comment count indicator

#### 5.2.2 Read-Only Mode
**Priority:** P1

- Disable editing
- Hide toolbar
- Show content only
- Links still clickable

**Acceptance Criteria:**
- `readonly` prop disables all editing
- Content is selectable for copying
- No visual editing affordances

#### 5.2.3 Auto-Save Callback
**Priority:** P1

```typescript
interface AutoSaveHandler {
  (content: { html: string; json: any }): Promise<void>
}

<RTEditor :onAutoSave="handleAutoSave" :autoSaveInterval="5000" />
```

**Acceptance Criteria:**
- Configurable interval (default 5 seconds)
- Debounced to avoid excessive calls
- Visual indicator of save status
- Error handling for failed saves

#### 5.2.4 Dark Mode
**Priority:** P1

- Dark theme variant
- Automatic detection (prefers-color-scheme)
- Manual toggle
- CSS custom properties for colors

**Acceptance Criteria:**
- All UI elements have dark variants
- Syntax highlighting works in dark mode
- Images/media are visible
- Smooth transition between modes

#### 5.2.5 File Attachments (PDF, Word, Excel, PowerPoint)
**Priority:** P1

All file types use the same unified "attach file" toolbar button and consumer-provided upload handler (see Section 4.4). RTEditor auto-detects the file type by MIME type and renders accordingly.

**PDF Files:**
- Upload via unified attach button or drag and drop
- **Inline preview** via `<iframe>` embedded in the editor
- Configurable preview height (default: 400px)
- Fallback: styled download card if `<iframe>` preview is blocked (e.g., CSP restrictions)
- Download link below preview
- Client-side file size limit: **1 MB** (configurable)

**Document Files (Word, Excel, PowerPoint):**
- Upload via unified attach button or drag and drop
- Display as **styled download card** (not inline preview)
- Card shows: file type icon, file name, file size, download button
- File type icons: distinct icons for `.doc/.docx`, `.xls/.xlsx`, `.ppt/.pptx`
- Client-side file size limit: **1 MB** (configurable)
- Supported formats:
  - Word: `.doc`, `.docx` (`application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
  - Excel: `.xls`, `.xlsx` (`application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)
  - PowerPoint: `.ppt`, `.pptx` (`application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`)

**Download Card Design:**
```
┌─────────────────────────────────────────┐
│  📄  Lesson_Plan_Week3.docx             │
│      245 KB · Word Document    ⬇ Download│
└─────────────────────────────────────────┘
```

**Acceptance Criteria:**
- All file types upload via the same consumer-provided handler
- PDF renders as inline `<iframe>` preview with fallback download card
- Word/Excel/PPT render as styled download cards with correct file type icons
- Cards show file name, size, and type
- Files exceeding 1 MB are rejected client-side with clear error message
- Accessible download links (keyboard navigable, screen reader friendly)
- Can delete any attachment node from the editor
- File attachments are preserved in HTML export (as `<iframe>` or `<a>` tags)

#### 5.2.6 Tables
**Priority:** P1

- Insert tables
- Add/remove rows and columns
- Merge cells
- Header row styling

**Acceptance Criteria:**
- Responsive table design
- Keyboard navigation
- Copy/paste table data
- Export to HTML preserves structure

#### 5.2.7 Slash Commands
**Priority:** P2

- Type `/` to open command menu
- Quick insert: headings, lists, images, tables, etc.
- Fuzzy search
- Keyboard navigation

**Acceptance Criteria:**
- Menu appears on `/` character
- ESC closes menu
- Enter selects command
- Common commands are discoverable

#### 5.2.8 Checklists/Todos
**Priority:** P2

- Checkbox list items
- Toggle completion state
- Strikethrough completed items

**Acceptance Criteria:**
- Checkboxes are interactive in editor
- State persists in output
- Can convert between list types

#### 5.2.9 Text Highlight Colors
**Priority:** P2

- Highlight text with colors
- Color picker or preset palette
- Remove highlighting

**Acceptance Criteria:**
- Multiple highlight colors available
- Highlights are accessible (sufficient contrast)
- Can change highlight color

#### 5.2.10 Lesson Plan Templates (teacherPreset)
**Priority:** P2

- Pre-configured toolbar for teachers
- Template structures (objectives, materials, activities, assessment)
- Quick insert for common sections

**Acceptance Criteria:**
- `teacherPreset` includes all teacher-focused features
- Templates are customizable
- Templates work with auto-save

#### 5.2.11 Student Jot Notes Preset (studentPreset)
**Priority:** P2

- Simplified toolbar for students
- Focus on quick note-taking
- Checklist support
- Minimal distractions

**Acceptance Criteria:**
- `studentPreset` has streamlined UI
- Fast performance for quick notes
- Works on mobile devices

#### 5.2.12 Export to PDF/Markdown
**Priority:** P2

```typescript
import { exportToPDF, exportToMarkdown } from '@timothyphchan/rteditor'

const pdf = await exportToPDF(editorContent)
const markdown = exportToMarkdown(editorContent)
```

**Acceptance Criteria:**
- PDF preserves formatting and images
- Markdown is GitHub-flavored
- Math equations convert appropriately

#### 5.2.13 Word Count
**Priority:** P2

- Real-time word count
- Character count
- Reading time estimate
- Display in status bar

**Acceptance Criteria:**
- Accurate counting (excludes HTML tags)
- Updates in real-time
- Can be hidden via config

#### 5.2.14 i18n (Internationalization)
**Priority:** P2

- English (default)
- Traditional Chinese
- Simplified Chinese (optional)
- Extensible for other languages

**Acceptance Criteria:**
- All UI text is translatable
- Language switching is seamless
- RTL support (future consideration)
- Date/time formatting respects locale

---

### 5.3 Phase 3 — Advanced Features (Target: v0.5.0+)

#### 5.3.1 Real-Time Collaboration
**Priority:** P3

- Multiple users editing simultaneously
- Cursor presence indicators
- Conflict resolution
- WebSocket or polling-based

**Acceptance Criteria:**
- Changes sync in real-time
- No data loss on conflicts
- User avatars show who's editing
- Works with consumer's backend

#### 5.3.2 Drag & Drop Block Reordering
**Priority:** P3

- Drag handle on blocks
- Visual drop indicator
- Smooth animations

**Acceptance Criteria:**
- All block types are draggable
- Keyboard alternative available
- Undo/redo works with reordering

#### 5.3.3 Voice-to-Text
**Priority:** P3

- Browser speech recognition API
- Dictation mode
- Language selection

**Acceptance Criteria:**
- Works in supported browsers
- Graceful degradation if unavailable
- Privacy notice for microphone access

#### 5.3.4 Quick Stamps/Reactions
**Priority:** P3

- Emoji reactions on text
- Pre-defined teacher stamps ("Great!", "Needs work", etc.)
- Custom stamp creation

**Acceptance Criteria:**
- Stamps are visually distinct
- Can be removed
- Export includes stamps

#### 5.3.5 Tags/Categories
**Priority:** P3

- Tag documents
- Category assignment
- Filter by tags

**Acceptance Criteria:**
- Tags are searchable
- Multiple tags per document
- Tag autocomplete

#### 5.3.6 Code Blocks with Syntax Highlighting
**Priority:** P3

- Insert code blocks
- Language selection
- Syntax highlighting (Prism or Highlight.js)
- Line numbers

**Acceptance Criteria:**
- Common languages supported
- Copy code button
- Theme matches editor theme

#### 5.3.7 Mobile Optimization
**Priority:** P3

- Touch-friendly toolbar
- Mobile-specific gestures
- Responsive layout
- Virtual keyboard handling

**Acceptance Criteria:**
- Works on iOS Safari and Android Chrome
- No horizontal scrolling
- Toolbar accessible on small screens

#### 5.3.8 Print-Friendly CSS
**Priority:** P3

- Print stylesheet
- Page break control
- Header/footer support

**Acceptance Criteria:**
- Prints without toolbar
- Images scale appropriately
- Colors are print-optimized

#### 5.3.9 CI/CD Automated Publishing
**Priority:** P3

- GitHub Actions workflow
- Automated testing
- Automated npm publishing
- Changelog generation

**Acceptance Criteria:**
- Tests run on every PR
- Publish on version tag
- Semantic versioning enforced

#### 5.3.10 Pre-built Upload Handlers
**Priority:** P3

- Optional utility package
- Handlers for AWS S3, Cloudinary, etc.
- Example PHP implementations

**Acceptance Criteria:**
- Separate package (not required dependency)
- Well-documented
- Security best practices included

---

## 6. Comment System Specification (Phase 2)

### 6.1 Architecture Overview

**Hybrid Approach:** Combines inline highlights, floating bubbles, and threaded conversations.

```
User Flow:
1. Select text → Click "Add Comment" → Text is highlighted
2. Click highlighted text → Floating bubble appears
3. View comment → Reply → Thread grows
```

### 6.2 Data Model

```typescript
interface Comment {
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

interface CommentThread {
  rootComment: Comment
  replies: Comment[]
  isResolved: boolean
  participantCount: number
}
```

### 6.3 Visual Design

**Inline Highlight:**
- Background color: Semi-transparent yellow (teacher) or blue (student)
- Hover effect: Slightly darker shade
- Cursor: pointer
- Tooltip: Comment preview (first 50 chars)

**Floating Bubble:**
- Position: Adjacent to highlighted text (smart positioning to avoid viewport edges)
- Width: 300px (configurable)
- Max height: 400px (scrollable)
- Shadow: Subtle drop shadow for depth
- Arrow: Points to highlighted text

**Thread Display:**
- Root comment: Full width
- Replies: Indented 20px
- Avatar: Small circle with initials or photo
- Timestamp: Relative time ("2 hours ago")
- Actions: Reply, Resolve, Delete (permission-based)

### 6.4 Interactions

**Adding a Comment:**
1. User selects text
2. Toolbar shows "Add Comment" button (or bubble menu)
3. Click opens comment input
4. Type comment and submit
5. Text is highlighted, comment is saved

**Viewing Comments:**
1. Click highlighted text
2. Bubble appears with comment thread
3. Can scroll through replies
4. Can add reply

**Resolving Comments:**
1. Click "Resolve" button (teachers only, or comment author)
2. Highlight changes to resolved state (grayed out)
3. Bubble shows "Resolved" badge
4. Can be reopened

**Deleting Comments:**
1. Click "Delete" button (author or teacher)
2. Confirmation dialog
3. Comment and highlight are removed
4. If root comment, entire thread is deleted

### 6.5 Permissions

| Action | Teacher | Student (Author) | Student (Other) |
|--------|---------|------------------|-----------------|
| Add comment | ✅ | ✅ | ✅ |
| Reply to comment | ✅ | ✅ | ✅ |
| Edit own comment | ✅ | ✅ | ✅ |
| Delete own comment | ✅ | ✅ | ✅ |
| Delete any comment | ✅ | ❌ | ❌ |
| Resolve comment | ✅ | ✅ (own only) | ❌ |

### 6.6 Storage

Comments are stored in the ProseMirror document as marks with metadata:

```json
{
  "type": "text",
  "text": "highlighted text",
  "marks": [
    {
      "type": "comment",
      "attrs": {
        "commentId": "comment-123",
        "threadId": "thread-456"
      }
    }
  ]
}
```

Separate comment data is stored externally (consumer's database) and linked by ID.

### 6.7 API

```typescript
// Add comment
editor.commands.addComment({
  content: string,
  authorId: string,
  authorName: string,
  authorRole: 'teacher' | 'student'
})

// Reply to comment
editor.commands.replyToComment({
  commentId: string,
  content: string,
  authorId: string,
  authorName: string,
  authorRole: 'teacher' | 'student'
})

// Resolve comment
editor.commands.resolveComment(commentId: string)

// Delete comment
editor.commands.deleteComment(commentId: string)

// Get all comments
const comments = editor.getComments()

// Events
editor.on('commentAdded', (comment: Comment) => {})
editor.on('commentResolved', (commentId: string) => {})
editor.on('commentDeleted', (commentId: string) => {})
```

---

## 7. Theming & Styling

### 7.1 CSS Custom Properties

All theme values are exposed as CSS custom properties for easy customization:

```css
:root {
  /* Colors */
  --rte-primary: #3b82f6;
  --rte-primary-hover: #2563eb;
  --rte-text: #1f2937;
  --rte-text-muted: #6b7280;
  --rte-background: #ffffff;
  --rte-border: #e5e7eb;
  --rte-focus: #3b82f6;

  /* Typography */
  --rte-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --rte-font-size: 16px;
  --rte-line-height: 1.6;
  --rte-heading-font-weight: 600;

  /* Spacing */
  --rte-spacing-xs: 4px;
  --rte-spacing-sm: 8px;
  --rte-spacing-md: 16px;
  --rte-spacing-lg: 24px;
  --rte-spacing-xl: 32px;

  /* Toolbar */
  --rte-toolbar-bg: #f9fafb;
  --rte-toolbar-border: #e5e7eb;
  --rte-toolbar-height: 48px;

  /* Editor */
  --rte-editor-padding: 16px;
  --rte-editor-max-width: 100%;           /* Consumer sets max-width on parent container */

  /* Toolbar — Sticky */
  --rte-toolbar-sticky-top: 0;
  --rte-toolbar-z-index: 10;

  /* Full-Screen Mode */
  --rte-fullscreen-bg: var(--rte-background);
  --rte-fullscreen-z-index: 9999;

  /* Toast Notifications */
  --rte-toast-bg: #1f2937;
  --rte-toast-text: #f9fafb;
  --rte-toast-error-bg: #dc2626;
  --rte-toast-success-bg: #16a34a;
  --rte-toast-z-index: 10000;

  /* Upload Placeholder */
  --rte-upload-placeholder-bg: #f3f4f6;
  --rte-upload-placeholder-border: #d1d5db;

  /* Comment Sidebar */
  --rte-sidebar-width: 320px;
  --rte-sidebar-bg: #ffffff;
  --rte-sidebar-border: #e5e7eb;

  /* Comments */
  --rte-comment-teacher: rgba(251, 191, 36, 0.3);
  --rte-comment-student: rgba(59, 130, 246, 0.3);
  --rte-comment-resolved: rgba(156, 163, 175, 0.3);

  /* Dark mode */
  --rte-dark-text: #f9fafb;
  --rte-dark-background: #1f2937;
  --rte-dark-border: #374151;
}
```

### 7.2 Default Theme

**Design Principles (Notion-Inspired):**
- **Content-first:** Minimal chrome — the writing area dominates, UI elements are subtle and recede
- **Clean and minimal:** Generous whitespace, light/subtle borders, no visual clutter
- **Hover-to-reveal controls:** Block-level handles and controls appear on hover, hidden at rest
- **Subtle toolbar:** Toolbar doesn't dominate — clean background, understated button styling
- **Block-based feel:** Each paragraph, heading, list, image behaves as a distinct block
- High readability
- Accessible contrast ratios (WCAG AA minimum)
- Professional appearance
- Consistent with Notion's modern, minimal aesthetic

**Typography:**
- System font stack for performance
- 16px base font size
- 1.6 line height for readability
- Clear heading hierarchy

**Colors:**
- Blue primary color (education-friendly)
- Neutral grays for text and borders
- Semantic colors for success, warning, error
- Sufficient contrast for accessibility

**Spacing:**
- Consistent spacing scale (4px base unit)
- Generous padding for touch targets
- Clear visual grouping

### 7.3 Customization Examples

**Example 1: Custom Brand Colors**
```css
:root {
  --rte-primary: #8b5cf6; /* Purple */
  --rte-primary-hover: #7c3aed;
}
```

**Example 2: Compact Layout**
```css
:root {
  --rte-toolbar-height: 40px;
  --rte-editor-padding: 12px;
  --rte-font-size: 14px;
}
```

**Example 3: Dark Mode**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --rte-text: var(--rte-dark-text);
    --rte-background: var(--rte-dark-background);
    --rte-border: var(--rte-dark-border);
  }
}
```

### 7.4 Theme Presets

Provide optional theme presets:

```typescript
import { RTEditor, themes } from '@timothyphchan/rteditor'

<RTEditor :theme="themes.minimal" />
<RTEditor :theme="themes.professional" />
<RTEditor :theme="themes.playful" />
```

---

## 8. i18n Strategy

### 8.1 Supported Languages (Phase 2)

- **English (en)** — Default
- **Traditional Chinese (zh-TW)** — Primary target
- **Simplified Chinese (zh-CN)** — Optional (to be confirmed)

### 8.2 Implementation Approach

**Option A: Built-in i18n (Recommended for Phase 2)**
- Locale files bundled with package
- Simple API for language switching
- No external dependencies

```typescript
import { RTEditor, setLocale } from '@timothyphchan/rteditor'

setLocale('zh-TW')

<RTEditor locale="zh-TW" />
```

**Option B: Vue I18n Integration (Phase 3)**
- Integrate with vue-i18n if consumer already uses it
- More flexible for consumers with existing i18n setup

### 8.3 Translatable Strings

All UI text must be translatable:
- Toolbar button labels and tooltips
- Menu items
- Dialog titles and messages
- Placeholder text
- Error messages
- Accessibility labels (aria-label)

### 8.4 Locale File Structure

```typescript
// locales/en.ts
export default {
  toolbar: {
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    // ...
  },
  menu: {
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    // ...
  },
  dialog: {
    insertLink: 'Insert Link',
    linkUrl: 'URL',
    linkText: 'Text',
    // ...
  },
  errors: {
    uploadFailed: 'Upload failed. Please try again.',
    // ...
  }
}

// locales/zh-TW.ts
export default {
  toolbar: {
    bold: '粗體',
    italic: '斜體',
    underline: '底線',
    // ...
  },
  // ...
}
```

### 8.5 Date/Time Formatting

Use `Intl.DateTimeFormat` for locale-aware date formatting:

```typescript
const formatDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
```

### 8.6 RTL Support

Not required for Phase 2 (English and Chinese are LTR), but architecture should allow for future RTL support (Arabic, Hebrew).

---

## 9. Package Structure

### 9.1 Proposed Folder Layout

```
@timothyphchan/rteditor/
├── src/
│   ├── components/
│   │   ├── RTEditor.vue
│   │   ├── RTToolbar.vue
│   │   ├── RTMenuBar.vue
│   │   ├── RTBubbleMenu.vue
│   │   ├── RTLinkDialog.vue
│   │   ├── RTImageUpload.vue
│   │   └── RTCommentBubble.vue (Phase 2)
│   ├── extensions/
│   │   ├── MathExtension.ts
│   │   ├── ImageUploadExtension.ts
│   │   ├── FileAttachmentExtension.ts (Phase 2)
│   │   ├── CommentExtension.ts (Phase 2)
│   │   └── index.ts
│   ├── presets/
│   │   ├── basePreset.ts
│   │   ├── teacherPreset.ts
│   │   ├── studentPreset.ts
│   │   └── index.ts
│   ├── composables/
│   │   ├── useEditor.ts
│   │   ├── useUpload.ts
│   │   ├── useTheme.ts
│   │   ├── useAutoSave.ts (Phase 2)
│   │   └── index.ts
│   ├── utils/
│   │   ├── exportHTML.ts
│   │   ├── exportJSON.ts
│   │   ├── exportPDF.ts (Phase 2)
│   │   ├── exportMarkdown.ts (Phase 2)
│   │   ├── sanitize.ts
│   │   └── index.ts
│   ├── locales/
│   │   ├── en.ts
│   │   ├── zh-TW.ts
│   │   ├── zh-CN.ts (optional)
│   │   └── index.ts
│   ├── themes/
│   │   ├── default.css
│   │   ├── dark.css (Phase 2)
│   │   ├── minimal.css (Phase 2)
│   │   └── index.ts
│   ├── types/
│   │   ├── editor.ts
│   │   ├── preset.ts
│   │   ├── upload.ts
│   │   ├── comment.ts (Phase 2)
│   │   └── index.ts
│   └── index.ts (main entry point)
├── demo/
│   ├── src/
│   │   ├── App.vue
│   │   ├── examples/
│   │   │   ├── BasicExample.vue
│   │   │   ├── TeacherExample.vue
│   │   │   ├── StudentExample.vue
│   │   │   └── CustomExample.vue
│   │   └── main.ts
│   ├── index.html
│   └── vite.config.ts
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   ├── extensions/
│   │   ├── utils/
│   │   └── presets/
│   └── e2e/ (Phase 2)
├── docs/
│   ├── README.md
│   ├── GETTING_STARTED.md
│   ├── API.md
│   ├── CUSTOMIZATION.md
│   ├── PRESETS.md
│   ├── UPLOAD_HANDLERS.md
│   └── EXAMPLES.md
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── publish.yml (Phase 3)
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vite.config.ts (for demo)
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── LICENSE
└── README.md
```

---

## 10. Testing Strategy

### 10.1 Testing Framework

**Primary Tool:** Vitest (fast, Vite-native, TypeScript support)

**Rationale:**
- Zero-config integration with tsup/Vite build pipeline
- Fast execution with watch mode for development
- Native TypeScript support without additional configuration
- Compatible with Vue Test Utils for component testing

### 10.2 Unit Testing

**Scope:** Individual functions, utilities, and composables

**Coverage Targets:**
- **Phase 1:** 80%+ code coverage for core utilities and composables
- **Phase 2:** 85%+ code coverage
- **Phase 3:** 90%+ code coverage

**Test File Naming Convention:**
```
src/utils/exportHTML.ts → tests/unit/utils/exportHTML.test.ts
src/composables/useEditor.ts → tests/unit/composables/useEditor.test.ts
```

**Example Test Structure:**
```typescript
// tests/unit/utils/exportHTML.test.ts
import { describe, it, expect } from 'vitest'
import { exportHTML } from '@/utils/exportHTML'

describe('exportHTML', () => {
  it('should export valid HTML from ProseMirror JSON', () => {
    const json = { type: 'doc', content: [...] }
    const html = exportHTML(json)
    expect(html).toContain('<p>')
  })

  it('should sanitize dangerous HTML', () => {
    const json = { type: 'doc', content: [...] }
    const html = exportHTML(json)
    expect(html).not.toContain('<script>')
  })
})
```

**Acceptance Criteria:**
- All utility functions have unit tests
- All composables have unit tests
- Edge cases and error conditions are tested
- Tests run in < 5 seconds for Phase 1 suite

### 10.3 Component Testing

**Tool:** Vue Test Utils + Vitest

**Scope:** Vue components (RTEditor, RTToolbar, RTBubbleMenu, etc.)

**Test File Naming Convention:**
```
src/components/RTEditor.vue → tests/unit/components/RTEditor.test.ts
```

**Example Test Structure:**
```typescript
// tests/unit/components/RTToolbar.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RTToolbar from '@/components/RTToolbar.vue'

describe('RTToolbar', () => {
  it('should render all toolbar buttons', () => {
    const wrapper = mount(RTToolbar, {
      props: { editor: mockEditor }
    })
    expect(wrapper.find('[data-testid="bold-button"]').exists()).toBe(true)
  })

  it('should toggle bold formatting on click', async () => {
    const wrapper = mount(RTToolbar, {
      props: { editor: mockEditor }
    })
    await wrapper.find('[data-testid="bold-button"]').trigger('click')
    expect(mockEditor.chain().focus().toggleBold).toHaveBeenCalled()
  })
})
```

**Acceptance Criteria:**
- All components have basic rendering tests
- User interactions (clicks, keyboard events) are tested
- Props and events are tested
- Accessibility attributes are verified

### 10.4 Extension Testing

**Scope:** Custom TipTap extensions (MathExtension, ImageUploadExtension, FileAttachmentExtension, CommentExtension)

**Test Strategy:**
- Test extension registration
- Test extension commands
- Test extension keyboard shortcuts
- Test extension rendering

**Example Test Structure:**
```typescript
// tests/unit/extensions/MathExtension.test.ts
import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import { MathExtension } from '@/extensions/MathExtension'

describe('MathExtension', () => {
  it('should register math node', () => {
    const editor = new Editor({
      extensions: [MathExtension]
    })
    expect(editor.extensionManager.extensions).toContainEqual(
      expect.objectContaining({ name: 'math' })
    )
  })

  it('should insert inline math on command', () => {
    const editor = new Editor({
      extensions: [MathExtension],
      content: '<p>Test</p>'
    })
    editor.commands.insertMath({ latex: 'x^2', inline: true })
    expect(editor.getHTML()).toContain('x^2')
  })
})
```

**Acceptance Criteria:**
- All custom extensions have tests
- Extension commands are tested
- Extension rendering is verified
- Extension configuration options are tested

### 10.5 E2E Testing (Phase 2)

**Tool:** Playwright

**Scope:** Full user workflows in real browser environment

**Test Scenarios:**
- Complete document creation workflow
- Image upload and insertion
- Comment creation and threading (Phase 2)
- Export to HTML/PDF
- Keyboard shortcuts
- Mobile interactions (Phase 3)

**Example Test Structure:**
```typescript
// tests/e2e/basic-editing.spec.ts
import { test, expect } from '@playwright/test'

test('should create and format a document', async ({ page }) => {
  await page.goto('http://localhost:5173/demo')

  // Type text
  await page.locator('.ProseMirror').fill('Hello World')

  // Select text and make bold
  await page.locator('.ProseMirror').selectText()
  await page.click('[data-testid="bold-button"]')

  // Verify bold formatting
  const html = await page.locator('.ProseMirror').innerHTML()
  expect(html).toContain('<strong>Hello World</strong>')
})
```

**Acceptance Criteria (Phase 2):**
- Critical user paths have E2E tests
- Tests run on Chrome, Firefox, Safari
- Tests pass on CI/CD pipeline
- Screenshots captured on failure

### 10.6 Coverage Targets

| Phase | Unit Coverage | Component Coverage | E2E Coverage |
|-------|--------------|-------------------|--------------|
| Phase 1 (v0.1.0) | 80%+ | 70%+ | N/A |
| Phase 2 (v0.2.0-v0.4.0) | 85%+ | 80%+ | Critical paths |
| Phase 3 (v0.5.0+) | 90%+ | 85%+ | All major workflows |

**Coverage Exclusions:**
- Type definition files (*.d.ts)
- Demo application code
- Third-party extension wrappers (minimal logic)

### 10.7 CI Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3 # Upload coverage
```

**Acceptance Criteria:**
- Tests run on every push and PR
- Coverage reports uploaded to Codecov or similar
- PR cannot merge if tests fail
- Coverage decrease blocks PR (configurable threshold)

### 10.8 Test Data and Mocks

**Mock Editor Instance:**
```typescript
// tests/mocks/editor.ts
export const createMockEditor = () => ({
  chain: () => ({
    focus: () => ({
      toggleBold: vi.fn().mockReturnThis(),
      toggleItalic: vi.fn().mockReturnThis(),
      run: vi.fn()
    })
  }),
  getHTML: vi.fn(),
  getJSON: vi.fn(),
  commands: {},
  isActive: vi.fn()
})
```

**Sample Documents:**
```typescript
// tests/fixtures/documents.ts
export const sampleDocuments = {
  empty: { type: 'doc', content: [] },
  simple: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] },
  complex: { /* full document with headings, lists, images, math */ }
}
```

---

## 11. Performance Requirements

### 11.1 Bundle Size Targets

**Core Package (without optional features):**
- **Uncompressed:** < 200KB
- **Gzip:** < 50KB
- **Brotli:** < 40KB

**With KaTeX (math support):**
- **Uncompressed:** < 600KB
- **Gzip:** < 150KB
- **Brotli:** < 120KB

**Rationale:** Education systems often have limited bandwidth; smaller bundles improve initial load time.

**Measurement:**
```bash
npm run build
npx bundlesize
```

**Acceptance Criteria:**
- Core bundle stays under 50KB gzip
- Each optional feature adds < 20KB gzip
- Bundle size is tracked in CI (fails if exceeds threshold)

### 11.2 Initial Load Time Targets

**Time to Interactive (TTI):**
- **Fast 3G:** < 3 seconds
- **4G:** < 1.5 seconds
- **Desktop:** < 1 second

**First Contentful Paint (FCP):**
- **Fast 3G:** < 2 seconds
- **4G:** < 1 second
- **Desktop:** < 500ms

**Measurement:** Lighthouse CI in GitHub Actions

**Acceptance Criteria:**
- Lighthouse performance score > 90
- No render-blocking resources
- Critical CSS inlined (if applicable)

### 11.3 Typing Latency

**Target:** < 16ms per keystroke (60fps)

**Rationale:** Any latency > 16ms is perceptible and degrades user experience.

**Measurement:**
```typescript
// Performance test
const start = performance.now()
editor.commands.insertContent('a')
const end = performance.now()
expect(end - start).toBeLessThan(16)
```

**Acceptance Criteria:**
- Typing latency < 16ms on modern hardware (2020+ laptop)
- No dropped frames during continuous typing
- Debounced operations (auto-save, word count) don't block typing

### 11.4 Large Document Handling

**Target Document Sizes:**
- **Phase 1:** 5,000 words (typical essay)
- **Phase 2:** 10,000 words (thesis chapter)
- **Phase 3:** 50,000+ words (full thesis)

**Performance Requirements:**
- Scrolling remains smooth (60fps)
- Typing latency < 16ms
- Search/replace completes in < 500ms
- Export to HTML/PDF completes in < 2 seconds

**Optimization Strategies:**
- Virtual scrolling for very large documents (Phase 3)
- Lazy rendering of complex nodes (images, math)
- Debounced re-renders
- Efficient ProseMirror transaction handling

**Acceptance Criteria:**
- 10,000-word document loads in < 2 seconds
- No performance degradation during editing
- Memory usage stays under 100MB for 10,000-word document

### 11.5 Memory Usage

**Targets:**
- **Idle editor:** < 20MB
- **With 5,000-word document:** < 50MB
- **With 10,000-word document:** < 100MB
- **With images and media:** < 150MB

**Measurement:**
```javascript
// Chrome DevTools Memory Profiler
performance.memory.usedJSHeapSize
```

**Acceptance Criteria:**
- No memory leaks (heap size stable over time)
- Proper cleanup on component unmount
- Images are lazy-loaded and garbage-collected when scrolled out of view

### 11.6 Tree-Shaking Requirements

**Goal:** Consumers should only bundle features they use

**Implementation:**
- ESM exports with named exports (not default exports)
- Side-effect-free modules (mark in package.json)
- Separate entry points for optional features

**package.json Configuration:**
```json
{
  "sideEffects": [
    "*.css",
    "*.vue"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./presets": {
      "import": "./dist/presets/index.mjs",
      "require": "./dist/presets/index.cjs"
    },
    "./extensions": {
      "import": "./dist/extensions/index.mjs",
      "require": "./dist/extensions/index.cjs"
    },
    "./themes/*.css": "./dist/themes/*.css"
  }
}
```

**Acceptance Criteria:**
- Unused presets are not bundled
- Unused extensions are not bundled
- Tree-shaking verified with webpack-bundle-analyzer
- Minimal consumer bundle includes only core + used features

### 11.7 Lazy Loading Strategy

**Lazy-Loaded Features (Phase 2+):**
- KaTeX (math rendering) — loaded on first math insertion
- PDF export library — loaded on first export
- Syntax highlighting (code blocks) — loaded on first code block insertion
- Collaboration engine (Phase 3) — loaded when collaboration is enabled

**Implementation:**
```typescript
// Lazy load KaTeX
const loadKaTeX = async () => {
  if (!window.katex) {
    await import('katex')
    await import('katex/dist/katex.min.css')
  }
  return window.katex
}

// Use in extension
export const MathExtension = Extension.create({
  addCommands() {
    return {
      insertMath: (attrs) => async ({ commands }) => {
        const katex = await loadKaTeX()
        // ... render math
      }
    }
  }
})
```

**Acceptance Criteria:**
- Heavy dependencies are lazy-loaded
- Loading indicators shown during async imports
- Graceful fallback if lazy load fails
- Lazy-loaded modules are cached after first load

### 11.8 Performance Monitoring

**Metrics to Track:**
- Bundle size (per build)
- Lighthouse scores (per deployment)
- Core Web Vitals (LCP, FID, CLS)
- Memory usage (manual testing)
- Typing latency (automated tests)

**Tools:**
- Bundlesize (CI check)
- Lighthouse CI (GitHub Actions)
- Chrome DevTools Performance Profiler (manual)
- Vitest benchmarks (for critical paths)

**Acceptance Criteria:**
- Performance metrics tracked in CI
- Regressions trigger warnings or failures
- Performance budget enforced (bundle size, Lighthouse score)

---

## 12. Accessibility Requirements

### 12.1 WCAG 2.1 Compliance

**Target Level:** AA (minimum)

**Rationale:** Education systems must be accessible to all students, including those with disabilities.

**Scope:**
- All UI components (toolbar, menus, dialogs)
- Editor content area
- Keyboard navigation
- Screen reader support

**Acceptance Criteria:**
- Passes WCAG 2.1 AA automated tests (axe-core)
- Manual testing with screen readers (NVDA, JAWS, VoiceOver)
- No accessibility violations in Lighthouse audit

### 12.2 Keyboard Navigation

**Requirement:** Full editor functionality accessible without mouse

**Keyboard Shortcuts:**
| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| Bold | Ctrl+B | Cmd+B |
| Italic | Ctrl+I | Cmd+I |
| Underline | Ctrl+U | Cmd+U |
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Shift+Z | Cmd+Shift+Z |
| Insert Link | Ctrl+K | Cmd+K |
| Heading 1-6 | Ctrl+Alt+1-6 | Cmd+Alt+1-6 |
| Bullet List | Ctrl+Shift+8 | Cmd+Shift+8 |
| Ordered List | Ctrl+Shift+9 | Cmd+Shift+9 |

**Toolbar Navigation:**
- **Tab:** Move focus to next toolbar button
- **Shift+Tab:** Move focus to previous toolbar button
- **Enter/Space:** Activate focused button
- **Escape:** Return focus to editor

**Menu Navigation:**
- **Arrow keys:** Navigate menu items
- **Enter:** Select menu item
- **Escape:** Close menu

**Acceptance Criteria:**
- All toolbar buttons are keyboard-accessible
- Tab order is logical (toolbar → editor → dialogs)
- Focus indicators are clearly visible
- No keyboard traps
- Shortcuts documented in tooltips and help dialog

### 12.3 Screen Reader Support

**ARIA Labels:**
```html
<!-- Toolbar buttons -->
<button aria-label="Bold (Ctrl+B)" data-testid="bold-button">
  <BoldIcon aria-hidden="true" />
</button>

<!-- Editor container -->
<div
  role="textbox"
  aria-multiline="true"
  aria-label="Rich text editor"
  contenteditable="true"
>
  <!-- Editor content -->
</div>

<!-- Toolbar -->
<div role="toolbar" aria-label="Formatting toolbar">
  <!-- Buttons -->
</div>
```

**Live Regions:**
```html
<!-- Status messages -->
<div role="status" aria-live="polite" aria-atomic="true">
  Document saved
</div>

<!-- Error messages -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  Upload failed. Please try again.
</div>
```

**Acceptance Criteria:**
- All interactive elements have accessible names
- Editor announces formatting changes
- Status messages are announced
- Images have alt text (required field)
- Links announce destination
- Screen reader testing passes on NVDA, JAWS, VoiceOver

### 12.4 Focus Management

**Focus Indicators:**
- Visible focus ring on all interactive elements
- High contrast focus indicator (3:1 contrast ratio minimum)
- Focus ring not removed by CSS

**Focus Behavior:**
- Focus moves to editor on component mount (optional, configurable)
- Focus returns to trigger element when dialog closes
- Focus trapped in modal dialogs
- Focus skips hidden/disabled elements

**CSS Example:**
```css
/* Focus indicator */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--rte-focus);
  outline-offset: 2px;
}

/* Never remove focus indicator */
*:focus {
  outline: revert; /* Don't use outline: none */
}
```

**Acceptance Criteria:**
- Focus is always visible
- Focus order is logical
- Focus is trapped in modals
- Focus returns correctly after dialogs close

### 12.5 Color Contrast Ratios

**WCAG AA Requirements:**
- **Normal text:** 4.5:1 minimum
- **Large text (18pt+ or 14pt+ bold):** 3:1 minimum
- **UI components:** 3:1 minimum

**Default Theme Contrast:**
| Element | Foreground | Background | Ratio |
|---------|-----------|-----------|-------|
| Body text | #1f2937 | #ffffff | 16.1:1 ✅ |
| Muted text | #6b7280 | #ffffff | 7.0:1 ✅ |
| Primary button | #ffffff | #3b82f6 | 8.6:1 ✅ |
| Border | #e5e7eb | #ffffff | 1.2:1 (decorative) |

**Dark Mode Contrast:**
| Element | Foreground | Background | Ratio |
|---------|-----------|-----------|-------|
| Body text | #f9fafb | #1f2937 | 15.8:1 ✅ |
| Muted text | #d1d5db | #1f2937 | 9.7:1 ✅ |
| Primary button | #ffffff | #3b82f6 | 8.6:1 ✅ |

**Acceptance Criteria:**
- All text meets 4.5:1 contrast ratio
- UI components meet 3:1 contrast ratio
- Contrast verified with automated tools (axe, Lighthouse)
- Custom themes include contrast guidelines

### 12.6 Reduced Motion Support

**Requirement:** Respect `prefers-reduced-motion` user preference

**Implementation:**
```css
/* Animations enabled by default */
.rte-toolbar {
  transition: transform 0.2s ease;
}

/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .rte-toolbar,
  .rte-bubble-menu,
  .rte-dialog {
    transition: none;
    animation: none;
  }
}
```

**Acceptance Criteria:**
- All animations respect `prefers-reduced-motion`
- No essential information conveyed through animation alone
- Reduced motion mode tested manually

### 12.7 Toolbar Accessibility

**Requirements:**
- Toolbar has `role="toolbar"`
- Buttons have descriptive labels
- Active state is announced
- Disabled state is announced
- Tooltips are accessible

**Example Implementation:**
```html
<div role="toolbar" aria-label="Formatting toolbar">
  <button
    aria-label="Bold (Ctrl+B)"
    aria-pressed="true"
    :disabled="!editor.can().toggleBold()"
  >
    <BoldIcon aria-hidden="true" />
  </button>
</div>
```

**Acceptance Criteria:**
- Toolbar is keyboard-navigable
- Active formatting is announced (aria-pressed)
- Disabled buttons are skipped or announced as disabled
- Tooltips appear on focus (not just hover)

### 12.8 Acceptance Criteria by Phase

**Phase 1 (v0.1.0):**
- [ ] Keyboard navigation for all core features
- [ ] ARIA labels on all interactive elements
- [ ] 4.5:1 contrast ratio for all text
- [ ] Focus indicators visible
- [ ] Passes axe-core automated tests
- [ ] Manual screen reader testing (basic)

**Phase 2 (v0.2.0-v0.4.0):**
- [ ] Comment bubbles are keyboard-accessible
- [ ] Live regions announce status changes
- [ ] Dark mode meets contrast requirements
- [ ] Reduced motion support
- [ ] Comprehensive screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Accessibility documentation

**Phase 3 (v0.5.0+):**
- [ ] Collaboration features are accessible
- [ ] Mobile touch targets meet 44x44px minimum
- [ ] WCAG 2.1 AAA compliance (stretch goal)
- [ ] Third-party accessibility audit

---

## 13. Browser & Device Support

### 13.1 Browser Compatibility Matrix

**Supported Browsers (Desktop):**
| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | Last 2 versions | Full support |
| Firefox | Last 2 versions | Full support |
| Safari | Last 2 versions | Full support |
| Edge | Last 2 versions | Chromium-based only |

**Rationale:** Last 2 versions covers ~95% of users while minimizing maintenance burden.

**Not Supported:**
- Internet Explorer 11 (EOL June 2022)
- Legacy Edge (pre-Chromium)
- Browsers older than 2 years

**Acceptance Criteria:**
- All features work in supported browsers
- Automated tests run on Chrome, Firefox, Safari (via Playwright)
- No browser-specific bugs in supported versions

### 13.2 Mobile Browser Support

**Supported Mobile Browsers:**
| Browser | Platform | Minimum Version | Notes |
|---------|---------|----------------|-------|
| Safari | iOS | iOS 14+ | Full support (Phase 2) |
| Chrome | Android | Android 10+ | Full support (Phase 2) |
| Firefox | Android | Last 2 versions | Best effort (Phase 3) |

**Phase 1:** Desktop-first, mobile usable but not optimized
**Phase 2:** Mobile optimization (touch targets, responsive toolbar)
**Phase 3:** Full mobile feature parity

**Acceptance Criteria (Phase 2):**
- Editor is usable on mobile (typing, basic formatting)
- Toolbar is responsive (collapses to dropdown on small screens)
- Touch targets are 44x44px minimum
- Virtual keyboard doesn't obscure editor

### 13.3 Minimum Viewport Sizes

**Desktop:**
- **Minimum width:** 768px (tablet landscape)
- **Optimal width:** 1024px+
- **Minimum height:** 600px

**Mobile (Phase 2):**
- **Minimum width:** 320px (iPhone SE)
- **Optimal width:** 375px+ (modern smartphones)
- **Minimum height:** 568px

**Responsive Breakpoints:**
```css
/* Mobile — Toolbar scrolls horizontally with left/right arrow indicators */
@media (max-width: 767px) {
  .rte-toolbar {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: none;            /* Firefox */
    -webkit-overflow-scrolling: touch; /* iOS momentum scrolling */
  }
  .rte-toolbar::-webkit-scrollbar { display: none; }
  .rte-toolbar__scroll-left,
  .rte-toolbar__scroll-right {
    /* Left/right arrow buttons visible when content overflows */
    display: flex;
  }
  .rte-sidebar {
    /* Comment sidebar collapses to bottom panel on mobile */
    position: fixed;
    bottom: 0;
    width: 100%;
    max-height: 50vh;
  }
}

/* Tablet — Compact toolbar, sidebar overlays */
@media (min-width: 768px) and (max-width: 1023px) {
  .rte-toolbar {
    /* Compact toolbar — smaller padding, still full-width */
  }
  .rte-sidebar {
    /* Sidebar overlays as a drawer */
    position: absolute;
    right: 0;
    width: var(--rte-sidebar-width);
  }
}

/* Desktop — Full toolbar, sidebar alongside editor */
@media (min-width: 1024px) {
  .rte-toolbar {
    /* Full toolbar — all buttons visible */
  }
  .rte-sidebar {
    /* Sidebar sits alongside editor content */
    position: relative;
    width: var(--rte-sidebar-width);
    flex-shrink: 0;
  }
}
```

**Acceptance Criteria:**
- No horizontal scrolling on any supported viewport
- Content is readable at minimum viewport size
- Toolbar adapts to available space
- Editor is usable (not just viewable) at all breakpoints

### 13.4 Touch Support Requirements

**Phase 2 Requirements:**
- Touch targets are 44x44px minimum (WCAG 2.1 AAA)
- Tap to focus editor
- Long-press for context menu (bubble menu)
- Pinch-to-zoom disabled in editor (prevents accidental zoom)
- Swipe gestures for undo/redo (optional, Phase 3)

**Touch-Specific Interactions:**
- Tap image to select, drag handles to resize
- Tap link to edit (not follow)
- Double-tap to select word
- Triple-tap to select paragraph

**Acceptance Criteria (Phase 2):**
- All toolbar buttons are tappable (44x44px)
- No accidental activations
- Touch interactions feel native
- Tested on real iOS and Android devices

### 13.5 No IE11 Support

**Rationale:**
- IE11 reached end-of-life in June 2022
- Modern JavaScript features (ES2020+) required
- Vue 3 does not support IE11
- TipTap/ProseMirror do not support IE11

**Graceful Degradation:**
- Display warning message if IE11 detected
- Suggest modern browser (Chrome, Firefox, Edge)

**Example Warning:**
```html
<!--[if IE]>
<div class="rte-ie-warning">
  This editor requires a modern browser. Please use Chrome, Firefox, or Edge.
</div>
<![endif]-->
```

**Acceptance Criteria:**
- No IE11 testing required
- Warning message shown if IE11 detected
- Documentation clearly states IE11 is not supported

### 13.6 Graceful Degradation Strategy

**Feature Detection:**
```typescript
// Check for required features
const isSupported = () => {
  return (
    'contentEditable' in document.body &&
    'MutationObserver' in window &&
    'Promise' in window &&
    'Proxy' in window
  )
}

// Show warning if not supported
if (!isSupported()) {
  console.warn('RTEditor: Browser not fully supported')
  // Optionally render read-only view
}
```

**Fallback Behavior:**
- If browser lacks required features, render read-only view
- If JavaScript is disabled, show plain HTML content
- If CSS fails to load, content remains readable (semantic HTML)

**Acceptance Criteria:**
- Feature detection prevents crashes in unsupported browsers
- Fallback view is readable and accessible
- Error messages are user-friendly

### 13.7 Testing Strategy

**Automated Testing:**
- Playwright tests run on Chrome, Firefox, Safari (WebKit)
- BrowserStack or Sauce Labs for extended browser matrix (Phase 3)

**Manual Testing:**
- Smoke tests on all supported browsers before each release
- Mobile testing on real devices (iOS Safari, Android Chrome)

**Test Matrix (Phase 1):**
| Browser | Version | Platform | Automated | Manual |
|---------|---------|---------|-----------|--------|
| Chrome | Latest | macOS | ✅ | ✅ |
| Firefox | Latest | macOS | ✅ | ✅ |
| Safari | Latest | macOS | ✅ | ✅ |
| Edge | Latest | Windows | ❌ | ✅ |

**Test Matrix (Phase 2):**
| Browser | Version | Platform | Automated | Manual |
|---------|---------|---------|-----------|--------|
| Chrome | Latest | macOS | ✅ | ✅ |
| Firefox | Latest | macOS | ✅ | ✅ |
| Safari | Latest | macOS | ✅ | ✅ |
| Edge | Latest | Windows | ✅ | ✅ |
| Safari | iOS 14+ | iPhone | ❌ | ✅ |
| Chrome | Android 10+ | Android | ❌ | ✅ |

**Acceptance Criteria:**
- All automated tests pass on supported browsers
- Manual testing checklist completed before release
- Browser-specific bugs documented and fixed

---

## 14. Security Considerations

### 14.1 XSS Prevention

**Threat:** Malicious HTML/JavaScript injected into editor content

**Mitigation Strategies:**

**1. HTML Sanitization on Input:**
```typescript
import DOMPurify from 'dompurify'

// Sanitize HTML before inserting into editor
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false
  })
}

// Use when importing HTML
editor.commands.setContent(sanitizeHTML(userProvidedHTML))
```

**2. ProseMirror Schema Validation:**
```typescript
// Define strict schema
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { content: 'inline*', group: 'block' },
    text: { group: 'inline' }
  },
  marks: {
    bold: {},
    italic: {},
    link: {
      attrs: { href: { default: null } },
      parseDOM: [{
        tag: 'a[href]',
        getAttrs: (dom) => {
          const href = dom.getAttribute('href')
          // Only allow http(s) and mailto links
          if (href && /^(https?:|mailto:)/.test(href)) {
            return { href }
          }
          return false
        }
      }]
    }
  }
})
```

**3. Content Security Policy (CSP) Compatibility:**
```html
<!-- Recommended CSP headers -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
">
```

**Acceptance Criteria:**
- All user-provided HTML is sanitized
- ProseMirror schema rejects invalid nodes
- No `javascript:` URLs allowed in links
- No `<script>` tags in output
- CSP-compatible (no inline scripts)
- XSS testing with OWASP ZAP or similar

### 14.2 Content Security Policy Compatibility

**Requirements:**
- No inline JavaScript (`<script>` tags in HTML)
- No `eval()` or `new Function()`
- No `innerHTML` for dynamic content (use ProseMirror APIs)
- Inline styles allowed (required for editor functionality)

**CSP Directives:**
```
script-src 'self'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
```

**Acceptance Criteria:**
- Editor works with strict CSP
- No CSP violations in console
- Documentation includes CSP recommendations

### 14.3 Upload Handler Security

**Threat:** Malicious file uploads (XSS, malware, oversized files)

**Supported File Types & Size Limits (client-side defaults):**
| Category | MIME Types | Max Size |
|----------|-----------|----------|
| Image | `image/jpeg`, `image/png`, `image/gif`, `image/webp` | 5 MB |
| PDF | `application/pdf` | 1 MB |
| Document | `application/msword`, `application/vnd.openxmlformats-officedocument.*`, `application/vnd.ms-excel`, `application/vnd.ms-powerpoint` | 1 MB |

**Consumer Responsibility:**
The upload handler is implemented by the consumer, who must handle:
- File type validation (whitelist, not blacklist)
- File size limits (server-side enforcement)
- Virus scanning
- Authentication and authorization
- Secure storage (S3, CDN, etc.)

**RTEditor Responsibilities:**
- Validate file type on client side (UX, not security)
- Enforce maximum file size per category (configurable, see Section 4.4)
- Sanitize file names for display
- Provide clear documentation on security best practices
- PDF `<iframe>` preview uses `sandbox` attribute to prevent script execution

**Example Secure Upload Handler (all file types):**
```typescript
const handleUpload: UploadHandler = async (file: File) => {
  // Client-side validation (UX only, not security)
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',           // Images
    'application/pdf',                                                // PDF
    'application/msword',                                             // Word .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
    'application/vnd.ms-excel',                                       // Excel .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',        // .xlsx
    'application/vnd.ms-powerpoint',                                  // PPT .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
  ]
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // Size limits by category
  const isImage = file.type.startsWith('image/')
  const maxSize = isImage ? 5 * 1024 * 1024 : 1 * 1024 * 1024  // 5MB images, 1MB docs
  if (file.size > maxSize) {
    throw new Error(`File too large (max ${isImage ? '5' : '1'} MB)`)
  }

  // Upload to server (server must re-validate)
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-CSRF-Token': csrfToken
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = await response.json()
  return { url: data.url, filename: file.name, filesize: file.size }
}
```

**Server-Side Validation (Consumer's Backend):**
```php
// Example Laravel upload handler (all file types)
public function upload(Request $request) {
    $request->validate([
        'file' => 'required|file|mimes:jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx|max:5120'
    ]);

    $file = $request->file('file');

    // Virus scan (optional but recommended)
    // $this->scanForVirus($file);

    // Generate unique filename
    $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

    // Store securely
    $path = $file->storeAs('uploads', $filename, 's3');

    return response()->json([
        'url' => Storage::disk('s3')->url($path)
    ]);
}
```

**PDF Preview Security:**
- `<iframe>` uses `sandbox="allow-same-origin"` to prevent script execution
- `Content-Security-Policy: frame-src 'self'` recommended for consumer's server
- Fallback to download card if `<iframe>` is blocked by CSP

**Acceptance Criteria:**
- Client-side file type validation (UX) for all supported types
- Client-side file size validation: 5 MB for images, 1 MB for PDFs/documents
- PDF `<iframe>` preview sandboxed to prevent script execution
- Documentation includes secure upload handler examples for all file types
- Documentation warns about server-side validation requirements
- No file content is executed or rendered unsafely

### 14.4 Dependency Security

**Strategy:** Regular security audits and updates

**Tools:**
- `npm audit` (built-in)
- Snyk (GitHub integration)
- Dependabot (GitHub)

**Process:**
1. Run `npm audit` before each release
2. Fix high/critical vulnerabilities immediately
3. Update dependencies monthly (minor/patch versions)
4. Review major version updates carefully

**Automated Checks:**
```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: '0 0 * * 1' # Weekly
  pull_request:
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm audit --audit-level=high
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Acceptance Criteria:**
- No high/critical vulnerabilities in dependencies
- `npm audit` passes in CI
- Snyk monitoring enabled
- Dependabot PRs reviewed within 1 week

### 14.5 ProseMirror Content Sanitization

**Threat:** Malicious content in ProseMirror JSON

**Mitigation:**
```typescript
// Validate ProseMirror JSON before loading
const validateContent = (json: any): boolean => {
  if (!json || typeof json !== 'object') return false
  if (json.type !== 'doc') return false

  // Recursively validate nodes
  const validateNode = (node: any): boolean => {
    if (!node.type) return false

    // Whitelist allowed node types
    const allowedNodes = ['doc', 'paragraph', 'heading', 'text', 'image', 'math']
    if (!allowedNodes.includes(node.type)) return false

    // Validate attributes
    if (node.attrs) {
      // Check for dangerous attributes
      if (node.attrs.onclick || node.attrs.onerror) return false
    }

    // Validate children
    if (node.content) {
      return node.content.every(validateNode)
    }

    return true
  }

  return validateNode(json)
}

// Use before loading content
if (validateContent(userProvidedJSON)) {
  editor.commands.setContent(userProvidedJSON)
} else {
  console.error('Invalid content')
}
```

**Acceptance Criteria:**
- ProseMirror JSON is validated before loading
- Invalid nodes are rejected
- Dangerous attributes are stripped
- Schema validation prevents invalid content

### 14.6 No eval() or innerHTML Usage

**Requirement:** Avoid dangerous JavaScript patterns

**Prohibited:**
```typescript
// ❌ NEVER use eval()
eval(userProvidedCode)

// ❌ NEVER use innerHTML with user content
element.innerHTML = userProvidedHTML

// ❌ NEVER use new Function()
const fn = new Function('return ' + userProvidedCode)
```

**Safe Alternatives:**
```typescript
// ✅ Use ProseMirror APIs
editor.commands.setContent(sanitizedHTML)

// ✅ Use DOMPurify for HTML
element.innerHTML = DOMPurify.sanitize(userProvidedHTML)

// ✅ Use textContent for plain text
element.textContent = userProvidedText
```

**Acceptance Criteria:**
- Code review checks for `eval()`, `innerHTML`, `new Function()`
- ESLint rules enforce safe patterns
- No CSP violations

### 14.7 OWASP Considerations

**OWASP Top 10 Mitigations:**

| Risk | Mitigation |
|------|-----------|
| **A03:2021 – Injection** | HTML sanitization, ProseMirror schema validation |
| **A05:2021 – Security Misconfiguration** | CSP headers, secure defaults |
| **A06:2021 – Vulnerable Components** | `npm audit`, Snyk, Dependabot |
| **A07:2021 – Authentication Failures** | Consumer responsibility (upload handler) |
| **A08:2021 – Software and Data Integrity** | Subresource Integrity (SRI) for CDN assets |

**Acceptance Criteria:**
- OWASP Top 10 risks addressed in documentation
- Security best practices documented for consumers
- Regular security reviews (quarterly)

---

## 15. Versioning & Release Strategy

### 15.1 Semantic Versioning (semver)

**Format:** `MAJOR.MINOR.PATCH` (e.g., `0.1.0`, `1.2.3`)

**Version Increment Rules:**
- **MAJOR:** Breaking changes (incompatible API changes)
- **MINOR:** New features (backward-compatible)
- **PATCH:** Bug fixes (backward-compatible)

**Pre-1.0.0 Versioning:**
- `0.x.y` indicates unstable API
- Breaking changes allowed in MINOR versions (0.1.0 → 0.2.0)
- Once API is stable, release 1.0.0

**Examples:**
- `0.1.0` → `0.1.1`: Bug fix (patch)
- `0.1.1` → `0.2.0`: New feature or breaking change (minor)
- `1.0.0` → `2.0.0`: Breaking change (major)
- `1.0.0` → `1.1.0`: New feature (minor)
- `1.1.0` → `1.1.1`: Bug fix (patch)

**Acceptance Criteria:**
- All releases follow semver
- Version numbers are consistent across package.json, git tags, npm
- Breaking changes are clearly documented

### 15.2 Pre-Release Versions

**Format:** `MAJOR.MINOR.PATCH-PRERELEASE.NUMBER`

**Pre-Release Types:**
- **alpha:** Early development, unstable, frequent changes
- **beta:** Feature-complete, testing phase, may have bugs
- **rc (release candidate):** Final testing before stable release

**Examples:**
- `0.1.0-alpha.1`: First alpha release
- `0.1.0-alpha.2`: Second alpha release
- `0.1.0-beta.1`: First beta release
- `0.1.0-rc.1`: First release candidate
- `0.1.0`: Stable release

**npm Dist Tags:**
```bash
# Publish alpha to 'alpha' tag
npm publish --tag alpha

# Publish beta to 'beta' tag
npm publish --tag beta

# Publish stable to 'latest' tag (default)
npm publish
```

**Installation:**
```bash
# Install latest stable
npm install @timothyphchan/rteditor

# Install latest alpha
npm install @timothyphchan/rteditor@alpha

# Install specific version
npm install @timothyphchan/rteditor@0.1.0-beta.1
```

**Acceptance Criteria:**
- Pre-release versions use correct format
- Pre-release versions published to appropriate npm tags
- Stable releases published to `latest` tag

### 15.3 Changelog Generation

**Tool:** Conventional Commits + standard-version or release-please

**Conventional Commit Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature (MINOR version bump)
- `fix`: Bug fix (PATCH version bump)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature or bug fix)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, tooling, dependencies

**Examples:**
```
feat(toolbar): add text highlight color picker

Adds a color picker to the toolbar for highlighting text with custom colors.

Closes #42
```

```
fix(math): resolve KaTeX rendering issue in Safari

KaTeX equations were not rendering correctly in Safari due to CSS issue.

Fixes #58
```

```
feat(extensions)!: change MathExtension API

BREAKING CHANGE: MathExtension now requires `katex` option in config.

Migration:
- Before: `MathExtension`
- After: `MathExtension.configure({ katex: true })`
```

**CHANGELOG.md Format:**
```markdown
# Changelog

## [0.2.0] - 2026-03-15

### Features
- **toolbar:** add text highlight color picker (#42)
- **extensions:** add CommentExtension for teacher feedback (#45)

### Bug Fixes
- **math:** resolve KaTeX rendering issue in Safari (#58)

### BREAKING CHANGES
- **extensions:** MathExtension now requires `katex` option in config

## [0.1.1] - 2026-02-20

### Bug Fixes
- **upload:** fix image upload progress indicator (#32)
```

**Acceptance Criteria:**
- All commits follow conventional commit format
- Changelog is auto-generated from commits
- Changelog includes breaking changes section
- Changelog links to GitHub issues/PRs

### 15.4 npm Publishing Workflow

**Manual Publishing (Phase 1-2):**
```bash
# 1. Ensure clean working directory
git status

# 2. Run tests
npm run test

# 3. Build package
npm run build

# 4. Bump version and generate changelog
npx standard-version

# 5. Push to GitHub
git push --follow-tags origin main

# 6. Publish to npm
npm publish
```

**Automated Publishing (Phase 3):**
```yaml
# .github/workflows/publish.yml
name: Publish to npm
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Acceptance Criteria:**
- Package builds successfully
- All tests pass before publishing
- Version number matches git tag
- Published to npm registry
- GitHub release created with changelog

### 15.5 Breaking Change Policy

**Definition:** A breaking change is any change that requires consumers to modify their code.

**Examples of Breaking Changes:**
- Removing or renaming public API
- Changing function signatures
- Changing default behavior
- Removing or renaming CSS classes
- Changing peer dependency requirements

**Breaking Change Process:**
1. Document breaking change in commit message (`BREAKING CHANGE:` footer)
2. Include migration guide in changelog
3. Bump MAJOR version (or MINOR if pre-1.0.0)
4. Announce in release notes
5. Update documentation

**Acceptance Criteria:**
- Breaking changes are clearly marked in commits
- Migration guides are provided
- Breaking changes are announced in advance (if possible)
- Major version bump for breaking changes (post-1.0.0)

### 15.6 Deprecation Policy

**Goal:** Give consumers time to migrate before removing features

**Deprecation Process:**
1. Mark feature as deprecated in code (JSDoc comment)
2. Log deprecation warning in console (development mode only)
3. Document deprecation in changelog
4. Wait at least 1 MINOR version before removal
5. Remove in next MAJOR version

**Example:**
```typescript
/**
 * @deprecated Use `editor.commands.insertMath()` instead. Will be removed in v2.0.0.
 */
export const insertEquation = (latex: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('insertEquation is deprecated. Use editor.commands.insertMath() instead.')
  }
  return editor.commands.insertMath({ latex })
}
```

**Deprecation Timeline:**
- **v1.1.0:** Feature deprecated, warning added
- **v1.2.0:** Feature still available, warning remains
- **v2.0.0:** Feature removed

**Acceptance Criteria:**
- Deprecated features log warnings (dev mode only)
- Deprecations documented in changelog
- At least 1 MINOR version notice before removal
- Migration path provided

### 15.7 Git Branching Strategy

**Branch Types:**
- `main`: Stable, production-ready code
- `develop`: Integration branch for next release (optional, Phase 3)
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches
- `release/*`: Release preparation branches (optional)

**Workflow (Phase 1-2):**
```
main (stable)
  ↑
  └── feature/comment-bubbles
  └── fix/safari-rendering
```

**Workflow (Phase 3, with develop branch):**
```
main (stable)
  ↑
develop (next release)
  ↑
  ├── feature/collaboration
  ├── feature/drag-drop
  └── fix/mobile-toolbar
```

**Merge Strategy:**
- Feature branches merge to `main` (or `develop`)
- Squash commits on merge (clean history)
- Delete branch after merge

**Acceptance Criteria:**
- `main` branch is always stable
- Feature branches are short-lived (< 2 weeks)
- Commit history is clean and readable
- Tags mark releases on `main` branch

---

## 16. Success Metrics

### 16.1 Package Quality Metrics

**Bundle Size:**
- **Target:** Core < 50KB gzip
- **Measurement:** `bundlesize` in CI
- **Threshold:** Fail if exceeds 55KB gzip

**Type Coverage:**
- **Target:** 100% (no `any` in public API)
- **Measurement:** TypeScript compiler strict mode
- **Threshold:** Fail if `any` types in public API

**Test Coverage:**
- **Target:** 80%+ (Phase 1), 85%+ (Phase 2), 90%+ (Phase 3)
- **Measurement:** Vitest coverage report
- **Threshold:** Fail if below target

**Lighthouse Score:**
- **Target:** 90+ performance, 100 accessibility
- **Measurement:** Lighthouse CI
- **Threshold:** Warn if < 90 performance, fail if < 100 accessibility

**npm Package Score:**
- **Target:** 90+ (quality, popularity, maintenance)
- **Measurement:** https://npms.io/
- **Threshold:** Aspirational (no CI enforcement)

**Acceptance Criteria:**
- All metrics tracked in CI
- Metrics displayed in README badges
- Regressions trigger warnings or failures

### 16.2 Developer Experience Metrics

**Time to First Render:**
- **Target:** < 5 minutes from `npm install` to working editor
- **Measurement:** Manual testing with fresh project
- **Threshold:** Aspirational (tracked in documentation)

**API Surface Area:**
- **Target:** Minimal public API (< 20 exported symbols in Phase 1)
- **Measurement:** Count of exported functions/classes/types
- **Threshold:** Review if exceeds 30 symbols

**Documentation Completeness:**
- **Target:** 100% of public API documented
- **Measurement:** Manual review
- **Threshold:** All public APIs have JSDoc comments

**TypeScript IntelliSense Quality:**
- **Target:** All props/methods have autocomplete and type hints
- **Measurement:** Manual testing in VS Code
- **Threshold:** No `any` types in autocomplete

**Example Code Quality:**
- **Target:** All examples in README are copy-paste ready
- **Measurement:** Manual testing
- **Threshold:** All examples run without modification

**Acceptance Criteria:**
- Time to first render documented in README
- API surface area reviewed before each release
- All public APIs have JSDoc comments
- Examples tested before each release

### 16.3 Adoption Metrics (Aspirational)

**npm Downloads:**
- **Phase 1 Target:** 100 downloads/month
- **Phase 2 Target:** 500 downloads/month
- **Phase 3 Target:** 1,000 downloads/month
- **Measurement:** npm stats (https://npm-stat.com/)

**GitHub Stars:**
- **Phase 1 Target:** 10 stars
- **Phase 2 Target:** 50 stars
- **Phase 3 Target:** 100 stars
- **Measurement:** GitHub repository

**GitHub Issues:**
- **Target:** < 10 open issues at any time
- **Measurement:** GitHub issues page
- **Threshold:** Triage weekly, close stale issues

**Community Contributions:**
- **Target:** 1+ external contributor by Phase 3
- **Measurement:** GitHub contributors page
- **Threshold:** Aspirational (no enforcement)

**Acceptance Criteria:**
- Adoption metrics tracked monthly
- Metrics inform roadmap priorities
- Community feedback incorporated into releases

### 16.4 Quality Gates for Each Phase

**Phase 1 (v0.1.0) — MVP Release:**
- [ ] Bundle size < 50KB gzip
- [ ] Test coverage > 80%
- [ ] Lighthouse accessibility score = 100
- [ ] All public APIs documented
- [ ] README has working examples
- [ ] No high/critical security vulnerabilities
- [ ] Passes manual testing on Chrome, Firefox, Safari
- [ ] TypeScript strict mode enabled

**Phase 2 (v0.2.0-v0.4.0) — Enhanced Features:**
- [ ] Bundle size < 50KB gzip (core), < 150KB gzip (with KaTeX)
- [ ] Test coverage > 85%
- [ ] Lighthouse performance score > 90
- [ ] E2E tests for critical paths
- [ ] Mobile testing on iOS Safari, Android Chrome
- [ ] Dark mode meets WCAG AA contrast
- [ ] Comment system fully functional
- [ ] i18n support (English, Traditional Chinese)

**Phase 3 (v0.5.0+) — Advanced Features:**
- [ ] Bundle size < 50KB gzip (core), tree-shaking verified
- [ ] Test coverage > 90%
- [ ] Lighthouse performance score > 95
- [ ] E2E tests for all major workflows
- [ ] Collaboration features tested with multiple users
- [ ] Mobile optimization complete
- [ ] CI/CD automated publishing
- [ ] Third-party accessibility audit (optional)

---

## 17. Glossary

### 17.1 Key Terms

**TipTap**
A headless, framework-agnostic rich text editor built on ProseMirror. Provides a modern, extensible API for building custom editors.

**ProseMirror**
The underlying editor framework that powers TipTap. Provides the core document model, schema, and transformation system.

**Extension**
A modular unit of functionality in TipTap. Extensions can add nodes (block-level elements), marks (inline formatting), or commands (actions).

**Mark**
Inline formatting applied to text (e.g., bold, italic, link, highlight). Marks can overlap and be combined.

**Node**
Block-level or leaf element in the document (e.g., paragraph, heading, image, list). Nodes form a tree structure.

**Preset**
A pre-configured set of extensions, toolbar configuration, and theme settings. RTEditor provides `basePreset`, `teacherPreset`, and `studentPreset`.

**Composable**
A Vue 3 Composition API function that encapsulates reusable logic. RTEditor provides composables like `useEditor`, `useUpload`, `useTheme`.

**Schema**
The document structure definition in ProseMirror. Defines allowed nodes, marks, and their relationships.

**Command**
An action that modifies the editor state (e.g., `toggleBold()`, `insertImage()`, `setContent()`). Commands are chainable.

**Transaction**
An atomic change to the editor state. Multiple operations can be grouped into a single transaction for undo/redo.

**Upload Handler**
A consumer-provided callback function that handles file uploads. Returns a promise with the uploaded file URL.

**Headless**
An architecture where the core logic is separated from the UI. Consumers can build custom UIs while using the core editor logic.

**Tree-Shaking**
A build optimization that removes unused code from the final bundle. Requires ESM modules and side-effect-free code.

**Lazy Loading**
Loading code or assets on-demand rather than upfront. Reduces initial bundle size and improves performance.

**SSR (Server-Side Rendering)**
Rendering Vue components on the server and sending HTML to the client. Improves initial load time and SEO.

**CSP (Content Security Policy)**
HTTP headers that restrict what resources a web page can load. Prevents XSS attacks by blocking inline scripts.

**WCAG (Web Content Accessibility Guidelines)**
International standards for web accessibility. WCAG 2.1 AA is the target compliance level for RTEditor.

**ARIA (Accessible Rich Internet Applications)**
HTML attributes that improve accessibility for screen readers and assistive technologies (e.g., `aria-label`, `aria-live`).

**Semantic Versioning (semver)**
A versioning scheme (MAJOR.MINOR.PATCH) that communicates the nature of changes in each release.

**Conventional Commits**
A commit message format that enables automated changelog generation and semantic versioning.

**Vitest**
A fast, Vite-native testing framework for unit and component tests. Used for all RTEditor tests.

**Playwright**
A browser automation tool for end-to-end testing. Supports Chrome, Firefox, Safari (WebKit).

**KaTeX**
A fast math rendering library for LaTeX equations. Used in RTEditor's MathExtension.

**DOMPurify**
A library for sanitizing HTML to prevent XSS attacks. Used when importing user-provided HTML.

### 17.2 Abbreviations

**API** — Application Programming Interface
**CI/CD** — Continuous Integration / Continuous Deployment
**CJS** — CommonJS (module format)
**CSS** — Cascading Style Sheets
**CSP** — Content Security Policy
**DX** — Developer Experience
**E2E** — End-to-End (testing)
**ESM** — ECMAScript Modules (module format)
**FCP** — First Contentful Paint (performance metric)
**HTML** — HyperText Markup Language
**i18n** — Internationalization (18 letters between 'i' and 'n')
**JSON** — JavaScript Object Notation
**JSDoc** — JavaScript Documentation (comment format)
**LCP** — Largest Contentful Paint (performance metric)
**LTR** — Left-to-Right (text direction)
**MVP** — Minimum Viable Product
**npm** — Node Package Manager
**OWASP** — Open Web Application Security Project
**PDF** — Portable Document Format
**PR** — Pull Request
**RTL** — Right-to-Left (text direction)
**SRI** — Subresource Integrity
**SSR** — Server-Side Rendering
**TTI** — Time to Interactive (performance metric)
**UI** — User Interface
**URL** — Uniform Resource Locator
**UX** — User Experience
**WCAG** — Web Content Accessibility Guidelines
**XSS** — Cross-Site Scripting (security vulnerability)

### 17.3 RTEditor-Specific Terms

**RTEditor**
The main Vue component exported by `@timothyphchan/rteditor`. Renders the rich text editor.

**RTToolbar**
The toolbar component that displays formatting buttons. Can be customized or replaced.

**RTBubbleMenu**
A floating menu that appears when text is selected. Used for quick formatting actions.

**RTCommentBubble**
A floating bubble that displays comment threads. Part of the comment system (Phase 2).

**basePreset**
Minimal preset with essential formatting features. Good starting point for customization.

**teacherPreset**
Preset optimized for teachers. Includes comment bubbles, lesson plan templates, and advanced formatting.

**studentPreset**
Preset optimized for students. Simplified toolbar, focus on note-taking, checklists.

**MathExtension**
Custom TipTap extension for LaTeX math equations. Uses KaTeX for rendering.

**ImageUploadExtension**
Custom TipTap extension for image uploads. Uses consumer-provided upload handler. Supports JPEG, PNG, GIF, WebP (5 MB limit).

**FileAttachmentExtension**
Custom TipTap extension for file attachments (Phase 2). Handles PDF inline preview via `<iframe>` and Word/Excel/PowerPoint download cards (1 MB limit).

**CommentExtension**
Custom TipTap extension for inline comments and threading (Phase 2).

**useEditor**
Composable for managing editor instance lifecycle. Handles initialization and cleanup.

**useUpload**
Composable for handling file uploads. Wraps consumer-provided upload handler.

**useTheme**
Composable for theme customization. Manages CSS custom properties.

**exportHTML**
Utility function to export editor content as HTML string.

**exportJSON**
Utility function to export editor content as ProseMirror JSON.

**exportPDF**
Utility function to export editor content as PDF (Phase 2).

**exportMarkdown**
Utility function to export editor content as Markdown (Phase 2).

**importCKEditorHTML**
Utility function to normalize CKEditor 4 HTML for RTEditor consumption (Section 18.5).

**DKI (Diocese Key Information System)**
School management system — primary downstream consumer of RTEditor. Laravel 5.7, currently Vue 2.5 (must upgrade to Vue 3 to use RTEditor), CKEditor 4.

**DSI (Diocese School Information System)**
Diocesan school information system — primary downstream consumer of RTEditor. Laravel 5.4, currently Vue 2.4 (must upgrade to Vue 3 to use RTEditor), CKEditor 4.

**vue-ckeditor2**
The current Vue 2 wrapper for CKEditor 4 used in DKI and DSI. Will be replaced by RTEditor (after Vue 3 upgrade).

---

## 18. DKI / DSI Project Compatibility

### 18.1 Context & Motivation

RTEditor is designed as a general-purpose npm package, but its primary downstream consumers will be two existing internal projects:

- **DKI** — A school management system (Laravel 5.7, PHP 7.1+, Vue 2.5, Vuex 3, Laravel Mix 2)
- **DSI** — A diocesan school information system (Laravel 5.4, PHP 5.6+, Vue 2.4, Laravel Mix 0.8)

Both projects currently use **CKEditor 4** via the `vue-ckeditor2` Vue 2 wrapper component for rich text editing across multiple modules (school news, e-notices, intra-mail, forums, reports, admission forms, etc.).

**Goal:** RTEditor is a **Vue 3 only** package. DKI and DSI must **upgrade to Vue 3** before they can adopt RTEditor as a drop-in CKEditor 4 replacement. RTEditor will NOT provide Vue 2 compatibility wrappers or use vue-demi. The upgrade path for DKI/DSI is: (1) migrate from Vue 2 to Vue 3, then (2) replace CKEditor 4 with RTEditor.

### 18.2 Current CKEditor Usage in DKI / DSI

**DKI — CKEditor Integration Points:**
| Module | Component | Config |
|--------|----------|--------|
| School News | `SchoolNewsForm.vue` | `ckeditor_cfg` (full toolbar) |
| E-Notice | `ENoticeForm.vue` | `ckeditor_cfg` (full toolbar) |
| Student Admission Form | `StudentAdmissionFormSetting.vue` | `ckeditor_standard` (simplified) |
| Student Admission Mail | `StudentAdmissionMailSetting.vue` | `ckeditor_cfg` |
| Student Admission Mail Template | `StudentAdmissionMailTemplate.vue` | `ckeditor_cfg` |
| Pick-Up Card | `PickUpCardForm.vue` | `ckeditor_standard` |

**DSI — CKEditor Integration Points:**
| Module | Component | Config |
|--------|----------|--------|
| Intra-Mail Compose | `ComposeMail.vue` | `ckeditor_cfg` (full toolbar) |
| Intra-Mail Preference | `Preference.vue` | `ckeditor_cfg` |
| Intra-Mail Read | `read-mail.vue` | `ckeditor_cfg` |
| Photo Album | `photo-new.vue` | `ckeditor_cfg` |
| School Activity | `school-activity.vue` | `ckeditor_cfg` |
| Forum Topics | `kla-forum-topic.vue` | `ckeditor_cfg` |
| Report Mail | `report-mail.vue` | `ckeditor_cfg` |

**Common CKEditor Configuration Patterns:**
Both projects use a mixin-based config approach with two profiles:
- `ckeditor_cfg` — Full toolbar (bold, italic, underline, strike, sub/super, line height, colors, font size, alignment, lists, indent, links, tables, horizontal rule, symbols, paste from Word)
- `ckeditor_standard` / `ckeditor_cfg_for_app` — Simplified toolbar (bold, italic, underline, colors, lists)

**Integration Pattern (both projects):**
```html
<!-- Current CKEditor 4 usage via vue-ckeditor2 -->
<ckeditor v-model="form.content" :config="ckeditor_cfg"></ckeditor>
```

### 18.3 Vue 3 Requirement & DKI/DSI Upgrade Path

**RTEditor is Vue 3 only.** There will be no Vue 2 compatibility layer, no vue-demi integration, and no separate `@timothyphchan/rteditor-vue2` wrapper package. DKI and DSI must upgrade to Vue 3 before they can integrate RTEditor.

**Peer Dependency:**
```json
{
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}
```

**Rationale:**
- Vue 2 reached End of Life on **December 31, 2023** — it no longer receives security patches or bug fixes
- Maintaining dual Vue 2/Vue 3 support (via vue-demi or wrapper packages) adds significant complexity, increases bundle size, and limits use of Vue 3 features (Composition API, `<script setup>`, Teleport, Suspense)
- TipTap 2.x (RTEditor's core dependency) is designed for Vue 3 and its Vue 2 adapter is deprecated
- A clean Vue 3-only codebase is easier to maintain, test, and extend

**DKI/DSI Vue 3 Migration Path (prerequisite for RTEditor adoption):**

DKI and DSI should follow this phased approach to upgrade from Vue 2 to Vue 3:

1. **Phase A — Preparation:**
   - Audit Vue 2 components for deprecated patterns (`$on`, `$off`, `$once`, filters, `$listeners`, `$attrs` inheritance)
   - Replace `vue-ckeditor2` with RTEditor (done as part of Phase C below)
   - Update to latest Vue 2.7 (which backports Composition API and `<script setup>`)

2. **Phase B — Vue 3 Migration Build:**
   - Use `@vue/compat` (Vue 3 compatibility build) to run Vue 2 code on Vue 3 runtime
   - Resolve deprecation warnings incrementally
   - Update `v-model` bindings from `value`/`input` to `modelValue`/`update:modelValue`
   - Replace Vuex 3 with Vuex 4 or Pinia (DKI only)

3. **Phase C — RTEditor Integration:**
   - Once running on Vue 3 (or `@vue/compat`), install RTEditor: `npm install @timothyphchan/rteditor`
   - Replace CKEditor components with `<rt-editor>` (see Section 18.9 Migration Guide)
   - Remove CKEditor 4 and `vue-ckeditor2` dependencies

4. **Phase D — Cleanup:**
   - Remove `@vue/compat` once all deprecation warnings are resolved
   - Upgrade Laravel Mix to Vite (recommended but optional)

**Resources:**
- [Official Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [@vue/compat Documentation](https://v3-migration.vuejs.org/migration-build.html)
- [Vue 2 to Vue 3 Migration Tool](https://github.com/nickmessing/vue-3-migration-guide)

**Acceptance Criteria:**
- RTEditor requires `vue >= 3.3.0` as a peer dependency
- RTEditor uses Vue 3 Composition API and `<script setup>` without restriction
- `v-model` uses Vue 3 convention only (`modelValue` / `update:modelValue`)
- No Vue 2 compatibility code in the RTEditor codebase
- DKI/DSI migration guide documents the Vue 3 upgrade prerequisite clearly

### 18.4 CKEditor 4 → RTEditor Feature Mapping

RTEditor must support all formatting features currently used in DKI/DSI CKEditor configurations:

**Full Toolbar (`ckeditor_cfg`) → `teacherPreset` Mapping:**
| CKEditor 4 Feature | CKEditor Button | RTEditor Equivalent | Phase |
|--------------------|-----------------|--------------------|-------|
| Undo / Redo | `Undo`, `Redo` | Built-in (TipTap history) | 1 |
| Bold / Italic / Underline | `Bold`, `Italic`, `Underline` | `toggleBold()`, `toggleItalic()`, `toggleUnderline()` | 1 |
| Strikethrough | `Strike` | `toggleStrike()` | 1 |
| Subscript / Superscript | `Subscript`, `Superscript` | `toggleSubscript()`, `toggleSuperscript()` | 1 |
| Line Height | `lineheight` | Custom extension (Phase 2) | 2 |
| Text Color | `TextColor` | `setColor()` (Phase 1 stretch / Phase 2) | 2 |
| Background Color | `BGColor` | `setHighlight()` (Phase 1 stretch / Phase 2) | 2 |
| Font Size | `FontSize` | `setFontSize()` (Phase 2) | 2 |
| Text Alignment | `JustifyLeft/Center/Right` | `setTextAlign()` | 1 |
| Numbered List | `NumberedList` | `toggleOrderedList()` | 1 |
| Bulleted List | `BulletedList` | `toggleBulletList()` | 1 |
| Indent / Outdent | `Indent`, `Outdent` | `indent()`, `outdent()` (Phase 2) | 2 |
| Links | `Link`, `Unlink` | `setLink()`, `unsetLink()` | 1 |
| Tables | `Table` | `insertTable()` (Phase 2) | 2 |
| Horizontal Rule | `HorizontalRule` | `setHorizontalRule()` | 1 |
| Symbols | `Symbol` | Special characters extension (Phase 3) | 3 |
| Paste from Word | `PasteFromWord` | Built-in (TipTap paste handling + DOMPurify) | 1 |
| Image Insert | `Image` | `insertImage()` via upload handler | 1 |
| Math Equations | `eqneditor` | `MathExtension` (KaTeX) | 1-2 |
| Word Count | `wordcount` | `WordCountExtension` | 1 |
| Smiley / Emoji | `smiley` | Emoji extension (Phase 3) | 3 |

**Simplified Toolbar (`ckeditor_standard`) → `studentPreset` Mapping:**
| CKEditor 4 Feature | RTEditor Equivalent | Phase |
|--------------------|---------------------|-------|
| Bold / Italic / Underline | Core marks | 1 |
| Subscript / Superscript | Core marks | 1 |
| Line Height / Font Size | Custom extensions | 2 |
| Alignment | `setTextAlign()` | 1 |
| Lists | `toggleOrderedList()`, `toggleBulletList()` | 1 |
| Tables / HR / Symbols | Extensions | 2-3 |
| Links | `setLink()` | 1 |
| Image | `insertImage()` | 1 |

**Phase 1 Gap Analysis:**
The following CKEditor features used in DKI/DSI will NOT be available in RTEditor Phase 1:
- ❌ Line Height
- ❌ Text Color / Background Color
- ❌ Font Size selector
- ❌ Indent / Outdent
- ❌ Tables
- ❌ Special Characters / Symbols
- ❌ Emoji / Smiley

These are scheduled for Phase 2-3. DKI/DSI integration should target **Phase 2** when feature parity is closer.

### 18.5 HTML Content Interoperability

**Critical Requirement:** DKI and DSI store rich text content as **HTML strings** in their databases. RTEditor must be able to:

1. **Import existing CKEditor HTML** — Parse and render HTML previously created by CKEditor 4
2. **Export compatible HTML** — Output HTML that renders correctly in existing DKI/DSI Blade templates

**CKEditor 4 HTML Patterns to Support:**

```html
<!-- CKEditor 4 uses <br> for line breaks (ENTER_BR mode) -->
<p>Line one<br>Line two<br>Line three</p>

<!-- CKEditor 4 uses inline styles for formatting -->
<span style="font-size:14px">Sized text</span>
<span style="color:#ff0000">Red text</span>
<span style="background-color:#ffff00">Highlighted text</span>
<span style="line-height:2">Double spaced</span>

<!-- CKEditor 4 uses <strong> and <em> tags -->
<strong>Bold text</strong>
<em>Italic text</em>
<u>Underlined text</u>

<!-- CKEditor 4 table structure -->
<table border="1" cellpadding="1" cellspacing="1">
  <tbody>
    <tr><td>Cell 1</td><td>Cell 2</td></tr>
  </tbody>
</table>

<!-- CKEditor 4 image insertion -->
<img alt="" src="/uploads/image.jpg" style="width:300px;height:200px" />
```

**RTEditor Import Handling:**
```typescript
// Utility to normalize CKEditor 4 HTML for RTEditor consumption
export const importCKEditorHTML = (html: string): string => {
  // 1. Sanitize with DOMPurify
  let cleaned = DOMPurify.sanitize(html)

  // 2. Convert CKEditor-specific patterns
  // - <br> line breaks → preserve (TipTap supports hardBreak)
  // - Inline styles → preserve where possible, convert to marks/nodes
  // - CKEditor class names → strip (not needed)

  return cleaned
}

// Usage in DKI/DSI integration
const editor = useEditor({
  content: importCKEditorHTML(existingHTMLFromDatabase),
})
```

**RTEditor Export for DKI/DSI:**
```typescript
// Export HTML compatible with existing DKI/DSI rendering
export const exportForLegacy = (editor: Editor): string => {
  const html = editor.getHTML()

  // Ensure output uses tags DKI/DSI CSS already styles:
  // - <strong>, <em>, <u>, <s> (standard tags)
  // - <h1>-<h6> (headings)
  // - <ul>, <ol>, <li> (lists)
  // - <table>, <tr>, <td> (tables)
  // - <img> with src attribute (images)
  // - <a> with href attribute (links)

  return html
}
```

**Acceptance Criteria:**
- HTML created by CKEditor 4 loads correctly in RTEditor
- HTML exported by RTEditor renders correctly in DKI/DSI Blade views
- No data loss when round-tripping (CKEditor → DB → RTEditor → DB → Blade)
- Inline styles from CKEditor 4 are preserved or converted appropriately
- `ENTER_BR` mode HTML (CKEditor default in DKI/DSI) is handled correctly
- Images with relative URLs (e.g., `/uploads/image.jpg`) are preserved

### 18.6 Laravel Blade Integration

**DKI/DSI Architecture:** Both projects currently use Laravel Blade templates with Vue 2 components mounted inside `<script>` blocks. After upgrading to Vue 3 (see Section 18.3), the Blade template structure remains the same — only the Vue component code changes.

**Current CKEditor Integration Pattern (Blade + Vue 2):**
```blade
{{-- DKI: resources/views/comm-management/school-news/form.blade.php --}}
@section('content')
<div id="app">
  <school-news-form :data="{{ json_encode($news) }}"></school-news-form>
</div>
@endsection

@push('scripts')
<script src="{{ mix('js/communication_management.js') }}"></script>
@endpush
```

```javascript
// Vue 2 component using CKEditor (BEFORE migration)
import Ckeditor from 'vue-ckeditor2'
import CKeditor_config from '../../mixins/ckeditor_config'

export default {
  mixins: [CKeditor_config],
  components: { Ckeditor },
  // Template: <ckeditor v-model="form.content" :config="ckeditor_cfg"></ckeditor>
}
```

**Target RTEditor Integration Pattern (Blade + Vue 3):**
```blade
{{-- After migration: Blade structure unchanged --}}
@section('content')
<div id="app">
  <school-news-form :data="{{ json_encode($news) }}"></school-news-form>
</div>
@endsection

@push('scripts')
<script src="{{ mix('js/communication_management.js') }}"></script>
@endpush
```

```vue
<!-- Vue 3 component using RTEditor (AFTER Vue 3 upgrade + RTEditor migration) -->
<script setup>
import { ref } from 'vue'
import { RTEditor } from '@timothyphchan/rteditor'

const props = defineProps({ data: Object })
const content = ref(props.data?.content || '')
</script>

<template>
  <rt-editor v-model="content" preset="teacher" :upload-handler="uploadHandler" />
</template>
```

```javascript
// Or using Options API (Vue 3 compatible):
import { RTEditor } from '@timothyphchan/rteditor'

export default {
  components: { RTEditor },
  props: { data: Object },
  data() {
    return {
      form: { content: this.data?.content || '' }
    }
  },
  // Template: <rt-editor v-model="form.content" preset="teacher" :upload-handler="uploadHandler"></rt-editor>
}
```

**Upload Handler for Laravel (DKI/DSI):**
```javascript
// Reusable upload handler for DKI/DSI Laravel backend
const laravelUploadHandler = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axios.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    }
  })

  return { url: response.data.url }
}

// Usage
// <rt-editor v-model="form.content" :upload-handler="laravelUploadHandler"></rt-editor>
```

**Acceptance Criteria:**
- RTEditor works inside Laravel Blade templates
- CSRF token handling documented for upload handlers
- No conflicts with existing global Vue instance in DKI/DSI
- Component can be registered globally or locally
- RTEditor CSS does not conflict with Bootstrap 3/4 used in DKI/DSI

### 18.7 Build Tooling Compatibility

**DKI/DSI Build Stack:**
- **DKI:** Laravel Mix 2 (Webpack 3), ES2015+
- **DSI:** Laravel Mix 0.8 (Webpack 2), ES2015

**RTEditor must provide:**

**1. Pre-built UMD/CJS Bundle (for older build systems):**
```javascript
// CJS require (works with Webpack 2/3)
const { RTEditor } = require('@timothyphchan/rteditor')

// Or direct script tag for legacy pages
// <script src="/node_modules/@timothyphchan/rteditor/dist/rteditor.umd.js"></script>
```

**2. ESM Entry Point (for modern build systems):**
```javascript
// ESM import (Webpack 4+, Vite)
import { RTEditor } from '@timothyphchan/rteditor'
```

**3. CSS as Separate File:**
```javascript
// CSS can be imported separately (required for Laravel Mix)
require('@timothyphchan/rteditor/dist/style.css')
// or
import '@timothyphchan/rteditor/dist/style.css'
```

**package.json Exports (already defined in Section 9, enhanced for compatibility):**
```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "browser": "./dist/index.umd.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "browser": "./dist/index.umd.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/style.css",
    "./core": {
      "import": "./dist/core.mjs",
      "require": "./dist/core.cjs"
    }
  }
}
```

**Acceptance Criteria:**
- Package works with Webpack 2+ (DSI), Webpack 3+ (DKI), and Vite
- CJS bundle available for `require()` syntax
- CSS importable as a separate file (not bundled into JS)
- No ES2020+ syntax in CJS/UMD bundles (transpiled to ES2015)
- Package installable via `npm install` in both DKI and DSI projects
- Requires `vue >= 3.3.0` as peer dependency

### 18.8 CKEditor Config → RTEditor Preset Mapping

DKI and DSI use mixin-based CKEditor configurations. RTEditor must provide equivalent presets that map to these configurations.

**DKI `ckeditor_cfg` → RTEditor `teacherPreset`:**
```javascript
// Before (DKI - CKEditor 4 mixin)
import CKeditor_config from '../../mixins/ckeditor_config'
export default {
  mixins: [CKeditor_config],
  // Template: <ckeditor v-model="content" :config="ckeditor_cfg"></ckeditor>
}

// After (DKI - RTEditor)
// Template: <rt-editor v-model="content" preset="teacher"></rt-editor>
// OR with explicit config:
// <rt-editor v-model="content" :toolbar="[
//   'undo', 'redo', '|',
//   'bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', '|',
//   'lineHeight', '|', 'textColor', 'bgColor', '|', 'fontSize', '|',
//   'alignLeft', 'alignCenter', 'alignRight', '|',
//   'bulletList', 'orderedList', 'indent', 'outdent', '|',
//   'link', '|', 'table', 'horizontalRule', 'symbol', '|', 'image'
// ]"></rt-editor>
```

**DKI `ckeditor_standard` → RTEditor `studentPreset`:**
```javascript
// Before (DKI - CKEditor 4 mixin)
// Template: <ckeditor v-model="content" :config="ckeditor_standard"></ckeditor>

// After (DKI - RTEditor)
// Template: <rt-editor v-model="content" preset="student"></rt-editor>
// OR: <rt-editor v-model="content" :toolbar="[
//   'bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', '|',
//   'fontSize', '|',
//   'alignLeft', 'alignCenter', 'alignRight', '|',
//   'bulletList', 'orderedList', '|',
//   'link', '|', 'table', 'horizontalRule', 'symbol', '|', 'image'
// ]"></rt-editor>
```

**Configuration Equivalence Table:**
| CKEditor 4 Config Property | RTEditor Equivalent |
|----------------------------|---------------------|
| `height: '500'` | `style="height: 500px"` or `:editorStyle="{ height: '500px' }"` |
| `width: '100%'` | Default (100% width) |
| `enterMode: CKEDITOR.ENTER_BR` | `hardBreakOnEnter: true` option (Phase 2) |
| `allowedContent: true` | Default (ProseMirror schema-based) |
| `toolbarCanCollapse: true` | `collapsibleToolbar: true` option |
| `extraPlugins: '...'` | `extensions: [...]` array |
| `filebrowserUploadUrl: '...'` | `uploadHandler: async (file) => { ... }` |
| `language: 'en'` | `locale: 'en'` |
| `toolbar: [...]` | `toolbar: [...]` (different format, see above) |
| `removeDialogTabs: '...'` | Not needed (clean dialogs by default) |

### 18.9 Migration Guide for DKI / DSI

**Step-by-Step Migration Process (per component):**

**Prerequisite:** Ensure the project is running **Vue 3.3+** (see Section 18.3 for Vue 3 upgrade path).

**Step 1 — Install RTEditor:**
```bash
npm install @timothyphchan/rteditor
```

**Step 2 — Import CSS:**
```javascript
// In app.js or component
import '@timothyphchan/rteditor/style.css'
```

**Step 3 — Replace CKEditor Component:**
```diff
// In Vue component
- import Ckeditor from 'vue-ckeditor2'
- import CKeditor_config from '../../mixins/ckeditor_config'
+ import { RTEditor } from '@timothyphchan/rteditor'

  export default {
-   mixins: [CKeditor_config],
-   components: { Ckeditor },
+   components: { RTEditor },
  }
```

**Step 4 — Update Template:**
```diff
- <ckeditor v-model="form.content" :config="ckeditor_cfg"></ckeditor>
+ <rt-editor v-model="form.content" preset="teacher" :upload-handler="uploadHandler"></rt-editor>
```

**Step 5 — Add Upload Handler (if images are used):**
```javascript
methods: {
  async uploadHandler(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await axios.post('/api/upload/image', formData)
    return { url: data.url }
  }
}
```

**Step 6 — Verify Existing Content:**
- Load pages that display previously saved CKEditor HTML
- Verify formatting is preserved
- Test editing and re-saving

**Step 7 — Remove CKEditor (after full migration):**
```bash
npm uninstall ckeditor vue-ckeditor2
# Remove CKEditor mixin files:
# - resources/assets/js/mixins/ckeditor_config.js (DKI)
# - resources/assets/js/mixins/shared.js → remove ckeditor_cfg (DSI)
```

**Migration Priority (recommended order):**
1. **Pilot:** Pick one simple form (e.g., DKI `PickUpCardForm.vue` — uses `ckeditor_standard`)
2. **Expand:** Migrate remaining `ckeditor_standard` usages
3. **Full:** Migrate `ckeditor_cfg` usages (requires more toolbar features)
4. **Cleanup:** Remove CKEditor dependencies

### 18.10 Acceptance Criteria by Phase

**Phase 1 (v0.1.0) — Foundation:**
- [ ] RTEditor installable via `npm install` in DKI and DSI projects
- [ ] CJS bundle works with Webpack 2/3 (Laravel Mix 0.8 and 2.x)
- [ ] CSS importable as separate file
- [ ] HTML export compatible with existing DKI/DSI Blade templates
- [ ] CKEditor 4 HTML importable without data loss (basic formatting)
- [ ] Upload handler pattern documented with Laravel/Axios example
- [ ] No global CSS conflicts with Bootstrap 3/4

**Phase 2 (v0.2.0-v0.4.0) — Integration Ready:**
- [ ] Feature parity with `ckeditor_standard` config (all buttons mapped)
- [ ] DKI pilot migration completed (at least 1 component, after DKI upgrades to Vue 3)
- [ ] CKEditor inline styles (color, font-size, line-height) imported correctly
- [ ] `ENTER_BR` mode HTML handled correctly
- [ ] Tables extension available
- [ ] Text color / background color available
- [ ] Migration guide published in documentation (including Vue 3 upgrade prerequisite)

**Phase 3 (v0.5.0+) — Full Migration:**
- [ ] Feature parity with `ckeditor_cfg` config (all buttons mapped)
- [ ] All DKI CKEditor components migrated
- [ ] All DSI CKEditor components migrated
- [ ] CKEditor dependencies fully removed from both projects
- [ ] Special characters / symbols extension available
- [ ] Font size / line height extensions available
- [ ] Performance benchmarked vs CKEditor 4 in DKI/DSI context

---

## 19. Layout & Visual Design — Notion-Inspired

### 19.1 Overall Design Direction

RTEditor's visual design follows a **Notion-inspired** aesthetic:

- **Content-first layout:** The writing surface dominates the screen. UI chrome (toolbar, sidebar, dialogs) is minimal and recedes when not in use.
- **Clean, minimal styling:** Generous whitespace, subtle borders (`1px solid` with light grays), no heavy shadows or gradients.
- **Block-based editing feel:** Each paragraph, heading, list, image, table, and embed is treated as a distinct visual block. Blocks can have hover-to-reveal drag handles (Phase 3) and slash-command insertion.
- **Subtle toolbar:** The toolbar uses a flat, low-contrast background (e.g., `#f9fafb`) with icon-only buttons by default. It does not dominate the visual hierarchy.
- **Typography-driven:** Clean font rendering, clear heading hierarchy, generous line-height (1.6), content looks great without any customization.
- **Light, airy feel:** Default background is white with light gray accents. No heavy borders between sections.

### 19.2 Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  .rte-editor  (width: 100% of parent)                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  .rte-toolbar  (sticky, top: 0, z-index: 10)              │  │
│  │  ← [B] [I] [U] [S] │ [H▾] │ [≡] [≡] │ [📎] │ [⛶] [#] → │  │
│  │  (horizontal scroll on mobile with ←/→ arrows)            │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │  .rte-body  (flex row on desktop)                          │  │
│  │  ┌──────────────────────────────┐ ┌──────────────────────┐ │  │
│  │  │  .rte-content               │ │  .rte-sidebar         │ │  │
│  │  │  (EditorContent area)       │ │  (comment sidebar,    │ │  │
│  │  │  width: flexible            │ │   320px, toggleable)  │ │  │
│  │  │                             │ │                       │ │  │
│  │  │  [RTBubbleMenu — floating]  │ │  [Comment 1]          │ │  │
│  │  │  [RTLinkDialog — modal]     │ │  [Comment 2]          │ │  │
│  │  │                             │ │  [Comment 3]          │ │  │
│  │  └──────────────────────────────┘ └──────────────────────┘ │  │
│  │                                                            │  │
│  │  .rte-toast-container  (fixed, bottom-right, z-index high) │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Full-screen mode: .rte-editor--fullscreen fills entire viewport │
└──────────────────────────────────────────────────────────────────┘
```

### 19.3 Toolbar — Sticky with Horizontal Scroll

**Positioning:**
- `position: sticky; top: 0; z-index: 10` — Toolbar remains visible when scrolling through long content.
- Consumer can override sticky top offset via `--rte-toolbar-sticky-top` (e.g., if there's a fixed header above the editor).

**Mobile Overflow Strategy:**
- On screens < 768px, toolbar items scroll horizontally instead of wrapping.
- Left and right scroll arrow buttons (`.rte-toolbar__scroll-left`, `.rte-toolbar__scroll-right`) appear at the edges when toolbar content overflows.
- Scroll arrows fade in/out based on scroll position (hidden when fully scrolled to that edge).
- Momentum scrolling enabled on iOS (`-webkit-overflow-scrolling: touch`).
- Scrollbar hidden for clean appearance (`scrollbar-width: none`).

**Toolbar Buttons:**
- All existing buttons (bold, italic, underline, strike, heading dropdown, lists, alignment, link, image/attach, undo/redo, etc.)
- **New: Full-screen toggle button** (`⛶` or expand icon) — toggles distraction-free mode
- **New: Word count toggle button** (`#` or counter icon) — toggles a floating word count info panel

### 19.4 Editor Width — 100% Default

- `width: 100%` — the editor fills its parent container.
- The **consumer** controls the maximum width by constraining the parent element (e.g., wrapping `<rt-editor>` in a `<div style="max-width: 800px">`).
- CSS variable `--rte-editor-max-width` defaults to `100%` but can be overridden for self-contained max-width.
- This approach works naturally in DKI/DSI where the editor sits inside form cards/panels of varying widths.

### 19.5 Comment System — Bubble + Sidebar

RTEditor uses a **dual comment UI** (like Google Docs):

**RTCommentBubble (P2-002):**
- Appears as a floating popover near highlighted/commented text when clicked or hovered.
- Shows the comment thread (original comment + replies) inline.
- Quick-reply input at the bottom.
- Used for quick, contextual interaction with a single comment.

**RTCommentSidebar (new — P2-020):**
- A right-side panel (`.rte-sidebar`, 320px wide on desktop) listing **all comments** in the document.
- Each comment entry is linked to highlighted text in the editor — clicking a sidebar comment scrolls to and highlights the associated text.
- Teacher review workflow: teachers can browse all comments sequentially.
- Toggle visibility via toolbar button or prop.
- **Desktop:** Sits alongside the editor content (flexbox row layout).
- **Tablet:** Overlays as a drawer from the right.
- **Mobile:** Collapses to a bottom panel (max-height: 50vh).

### 19.6 Word Count — Toggle Button

- Word count is NOT a persistent footer/status bar.
- A **toolbar button** toggles a small floating info panel showing:
  - Word count
  - Character count (with and without spaces)
  - Reading time estimate
- The panel appears near the toolbar button (like a dropdown/popover).
- Panel dismisses on click outside or pressing the toggle button again.

### 19.7 Full-Screen / Distraction-Free Mode

**Trigger:**
- Toolbar button (`⛶` expand icon) or keyboard shortcut (`F11` or `Ctrl+Shift+F` / `Cmd+Shift+F`)

**Behavior:**
- Editor container (`.rte-editor--fullscreen`) expands to fill the entire viewport (`position: fixed; inset: 0; z-index: 9999`).
- Toolbar remains visible but minimal (slim, subtle).
- Comment sidebar is hidden (can be re-opened if needed).
- Content area is centered with comfortable reading width (max ~720px) and generous vertical padding.
- Background uses `--rte-fullscreen-bg` (default: same as `--rte-background`).
- **Escape key** exits full-screen mode.
- Smooth transition animation (unless `prefers-reduced-motion`).
- All editor state (content, selection, undo history) is preserved.

### 19.8 Upload Feedback — Inline Placeholder + Toast

**During Upload:**
- An **inline placeholder node** appears in the editor at the insertion point.
- The placeholder shows: a loading spinner, file name, upload progress percentage.
- Placeholder is styled with `--rte-upload-placeholder-bg` and a dashed border.
- Placeholder is non-editable (ProseMirror node with `atom: true`).

**On Success:**
- Placeholder is replaced by the final content (image, PDF iframe, or download card).

**On Error:**
- Placeholder is removed from the editor.
- A **toast notification** appears in the bottom-right corner (`.rte-toast-container`).
- Toast shows error message (e.g., "Upload failed: file too large") with an error icon.
- Toast auto-dismisses after 5 seconds, or can be manually dismissed.
- Toast uses `--rte-toast-error-bg` styling.

### 19.9 PDF & Download Card — Resizable

- PDF `<iframe>` previews and download cards (Word/Excel/PPT) are **resizable**, just like images.
- Drag handles appear on the corners/edges when the node is selected.
- Minimum size: 200px wide for cards, 300px wide for PDF iframes.
- Maximum size: 100% of editor content width.
- Aspect ratio can be locked for PDF iframes (default: 4:3).

### 19.10 Acceptance Criteria

- [ ] Editor fills 100% of parent container width
- [ ] Toolbar sticks to top of viewport when scrolling
- [ ] Toolbar scrolls horizontally on mobile (< 768px) with arrow indicators
- [ ] Comment bubble appears on clicking commented text
- [ ] Comment sidebar lists all comments and links to highlighted text
- [ ] Comment sidebar is toggleable (toolbar button or prop)
- [ ] Word count toggle button shows/hides floating info panel
- [ ] Full-screen mode expands editor to fill viewport
- [ ] Full-screen mode exits via Escape key
- [ ] Upload shows inline placeholder with spinner during upload
- [ ] Upload errors display as toast notifications
- [ ] PDF iframes and download cards are resizable with drag handles
- [ ] Layout follows Notion-inspired clean, minimal aesthetic
- [ ] All layout features respect `prefers-reduced-motion`
- [ ] Comment sidebar responsive: beside editor (desktop), drawer (tablet), bottom panel (mobile)

---

## 20. AI Assistant (Cursor-Style Inline AI)

### 20.1 Overview

- Cursor/Notion AI-style inline floating panel
- Education-focused AI assistant built into the editor
- Provider-agnostic: callback-based handler, works with any AI backend
- Phase 4 feature (dedicated implementation phase)
- Supports English and Traditional Chinese (zh-TW)
- Target audience: teachers and students, kindergarten to university

### 20.2 Entry Points

All four entry points supported:

- **Toolbar button:** ✨ AI icon in toolbar
- **Keyboard shortcut:** `Ctrl+K` (Windows/Linux), `Cmd+K` (Mac)
- **Slash command:** `/ai` in editor (extends P2-008 slash command system)
- **Bubble menu:** "Ask AI" option when text is selected (extends P1-014 RTBubbleMenu)

### 20.3 Operation Modes

Two modes:

- **Generate mode** (no selection): User prompts AI to write new content at cursor position
  - Examples: "Write an introduction about photosynthesis", "Generate 5 quiz questions"
- **Transform mode** (text selected): User prompts AI to modify selected text
  - Examples: Rewrite, Summarize, Translate, Expand, Fix grammar, Explain, Continue

### 20.4 Quick Actions

Preset quick-action buttons for common operations:

- **Simplify** — Simplify text for target reading level
- **Translate** — Translate to specified language
- **Fix Grammar** — Correct spelling and grammar
- **Summarize** — Condense selected text
- **Expand** — Add more detail
- **Explain** — Explain at simpler level
- **Continue** — Write more based on existing text
- **Generate Questions** — Create comprehension questions (education-specific)
- **Create Rubric** — Generate assessment rubric (education-specific)

Plus freeform text prompt for any custom request.

### 20.5 UI Design — Floating AI Panel

- Inline floating panel that appears at cursor position (like Cursor/Notion AI)
- Component: `RTAIPanel.vue`
- Contains: prompt input, quick action buttons, response display area, action buttons
- Non-streaming: AI response appears all at once
- Panel is dismissible via Escape key or clicking outside
- Panel repositions to stay within viewport bounds
- ARIA attributes for accessibility: `role="dialog"`, `aria-label`, focus trap

Layout:

```
┌─────────────────────────────────────────┐
│ ✨ Ask AI...                            │
│ [Simplify] [Translate] [Grammar] [More▾]│
│ ┌─────────────────────────────────────┐ │
│ │ Type your prompt...                 │ │
│ └─────────────────────────────────────┘ │
│                            [Submit ↵]   │
│─────────────────────────────────────────│
│ (AI response area — shown after submit) │
│ The mitochondria plays a crucial role   │
│ in cellular respiration...              │
│                                         │
│ [✓ Accept] [✎ Edit] [✗ Reject] [↻ Retry]│
└─────────────────────────────────────────┘
```

### 20.6 Accept/Reject Flow

All actions available after AI responds:

| Action | Behavior |
|--------|----------|
| Accept | Insert at cursor (generate) or replace selection (transform). Close panel. |
| Accept & Edit | Insert content with highlight class `.rte-ai-inserted`. User can edit inline. Close panel. |
| Reject | Dismiss response, no editor change. Close panel. |
| Retry | Re-run same prompt, get new response. Stay in panel. |
| Edit Prompt | Return to prompt input with previous prompt pre-filled. Stay in panel. |

### 20.7 Backend Architecture — AI Handler Interface

Core callback-based interface (provider-agnostic):

```typescript
interface AIHandler {
  generate: (request: AIRequest) => Promise<AIResponse>
}

interface AIRequest {
  prompt: string
  selectedText?: string
  surroundingText?: string
  documentText?: string
  metadata?: AIMetadata
  action?: AIQuickAction
  locale?: string
  history?: never  // No conversation history — each prompt independent
}

type AIQuickAction = 'simplify' | 'translate' | 'grammar' | 'summarize' | 'expand' | 'explain' | 'continue' | 'questions' | 'rubric'

interface AIResponse {
  content: string
  format: 'html' | 'text'
  metadata?: Record<string, any>
}

interface AIMetadata {
  documentTitle?: string
  subject?: string
  gradeLevel?: number | string
  language?: string
  userRole?: 'teacher' | 'student'
  customFields?: Record<string, any>
}
```

Response format:

- `format: 'text'` — RTEditor inserts as plain paragraph
- `format: 'html'` — RTEditor sanitizes through DOMPurify before inserting

### 20.8 Three AI Provider Methods

All three use the same OpenAI-compatible API shape (`/v1/chat/completions`). The DKI Laravel controller is **one controller** — switch providers by changing `.env` vars only.

**Method 1 — eClass AI Proxy (Production)**

```env
RTEDITOR_AI_ENDPOINT=https://ai.eclasscloud.com/v1/chat/completions
RTEDITOR_AI_KEY=your-eclass-key
RTEDITOR_AI_MODEL=gpt-4o
```

**Method 2 — Local LLM via Ollama (Development)**

```env
RTEDITOR_AI_ENDPOINT=http://localhost:11434/v1/chat/completions
RTEDITOR_AI_KEY=ollama
RTEDITOR_AI_MODEL=llama3
```

**Method 3 — Direct OpenAI (Alternative)**

```env
RTEDITOR_AI_ENDPOINT=https://api.openai.com/v1/chat/completions
RTEDITOR_AI_KEY=sk-your-openai-key
RTEDITOR_AI_MODEL=gpt-4o
```

DKI Laravel controller pattern:

```php
// RTEditorAIController.php — same code for all 3 methods
public function generate(Request $request)
{
    $client = new \GuzzleHttp\Client();
    $response = $client->post(config('env.RTEDITOR_AI_ENDPOINT'), [
        'headers' => [
            'Authorization' => 'Bearer ' . config('env.RTEDITOR_AI_KEY'),
            'Content-Type' => 'application/json',
        ],
        'json' => [
            'model' => config('env.RTEDITOR_AI_MODEL', 'gpt-4o'),
            'temperature' => 0.7,
            'messages' => [
                ['role' => 'system', 'content' => $this->getSystemPrompt($request)],
                ['role' => 'user', 'content' => $this->buildUserMessage($request)],
            ],
        ],
    ]);
    $body = json_decode($response->getBody(), true);
    return response()->json([
        'content' => $body['choices'][0]['message']['content'],
        'format' => 'text',
    ]);
}
```

### 20.9 Pre-built Handler Factories

Two factory functions shipped as a separate tree-shakeable entry point:

```typescript
// import from '@timothyphchan/rteditor/ai-handlers'

// Generic proxy — works with any server endpoint
function createProxyAIHandler(options: {
  endpoint: string
  headers?: Record<string, string>
  transformRequest?: (request: AIRequest) => any
  transformResponse?: (response: any) => AIResponse
}): AIHandler

// DKI-specific — auto CSRF, uses window.axios
function createDKIAIHandler(options?: {
  endpoint?: string  // defaults to '/api/rteditor/ai'
  axiosInstance?: AxiosInstance  // defaults to window.axios
}): AIHandler
```

### 20.10 Context Configuration

Three configurable context levels:

| Level | Data Sent | Token Usage | Best For |
|-------|-----------|-------------|----------|
| `minimal` | `selectedText` + `prompt` | Low | Quick actions (grammar, translate) |
| `standard` (default) | `selectedText` + ~3 paragraphs surrounding + `prompt` | Medium | Most use cases |
| `full` | `selectedText` + surrounding + full `documentText` + `metadata` | High | Complex operations (summarize doc, generate quiz) |

Smart truncation: When context exceeds `maxContextLength`, RTEditor truncates intelligently (keeps beginning + end, drops middle).

```typescript
interface AIOptions {
  contextLevel?: 'minimal' | 'standard' | 'full'  // default: 'standard'
  maxContextLength?: number  // default: 4000 characters
  includeMetadata?: boolean  // default: true
  metadata?: AIMetadata
  quickActions?: AIQuickAction[]  // customizable quick action list
  enabled?: boolean  // default: true, false hides all AI entry points
  contentFilter?: (response: AIResponse) => AIResponse | null  // moderation callback
  systemPromptPrefix?: string  // prepended to system prompt
}
```

### 20.11 Education-Specific Features

**Per-preset permissions:**

- `teacherPreset`: AI enabled by default
- `studentPreset`: AI hidden by default (configurable via `aiOptions.enabled`)
- `basePreset`: AI enabled by default
- Consumer can override via `ai-options` prop

**Content filter callback:**

```typescript
contentFilter: (response: AIResponse) => {
  // Return null to block, return modified response to allow
  if (containsInappropriateContent(response.content)) return null
  return response
}
```

**Education prompt templates:**

Pre-built prompt templates optimized for education:

- "Generate comprehension questions for this text"
- "Simplify this text for [Grade X] reading level"
- "Create a rubric for this assignment"
- "Translate to [language]"
- "Provide feedback on this student's writing"
- "Generate vocabulary list from this text"
- "Create a lesson summary"

### 20.12 Locale Support

- English (en) and Traditional Chinese (zh-TW) built-in
- All AI panel UI strings translatable via i18n system (extends P2-009)
- Quick action labels localized
- `locale` field sent in `AIRequest` so AI can respond in matching language

### 20.13 CSS Custom Properties

```css
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
```

### 20.14 Accessibility

- Panel has `role="dialog"` and `aria-label="AI Assistant"`
- Focus trap within panel when open
- Escape key closes panel
- Quick action buttons have `aria-label` descriptions
- Loading state announced via `aria-live="polite"`
- Response content is focusable for screen reader access
- Action buttons have clear labels (not icon-only)
- Keyboard navigation: Tab through actions, Enter to activate

### 20.15 Acceptance Criteria

- [ ] AI panel opens via toolbar button, `Ctrl+K`/`Cmd+K`, `/ai` slash command, and bubble menu "Ask AI"
- [ ] Generate mode works when no text is selected
- [ ] Transform mode works when text is selected
- [ ] Quick action buttons trigger appropriate prompts
- [ ] Freeform prompt input works for custom requests
- [ ] AI response displays in panel after handler resolves
- [ ] Accept inserts/replaces content correctly
- [ ] Accept & Edit inserts with highlight class
- [ ] Reject dismisses without editor change
- [ ] Retry re-runs same prompt
- [ ] Edit prompt returns to input with previous prompt
- [ ] Panel is accessible (ARIA, focus trap, keyboard nav)
- [ ] Panel repositions to stay within viewport
- [ ] Escape key closes panel
- [ ] Loading state shown during AI generation
- [ ] Error state shown if handler rejects/throws
- [ ] `createProxyAIHandler` works with custom endpoints
- [ ] `createDKIAIHandler` auto-detects CSRF, uses Axios
- [ ] Three provider methods work: eClass AI, Ollama, OpenAI
- [ ] Context levels (minimal/standard/full) correctly gather data
- [ ] Smart truncation works when context exceeds max length
- [ ] Content filter callback can block/modify responses
- [ ] Per-preset permissions hide AI from students
- [ ] Education prompt templates produce useful results
- [ ] English and Traditional Chinese UI strings
- [ ] CSS custom properties allow full theming
- [ ] `prefers-reduced-motion` respected for panel animations
- [ ] AI feature is tree-shakeable — zero impact when not used

---

## 21. Phase 2 — Additional Layout & Functional Features

> Added: v1.7

### 21.1 Text Color & Background Color

Users can change both the **text foreground color** and the **text background/highlight color** from the toolbar. A color picker or preset palette provides education-friendly colors (Red, Orange, Yellow, Green, Blue, Purple, Pink, Gray). A "Remove color" option resets to default. Colors are preserved in HTML export as inline styles.

This extends P2-010 (Text Highlight Colors Extension).

### 21.2 Emoji Picker

A dedicated emoji picker tab/button in the toolbar. The picker provides:
- **Categorized emoji** (Smileys, Gestures, Hearts, Objects, Symbols) — ~200-300 curated education-relevant emoji
- **Search** — Filter emoji by keyword
- **Frequently used** — Tracks recent emoji in localStorage
- **Grid layout** — 8 columns, 36px per emoji button
- **Keyboard navigation** — Arrow keys, Enter to select, Escape to close

Clicking an emoji inserts it as plain text at the cursor position. The emoji picker is reusable in the comment bubble (Section 21.7).

### 21.3 Toolbar Button Tooltips

Every toolbar button shows a descriptive tooltip on hover. Tooltips include:
- **Button name** (e.g., "Bold", "Insert Image")
- **Keyboard shortcut** where applicable (e.g., "Bold (Ctrl+B)")
- **macOS detection** — Shows ⌘ instead of Ctrl on macOS

Implementation: Pure CSS tooltips via `::after` pseudo-element and `data-tooltip` attribute. No JS tooltip library needed. 300ms hover delay. Hidden on touch devices via `@media (hover: hover)`.

CSS custom properties: `--rte-tooltip-bg`, `--rte-tooltip-text`, `--rte-tooltip-radius`.

### 21.4 Bubble Menu Text Size

The bubble menu (floating toolbar on text selection) includes a **text size dropdown** as the first item. This dropdown allows switching between:
- Paragraph (normal text)
- Heading 1 through Heading 6

The dropdown shows the current active text level and provides visual size preview for each option. This gives users quick access to text sizing without reaching for the main toolbar.

### 21.5 Scientific Formula Editor

An enhanced formula insertion UI built on top of the existing MathExtension (KaTeX). While Phase 1's MathExtension supports raw LaTeX input, this feature adds a **visual formula editor panel** with:

- **Symbol categories**: Common (fraction, square root, summation, integral), Greek Letters (α, β, γ, δ, θ, π, σ, ω...), Operators (±, ×, ÷, ≠, ≤, ≥, ≈, ∞), Chemistry (→, ⇌, °)
- **Formula templates**: Quadratic formula, Einstein's equation, Pythagorean theorem, chemical equations
- **Live LaTeX preview**: Re-renders via KaTeX as user types (debounced 200ms)
- **Edit mode**: Clicking an existing math node re-opens the editor with pre-populated LaTeX
- **Inline vs. block toggle**: Switch between inline math and display math

Users can click symbol buttons to insert LaTeX snippets or type LaTeX directly. The rendered output uses KaTeX (same as Phase 1).

### 21.6 Code Snippet Extension

Users can insert syntax-highlighted code blocks with:

- **Language selector** — Dropdown with 20+ languages: JavaScript, TypeScript, Python, Java, C, C++, C#, HTML, CSS, JSON, XML, SQL, Bash, PHP, Ruby, Go, Rust, Swift, Kotlin, MATLAB, R, LaTeX, plaintext
- **Line numbers** — Optional toggle
- **Copy button** — Copies code to clipboard
- **Monospace font** — Configurable via `--rte-code-font`
- **Tab handling** — Tab inserts 2 spaces within code block (does not move focus)
- **Exit code block** — Shift+Enter or arrow-down at end exits the code block

Code blocks are rendered as `<pre data-language="..."><code>...</code></pre>` in HTML export.

CSS custom properties: `--rte-code-bg`, `--rte-code-text`, `--rte-code-font`, `--rte-code-font-size`, `--rte-code-line-height`, `--rte-code-padding`, `--rte-code-header-bg`, `--rte-code-border`, `--rte-code-line-number-color`.

### 21.7 Enhanced Comment Bubble — Emoji & File Attachment

The comment bubble (P2-002 / Section 6) is enhanced with:

- **Emoji picker** — Inline emoji button (😀) in the comment input area. Opens the same RTEmojiPicker component (Section 21.2) within the comment bubble. Users can insert emoji into their comment text.
- **File attachment** — Paperclip (📎) button next to the emoji button. Uses the same `UploadHandler` from RTEditor props. Attached files display as:
  - **Images**: Small thumbnails below comment text
  - **PDFs / Word / Excel / PPT**: Mini download cards with file icon, name, and size
  - File size limits: Same as editor `fileSizeLimits` prop

This creates a richer commenting experience suitable for teacher feedback with visual annotations and reference materials.

---

**End of Requirements Document**
