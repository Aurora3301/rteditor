<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor | null
  isOpen: boolean
  initialUrl?: string
  initialText?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: { url: string; text?: string; openInNewTab: boolean }]
}>()

const url = ref('')
const text = ref('')
const openInNewTab = ref(true)
const urlError = ref('')
const urlInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      url.value = props.initialUrl || ''
      text.value = props.initialText || ''
      urlError.value = ''
      openInNewTab.value = true
      nextTick(() => {
        urlInput.value?.focus()
      })
    }
  },
)

function validateUrl(value: string): boolean {
  if (!value.trim()) {
    urlError.value = 'URL is required'
    return false
  }
  if (value.trim().toLowerCase().startsWith('javascript:')) {
    urlError.value = 'Invalid URL protocol'
    return false
  }
  try {
    // Allow relative URLs too, so only check absolute URLs
    if (value.includes('://') || value.startsWith('mailto:')) {
      const urlObj = new URL(value)
      if (!['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
        urlError.value = 'Only http, https, and mailto URLs are allowed'
        return false
      }
    }
  } catch {
    // If it's not a valid absolute URL, allow it as a relative path
  }
  urlError.value = ''
  return true
}

function handleSubmit() {
  if (!validateUrl(url.value)) return

  if (props.editor) {
    const attrs: Record<string, unknown> = {
      href: url.value.trim(),
      target: openInNewTab.value ? '_blank' : null,
      rel: openInNewTab.value ? 'noopener noreferrer' : null,
    }

    if (text.value.trim()) {
      // If there's custom text, we need to insert it
      const { from, to } = props.editor.state.selection
      if (from === to) {
        // No selection — insert text with link
        props.editor
          .chain()
          .focus()
          .insertContent(`<a href="${url.value.trim()}"${openInNewTab.value ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text.value.trim()}</a>`)
          .run()
      } else {
        // Has selection — update link
        props.editor.chain().focus().setLink(attrs as { href: string }).run()
      }
    } else {
      props.editor.chain().focus().setLink(attrs as { href: string }).run()
    }
  }

  emit('submit', {
    url: url.value.trim(),
    text: text.value.trim() || undefined,
    openInNewTab: openInNewTab.value,
  })
  emit('close')
}

function handleRemoveLink() {
  if (props.editor) {
    props.editor.chain().focus().unsetLink().run()
  }
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  } else if (e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  } else if (e.key === 'Tab') {
    // Focus trap
    const dialog = (e.target as HTMLElement).closest('.rte-link-dialog')
    if (!dialog) return
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'input, button, [tabindex]:not([tabindex="-1"])'
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
}

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('rte-link-dialog-overlay')) {
    emit('close')
  }
}

const isEditing = ref(false)

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.initialUrl) {
      isEditing.value = true
    } else {
      isEditing.value = false
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="rte-link-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Insert link"
      data-testid="rte-link-dialog"
      @click="handleOverlayClick"
      @keydown="handleKeydown"
    >
      <div class="rte-link-dialog" @click.stop>
        <h3 class="rte-link-dialog__title">
          {{ isEditing ? 'Edit Link' : 'Insert Link' }}
        </h3>

        <div class="rte-link-dialog__field">
          <label class="rte-link-dialog__label" for="rte-link-url">URL</label>
          <input
            id="rte-link-url"
            ref="urlInput"
            v-model="url"
            class="rte-link-dialog__input"
            :class="{ 'rte-link-dialog__input--error': urlError }"
            type="url"
            placeholder="https://example.com"
            data-testid="rte-link-url-input"
            @input="urlError = ''"
          />
          <p v-if="urlError" class="rte-link-dialog__error" role="alert">
            {{ urlError }}
          </p>
        </div>

        <div class="rte-link-dialog__field">
          <label class="rte-link-dialog__label" for="rte-link-text">
            Display Text (optional)
          </label>
          <input
            id="rte-link-text"
            v-model="text"
            class="rte-link-dialog__input"
            type="text"
            placeholder="Link text"
            data-testid="rte-link-text-input"
          />
        </div>

        <label class="rte-link-dialog__checkbox">
          <input v-model="openInNewTab" type="checkbox" />
          Open in new tab
        </label>

        <div class="rte-link-dialog__actions">
          <button
            v-if="isEditing"
            class="rte-link-dialog__btn rte-link-dialog__btn--danger"
            data-testid="rte-link-remove-btn"
            @click="handleRemoveLink"
          >
            Remove Link
          </button>
          <button
            class="rte-link-dialog__btn"
            data-testid="rte-link-cancel-btn"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            class="rte-link-dialog__btn rte-link-dialog__btn--primary"
            data-testid="rte-link-submit-btn"
            @click="handleSubmit"
          >
            {{ isEditing ? 'Update' : 'Insert' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>