<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import type { ToolbarItem } from '../types'
import { trapFocus } from '../utils/a11y'

const props = withDefaults(
  defineProps<{
    editor: Editor | null
    items?: ToolbarItem[]
    aiEnabled?: boolean
  }>(),
  {
    items: () => ['textSize', 'bold', 'italic', 'underline', 'link'] as ToolbarItem[],
    aiEnabled: true,
  },
)

const emit = defineEmits<{
  'open-link-dialog': []
  'ai:transform': []
}>()

const menuRef = ref<HTMLElement | null>(null)
const pluginKey = 'rteBubbleMenu'
const cleanupFocusTrap = ref<(() => void) | null>(null)
let visibilityObserver: MutationObserver | null = null

// Watch for bubble menu visibility changes to manage focus trap
function setupVisibilityObserver() {
  if (!menuRef.value) return

  const observer = new MutationObserver(() => {
    if (!menuRef.value) return
    const isVisible = menuRef.value.style.visibility !== 'hidden'

    if (isVisible && !cleanupFocusTrap.value) {
      cleanupFocusTrap.value = trapFocus(menuRef.value)
    } else if (!isVisible && cleanupFocusTrap.value) {
      cleanupFocusTrap.value()
      cleanupFocusTrap.value = null
    }
  })

  observer.observe(menuRef.value, { attributes: true, attributeFilter: ['style'] })
  return observer
}

interface BubbleItemDef {
  icon: string
  label: string
  action: () => void
  isActive?: () => boolean
}

