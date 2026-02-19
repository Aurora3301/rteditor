import type { AIHandler, AIRequest, AIResponse } from '../types/ai'

export interface ProxyAIHandlerOptions {
  /** The endpoint URL to send AI requests to */
  endpoint: string
  /** Optional API key for authentication */
  apiKey?: string
  /** Optional custom headers */
  headers?: Record<string, string>
  /** Optional request transformer */
  transformRequest?: (request: AIRequest) => unknown
  /** Optional response transformer */
  transformResponse?: (data: unknown) => AIResponse
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
}

/**
 * Creates a generic proxy AI handler that sends requests via fetch.
 * Suitable for custom API endpoints or proxy servers.
 */
export function createProxyAIHandler(options: ProxyAIHandlerOptions): AIHandler {
  const { endpoint, apiKey, headers: customHeaders, transformRequest, transformResponse, timeout = 30000 } = options

  return {
    async generate(request: AIRequest): Promise<AIResponse> {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...customHeaders,
        }
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`
        }

        const body = transformRequest ? transformRequest(request) : request

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          throw new Error(`AI request failed (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        return transformResponse ? transformResponse(data) : (data as AIResponse)
      } finally {
        clearTimeout(timeoutId)
      }
    },
  }
}

