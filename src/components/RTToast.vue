<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    message: string
    type?: 'error' | 'success' | 'info'
    duration?: number
    dismissible?: boolean
  }>(),
  {
    type: 'info',
    duration: 5000,
    dismissible: true,
  },
)

const emit = defineEmits<{
  dismiss: []
}>()

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      emit('dismiss')
    }, props.duration)
  }
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div
    class="rte-toast"
    :class="`rte-toast--${type}`"
    role="alert"
    :data-testid="`rte-toast-${type}`"
  >
    <span class="rte-toast__message">{{ message }}</span>
    <button
      v-if="dismissible"
      class="rte-toast__dismiss"
      aria-label="Dismiss notification"
      data-testid="rte-toast-dismiss"
      @click="emit('dismiss')"
    >
      ✕
    </button>
  </div>
</template>
