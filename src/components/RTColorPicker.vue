<script setup lang="ts">
import { DEFAULT_TEXT_COLORS, DEFAULT_HIGHLIGHT_COLORS } from '../extensions/HighlightExtension'

const props = withDefaults(defineProps<{
  textColors?: string[]
  highlightColors?: string[]
  currentTextColor?: string | null
  currentHighlightColor?: string | null
}>(), {
  textColors: () => [...DEFAULT_TEXT_COLORS],
  highlightColors: () => [...DEFAULT_HIGHLIGHT_COLORS],
  currentTextColor: null,
  currentHighlightColor: null,
})

defineEmits<{
  (e: 'select-text-color', color: string | null): void
  (e: 'select-highlight-color', color: string | null): void
  (e: 'close'): void
}>()
</script>

<template>
  <div class="rte-color-picker" role="dialog" aria-label="Color picker" @keydown.escape="$emit('close')">
    <!-- Text Color Section -->
    <div class="rte-color-picker__section">
      <div class="rte-color-picker__label">Text Color</div>
      <div class="rte-color-picker__palette">
        <button
          v-for="color in textColors"
          :key="'text-' + color"
          class="rte-color-picker__swatch"
          :class="{ 'rte-color-picker__swatch--active': currentTextColor === color }"
          :style="{ backgroundColor: color }"
          :aria-label="'Text color ' + color"
          type="button"
          @click="$emit('select-text-color', color)"
        />
      </div>
      <button
        class="rte-color-picker__reset"
        type="button"
        @click="$emit('select-text-color', null)"
      >
        Remove text color
      </button>
    </div>

    <!-- Highlight Color Section -->
    <div class="rte-color-picker__section">
      <div class="rte-color-picker__label">Highlight Color</div>
      <div class="rte-color-picker__palette">
        <button
          v-for="color in highlightColors"
          :key="'hl-' + color"
          class="rte-color-picker__swatch"
          :class="{ 'rte-color-picker__swatch--active': currentHighlightColor === color }"
          :style="{ backgroundColor: color }"
          :aria-label="'Highlight color ' + color"
          type="button"
          @click="$emit('select-highlight-color', color)"
        />
      </div>
      <button
        class="rte-color-picker__reset"
        type="button"
        @click="$emit('select-highlight-color', null)"
      >
        Remove highlight
      </button>
    </div>
  </div>
</template>

