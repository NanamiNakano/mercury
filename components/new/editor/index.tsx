import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useTrackedEditorStore } from "@/store/useEditorStore"
import { useTrackedTaskStore } from "@/store/useTaskStore"
import { useMemo } from "react"
import EditorPanel from "./panel"

export default function Editor() {
  const taskStore = useTrackedTaskStore()
  const editorStore = useTrackedEditorStore()

  const type = useMemo(() => {
    if (editorStore.viewingID) {
      return "viewing"
    }
    return "editing"
  }, [editorStore.viewingID])

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <EditorPanel docType="source" type={type} text={taskStore.current?.doc || ""} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <EditorPanel docType="summary" type={type} text={taskStore.current?.sum || ""} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
