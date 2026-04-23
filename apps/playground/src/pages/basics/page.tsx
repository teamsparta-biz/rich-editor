import { EditorPanel } from '../../widgets/editor-panel'
import { SAMPLE_HTML } from './samples'

export function BasicsPage() {
  return (
    <EditorPanel
      initialHtml={SAMPLE_HTML}
      storageKey="rich-editor-playground-basics"
      placeholder="내용을 입력하세요"
    />
  )
}
