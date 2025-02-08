import type { LabelData, SectionResponse } from "../utils/types"
import { produce } from "immer"
import { createTrackedSelector } from "react-tracked"
import { create } from "zustand"

interface EditorState {
  initiator: "source" | "summary" | null
  serverSection: SectionResponse
  clearAllSelection: () => void

  history: LabelData[]
  viewingID: number | null
  setHistory: (history: LabelData[]) => void
  setViewing: (viewingRecord: LabelData) => void

  activeList: Record<number, boolean>
  setActiveList: (activeList: Record<number, boolean>) => void
}

export const useEditorStore = create<EditorState>()(set => ({
  initiator: null,
  serverSection: [],
  clearAllSelection: () => set(produce((state: EditorState) => {
    state.serverSection = []
    state.initiator = null
    window.getSelection()?.removeAllRanges()
  })),

  history: [],
  viewingID: null,
  setHistory: (history: LabelData[]) => set({ history }),
  setViewing: (viewing: LabelData | null) => set(produce((state: EditorState) => {
    state.viewingID = viewing?.record_id ?? null
  })),
  activeList: {},
  setActiveList: (activeList: Record<number, boolean>) => set({ activeList }),
}))

export const useTrackedEditorStore = createTrackedSelector(useEditorStore)
