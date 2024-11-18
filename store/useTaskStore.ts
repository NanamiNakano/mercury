import { create } from "zustand"
import { Task } from "../utils/types"
import { getSingleTask } from "../utils/request"
import { createTrackedSelector } from "react-tracked"

interface TaskState {
  current: Task | null,
  fetch: (index: number) => Promise<void>
}

export const useTaskStore = create<TaskState>()((set) => ({
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