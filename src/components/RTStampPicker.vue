<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DEFAULT_STAMPS } from '../extensions/StampExtension'
import type { Stamp } from '../extensions/StampExtension'

const props = withDefaults(defineProps<{
  stamps?: Stamp[]
}>(), {
  stamps: () => [...DEFAULT_STAMPS],
})

const emit = defineEmits<{
  (e: 'select-stamp', stamp: Stamp): void
  (e: 'remove-stamp'): void
  (e: 'close'): void
}>()

const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const focusIndex = ref(-1)

const categories = computed(() => {
  const cats = new Map<string, Stamp[]>()
  for (const stamp of filteredStamps.value) {
    const list = cats.get(stamp.category) || []
    list.push(stamp)
    cats.set(stamp.category, list)
  }
  return cats
})

const categoryLabels: Record<string, string> = {
  praise: 'Praise',
  encouragement: 'Encouragement',
  correction: 'Correction',
  custom: 'Custom',
}

const filteredStamps = computed(() => {
  if (!searchQuery.value.trim()) return props.stamps
  const q = searchQuery.value.toLowerCase().trim()
  return props.stamps.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.emoji.includes(q) ||
      s.category.toLowerCase().includes(q),
  )
})

const flatStamps = computed(() => filteredStamps.value)

function selectStamp(stamp: Stamp) {
  emit('select-stamp', stamp)
}

function handleKeydown(e: KeyboardEvent) {
  const stamps = flatStamps.value
  if (!stamps.length) return

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    focusIndex.value = (focusIndex.value + 1) % stamps.length
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    focusIndex.value = (focusIndex.value - 1 + stamps.length) % stamps.length
  } else if (e.key === 'Enter' && focusIndex.value >= 0) {
    e.preventDefault()
    selectStamp(stamps[focusIndex.value])
  } else if (e.key === 'Home') {
    e.preventDefault()
    focusIndex.value = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    focusIndex.value = stamps.length - 1
  }
}

onMounted(() => {
  searchInput.value?.focus()
})
</script>

<template>
  <div
    class="rte-stamp-picker"
    role="dialog"
    aria-label="Stamp picker"
    @keydown.escape="$emit('close')"
    @keydown="handleKeydown"
  >
    <!-- Search -->
    <div class="rte-stamp-picker__search">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        class="rte-stamp-picker__search-input"
        placeholder="Search stamps..."
        aria-label="Search stamps"
      />
    </div>

    <!-- Stamp grid by category -->
    <div class="rte-stamp-picker__body">
      <template v-for="[category, stamps] in categories" :key="category">
        <div class="rte-stamp-picker__category-label">
          {{ categoryLabels[category] || category }}
        </div>
        <div class="rte-stamp-picker__grid" role="grid">
          <button
            v-for="(stamp, idx) in stamps"
            :key="stamp.id"
            class="rte-stamp-picker__stamp"
            :class="{
              'rte-stamp-picker__stamp--focused': flatStamps.indexOf(stamp) === focusIndex,
            }"
            type="button"
            role="gridcell"
            :aria-label="`${stamp.label} ${stamp.emoji}`"
            :title="stamp.label"
            :style="{ '--stamp-btn-color': stamp.color }"
            @click="selectStamp(stamp)"
          >
            <span class="rte-stamp-picker__emoji">{{ stamp.emoji }}</span>
            <span class="rte-stamp-picker__label">{{ stamp.label }}</span>
          </button>
        </div>
      </template>

      <div v-if="filteredStamps.length === 0" class="rte-stamp-picker__empty">
        No stamps found
      </div>
    </div>

    <!-- Remove stamp button -->
    <div class="rte-stamp-picker__footer">
      <button
        class="rte-stamp-picker__remove"
        type="button"
        @click="$emit('remove-stamp')"
      >
        Remove stamp
      </button>
    </div>
  </div>
</template>

