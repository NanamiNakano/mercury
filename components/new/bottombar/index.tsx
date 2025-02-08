import type { Comment, CommentData } from "@/utils/types"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Actions from "./actions"
import Chat from "./chat"
import Label from "./label"
import Note from "./note"

interface BottomBarProps {
  type: "editing" | "viewing"
  initialConsistent?: Array<string>
  initialNote?: string
  onConsistentChange: (result: Array<string>) => void
  onNoteChange: (note: string) => void
  onDelete: () => void
  onReset: () => void
  onSubmitLabel: () => void
  labelId: number | null
  comments: Array<Comment>
  onSubmitChat: (comment: CommentData) => void
  onEditMessage: (id: number, comment: CommentData) => void
}

export default function BottomBar({ initialConsistent, initialNote, onConsistentChange, onNoteChange, onSubmitLabel, onDelete, onReset, type, labelId, comments, onSubmitChat, onEditMessage: onEdit }: BottomBarProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="border border-slate-200">
      <ResizablePanel>
        <Label initialData={initialConsistent} onResultChange={onConsistentChange} disabled={type === "viewing"} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Note initialNote={initialNote} onNoteChange={onNoteChange} disabled={type === "viewing"} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Actions onSubmit={onSubmitLabel} onDelete={onDelete} onReset={onReset} type={type} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <Chat labelId={labelId} comments={comments} onSubmit={onSubmitChat} onEdit={onEdit} disabled={type === "editing"} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
