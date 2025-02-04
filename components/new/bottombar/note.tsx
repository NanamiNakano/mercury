import { Textarea } from "@/components/ui/textarea"
import { Window } from "@/components/ui/window"

interface NoteProps {
  initialNote: string
  onNoteChange: (note: string) => void
}

export default function Note({ initialNote = "", onNoteChange }: NoteProps) {
  if (initialNote !== "") {
    onNoteChange(initialNote)
  }
  
  return (
    <Window name="Note">
      <div>
        <Textarea
          placeholder="Note"
          onChange={e => onNoteChange(e.target.value)}
        >
          {initialNote}
        </Textarea>
      </div>
    </Window>
  )
}
