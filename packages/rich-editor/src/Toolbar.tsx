import { useEffect, useReducer } from 'react'
import type { Editor } from '@tiptap/core'

/**
 * Toolbar — RichEditor 서식 툴바.
 *
 * 로드된 확장만큼만 버튼을 노출한다(예: extensions에 'marks'가 없으면 굵게/기울임 미표시).
 * 활성 상태(editor.isActive)·실행(editor.chain) 모두 editor 인스턴스에만 의존하며,
 * 본체 데이터·권한은 다루지 않는다(comment 책임 경계와 동일 철학 — UI 셸만 제공).
 *
 * `<RichEditor toolbar />`로 내장 렌더하거나, onEditorReady로 받은 editor를 넘겨
 * 독립 배치할 수 있다. readOnly 에디터에는 RichEditor가 렌더하지 않는다.
 */
export interface ToolbarProps {
  /** 대상 에디터 인스턴스. null이면 아무것도 렌더하지 않는다(마운트 전). */
  editor: Editor | null
  /** 외부 스타일 override 클래스. 'rte-toolbar'와 함께 적용. */
  className?: string
}

const tick = (n: number): number => n + 1

/** 로드된 확장 이름 집합으로 버튼 노출을 가른다. */
function hasExtension(editor: Editor, name: string): boolean {
  return editor.extensionManager.extensions.some((ext) => ext.name === name)
}

interface ButtonSpec {
  key: string
  label: string
  title: string
  /** 이 버튼을 노출할지 — 필요한 확장이 로드됐는지. */
  available: (editor: Editor) => boolean
  isActive: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const BUTTONS: ButtonSpec[] = [
  {
    key: 'bold',
    label: 'B',
    title: '굵게',
    available: (e) => hasExtension(e, 'bold'),
    isActive: (e) => e.isActive('bold'),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    key: 'italic',
    label: 'I',
    title: '기울임',
    available: (e) => hasExtension(e, 'italic'),
    isActive: (e) => e.isActive('italic'),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    key: 'underline',
    label: 'U',
    title: '밑줄',
    available: (e) => hasExtension(e, 'underline'),
    isActive: (e) => e.isActive('underline'),
    run: (e) => e.chain().focus().toggleUnderline().run(),
  },
  {
    key: 'strike',
    label: 'S',
    title: '취소선',
    available: (e) => hasExtension(e, 'strike'),
    isActive: (e) => e.isActive('strike'),
    run: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    key: 'h1',
    label: 'H1',
    title: '제목 1',
    available: (e) => hasExtension(e, 'heading'),
    isActive: (e) => e.isActive('heading', { level: 1 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    key: 'h2',
    label: 'H2',
    title: '제목 2',
    available: (e) => hasExtension(e, 'heading'),
    isActive: (e) => e.isActive('heading', { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    key: 'h3',
    label: 'H3',
    title: '제목 3',
    available: (e) => hasExtension(e, 'heading'),
    isActive: (e) => e.isActive('heading', { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    key: 'bulletList',
    label: '• 목록',
    title: '글머리 기호 목록',
    available: (e) => hasExtension(e, 'bulletList'),
    isActive: (e) => e.isActive('bulletList'),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    key: 'orderedList',
    label: '1. 목록',
    title: '번호 매기기 목록',
    available: (e) => hasExtension(e, 'orderedList'),
    isActive: (e) => e.isActive('orderedList'),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    key: 'blockquote',
    label: '" 인용',
    title: '인용문',
    available: (e) => hasExtension(e, 'blockquote'),
    isActive: (e) => e.isActive('blockquote'),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    key: 'code',
    label: '</>',
    title: '인라인 코드',
    available: (e) => hasExtension(e, 'code'),
    isActive: (e) => e.isActive('code'),
    run: (e) => e.chain().focus().toggleCode().run(),
  },
]

export function Toolbar({ editor, className }: ToolbarProps) {
  // editor의 트랜잭션/선택 변경마다 강제 재렌더 → 활성 상태(B 눌림 등) 즉시 반영.
  const [, forceUpdate] = useReducer(tick, 0)

  useEffect(() => {
    if (!editor) return
    const update = () => forceUpdate()
    editor.on('transaction', update)
    editor.on('selectionUpdate', update)
    return () => {
      editor.off('transaction', update)
      editor.off('selectionUpdate', update)
    }
  }, [editor])

  if (!editor) return null

  const buttons = BUTTONS.filter((spec) => spec.available(editor))
  if (buttons.length === 0) return null

  const combinedClassName = ['rte-toolbar', className].filter(Boolean).join(' ')

  return (
    <div className={combinedClassName} role="toolbar" aria-label="서식 도구">
      {buttons.map((spec) => {
        const active = spec.isActive(editor)
        const btnClass = ['rte-toolbar__button', active ? 'rte-toolbar__button--active' : '']
          .filter(Boolean)
          .join(' ')
        return (
          <button
            key={spec.key}
            type="button"
            className={btnClass}
            title={spec.title}
            aria-label={spec.title}
            aria-pressed={active}
            // mousedown 기본동작(선택 해제)을 막아 버튼 클릭 시 본문 선택 유지.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => spec.run(editor)}
          >
            {spec.label}
          </button>
        )
      })}
    </div>
  )
}
