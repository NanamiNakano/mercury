import { Comment } from "../utils/types"
import { Item, Menu, useContextMenu } from "react-contexify"
import { useCallback } from "react"

export default function Message({ data, setReplyTo, setReplying }: {
  data: Comment,
  setReplyTo: (comment: Comment) => void,
  setReplying: (replying: boolean) => void
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
        </Menu>
      </>
  )
}
