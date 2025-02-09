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
  setHistory: (history: LabelData[]) => void
  fetchHistory: (accessToken: string, taskIndex: number) => Promise<void>

  viewingID: number | null
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
  setHistory: (history: LabelData[]) => set({ history }),
  fetchHistory: async (accessToken: string, taskIndex: number) => {
    const history = await getTaskHistory(accessToken, taskIndex)
    set({ history })
  },

  viewingID: null,
  setViewing: (viewing: LabelData | null) => set(produce((state: EditorState) => {
    state.viewingID = viewing?.record_id ?? null
  })),

  activeList: {},
  setActiveList: (activeList: Record<number, boolean>) => set({ activeList }),
}))

export const useTrackedEditorStore = createTrackedSelector(useEditorStore)
