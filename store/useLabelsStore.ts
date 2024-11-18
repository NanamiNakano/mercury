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
    const labels = await getAllLabels()
    set({ labels })
  },
}))

export const useTrackedLabelsStore = createTrackedSelector(useLabelsStore)
