import { EditorPanel } from '../../widgets/editor-panel'
import { SAMPLE_HTML } from './samples'

export function TablesPage() {
  return (
    <EditorPanel
      initialHtml={SAMPLE_HTML}
      storageKey="rich-editor-playground-tables"
      extensions={['tables']}
      placeholder="표를 삽입하거나 기존 표를 편집해보세요"
    />
  )
}
