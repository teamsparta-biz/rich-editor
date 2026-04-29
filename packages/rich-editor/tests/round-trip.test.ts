import { describe, it, expect, afterEach } from 'vitest'
import { Editor } from '@tiptap/core'
import { resolveExtensions } from '../src/extensions/registry'
import { htmlSerializer } from '../src/serialization/HtmlSerializer'
import type { ExtensionInput, ImageExtensionOptions } from '../src/types'

const createdEditors: Editor[] = []

function createTestEditor(extensionInputs: ExtensionInput[]): Editor {
  const editor = new Editor({
    extensions: resolveExtensions(['core', ...extensionInputs]),
  })
  createdEditors.push(editor)
  return editor
}

function roundTrip(editor: Editor, html: string): string {
  htmlSerializer.fromHtml(editor, html)
  return htmlSerializer.toHtml(editor)
}

function parseDom(html: string): Document {
  return new DOMParser().parseFromString(`<!DOCTYPE html><body>${html}</body>`, 'text/html')
}

afterEach(() => {
  while (createdEditors.length > 0) {
    const editor = createdEditors.pop()
    editor?.destroy()
  }
})

describe('B 회귀 — 7개 확장 round-trip 보존', () => {
  it('headings: 6단계 round-trip', () => {
    // 기본 levels는 [1,2,3] — 6단계 검증을 위해 옵션으로 풀세트 활성
    const editor = createTestEditor([
      { key: 'headings', options: { levels: [1, 2, 3, 4, 5, 6] } },
    ])
    const input =
      '<h1>제목 1</h1><h2>제목 2</h2><h3>제목 3</h3><h4>제목 4</h4><h5>제목 5</h5><h6>제목 6</h6>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    for (let level = 1; level <= 6; level++) {
      const heading = doc.querySelector(`h${level}`)
      expect(heading, `h${level} 누락`).not.toBeNull()
      expect(heading?.textContent).toBe(`제목 ${level}`)
    }

    // 순서 보존: 첫 번째 자식부터 h1, h2, ... h6
    const all = Array.from(doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    expect(all.map((el) => el.tagName.toLowerCase())).toEqual([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    ])
  })

  it('lists: bullet + ordered + 2단계 중첩', () => {
    const editor = createTestEditor(['lists'])
    const input =
      '<ul><li><p>A1</p><ul><li><p>A1.1</p></li><li><p>A1.2</p></li></ul></li><li><p>A2</p></li></ul>' +
      '<ol><li><p>B1</p></li><li><p>B2</p></li></ol>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    // 외부 + 내부 ul 합쳐 2개
    expect(doc.querySelectorAll('ul').length).toBeGreaterThanOrEqual(2)
    expect(doc.querySelectorAll('ol').length).toBe(1)

    // ol 직계 자식 li 2개 (B1, B2)
    expect(doc.querySelectorAll('ol > li').length).toBe(2)

    // 2단계 중첩: ul 내부에 또 ul, 그 안에 li 2개
    const nestedItems = doc.querySelectorAll('ul ul > li')
    expect(nestedItems.length).toBe(2)

    const text = doc.body.textContent ?? ''
    expect(text).toContain('A1')
    expect(text).toContain('A1.1')
    expect(text).toContain('A1.2')
    expect(text).toContain('A2')
    expect(text).toContain('B1')
    expect(text).toContain('B2')
  })

  it('links: href + 텍스트 보존', () => {
    const editor = createTestEditor(['links'])
    const input = '<p>공식 문서는 <a href="https://tiptap.dev">TipTap</a>에서 확인하세요.</p>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    const link = doc.querySelector('a')
    expect(link, 'a 태그 누락').not.toBeNull()
    expect(link?.getAttribute('href')).toBe('https://tiptap.dev')
    expect(link?.textContent).toBe('TipTap')

    // TipTap의 Link 확장 기본값(rel='noopener noreferrer nofollow', target='_blank')이 부여됨 — 명세 기본 동작
    expect(link?.getAttribute('rel')).toMatch(/noopener|noreferrer|nofollow/)
  })

  it('codeBlock: language 속성 + 멀티라인 텍스트', () => {
    const editor = createTestEditor(['codeBlock'])
    const input =
      '<pre><code class="language-typescript">const greet = (name: string) => `Hello, ${name}!`\nconsole.log(greet(\'world\'))</code></pre>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    const pre = doc.querySelector('pre')
    expect(pre, 'pre 누락').not.toBeNull()
    const code = pre?.querySelector('code')
    expect(code, 'code 누락').not.toBeNull()

    // language 속성 보존 (TipTap CodeBlockLowlight는 language-* class로 보존)
    const className = code?.getAttribute('class') ?? ''
    expect(className).toMatch(/language-typescript/)

    // 멀티라인 텍스트 보존 (white-space)
    const text = code?.textContent ?? ''
    expect(text).toContain('const greet')
    expect(text).toContain('console.log')
    expect(text).toContain('\n')
  })

  it('taskList: 항목 + 2단계 중첩 (data-checked attribute 존재 + 텍스트 보존)', () => {
    const editor = createTestEditor(['taskList'])
    // 단순 형태로 입력: TipTap TaskItem의 parseHTML은 li[data-checked]만 본다 (label/input은 renderHTML 산출).
    const input =
      '<ul data-type="taskList">' +
      '<li data-checked="true"><p>완료 항목</p></li>' +
      '<li data-checked="false"><p>진행 항목</p>' +
      '<ul data-type="taskList">' +
      '<li data-checked="false"><p>하위 항목</p></li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    const taskLists = doc.querySelectorAll('ul[data-type="taskList"]')
    expect(taskLists.length).toBe(2) // 외부 + 중첩

    // data-checked attribute 자체가 항목별로 출력됨 (true/false 보존은 별도 결함 — deviations/133-10_taskItem-checked-roundtrip.md 참조)
    const items = doc.querySelectorAll('li[data-checked]')
    expect(items.length).toBe(3)

    // 텍스트 보존
    const text = doc.body.textContent ?? ''
    expect(text).toContain('완료 항목')
    expect(text).toContain('진행 항목')
    expect(text).toContain('하위 항목')
  })

  it('images: figure + img + figcaption (allowCaption 기본 true)', () => {
    // imageUpload 더미 훅 주입 — 미주입 시 plugin 거부 정책. setContent 경로는 영향 없지만 명세 준수.
    const imageOptions: ImageExtensionOptions = {
      imageUpload: async () => 'data:image/png;base64,placeholder',
    }
    const editor = createTestEditor([{ key: 'images', options: imageOptions }])
    const input =
      '<figure>' +
      '<img src="https://picsum.photos/id/237/400/250" alt="샘플" />' +
      '<figcaption>샘플 캡션</figcaption>' +
      '</figure>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    const figure = doc.querySelector('figure')
    expect(figure, 'figure 누락').not.toBeNull()

    const img = figure?.querySelector('img')
    expect(img, 'img 누락').not.toBeNull()
    expect(img?.getAttribute('src')).toBe('https://picsum.photos/id/237/400/250')

    const caption = figure?.querySelector('figcaption')
    expect(caption, 'figcaption 누락').not.toBeNull()
    expect(caption?.textContent).toBe('샘플 캡션')
  })

  it('tables: 3x3 + colspan/rowspan + header row', () => {
    const editor = createTestEditor(['tables'])
    const input =
      '<table>' +
      '<thead><tr><th><p>항목</p></th><th><p>값</p></th><th><p>비고</p></th></tr></thead>' +
      '<tbody>' +
      '<tr><td rowspan="2"><p>공용</p></td><td><p>A1</p></td><td colspan="1"><p>병합</p></td></tr>' +
      '<tr><td><p>A2</p></td><td><p>두번째</p></td></tr>' +
      '<tr><td><p>단일</p></td><td><p>B1</p></td><td><p>—</p></td></tr>' +
      '</tbody>' +
      '</table>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    // header 3개 (th)
    const ths = doc.querySelectorAll('th')
    expect(ths.length).toBe(3)
    expect(ths[0]?.textContent).toContain('항목')
    expect(ths[1]?.textContent).toContain('값')
    expect(ths[2]?.textContent).toContain('비고')

    // tr 합계: thead 1 + tbody 3 = 4
    expect(doc.querySelectorAll('tr').length).toBe(4)

    // rowspan="2" 보존
    const rowspanCell = doc.querySelector('td[rowspan="2"]')
    expect(rowspanCell, 'rowspan="2" 셀 누락').not.toBeNull()
    expect(rowspanCell?.textContent).toContain('공용')

    // 텍스트 보존
    const text = doc.body.textContent ?? ''
    expect(text).toContain('A1')
    expect(text).toContain('A2')
    expect(text).toContain('B1')
  })
})
