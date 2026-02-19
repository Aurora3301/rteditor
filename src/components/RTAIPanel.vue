<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import type { AIState, AIQuickAction } from '../types/ai'
import type { AIPanelPosition } from '../utils/aiPanelPosition'
import { t } from '../i18n'

const props = withDefaults(
  defineProps<{
    state: AIState
    quickActions?: AIQuickAction[]
    position?: AIPanelPosition
  }>(),
  {
    quickActions: () => ['simplify', 'grammar', 'expand', 'summarize', 'explain', 'translate'] as AIQuickAction[],
  },
)

const emit = defineEmits<{
  submit: [prompt: string, action?: AIQuickAction]
  accept: []
  acceptAndEdit: []
  reject: []
  retry: []
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const localPrompt = ref('')

const actionLabels: Record<AIQuickAction, string> = {
  simplify: 'ai.action.simplify',
  translate: 'ai.action.translate',
  grammar: 'ai.action.grammar',
  summarize: 'ai.action.summarize',
  expand: 'ai.action.expand',
  explain: 'ai.action.explain',
  continue: 'ai.action.continue',
  questions: 'ai.action.questions',
  rubric: 'ai.action.rubric',
}

const actionIcons: Record<AIQuickAction, string> = {
  simplify: '✂️',
  translate: '🌐',
  grammar: '✅',
  summarize: '📝',
  expand: '📖',
  explain: '💡',
  continue: '➡️',
  questions: '❓',
  rubric: '📋',
}

const panelStyle = computed(() => {
  if (!props.position) return {}
  return {
    top: `${props.position.top}px`,
    left: `${props.position.left}px`,
  }
})

const showQuickActions = computed(() => {
  return props.state.mode === 'prompt' && !props.state.isLoading && props.state.selectedText
})

function handleSubmit() {
  const prompt = localPrompt.value.trim()
  if (!prompt && !props.state.selectedText) return
  emit('submit', prompt || 'Improve this text')
}

function handleQuickAction(action: AIQuickAction) {
  emit('submit', t(actionLabels[action]), action)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    emit('close')
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}

// Focus textarea when panel opens
watch(
  () => props.state.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        textareaRef.value?.focus()
      })
    }
  },
)

// Click outside handler
function handleClickOutside(e: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside, true)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.isOpen"
      ref="panelRef"
      class="rte-ai-panel"
      :style="panelStyle"
      role="dialog"
      aria-label="AI Assistant"
      aria-modal="false"
      data-testid="rte-ai-panel"
      @keydown="handleKeydown"
    >
      <!-- Header -->
      <div class="rte-ai-panel__header">
        <span class="rte-ai-panel__header-title">
          <span>✨</span>
          <span>{{ t('ai.toolbar') }}</span>
        </span>
        <button
          class="rte-ai-panel__close"
          :aria-label="t('general.close')"
          data-testid="rte-ai-close"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Selected text preview -->
      <div v-if="state.selectedText" class="rte-ai-panel__selection">
        <div class="rte-ai-panel__selection-label">{{ t('ai.prompt.selection') }}</div>
        {{ state.selectedText.slice(0, 150) }}{{ state.selectedText.length > 150 ? '…' : '' }}
      </div>

      <!-- Quick Actions (when text is selected) -->
      <div v-if="showQuickActions" class="rte-ai-panel__quick-actions">
        <button
          v-for="action in quickActions"
          :key="action"
          class="rte-ai-panel__quick-action"
          :aria-label="t(actionLabels[action])"
          :data-testid="`rte-ai-action-${action}`"
          @click="handleQuickAction(action)"
        >
          {{ actionIcons[action] }} {{ t(actionLabels[action]) }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="state.isLoading" class="rte-ai-panel__loading" role="status" aria-live="polite">
        <div class="rte-ai-panel__spinner" aria-hidden="true" />
        <span>{{ t('ai.loading') }}</span>
      </div>

      <!-- Error State -->
      <div v-if="state.mode === 'error' && state.error" class="rte-ai-panel__error" role="alert">
        {{ state.error }}
      </div>

      <!-- Response Display -->
      <div v-if="state.mode === 'response' && state.response" class="rte-ai-panel__response">
        <div class="rte-ai-panel__response-content" v-html="state.response" />
      </div>

      <!-- Prompt Input (when not loading) -->
      <div v-if="!state.isLoading && state.mode !== 'response'" class="rte-ai-panel__prompt">
        <textarea
          ref="textareaRef"
          v-model="localPrompt"
          class="rte-ai-panel__textarea"
          :placeholder="t('ai.prompt.placeholder')"
          :aria-label="t('ai.prompt.placeholder')"
          rows="2"
          data-testid="rte-ai-textarea"
        />
        <button
          class="rte-ai-panel__submit"
          :disabled="!localPrompt.trim() && !state.selectedText"
          data-testid="rte-ai-submit"
          @click="handleSubmit"
        >
          {{ t('ai.button.submit') }}
        </button>
        <div class="rte-ai-panel__hint">{{ t('ai.prompt.hint') }}</div>
      </div>

      <!-- Response Actions -->
      <div v-if="state.mode === 'response'" class="rte-ai-panel__actions">
        <button
          class="rte-ai-panel__action-btn rte-ai-panel__action-btn--primary"
          data-testid="rte-ai-accept"
          @click="emit('accept')"
        >
          {{ t('ai.button.accept') }}
        </button>
        <button
          class="rte-ai-panel__action-btn"
          data-testid="rte-ai-accept-edit"
          @click="emit('acceptAndEdit')"
        >
          {{ t('ai.button.acceptEdit') }}
        </button>
        <button
          class="rte-ai-panel__action-btn"
          data-testid="rte-ai-reject"
          @click="emit('reject')"
        >
          {{ t('ai.button.reject') }}
        </button>
        <button
          class="rte-ai-panel__action-btn"
          data-testid="rte-ai-retry"
          @click="emit('retry')"
        >
          {{ t('ai.button.retry') }}
        </button>
      </div>

      <!-- Error Actions -->
      <div v-if="state.mode === 'error'" class="rte-ai-panel__actions">
        <button
          class="rte-ai-panel__action-btn"
          data-testid="rte-ai-error-retry"
          @click="emit('retry')"
        >
          {{ t('ai.button.retry') }}
        </button>
        <button
          class="rte-ai-panel__action-btn"
          @click="emit('close')"
        >
          {{ t('general.close') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
