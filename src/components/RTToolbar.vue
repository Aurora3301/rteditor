<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { ToolbarConfig, ToolbarItem } from '../types'

const props = defineProps<{
  editor: Editor | null
  toolbar: ToolbarConfig
}>()

const emit = defineEmits<{
  'toggle-fullscreen': []
  'toggle-sidebar': []
  'open-link-dialog': []
  'open-emoji-picker': []
  'open-color-picker': []
  'open-formula-editor': []
  'toggle-word-count': []
  'add-comment': []
  'toggle-voice': []
  'open-stamp-picker': []
  'ai:open': []
  'image-upload': [file: File]
  'file-upload': [file: File]
}>()

const headingDropdownOpen = ref(false)
const headingDropdownRef = ref<HTMLElement | null>(null)
const toolbarRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

interface ToolbarItemDef {
  icon: string
  label: string
  shortcut?: string
  action: () => void
  isActive?: () => boolean
  isDisabled?: () => boolean
}

function getItemDef(item: ToolbarItem): ToolbarItemDef | null {
  const editor = props.editor
  if (!editor) return null

  const defs: Record<string, ToolbarItemDef> = {
    bold: {
      icon: 'bold',
      label: 'Bold',
      shortcut: 'Ctrl+B',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    italic: {
      icon: 'italic',
      label: 'Italic',
      shortcut: 'Ctrl+I',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    underline: {
      icon: 'underline',
      label: 'Underline',
      shortcut: 'Ctrl+U',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    strike: {
      icon: 'strike',
      label: 'Strikethrough',
      shortcut: 'Ctrl+Shift+S',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    subscript: {
      icon: 'subscript',
      label: 'Subscript',
      action: () => editor.chain().focus().toggleSubscript().run(),
      isActive: () => editor.isActive('subscript'),
    },
    superscript: {
      icon: 'superscript',
      label: 'Superscript',
      action: () => editor.chain().focus().toggleSuperscript().run(),
      isActive: () => editor.isActive('superscript'),
    },
    bulletList: {
      icon: 'bulletList',
      label: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    orderedList: {
      icon: 'orderedList',
      label: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    link: {
      icon: 'link',
      label: 'Insert Link',
      shortcut: 'Ctrl+K',
      action: () => emit('open-link-dialog'),
      isActive: () => editor.isActive('link'),
    },
    alignLeft: {
      icon: 'alignLeft',
      label: 'Align Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: () => editor.isActive({ textAlign: 'left' }),
    },
    alignCenter: {
      icon: 'alignCenter',
      label: 'Align Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: () => editor.isActive({ textAlign: 'center' }),
    },
    alignRight: {
      icon: 'alignRight',
      label: 'Align Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: () => editor.isActive({ textAlign: 'right' }),
    },
    horizontalRule: {
      icon: 'horizontalRule',
      label: 'Horizontal Rule',
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    undo: {
      icon: 'undo',
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      action: () => editor.chain().focus().undo().run(),
      isDisabled: () => !editor.can().undo(),
    },
    redo: {
      icon: 'redo',
      label: 'Redo',
      shortcut: 'Ctrl+Shift+Z',
      action: () => editor.chain().focus().redo().run(),
      isDisabled: () => !editor.can().redo(),
    },
    fullscreen: {
      icon: 'fullscreen',
      label: 'Toggle Fullscreen',
      shortcut: 'F11',
      action: () => emit('toggle-fullscreen'),
    },
    commentSidebar: {
      icon: 'sidebar',
      label: 'Toggle Comment Sidebar',
      action: () => emit('toggle-sidebar'),
    },
    checklist: {
      icon: 'checklist',
      label: 'Checklist',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive('taskList'),
    },
    table: {
      icon: 'table',
      label: 'Insert Table',
      action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    textColor: {
      icon: 'textColor',
      label: 'Text Color',
      action: () => emit('open-color-picker'),
    },
    highlight: {
      icon: 'highlight',
      label: 'Highlight Color',
      action: () => emit('open-color-picker'),
    },
    emoji: {
      icon: 'emoji',
      label: 'Insert Emoji',
      action: () => emit('open-emoji-picker'),
    },
    codeBlock: {
      icon: 'codeBlock',
      label: 'Code Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
    formula: {
      icon: 'formula',
      label: 'Scientific Formula',
      action: () => emit('open-formula-editor'),
    },
    math: {
      icon: 'formula',
      label: 'Math / Formula',
      action: () => emit('open-formula-editor'),
    },
    wordCount: {
      icon: 'wordCount',
      label: 'Word Count',
      action: () => emit('toggle-word-count'),
    },
    comment: {
      icon: 'comment',
      label: 'Add Comment',
      action: () => emit('add-comment'),
      isDisabled: () => editor.view.state.selection.empty,
    },
    voiceToText: {
      icon: 'microphone',
      label: 'Voice Dictation',
      action: () => emit('toggle-voice'),
    },
    stamp: {
      icon: 'stamp',
      label: 'Stamp',
      action: () => emit('open-stamp-picker'),
      isDisabled: () => editor.view.state.selection.empty,
    },
    ai: {
      icon: 'ai',
      label: 'AI Assistant',
      shortcut: 'Ctrl+K',
      action: () => emit('ai:open'),
    },
  }

  if (!defs[item]) {
    if (import.meta.env.DEV) {
      console.warn(`[RTToolbar] Unknown toolbar item "${item}" — no handler defined. It will be skipped.`)
    }
    return null
  }
  return defs[item]
}

const currentHeadingLabel = computed(() => {
  if (!props.editor) return 'Paragraph'
  for (let i = 1; i <= 6; i++) {
    if (props.editor.isActive('heading', { level: i })) return `H${i}`
  }
  return 'Paragraph'
})

function setHeading(level: number | null) {
  if (!props.editor) return
  if (level) {
    props.editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run()
  } else {
    props.editor.chain().focus().setParagraph().run()
  }
  headingDropdownOpen.value = false
}

const headingFocusIndex = ref(-1)

function toggleHeadingDropdown() {
  headingDropdownOpen.value = !headingDropdownOpen.value
  if (headingDropdownOpen.value) {
    headingFocusIndex.value = -1
    nextTick(() => {
      focusHeadingItem(0)
    })
  }
}

function handleHeadingKeydown(e: KeyboardEvent) {
  if (!headingDropdownOpen.value) return

  const items = headingDropdownRef.value?.querySelectorAll<HTMLElement>('.rte-toolbar__dropdown-item')
  if (!items || items.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const next = (headingFocusIndex.value + 1) % items.length
    focusHeadingItem(next)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = (headingFocusIndex.value - 1 + items.length) % items.length
    focusHeadingItem(prev)
  } else if (e.key === 'Home') {
    e.preventDefault()
    focusHeadingItem(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    focusHeadingItem(items.length - 1)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    headingDropdownOpen.value = false
    // Return focus to the trigger button
    const trigger = headingDropdownRef.value?.querySelector<HTMLElement>('.rte-toolbar__dropdown-trigger')
    trigger?.focus()
  }
}

function focusHeadingItem(index: number) {
  headingFocusIndex.value = index
  const items = headingDropdownRef.value?.querySelectorAll<HTMLElement>('.rte-toolbar__dropdown-item')
  if (items && items[index]) {
    items[index].focus()
  }
}

function handleClickOutside(e: MouseEvent) {
  if (
    headingDropdownOpen.value &&
    headingDropdownRef.value &&
    !headingDropdownRef.value.contains(e.target as Node)
  ) {
    headingDropdownOpen.value = false
  }
}

// Icon SVG paths (inline, Feather-style)
const iconPaths: Record<string, string> = {
  bold: '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>',
  italic: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
  underline: '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
  strike: '<line x1="4" y1="12" x2="20" y2="12"/><path d="M16 4H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H8"/>',
  subscript: '<text x="2" y="16" font-size="16" fill="currentColor" stroke="none">A</text><text x="14" y="20" font-size="10" fill="currentColor" stroke="none">₂</text>',
  superscript: '<text x="2" y="16" font-size="16" fill="currentColor" stroke="none">A</text><text x="14" y="10" font-size="10" fill="currentColor" stroke="none">²</text>',
  bulletList: '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>',
  orderedList: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="9" font-size="10" fill="currentColor" stroke="none">1</text><text x="2" y="15" font-size="10" fill="currentColor" stroke="none">2</text><text x="2" y="21" font-size="10" fill="currentColor" stroke="none">3</text>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  alignLeft: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>',
  alignCenter: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
  alignRight: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>',
  horizontalRule: '<line x1="3" y1="12" x2="21" y2="12"/>',
  undo: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  redo: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  fullscreen: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  sidebar: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  chevronRight: '<polyline points="9 6 15 12 9 18"/>',
  checklist: '<rect x="3" y="3" width="7" height="7" rx="1"/><path d="M5 6l1 1 2-2"/><rect x="3" y="14" width="7" height="7" rx="1"/><line x1="14" y1="6" x2="21" y2="6"/><line x1="14" y1="17" x2="21" y2="17"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>',
  textColor: '<path d="M5 20h14"/><path d="M9 4h1l5 12"/><path d="M15 4h-1l-5 12"/>',
  highlight: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  emoji: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  codeBlock: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  formula: '<text x="3" y="17" font-size="14" fill="currentColor" stroke="none" font-style="italic">∑x</text>',
  wordCount: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  comment: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  attachFile: '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  microphone: '<rect x="9" y="1" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>',
  stamp: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><text x="12" y="10" font-size="8" fill="currentColor" stroke="none" text-anchor="middle">⭐</text>',
  ai: '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="none"/>',
}

// Image upload file input ref
const imageFileInput = ref<HTMLInputElement | null>(null)

// File attachment file input ref
const attachFileInput = ref<HTMLInputElement | null>(null)

function handleImageClick() {
  imageFileInput.value?.click()
}

function handleImageFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && props.editor) {
    emit('image-upload', file)
  }
  if (input) input.value = ''
}

function handleAttachFileClick() {
  attachFileInput.value?.click()
}

function handleAttachFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && props.editor) {
    emit('file-upload', file)
  }
  if (input) input.value = ''
}

// Mobile scroll tracking
function updateScrollArrows() {
  const el = toolbarRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 1
}

function scrollToolbar(direction: 'left' | 'right') {
  const el = toolbarRef.value
  if (!el) return
  const amount = direction === 'left' ? -120 : 120
  el.scrollBy({ left: amount, behavior: 'smooth' })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  updateScrollArrows()
  toolbarRef.value?.addEventListener('scroll', updateScrollArrows, { passive: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
  toolbarRef.value?.removeEventListener('scroll', updateScrollArrows)
})
</script>

<template>
  <div
    ref="toolbarRef"
    class="rte-toolbar"
    role="toolbar"
    aria-label="Formatting toolbar"
    data-testid="rte-toolbar"
  >
    <!-- Mobile scroll left arrow -->
    <button
      v-if="canScrollLeft"
      class="rte-toolbar__scroll-left"
      aria-label="Scroll toolbar left"
      tabindex="-1"
      @click="scrollToolbar('left')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" v-html="iconPaths.chevronLeft" />
    </button>

    <template v-for="(item, index) in toolbar" :key="index">
      <!-- Separator -->
      <span
        v-if="item === '|'"
        class="rte-toolbar__separator"
        role="separator"
      />

      <!-- Heading Dropdown -->
      <div
        v-else-if="item === 'heading'"
        ref="headingDropdownRef"
        class="rte-toolbar__dropdown"
      >
        <button
          class="rte-toolbar__dropdown-trigger"
          :aria-expanded="headingDropdownOpen"
          aria-haspopup="listbox"
          aria-label="Text style"
          data-tooltip="Text style"
          data-testid="rte-heading-dropdown"
          @click="toggleHeadingDropdown"
        >
          <span>{{ currentHeadingLabel }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" v-html="iconPaths.chevronDown" />
        </button>
        <div
          v-if="headingDropdownOpen"
          class="rte-toolbar__dropdown-menu"
          role="listbox"
          aria-label="Text styles"
          @keydown="handleHeadingKeydown"
        >
          <button
            class="rte-toolbar__dropdown-item"
            :class="{ 'rte-toolbar__dropdown-item--active': currentHeadingLabel === 'Paragraph' }"
            role="option"
            :aria-selected="currentHeadingLabel === 'Paragraph'"
            @click="setHeading(null)"
          >
            Paragraph
          </button>
          <button
            v-for="level in 6"
            :key="level"
            class="rte-toolbar__dropdown-item"
            :class="{ 'rte-toolbar__dropdown-item--active': currentHeadingLabel === `H${level}` }"
            role="option"
            :aria-selected="currentHeadingLabel === `H${level}`"
            :style="{ fontSize: `${1.4 - level * 0.1}em`, fontWeight: 600 }"
            @click="setHeading(level)"
          >
            Heading {{ level }}
          </button>
        </div>
      </div>

      <!-- Image button (triggers file input) -->
      <button
        v-else-if="item === 'image'"
        class="rte-toolbar__button"
        aria-label="Insert Image"
        data-tooltip="Insert Image"
        data-testid="rte-toolbar-image"
        @click="handleImageClick"
      >
        <svg viewBox="0 0 24 24" v-html="iconPaths.image" />
        <span class="rte-tooltip">Insert Image</span>
      </button>

      <!-- Attach file button (triggers file input) -->
      <button
        v-else-if="item === 'attachFile'"
        class="rte-toolbar__button"
        aria-label="Attach File"
        data-tooltip="Attach File"
        data-testid="rte-toolbar-attachFile"
        @click="handleAttachFileClick"
      >
        <svg viewBox="0 0 24 24" v-html="iconPaths.attachFile" />
        <span class="rte-tooltip">Attach File</span>
      </button>

      <!-- Regular toolbar buttons -->
      <button
        v-else-if="getItemDef(item)"
        class="rte-toolbar__button"
        :class="{
          'rte-toolbar__button--active': getItemDef(item)?.isActive?.(),
        }"
        :disabled="getItemDef(item)?.isDisabled?.()"
        :aria-label="`${getItemDef(item)!.label}${getItemDef(item)!.shortcut ? ` (${getItemDef(item)!.shortcut})` : ''}`"
        :aria-pressed="getItemDef(item)?.isActive ? getItemDef(item)!.isActive!() : undefined"
        :data-tooltip="`${getItemDef(item)!.label}${getItemDef(item)!.shortcut ? ` (${getItemDef(item)!.shortcut})` : ''}`"
        :data-testid="`rte-toolbar-${item}`"
        @click="getItemDef(item)!.action()"
      >
        <svg viewBox="0 0 24 24" v-html="iconPaths[getItemDef(item)!.icon]" />
        <span class="rte-tooltip">
          {{ getItemDef(item)!.label }}
          <template v-if="getItemDef(item)!.shortcut">
            ({{ getItemDef(item)!.shortcut }})
          </template>
        </span>
      </button>
    </template>

    <!-- Mobile scroll right arrow -->
    <button
      v-if="canScrollRight"
      class="rte-toolbar__scroll-right"
      aria-label="Scroll toolbar right"
      tabindex="-1"
      @click="scrollToolbar('right')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" v-html="iconPaths.chevronRight" />
    </button>

    <!-- Hidden file inputs (outside the loop so refs work correctly) -->
    <input
      ref="imageFileInput"
      type="file"
      accept="image/jpeg,image/png,image/gif,image/webp"
      aria-label="Upload image file"
      style="display: none"
      @change="handleImageFileChange"
    />
    <input
      ref="attachFileInput"
      type="file"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
      aria-label="Upload file attachment"
      style="display: none"
      @change="handleAttachFileChange"
    />
  </div>
</template>
