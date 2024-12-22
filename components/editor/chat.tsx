import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger, Field, Input, InputProps,
} from "@fluentui/react-components"
import { useCallback, useEffect, useState } from "react"
import { Comment, CommentData } from "../../utils/types"
import { commitComment, getComment } from "../../utils/request"
import _ from "lodash"
import { HasError, Loading } from "./fallback"
import Message from "../message"

export default function Chat({ id }: { id: number }) {
  const [replyTo, setReplyTo] = useState<Comment>()
  const [replying, setReplying] = useState(false)
  const [messages, setMessages] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [value, setValue] = useState("")

  const onChange: InputProps["onChange"] = (ev, data) => {
    setValue(data.value)
  }

  const debounceSetIsLoading = _.debounce(setIsLoading, 500)

  const onFetch = useCallback(async () => {
    setHasError(false)
    debounceSetIsLoading(true)
    try {
      return await getComment(id)
    } catch (e) {
      setHasError(true)
    } finally {
      debounceSetIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    if (!ignore) {
      onFetch().then((data) => {
        if (data) {
          const sortedData = data.sort((a, b) => new Date(a.comment_time).getTime() - new Date(b.comment_time).getTime())
          setMessages(sortedData)
          setMessages(data)
        }
      })
    }

    return () => {
      ignore = true
    }
  }, [])

  const onSubmitMessage = useCallback(async () => {
    const parent_id = replying ? replyTo.comment_id : null
    const message = {
      annot_id: id,
      parent_id,
      text: value,
    } as CommentData
    console.log(message)
    commitComment(message).then(() => {
      onFetch().then((data) => {
        if (data) {
          setMessages(data)
        }
      })
    })
    setValue("")
    setReplying(false)
  }, [replying, replyTo, value])

  function onUnsetReply() {
    setReplying(false)
  }

  return (
      <Dialog>
        <DialogTrigger disableButtonEnhancement>
          <Button>Discussion</Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Chat</DialogTitle>
            <DialogContent>
              {isLoading && <Loading />}
              {hasError && <HasError />}
              {!isLoading && !hasError && messages.map((message) => (
                  <div key={message.comment_id}>
                    <div style={{
                      color: "gray",
                    }}>
                      {message.parent_id ? `Reply to ${message.parent_id}` : null}
                    </div>
                    <Message data={message} setReplying={setReplying} setReplyTo={setReplyTo} />
                  </div>
              ))}
            </DialogContent>
            <DialogActions>
              {replying && (
                  <Button
                      appearance="subtle"
                      style={{ textDecoration: "underline", padding: 0 }}
                      onClick={onUnsetReply}
                  >
                    Dismiss
                  </Button>
              )}
              <Field hint={replying && replyTo ? `Replying to ${replyTo.username}` : null}>
                <Input type="text" name="message" value={value} onChange={onChange} />
              </Field>
              <Button appearance="primary" onClick={onSubmitMessage}>Send</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
  )
}
