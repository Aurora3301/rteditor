<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<{
  node: any
  updateAttributes: (attrs: Record<string, any>) => void
  selected: boolean
  editor: any
}>()

const imgRef = ref<HTMLImageElement | null>(null)
const isResizing = ref(false)
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)
const naturalAspectRatio = ref(1)
const activeHandle = ref('')

const currentWidth = computed(() => props.node.attrs.width || null)
const currentHeight = computed(() => props.node.attrs.height || null)

const imageStyle = computed(() => {
  const style: Record<string, string> = {}
  if (currentWidth.value) style.width = `${currentWidth.value}px`
  if (currentHeight.value) style.height = `${currentHeight.value}px`
  if (!currentWidth.value && !currentHeight.value) {
    style.maxWidth = '100%'
    style.height = 'auto'
  }
  return style
})

function onImageLoad() {
  if (imgRef.value) {
    const { naturalWidth, naturalHeight } = imgRef.value
    if (naturalWidth && naturalHeight) {
      naturalAspectRatio.value = naturalWidth / naturalHeight
      if (!props.node.attrs.aspectRatio) {
        props.updateAttributes({ aspectRatio: naturalAspectRatio.value })
      }
    }
  }
}

function onResizeStart(e: MouseEvent, handle: string) {
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  activeHandle.value = handle
  startX.value = e.clientX
  startY.value = e.clientY

  if (imgRef.value) {
    startWidth.value = imgRef.value.getBoundingClientRect().width
    startHeight.value = imgRef.value.getBoundingClientRect().height
  }

  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e: MouseEvent) {
  if (!isResizing.value) return

  const dx = e.clientX - startX.value
  // For left-side handles (sw, nw), dragging left increases width
  const direction = (activeHandle.value === 'sw' || activeHandle.value === 'nw') ? -1 : 1
  let newWidth = Math.max(50, startWidth.value + dx * direction)

  // Maintain aspect ratio
  const ratio = props.node.attrs.aspectRatio || naturalAspectRatio.value || 1
  let newHeight = Math.round(newWidth / ratio)

  // Enforce min height
  if (newHeight < 50) {
    newHeight = 50
    newWidth = Math.round(newHeight * ratio)
  }

  // Clamp to container width
  if (imgRef.value?.parentElement) {
    const containerWidth = imgRef.value.parentElement.getBoundingClientRect().width
    if (newWidth > containerWidth) {
      newWidth = containerWidth
      newHeight = Math.round(newWidth / ratio)
    }
  }

  newWidth = Math.round(newWidth)
  newHeight = Math.round(newHeight)

  props.updateAttributes({ width: newWidth, height: newHeight })
}

function onResizeEnd() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

onMounted(() => {
  if (imgRef.value && imgRef.value.complete) {
    onImageLoad()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})
</script>

<template>
  <NodeViewWrapper class="rte-resizable-image-wrapper" :class="{ 'is-selected': selected, 'is-resizing': isResizing }">
    <div class="rte-resizable-image" :style="imageStyle">
      <img
        ref="imgRef"
        :src="node.attrs.src"
        :alt="node.attrs.alt || ''"
        :title="node.attrs.title || ''"
        :style="imageStyle"
        draggable="false"
        @load="onImageLoad"
      />
      <!-- Resize handles — only visible when selected -->
      <template v-if="selected && editor?.isEditable">
        <div class="rte-resize-handle rte-resize-handle--se" @mousedown.stop="onResizeStart($event, 'se')" />
        <div class="rte-resize-handle rte-resize-handle--sw" @mousedown.stop="onResizeStart($event, 'sw')" />
        <div class="rte-resize-handle rte-resize-handle--ne" @mousedown.stop="onResizeStart($event, 'ne')" />
        <div class="rte-resize-handle rte-resize-handle--nw" @mousedown.stop="onResizeStart($event, 'nw')" />
      </template>
    </div>
  </NodeViewWrapper>
</template>

