import type { ReactElement } from "react"

interface WindowProps {
  children: ReactElement<any>
  name: string
}

export function Window({ children, name }: WindowProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center bg-slate-100 h-9 px-4">
        <h1>{name}</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  )
}
