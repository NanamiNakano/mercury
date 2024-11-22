"use client"

import { exportLabel } from "../../utils/request"
import { Button } from "@fluentui/react-components"
import { ArrowExportRegular, HandRightRegular, ShareRegular } from "@fluentui/react-icons"
import UserPopover from "../userPopover"
import { useTrackedIndexStore } from "../../store/useIndexStore"
import { useTrackedEditorStore } from "../../store/useEditorStore"
import { useCallback } from "react"
import { useTrackedHistoryStore } from "../../store/useHistoryStore"

export default function Controls() {
  const indexStore = useTrackedIndexStore()
  const editorStore = useTrackedEditorStore()
  const historyStore = useTrackedHistoryStore()

  const onReset = useCallback(() => {
    editorStore.clearAllSelection()
    historyStore.setViewingRecord(null)
  }, [])

  const onExportJSON = useCallback(async () => {
    try {
      const data = await exportLabel()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const downloadLink = document.createElement("a")
      const downloadUrl = URL.createObjectURL(blob)
      downloadLink.href = downloadUrl
      downloadLink.download = "label.json"
      downloadLink.click()
      URL.revokeObjectURL(downloadUrl)
    }
    catch (error) {
      console.error("Failed to export JSON:", error)
    }
  }, [])

  return (
      <div
          style={{
            display: "flex",
            gap: "1em",
          }}
      >
        <Button icon={<HandRightRegular />} onClick={onReset} appearance={
          editorStore.sourceSelection.start != -1 || editorStore.summarySelection.start != -1
              ? "primary"
              : null
        }>
          De-select/highlight
        </Button>
        <Button icon={<ArrowExportRegular />} onClick={onExportJSON}>
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
      </div>
  )
}