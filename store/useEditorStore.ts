import { create } from "zustand"
import { createTrackedSelector } from "react-tracked"
import { handleRequestError, isRequestError, SectionResponse, SelectionRequest } from "../utils/types"
import { produce } from "immer"
import { selectText } from "../utils/request"

interface EditorState {
  sourceSelection: SelectionRequest | null
  summarySelection: SelectionRequest | null
  initiator: "source" | "summary" | null
  serverSection: SectionResponse
  setSourceSelection: (start: number, end: number) => void
  setSummarySelection: (start: number, end: number) => void
  clearSelection: () => void
  fetchServerSection: (index: number) => Promise<void>
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  sourceSelection: null,
  summarySelection: null,
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
  clearSelection: () => set(produce((state: EditorState) => {
    state.sourceSelection = null
    state.summarySelection = null
    state.serverSection = []
    state.initiator = null
    window.getSelection()?.removeAllRanges()
  })),
  fetchServerSection: async (index: number) => {
    if (get().initiator == "source") {
      try {
        const response = await selectText(index, get().sourceSelection)
        if (isRequestError(response)) {
          handleRequestError(response)
          return
        }
        set({ serverSection: response })
      }
      catch (e) {
        console.log(e)
        throw e
      }
    }
  },
}))

export const useTrackedEditorStore = createTrackedSelector(useEditorStore)
