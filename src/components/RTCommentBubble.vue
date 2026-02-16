<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="bubbleRef"
      class="rte-comment-bubble"
      :class="{
        'rte-comment-bubble--dark': false,
      }"
      :style="bubbleStyle"
      role="dialog"
      aria-label="Comment thread"
      @keydown.escape="close"
    >
      <!-- Header -->
      <div class="rte-comment-bubble__header">
        <span class="rte-comment-bubble__title">
          {{ thread ? `${thread.replies.length + 1} comment${thread.replies.length > 0 ? 's' : ''}` : 'Comment' }}
        </span>
        <button
          class="rte-comment-bubble__close"
          type="button"
          aria-label="Close"
          @click="close"
        >&times;</button>
      </div>

      <!-- Thread: root comment + replies -->
      <div class="rte-comment-bubble__thread">
        <!-- Root comment -->
        <div v-if="thread" class="rte-comment-bubble__comment rte-comment-bubble__comment--root"
          :class="roleClass(thread.rootComment.authorRole)">
          <div class="rte-comment-bubble__meta">
            <span class="rte-comment-bubble__author">{{ thread.rootComment.authorName }}</span>
            <span class="rte-comment-bubble__badge" :class="`rte-comment-bubble__badge--${thread.rootComment.authorRole}`">
              {{ thread.rootComment.authorRole === 'teacher' ? 'Teacher' : 'Student' }}
            </span>
            <span class="rte-comment-bubble__time">{{ relativeTime(thread.rootComment.createdAt) }}</span>
          </div>
          <div class="rte-comment-bubble__content">{{ thread.rootComment.content }}</div>
          <!-- Root comment attachments placeholder -->
          <div class="rte-comment-bubble__actions">
            <button v-if="canResolve(thread.rootComment)" type="button" class="rte-comment-bubble__action" @click="resolveThread">
              {{ thread.isResolved ? 'Reopen' : 'Resolve' }}
            </button>
            <button v-if="canDelete(thread.rootComment)" type="button" class="rte-comment-bubble__action rte-comment-bubble__action--delete" @click="deleteComment(thread.rootComment.id)">
              Delete
            </button>
          </div>
        </div>

        <!-- Replies -->
        <div
          v-for="reply in thread?.replies ?? []"
          :key="reply.id"
          class="rte-comment-bubble__comment rte-comment-bubble__comment--reply"
          :class="roleClass(reply.authorRole)"
        >
          <div class="rte-comment-bubble__meta">
            <span class="rte-comment-bubble__author">{{ reply.authorName }}</span>
            <span class="rte-comment-bubble__badge" :class="`rte-comment-bubble__badge--${reply.authorRole}`">
              {{ reply.authorRole === 'teacher' ? 'Teacher' : 'Student' }}
            </span>
            <span class="rte-comment-bubble__time">{{ relativeTime(reply.createdAt) }}</span>
          </div>
          <div class="rte-comment-bubble__content">{{ reply.content }}</div>
          <div class="rte-comment-bubble__actions">
            <button v-if="canDelete(reply)" type="button" class="rte-comment-bubble__action rte-comment-bubble__action--delete" @click="deleteComment(reply.id)">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Reply input -->
      <div class="rte-comment-bubble__input-area">
        <div class="rte-comment-bubble__input-row">
          <input
            v-model="replyText"
            class="rte-comment-bubble__input"
            type="text"
            placeholder="Write a reply..."
            aria-label="Reply to comment"
            @keydown.enter.prevent="submitReply"
          />
          <button
            class="rte-comment-bubble__emoji-btn"
            type="button"
            aria-label="Add emoji"
            @click="showEmojiPicker = !showEmojiPicker"
          >😀</button>
          <button
            class="rte-comment-bubble__attach-btn"
            type="button"
            aria-label="Attach file"
            @click="triggerFileAttach"
          >📎</button>
          <button
            class="rte-comment-bubble__send-btn"
            type="button"
            aria-label="Send reply"
            :disabled="!replyText.trim()"
            @click="submitReply"
          >↩</button>
        </div>

        <!-- Inline Emoji Picker -->
        <RTEmojiPicker
          v-if="showEmojiPicker"
          :on-select="insertEmoji"
          @close="showEmojiPicker = false"
        />

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          class="rte-comment-bubble__file-input"
          style="display: none"
          @change="handleFileChange"
        />

        <!-- Attached files preview -->
        <div v-if="attachedFiles.length > 0" class="rte-comment-bubble__attachments">
          <div
            v-for="(file, index) in attachedFiles"
            :key="index"
            class="rte-comment-bubble__attachment"
          >
            <span class="rte-comment-bubble__attachment-name">{{ file.name }}</span>
            <button type="button" class="rte-comment-bubble__attachment-remove" @click="attachedFiles.splice(index, 1)">&times;</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { CommentStore, CommentThread, Comment } from '../types/comment'
