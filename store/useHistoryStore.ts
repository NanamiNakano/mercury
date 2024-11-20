import type { LabelData } from "../utils/types"
import { create } from "zustand"
import { getTaskHistory } from "../utils/request"
import { createTrackedSelector } from "react-tracked"

interface HistoryState {
  history: LabelData[],
  viewingRecord: LabelData | null,
  setHistory: (history: LabelData[]) => void,
  setViewingRecord: (viewingRecord: LabelData) => void,
  updateHistory: (labelIndex: number) => Promise<void>,
}

export const useHistoryStore = create<HistoryState>()((set) => ({
  history: [],
  viewingRecord: null,
  setHistory: (history: LabelData[]) => set({ history }),
  setViewingRecord: (viewingRecord: LabelData) => set({ viewingRecord }),
  updateHistory: async (labelIndex: number) => {
    try {
      const history = await getTaskHistory(labelIndex)
      set({ history, viewingRecord: null })
    } catch (e) {
      set({ history: [], viewingRecord: null })
      console.log(e)
      throw e
    }
  },
}))

export const useTrackedHistoryStore = createTrackedSelector(useHistoryStore)