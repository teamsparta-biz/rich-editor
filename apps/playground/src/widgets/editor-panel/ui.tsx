import { useEffect, useState } from 'react'
import { RichEditor } from '@teamsparta/rich-editor'
import type { ExtensionInput } from '@teamsparta/rich-editor'
import '@teamsparta/rich-editor/styles.css'
import { storage } from '../../shared/storage'

const STATUS_TIMEOUT_MS = 3000

function nowHHMMSS(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export interface EditorPanelProps {
  initialHtml: string
  storageKey: string
  extensions?: ExtensionInput[]
  placeholder?: string
}

export function EditorPanel({
  initialHtml,
  storageKey,
  extensions,
  placeholder = '',
}: EditorPanelProps) {
  const [html, setHtml] = useState<string>(initialHtml)
  const [onChangeHtml, setOnChangeHtml] = useState<string>(initialHtml)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    if (!status) return
    const id = window.setTimeout(() => setStatus(''), STATUS_TIMEOUT_MS)
    return () => window.clearTimeout(id)
  }, [status])

  const handleSave = () => {
    const payload = onChangeHtml || html
    storage.save(storageKey, payload)
    setStatus(`✓ 저장됨 ${nowHHMMSS()}`)
  }

  const handleLoad = () => {
    const loaded = storage.load(storageKey)
    if (loaded === null) {
      setStatus('✗ 저장된 내용 없음')
      return
    }
    setHtml(loaded)
    setStatus(`✓ 불러옴 ${nowHHMMSS()}`)
  }

  const handleReset = () => {
    storage.clear(storageKey)
    setHtml(initialHtml)
    setStatus(`↺ 초기화 ${nowHHMMSS()}`)
  }

  return (
    <div>
      <div className="flex gap-2 items-center mb-4">
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 border border-zinc-300 rounded hover:bg-zinc-50"
        >
          저장
        </button>
        <button
          type="button"
          onClick={handleLoad}
          className="px-3 py-1 border border-zinc-300 rounded hover:bg-zinc-50"
        >
          불러오기
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1 border border-zinc-300 rounded hover:bg-zinc-50"
        >
          초기화
        </button>
        <span className="ml-2 text-sm text-zinc-600" aria-live="polite">
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-2">편집기</h2>
          <RichEditor
            initialHtml={html}
            onChangeHtml={setOnChangeHtml}
            extensions={extensions}
            placeholder={placeholder}
          />
        </section>
        <section>
          <h2 className="text-sm font-medium text-zinc-500 mb-2">onChangeHtml 출력</h2>
          <pre className="bg-zinc-50 border border-zinc-200 rounded p-3 text-xs overflow-auto whitespace-pre-wrap break-all min-h-[120px]">
            {onChangeHtml}
          </pre>
        </section>
      </div>
    </div>
  )
}
