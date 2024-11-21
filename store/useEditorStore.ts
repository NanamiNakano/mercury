import { create } from "zustand"
import { createTrackedSelector } from "react-tracked"
import { handleRequestError, isRequestError, SectionResponse, SelectionRequest } from "../utils/types"
import { produce } from "immer"
import { selectText } from "../utils/request"

interface EditorState {
  sourceSelection: SelectionRequest
  summarySelection: SelectionRequest
  initiator: "source" | "summary" | null
  serverSection: SectionResponse
  setSourceSelection: (start: number, end: number) => void
  setSummarySelection: (start: number, end: number) => void
  clearAllSelection: () => void
  clearSourceSelection: () => void
  clearSummarySelection: () => void
  fetchServerSection: (index: number) => Promise<void>
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  sourceSelection: { start: -1, end: -1, from_summary: false },
  summarySelection: { start: -1, end: -1, from_summary: true },
  initiator: null,
  serverSection: [],
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
  clearSourceSelection: () => set({ sourceSelection: null }),
  clearSummarySelection: () => set({ summarySelection: null }),
  fetchServerSection: async (index: number) => {
    try {
      if (get().initiator == "source") {
        const response = await selectText(index, get().sourceSelection)
        if (isRequestError(response)) {
          handleRequestError(response)
          return
        }
        set({ serverSection: response })
      }
      else if (get().initiator == "summary") {
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
}))

export const useTrackedEditorStore = createTrackedSelector(useEditorStore)
