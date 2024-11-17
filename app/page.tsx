"use client"

import {
  Body1,
  Button,
  Card,
  CardHeader,
  Text,
  Title1, Toast, Toaster, ToastTitle, useId, useToastController,
} from "@fluentui/react-components"
import _ from "lodash"
import { useEffect, useLayoutEffect, useState } from "react"
import Tooltip from "../components/tooltip"
import { updateSliceArray } from "../utils/mergeArray"
import getRangeTextHandleableRange from "../utils/rangeTextNodes"
import {
  exportLabel,
  labelText,
  selectText,
  getAllLabels,
  checkUserMe, getAllTasksLength,
} from "../utils/request"
import { type SectionResponse, userSectionResponse } from "../utils/types"
import {
  ArrowExportRegular,
  HandRightRegular,
  ShareRegular,
} from "@fluentui/react-icons"
import { Allotment } from "allotment"
import "allotment/dist/style.css"
import "./page.css"
import UserPopover from "../components/userPopover"
import LabelPagination from "../components/labelPagination"
import { useTrackedIndexStore } from "../store/useIndexStore"
import ExistingPane from "../components/editor/existing"
import { useTrackedHistoryStore } from "../store/useHistoryStore"
import { useTrackedTaskStore } from "../store/useTaskStore"
import { useTrackedUserStore } from "../store/useUserStore"
import { useRouter, useSearchParams } from "next/navigation"
import { useTrackedLabelsStore } from "../store/useLabelsStore"

enum Stage {
  None = 0,
  First = 1,
}

const DISABLE_QUERY = false

const normalizationColor = (score: number[]) => {
  if (score.length === 0) return []
  if (score.length === 1) return [1]
  const minScore = Math.min(...score)
  const maxScore = Math.max(...score)
  const normalScores = []
  for (const single of score) {
    normalScores.push((single - minScore) / (maxScore - minScore))
  }
  return normalScores
}

const colors = [
  "#c4ebff",
  "#a8e1ff",
  "#70cdff",
  "#38baff",
  "#1cb0ff",
  "#00a6ff",
]
const getColor = (score: number) => {
  return colors[Math.floor(score * (colors.length - 1))]
}


// Function to determine if a color is light or dark
const isLightColor = (color: string) => {
  // Remove the hash if present
  let newColor = color.replace("#", "")

  // Convert 3-digit hex to 6-digit hex
  if (newColor.length === 3) {
    newColor = newColor.split("").map(char => char + char).join("")
  }

  // Convert hex to RGB
  const r = Number.parseInt(newColor.substring(0, 2), 16)
  const g = Number.parseInt(newColor.substring(2, 4), 16)
  const b = Number.parseInt(newColor.substring(4, 6), 16)

  // Calculate luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

  // Return true if luminance is greater than 128 (light color)
  return luminance > 200
}

const exportJSON = () => {
  exportLabel().then(data => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "label.json"
    a.click()
    URL.revokeObjectURL(url)
  })
}

