import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Editor from "./editor"
import Sidebar from "./sidebar"

export default function New() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <Editor />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Sidebar />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
