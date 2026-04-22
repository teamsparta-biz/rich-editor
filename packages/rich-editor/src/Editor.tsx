import { useEffect, useMemo, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { htmlSerializer } from './serialization/HtmlSerializer'
import { resolveExtensions } from './extensions/registry'
import type { ExtensionInput, RichEditorProps } from './types'

/**
 * `placeholder` prop이 주어지면 core 스펙의 options로 주입.
 * 사용자가 이미 `{ key: 'core', options: {...} }` 스펙을 전달했으면
 * 그 options를 존중하되 placeholder만 보충(덮어쓰지 않음).
 */
function mergePlaceholder(
  inputs: ExtensionInput[] | undefined,
  placeholder: string,
): ExtensionInput[] {
  const base = inputs && inputs.length > 0 ? inputs : (['core'] as ExtensionInput[])
  if (!placeholder) return base

  return base.map((item) => {
    const spec = typeof item === 'string' ? { key: item } : item
    if (spec.key !== 'core') return item
    const hasPlaceholder =
      spec.options && Object.prototype.hasOwnProperty.call(spec.options, 'placeholder')
    if (hasPlaceholder) return item
    return {
      key: 'core' as const,
      options: { ...(spec.options ?? {}), placeholder },
    }
  })
}

export function RichEditor(props: RichEditorProps) {
  const {
    initialHtml = '',
    onChangeHtml,
    extensions,
    readOnly = false,
    placeholder = '',
    autofocus = false,
    className,
    onEditorReady,
  } = props

  const resolvedExtensions = useMemo(
    () => resolveExtensions(mergePlaceholder(extensions, placeholder)),
    [extensions, placeholder],
  )

  const editor = useEditor({
    extensions: resolvedExtensions,
    content: initialHtml,
    editable: !readOnly,
    autofocus,
    onUpdate: ({ editor: ed }) => {
      onChangeHtml?.(htmlSerializer.toHtml(ed))
    },
  })

  const readyFiredRef = useRef(false)
  useEffect(() => {
    if (!editor || readyFiredRef.current) return
    readyFiredRef.current = true
    onEditorReady?.(editor)
  }, [editor, onEditorReady])

  useEffect(() => {
    if (!editor) return
    const current = htmlSerializer.toHtml(editor)
    if (current !== initialHtml) {
      htmlSerializer.fromHtml(editor, initialHtml)
    }
  }, [editor, initialHtml])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly)
  }, [editor, readOnly])

  const combinedClassName = ['rte-editor', className].filter(Boolean).join(' ')

  return (
    <div className={combinedClassName}>
      <EditorContent editor={editor} />
    </div>
  )
}
