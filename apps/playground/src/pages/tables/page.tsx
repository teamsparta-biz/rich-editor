import { useEffect, useState } from 'react'
import type { Editor } from '@teamsparta-biz/rich-editor'
import { EditorPanel } from '../../widgets/editor-panel'
import { SAMPLE_HTML } from './samples'

interface ToolbarAction {
  label: string
  run: (editor: Editor) => boolean
  /** editor.isActive·can 등을 이용한 활성 조건. 미지정 시 항상 활성 */
  enabled?: (editor: Editor) => boolean
}

// TipTap table commands(insertTable·mergeCells 등)의 type augmentation은
// 패키지 dist/index.d.ts에 포함되지 않으므로 chain을 cast해서 호출한다.
// 검증용 toolbar라 type 정밀도보다 동작이 우선.
type TableChain = {
  insertTable: () => TableChain
  addRowAfter: () => TableChain
  addColumnAfter: () => TableChain
  mergeCells: () => TableChain
  splitCell: () => TableChain
  deleteRow: () => TableChain
  deleteColumn: () => TableChain
  deleteTable: () => TableChain
  run: () => boolean
}
const tc = (e: Editor): TableChain => e.chain().focus() as unknown as TableChain

const ACTIONS: ToolbarAction[] = [
  {
    label: '표 삽입',
    run: (e) => tc(e).insertTable().run(),
  },
  {
    label: '행 추가 (아래)',
    run: (e) => tc(e).addRowAfter().run(),
    enabled: (e) => e.isActive('table'),
  },
  {
    label: '열 추가 (오른쪽)',
    run: (e) => tc(e).addColumnAfter().run(),
    enabled: (e) => e.isActive('table'),
  },
  {
    label: '셀 병합',
    run: (e) => tc(e).mergeCells().run(),
    enabled: (e) => e.isActive('table'),
  },
  {
    label: '셀 분리',
    run: (e) => tc(e).splitCell().run(),
    enabled: (e) => e.isActive('table'),
  },
  {
    label: '행 삭제',
    run: (e) => tc(e).deleteRow().run(),
    enabled: (e) => e.isActive('table'),
  },
  {
    label: '열 삭제',
    run: (e) => tc(e).deleteColumn().run(),
    enabled: (e) => e.isActive('table'),
  },
  {
    label: '표 삭제',
    run: (e) => tc(e).deleteTable().run(),
    enabled: (e) => e.isActive('table'),
  },
]

export function TablesPage() {
  const [editor, setEditor] = useState<Editor | null>(null)
  // editor.isActive는 selection 변경 시 재계산되어야 하므로 transaction 이벤트로 강제 re-render
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!editor) return
    const update = () => setTick((t) => t + 1)
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

  return (
    <div>
      <section className="mb-4 p-3 border border-zinc-200 rounded bg-zinc-50">
        <h2 className="text-sm font-medium text-zinc-700 mb-2">표 명령 toolbar</h2>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => {
            const enabled = !!editor && (a.enabled ? a.enabled(editor) : true)
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => editor && a.run(editor)}
                disabled={!enabled}
                className="px-3 py-1 border border-zinc-300 rounded text-sm hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {a.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          "표 삽입" 후 셀 안에 커서를 두면 나머지 명령이 활성화됩니다. 셀 병합은 두 개 이상 셀을 드래그 선택한 뒤 클릭.
        </p>
      </section>

      <EditorPanel
        initialHtml={SAMPLE_HTML}
        storageKey="rich-editor-playground-tables"
        extensions={['tables']}
        placeholder="표를 삽입하거나 기존 표를 편집해보세요"
        onEditorReady={setEditor}
      />
    </div>
  )
}
