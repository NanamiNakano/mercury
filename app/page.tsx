"use client"

import {
  Button,
  Title1,
  Toast,
  Toaster,
  ToastTitle,
  ToastTrigger,
  useId,
  useToastController,
} from "@fluentui/react-components"
import Controls from "../components/editor/controls"
import LabelPagination from "../components/labelPagination"
import Editor from "../components/editor/editor"
import { Suspense, useEffect } from "react"
import { useTrackedIndexStore } from "../store/useIndexStore"
import { useTrackedLabelsStore } from "../store/useLabelsStore"
import { useRouter, useSearchParams } from "next/navigation"
import { checkUserMe } from "../utils/request"
import { useTrackedUserStore } from "../store/useUserStore"

let didInit = false

function Page() {
  const indexStore = useTrackedIndexStore()
  const labelsStore = useTrackedLabelsStore()
  const userStore = useTrackedUserStore()

  const router = useRouter()
  const searchParams = useSearchParams()

  const toasterId = useId("toaster")
  const { dispatchToast } = useToastController(toasterId)

  useEffect(() => {
    if (!didInit) {
      didInit = true

      indexStore.fetchMax().catch(e => {
        console.log(e)
        dispatchToast(
            <Toast>
              <ToastTitle
                  action={
                    <ToastTrigger>
                      <Button onClick={() => {
                        router.refresh()
                      }}>Reload app</Button>
                    </ToastTrigger>
                  }
              >
                Fail loading index
              </ToastTitle>
            </Toast>,
            { intent: "error" },
        )
      })

      labelsStore.fetch().catch(e => {
        console.log(e)
        dispatchToast(
            <Toast>
              <ToastTitle
                  action={
                    <ToastTrigger>
                      <Button onClick={() => {
                        router.refresh()
                      }}>Reload app</Button>
                    </ToastTrigger>
                  }
              >
                Fail loading labels
              </ToastTitle>
            </Toast>,
            { intent: "error" },
        )
      })

      if (searchParams.has("sample")) {
        const index = searchParams.get("sample")
        const indexNumber = Number.parseInt(index)
        if (!Number.isNaN(indexNumber) && indexNumber >= 0) {
          indexStore.setIndex(indexNumber)
        }
      }
    }

    if (typeof window !== "undefined" && !userStore.user.name) {
      const access_token = localStorage.getItem("access_token")
      if (access_token == "" || access_token == null) {
        dispatchToast(
            <Toast>
              <ToastTitle>Not logged in</ToastTitle>
            </Toast>,
            { intent: "error" },
        )
        router.push("/login")
        return
      }
      checkUserMe(access_token).then(valid => {
        if (!valid) {
          localStorage.removeItem("access_token")
          dispatchToast(
              <Toast>
                <ToastTitle>Session expired</ToastTitle>
              </Toast>,
              { intent: "error" },
          )
          router.push("/login")
        }
        return
      })
      userStore.fetch().catch(e => {
        console.log(e)
        dispatchToast(
            <Toast>
              <ToastTitle
                  action={
                    <ToastTrigger>
                      <Button onClick={() => {
                        router.refresh()
                      }}>Reload app</Button>
                    </ToastTrigger>
                  }
              >
                Fail loading user data
              </ToastTitle>
            </Toast>,
            { intent: "error" },
        )
      })
    }
  }, [])

  return (
      <>
        <Toaster toasterId={toasterId} />
        <Title1>Mercury Label</Title1>
        <br />
        <br />
        <Controls />
        <br />
        <LabelPagination />
        <br />
        <Editor dispatchToast={dispatchToast} />
      </>
  )
}

export default function Index() {
  return (
      <Suspense>
        <Page />
      </Suspense>
  )
}
