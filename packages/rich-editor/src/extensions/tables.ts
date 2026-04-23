import type { Extension, Mark, Node } from '@tiptap/core'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import type { TablesExtensionOptions } from '../types'

/**
 * tables factory — Table·TableRow·TableHeader·TableCell 4종 세트.
 *
 * - resizable 내부 고정 false (옵션 미노출)
 * - allowMerge=false면 mergeCells·splitCell 명령을 no-op으로 override
 * - defaultRows/defaultCols는 insertTable 기본값 주입 (Table 확장의 options.HTMLAttributes와 독립)
 */
export function tablesExtensionFactory(
  options?: TablesExtensionOptions,
): (Extension | Node | Mark)[] {
  const allowMerge = options?.allowMerge ?? true
  const defaultRows = options?.defaultRows ?? 3
  const defaultCols = options?.defaultCols ?? 3

  const TableConfigured = Table.extend({
    addCommands() {
      const parent = this.parent?.() ?? {}
      return {
        ...parent,
        // insertTable이 기본 rows/cols로 호출되도록 래핑 (옵션 객체 미지정 시)
        insertTable:
          (opts = {}) =>
          (cmdCtx) => {
            const merged = {
              rows: opts.rows ?? defaultRows,
              cols: opts.cols ?? defaultCols,
              withHeaderRow: opts.withHeaderRow ?? true,
            }
            const parentInsertTable = parent.insertTable
            if (!parentInsertTable) return false
            return parentInsertTable(merged)(cmdCtx)
          },
        ...(allowMerge
          ? {}
          : {
              mergeCells: () => () => false,
              splitCell: () => () => false,
              mergeOrSplit: () => () => false,
            }),
      }
    },
  }).configure({
    resizable: false,
    HTMLAttributes: { class: 'rte-table' },
  })

  return [TableConfigured, TableRow, TableHeader, TableCell]
}
