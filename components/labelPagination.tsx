"use client"

import { Button, Field, ProgressBar } from "@fluentui/react-components"
import { ChevronLeftRegular, IosChevronRightRegular } from "@fluentui/react-icons"
import { useTrackedIndexStore } from "../store/useIndexStore"
import { useCallback } from "react"
import { useTrackedEditorStore } from "../store/useEditorStore"

type Props = {
  beforeChangeIndex?: Function,
}

export default function LabelPagination({ beforeChangeIndex = Function() }: Props) {
  const indexStore = useTrackedIndexStore()
  const editorStore = useTrackedEditorStore()

  const onReset = useCallback(() => {
    editorStore.clearAllSelection()
    editorStore.setViewing(null)
  }, [])

  return (
      <div
          style={{
            marginTop: "1em",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1em",
          }}
      >
        <Button
            disabled={indexStore.index === 0}
            appearance="primary"
            icon={<ChevronLeftRegular />}
            iconPosition="before"
            onClick={() => {
              beforeChangeIndex()
              onReset()
              indexStore.previous()
            }}
        >
          Previous
        </Button>
        <Field style={{ flexGrow: 1 }} validationMessage={`${indexStore.index + 1} / ${indexStore.max + 1}`}
               validationState="none">
          <ProgressBar value={indexStore.index + 1} max={indexStore.max + 1} thickness="large" />
        </Field>
        <Button
            disabled={indexStore.index === indexStore.max}
            appearance="primary"
            icon={<IosChevronRightRegular />}
            iconPosition="after"
            onClick={() => {
              beforeChangeIndex()
              onReset()
              indexStore.next()
            }}
        >
          Next
        </Button>
      </div>
  )
}
