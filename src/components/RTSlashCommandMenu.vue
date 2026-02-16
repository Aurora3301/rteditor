<template>
  <div
    class="rte-slash-menu"
    role="listbox"
    aria-label="Commands"
  >
    <div v-if="items.length === 0" class="rte-slash-menu__empty">
      No results
    </div>
    <template v-else>
      <template v-for="(group, category) in groupedItems" :key="category">
        <div class="rte-slash-menu__category">{{ category }}</div>
        <button
          v-for="(item, index) in group"
          :key="item.name"
          class="rte-slash-menu__item"
          :class="{ 'rte-slash-menu__item--active': flatIndex(category as string, index) === selectedIndex }"
          role="option"
          :aria-selected="flatIndex(category as string, index) === selectedIndex"
          @click="selectItem(item)"
          @mouseenter="selectedIndex = flatIndex(category as string, index)"
        >
          <span class="rte-slash-menu__icon">{{ item.icon }}</span>
          <div class="rte-slash-menu__text">
            <span class="rte-slash-menu__label">{{ item.label }}</span>
            <span class="rte-slash-menu__description">{{ item.description }}</span>
          </div>
        </button>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface SlashCommand {
  name: string
  label: string
  description: string
  icon: string
  category: string
  action: (editor: any) => void
}

const props = defineProps<{
  items: SlashCommand[]
  command: (item: SlashCommand) => void
}>()

const selectedIndex = ref(0)

watch(() => props.items, () => {
  selectedIndex.value = 0
})

const groupedItems = computed(() => {
  const groups: Record<string, SlashCommand[]> = {}
  for (const item of props.items) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
})

function flatIndex(category: string, localIndex: number): number {
  let idx = 0
  for (const [cat, items] of Object.entries(groupedItems.value)) {
    if (cat === category) return idx + localIndex
    idx += items.length
  }
  return idx + localIndex
}

function selectItem(item: SlashCommand) {
  props.command(item)
}

function onKeyDown(event: KeyboardEvent): boolean {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value - 1 + props.items.length) % props.items.length
    return true
  }
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }
  if (event.key === 'Enter') {
    if (props.items[selectedIndex.value]) {
      selectItem(props.items[selectedIndex.value])
    }
    return true
  }
  return false
}

defineExpose({ onKeyDown })
</script>

