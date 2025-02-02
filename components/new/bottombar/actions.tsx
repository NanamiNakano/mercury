import { Button } from "@/components/ui/button"
import { Window } from "@/components/ui/window"

interface ActionsProps {
  onSubmit: () => void
  onDelete: () => void
  onReset: () => void
  type: "editing" | "viewing"
}

export default function Actions({ onSubmit, onDelete, onReset, type }: ActionsProps) {
  return (
    <Window name="Actions">
      <div className="flex gap-2">
        <Button onClick={onReset} variant="outline">Reset</Button>
        {type === "editing" && (
          <>
            <Button onClick={onSubmit} variant="outline">Submit</Button>
            <Button onClick={onDelete} variant="destructive">Delete</Button>
          </>
        )}
      </div>
    </Window>
  )
}
