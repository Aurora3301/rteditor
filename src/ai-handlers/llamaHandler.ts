import type { AIHandler, AIRequest, AIResponse } from '../types/ai'

export interface LlamaAIHandlerOptions {
  /** Ollama API endpoint (default: 'http://localhost:11434/api/generate') */
  endpoint?: string
  /** Model name (default: 'llama3.2') */
  model?: string
  /** Optional system prompt prepended to requests */
  systemPrompt?: string
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number
}

function buildOllamaPrompt(request: AIRequest, systemPrompt?: string): string {
  const parts: string[] = []

  if (systemPrompt) {
    parts.push(systemPrompt)
  }

  if (request.action) {
    parts.push(`Action: ${request.action}`)
  }

  if (request.selectedText) {
    parts.push(`Selected text:\n"""\n${request.selectedText}\n"""`)
  }

  if (request.surroundingContext) {
    parts.push(`Context:\n"""\n${request.surroundingContext}\n"""`)
  }

  parts.push(`User request: ${request.prompt}`)

  return parts.join('\n\n')
}

/**
 * Creates an AI handler that connects to a local Ollama/llama.cpp server.
 * Default endpoint: http://localhost:11434/api/generate (Ollama default)
 */
export function createLlamaAIHandler(options: LlamaAIHandlerOptions = {}): AIHandler {
  const {
    endpoint = 'http://localhost:11434/api/generate',
    model = 'llama3.2',
    systemPrompt,
    timeout = 60000,
  } = options

  return {
    async generate(request: AIRequest): Promise<AIResponse> {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const prompt = buildOllamaPrompt(request, systemPrompt)

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            prompt,
            stream: false,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          throw new Error(`Ollama request failed (${response.status}): ${errorText}`)
        }

        const data = await response.json() as Record<string, unknown>

        return {
          content: (data.response as string) || '',
          model: (data.model as string) || model,
          finishReason: data.done ? 'stop' : undefined,
          usage: data.eval_count
            ? {
                completionTokens: data.eval_count as number,
                promptTokens: data.prompt_eval_count as number | undefined,
                totalTokens: ((data.prompt_eval_count as number) || 0) + ((data.eval_count as number) || 0),
              }
            : undefined,
        }
      } finally {
        clearTimeout(timeoutId)
      }
    },
  }
}

