import { Textarea } from "@/components/ui/textarea"
import { Window } from "@/components/ui/window"


interface NoteProps {
  onNoteChange: (note: string) => void
}

export default function Note({ onNoteChange }: NoteProps) {
  return (
    <Window name="Note">
      <div>
        <Textarea
          placeholder="Note"
          onChange={e => onNoteChange(e.target.value)}
        />
      </div>
    </Window>
  )
}