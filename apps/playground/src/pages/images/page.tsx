import { EditorPanel } from '../../widgets/editor-panel'
import { SAMPLE_HTML } from './samples'
import { dummyImageUpload } from './dummy-upload'

export function ImagesPage() {
  return (
    <div>
      <p className="text-sm text-zinc-600 mb-4">
        더미 훅: <code>FileReader.readAsDataURL(file)</code>로 data URL 반환.
        파일을 드래그하거나 이미지를 복사 후 붙여넣기해보세요.
      </p>
      <EditorPanel
        initialHtml={SAMPLE_HTML}
        storageKey="rich-editor-playground-images"
        extensions={[
          {
            key: 'images',
            options: { imageUpload: dummyImageUpload, allowCaption: true },
          },
        ]}
        placeholder="이미지를 드래그·붙여넣기·툴바로 삽입해보세요"
      />
    </div>
  )
}
