<template>
  <node-view-wrapper class="rte-code-block" :data-language="selectedLanguage" aria-label="Code block">
    <div class="rte-code-block__header">
      <select
        v-model="selectedLanguage"
        class="rte-code-block__language-select"
        aria-label="Programming language"
        @change="updateLanguage"
      >
        <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
      </select>
      <div class="rte-code-block__actions">
        <button
          class="rte-code-block__btn"
          type="button"
          aria-label="Copy code"
          @click="copyCode"
        >
          {{ copied ? '✓' : '⎘' }}
        </button>
        <button
          class="rte-code-block__btn rte-code-block__btn--delete"
          type="button"
          aria-label="Delete code block"
          @click="deleteNode"
        >
          ✕
        </button>
      </div>
    </div>
    <div class="rte-code-block__body">
      <div v-if="showLineNumbers" class="rte-code-block__line-numbers" aria-hidden="true">
        <span v-for="n in lineCount" :key="n" class="rte-code-block__line-number">{{ n }}</span>
      </div>
      <node-view-content as="pre" class="rte-code-block__content" />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3'
import { SUPPORTED_LANGUAGES } from '../extensions/CodeSnippetExtension'

const props = defineProps(nodeViewProps)

const copied = ref(false)

const languages = computed(() => {
  return props.extension?.options?.languages ?? [...SUPPORTED_LANGUAGES]
})

const showLineNumbers = computed(() => {
  return props.node?.attrs?.showLineNumbers ?? true
})

const selectedLanguage = computed({
  get: () => props.node?.attrs?.language ?? 'plaintext',
  set: (val: string) => {
    props.updateAttributes?.({ language: val })
  },
})

const lineCount = computed(() => {
  const content = props.node?.textContent ?? ''
  return Math.max(1, content.split('\n').length)
})

function updateLanguage() {
  // Handled by computed setter
}

async function copyCode() {
  const text = props.node?.textContent ?? ''
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

