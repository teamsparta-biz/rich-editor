import type { Extension, Mark, Node as TiptapNode } from '@tiptap/core'
import { Node } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { ImageExtensionOptions } from '../types'

const DEFAULT_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif']

/**
 * Figure 블록 노드: `<figure><img><figcaption></figcaption></figure>` 구조.
 * - allowCaption=true일 때만 이 노드를 확장 배열에 포함
 * - content: 'image figcaption?' — image 하나 + 선택적 figcaption
 */
const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'image figcaption?',
  draggable: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'figure' }]
  },
  renderHTML() {
    return ['figure', 0]
  },
})

const Figcaption = Node.create({
  name: 'figcaption',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'figcaption' }]
  },
  renderHTML() {
    return ['figcaption', 0]
  },
})

function devWarn(msg: string): void {
  if (import.meta.env?.DEV) {
    console.warn(`[@teamsparta-biz/rich-editor] ${msg}`)
  }
}

interface UploadContext {
  imageUpload?: (file: File) => Promise<string>
  acceptedTypes: string[]
  maxSize?: number
  allowCaption: boolean
}

function validateFile(file: File, ctx: UploadContext): boolean {
  if (!ctx.imageUpload) {
    devWarn('images: imageUpload 훅이 주입되지 않아 삽입이 거부되었습니다.')
    return false
  }
  if (!ctx.acceptedTypes.includes(file.type)) {
    devWarn(`images: MIME "${file.type}"은(는) acceptedTypes에 없어 거부되었습니다.`)
    return false
  }
  if (ctx.maxSize !== undefined && file.size > ctx.maxSize) {
    devWarn(`images: 파일 크기 ${file.size}B가 maxSize ${ctx.maxSize}B를 초과했습니다.`)
    return false
  }
  return true
}

async function uploadAndGetUrl(
  file: File,
  ctx: UploadContext,
): Promise<string | null> {
  if (!ctx.imageUpload) return null
  try {
    return await ctx.imageUpload(file)
  } catch (err) {
    devWarn(`images: imageUpload 훅이 reject됨. ${String(err)}`)
    return null
  }
}

function insertImageAt(
  view: EditorView,
  pos: number,
  src: string,
  allowCaption: boolean,
  altFallback: string,
): void {
  const schema = view.state.schema
  const imageNodeType = schema.nodes['image']
  if (!imageNodeType) return

  const imgAttrs = { src, alt: altFallback }
  const figureNodeType = schema.nodes['figure']

  if (allowCaption && figureNodeType) {
    const img = imageNodeType.create(imgAttrs)
    const node = figureNodeType.create({}, img)
    view.dispatch(view.state.tr.insert(pos, node))
    return
  }

  const node = imageNodeType.create(imgAttrs)
  view.dispatch(view.state.tr.insert(pos, node))
}

function createUploadPlugin(ctx: UploadContext, allowPaste: boolean, allowDrop: boolean) {
  const key = new PluginKey('rte-image-upload')
  return new Plugin({
    key,
    props: {
      handleDOMEvents: {
        drop(view, event) {
          if (!allowDrop) return false
          const dt = (event as DragEvent).dataTransfer
          if (!dt || dt.files.length === 0) return false
          const files = Array.from(dt.files).filter((f) => f.type.startsWith('image/'))
          if (files.length === 0) return false

          event.preventDefault()

          const dragEvent = event as DragEvent
          const coords = view.posAtCoords({
            left: dragEvent.clientX,
            top: dragEvent.clientY,
          })
          const pos = coords?.pos ?? view.state.selection.to

          files.forEach((file) => {
            if (!validateFile(file, ctx)) return
            uploadAndGetUrl(file, ctx).then((url) => {
              if (!url) return
              insertImageAt(view, pos, url, ctx.allowCaption, file.name)
            })
          })
          return true
        },
        paste(view, event) {
          if (!allowPaste) return false
          const items = (event as ClipboardEvent).clipboardData?.items
          if (!items) return false
          const files: File[] = []
          for (const item of Array.from(items)) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
              const f = item.getAsFile()
              if (f) files.push(f)
            }
          }
          if (files.length === 0) return false

          event.preventDefault()
          const pos = view.state.selection.to

          files.forEach((file) => {
            if (!validateFile(file, ctx)) return
            uploadAndGetUrl(file, ctx).then((url) => {
              if (!url) return
              insertImageAt(view, pos, url, ctx.allowCaption, file.name)
            })
          })
          return true
        },
      },
    },
  })
}

/**
 * images factory — Image node (+선택적 Figure/Figcaption) + upload plugin.
 */
export function imagesExtensionFactory(
  options?: ImageExtensionOptions,
): (Extension | TiptapNode | Mark)[] {
  const allowCaption = options?.allowCaption ?? true
  const allowPaste = options?.allowPaste ?? true
  const allowDrop = options?.allowDrop ?? true
  const acceptedTypes = options?.acceptedTypes ?? DEFAULT_ACCEPTED_TYPES

  const ctx: UploadContext = {
    imageUpload: options?.imageUpload,
    acceptedTypes,
    maxSize: options?.maxSize,
    allowCaption,
  }

  const ImageConfigured = Image.extend({
    addProseMirrorPlugins() {
      const parent = this.parent?.() ?? []
      return [...parent, createUploadPlugin(ctx, allowPaste, allowDrop)]
    },
  }).configure({
    allowBase64: false,
    inline: false,
  })

  const extensions: (Extension | TiptapNode | Mark)[] = [ImageConfigured]
  if (allowCaption) {
    extensions.push(Figure, Figcaption)
  }
  return extensions
}
