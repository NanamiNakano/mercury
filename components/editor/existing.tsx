// The panel to display annotations already made on a sample

"use client"

import {
  Body1,
  Button,
  Card,
  CardHeader, Checkbox, CheckboxProps, makeStyles, tokens,
} from "@fluentui/react-components"
import { ArrowSyncRegular, EditRegular, EyeRegular } from "@fluentui/react-icons"
import { useTrackedTaskStore } from "../../store/useTaskStore"
import { isSafeNumber, LabelData } from "../../utils/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTrackedIndexStore } from "../../store/useIndexStore"
import { HasError, Loading } from "./fallback"
import _ from "lodash"
import { useTrackedEditorStore } from "../../store/useEditorStore"
import { useTrackedPopupStore } from "../../store/usePopupStore"
import TagGroups from "../tagGroups"
import { useTrackedUserStore } from "../../store/useUserStore"
import Chat from "./chat"

const useStyles = makeStyles({
  propsTable: {
    "& td:first-child": {
      fontWeight: tokens.fontWeightSemibold,
      paddingRight: "1rem",
    },
  },
})

export default function ExistingPane() {
  const editorStore = useTrackedEditorStore()
  const indexStore = useTrackedIndexStore()
  const taskStore = useTrackedTaskStore()
  const popUpStore = useTrackedPopupStore()
  const userStore = useTrackedUserStore()

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [viewYour, setViewYour] = useState<CheckboxProps["checked"]>(true)
  const [viewOthers, setViewOthers] = useState<CheckboxProps["checked"]>(true)
  const classes = useStyles()

  const debounceSetIsLoading = _.debounce(setIsLoading, 500)

  const onRefreshHistory = useCallback(async () => {
    setHasError(false)
    debounceSetIsLoading(true)
    try {
      await editorStore.updateHistory(indexStore.index)
    } catch (e) {
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

  const viewing = useMemo(() => {
    const data: LabelData[] = []

    if (viewYour) {
      data.push(...editorStore.history.filter((record) => record.user_id === userStore.user.id))
    }
    if (viewOthers) {
      data.push(...editorStore.history.filter((record) => record.user_id !== userStore.user.id))
    }

    data.sort((a, b) => {
      let c = a.source_start - b.source_start
      if (c === 0) c = a.summary_start - b.summary_start
      return c
    })

    return data
  }, [editorStore.history, viewYour, viewOthers])

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
                <div>
                  <Body1>
                    <strong>Existing annotations</strong>
                  </Body1>
                  <Button icon={<ArrowSyncRegular />} style={{ marginLeft: "1em" }}
                          onClick={onRefreshHistory}>
                    Refresh
                  </Button>
                  <Checkbox
                      checked={viewYour}
                      onChange={(_, data) => setViewYour(data.checked)}
                      label="Yours"
                  />
                  <Checkbox
                      checked={viewOthers}
                      onChange={(_, data) => setViewOthers(data.checked)}
                      label="Others"
                  />
                </div>
              }
          />
          {isLoading && <Loading />}
          {hasError && <HasError />}
          {!isLoading && !hasError && taskStore.current && (
              viewing.map((record, index) => (
                  <>
                    <div role="tabpanel" className={classes.propsTable} key={record.record_id}>
                      <table>
                        <tbody>
                        {(isSafeNumber(record.source_end) && isSafeNumber(record.source_start)) && (
                            <tr>
                              <td>Source</td>
                              <td>
                                {`${taskStore.current.doc.slice(record.source_start, record.source_end)}`}
                              </td>
                            </tr>
                        )}
                        {(isSafeNumber(record.summary_start) && isSafeNumber(record.summary_end)) && (
                            <tr>
                              <td>Summary</td>
                              <td>
                                {`${taskStore.current.sum.slice(record.summary_start, record.summary_end)}`}
                              </td>
                            </tr>
                        )}
                        <tr>
                          <td>Labels</td>
                          <td>
                            <TagGroups tags={record.consistent} />
                          </td>
                        </tr>
                        <tr>
                          <td>Annotator</td>
                          <td>
                            { record.username }
                          </td>
                        </tr>
                        {record.note && (
                            <tr>
                              <td>Note</td>
                              <td>{record.note}</td>
                            </tr>
                        )}
                        </tbody>
                      </table>
                      <div style={{
                        display: "flex",
                        gap: "1rem",
                      }}>
                        <Button
                            icon={<EyeRegular />}
                            onClick={() => {
                              editorStore.setViewing(record)
                            }}
                        >
                          Show
                        </Button>
                        <Button
                            icon={<EditRegular />}
                            onClick={() => {
                              popUpStore.setLabelData(record)
                            }}
                        >
                          Edit
                        </Button>
                        <Chat id={parseInt(record.record_id)} />
                      </div>
                    </div>
                    {index !== viewing.length - 1 && <div style={{
                      borderBottom: "1px solid #e0e0e0",
                    }} />}
                  </>
              ))
          )}
        </Card>
      </div>
  )
}
