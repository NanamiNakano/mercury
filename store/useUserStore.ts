import type { User } from "../utils/types"
import { produce } from "immer"
import { createTrackedSelector } from "react-tracked"
import { create } from "zustand"
import { getUserMe } from "../utils/request"

interface UserState {
  user: User
  fetch: () => Promise<void>
  setName: (name: string) => void
}

export const useUserStore = create<UserState>()(set => ({
  user: {} as User,
  fetch: async () => {
    try {
      const user = await getUserMe()
      set({ user })
    }
    catch (e) {
      console.log(e)
      throw e
    }
  },
  setName: (name: string) => set(produce((state: UserState) => { state.user.name = name })),
}))

export const useTrackedUserStore = createTrackedSelector(useUserStore)
