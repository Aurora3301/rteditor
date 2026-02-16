<script setup lang="ts">
import { ref, computed } from 'vue'
import { RTEditor, basePreset } from '../../src'
import type { UploadHandler } from '../../src'
import '../../src/themes/default.css'

const content = ref('<p>Hello from <strong>RTEditor</strong>! Start editing here...</p>')

const jsonOutput = ref<Record<string, unknown>>({})

const mockUploadHandler: UploadHandler = async (file: File) => {
  console.log('[Demo] Uploading file:', file.name, file.type, file.size)
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return {
    url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`,
    alt: file.name,
    filename: file.name,
    filesize: file.size,
  }
}

const htmlPreview = computed(() => content.value)
const jsonPreview = computed(() => JSON.stringify(jsonOutput.value, null, 2))

function onJsonUpdate(json: Record<string, unknown>) {
  jsonOutput.value = json
}
</script>

<template>
  <div class="demo-app">
    <header class="demo-header">
      <h1>RTEditor Demo</h1>
      <p class="demo-subtitle">Education-focused rich text editor built on TipTap for Vue 3</p>
    </header>

    <main class="demo-main">
      <section class="demo-editor-section">
        <h2>Editor</h2>
        <RTEditor
          v-model="content"
          :preset="basePreset"
          :upload-handler="mockUploadHandler"
          placeholder="Start typing here..."
          @update:json="onJsonUpdate"
        />
      </section>

      <section class="demo-output-section">
        <div class="demo-output-panel">
          <h2>HTML Output</h2>
          <pre class="demo-output-pre">{{ htmlPreview }}</pre>
        </div>

        <div class="demo-output-panel">
          <h2>JSON Output</h2>
          <pre class="demo-output-pre">{{ jsonPreview }}</pre>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.demo-app {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  color: #1a1a1a;
}

.demo-header {
  margin-bottom: 2rem;
  text-align: center;
}

.demo-header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
}

.demo-subtitle {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.demo-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.demo-editor-section h2,
.demo-output-panel h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.demo-editor-section {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
}

.demo-output-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.demo-output-panel {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}

.demo-output-pre {
  margin: 0;
  padding: 0.75rem;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 0.8rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .demo-output-section {
    grid-template-columns: 1fr;
  }
}
</style>
