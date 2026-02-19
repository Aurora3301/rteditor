import type { AIHandler, AIRequest, AIResponse } from '../types/ai'

export interface DKIAIHandlerOptions {
  /** The Laravel API endpoint (e.g., '/api/ai/generate') */
  endpoint: string
  /** CSRF token for Laravel requests */
  csrfToken?: string
  /** Optional Axios-like instance with interceptors */
  httpClient?: {
    post: (url: string, data: unknown, config?: unknown) => Promise<{ data: unknown }>
  }
  /** Optional custom headers */
  headers?: Record<string, string>
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
}

/**
 * Creates a DKI (Laravel-based) AI handler.
 * Uses Axios-style HTTP client if provided, otherwise falls back to fetch.
 */
export function createDKIAIHandler(options: DKIAIHandlerOptions): AIHandler {
  const { endpoint, csrfToken, httpClient, headers: customHeaders, timeout = 30000 } = options

  return {
    async generate(request: AIRequest): Promise<AIResponse> {
      const payload = {
        prompt: request.prompt,
        action: request.action,
        selected_text: request.selectedText,
        surrounding_context: request.surroundingContext,
        context_level: request.contextLevel,
        metadata: request.metadata,
      }

      if (httpClient) {
        // Use Axios-like client
        const { data } = await httpClient.post(endpoint, payload, { timeout })
        const d = data as Record<string, unknown>
        return {
          content: (d.content as string) || (d.data as string) || '',
          model: d.model as string | undefined,
        }
      }

      // Fallback to fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...customHeaders,
        }
        if (csrfToken) {
          headers['X-CSRF-TOKEN'] = csrfToken
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
          credentials: 'same-origin',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
          throw new Error((errorData as Record<string, string>).message || `AI request failed (${response.status})`)
        }

        const data = await response.json() as Record<string, unknown>
        return {
          content: (data.content as string) || (data.data as string) || '',
          model: data.model as string | undefined,
        }
      } finally {
        clearTimeout(timeoutId)
      }
    },
  }
}

