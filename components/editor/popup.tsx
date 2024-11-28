// A new interface for changing the history of the labels.
"use client"

import {
  Body1,
  Card, CardHeader,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Text,
  makeStyles, DialogActions, Button, shorthands, Textarea
} from "@fluentui/react-components";
import DragSelect from "../dragSelect";
import { useTrackedTaskStore } from "../../store/useTaskStore";
import { useTrackedPopupStore } from "../../store/usePopupStore";
import CustomOption from "../customOption";
import type { LabelData } from "../../utils/types";
import { useTrackedIndexStore } from "../../store/useIndexStore";

type PopupEditorProps = {
  onEditedDone: (changed: boolean, labelData?: LabelData) => Promise<void>,
  open: boolean,
  labels: (string|object)[]
}

const useStyles = makeStyles({
  card: {
    backgroundColor: "#f0f0f0",
    boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
    ...shorthands.padding("1rem", "1rem"),
    ...shorthands.flex(1)
  }
})

const PopupEditor = (props: PopupEditorProps) => {
  const popUpStore = useTrackedPopupStore()
  const taskStore = useTrackedTaskStore()
  const styles = useStyles()
  const indexStore = useTrackedIndexStore()

  return (
    <Dialog open={props.open} >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Editing</DialogTitle>
          <DialogContent>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
              }}
            >
              <Card className={styles.card}>
                <CardHeader
                  header={
                    <Body1>
                      <strong>Source</strong>
                    </Body1>
                  }
                />
                {
                  popUpStore.editingID && (popUpStore.sourceSelectionRange[1] > 0 ? (
                    <DragSelect
                      idPrefix={"popup-edit-source"}
                      text={taskStore.current.doc}
                      range={popUpStore.sourceSelectionRange}
                      onRangeChange={(range) => {
                        popUpStore.setSourceSelectionRange(range)
                      }}
                    />
                  ) : (
                    <Text as="p">
                      {taskStore.current.doc}
                    </Text>
                  ))
                }
              </Card>

              <Card className={styles.card}>
                <CardHeader
                  header={
                    <Body1>
                      <strong>Summary</strong>
                    </Body1>
                  }
                />
                {
                  popUpStore.editingID && (popUpStore.summarySelectionRange[1] > 0 ? (
                    <DragSelect
                      idPrefix={"popup-edit-summary"}
                      text={taskStore.current.sum}
                      range={popUpStore.summarySelectionRange}
                      onRangeChange={(range) => {
                        popUpStore.setSummarySelectionRange(range)
                      }}
                    />
                  ) : (
                    <Text as="p">
                      {taskStore.current.sum}
                    </Text>
                  ))
                }
              </Card>
            </div>
          </DialogContent>
          <DialogActions>
            <CustomOption
              labels={props.labels}
              syncLabels={(labels) => {
                popUpStore.setConsistent(Object.keys(labels).filter((label) => labels[label]))
              }}
              initialLabels={popUpStore.consistent}
              style={{
                width: "100%"
              }}
            />
            <Textarea
              resize="both"
              style={{
                width: "30vw",
              }}
              placeholder="Add an optional note"
              value={popUpStore.note}
              onChange={(_, data) => popUpStore.setNote(data.value)}
            />
            <Button
              onClick={async () => {
                await props.onEditedDone(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await props.onEditedDone(true, {
                  record_id: popUpStore.editingID,
                  sample_id: indexStore.index.toString(),
                  summary_start: popUpStore.summarySelectionRange[0],
                  summary_end: popUpStore.summarySelectionRange[1],
                  source_start: popUpStore.sourceSelectionRange[0],
                  source_end: popUpStore.sourceSelectionRange[1],
                  consistent: popUpStore.consistent,
                  task_index: indexStore.index,
                  user_id: "",
                  note: popUpStore.note
                })
              }}
              appearance="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default PopupEditor;
