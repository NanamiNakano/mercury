import { create } from "zustand"
import { User } from "../utils/types"
import { getUserMe } from "../utils/request"
import { createTrackedSelector } from "react-tracked"

interface UserStore {
  user: User
  fetch: () => Promise<void>
  setName: (name: string) => void
}

export const useUserStore = create<UserStore>()((set) => ({
  user: {} as User,
  fetch: async () => {
    const user = await getUserMe()
    set({ user })
  },
  setName: (name: string) => set((state) => ({ user: { ...state.user, name } })),
}))

export const useTrackedUserStore = createTrackedSelector(useUserStore)