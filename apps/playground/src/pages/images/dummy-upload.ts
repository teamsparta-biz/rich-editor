/**
 * 더미 imageUpload 훅 — 실제 스토리지 업로드 없이 data URL을 반환한다.
 * playground 회귀 검증용. 실제 소비자는 Supabase Storage·S3 등 자체 구현을 주입.
 */
export async function dummyImageUpload(file: File): Promise<string> {
  console.log('[playground] dummy upload', {
    name: file.name,
    size: file.size,
    type: file.type,
  })

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('FileReader returned non-string result'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}
