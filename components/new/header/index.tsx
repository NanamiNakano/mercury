import Menu from "./menu"
import Pagination from "./pagination"
import User from "./user"

export default function Header() {
  return (
    <div className="bg-slate-50 flex gap-3 justify-between h-16 items-center w-auto px-4">
      <div className="flex gap-3">
        <Menu />
        <Pagination />
      </div>
      <User />
    </div>
  )
}
