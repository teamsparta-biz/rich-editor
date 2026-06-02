import { useState } from 'react'
import type { Editor } from '@teamsparta-biz/rich-editor'
import { EditorPanel } from '../../widgets/editor-panel'
import { SAMPLE_HTML } from './samples'

const VERIFY_CLASSNAME = 'verify-classname-applied'

export function BasicsPage() {
  const [readOnly, setReadOnly] = useState(false)
  const [autofocus, setAutofocus] = useState(false)
  const [placeholder, setPlaceholder] = useState('내용을 입력하세요')

  const handleEditorReady = (editor: Editor) => {
    // F 영역 검증: 마운트 시 1회 호출 — 콘솔 로그 1줄로 확인
    // eslint-disable-next-line no-console
    console.log('[F-onEditorReady]', editor)
  }

  return (
    <div>
      <section className="mb-6 p-4 border border-zinc-200 rounded bg-zinc-50">
        <h2 className="text-sm font-medium text-zinc-700 mb-3">F 영역 — 부가 props 검증 토글</h2>
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={readOnly}
              onChange={(e) => setReadOnly(e.target.checked)}
            />
            <span>readOnly — 입력 차단·도구 비활성</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autofocus}
              onChange={(e) => setAutofocus(e.target.checked)}
            />
            <span>autofocus — 토글 시 재마운트되며 마운트 즉시 포커스</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0">placeholder</span>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="flex-1 px-2 py-1 border border-zinc-300 rounded"
            />
          </label>
          <p className="text-xs text-zinc-500 mt-1">
            className=<code>{VERIFY_CLASSNAME}</code> 하드코딩 적용 — DevTools Elements에서{' '}
            <code>div.rte-editor.{VERIFY_CLASSNAME}</code> 확인. onEditorReady는 마운트 시 콘솔에{' '}
            <code>[F-onEditorReady]</code> 로그 1회.
          </p>
        </div>
      </section>

      <EditorPanel
        initialHtml={SAMPLE_HTML}
        storageKey="rich-editor-playground-basics"
        placeholder={placeholder}
        readOnly={readOnly}
        autofocus={autofocus}
        className={VERIFY_CLASSNAME}
        onEditorReady={handleEditorReady}
      />
    </div>
  )
}
