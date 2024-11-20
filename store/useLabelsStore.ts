import { create } from "zustand"
import { getAllLabels } from "../utils/request"
import { createTrackedSelector } from "react-tracked"

interface LabelsState {
  labels: (string | object)[],
  fetch: () => Promise<void>,
}

export const useLabelsStore = create<LabelsState>()((set) => ({
  labels: [],
  fetch: async () => {
    try {
      const labels = await getAllLabels()
      set({ labels })
    } catch (e) {
      console.log(e)
      throw e
    }
  },
}))

export const useTrackedLabelsStore = createTrackedSelector(useLabelsStore)
