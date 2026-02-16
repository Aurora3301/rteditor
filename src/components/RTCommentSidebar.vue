<template>
  <div
    v-if="isOpen"
    class="rte-comment-sidebar"
    :class="{
      'rte-comment-sidebar--overlay': isOverlay,
    }"
    role="complementary"
    aria-label="Comment sidebar"
    @keydown.escape="$emit('close')"
  >
    <!-- Backdrop for overlay mode -->
    <div v-if="isOverlay" class="rte-comment-sidebar__backdrop" @click="$emit('close')" />

    <div class="rte-comment-sidebar__panel" tabindex="-1">
      <!-- Header -->
      <div class="rte-comment-sidebar__header">
        <h3 class="rte-comment-sidebar__title">
          Comments <span v-if="totalCount > 0" class="rte-comment-sidebar__count">({{ totalCount }})</span>
        </h3>
        <div class="rte-comment-sidebar__header-actions">
          <select
            v-model="filter"
            class="rte-comment-sidebar__filter"
            aria-label="Filter comments"
          >
            <option value="all">All</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            class="rte-comment-sidebar__close"
            type="button"
            aria-label="Close sidebar"
            @click="$emit('close')"
          >&times;</button>
        </div>
      </div>

      <!-- Comment list -->
      <div class="rte-comment-sidebar__list">
        <!-- Empty state -->
        <div v-if="filteredThreads.length === 0" class="rte-comment-sidebar__empty">
          <span class="rte-comment-sidebar__empty-icon">💬</span>
          <span>{{ filter === 'all' ? 'No comments yet' : `No ${filter} comments` }}</span>
        </div>

        <!-- Unresolved section -->
        <template v-if="filter !== 'resolved'">
          <div
            v-for="thread in unresolvedThreads"
            :key="thread.rootComment.id"
            class="rte-comment-sidebar__entry"
            :class="{
              'rte-comment-sidebar__entry--active': activeThreadId === thread.rootComment.id,
            }"
            role="button"
            tabindex="0"
            @click="scrollToComment(thread)"
            @keydown.enter="scrollToComment(thread)"
          >
            <!-- Highlighted text snippet -->
            <div class="rte-comment-sidebar__snippet">
              "{{ truncate(thread.rootComment.highlightedText, 50) }}"
            </div>
            <div class="rte-comment-sidebar__entry-meta">
              <span class="rte-comment-sidebar__entry-author">{{ thread.rootComment.authorName }}</span>
              <span class="rte-comment-sidebar__badge" :class="`rte-comment-sidebar__badge--${thread.rootComment.authorRole}`">
                {{ thread.rootComment.authorRole === 'teacher' ? 'Teacher' : 'Student' }}
              </span>
              <span class="rte-comment-sidebar__entry-time">{{ relativeTime(thread.rootComment.createdAt) }}</span>
            </div>
            <div class="rte-comment-sidebar__entry-content">{{ truncate(thread.rootComment.content, 80) }}</div>
            <div class="rte-comment-sidebar__entry-footer">
              <span v-if="thread.replies.length > 0" class="rte-comment-sidebar__reply-count">
                {{ thread.replies.length }} {{ thread.replies.length === 1 ? 'reply' : 'replies' }}
              </span>
              <div class="rte-comment-sidebar__entry-actions">
                <button
                  v-if="canResolve(thread.rootComment)"
                  type="button"
                  class="rte-comment-sidebar__entry-action"
                  @click.stop="$emit('resolve', thread.rootComment.id)"
                >Resolve</button>
                <button
                  v-if="canDelete(thread.rootComment)"
                  type="button"
                  class="rte-comment-sidebar__entry-action rte-comment-sidebar__entry-action--delete"
                  @click.stop="$emit('delete', thread.rootComment.id)"
                >Delete</button>
              </div>
            </div>
          </div>
        </template>

        <!-- Resolved section -->
        <template v-if="filter !== 'unresolved' && resolvedThreads.length > 0">
          <div class="rte-comment-sidebar__section-header" @click="resolvedExpanded = !resolvedExpanded">
            <span>Resolved ({{ resolvedThreads.length }})</span>
            <span class="rte-comment-sidebar__expand-icon">{{ resolvedExpanded ? '▼' : '▶' }}</span>
          </div>
          <template v-if="resolvedExpanded">
            <div
              v-for="thread in resolvedThreads"
              :key="thread.rootComment.id"
              class="rte-comment-sidebar__entry rte-comment-sidebar__entry--resolved"
              role="button"
              tabindex="0"
              @click="scrollToComment(thread)"
              @keydown.enter="scrollToComment(thread)"
            >
              <div class="rte-comment-sidebar__snippet">
                "{{ truncate(thread.rootComment.highlightedText, 50) }}"
              </div>
              <div class="rte-comment-sidebar__entry-meta">
                <span class="rte-comment-sidebar__entry-author">{{ thread.rootComment.authorName }}</span>
                <span class="rte-comment-sidebar__entry-time">{{ relativeTime(thread.rootComment.createdAt) }}</span>
              </div>
              <div class="rte-comment-sidebar__entry-content">{{ truncate(thread.rootComment.content, 80) }}</div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { CommentStore, CommentThread, Comment } from '../types/comment'

