"use client"

import { useTrackedEditorStore } from "../../store/useEditorStore"
import { useTrackedTaskStore } from "../../store/useTaskStore"
import { useCallback, useEffect, useState } from "react"
import { Allotment } from "allotment"
import "allotment/dist/style.css"
import { Body1, Card, CardHeader, Text } from "@fluentui/react-components"
import ExistingPane from "./existing"
import { useTrackedIndexStore } from "../../store/useIndexStore"
import { useTrackedHistoryStore } from "../../store/useHistoryStore"
import { HasError, Loading } from "./fallback"
import _ from "lodash"
import { labelText } from "../../utils/request"
import Tooltip from "../tooltip"
import { useTrackedLabelsStore } from "../../store/useLabelsStore"
import rangy from "rangy"
import "rangy/lib/rangy-textrange"

export default function Editor() {
  const editorStore = useTrackedEditorStore()
  const taskStore = useTrackedTaskStore()
  const indexStore = useTrackedIndexStore()
  const historyStore = useTrackedHistoryStore()
  const labelsStore = useTrackedLabelsStore()

  const [suspendSource, setSuspendSource] = useState(false)
  const [suspendSummary, setSuspendSummary] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const debounceSetIsLoading = _.debounce(setIsLoading, 500)

  const handleMouseUp = useCallback((element: HTMLElement) => {
    const selection = rangy.getSelection()
    if (!selection || selection.rangeCount <= 0) return
    const range = selection.getRangeAt(0)

    if (range.toString().trim() == "") {
      if (element.id == "source") {
        editorStore.clearSourceSelection()
      }
      else if (element.id == "summary") {
        editorStore.clearSummarySelection()
      }
      return
    }

    const { start, end } = range.toCharacterRange(element)

    if (element.id == "source") {
      editorStore.setSourceSelection(start, end)
    }
    else if (element.id == "summary") {
      editorStore.setSummarySelection(start, end)
    }
  }, [])

  const onRestoreViewingHistory = useCallback(() => {
    editorStore.clearAllSelection()
    historyStore.setViewingRecord(null)
  }, [])

  const onFetchTask = useCallback(async () => {
    setHasError(false)
    debounceSetIsLoading(true)
    try {
      await taskStore.fetch(indexStore.index)
    }
    catch (e) {
      setHasError(true)
    }
    debounceSetIsLoading(false)
  }, [indexStore.index])

  useEffect(() => {
    let ignore = false

    if (!ignore) {
      onFetchTask()
    }

    return () => {
      ignore = true
    }
  }, [indexStore.index])

  function renderHighlight(target: "source" | "summary") {
    const selection = target === "source" ? editorStore.sourceSelection : editorStore.summarySelection
    const text = target === "source" ? taskStore.current.doc : taskStore.current.sum
    if (selection.start === -1) return text

    const segments = []
    if (selection.start > 0) segments.push(text.slice(0, selection.start))
    segments.push(
        <Tooltip
            start={selection.start}
            end={selection.end}
            key={`slice-${selection.start}-${selection.end}`}
            backgroundColor={editorStore.initiator === target ? "#79c5fb" : "#85e834"}
            textColor="black"
            text={text.slice(selection.start, selection.end)}
            score={editorStore.initiator === target ? null : 2}
            labels={labelsStore.labels}
            onLabel={async (label, note) => {
              await labelText(indexStore.index, {
                source_start: editorStore.sourceSelection.start,
                source_end: editorStore.sourceSelection.end,
                summary_start: editorStore.summarySelection.start,
                summary_end: editorStore.summarySelection.end,
                consistent: label,
                note: note,
              }, editorStore.initiator === target ? target : null)
              historyStore.updateHistory(indexStore.index).then(() => {
                editorStore.clearAllSelection()
              })
            }}
            message="Check all types that apply below."
        />,
    )
    if (selection.end < text.length) segments.push(text.slice(selection.end))
    return segments
  }

  return (
      <div
          style={{
            height: "80vh",
            margin: "auto",
          }}
      >
        {isLoading && <Loading />}
        {hasError && <HasError />}
        {!isLoading && !hasError && taskStore.current &&
          <Allotment>
            <Allotment.Pane>
              <div
                style={{
                  overflowY: "scroll",
                  height: "100%",
                }}
              >
                <Card
                  style={{
                    userSelect: suspendSource ? "none" : "auto",
                    color: suspendSource ? "gray" : "black",
                  }}
                >
                  <CardHeader
                    header={
                      <Body1>
                        <strong>Source</strong>
                      </Body1>
                    }
                  />
                  {(
                      suspendSource ?
                          <Text
                              id="source"
                              as="p">
                            {taskStore.current.doc}
                          </Text>
                          :
                          <Text
                              id="source"
                              as="p"
                              style={{
                                whiteSpace: "pre-wrap",
                              }}
                              onMouseUp={event => {
                                handleMouseUp(event.target as HTMLSpanElement)
                              }}
                          >
                            {renderHighlight("source")}
                          </Text>
                  )}
                </Card>
              </div>
            </Allotment.Pane>
            <Allotment.Pane>
              <Allotment vertical>
                <div
                  style={{
                    overflowY: "scroll",
                    height: "100%",
                  }}
                >
                  <Card
                    style={{
                      userSelect: suspendSummary ? "none" : "auto",
                      color: suspendSummary ? "gray" : "black",
                    }}
                  >
                    <CardHeader
                      header={
                        <Body1>
                          <strong>Summary</strong>
                        </Body1>
                      }
                    />
                    {
                      suspendSummary ?
                          <Text
                              id="summary"
                              as="p">
                            {taskStore.current.sum}
                          </Text>
                          :
                          <Text
                              id="summary"
                              as="p"
                              style={{
                                whiteSpace: "pre-wrap",
                              }}
                              onMouseUp={event => {
                                handleMouseUp(event.target as HTMLSpanElement)
                              }}
                          >
                            {renderHighlight("summary")}
                          </Text>
                    }
                  </Card>
                </div>
                <ExistingPane onRestore={onRestoreViewingHistory} />
              </Allotment>
            </Allotment.Pane>
          </Allotment>
        }
      </div>
  )
}
