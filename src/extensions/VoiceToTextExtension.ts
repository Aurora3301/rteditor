import { Extension } from '@tiptap/core'

export interface VoiceToTextExtensionOptions {
  /** BCP 47 language tag for speech recognition. Default: 'en-US' */
  lang?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    voiceToText: {
      /**
       * Insert dictated text at the current cursor position.
       */
      insertDictatedText: (text: string) => ReturnType
    }
  }
}

export const VoiceToTextExtension = Extension.create<VoiceToTextExtensionOptions>({
  name: 'voiceToText',

  addOptions() {
    return {
      lang: 'en-US',
    }
  },

  addCommands() {
    return {
      insertDictatedText:
        (text: string) =>
        ({ commands }) => {
          return commands.insertContent(text)
        },
    }
  },
})

