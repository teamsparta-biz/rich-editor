import { EditorPanel } from '../../widgets/editor-panel'
import { SAMPLE_HTML } from './samples'

export function CodePage() {
  return (
    <EditorPanel
      initialHtml={SAMPLE_HTML}
      storageKey="rich-editor-playground-code"
      extensions={['codeBlock', 'taskList']}
      placeholder="코드블록과 태스크리스트를 시험해보세요"
    />
  )
}
