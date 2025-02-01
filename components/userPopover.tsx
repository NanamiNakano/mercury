"use client"

import type { PopoverProps } from "@fluentui/react-components"
import {
  Avatar,
  Button,
  Field,
  Input,
  Popover,
  PopoverSurface,
  PopoverTrigger,
} from "@fluentui/react-components"
import { useState } from "react"
import { useTrackedUserStore } from "../store/useUserStore"
import { changeName } from "../utils/request"

export default function UserPopover() {
  const userState = useTrackedUserStore()
  const [open, setOpen] = useState(false)
  const handleOpenChange: PopoverProps["onOpenChange"] = (_, data) => setOpen(data.open || false)

  async function formSetName(formData) {
    changeName(formData.get("newName")).then(() => {
      userState.setName(formData.get("newName"))
      setOpen(false)
    })
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} trapFocus>
      <PopoverTrigger disableButtonEnhancement>
        <Button icon={<Avatar size={20} name={userState.user.name} />}>
          {userState.user.name}
        </Button>
      </PopoverTrigger>

      <PopoverSurface>
        <div>
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em",
            }}
            action={formSetName}
          >
            <Field label="Change Name">
              <Input type="text" name="newName" defaultValue={userState.user.name} />
            </Field>
            <Button appearance="primary" type="submit">
              Change
            </Button>
          </form>
        </div>
      </PopoverSurface>
    </Popover>
  )
}
