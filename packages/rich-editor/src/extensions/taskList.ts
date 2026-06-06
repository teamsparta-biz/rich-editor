import type { Extension, Mark, Node } from '@tiptap/core'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import type { TaskListExtensionOptions } from '../types'

// TipTap TaskItem 기본 parseHTML은 `li[data-type="taskItem"]`만 매칭한다. data-type 없이
// data-checked 속성만 있는 저장 HTML을 setContent로 불러오면 해당 li가 taskItem으로 인식되지
// 않아 checked 속성 parseHTML이 실행되지 않고 false로 떨어진다 → 체크 ON 상태 round-trip 손실.
// `li[data-checked]` 매칭 규칙을 추가해 data-type 유무와 무관하게 checked 값을 보존한다.
// (checked 속성의 parseHTML/renderHTML 기본 동작은 상속 — 노드 매칭 규칙만 확장)
const RoundTripTaskItem = TaskItem.extend({
  parseHTML() {
    return [
      { tag: `li[data-type="${this.name}"]` },
      { tag: 'li[data-checked]' },
    ]
  },
})

export function taskListExtensionFactory(
  options?: TaskListExtensionOptions,
): (Extension | Node | Mark)[] {
  const nestedTasks = options?.nestedTasks ?? true

  return [
    TaskList,
    RoundTripTaskItem.configure({ nested: nestedTasks }),
  ]
}
