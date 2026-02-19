import { ref, onBeforeUnmount } from 'vue'
import { getLocale } from '../i18n'

// Web Speech API type declarations (not included in all TS lib targets)
interface SpeechRecognitionEventMap {
  audioend: Event
  audiostart: Event
  end: Event
  error: SpeechRecognitionErrorEvent
  nomatch: SpeechRecognitionEvent
  result: SpeechRecognitionEvent
  soundend: Event
  soundstart: Event
  speechend: Event
  speechstart: Event
  start: Event
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  start(): void
  stop(): void
  abort(): void
  addEventListener<K extends keyof SpeechRecognitionEventMap>(
    type: K, listener: (ev: SpeechRecognitionEventMap[K]) => void
  ): void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

type SpeechRecognitionErrorCode =
  | 'aborted'
  | 'audio-capture'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'network'
  | 'no-speech'
  | 'not-allowed'
  | 'service-not-allowed'

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode
  readonly message: string
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export interface VoiceToTextOptions {
  /** BCP 47 language tag, e.g., 'en-US', 'zh-TW'. Defaults to current i18n locale. */
  lang?: string
  /** Whether recognition should continue until explicitly stopped. Default: true */
  continuous?: boolean
  /** Whether interim (non-final) results should be reported. Default: true */
  interimResults?: boolean
  /** Callback fired when a speech result is received */
  onResult?: (text: string, isFinal: boolean) => void
  /** Callback fired on recognition error */
  onError?: (error: string) => void
}

/** Map locale codes used by the editor to BCP 47 speech recognition language tags */
function localeToBCP47(locale: string): string {
  const map: Record<string, string> = {
    en: 'en-US',
    'zh-TW': 'zh-TW',
  }
  return map[locale] || locale
}

export function useVoiceToText(options: VoiceToTextOptions = {}) {
  const isSupported = ref(false)
  const isListening = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const error = ref<string | null>(null)

  let recognition: SpeechRecognition | null = null
  let shouldRestart = false

  // Check browser support
  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : undefined

  isSupported.value = !!SpeechRecognitionCtor

  if (SpeechRecognitionCtor) {
    recognition = new SpeechRecognitionCtor()
    recognition.continuous = options.continuous ?? true
    recognition.interimResults = options.interimResults ?? true
    recognition.lang = options.lang || localeToBCP47(getLocale())

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        transcript.value += final
        options.onResult?.(final, true)
      }

      interimTranscript.value = interim
      if (interim) {
        options.onResult?.(interim, false)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg = mapErrorMessage(event.error)
      error.value = msg
      options.onError?.(msg)

      // Don't auto-restart on fatal errors
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldRestart = false
        isListening.value = false
      }
    }

    recognition.onend = () => {
      // Auto-restart if we're supposed to still be listening (continuous mode)
      if (shouldRestart && isListening.value) {
        try {
          recognition!.start()
        } catch {
          isListening.value = false
          shouldRestart = false
        }
      } else {
        isListening.value = false
      }
    }
  }

  function start(): void {
    if (!recognition || !isSupported.value) {
      error.value = 'Speech recognition is not supported in this browser'
      options.onError?.(error.value)
      return
    }

    error.value = null
    interimTranscript.value = ''
    shouldRestart = true

    try {
      recognition.start()
      isListening.value = true
    } catch (e) {
      // Already started — ignore
      if (e instanceof DOMException && e.name === 'InvalidStateError') {
        isListening.value = true
      } else {
        error.value = 'Failed to start speech recognition'
        options.onError?.(error.value)
      }
    }
  }

  function stop(): void {
    shouldRestart = false
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        // Ignore errors when stopping
      }
    }
    isListening.value = false
    interimTranscript.value = ''
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
  }
}

function mapErrorMessage(error: SpeechRecognitionErrorCode): string {
  switch (error) {
    case 'not-allowed':
      return 'Microphone access was denied. Please allow microphone access and try again.'
    case 'no-speech':
      return 'No speech was detected. Please try again.'
    case 'audio-capture':
      return 'No microphone was found. Please ensure a microphone is connected.'
    case 'network':
      return 'A network error occurred during speech recognition.'
    case 'service-not-allowed':
      return 'Speech recognition service is not allowed.'
    case 'aborted':
      return 'Speech recognition was aborted.'
    default:
      return `Speech recognition error: ${error}`
  }
}