function getItemDef(item: ToolbarItem): BubbleItemDef | null {
  const editor = props.editor
  if (!editor) return null

  const defs: Record<string, BubbleItemDef> = {
    bold: {
      icon: 'B',
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    italic: {
      icon: 'I',
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    underline: {
      icon: 'U',
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    strike: {
      icon: 'S',
      label: 'Strikethrough',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    link: {
      icon: '🔗',
      label: 'Link',
      action: () => emit('open-link-dialog'),
      isActive: () => editor.isActive('link'),
    },
  }

  if (!defs[item]) {
    if (import.meta.env.DEV) {
      console.warn(`[RTBubbleMenu] Unknown bubble menu item "${item}" — no handler defined. It will be skipped.`)
    }
    return null
  }
  return defs[item]
}

// Text size dropdown state
const textSizeDropdownOpen = ref(false)
const textSizeDropdownRef = ref<HTMLElement | null>(null)
const textSizeFocusIndex = ref(-1)

const currentTextSizeLabel = computed(() => {
  if (!props.editor) return '¶'
  for (let i = 1; i <= 6; i++) {
    if (props.editor.isActive('heading', { level: i })) return `H${i}`
  }
  return '¶'
})

function setTextSize(level: number | null) {
  if (!props.editor) return
  if (level) {
    props.editor.chain().focus().toggleHeading({ level: level as 1|2|3|4|5|6 }).run()
  } else {
    props.editor.chain().focus().setParagraph().run()
  }
  textSizeDropdownOpen.value = false
}

function toggleTextSizeDropdown() {
  textSizeDropdownOpen.value = !textSizeDropdownOpen.value
  if (textSizeDropdownOpen.value) {
    textSizeFocusIndex.value = -1
    nextTick(() => {
      const items = textSizeDropdownRef.value?.querySelectorAll<HTMLElement>('.rte-bubble-dropdown__item')
      if (items?.[0]) items[0].focus()
    })
  }
}

function handleTextSizeKeydown(e: KeyboardEvent) {
  if (!textSizeDropdownOpen.value) return
  const items = textSizeDropdownRef.value?.querySelectorAll<HTMLElement>('.rte-bubble-dropdown__item')
  if (!items || items.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    textSizeFocusIndex.value = (textSizeFocusIndex.value + 1) % items.length
    items[textSizeFocusIndex.value]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    textSizeFocusIndex.value = (textSizeFocusIndex.value - 1 + items.length) % items.length
    items[textSizeFocusIndex.value]?.focus()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    textSizeDropdownOpen.value = false
  }
}

// Register BubbleMenuPlugin when editor is available
watch(
  () => props.editor,
  (editor, oldEditor) => {
    // Unregister from old editor
    if (oldEditor) {
      oldEditor.unregisterPlugin(pluginKey)
    }

    // Register on new editor
    if (editor && menuRef.value) {
      const plugin = BubbleMenuPlugin({
        pluginKey,
        editor,
        element: menuRef.value,
        options: {
          placement: 'top',
          offset: { mainAxis: 8, crossAxis: 0 },
          flip: { fallbackPlacements: ['bottom'] },
          shift: { padding: 8 },
        },
        shouldShow: ({ editor: ed, state }) => {
          const { empty } = state.selection
          // Show bubble menu when text is selected (not empty) and not on an image node
          return !empty && !ed.isActive('image') && !ed.isActive('math') && !ed.isActive('codeBlock')
        },
      })
      editor.registerPlugin(plugin)
      visibilityObserver = setupVisibilityObserver() ?? null
    }
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  if (visibilityObserver) {
    visibilityObserver.disconnect()
    visibilityObserver = null
  }
  if (cleanupFocusTrap.value) {
    cleanupFocusTrap.value()
    cleanupFocusTrap.value = null
  }
  if (props.editor) {
    props.editor.unregisterPlugin(pluginKey)
  }
})
</script>

<template>
  <div
    ref="menuRef"
    class="rte-bubble-menu"
    data-testid="rte-bubble-menu"
    role="dialog"
    aria-modal="true"
    aria-label="Text formatting"
    style="visibility: hidden;"
  >
    <template v-for="(item, index) in items" :key="index">
      <!-- Text Size Dropdown -->
      <div
        v-if="item === 'textSize'"
        ref="textSizeDropdownRef"
        class="rte-bubble-dropdown"
      >
        <button
          class="rte-toolbar__button rte-bubble-dropdown__trigger"
          :aria-expanded="textSizeDropdownOpen"
          aria-haspopup="listbox"
          aria-label="Text size"
          data-testid="rte-bubble-text-size"
          @click="toggleTextSizeDropdown"
        >
          <span style="font-weight: 700; font-size: 13px;">{{ currentTextSizeLabel }} ▾</span>
        </button>
        <div
          v-if="textSizeDropdownOpen"
          class="rte-bubble-dropdown__menu"
          role="listbox"
          aria-label="Text size"
          @keydown="handleTextSizeKeydown"
        >
          <button
            class="rte-bubble-dropdown__item"
            :class="{ 'rte-bubble-dropdown__item--active': currentTextSizeLabel === '¶' }"
            role="option"
            :aria-selected="currentTextSizeLabel === '¶'"
            @click="setTextSize(null)"
          >Paragraph</button>
          <button
            v-for="level in 6"
            :key="level"
            class="rte-bubble-dropdown__item"
            :class="{ 'rte-bubble-dropdown__item--active': currentTextSizeLabel === `H${level}` }"
            role="option"
            :aria-selected="currentTextSizeLabel === `H${level}`"
            :style="{ fontSize: `${1.2 - level * 0.08}em`, fontWeight: 600 }"
            @click="setTextSize(level)"
          >Heading {{ level }}</button>
        </div>
      </div>

      <!-- Regular buttons -->
      <button
        v-else-if="getItemDef(item)"
        class="rte-toolbar__button"
        :class="{
          'rte-toolbar__button--active': getItemDef(item)?.isActive?.(),
        }"
        :aria-label="getItemDef(item)!.label"
        :aria-pressed="getItemDef(item)?.isActive?.() ?? undefined"
        :data-testid="`rte-bubble-${item}`"
        :data-tooltip="getItemDef(item)!.label"
        @click="getItemDef(item)!.action()"
      >
        <span style="font-weight: 700; font-size: 14px;">{{ getItemDef(item)!.icon }}</span>
      </button>
    </template>

    <!-- Ask AI button -->
    <button
      v-if="aiEnabled"
      class="rte-toolbar__button rte-bubble-ai-btn"
      aria-label="Ask AI"
      data-tooltip="Ask AI"
      data-testid="rte-bubble-ai"
      @click="emit('ai:transform')"
    >
      <span style="font-size: 13px;">✨ AI</span>
    </button>
  </div>
</template>
