"use client"

import { exportLabel } from "../../utils/request"
import { Button } from "@fluentui/react-components"
import { ArrowExportRegular, HandRightRegular, ShareRegular } from "@fluentui/react-icons"
import UserPopover from "../userPopover"
import { useTrackedIndexStore } from "../../store/useIndexStore"
import { useTrackedEditorStore } from "../../store/useEditorStore"
import { useCallback } from "react"

export default function Controls() {
  const indexStore = useTrackedIndexStore()
  const editorStore = useTrackedEditorStore()

  const onReset = useCallback(() => {
    editorStore.clearAllSelection()
    editorStore.setViewing(null)
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

  const onShare = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?sample=${indexStore.index}`
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url)
    }
    else {
      const textArea = document.createElement("textarea")
      textArea.value = url
      textArea.style.position = "absolute"
      textArea.style.left = "-999999px"

      document.body.prepend(textArea)
      textArea.select()

      try {
        document.execCommand("copy")
      }
      catch (error) {
        console.error(error)
      }
      finally {
        textArea.remove()
      }
    }
  }, [indexStore.index])

  return (
      <div
          style={{
            display: "flex",
            gap: "1em",
          }}
      >
        <Button icon={<HandRightRegular />} onClick={onReset} appearance={
          editorStore.sourceSelection.start !== -1 || editorStore.summarySelection.start !== -1
              ? "primary"
              : null
        }>
          Reset selection/highlight
        </Button>
        <Button icon={<ArrowExportRegular />} onClick={onExportJSON}>
          Export labels
        </Button>
        <Button icon={<ShareRegular />} onClick={onShare}>
          Share this sample
        </Button>
        <UserPopover />
      </div>
  )
}
