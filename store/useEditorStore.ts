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
  setActive: (recordId: number, active: boolean) => void
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
    const activeList = history.reduce((acc, label) => {
      acc[label.record_id] = true
      return acc
    }, {} as Record<number, boolean>)
    set({ history, activeList })
  },

  viewingID: null,
  setViewing: (viewing: LabelData | null) => set(produce((state: EditorState) => {
    state.viewingID = viewing?.record_id ?? null
  })),

  activeList: {},
  setActive: (recordId: number, active: boolean) => set(produce((state: EditorState) => {
    state.activeList[recordId] = active
  })),
}))

export const useTrackedEditorStore = createTrackedSelector(useEditorStore)
