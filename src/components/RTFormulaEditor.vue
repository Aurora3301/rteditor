<template>
  <div class="rte-formula-editor" role="dialog" aria-label="Formula editor" @keydown.escape="$emit('cancel')">
    <div class="rte-formula-editor__header">
      <h3 class="rte-formula-editor__title">Scientific Formula Editor</h3>
      <button class="rte-formula-editor__close" type="button" aria-label="Close" @click="$emit('cancel')">✕</button>
    </div>

    <!-- Category tabs -->
    <div class="rte-formula-editor__tabs" role="tablist">
      <button
        v-for="cat in categories"
        :key="cat.name"
        class="rte-formula-editor__tab"
        :class="{ 'rte-formula-editor__tab--active': activeCategory === cat.name }"
        type="button"
        role="tab"
        :aria-label="cat.name"
        @click="activeCategory = cat.name"
      >{{ cat.icon }} {{ cat.name }}</button>
    </div>

    <!-- Symbol grid -->
    <div class="rte-formula-editor__symbols">
      <button
        v-for="sym in activeSymbols"
        :key="sym.latex"
        class="rte-formula-editor__symbol-btn"
        type="button"
        :title="sym.label"
        :aria-label="sym.label"
        @click="insertSymbol(sym.latex)"
      >{{ sym.label }}</button>
    </div>

    <!-- Templates -->
    <div class="rte-formula-editor__templates">
      <span class="rte-formula-editor__templates-label">Templates:</span>
      <button
        v-for="tmpl in templates"
        :key="tmpl.label"
        class="rte-formula-editor__template-btn"
        type="button"
        :title="tmpl.description"
        @click="latexInput = tmpl.latex"
      >{{ tmpl.label }}</button>
    </div>

    <!-- Display mode toggle -->
    <div class="rte-formula-editor__mode">
      <label class="rte-formula-editor__mode-label">
        <input v-model="displayMode" type="checkbox" /> Block (display) mode
      </label>
    </div>

    <!-- LaTeX input -->
    <div class="rte-formula-editor__input-section">
      <label class="rte-formula-editor__label" for="rte-latex-input">LaTeX:</label>
      <textarea
        id="rte-latex-input"
        ref="latexTextarea"
        v-model="latexInput"
        class="rte-formula-editor__textarea"
        rows="3"
        placeholder="Enter LaTeX formula..."
        spellcheck="false"
      />
    </div>

    <!-- Preview -->
    <div class="rte-formula-editor__preview-section">
      <span class="rte-formula-editor__label">Preview:</span>
      <div class="rte-formula-editor__preview" v-html="previewHTML" />
      <div v-if="previewError" class="rte-formula-editor__error">{{ previewError }}</div>
    </div>

    <!-- Actions -->
    <div class="rte-formula-editor__actions">
      <button class="rte-formula-editor__btn rte-formula-editor__btn--cancel" type="button" @click="$emit('cancel')">Cancel</button>
      <button
        class="rte-formula-editor__btn rte-formula-editor__btn--insert"
        type="button"
        :disabled="!latexInput.trim() || !!previewError"
        @click="handleInsert"
      >Insert</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { formulaCategories, formulaTemplates } from '../data/formulaSymbols'

const props = defineProps<{
  initialLatex?: string
  initialDisplay?: boolean
}>()

const emit = defineEmits<{
  (e: 'insert', payload: { latex: string; display: boolean }): void
  (e: 'cancel'): void
}>()

const categories = formulaCategories
const templates = formulaTemplates
const activeCategory = ref(categories[0]?.name ?? 'Common')
const latexInput = ref(props.initialLatex ?? '')
const displayMode = ref(props.initialDisplay ?? false)
const previewHTML = ref('')
const previewError = ref('')
const latexTextarea = ref<HTMLTextAreaElement | null>(null)

const activeSymbols = computed(() => {
  const cat = categories.find(c => c.name === activeCategory.value)
  return cat?.symbols ?? []
})

function insertSymbol(latex: string) {
  const textarea = latexTextarea.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = latexInput.value.substring(0, start)
    const after = latexInput.value.substring(end)
    latexInput.value = before + latex + after
    // Set cursor after inserted text
    const newPos = start + latex.length
    requestAnimationFrame(() => {
      textarea.setSelectionRange(newPos, newPos)
      textarea.focus()
    })
  } else {
    latexInput.value += latex
  }
}

let renderTimeout: ReturnType<typeof setTimeout> | null = null

watch(latexInput, () => {
  if (renderTimeout) clearTimeout(renderTimeout)
  renderTimeout = setTimeout(() => renderPreview(), 200)
}, { immediate: true })

async function renderPreview() {
  if (!latexInput.value.trim()) {
    previewHTML.value = ''
    previewError.value = ''
    return
  }
  try {
    const katex = await import('katex')
    previewHTML.value = katex.default.renderToString(latexInput.value, {
      throwOnError: true,
      displayMode: displayMode.value,
    })
    previewError.value = ''
  } catch (err: any) {
    previewError.value = err?.message || 'Invalid LaTeX syntax'
    previewHTML.value = ''
  }
}

watch(displayMode, () => renderPreview())

function handleInsert() {
  if (latexInput.value.trim() && !previewError.value) {
    emit('insert', { latex: latexInput.value, display: displayMode.value })
  }
}

onMounted(() => {
  latexTextarea.value?.focus()
  renderPreview()
})
</script>
