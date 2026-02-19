<template>
  <div>
    <div class="rte-tag-input" @click="focusInput">
      <div class="rte-tag-chips">
        <span v-for="tag in tags" :key="tag" class="rte-tag-chip">
          <span class="rte-tag-chip__label">{{ tag }}</span>
          <button
            type="button"
            class="rte-tag-chip__remove"
            :aria-label="`Remove tag ${tag}`"
            @click.stop="removeTag(tag)"
          >×</button>
        </span>
      </div>
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="rte-tag-input__field"
        :placeholder="tags.length === 0 ? placeholder : ''"
        :disabled="disabled"
        aria-label="Add tag"
        @keydown.enter.prevent="addCurrentTag"
        @keydown.backspace="handleBackspace"
        @keydown.down.prevent="navigateSuggestion(1)"
        @keydown.up.prevent="navigateSuggestion(-1)"
        @keydown.escape="closeSuggestions"
        @input="onInputChange"
        @focus="onFocus"
        @blur="onBlur"
      />
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="rte-tag-suggestions"
        role="listbox"
      >
        <button
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion"
          type="button"
          class="rte-tag-suggestion"
          :class="{ 'rte-tag-suggestion--active': index === activeSuggestionIndex }"
          role="option"
          :aria-selected="index === activeSuggestionIndex"
          @mousedown.prevent="selectSuggestion(suggestion)"
        >{{ suggestion }}</button>
      </div>
    </div>

    <div v-if="categories.length > 0" class="rte-tag-category">
      <label class="rte-tag-category__label">Category</label>
      <select
        class="rte-tag-category__select"
        :value="category"
        :disabled="disabled"
        @change="onCategoryChange"
      >
        <option value="">— None —</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface RTTagInputProps {
  tags?: string[]
  category?: string | null
  suggestions?: string[]
  categories?: string[]
  maxTags?: number
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<RTTagInputProps>(), {
  tags: () => [],
  category: null,
  suggestions: () => [],
  categories: () => [],
  maxTags: 10,
  placeholder: 'Add tag...',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'add-tag', tag: string): void
  (e: 'remove-tag', tag: string): void
  (e: 'update:category', category: string | null): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const showSuggestions = ref(false)
const activeSuggestionIndex = ref(-1)
const isFocused = ref(false)

const filteredSuggestions = computed(() => {
  const query = inputValue.value.trim().toLowerCase()
  if (!query) return []
  const existingLower = props.tags.map((t) => t.toLowerCase())
  return props.suggestions.filter(
    (s) => s.toLowerCase().includes(query) && !existingLower.includes(s.toLowerCase()),
  )
})

watch(filteredSuggestions, () => {
  activeSuggestionIndex.value = -1
})

function focusInput() {
  inputRef.value?.focus()
}

function addCurrentTag() {
  if (activeSuggestionIndex.value >= 0 && filteredSuggestions.value.length > 0) {
    selectSuggestion(filteredSuggestions.value[activeSuggestionIndex.value])
    return
  }
  const trimmed = inputValue.value.trim()
  if (!trimmed) return
  if (props.tags.length >= props.maxTags) return
  if (props.tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return
  emit('add-tag', trimmed)
  inputValue.value = ''
  showSuggestions.value = false
}

function removeTag(tag: string) {
  emit('remove-tag', tag)
}

function handleBackspace() {
  if (inputValue.value === '' && props.tags.length > 0) {
    emit('remove-tag', props.tags[props.tags.length - 1])
  }
}

function selectSuggestion(suggestion: string) {
  if (props.tags.length >= props.maxTags) return
  emit('add-tag', suggestion)
  inputValue.value = ''
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
  inputRef.value?.focus()
}

function navigateSuggestion(delta: number) {
  if (filteredSuggestions.value.length === 0) return
  let next = activeSuggestionIndex.value + delta
  if (next < 0) next = filteredSuggestions.value.length - 1
  if (next >= filteredSuggestions.value.length) next = 0
  activeSuggestionIndex.value = next
}

function closeSuggestions() {
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
}

function onInputChange() {
  showSuggestions.value = inputValue.value.trim().length > 0
}

function onFocus() {
  isFocused.value = true
}

function onBlur() {
  isFocused.value = false
  // Delay close so mousedown on suggestions fires first
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

function onCategoryChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:category', value || null)
}
</script>

