import { Button } from "@/components/ui/button"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import { useState } from "react"

interface EntryProps {
  username: string
  hslColor: string
  onStateChange: (active: boolean) => void
  onSelect: (selected: boolean) => void
}

export default function Entry({ username, hslColor: color, onStateChange, onSelect }: EntryProps) {
  const [active, setActive] = useState(true)

  function handleStateChange(active: boolean) {
    setActive(active)
    onStateChange(active)
  }

  return (
    <div className="h-10 border-slate-200 flex items-center justify-between px-2 border-b">
      <div className="flex gap-2">
        <div className="size-6 rounded-sm" style={{ backgroundColor: color }} onClick={() => onSelect(true)} />
        <p>{username}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => handleStateChange(!active)}>
        {active ? <IconEye /> : <IconEyeOff />}
      </Button>
    </div>
  )
}
