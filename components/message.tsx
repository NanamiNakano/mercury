import { Comment } from "../utils/types"

export default function Message({ data }: { data: Comment }) {
  return (
      <div style={{
        paddingBottom: "4px"
      }}>
        <div>
          <strong>{data.username}</strong>
        </div>
        <div>
          {data.text}
        </div>
        <div style={{
          fontSize: "0.8em",
          color: "gray"
        }}>
          {new Date(data.comment_time).toLocaleString()}
        </div>
      </div>
  )
}
