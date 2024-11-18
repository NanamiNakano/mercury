import { create } from "zustand"
import { User } from "../utils/types"
import { getUserMe } from "../utils/request"
import { createTrackedSelector } from "react-tracked"
import { produce } from "immer"

interface UserState {
  user: User
  fetch: () => Promise<void>
  setName: (name: string) => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: {} as User,
  fetch: async () => {
    const user = await getUserMe()
    set({ user })
  },
  setName: (name: string) => set(produce((state: UserState) => { state.user.name = name })),
}))

export const useTrackedUserStore = createTrackedSelector(useUserStore)