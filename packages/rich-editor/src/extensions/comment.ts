import { Mark, mergeAttributes } from '@tiptap/core'
import type { Extension, Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { CommentExtensionOptions } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /** 현재 선택 범위에 commentId 앵커를 부여한다. */
      setComment: (commentId: string) => ReturnType
      /** 현재 선택 범위의 comment 앵커를 제거한다. */
      unsetComment: () => ReturnType
    }
  }
}

/**
 * 활성 코멘트 데코 갱신 트리거용 plugin key.
 * activeCommentId는 외부(React) 상태라 doc 변경이 없으므로, Editor가 이 key로
 * 빈 meta transaction을 dispatch해 decorations 재계산을 유도한다.
 */
export const commentPluginKey = new PluginKey('rte-comment')

/**
 * comment 인라인 앵커 마크 (책임 경계 decision 2026-05-29 준수).
 *
 * 에디터 책임: ① commentId 부여/해제 Mark ② `<span data-comment-id>` round-trip
 * ③ 앵커링(ProseMirror position mapping 자동) ④ 클릭 콜백(onCommentClick)
 * ⑤ activeCommentId 강조(decoration). 본체 데이터·UI·권한은 소비자(charter) 책임.
 *
 * 서식(marks 번들)이 아닌 협업 앵커이므로 별도 확장 키로 분리한다(marks 0.x 동결 정책 보호).
 * commentId는 소비자(FE)가 발급하며 외부 코멘트 레코드(inline_comments.id)와 1:1 매핑한다.
 */
const CommentMark = Mark.create<CommentExtensionOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentClick: undefined,
      getActiveCommentId: undefined,
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes) =>
          attributes.commentId ? { 'data-comment-id': attributes.commentId as string } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ class: 'rte-comment' }, this.options.HTMLAttributes ?? {}, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setComment:
        (commentId: string) =>
        ({ commands }) =>
          commands.setMark(this.name, { commentId }),
      unsetComment:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },

  addProseMirrorPlugins() {
    const markType = this.type
    const options = this.options

    return [
      new Plugin({
        key: commentPluginKey,
        props: {
          // ④ 클릭 감지 — 클릭 위치의 comment 마크 commentId를 콜백으로 노출
          handleClickOn: (view, pos) => {
            const onClick = options.onCommentClick
            if (!onClick) return false
            const mark = view.state.doc.resolve(pos).marks().find((m) => m.type === markType)
            const commentId = mark?.attrs.commentId as string | undefined
            if (commentId) {
              onClick(commentId)
              return true
            }
            return false
          },
          // ⑤ 활성 코멘트 강조 — activeCommentId와 일치하는 마크 범위에 inline 데코
          decorations: (state) => {
            const activeId = options.getActiveCommentId?.()
            if (!activeId) return DecorationSet.empty
            const decorations: Decoration[] = []
            state.doc.descendants((node, pos) => {
              if (!node.isText) return
              const hasActive = node.marks.some(
                (m) => m.type === markType && m.attrs.commentId === activeId,
              )
              if (hasActive) {
                decorations.push(
                  Decoration.inline(pos, pos + node.nodeSize, { class: 'rte-comment-active' }),
                )
              }
            })
            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})

export function commentExtensionFactory(
  options?: CommentExtensionOptions,
): (Extension | Node | Mark)[] {
  return [CommentMark.configure(options ?? {})]
}
