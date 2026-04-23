import { EditorPanel } from '../../widgets/editor-panel'
import { SAMPLE_HTML } from './samples'

export function TextPage() {
  return (
    <EditorPanel
      initialHtml={SAMPLE_HTML}
      storageKey="rich-editor-playground-text"
      extensions={['headings', 'lists', 'links']}
      placeholder="헤딩·리스트·링크를 시험해보세요"
    />
  )
}