interface Props {
  editor: any | null
  comments: CommentStore
  currentUserId: string
  currentUserRole: 'teacher' | 'student'
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'scroll-to-comment', commentId: string): void
  (e: 'resolve', commentId: string): void
  (e: 'delete', commentId: string): void
}>()

const filter = ref<'all' | 'unresolved' | 'resolved'>('all')
const resolvedExpanded = ref(false)
const activeThreadId = ref<string | null>(null)
const isOverlay = ref(false)

// Check viewport for responsive mode
function checkViewport() {
  isOverlay.value = window.innerWidth < 1024
}

onMounted(() => {
  checkViewport()
  window.addEventListener('resize', checkViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkViewport)
})

// Get all threads
const allThreads = computed<CommentThread[]>(() => {
  const threads: CommentThread[] = []
  props.comments.threads.forEach((thread) => {
    threads.push(thread)
  })
  return threads
})

const totalCount = computed(() => allThreads.value.length)

const unresolvedThreads = computed(() =>
  allThreads.value.filter(t => !t.isResolved)
)

const resolvedThreads = computed(() =>
  allThreads.value.filter(t => t.isResolved)
)

const filteredThreads = computed(() => {
  if (filter.value === 'unresolved') return unresolvedThreads.value
  if (filter.value === 'resolved') return resolvedThreads.value
  return allThreads.value
})

// Permission checks
function canResolve(comment: Comment): boolean {
  return props.currentUserRole === 'teacher' || comment.authorId === props.currentUserId
}

function canDelete(comment: Comment): boolean {
  return props.currentUserRole === 'teacher' || comment.authorId === props.currentUserId
}

// Truncate text
function truncate(text: string, maxLen: number): string {
  if (!text) return ''
  return text.length > maxLen ? text.substring(0, maxLen) + '…' : text
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
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString()
}

// Scroll editor to the comment's highlighted text
function scrollToComment(thread: CommentThread) {
  activeThreadId.value = thread.rootComment.id
  emit('scroll-to-comment', thread.rootComment.id)

  // Try to scroll to the comment in the editor and pulse highlight
  if (props.editor) {
    const { doc } = props.editor.state
    doc.descendants((node: any, pos: number) => {
      node.marks?.forEach((mark: any) => {
        if (mark.type.name === 'comment' && mark.attrs.threadId === thread.rootComment.id) {
          // Scroll the editor to this position
          try {
            const domNode = props.editor.view.domAtPos(pos)
            const el = domNode.node instanceof HTMLElement ? domNode.node : domNode.node.parentElement
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              // Add pulse class
              const commentEl = el.closest?.('[data-comment-id]') || el
              commentEl.classList?.add('rte-comment-highlight--active')
              setTimeout(() => {
                commentEl.classList?.remove('rte-comment-highlight--active')
              }, 1500)
            }
          } catch {
            // Ignore scroll errors
          }
        }
      })
    })
  }

  // Clear active state after a delay
  setTimeout(() => {
    if (activeThreadId.value === thread.rootComment.id) {
      activeThreadId.value = null
    }
  }, 2000)
}
</script>

