"use client"

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
  type TableColumnDefinition,
  createTableColumn,
  useTableFeatures,
  useTableColumnSizing_unstable,
  type TableColumnSizingOptions, MenuItem, Menu, MenuTrigger, MenuPopover, MenuList,
} from "@fluentui/react-components"
import { ArrowSyncRegular, DeleteRegular, EditRegular, EyeOffRegular, EyeRegular } from "@fluentui/react-icons"
import { deleteRecord } from "../../utils/request"
import { useTrackedTaskStore } from "../../store/useTaskStore"
import type { LabelData } from "../../utils/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTrackedIndexStore } from "../../store/useIndexStore"
import { HasError, Loading } from "./fallback"
import _ from "lodash"
import { useTrackedEditorStore } from "../../store/useEditorStore"
import { useTrackedPopupStore } from "../../store/usePopupStore";

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
  onRestore?: () => void,
}

const emptyRestore = () => {}

export default function ExistingPane({ onRestore = emptyRestore }: Props) {
  const editorStore = useTrackedEditorStore()
  const indexStore = useTrackedIndexStore()
  const taskStore = useTrackedTaskStore()
  const popUpStore = useTrackedPopupStore()

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const debounceSetIsLoading = _.debounce(setIsLoading, 500)

  const onRefreshHistory = useCallback(async () => {
    setHasError(false)
    debounceSetIsLoading(true)
    try {
      await editorStore.updateHistory(indexStore.index)
    }
    catch (e) {
      setHasError(true)
    }
    debounceSetIsLoading(false)
  }, [indexStore.index])

  useEffect(() => {
    let ignore = false

    if (!ignore) {
      onRefreshHistory()
    }

    return () => {
      ignore = true
    }
  }, [indexStore.index])

  const sortedHistory = useMemo(() => {
    return editorStore.history
        .toSorted((a, b) => {
          let c = a.source_start - b.source_start
          if (c === 0) c = a.summary_start - b.summary_start
          return c
        })
  }, [editorStore.history])

  const [columns] = useState<TableColumnDefinition<LabelData>[]>(columnsDef)
  const [columnSizingOptions] = useState<TableColumnSizingOptions>({
    source: {
      idealWidth: 300,
    },
    summary: {
      idealWidth: 300,
    },
    consistent: {
      idealWidth: 100,
    },
    note: {
      idealWidth: 150,
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
                          onClick={onRefreshHistory}>
                    Refresh
                  </Button>
                </Body1>
              }
          />
          {isLoading && <Loading />}
          {hasError && <HasError />}
          {!isLoading && !hasError && taskStore.current && (
              // @ts-ignore
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
                        <TableCell
                          {...columnSizing_unstable.getTableCellProps("action")}
                        >
                          <Menu>
                            <MenuTrigger disableButtonEnhancement>
                              <Button>Actions</Button>
                            </MenuTrigger>
                            <MenuPopover>
                              <MenuList>
                                {editorStore.viewingID != null && editorStore.viewingID === item.record_id ? (
                                  <MenuItem
                                    icon={<EyeOffRegular />}
                                    onClick={() => {
                                      editorStore.setViewing(null)
                                      onRestore()
                                    }}>
                                    Restore
                                  </MenuItem>
                                ) : (
                                  <MenuItem
                                    icon={<EyeRegular />}
                                    onClick={() => {
                                      editorStore.setViewing(item)
                                    }}
                                  >
                                    Show
                                  </MenuItem>
                                )}
                                <MenuItem
                                  icon={<DeleteRegular />}
                                  onClick={async () => {
                                    await deleteRecord(item.record_id)
                                    if (editorStore.viewingID != null && editorStore.viewingID === item.record_id) {
                                      onRestore()
                                    }
                                    await onRefreshHistory()
                                  }}
                                >
                                  Delete
                                </MenuItem>
                                <MenuItem
                                  icon={<EditRegular />}
                                  onClick={() => {
                                    popUpStore.setLabelData(item)
                                  }}
                                >
                                  Edit
                                </MenuItem>
                              </MenuList>
                            </MenuPopover>
                          </Menu>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
        </Card>
      </div>
  )
}
