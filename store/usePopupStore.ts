import type { LabelData } from "../utils/types"
import { createTrackedSelector } from "react-tracked"
import { create } from "zustand"

interface PopupState {
  editingID: string | null
  summarySelectionRange: [number, number]
  sourceSelectionRange: [number, number]
  consistent: string[]
  note: string

  restore: LabelData | null

  setEditingID: (id: string | null) => void
  setSummarySelectionRange: (range: [number, number]) => void
  setSourceSelectionRange: (range: [number, number]) => void
  setConsistent: (consistent: string[]) => void
  setNote: (note: string) => void
  setLabelData: (data: LabelData) => void

  clearAll: () => void
}

export const usePopupStore = create<PopupState>(set => ({
  editingID: null,

  summarySelectionRange: [-1, -1],
  sourceSelectionRange: [-1, -1],

  consistent: [],
  note: "",

  restore: null,

  setEditingID: (id: string | null) => set({
    editingID: id,
  }),
  setSummarySelectionRange: (range: [number, number]) => set({
    summarySelectionRange: range,
  }),
  setSourceSelectionRange: (range: [number, number]) => set({
    sourceSelectionRange: range,
  }),
  setConsistent: (consistent: string[]) => set({
    consistent,
  }),
  setNote: (note: string) => set({
    note,
  }),
  setLabelData: (data: LabelData) => set({
    editingID: data.record_id,
    summarySelectionRange: [data.summary_start, data.summary_end],
    sourceSelectionRange: [data.source_start, data.source_end],
    consistent: data.consistent,
    note: data.note,
    restore: data,
  }),

  clearAll: () => set({
    editingID: null,
    summarySelectionRange: [-1, -1],
    sourceSelectionRange: [-1, -1],
    consistent: [],
    note: "",
  }),
}))

export const useTrackedPopupStore = createTrackedSelector(usePopupStore)
