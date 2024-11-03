"use client"

import { Button, Field, Input, makeResetStyles, Title1, tokens } from "@fluentui/react-components"
import { login } from "../../utils/request"

const useStackClassName = makeResetStyles({
  display: "flex",
  flexDirection: "column",
  maxWidth: "350px",
  rowGap: tokens.spacingVerticalL,
})

export default function Login() {
  async function formAction(formData) {
    if (formData.get("email") && formData.get("password")) {
      const success = await login(formData.get("email"), formData.get("password"))
      if (success) {
        window.location.href = "/"
      }
    }
  }

  return (
      <>
        <Title1>Login</Title1>
        <form className={useStackClassName()} action={formAction}>
          <Field label="Email" required>
            <Input name="email"/>
          </Field>
          <Field label="Password" required>
            <Input name="password"/>
          </Field>
          <Button appearance="primary" type="submit">
            Login
          </Button>
        </form>
      </>
  )
}
