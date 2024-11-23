import { create } from "zustand"
import { createTrackedSelector } from "react-tracked"
import { handleRequestError, isRequestError, type LabelData, SectionResponse, SelectionRequest } from "../utils/types"
import { produce } from "immer"
import { getTaskHistory, selectText } from "../utils/request"

interface EditorState {
  sourceSelection: SelectionRequest
  summarySelection: SelectionRequest
  initiator: "source" | "summary" | null
  serverSection: SectionResponse
  editable: boolean
  setSourceSelection: (start: number, end: number) => void
  setSummarySelection: (start: number, end: number) => void
  clearAllSelection: () => void
  clearSourceSelection: () => void
  clearSummarySelection: () => void
  fetchServerSection: (index: number) => Promise<void>

  history: LabelData[],
  viewingID: string | null
  updateHistory: (labelIndex: number) => Promise<void>
  setViewing: (viewingRecord: LabelData) => void
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  sourceSelection: { start: -1, end: -1, from_summary: false },
  summarySelection: { start: -1, end: -1, from_summary: true },
  initiator: null,
  serverSection: [],
  editable: true,
  setSourceSelection: (start: number, end: number) => set(produce((state: EditorState) => {
    state.sourceSelection = { start, end, from_summary: false }
    if (state.initiator === null) state.initiator = "source"
  })),
  setSummarySelection: (start: number, end: number) => set(produce((state: EditorState) => {
    state.summarySelection = { start, end, from_summary: true }
    if (state.initiator === null) state.initiator = "summary"
  })),
  clearAllSelection: () => set(produce((state: EditorState) => {
    state.sourceSelection = { start: -1, end: -1, from_summary: false }
    state.summarySelection = { start: -1, end: -1, from_summary: true }
    state.serverSection = []
    state.initiator = null
    window.getSelection()?.removeAllRanges()
  })),
  clearSourceSelection: () => set(produce((state: EditorState) => {
    state.sourceSelection = { start: -1, end: -1, from_summary: false }
    if (state.initiator === "source") {
      state.initiator = null
      if (state.serverSection.length > 0) state.serverSection = []
    }
  })),
  clearSummarySelection: () => set(produce((state: EditorState) => {
    state.summarySelection = { start: -1, end: -1, from_summary: true }
    if (state.initiator === "summary") {
      state.initiator = null
      if (state.serverSection.length > 0) state.serverSection = []
    }
  })),
  fetchServerSection: async (index: number) => {
    try {
      if (get().initiator === "source") {
        const response = await selectText(index, get().sourceSelection)
        if (isRequestError(response)) {
          handleRequestError(response)
          return
        }
        set({ serverSection: response })
      }
      else if (get().initiator === "summary") {
        const response = await selectText(index, get().summarySelection)
        if (isRequestError(response)) {
          handleRequestError(response)
          return
        }
        set({ serverSection: response })
      }
    }
    catch (e) {
      console.log(e)
      throw e
    }
  },

  history: [],
  viewingID: null,
  updateHistory: async (labelIndex: number) => {
    try {
      const history = await getTaskHistory(labelIndex)
      set({ history })
    }
    catch (e) {
      set({ history: [] })
      console.log(e)
      throw e
    }
  },
  setViewing: (viewing: LabelData | null) => set(produce((state: EditorState) => {
    if (viewing === null) {
      state.editable = true
      state.viewingID = null
    } else {
      state.sourceSelection.start = viewing.source_start
      state.sourceSelection.end = viewing.source_end
      state.summarySelection.start = viewing.summary_start
      state.summarySelection.end = viewing.summary_end
      state.editable = false
      state.viewingID = viewing.record_id
    }
  })),
}))

export const useTrackedEditorStore = createTrackedSelector(useEditorStore)
