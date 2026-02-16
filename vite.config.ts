import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        '@tiptap/vue-3',
        '@tiptap/core',
        '@tiptap/pm',
        '@tiptap/starter-kit',
        '@tiptap/extension-underline',
        '@tiptap/extension-link',
        '@tiptap/extension-image',
        '@tiptap/extension-text-align',
        '@tiptap/extension-subscript',
        '@tiptap/extension-superscript',
        '@tiptap/extension-placeholder',
        '@tiptap/extension-horizontal-rule',
        '@tiptap/extension-bubble-menu',
        '@tiptap/extension-heading',
        '@tiptap/extension-history',
        '@tiptap/extension-bullet-list',
        '@tiptap/extension-ordered-list',
        '@tiptap/extension-strike',
        '@tiptap/extensions',
        'katex',
        'dompurify',
      ],
      output: {
        globals: {
          vue: 'Vue',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'style.css'
          return assetInfo.name ?? 'asset'
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
})
