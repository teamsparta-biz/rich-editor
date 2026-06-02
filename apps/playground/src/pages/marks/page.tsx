import { useMemo, useState } from 'react'
import type { ExtensionInput, MarksExtensionOptions } from '@teamsparta/rich-editor'
import { EditorPanel } from '../../widgets/editor-panel'
import { SAMPLE_HTML } from './samples'

type MarkKey = 'bold' | 'italic' | 'strike' | 'code' | 'underline' | 'highlight'

const MARK_LABELS: Record<MarkKey, string> = {
  bold: 'Bold (Ctrl+B / **)',
  italic: 'Italic (Ctrl+I / *)',
  strike: 'Strike (Ctrl+Shift+S / ~~)',
  code: 'inline Code (Ctrl+E / `)',
  underline: 'Underline (Ctrl+U)',
  highlight: 'Highlight (Ctrl+Shift+H)',
}

const DEFAULT_HIGHLIGHT_COLOR = '#fef08a'

export function MarksPage() {
  const [toggles, setToggles] = useState<Record<MarkKey, boolean>>({
    bold: true,
    italic: true,
    strike: true,
    code: true,
    underline: true,
    highlight: true,
  })
  const [highlightColor, setHighlightColor] = useState<string>(DEFAULT_HIGHLIGHT_COLOR)

  const extensions: ExtensionInput[] = useMemo(() => {
    const options: MarksExtensionOptions = { ...toggles, highlightColor }
    return [{ key: 'marks', options }]
  }, [toggles, highlightColor])

  // 토글·색상 변경 시 EditorPanel 의 RichEditor 를 재마운트하기 위한 key
  const editorKey = useMemo(
    () =>
      [
        toggles.bold ? '1' : '0',
        toggles.italic ? '1' : '0',
        toggles.strike ? '1' : '0',
        toggles.code ? '1' : '0',
        toggles.underline ? '1' : '0',
        toggles.highlight ? '1' : '0',
        highlightColor,
      ].join('-'),
    [toggles, highlightColor],
  )

  const handleToggle = (key: MarkKey) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      <section className="mb-4 p-3 border border-zinc-200 rounded bg-zinc-50">
        <h2 className="text-sm font-medium text-zinc-700 mb-2">마크 토글</h2>
        <div className="flex flex-wrap gap-3 items-center">
          {(Object.keys(MARK_LABELS) as MarkKey[]).map((key) => (
            <label key={key} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={toggles[key]}
                onChange={() => handleToggle(key)}
              />
              {MARK_LABELS[key]}
            </label>
          ))}
          <label className="text-sm flex items-center gap-2 ml-4">
            highlightColor
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              className="w-10 h-7 border border-zinc-300 rounded"
              aria-label="highlight color"
            />
            <code className="text-xs">{highlightColor}</code>
            <button
              type="button"
              className="text-xs px-2 py-0.5 border border-zinc-300 rounded hover:bg-zinc-100"
              onClick={() => setHighlightColor(DEFAULT_HIGHLIGHT_COLOR)}
            >
              기본값
            </button>
          </label>
        </div>
      </section>

      <EditorPanel
        key={editorKey}
        initialHtml={SAMPLE_HTML}
        storageKey="rich-editor-playground-marks"
        extensions={extensions}
        placeholder="단축키와 마크다운 입력 단축어를 시험해보세요"
      />
    </div>
  )
}
