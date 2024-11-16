import { create } from "zustand"
import { createTrackedSelector } from "react-tracked"
import { getAllTasksLength } from "../utils/request"

interface IndexStore {
  index: number
  max: number
  fetchMaxIndex: () => Promise<void>
  previous: () => void
  next: () => void
  setIndex: (index: number) => void
}

export const useIndexStore = create<IndexStore>()((set) => ({
  index: 0,
  max: 0,
  fetchMaxIndex: async () => {
    const tasks = await getAllTasksLength()
    set({ max: tasks.all - 1 })
  },
  previous: () => set((state) => ({ index: state.index - 1})),
  next: () => set((state) => ({ index: state.index + 1})),
  setIndex: (index: number) => set({ index })
}))

export const useTrackedIndexStore = createTrackedSelector(useIndexStore)
