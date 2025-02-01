import type { InputProps } from "@fluentui/react-components"
import type { Comment, CommentData } from "../../utils/types"
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
} from "@fluentui/react-components"
import _ from "lodash"
import { useCallback, useEffect, useMemo, useState } from "react"
import { commitComment, getComment, patchComment } from "../../utils/request"
import Message from "../message"
import { HasError, Loading } from "./fallback"

export default function Chat({ id }: { id: number }) {
  const [replyTo, setReplyTo] = useState<number>()
  const [replying, setReplying] = useState(false)
  const [messages, setMessages] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [value, setValue] = useState("")
  const [edit, setEdit] = useState<number>()
  const [editing, setEditing] = useState(false)

  const onChange: InputProps["onChange"] = (_, data) => {
    setValue(data.value)
  }

  const onFetch = useCallback(async () => {
    const debounceSetIsLoading = _.debounce(setIsLoading, 500)

    setHasError(false)
    debounceSetIsLoading(true)
    try {
      const data = await getComment(id)
      if (data) {
        const sortedData = data.sort((a, b) => new Date(a.comment_time).getTime() - new Date(b.comment_time).getTime())
        setMessages(sortedData)
        setMessages(data)
      }
    } catch (e) {
      console.warn(e)
      setHasError(true)
    } finally {
      debounceSetIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    let ignore = false

    if (!ignore) {
      onFetch()
    }

    return () => {
      ignore = true
    }
  }, [onFetch])

  const onSubmitMessage = useCallback(async () => {
    const parent_id = replying ? replyTo : null
    const message = {
      annot_id: id,
      parent_id,
      text: value,
    } as CommentData
    if (editing) {
      patchComment(edit, message).then(() => {
        onFetch()
      })
    } else {
      commitComment(message).then(() => {
        onFetch()
      })
    }
    setValue("")
    setReplying(false)
    setEditing(false)
  }, [replying, replyTo, value, onFetch, edit, editing, id])

  function onUnsetReply() {
    setReplying(false)
  }

  function onUnsetEdit() {
    setEditing(false)
  }

  const hint = useMemo(() => {
    if (replying) {
      if (replyTo) {
        return `Replying to #${replyTo}`
      }
    } else if (editing) {
      if (edit) {
        return `Editing #${edit}`
      }
    }
    return null
  }, [replying, replyTo, editing, edit])

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button>Discuss</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            Chat&nbsp;
            <Button onClick={onFetch}>
              Refresh
            </Button>
          </DialogTitle>
          <DialogContent>
            {isLoading && <Loading />}
            {hasError && <HasError />}
            {!isLoading && !hasError && messages.map(message => (
              <div key={message.comment_id}>
                <div style={{
                  color: "gray",
                }}
                >
                  {message.parent_id ? `Reply to ${message.parent_id}` : null}
                </div>
                <Message
                  data={message}
                  setReplying={setReplying}
                  setReplyTo={setReplyTo}
                  onRefresh={onFetch}
                  setEdit={setEdit}
                  setEditing={setEditing}
                  setValue={setValue}
                />
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
            {editing && (
              <Button
                appearance="subtle"
                style={{ textDecoration: "underline", padding: 0 }}
                onClick={onUnsetEdit}
              >
                Dismiss
              </Button>
            )}
            <Field hint={hint}>
              <Input type="text" name="message" value={value} onChange={onChange} />
            </Field>
            <Button appearance="primary" onClick={onSubmitMessage}>Send</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
