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

export default function Editor() {
  const editorStore = useTrackedEditorStore()
  const taskStore = useTrackedTaskStore()
  const indexStore = useTrackedIndexStore()
  const historyStore = useTrackedHistoryStore()

  const [suspendSource, setSuspendSource] = useState(false)
  const [suspendSummary, setSuspendSummary] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const debounceSetIsLoading = _.debounce(setIsLoading, 500)

  const handleMouseUp = useCallback((element: HTMLSpanElement) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount <= 0) return
    if (!selection.containsNode(element, true)) return

    const range = selection.getRangeAt(0)
    // if (!element.contains(range.commonAncestorContainer)) return
    if (element.id == "source") {
      editorStore.setSourceSelection(range.startOffset, range.endOffset)
    }
    else if (element.id == "summary") {
      editorStore.setSummarySelection(range.startOffset, range.endOffset)
    }
  }, [])

  const onRestoreViewingHistory = useCallback(() => {
    editorStore.clearSelection()
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
                              onMouseUp={event => {
                                handleMouseUp(event.target as HTMLSpanElement)
                              }}
                          >
                            {taskStore.current.doc}
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
                              onMouseUp={event => {
                                handleMouseUp(event.target as HTMLSpanElement)
                              }}
                          >
                            {taskStore.current.sum}
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
