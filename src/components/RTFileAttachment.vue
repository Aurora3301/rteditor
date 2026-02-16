<template>
  <node-view-wrapper
    class="rte-file-attachment"
    :class="{ 'rte-file-attachment--selected': selected }"
    :data-filetype="filetype"
    :role="'group'"
    :aria-label="`File attachment: ${filename}`"
    :style="containerStyle"
  >
    <!-- PDF Preview -->
    <div v-if="filetype === 'pdf'" class="rte-file-attachment__pdf">
      <iframe
        v-if="!iframeError"
        :src="url"
        :title="`PDF Preview: ${filename}`"
        sandbox="allow-same-origin"
        class="rte-file-attachment__iframe"
        @error="iframeError = true"
      />
      <div v-else class="rte-file-attachment__fallback">
        <span class="rte-file-attachment__icon">📕</span>
        <span>{{ filename }}</span>
      </div>
      <a :href="url" :download="filename" class="rte-file-attachment__download" rel="noopener noreferrer">
        ⬇ Download PDF
      </a>
    </div>

    <!-- Download Card -->
    <div v-else class="rte-file-attachment__card">
      <span class="rte-file-attachment__icon">{{ fileIcon }}</span>
      <div class="rte-file-attachment__info">
        <span class="rte-file-attachment__name">{{ filename }}</span>
        <span class="rte-file-attachment__meta">{{ formattedSize }} · {{ fileTypeLabel }}</span>
      </div>
      <a :href="url" :download="filename" class="rte-file-attachment__download-btn" rel="noopener noreferrer">
        ⬇ Download
      </a>
    </div>

    <!-- Delete button -->
    <button
      class="rte-file-attachment__delete"
      type="button"
      aria-label="Delete attachment"
      @click="deleteNode"
    >✕</button>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const iframeError = ref(false)

const url = computed(() => props.node?.attrs?.url ?? '')
const filename = computed(() => props.node?.attrs?.filename ?? 'file')
const filesize = computed(() => props.node?.attrs?.filesize ?? 0)
const filetype = computed(() => props.node?.attrs?.filetype ?? 'unknown')
const width = computed(() => props.node?.attrs?.width)
const height = computed(() => props.node?.attrs?.height)

const containerStyle = computed(() => {
  const s: Record<string, string> = {}
  if (width.value) s.width = `${width.value}px`
  if (height.value) s.height = `${height.value}px`
  return s
})

const fileIcon = computed(() => {
  const icons: Record<string, string> = {
    pdf: '📕',
    word: '📄',
    excel: '📊',
    powerpoint: '📊',
    unknown: '📎',
  }
  return icons[filetype.value] || '📎'
})

const fileTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    pdf: 'PDF Document',
    word: 'Word Document',
    excel: 'Excel Spreadsheet',
    powerpoint: 'PowerPoint Presentation',
    unknown: 'File',
  }
  return labels[filetype.value] || 'File'
})

const formattedSize = computed(() => {
  const bytes = filesize.value
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})
</script>
