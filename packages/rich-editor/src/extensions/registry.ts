import type { Extension, Mark, Node } from '@tiptap/core'
import type {
  ExtensionInput,
  ExtensionKey,
  ExtensionOptionsMap,
  ExtensionSpec,
} from '../types'
import { coreExtensionFactory } from './core'
import { headingsExtensionFactory } from './headings'
import { listsExtensionFactory } from './lists'
import { linksExtensionFactory } from './links'
import { codeBlockExtensionFactory } from './codeBlock'
import { taskListExtensionFactory } from './taskList'
import { imagesExtensionFactory } from './images'
import { tablesExtensionFactory } from './tables'
import { marksExtensionFactory } from './marks'

type ExtensionFactory<K extends ExtensionKey> = (
  options?: ExtensionOptionsMap[K],
) => (Extension | Node | Mark)[]

type RegistryEntries = {
  [K in ExtensionKey]: { key: K; factory: ExtensionFactory<K> }
}

const registry: RegistryEntries = {
  core: { key: 'core', factory: coreExtensionFactory },
  headings: { key: 'headings', factory: headingsExtensionFactory },
  lists: { key: 'lists', factory: listsExtensionFactory },
  links: { key: 'links', factory: linksExtensionFactory },
  codeBlock: { key: 'codeBlock', factory: codeBlockExtensionFactory },
  taskList: { key: 'taskList', factory: taskListExtensionFactory },
  images: { key: 'images', factory: imagesExtensionFactory },
  tables: { key: 'tables', factory: tablesExtensionFactory },
  marks: { key: 'marks', factory: marksExtensionFactory },
}

function normalize(input: ExtensionInput): ExtensionSpec {
  return typeof input === 'string' ? ({ key: input } as ExtensionSpec) : input
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
          `[@teamsparta-biz/rich-editor] Unknown extension key: "${String(spec.key)}". Skipped.`,
        )
      }
      return []
    }
    // entry·spec의 key가 동일하므로 options 타입이 일치함을 TS가 추론하지 못해 캐스팅.
    const factory = entry.factory as ExtensionFactory<ExtensionKey>
    return factory(spec.options)
  })
}
