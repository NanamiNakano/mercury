import {
  Body1,
  Button,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableColumnDefinition,
  createTableColumn,
  useTableFeatures,
  useTableColumnSizing_unstable,
  TableColumnSizingOptions, MenuItem, Menu, MenuTrigger, MenuPopover, MenuList, TableCellLayout,
} from "@fluentui/react-components"
import { ArrowSyncRegular, DeleteRegular, EyeOffRegular, EyeRegular } from "@fluentui/react-icons"
import ColumnResize from "react-table-column-resizer"
import { deleteRecord } from "../../utils/request"
import { useTrackedHistoryStore } from "../../store/useHistoryStore"
import { useTrackedTaskStore } from "../../store/useTaskStore"
import { LabelData } from "../../utils/types"
import { useMemo, useState } from "react"

const columnsDef: TableColumnDefinition<LabelData>[] = [
  createTableColumn({
    columnId: "source",
    renderHeaderCell: () => <>Source</>,
  }),
  createTableColumn({
    columnId: "summary",
    renderHeaderCell: () => <>Summary</>,
  }),
  createTableColumn({
    columnId: "consistent",
    renderHeaderCell: () => <>Label(s)</>,
  }),
  createTableColumn({
    columnId: "note",
    renderHeaderCell: () => <>Note</>,
  }),
  createTableColumn({
    columnId: "actions",
    renderHeaderCell: () => <>Actions</>,
  }),
]

type Props = {
  onRefresh?: Function,
}

export default function ExistingPane({ onRefresh = Function() }: Props) {
  const historyStore = useTrackedHistoryStore()
  const taskStore = useTrackedTaskStore()

  const sortedHistory = useMemo(() => {
    return historyStore.history
        .sort((a, b) => {
          let c = a.source_start - b.source_start
          if (c === 0) c = a.summary_start - b.summary_start
          return c
        })
  }, [historyStore.history])

  const [columns] = useState<TableColumnDefinition<LabelData>[]>(columnsDef)
  const [columnSizingOptions] = useState<TableColumnSizingOptions>({
    source: {
      idealWidth: 300,
      minWidth: 150,
    },
    summary: {
      idealWidth: 300,
      minWidth: 150,
    },
    consistent: {
      idealWidth: 150,
      minWidth: 100,
    },
    note: {
      idealWidth: 300,
      minWidth: 150,
    },
    actions: {
      idealWidth: 120,
    },
  })

  const { getRows, columnSizing_unstable, tableRef } = useTableFeatures(
      {
        columns,
        items: sortedHistory,
      },
      [useTableColumnSizing_unstable({ columnSizingOptions })],
  )
  const rows = getRows()

  return (
      <div
          style={{
            overflowY: "scroll",
            height: "100%",
          }}
      >
        <Card>
          <CardHeader
              header={
                <Body1>
                  <strong>Existing annotations</strong>
                  <Button icon={<ArrowSyncRegular />} style={{ marginLeft: "1em" }}
                          onClick={() => {
                            onRefresh()
                          }}>
                    Refresh
                  </Button>
                </Body1>
              }
          />
          {/*@ts-ignore*/}
          <Table
              sortable
              ref={tableRef}
              {...columnSizing_unstable.getTableProps()}
          >
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                    <Menu openOnContext key={column.columnId}>
                      <MenuTrigger>
                        <TableHeaderCell
                            key={column.columnId}
                            {...columnSizing_unstable.getTableHeaderCellProps(
                                column.columnId,
                            )}
                        >
                          {column.renderHeaderCell()}
                        </TableHeaderCell>
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem
                              onClick={columnSizing_unstable.enableKeyboardMode(
                                  column.columnId,
                              )}
                          >
                            Keyboard Column Resizing
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ item }) => (
                  <TableRow key={item.record_id}>
                    <TableCell
                        {...columnSizing_unstable.getTableCellProps("source")}
                    >
                      {taskStore.current.doc.slice(item.source_start, item.source_end)}
                    </TableCell>
                    <TableCell
                        {...columnSizing_unstable.getTableCellProps("summary")}
                    >
                      {taskStore.current.sum.slice(item.summary_start, item.summary_end)}
                    </TableCell>
                    <TableCell
                        {...columnSizing_unstable.getTableCellProps("consistent")}
                    >
                      {item.consistent.join(", ")}
                    </TableCell>
                    <TableCell
                        {...columnSizing_unstable.getTableCellProps("note")}
                    >
                      {item.note}
                    </TableCell>
                    <TableCell>
                          {historyStore.viewingRecord != null && historyStore.viewingRecord.record_id === item.record_id ? (
                              <Button icon={<EyeOffRegular />} appearance="primary"
                                      onClick={() => {
                                        historyStore.setViewingRecord(null)
                                        onRefresh()
                                      }}>
                                Restore
                              </Button>
                          ) : (
                              <Button
                                  icon={<EyeRegular />}
                                  onClick={() => {
                                    historyStore.setViewingRecord(item)
                                  }}
                              >
                                Show
                              </Button>
                          )}
                          <Button
                              icon={<DeleteRegular />}
                              onClick={async () => {
                                await deleteRecord(item.record_id)
                                onRefresh()
                              }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
  )
}