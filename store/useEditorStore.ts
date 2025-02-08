import type { LabelData, SectionResponse } from "../utils/types"
import { produce } from "immer"
import { createTrackedSelector } from "react-tracked"
import { create } from "zustand"
import { getTaskHistory } from "../utils/request"

interface EditorState {
  initiator: "source" | "summary" | null
  serverSection: SectionResponse
  clearAllSelection: () => void

  history: LabelData[]
  viewingID: number | null
  updateHistory: (labelIndex: number) => Promise<void>
  setHistory: (history: LabelData[]) => void
  setViewing: (viewingRecord: LabelData) => void

  activeList: Record<number, boolean>
  setActiveList: (activeList: Record<number, boolean>) => void
}

export const useEditorStore = create<EditorState>()(set => ({
  initiator: null,
  serverSection: [],
  editable: true,
  clearAllSelection: () => set(produce((state: EditorState) => {
    state.serverSection = []
    state.initiator = null
    window.getSelection()?.removeAllRanges()
  })),

  history: [],
  viewingID: null,
  updateHistory: async (labelIndex: number) => {
    try {
      const history = await getTaskHistory(labelIndex)
      set({ history })
    } catch (e) {
      set({ history: [] })
      console.warn(e)
      throw e
    }
  },
  setHistory: (history: LabelData[]) => set({ history }),
  setViewing: (viewing: LabelData | null) => set(produce((state: EditorState) => {
    state.viewingID = viewing?.record_id ?? null
  })),
  activeList: {},
  setActiveList: (activeList: Record<number, boolean>) => set({ activeList }),
}))

export const useTrackedEditorStore = createTrackedSelector(useEditorStore)