import RTEmojiPicker from './RTEmojiPicker.vue'

interface Props {
  editor: any | null
  comments: CommentStore
  currentUserId: string
  currentUserRole: 'teacher' | 'student'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'reply', payload: { threadId: string; content: string; attachments?: File[] }): void
  (e: 'resolve', threadId: string): void
  (e: 'delete', commentId: string): void
  (e: 'close'): void
}>()

const isVisible = ref(false)
const activeThreadId = ref<string | null>(null)
const bubbleRef = ref<HTMLElement | null>(null)
const replyText = ref('')
const showEmojiPicker = ref(false)
const attachedFiles = ref<File[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const bubbleStyle = ref<Record<string, string>>({})

const thread = computed<CommentThread | undefined>(() => {
  if (!activeThreadId.value) return undefined
  return props.comments.getThread(activeThreadId.value)
})

// Permission checks
function canResolve(comment: Comment): boolean {
  return props.currentUserRole === 'teacher' || comment.authorId === props.currentUserId
}

function canDelete(comment: Comment): boolean {
  return props.currentUserRole === 'teacher' || comment.authorId === props.currentUserId
}

function roleClass(role: string): string {
  return `rte-comment-bubble__comment--${role}`
}

// Relative time formatting
function relativeTime(date: Date): string {
  const now = new Date()
  const d = date instanceof Date ? date : new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  return d.toLocaleDateString()
}

// Show bubble at position
function showAtPosition(threadId: string, rect: DOMRect) {
  activeThreadId.value = threadId
  isVisible.value = true

  nextTick(() => {
    if (!bubbleRef.value) return
    const bubbleWidth = 300
    const bubbleMaxHeight = 400
    const padding = 8

    let left = rect.left
    let top = rect.bottom + padding

    // Prevent overflow right
    if (left + bubbleWidth > window.innerWidth - padding) {
      left = window.innerWidth - bubbleWidth - padding
    }
    // Prevent overflow left
    if (left < padding) left = padding

    // Prevent overflow bottom — show above if not enough space
    if (top + bubbleMaxHeight > window.innerHeight - padding) {
      top = rect.top - bubbleMaxHeight - padding
      if (top < padding) top = padding
    }

    bubbleStyle.value = {
      left: `${left}px`,
      top: `${top}px`,
    }
  })
}

function close() {
  isVisible.value = false
  activeThreadId.value = null
  replyText.value = ''
  showEmojiPicker.value = false
  attachedFiles.value = []
  emit('close')
}

function submitReply() {
  if (!replyText.value.trim() || !activeThreadId.value) return
  emit('reply', {
    threadId: activeThreadId.value,
    content: replyText.value.trim(),
    attachments: attachedFiles.value.length > 0 ? [...attachedFiles.value] : undefined,
  })
  replyText.value = ''
  attachedFiles.value = []
}

function resolveThread() {
  if (activeThreadId.value) {
    emit('resolve', activeThreadId.value)
  }
}

function deleteComment(commentId: string) {
  emit('delete', commentId)
}

function insertEmoji(emoji: string) {
  replyText.value += emoji
  showEmojiPicker.value = false
}

function triggerFileAttach() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      attachedFiles.value.push(files[i])
    }
  }
  // Reset file input
  if (input) input.value = ''
}

// Click outside handler
function handleClickOutside(event: MouseEvent) {
  if (!isVisible.value) return
  if (bubbleRef.value && !bubbleRef.value.contains(event.target as Node)) {
    close()
  }
}

// Listen for clicks on comment highlights in the editor
function handleEditorClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const commentEl = target.closest?.('[data-comment-id]') as HTMLElement | null
  if (commentEl) {
    const threadId = commentEl.getAttribute('data-thread-id')
    if (threadId) {
      const rect = commentEl.getBoundingClientRect()
      showAtPosition(threadId, rect)
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  // Attach click handler to editor content
  nextTick(() => {
    const editorEl = document.querySelector('.rte-content')
    editorEl?.addEventListener('click', handleEditorClick as EventListener)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
  const editorEl = document.querySelector('.rte-content')
  editorEl?.removeEventListener('click', handleEditorClick as EventListener)
})

// Expose for parent to use
defineExpose({ showAtPosition, close })
</script>
