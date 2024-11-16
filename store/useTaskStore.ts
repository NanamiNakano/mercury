import { create } from "zustand"
import { Task } from "../utils/types"
import { getSingleTask } from "../utils/request"
import { createTrackedSelector } from "react-tracked"

interface TaskStore {
  current: Task | null,
  fetch: (index: number) => Promise<void>
}

export const useTaskStore = create<TaskStore>()((set) => ({
  current: null,
  fetch: async (index: number) => {
    try {
      const task = await getSingleTask(index)
      if ("doc" in task) {
        set({ current: task })
      }
    } catch (e) {
      set({ current: null })
      console.error(e)
    }
  },
}))

export const useTrackedTaskStore= createTrackedSelector(useTaskStore)