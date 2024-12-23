import { Comment } from "../utils/types"
import { Item, Menu, useContextMenu } from "react-contexify"
import { useCallback } from "react"
import { deleteComment } from "../utils/request"

export default function Message({ data, setReplyTo, setReplying, onRefresh, setEdit, setEditing, setValue }: {
  data: Comment,
  setReplyTo: (id: number) => void,
  setReplying: (replying: boolean) => void,
  onRefresh: () => void
  setEdit: (id: number) => void,
  setEditing: (editing: boolean) => void,
  setValue: (value: string) => void,
}) {
  const { show } = useContextMenu({
    id: data.comment_id,
  })

  function handleContextMenu(event) {
    show({
      event,
      props: {
        key: "value",
      },
    })
  }

  const onReply = useCallback(() => {
    setReplyTo(data.comment_id)
    setReplying(true)
    setEditing(false)
  }, [])

  const onEdit = useCallback(() => {
    setEdit(data.comment_id)
    setEditing(true)
    setValue(data.text)
    setReplying(false)
  }, [])

  const onDelete = useCallback(async () => {
    await deleteComment(data.comment_id, data.annot_id)
    onRefresh()
  }, [])

  return (
      <>
        <div style={{
          paddingBottom: "4px",
        }} onContextMenu={handleContextMenu}>
          <div>
            <strong>{data.username}</strong>
          </div>
          <div style={{
            overflowWrap: "break-word",
          }}>
            {data.text}
          </div>
          <div style={{
            fontSize: "0.8em",
            color: "gray",
          }}>
            {new Date(data.comment_time).toLocaleString()} #{data.comment_id}
          </div>
        </div>
        <Menu style={{
          position: "unset",
          maxWidth: "30px",
        }} id={data.comment_id}>
          <Item onClick={onReply}>Reply</Item>
          <Item onClick={onDelete}>Delete</Item>
          <Item onClick={onEdit}>Edit</Item>
        </Menu>
      </>
  )
}
