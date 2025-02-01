import { createTrackedSelector } from "react-tracked"
import { create } from "zustand"
import { getAllLabels } from "../utils/request"

interface LabelsState {
  labels: (string | object)[]
  fetch: () => Promise<void>
}

export const useLabelsStore = create<LabelsState>()(set => ({
  labels: [],
  fetch: async () => {
    try {
      const labels = await getAllLabels()
      set({ labels })
    }
    catch (e) {
      console.warn(e)
      throw e
    }
  },
}))

export const useTrackedLabelsStore = createTrackedSelector(useLabelsStore)
