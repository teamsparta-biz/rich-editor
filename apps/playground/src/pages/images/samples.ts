export const SAMPLE_HTML = [
  '<p>아래 샘플은 <strong>images</strong> 확장을 시연합니다. 드래그·붙여넣기·툴바 삽입 3경로 모두 <code>imageUpload</code> 훅을 경유합니다.</p>',
  '<figure>',
  '<img src="https://picsum.photos/id/237/400/250" alt="샘플 이미지 (picsum)" />',
  '<figcaption>샘플 캡션 — figcaption을 직접 편집할 수 있습니다</figcaption>',
  '</figure>',
  '<p>본 페이지는 <strong>더미 훅(FileReader → data URL)</strong>을 주입합니다. 파일이 에디터에 직접 base64로 삽입되므로 용량이 큰 이미지는 성능 저하가 있을 수 있습니다.</p>',
  '<p>실제 소비자(pbl-edu 등)는 Supabase Storage 같은 원격 스토리지 업로드 함수를 주입합니다.</p>',
].join('')
