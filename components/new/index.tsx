import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import BottomBar from "./bottombar";
import Editor from "./editor";
import Sidebar from "./sidebar";

export default function New() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>
            <Editor />
          </ResizablePanel>
          <ResizableHandle withHandle/>
          <ResizablePanel>
            <BottomBar />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle/>
      <ResizablePanel>
        <Sidebar />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}