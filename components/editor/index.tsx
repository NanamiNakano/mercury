import type { CommentData, LabelRequest, SelectionRequest } from "@/utils/types"
import type { EditorPanelRef } from "./panel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useToast } from "@/hooks/use-toast"
import { useTrackedEditorStore } from "@/store/useEditorStore"
import { useTrackedIndexStore } from "@/store/useIndexStore"
import { useTrackedTaskStore } from "@/store/useTaskStore"
import { useTrackedUserStore } from "@/store/useUserStore"
import { commitComment, deleteLabel, labelText, patchComment, selectText } from "@/utils/request"
import { isRequestError } from "@/utils/types"
import { produce } from "immer"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import BottomBar from "../bottombar"
import EditorPanel from "./panel"

export default function Editor() {
  const taskStore = useTrackedTaskStore()
  const editorStore = useTrackedEditorStore()
  const userStore = useTrackedUserStore()
  const indexStore = useTrackedIndexStore()
  const { toast } = useToast()

  const type = useMemo(() => {
    if (editorStore.viewing) {
      return "viewing"
    }
    return "editing"
  }, [editorStore.viewing])

  const sourceRef = useRef<EditorPanelRef>(null)
  const summaryRef = useRef<EditorPanelRef>(null)
  const [consistent, setConsistent] = useState<string[]>([])
  const [note, setNote] = useState<string>("")
  const [summaryIsPending, startRequestSummary] = useTransition()
  const [sourceIsPending, startRequestSource] = useTransition()
  const [selection, setSelection] = useState<{
    sourceSelection: SelectionRequest | null
    summarySelection: SelectionRequest | null
  }>({
    sourceSelection: null,
    summarySelection: null,
  })

  const initialNote = useMemo(() => {
    if (editorStore.viewing) {
      return editorStore.viewing.note
    }
    return ""
  }, [editorStore.viewing])

  const initialConsistent = useMemo(() => {
    if (editorStore.viewing) {
      return editorStore.viewing.consistent
    }
    return []
  }, [editorStore.viewing, editorStore.history])

  const comments = useMemo(() => {
    if (editorStore.viewing) {
      return [] // TODO: get comments
    }
    return []
  }, [editorStore.viewing])

  async function handleSubmitComment(comment: CommentData) {
    if (!editorStore.viewing) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
      return
    }
    try {
      await commitComment(userStore.accessToken, comment)
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `There was a problem with your request: ${error}`,
      })
    }
  }

  async function handleEditComment(id: number, comment: CommentData) {
    if (!editorStore.viewing) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
      return
    }
    try {
      await patchComment(userStore.accessToken, id, comment)
      toast({
        title: "Comment updated",
        description: "Your comment has been updated",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `There was a problem with your request: ${error}`,
      })
    }
  }

  async function handleDeleteLabel() {
    if (!editorStore.viewing) {
      toast({
        title: "Cannot delete label",
        description: "You did not select any label to delete.",
      })
      return
    }
    try {
      await deleteLabel(userStore.accessToken, editorStore.viewing.record_id)
      editorStore.setViewing(null)
      editorStore.fetchHistory(userStore.accessToken, indexStore.index).catch((e) => {
        console.warn(e)
        toast({
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        })
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `There was a problem with your request: ${error}`,
      })
    }
  }

  function handleResetLabel() {
    if (editorStore.viewing) {
      return
    }

    sourceRef.current?.reset()
    summaryRef.current?.reset()
    editorStore.clearServerSection()
  }

  const handleSubmitLabel = useCallback(async () => {
    if (editorStore.viewing) {
      return
    }

    const sourceSelection = selection.sourceSelection
    const summarySelection = selection.summarySelection

    if (!sourceSelection && !summarySelection) {
      return
    }

    const labelRequest: LabelRequest = {
      summary_start: summarySelection?.start ?? -1,
      summary_end: summarySelection?.end ?? -1,
      source_start: sourceSelection?.start ?? -1,
      source_end: sourceSelection?.end ?? -1,
      consistent,
      note,
    }

    try {
      await labelText(userStore.accessToken, indexStore.index, labelRequest)
      handleResetLabel()
      editorStore.fetchHistory(userStore.accessToken, indexStore.index).catch((e) => {
        console.warn(e)
        toast({
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        })
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `There was a problem with your request: ${error}`,
      })
    }
  }, [consistent, note, indexStore.index, userStore.accessToken, editorStore.viewing, selection])

  function handleSelectionChange(selection: SelectionRequest | null, docType: "source" | "summary") {
    setSelection(produce((draft) => {
      if (docType === "source") {
        draft.sourceSelection = selection
      } else {
        draft.summarySelection = selection
      }
    }))
  }

  useEffect(() => {
    if (indexStore.index !== undefined) {
      taskStore.fetch(indexStore.index).catch((e) => {
        console.warn(e)
        toast({
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        })
      })
      editorStore.fetchHistory(userStore.accessToken, indexStore.index).catch((e) => {
        console.warn(e)
        toast({
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        })
      })
    }
  }, [indexStore.index, userStore.accessToken])

  useEffect(() => {
    // only request server section when only one of the panel is selected
    if (selection.sourceSelection && !selection.summarySelection) {
      startRequestSummary(async () => {
        const response = await selectText(indexStore.index, selection.sourceSelection)
        if (isRequestError(response)) {
          console.error(response.error)
        } else {
          editorStore.setServerSection(response)
        }
      })
    } else if (!selection.sourceSelection && selection.summarySelection) {
      startRequestSource(async () => {
        const response = await selectText(indexStore.index, selection.summarySelection)
        if (isRequestError(response)) {
          console.error(response.error)
        } else {
          editorStore.setServerSection(response)
        }
      })
    }
  }, [selection, indexStore.index])

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={75}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>
            <EditorPanel
              docType="source"
              type={type}
              text={taskStore.current?.doc || ""}
              ref={sourceRef}
              pending={sourceIsPending}
              onSelectionChange={selection => handleSelectionChange(selection, "source")}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <EditorPanel
              docType="summary"
              type={type}
              text={taskStore.current?.sum || ""}
              ref={summaryRef}
              pending={summaryIsPending}
              onSelectionChange={selection => handleSelectionChange(selection, "summary")}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25}>
        <BottomBar
          initialNote={initialNote}
          initialConsistent={initialConsistent}
          type={type}
          onConsistentChange={setConsistent}
          onNoteChange={setNote}
          onSubmitChat={handleSubmitComment}
          onEditMessage={handleEditComment}
          comments={comments}
          onDelete={handleDeleteLabel}
          onReset={handleResetLabel}
          onSubmitLabel={handleSubmitLabel}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
