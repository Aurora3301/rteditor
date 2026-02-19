<script setup lang="ts">
defineProps<{
  isSupported: boolean
  isListening: boolean
}>()

const emit = defineEmits<{
  'toggle-voice': []
}>()
</script>

<template>
  <button
    v-if="isSupported"
    class="rte-toolbar__button"
    :class="{ 'rte-toolbar__button--active rte-toolbar__button--voice-active': isListening }"
    :aria-label="isListening ? 'Stop voice dictation' : 'Start voice dictation'"
    :aria-pressed="isListening"
    :data-tooltip="isListening ? 'Stop voice dictation' : 'Start voice dictation'"
    data-testid="rte-toolbar-voiceToText"
    @click="emit('toggle-voice')"
  >
    <svg viewBox="0 0 24 24">
      <!-- Microphone icon -->
      <rect x="9" y="1" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </svg>
    <!-- Pulsing indicator when listening -->
    <span
      v-if="isListening"
      class="rte-voice-indicator"
      aria-hidden="true"
    />
    <span class="rte-tooltip">
      {{ isListening ? 'Stop voice dictation' : 'Start voice dictation' }}
    </span>
  </button>
</template>

<style scoped>
.rte-voice-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: rte-voice-pulse 1.2s ease-in-out infinite;
}

@keyframes rte-voice-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

.rte-toolbar__button--voice-active {
  position: relative;
  color: #ef4444;
}
</style>

