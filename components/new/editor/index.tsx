import type { CommentData, LabelRequest } from "@/utils/types"
import type { EditorPanelRef } from "./panel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useToast } from "@/hooks/use-toast"
import { useTrackedEditorStore } from "@/store/useEditorStore"
import { useTrackedIndexStore } from "@/store/useIndexStore"
import { useTrackedTaskStore } from "@/store/useTaskStore"
import { useTrackedUserStore } from "@/store/useUserStore"
import { commitComment, deleteLabel, labelText, patchComment } from "@/utils/request"
import { useMemo, useRef, useState } from "react"
import BottomBar from "../bottombar"
import EditorPanel from "./panel"

export default function Editor() {
  const taskStore = useTrackedTaskStore()
  const editorStore = useTrackedEditorStore()
  const userStore = useTrackedUserStore()
  const indexStore = useTrackedIndexStore()
  const { toast } = useToast()

  const type = useMemo(() => {
    if (editorStore.viewingID) {
      return "viewing"
    }
    return "editing"
  }, [editorStore.viewingID])

  const sourceRef = useRef<EditorPanelRef>(null)
  const summaryRef = useRef<EditorPanelRef>(null)
  const [consistent, setConsistent] = useState<string[]>([])
  const [note, setNote] = useState<string>("")

  const initialNote = useMemo(() => {
    if (editorStore.viewingID) {
      return editorStore.history.find(record => record.record_id === editorStore.viewingID)?.note
    }
    return ""
  }, [editorStore.viewingID, editorStore.history])

  const initialConsistent = useMemo(() => {
    if (editorStore.viewingID) {
      return editorStore.history.find(record => record.record_id === editorStore.viewingID)?.consistent
    }
    return []
  }, [editorStore.viewingID, editorStore.history])

  const comments = useMemo(() => {
    if (editorStore.viewingID) {
      return [] // TODO: get comments
    }
    return []
  }, [editorStore.viewingID])

  async function handleSubmitComment(comment: CommentData) {
    if (!editorStore.viewingID) {
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
    if (!editorStore.viewingID) {
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
    if (!editorStore.viewingID) {
      toast({
        title: "Cannot delete label",
        description: "You did not select any label to delete.",
      })
      return
    }
    try {
      await deleteLabel(userStore.accessToken, editorStore.viewingID)
      toast({
        title: "Label deleted",
        description: "The label has been deleted.",
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
    if (editorStore.viewingID) {
      return
    }

    sourceRef.current?.reset()
    summaryRef.current?.reset()
  }

  async function handleSubmitLabel() {
    if (editorStore.viewingID) {
      return
    }

    const sourceSelection = sourceRef.current?.selection ?? null
    const summarySelection = summaryRef.current?.selection ?? null

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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `There was a problem with your request: ${error}`,
      })
    }
  }

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <EditorPanel docType="source" type={type} text={taskStore.current?.doc || ""} ref={sourceRef} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <EditorPanel docType="summary" type={type} text={taskStore.current?.sum || ""} ref={summaryRef} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <BottomBar
          initialNote={initialNote}
          initialConsistent={initialConsistent}
          type={type}
          onConsistentChange={setConsistent}
          onNoteChange={setNote}
          labelId={editorStore.viewingID}
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
