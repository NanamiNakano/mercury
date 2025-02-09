import type { SelectionRequest } from "@/utils/types"
import { Window } from "@/components/ui/window"
import { useTrackedEditorStore } from "@/store/useEditorStore"
import { generateUserColor, getServerColor } from "@/utils/color"
import rangy from "rangy"
import { useCallback, useImperativeHandle, useMemo, useState } from "react"
import Highlight from "./highlight"
import "rangy/lib/rangy-textrange"

interface EditorPanelProps {
  docType: "summary" | "source"
  type: "editing" | "viewing"
  text: string
  pending: boolean
  onSelectionChange: (selection: SelectionRequest | null) => void
  ref: React.RefObject<EditorPanelRef>
}

export interface EditorPanelRef {
  reset: () => void
}

export default function EditorPanel({ docType, type, text, pending, onSelectionChange, ref }: EditorPanelProps) {
  const editorStore = useTrackedEditorStore()
  const [selection, setSelection] = useState<SelectionRequest | null>(null)

  const handleMouseUp = useCallback(() => {
    if (typeof window === "undefined")
      return
    const rangySelection = rangy.getSelection()
    if (!rangySelection || rangySelection.rangeCount <= 0)
      return
    if (type === "viewing")
      return
    const range = rangySelection.getRangeAt(0)

    if (range.toString().trim() === "") {
      return
    }

    const element = document.getElementById(docType) as HTMLElement
    const { start, end } = range.toCharacterRange(element)

    const selection = {
      from_summary: docType === "summary",
      start,
      end,
    }
    setSelection(selection)
    onSelectionChange(selection)

    window.getSelection()?.empty()
  }, [docType, type, onSelectionChange])

  const handleClick = useCallback((start: number, end: number) => {
    if (type === "viewing")
      return
    const selection = {
      from_summary: docType === "summary",
      start,
      end,
    }
    setSelection(selection)
    onSelectionChange(selection)
  }, [docType, type, onSelectionChange])

  const highlights = useMemo(() => {
    if (pending) {
      return []
    }
    if (selection !== null) {
      return [{
        start: selection.start,
        end: selection.end,
        color: "hsl(204.92, 94.2%, 72.94%)",
      }]
    }
    if (editorStore.serverSection.length > 0) {
      return editorStore.serverSection
        .filter(section => section.to_doc === (docType === "source"))
        .map(section => ({
          start: section.offset,
          end: section.offset + section.len,
          color: getServerColor(section.score),
        }))
    }
    if (editorStore.viewing) {
      const start = docType === "summary" ? editorStore.viewing.summary_start : editorStore.viewing.source_start
      const end = docType === "summary" ? editorStore.viewing.summary_end : editorStore.viewing.source_end
      return [{
        start,
        end,
        color: generateUserColor(editorStore.viewing.user_id, editorStore.viewing.record_id),
      }]
    }
    if (Object.keys(editorStore.activeList).length > 0) {
      return Object.entries(editorStore.activeList)
        .filter(([_key, value]) => value)
        .reduce((acc, [key, _value]) => {
          const label = editorStore.history.find(label => label.record_id === Number.parseInt(key))
          if (!label) {
            return acc
          }

          if (docType === "summary") {
            return [...acc, {
              start: label.summary_start,
              end: label.summary_end,
              color: generateUserColor(label.user_id, label.record_id),
            }]
          }

          return [...acc, {
            start: label.source_start,
            end: label.source_end,
            color: generateUserColor(label.user_id, label.record_id),
          }]
        }, [])
    }
    return []
  }, [selection, editorStore.serverSection, docType, editorStore.activeList, editorStore.history, pending, editorStore.viewing])

  useImperativeHandle(ref, () => {
    return {
      reset: () => {
        setSelection(null)
        onSelectionChange(null)
      },
    }
  })

  return (
    <Window name={docType === "summary" ? "Summary" : "Source"}>
      <Highlight text={text} highlights={highlights} onMouseUp={handleMouseUp} id={docType} pending={pending} clickable={type === "editing"} onClick={handleClick} />
    </Window>
  )
}
