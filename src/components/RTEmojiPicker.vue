<template>
  <div class="rte-emoji-picker" role="dialog" aria-label="Emoji picker" @keydown.escape="$emit('close')">
    <!-- Search -->
    <div class="rte-emoji-picker__search">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        class="rte-emoji-picker__search-input"
        placeholder="Search emoji..."
        aria-label="Search emoji"
      />
    </div>

    <!-- Category tabs -->
    <div class="rte-emoji-picker__tabs" role="tablist">
      <button
        v-if="frequentEmojis.length > 0"
        class="rte-emoji-picker__tab"
        :class="{ 'rte-emoji-picker__tab--active': activeCategory === 'frequent' }"
        type="button"
        role="tab"
        aria-label="Frequently used"
        @click="activeCategory = 'frequent'"
      >🕐</button>
      <button
        v-for="cat in categories"
        :key="cat.name"
        class="rte-emoji-picker__tab"
        :class="{ 'rte-emoji-picker__tab--active': activeCategory === cat.name }"
        type="button"
        role="tab"
        :aria-label="cat.name"
        :title="cat.name"
        @click="activeCategory = cat.name"
      >{{ cat.icon }}</button>
    </div>

    <!-- Emoji grid -->
    <div class="rte-emoji-picker__grid" role="grid">
      <template v-if="searchQuery">
        <button
          v-for="emoji in searchResults"
          :key="emoji"
          class="rte-emoji-picker__emoji"
          type="button"
          role="gridcell"
          :aria-label="emoji"
          @click="selectEmoji(emoji)"
        >{{ emoji }}</button>
        <div v-if="searchResults.length === 0" class="rte-emoji-picker__empty">
          No emoji found
        </div>
      </template>
      <template v-else-if="activeCategory === 'frequent' && frequentEmojis.length > 0">
        <button
          v-for="emoji in frequentEmojis"
          :key="emoji"
          class="rte-emoji-picker__emoji"
          type="button"
          role="gridcell"
          :aria-label="emoji"
          @click="selectEmoji(emoji)"
        >{{ emoji }}</button>
      </template>
      <template v-else>
        <button
          v-for="emoji in activeEmojis"
          :key="emoji"
          class="rte-emoji-picker__emoji"
          type="button"
          role="gridcell"
          :aria-label="emoji"
          @click="selectEmoji(emoji)"
        >{{ emoji }}</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { emojiCategories, searchEmoji } from '../data/emoji'

const props = defineProps<{
  onSelect?: (emoji: string) => void
}>()

const emit = defineEmits<{
  (e: 'select', emoji: string): void
  (e: 'close'): void
}>()

const categories = emojiCategories
const activeCategory = ref(categories[0]?.name ?? '')
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const FREQUENT_KEY = 'rte-frequent-emojis'
const MAX_FREQUENT = 16

const frequentEmojis = ref<string[]>([])

onMounted(() => {
  try {
    const stored = localStorage.getItem(FREQUENT_KEY)
    if (stored) {
      frequentEmojis.value = JSON.parse(stored)
    }
  } catch { /* ignore */ }
  searchInput.value?.focus()
})

const activeEmojis = computed(() => {
  const cat = categories.find(c => c.name === activeCategory.value)
  return cat?.emojis ?? []
})

const searchResults = computed(() => {
  return searchEmoji(searchQuery.value)
})

function selectEmoji(emoji: string) {
  // Track frequently used
  const freq = [emoji, ...frequentEmojis.value.filter(e => e !== emoji)].slice(0, MAX_FREQUENT)
  frequentEmojis.value = freq
  try {
    localStorage.setItem(FREQUENT_KEY, JSON.stringify(freq))
  } catch { /* ignore */ }

  props.onSelect?.(emoji)
  emit('select', emoji)
}
</script>
