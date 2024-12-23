import { Comment } from "../utils/types"
import { Item, Menu, useContextMenu } from "react-contexify"
import { useCallback } from "react"
import { deleteComment } from "../utils/request"

export default function Message({ data, setReplyTo, setReplying, onRefresh }: {
  data: Comment,
  setReplyTo: (comment: Comment) => void,
  setReplying: (replying: boolean) => void,
  onRefresh: () => void
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
    setReplyTo(data)
    setReplying(true)
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
            overflowWrap: "break-word"
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
          maxWidth: "30px"
        }} id={data.comment_id}>
          <Item onClick={onReply}>Reply</Item>
          <Item onClick={onDelete}>Delete</Item>
        </Menu>
      </>
  )
}
