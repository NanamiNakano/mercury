import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CommentFormProps {
  newComment: string
  onCommentChange: (comment: string) => void
  onSubmit: () => void
  onCancel: () => void
  isReplying: boolean
}

export default function CommentForm({ newComment, onCommentChange, onSubmit, onCancel, isReplying }: CommentFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="flex w-full space-x-2"
    >
      <Input
        value={newComment}
        onChange={e => onCommentChange(e.target.value)}
        placeholder={isReplying ? "Type your reply..." : "Type a comment..."}
        className="flex-grow"
      />
      <Button type="submit">{isReplying ? "Reply" : "Send"}</Button>
      {isReplying && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </form>
  )
}
