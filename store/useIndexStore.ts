import { create } from "zustand"
import { createTrackedSelector } from "react-tracked"
import { getAllTasksLength } from "../utils/request"

interface IndexStore {
  index: number
  max: number
  previous: () => void
  next: () => void
  setIndex: (index: number) => void
  setMaxIndex: (max: number) => void
}

export const useIndexStore = create<IndexStore>()((set) => ({
  index: 0,
  max: 0,
  previous: () => set((state) => ({ index: state.index - 1})),
  next: () => set((state) => ({ index: state.index + 1})),
  setIndex: (index: number) => set({ index }),
  setMaxIndex: (max: number) => set({ max })
}))

export const useTrackedIndexStore = createTrackedSelector(useIndexStore)
