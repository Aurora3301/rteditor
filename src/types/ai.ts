import type { Editor } from '@tiptap/core'

/** Quick actions available in the AI panel */
export type AIQuickAction =
  | 'simplify'
  | 'translate'
  | 'grammar'
  | 'summarize'
  | 'expand'
  | 'explain'
  | 'continue'
  | 'questions'
  | 'rubric'

/** How much surrounding context to include in AI requests */
export type AIContextLevel = 'minimal' | 'standard' | 'full'

/** Metadata about the AI request context */
export interface AIMetadata {
  documentTitle?: string
  documentLength?: number
  selectionLength?: number
  cursorPosition?: number
  locale?: string
  timestamp?: number
}

/** Request sent to the AI handler */
export interface AIRequest {
  prompt: string
  action?: AIQuickAction
  selectedText?: string
  surroundingContext?: string
  fullDocument?: string
  contextLevel: AIContextLevel
  metadata: AIMetadata
}

/** Response received from the AI handler */
export interface AIResponse {
  content: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
  model?: string
  finishReason?: string
}

/** Handler interface that AI providers must implement */
export interface AIHandler {
  generate(request: AIRequest): Promise<AIResponse>
}

/** Configuration options for AI functionality */
export interface AIOptions {
  handler: AIHandler
  contextLevel?: AIContextLevel
  quickActions?: AIQuickAction[]
  maxContextLength?: number
  systemPrompt?: string
  enabled?: boolean
}

/** Reactive state of the AI panel */
export interface AIState {
  isOpen: boolean
  isLoading: boolean
  mode: 'prompt' | 'response' | 'error'
  prompt: string
  response: string
  error: string | null
  selectedText: string
  lastAction?: AIQuickAction
}

