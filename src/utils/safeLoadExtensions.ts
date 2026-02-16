import type { AnyExtension, Extensions } from '@tiptap/core'

/**
 * Safely loads an array of TipTap extensions, filtering out any that throw
 * during initialization. This ensures that a broken Phase 2+ extension
 * never prevents the Phase 1 core editor from loading.
 *
 * @param extensions - Array of TipTap extensions to validate
 * @returns A filtered array containing only extensions that loaded without errors
 */
export function safeLoadExtensions(extensions: Extensions): Extensions {
  const safe: Extensions = []

  for (const ext of extensions) {
    try {
      // Extensions in TipTap are objects with a `name` property.
      // If an extension was created via `Extension.create()` or `.configure()`,
      // it would have already thrown during that call. But we still guard here
      // in case an extension getter or lazy factory throws.
      if (ext && typeof ext === 'object' && 'name' in (ext as AnyExtension)) {
        safe.push(ext)
      } else if (Array.isArray(ext)) {
        // Handle nested extension arrays (e.g., from presets that return arrays)
        safe.push(...safeLoadExtensions(ext as Extensions))
      } else {
        console.warn(
          '[RTEditor] Skipping invalid extension — not a valid TipTap extension object:',
          ext,
        )
      }
    } catch (err) {
      const name = (ext as AnyExtension)?.name ?? 'unknown'
      console.warn(
        `[RTEditor] Extension "${name}" threw during loading and was skipped:`,
        err,
      )
    }
  }

  return safe
}

