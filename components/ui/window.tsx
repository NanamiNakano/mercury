import type { ReactElement } from "react"

interface WindowProps {
  children: ReactElement
  name: string
}

export function Window({ children, name }: WindowProps) {
  return (
    <div>
      <div className="flex items-center bg-slate-100 h-9 px-4">
        <h1>{name}</h1>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
