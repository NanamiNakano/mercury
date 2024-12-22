import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger, Input,
} from "@fluentui/react-components"
import { useCallback, useEffect, useState } from "react"
import { Comment, CommentData } from "../../utils/types"
import { commitComment, getComment } from "../../utils/request"
import _ from "lodash"
import { HasError, Loading } from "./fallback"

export default function Chat({ id }: { id: number }) {
  const [messages, setMessages] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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
          setMessages(data)
        }
      })
    }

    return () => {
      ignore = true
    }
  }, [])

  const formSetMessage = useCallback(async (formData) => {
    const message = {
      annot_id: id,
      parent_id: null,
      text: formData.get("message"),
    } as CommentData
    console.log(message)
    commitComment(message).then(() => {
      onFetch().then((data) => {
        if (data) {
          setMessages(data)
        }
      })
    })
  }, [])

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
                    <p>{message.text}</p>
                  </div>
              ))}
            </DialogContent>
            <DialogActions>
              <form
                  style={{
                    display: "flex",
                    gap: "1em",
                  }}
                  action={formSetMessage}>
                <Input type="text" name="message" />
                <Button appearance="primary" type="submit">Send</Button>
              </form>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
  )
}
