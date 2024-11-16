"use client"

import {
  Avatar,
  Button,
  Field,
  Input,
  Popover, PopoverProps,
  PopoverSurface,
  PopoverTrigger,
} from "@fluentui/react-components"
import { changeName } from "../utils/request"
import { useTrackedUserStore } from "../store/useUserStore"
import { useEffect, useState } from "react"

export default function UserPopover() {
  const userState = useTrackedUserStore()
  const [open, setOpen] = useState(false)
  const handleOpenChange: PopoverProps["onOpenChange"] = (_, data) => setOpen(data.open || false)

  useEffect(() => {
    userState.fetch().then(() => {
    })
  }, [])

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
            <form style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em",
            }} action={formSetName}>
              <Field label="New Name">
                <Input type="text" name="newName" />
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
