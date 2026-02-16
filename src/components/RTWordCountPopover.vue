<script setup lang="ts">
export interface WordCountStats {
  words: number
  characters: number
  charactersWithSpaces: number
  sentences: number
  readingTime: number
}

withDefaults(
  defineProps<{
    isOpen: boolean
    stats: WordCountStats
  }>(),
  {
    isOpen: false,
    stats: () => ({
      words: 0,
      characters: 0,
      charactersWithSpaces: 0,
      sentences: 0,
      readingTime: 0,
    }),
  },
)
</script>

<template>
  <div
    v-if="isOpen"
    class="rte-word-count-popover"
    role="status"
    aria-label="Word count statistics"
  >
    <div class="rte-word-count-popover__row">
      <span class="rte-word-count-popover__label">Words</span>
      <span class="rte-word-count-popover__value">{{ stats.words }}</span>
    </div>
    <div class="rte-word-count-popover__row">
      <span class="rte-word-count-popover__label">Characters</span>
      <span class="rte-word-count-popover__value">{{ stats.characters }}</span>
    </div>
    <div class="rte-word-count-popover__row">
      <span class="rte-word-count-popover__label">Characters (with spaces)</span>
      <span class="rte-word-count-popover__value">{{ stats.charactersWithSpaces }}</span>
    </div>
    <div class="rte-word-count-popover__row">
      <span class="rte-word-count-popover__label">Sentences</span>
      <span class="rte-word-count-popover__value">{{ stats.sentences }}</span>
    </div>
    <div class="rte-word-count-popover__row">
      <span class="rte-word-count-popover__label">Reading time</span>
      <span class="rte-word-count-popover__value">~{{ stats.readingTime }} min</span>
    </div>
  </div>
</template>

