import { create } from "zustand"
import { createTrackedSelector } from "react-tracked"
import { getAllTasksLength } from "../utils/request"
import { produce } from "immer"

interface IndexState {
  index: number
  max: number
  previous: () => void
  next: () => void
  setIndex: (index: number) => void
  fetchMax: () => Promise<void>
}

export const useIndexStore = create<IndexState>()((set) => ({
  index: 0,
  max: 0,
  previous: () => set((state) => ({ index: state.index - 1 })),
  next: () => set((state) => ({ index: state.index + 1 })),
  setIndex: (index: number) => set({ index }),
  fetchMax: async () => {
    try {
      const task = await getAllTasksLength()
      set(produce((state: IndexState) => {
        state.max = task.all - 1
        if (state.index > state.max) state.index = 0
      }))
    } catch (e) {
      console.log(e)
      throw e
    }
  },
}))

export const useTrackedIndexStore = createTrackedSelector(useIndexStore)
