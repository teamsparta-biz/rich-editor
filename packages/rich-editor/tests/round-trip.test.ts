import { describe, it, expect, afterEach } from 'vitest'
import { Editor } from '@tiptap/core'
import { resolveExtensions } from '../src/extensions/registry'
import { htmlSerializer } from '../src/serialization/HtmlSerializer'
import type {
  ExtensionInput,
  ImageExtensionOptions,
  MarksExtensionOptions,
} from '../src/types'

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

describe('B 회귀 — 9개 확장 round-trip 보존', () => {
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

  it('taskList: 항목 + 2단계 중첩 (data-checked 값 ON/OFF round-trip 보존 + 텍스트)', () => {
    const editor = createTestEditor(['taskList'])
    // 저장 HTML 형태(data-type 없이 data-checked만)로 입력 — RoundTripTaskItem이 li[data-checked]를 매칭해 checked 보존.
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

    // data-checked 값 round-trip 보존: ON 1개(완료) + OFF 2개(진행·하위 중첩). 133-10 fix로 ON 보존 복원.
    const items = Array.from(doc.querySelectorAll('li[data-checked]'))
    expect(items.length).toBe(3)
    const checkedOn = items.filter((li) => li.getAttribute('data-checked') === 'true')
    expect(checkedOn.length, 'ON 상태(data-checked=true) round-trip 손실').toBe(1)
    expect(checkedOn[0]?.textContent).toContain('완료 항목')
    expect(items.filter((li) => li.getAttribute('data-checked') === 'false').length).toBe(2)

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

  it('marks: 6종 HTML 보존 (default 활성)', () => {
    const editor = createTestEditor(['marks'])
    const input =
      '<p><strong>볼드</strong> <em>이탤릭</em> <s>스트라이크</s> ' +
      '<code>코드</code> <u>밑줄</u> <mark>형광</mark></p>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    expect(doc.querySelector('strong'), '<strong> 누락').not.toBeNull()
    expect(doc.querySelector('em'), '<em> 누락').not.toBeNull()
    expect(doc.querySelector('s'), '<s> 누락').not.toBeNull()
    expect(doc.querySelector('code'), '<code> 누락').not.toBeNull()
    expect(doc.querySelector('u'), '<u> 누락').not.toBeNull()
    expect(doc.querySelector('mark'), '<mark> 누락').not.toBeNull()

    const text = doc.body.textContent ?? ''
    expect(text).toContain('볼드')
    expect(text).toContain('이탤릭')
    expect(text).toContain('스트라이크')
    expect(text).toContain('코드')
    expect(text).toContain('밑줄')
    expect(text).toContain('형광')
  })

  it('marks: 옵션으로 일부 비활성 시 미허용 마크는 스트립 (텍스트는 보존)', () => {
    const marksOptions: MarksExtensionOptions = { code: false, highlight: false }
    const editor = createTestEditor([{ key: 'marks', options: marksOptions }])
    const input =
      '<p><strong>볼드</strong> <em>이탤릭</em> <s>스트라이크</s> ' +
      '<code>코드</code> <u>밑줄</u> <mark>형광</mark></p>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    // 활성 4종은 보존
    expect(doc.querySelector('strong'), '<strong> 누락').not.toBeNull()
    expect(doc.querySelector('em'), '<em> 누락').not.toBeNull()
    expect(doc.querySelector('s'), '<s> 누락').not.toBeNull()
    expect(doc.querySelector('u'), '<u> 누락').not.toBeNull()

    // 비활성 2종은 스트립
    expect(doc.querySelector('code'), '<code>가 스트립되지 않음').toBeNull()
    expect(doc.querySelector('mark'), '<mark>가 스트립되지 않음').toBeNull()

    // 텍스트는 모두 보존
    const text = doc.body.textContent ?? ''
    expect(text).toContain('코드')
    expect(text).toContain('형광')
  })

  it('comment: data-comment-id 앵커 + commentId round-trip 보존', () => {
    const editor = createTestEditor(['comment'])
    const input =
      '<p>이 문장에 <span data-comment-id="c-abc-123">코멘트 단 부분</span>이 있다.</p>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    const span = doc.querySelector('span[data-comment-id]')
    expect(span, 'comment 앵커 span 누락').not.toBeNull()
    expect(span?.getAttribute('data-comment-id')).toBe('c-abc-123')
    expect(span?.textContent).toBe('코멘트 단 부분')

    // 본문 텍스트 보존
    expect(doc.body.textContent ?? '').toContain('이 문장에')
  })

  it('blockquote: 인용문 블록 + 내부 단락 텍스트 round-trip 보존', () => {
    const editor = createTestEditor(['blockquote'])
    const input = '<blockquote><p>인용된 문장입니다.</p></blockquote>'
    const output = roundTrip(editor, input)
    const doc = parseDom(output)

    const quote = doc.querySelector('blockquote')
    expect(quote, 'blockquote 노드 누락').not.toBeNull()
    expect(quote?.textContent).toContain('인용된 문장입니다.')
  })

  it('blockquote: toggleBlockquote 명령으로 인용문 토글', () => {
    // `> ` 입력룰은 TipTap Blockquote 내장(실제 타이핑 시 발화)이라 jsdom 프로그램
    // 삽입으로는 검증 불가 — 결정적인 toggleBlockquote 명령으로 노드 동작을 확인한다.
    const editor = createTestEditor(['blockquote'])
    editor.commands.setContent('<p>문장</p>')
    editor.commands.selectAll()
    editor.chain().focus().toggleBlockquote().run()
    expect(editor.isActive('blockquote'), 'toggleBlockquote 후 blockquote 미활성').toBe(true)
  })
})

describe('JSON I/O — getJSON/setContent round-trip (charter 본문 저장 경로)', () => {
  it('comment 마크 포함 JSON round-trip 보존 (commentId 박제)', () => {
    const editor = createTestEditor(['marks', 'comment'])
    // HTML로 본문 주입 → JSON 추출 → 그 JSON으로 다시 setContent → JSON 재추출이 동일 구조
    htmlSerializer.fromHtml(
      editor,
      '<p>이 문장에 <span data-comment-id="c-json-1">앵커</span> 포함.</p>',
    )
    const json1 = editor.getJSON()
    editor.commands.setContent(json1, false)
    const json2 = editor.getJSON()
    expect(json2).toEqual(json1)
    // comment 마크 commentId가 JSON 내부에 무손실 보존 (HTML 변환 없이 박제)
    const serialized = JSON.stringify(json2)
    expect(serialized).toContain('c-json-1')
    expect(serialized).toContain('comment')
  })

  it('headings/lists 구조 JSON round-trip 보존', () => {
    const editor = createTestEditor(['headings', 'lists'])
    htmlSerializer.fromHtml(editor, '<h1>제목</h1><ul><li><p>항목</p></li></ul>')
    const json1 = editor.getJSON()
    editor.commands.setContent(json1, false)
    expect(editor.getJSON()).toEqual(json1)
    expect(editor.getText()).toContain('제목')
    expect(editor.getText()).toContain('항목')
  })
})
