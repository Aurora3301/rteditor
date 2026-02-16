<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<{
  node: {
    attrs: {
      latex: string
      display: boolean
    }
  }
  updateAttributes: (attrs: Record<string, unknown>) => void
  selected: boolean
}>()

const isEditing = ref(false)
const latexInput = ref('')
const renderedHTML = ref('')
const renderError = ref('')
const inputEl = ref<HTMLTextAreaElement | null>(null)

// Lazy load KaTeX
let katexModule: typeof import('katex') | null = null

async function renderMath(latex: string, display: boolean) {
  if (!latex.trim()) {
    renderedHTML.value = '<span style="color: #9ca3af; font-style: italic;">Empty math</span>'
    renderError.value = ''
    return
  }

  try {
    if (!katexModule) {
      katexModule = await import('katex')
      // Also need KaTeX CSS
      if (!document.querySelector('link[href*="katex"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
        document.head.appendChild(link)
      }
    }
    const katex = katexModule.default || katexModule
    renderedHTML.value = katex.renderToString(latex, {
      displayMode: display,
      throwOnError: false,
      output: 'html',
    })
    renderError.value = ''
  } catch (err) {
    renderError.value = err instanceof Error ? err.message : 'Invalid LaTeX'
    renderedHTML.value = ''
  }
}

onMounted(() => {
  renderMath(props.node.attrs.latex, props.node.attrs.display)
})

watch(
  () => props.node.attrs.latex,
  (newLatex) => {
    renderMath(newLatex, props.node.attrs.display)
  },
)

function startEditing() {
  latexInput.value = props.node.attrs.latex
  isEditing.value = true
  setTimeout(() => {
    inputEl.value?.focus()
    inputEl.value?.select()
  }, 50)
}

function finishEditing() {
  if (latexInput.value !== props.node.attrs.latex) {
    props.updateAttributes({ latex: latexInput.value })
  }
  isEditing.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    finishEditing()
  }
  if (e.key === 'Escape') {
    isEditing.value = false
  }
}
</script>

<template>
  <NodeViewWrapper
    as="span"
    class="rte-math"
    :class="{
      'rte-math--block': node.attrs.display,
      'rte-math--selected': selected,
      'rte-math--error': renderError && !isEditing,
    }"
    data-testid="rte-math-node"
  >
    <!-- Edit mode -->
    <div v-if="isEditing" class="rte-math-editor" @click.stop>
      <textarea
        ref="inputEl"
        v-model="latexInput"
        class="rte-math-editor__input"
        rows="2"
        placeholder="Enter LaTeX..."
        @keydown="handleKeydown"
        @blur="finishEditing"
      />
      <div
        v-if="latexInput"
        class="rte-math-editor__preview"
        v-html="renderedHTML || `<span style='color: red'>${renderError}</span>`"
      />
    </div>

    <!-- View mode -->
    <template v-else>
      <span
        v-if="renderedHTML && !renderError"
        class="rte-math__rendered"
        v-html="renderedHTML"
        @click="startEditing"
      />
      <span
        v-else-if="renderError"
        class="rte-math--error"
        @click="startEditing"
      >
        {{ renderError }}
      </span>
      <span
        v-else
        style="color: #9ca3af; font-style: italic; cursor: pointer;"
        @click="startEditing"
      >
        Click to add math
      </span>
    </template>
  </NodeViewWrapper>
</template>
