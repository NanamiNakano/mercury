import { create } from "zustand"
import { handleRequestError, isRequestError, Task } from "../utils/types"
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
      if (isRequestError(task)) {
        handleRequestError(task)
        return
      }
      set({ current: task })
    }
    catch (e) {
      set({ current: null })
      console.log(e)
      throw e
    }
  },
}))

export const useTrackedTaskStore = createTrackedSelector(useTaskStore)