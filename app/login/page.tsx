"use client"

import {
  Button,
  Field,
  Input,
  makeResetStyles,
  Title1, Toast, Toaster, ToastTitle,
  tokens,
  useId,
  useToastController,
} from "@fluentui/react-components"
import { login } from "../../utils/request"
import { useRouter } from "next/navigation"

const useStackClassName = makeResetStyles({
  display: "flex",
  flexDirection: "column",
  maxWidth: "350px",
  rowGap: tokens.spacingVerticalL,
})

export default function Login() {
  const router = useRouter()
  const toasterId = useId("toaster")
  const { dispatchToast } = useToastController(toasterId)

  async function formAction(formData) {
    if (formData.get("email") && formData.get("password")) {
      const success = await login(formData.get("email"), formData.get("password"))
      if (success) {
        router.push("/")
      } else {
        dispatchToast(
            <Toast>
              <ToastTitle>User does not exist or mismatched email and password</ToastTitle>
            </Toast>,
            { position: "bottom-start", intent: "error" },
        )
      }
    }
  }

  return (
      <>
        <Toaster toasterId={toasterId} />
        <Title1>Login</Title1>
        <form className={useStackClassName()} action={formAction}>
          <Field label="Email" required>
            <Input name="email" />
          </Field>
          <Field label="Password" required>
            <Input name="password" />
          </Field>
          <Button appearance="primary" type="submit">
            Login
          </Button>
        </form>
      </>
  )
}
