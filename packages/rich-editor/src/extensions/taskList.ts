import type { Extension, Mark, Node } from '@tiptap/core'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import type { TaskListExtensionOptions } from '../types'

export function taskListExtensionFactory(
  options?: TaskListExtensionOptions,
): (Extension | Node | Mark)[] {
  const nestedTasks = options?.nestedTasks ?? true

  return [
    TaskList,
    TaskItem.configure({ nested: nestedTasks }),
  ]
}
