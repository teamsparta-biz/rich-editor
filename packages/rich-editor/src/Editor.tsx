import { useEffect, useMemo, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { htmlSerializer } from './serialization/HtmlSerializer'
import { resolveExtensions } from './extensions/registry'
import { commentPluginKey } from './extensions/comment'
import type {
  CommentExtensionOptions,
  CoreExtensionOptions,
  ExtensionInput,
  RichEditorProps,
} from './types'

/**
 * `placeholder` prop이 주어지면 core 스펙의 options로 주입.
 * 사용자가 이미 `{ key: 'core', options: {...} }` 스펙을 전달했으면
 * 그 options를 존중하되 placeholder만 보충(덮어쓰지 않음).
 *
 * 입력 목록에 'core'가 없으면 맨 앞에 자동 주입한다. TipTap은 Document·
 * Paragraph·Text 없이는 schema를 구성할 수 없으므로, 소비자가 확장 키만
 * 나열해도 동작해야 한다 (예: extensions={['headings', 'lists']}).
 */
function mergePlaceholder(
  inputs: ExtensionInput[] | undefined,
  placeholder: string,
): ExtensionInput[] {
  const provided = inputs && inputs.length > 0 ? inputs : []
  const hasCore = provided.some((item) =>
    typeof item === 'string' ? item === 'core' : item.key === 'core',
  )
  const base: ExtensionInput[] = hasCore
    ? provided
    : [('core' as ExtensionInput), ...provided]
  if (!placeholder) return base

  return base.map((item): ExtensionInput => {
    if (typeof item === 'string') {
      if (item !== 'core') return item
      return { key: 'core', options: { placeholder } }
    }
    if (item.key !== 'core') return item
    const coreOptions = item.options as CoreExtensionOptions | undefined
    if (coreOptions && 'placeholder' in coreOptions) return item
    return {
      key: 'core',
      options: { ...(coreOptions ?? {}), placeholder },
    }
  })
}

/**
 * extensions 목록에 'comment' 키가 있으면 그 options에 RichEditor의 콜백/활성 getter를
 * 주입한다. comment 마크 plugin이 클릭(④)·활성 강조(⑤)에 이 핸들을 사용한다.
 * 값이 아닌 ref 기반 getter를 넣으므로 콜백/activeCommentId가 바뀌어도 extension은 재생성되지 않는다.
 */
function injectCommentOptions(
  inputs: ExtensionInput[],
  handlers: {
    onCommentClick: (commentId: string) => void
    getActiveCommentId: () => string | null | undefined
  },
): ExtensionInput[] {
  return inputs.map((item): ExtensionInput => {
    const key = typeof item === 'string' ? item : item.key
    if (key !== 'comment') return item
    const existing =
      typeof item === 'string' ? undefined : (item.options as CommentExtensionOptions | undefined)
    return {
      key: 'comment',
      options: {
        ...(existing ?? {}),
        onCommentClick: handlers.onCommentClick,
        getActiveCommentId: handlers.getActiveCommentId,
      },
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
    onCommentClick,
    onSelectionForComment,
    activeCommentId,
  } = props

  // comment 콜백/활성값은 자주 바뀌므로 ref로 유지 — extension 재생성(=editor 재구성) 회피
  const onCommentClickRef = useRef(onCommentClick)
  const onSelectionForCommentRef = useRef(onSelectionForComment)
  const activeCommentIdRef = useRef(activeCommentId)
  onCommentClickRef.current = onCommentClick
  onSelectionForCommentRef.current = onSelectionForComment
  activeCommentIdRef.current = activeCommentId

  const resolvedExtensions = useMemo(
    () =>
      resolveExtensions(
        injectCommentOptions(mergePlaceholder(extensions, placeholder), {
          onCommentClick: (id) => onCommentClickRef.current?.(id),
          getActiveCommentId: () => activeCommentIdRef.current,
        }),
      ),
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
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection
      if (from !== to) onSelectionForCommentRef.current?.({ from, to })
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

  // activeCommentId 변경 시 comment 데코 재계산 유도 (doc 변경이 없으므로 빈 meta로 트리거)
  useEffect(() => {
    if (!editor) return
    editor.view.dispatch(editor.state.tr.setMeta(commentPluginKey, true))
  }, [editor, activeCommentId])

  const combinedClassName = ['rte-editor', className].filter(Boolean).join(' ')

  return (
    <div className={combinedClassName}>
      <EditorContent editor={editor} />
    </div>
  )
}