export default function Index() {
  const indexStore = useTrackedIndexStore()
  const [prevIndex, setPrevIndex] = useState(indexStore.index)
  const historyStore = useTrackedHistoryStore()
  const [prevViewingRecord, setPrevViewingRecord] = useState(historyStore.viewingRecord)
  const taskStore = useTrackedTaskStore()
  const userStore = useTrackedUserStore()
  const labelsStore = useTrackedLabelsStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [firstRange, setFirstRange] = useState<[number, number] | null>(null)
  const [rangeId, setRangeId] = useState<string | null>(null)
  const [serverSelection, setServerSelection] = useState<SectionResponse | null>(null)
  const [userSelection, setUserSelection] = useState<[number, number] | null>(null)
  const [waiting, setWaiting] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>(Stage.None)

  const toasterId = useId("toaster")
  const { dispatchToast } = useToastController(toasterId)

  function washHand() {
    setFirstRange(null)
    setRangeId(null)
    setWaiting(null)
    setServerSelection(null)
    setStage(Stage.None)
    setUserSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  indexStore.fetchMax()
  labelsStore.fetch()

  if (searchParams.has("sample")) {
    const index = searchParams.get("sample")
    const indexNumber = Number.parseInt(index)
    if (!Number.isNaN(indexNumber) && indexNumber >= 0 && indexNumber <= indexStore.max && indexNumber !== prevIndex) {
      setPrevIndex(indexNumber)
      washHand()
      indexStore.setIndex(indexNumber)
    }
  }

  taskStore.fetch(indexStore.index)

  useEffect(() => {
    const access_token = localStorage.getItem("access_token")
    if (access_token == "" || access_token == null) {
      dispatchToast(
          <Toast>
            <ToastTitle>Not logged in</ToastTitle>
          </Toast>,
          { intent: "error" },
      )
      router.push("/login")
      return
    }
    checkUserMe(access_token).then(valid => {
      if (!valid) {
        localStorage.removeItem("access_token")
        dispatchToast(
            <Toast>
              <ToastTitle>Session expired</ToastTitle>
            </Toast>,
            { intent: "error" },
        )
        router.push("/login")
      }
      return
    })
    userStore.fetch()
  }, [])

  useEffect(() => {
    historyStore.updateHistory(indexStore.index)
  }, [taskStore.current])

  if (historyStore.viewingRecord !== prevViewingRecord) {
    setPrevViewingRecord(historyStore.viewingRecord)
    if (historyStore.viewingRecord === null || taskStore.current === null) {
      washHand()
      return
    }
    setFirstRange([historyStore.viewingRecord.source_start, historyStore.viewingRecord.source_end])
    setRangeId("doc")
    setServerSelection([userSectionResponse(historyStore.viewingRecord.summary_start, historyStore.viewingRecord.summary_end, true)])
  }

  useLayoutEffect(() => {
    const func = (event) => {
      const selection = window.getSelection()
      const target = event.target as HTMLElement

      const mercuryElements = document.querySelectorAll("[data-mercury-disable-selection]")

      // console.log(mercuryElements)

      for (const element of mercuryElements) {
        if (element.contains(target)) {
          return
        }
      }

      if (target.id.startsWith("label-")) {
        return
      }

      if (
          !selection.containsNode(document.getElementById("summary"), true) &&
          !selection.containsNode(document.getElementById("doc"), true)
      ) {
        if (userSelection !== null) {
          setUserSelection(null)
        }
        else {
          washHand()
        }
        return
      }

      if (selection.toString().trim() === "") {
        if (target.tagName === "SPAN") {
          const span = target as HTMLSpanElement
          if (span.parentElement?.id === "summary" || span.parentElement?.id === "doc") {
            return
          }
        }
        else if (target.tagName === "P") {
          const p = target as HTMLParagraphElement
          if (p.id === "summary" || p.id === "doc") {
            return
          }
        }
        else {
          if (userSelection !== null) {
            setUserSelection(null)
          }
          else {
            washHand()
          }
          return
        }
      }
    }
    document.body.addEventListener("mouseup", func)
    return () => {
      document.body.removeEventListener("mouseup", func)
    }
  }, [userSelection])

  useEffect(() => {
    if (firstRange === null || rangeId === null) {
      setServerSelection(null)
      return
    }
    _.debounce(() => {
      if (DISABLE_QUERY || historyStore.viewingRecord != null) return
      setWaiting(rangeId === "summary" ? "doc" : "summary")
      selectText(indexStore.index, {
        start: firstRange[0],
        end: firstRange[1],
        from_summary: rangeId === "summary",
      })
          .then(response => {
            setWaiting(null)
            if ("error" in response) {
              console.error(response.error)
              return
            }
            if (firstRange === null || rangeId === null) {
              setServerSelection(null)
              return
            }
            setServerSelection(response as SectionResponse)
          })
          .catch(error => {
            console.error(error)
          })
    }, 100)()
  }, [firstRange, rangeId, indexStore.index])

  const JustSliceText = (props: { text: string; startAndEndOffset: [number, number] }) => {
    const fakeResponse = userSectionResponse(
        props.startAndEndOffset[0],
        props.startAndEndOffset[1],
        rangeId === "summary",
    )
    const sliceArray = updateSliceArray(props.text, [fakeResponse])
    return sliceArray.map(slice => {
      return slice[3] === 2 ? (
          <Tooltip
              start={slice[0]}
              end={slice[1]}
              key={`slice-${slice[0]}-${slice[1]}`}
              backgroundColor="#79c5fb"
              textColor="black"
              text={props.text.slice(slice[0], slice[1] + 1)}
              labels={labelsStore.labels}
              onLabel={async (label, note) => {
                if (firstRange === null || rangeId === null) {
                  return Promise.resolve()
                }
                await labelText(indexStore.index, {
                  source_start: rangeId === "summary" ? -1 : firstRange[0],
                  source_end: rangeId === "summary" ? -1 + 1 : firstRange[1],
                  summary_start: rangeId === "summary" ? firstRange[0] : -1,
                  summary_end: rangeId === "summary" ? firstRange[1] : -1,
                  consistent: label,
                  note: note,
                })
                historyStore.updateHistory(indexStore.index).then(() => {
                })
              }}
              message="Check all types that apply below."
          />
      ) : (
          <Text
              as="span"
              key={`slice-${slice[0]}-${slice[1]}`}
              data-mercury-label-start={slice[0]}
              data-mercury-label-end={slice[1]}
          >
            {props.text.slice(slice[0], slice[1] + 1)}
          </Text>
      )
    })
  }

  const SliceText = (props: { text: string; slices: SectionResponse; user: [number, number] | null }) => {
    const newSlices =
        props.user === null
            ? props.slices
            : [userSectionResponse(props.user[0], props.user[1], rangeId === "summary")]
    const sliceArray = updateSliceArray(props.text, newSlices)
    const allScore = []
    for (const slice of newSlices) {
      allScore.push(slice.score)
    }
    const normalColor = normalizationColor(allScore)
    return (
        <>
          {sliceArray.map(slice => {
            const isBackendSlice = slice[2]
            const score = slice[3]
            const bg_color = isBackendSlice ? score === 2 ? "#85e834" : getColor(normalColor[slice[4]]) : "#ffffff"
            const textColor = isLightColor(bg_color) ? "black" : "white"
            // const textColor= 'red'
            return isBackendSlice && historyStore.viewingRecord == null ? (
                <Tooltip
                    start={slice[0]}
                    end={slice[1]}
                    key={`slice-${slice[0]}-${slice[1]}`}
                    backgroundColor={bg_color}
                    textColor={textColor}
                    text={props.text.slice(slice[0], slice[1] + 1)}
                    score={score}
                    labels={labelsStore.labels}
                    onLabel={async (label, note) => {
                      if (firstRange === null || rangeId === null) {
                        return Promise.resolve()
                      }
                      await labelText(indexStore.index, {
                        source_start: rangeId === "summary" ? slice[0] : firstRange[0],
                        source_end: rangeId === "summary" ? slice[1] + 1 : firstRange[1],
                        summary_start: rangeId === "summary" ? firstRange[0] : slice[0],
                        summary_end: rangeId === "summary" ? firstRange[1] : slice[1] + 1,
                        consistent: label,
                        note: note,
                      })
                      historyStore.updateHistory(indexStore.index).then(() => {
                      })
                    }}
                    message="Select the type(s) of hallucinatin below."
                />
            ) : (
                <Text
                    as="span"
                    style={{ backgroundColor: bg_color }}
                    key={`slice-${slice[0]}-${slice[1]}`}
                    data-mercury-label-start={slice[0]}
                    data-mercury-label-end={slice[1]}
                >
                  {props.text.slice(slice[0], slice[1] + 1)}
                </Text>
            )
          })}
        </>
    )
  }

  const checkSelection = (element: HTMLSpanElement) => {
    const selection = window.getSelection()
    if (selection === null || selection === undefined) return
    if (!selection.containsNode(element, true)) return
    if (selection.toString().trim() === "" && JSON.stringify(firstRange) !== "[-1,-1]") return
    const range = selection.getRangeAt(0)
    switch (stage) {
      case Stage.None: {
        if (
            range.intersectsNode(element) &&
            range.startContainer === range.endContainer &&
            range.startContainer === element.firstChild &&
            range.startOffset !== range.endOffset
        ) {
          setFirstRange([range.startOffset, range.endOffset])
          setUserSelection(null)
          setRangeId(element.id)
        }
        if (selection.containsNode(element, false)) {
          setFirstRange([range.startOffset, element.firstChild?.textContent?.length])
          setUserSelection(null)
          setRangeId(element.id)
        }
        setStage(Stage.First)
        break
      }
      case Stage.First: {
        if (element.id === rangeId || element.parentElement?.id === rangeId) {
          setFirstRange(getRangeTextHandleableRange(range))
          setUserSelection(null)
        }
        else {
          setUserSelection(getRangeTextHandleableRange(range))
        }
        break
      }
    }
  }

  return (
      <>
        <Toaster toasterId={toasterId} />
        <Title1>Mercury Label</Title1>
        <br />
        <br />
        <div
            style={{
              display: "flex",
              gap: "1em",
            }}
        >
          {JSON.stringify(firstRange) === "[-1,-1]" || historyStore.viewingRecord != null ? (
              <Button appearance="primary" icon={<HandRightRegular />} onClick={washHand}>
                De-select/highlight
              </Button>
          ) : (
              <Button icon={<HandRightRegular />} onClick={washHand}>
                De-select/highlight
              </Button>
          )}
          <Button icon={<ArrowExportRegular />} onClick={exportJSON}>
            Export Labels
          </Button>
          <Button icon={<ShareRegular />} onClick={async () => {
            await navigator.clipboard.writeText(
                `${window.location.origin}${window.location.pathname}?sample=${indexStore.index}`,
            )
          }}>
            Share Link
          </Button>
          <UserPopover />


          {/* <Link href="/history/" rel="noopener noreferrer" target="_blank">
          <Button icon={<HistoryRegular />}></Button>
        </Link> */}
          {/* <Button
          icon={<AddRegular />}
          onClick={() => {
            washHand()
            setFirstRange([-1, -1])
            setUserSelection(null)
            setRangeId("doc")
          }}
          disabled={JSON.stringify(firstRange) === "[-1,-1]" && rangeId === "doc"}
        >
          Select Empty Source
        </Button>
        <Button
          icon={<AddRegular />}
          onClick={() => {
            washHand()
            setFirstRange([-1, -1])
            setUserSelection(null)
            setRangeId("summary")
          }}
          disabled={JSON.stringify(firstRange) === "[-1,-1]" && rangeId === "summary"}
        >
          Select Empty Summary
        </Button> */}
        </div>
        <br />
        <LabelPagination beforeChangeIndex={washHand} />
        <br />
        {taskStore.current === null ? (
            <p>Loading...</p>
        ) : (
            <div
                style={{
                  height: "80vh",
                  margin: "auto",
                }}
            >
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
                          userSelect: waiting === "doc" ? "none" : "auto",
                          color: waiting === "doc" ? "gray" : "black",
                        }}
                    >
                      <CardHeader
                          header={
                            <Body1>
                              <strong>Source</strong>
                            </Body1>
                          }
                      />
                      <Text
                          id="doc"
                          as="p"
                          data-mercury-label-start={0}
                          data-mercury-label-end={taskStore.current.doc.length}
                          onMouseUp={event => {
                            checkSelection(event.target as HTMLSpanElement)
                          }}
                      >
                        {serverSelection !== null && serverSelection.length > 0 && rangeId === "summary" ? (
                            <SliceText text={taskStore.current.doc} slices={serverSelection} user={userSelection} />
                        ) : rangeId === "doc" ? (
                            <JustSliceText text={taskStore.current.doc} startAndEndOffset={firstRange} />
                        ) : (
                            taskStore.current.doc
                        )}
                      </Text>
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
                            userSelect: waiting === "summary" ? "none" : "auto",
                            color: waiting === "summary" ? "gray" : "black",
                          }}
                      >
                        <CardHeader
                            header={
                              <Body1>
                                <strong>Summary</strong>
                              </Body1>
                            }
                        />
                        <Text
                            id="summary"
                            as="p"
                            data-mercury-label-start={0}
                            data-mercury-label-end={taskStore.current.sum.length}
                            onMouseUp={event => checkSelection(event.target as HTMLSpanElement)}
                        >
                          {serverSelection !== null && rangeId === "doc" ? (
                              <SliceText text={taskStore.current.sum} slices={serverSelection} user={userSelection} />
                          ) : rangeId === "summary" ? (
                              <JustSliceText text={taskStore.current.sum} startAndEndOffset={firstRange} />
                          ) : (
                              taskStore.current.sum
                          )}
                        </Text>
                      </Card>
                    </div>
                    <ExistingPane onRefresh={washHand} />
                  </Allotment>
                </Allotment.Pane>
              </Allotment>
            </div>
        )}
      </>
  )
}
