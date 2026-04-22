import type { Extension, Mark, Node } from '@tiptap/core'
import type { ExtensionInput, ExtensionKey, ExtensionSpec } from '../types'
import { coreExtensionFactory } from './core'

type ExtensionFactory = (options?: Record<string, unknown>) => (Extension | Node | Mark)[]

interface ExtensionEntry {
  key: ExtensionKey
  factory: ExtensionFactory
}

const registry: Record<ExtensionKey, ExtensionEntry> = {
  core: { key: 'core', factory: coreExtensionFactory },
}

function normalize(input: ExtensionInput): ExtensionSpec {
  return typeof input === 'string' ? { key: input } : input
}

export function resolveExtensions(
  inputs?: ExtensionInput[],
): (Extension | Node | Mark)[] {
  const list = inputs && inputs.length > 0 ? inputs : (['core'] as ExtensionInput[])

  return list.flatMap((raw) => {
    const spec = normalize(raw)
    const entry = registry[spec.key]
    if (!entry) {
      if (import.meta.env?.DEV) {
        console.warn(
          `[@teamsparta/rich-editor] Unknown extension key: "${String(spec.key)}". Skipped.`,
        )
      }
      return []
    }
    return entry.factory(spec.options)
  })
}
