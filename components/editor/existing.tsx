import {
  Body1,
  Button,
  Card,
  CardHeader,
  Table, TableBody, TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components"
import { ArrowSyncRegular, DeleteRegular, EyeOffRegular, EyeRegular } from "@fluentui/react-icons"
import ColumnResize from "react-table-column-resizer"
import { deleteRecord } from "../../utils/request"
import { useTrackedHistoryStore } from "../../store/useHistoryStore"
import { useTrackedTaskStore } from "../../store/useTaskStore"

type Props = {
  onRefresh?: Function,
}

export default function ExistingPane({ onRefresh = () => {} }: Props) {
  const historyStore = useTrackedHistoryStore()
  const taskStore = useTrackedTaskStore()

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
          <Table className="column_resize_table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell key="source">Source</TableHeaderCell>
                {/* @ts-ignore */}
                <ColumnResize id={1} className="columnResizer" />
                <TableHeaderCell key="summary">Summary</TableHeaderCell>
                {/* @ts-ignore */}
                <ColumnResize id={2} className="columnResizer" />
                <TableHeaderCell key="consistent">Label(s)</TableHeaderCell>
                {/* @ts-ignore */}
                <ColumnResize id={3} className="columnResizer" />
                <TableHeaderCell key="note">Note</TableHeaderCell>
                {/* @ts-ignore */}
                <ColumnResize id={4} className="columnResizer" />
                {/* TODO: Display the resizer. Now they are invisible. */}
                <TableHeaderCell key="actions">Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyStore.history
                  .sort((a, b) => {
                    let c = a.source_start - b.source_start
                    if (c === 0) c = a.summary_start - b.summary_start
                    return c
                  })
                  .map((record, _) => (
                      <TableRow key={record.record_id}>
                        <TableCell>{taskStore.current.doc.slice(record.source_start, record.source_end)}</TableCell>
                        <TableCell className="column_resizer_body" />
                        <TableCell>{taskStore.current.sum.slice(record.summary_start, record.summary_end)}</TableCell>
                        <TableCell className="column_resizer_body" />
                        <TableCell>{record.consistent.join(", ")}</TableCell>
                        <TableCell className="column_resizer_body" />
                        <TableCell>{record.note}</TableCell>
                        <TableCell className="column_resizer_body" />
                        <TableCell>
                          {historyStore.viewingRecord != null && historyStore.viewingRecord.record_id === record.record_id ? (
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
                                    historyStore.setViewingRecord(record)
                                  }}
                              >
                                Show
                              </Button>
                          )}
                          <Button
                              icon={<DeleteRegular />}
                              onClick={async () => {
                                await deleteRecord(record.record_id)
                                onRefresh()
                              }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                        <TableCell className="column_resizer_body" />
                      </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Card>
      </div>
  )
}