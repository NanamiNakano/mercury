import type {
  AllTasksLength,
  LabelData,
  LabelRequest,
  Normal, RequestError,
  SectionResponse,
  SelectionRequest,
  Task,
  User,
} from "./types"
import { produce } from "immer"

const backend = process.env.NEXT_PUBLIC_BACKEND || ""

// const getKey = async (): Promise<string> => {
//   const hasUserMe = await checkUserMe()
//
//   const key = localStorage.getItem("key")
//   if (key === "" || key === null) {
//     const response = await fetch(`${backend}/user/new`)
//     const data = await response.json()
//     localStorage.setItem("key", data.key)
//     if (hasUserMe) {
//       localStorage.setItem("name", data.name)
//     }
//     return data.key
//   }
//
//   if (hasUserMe) {
//     const nameResponse = await fetch(`${backend}/user/me`, {
//       headers: {
//         "User-Key": key,
//       },
//     })
//
//     const data = await nameResponse.json()
//     if ("error" in data) {
//       localStorage.removeItem("key")
//       localStorage.removeItem("name")
//       return getKey()
//     }
//     localStorage.setItem("name", data.name)
//     return Promise.resolve(key)
//   }
// }
const getAccessToken = (): string => {
  const accessToken = localStorage.getItem("access_token")
  if (accessToken === "" || accessToken === null) {
    console.log("Please login")
  }
  return accessToken
}

const getUserMe = async (): Promise<User> => {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/user/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  return response.json()
}

const checkUserMe = async (access_token: string): Promise<boolean> => {
  const response = await fetch(`${backend}/user/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  return response.ok
}

const changeName = async (name: string): Promise<Normal> => {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/user/name`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({ name }),
  })
  const data = await response.json()
  localStorage.setItem("name", name)
  return data as Normal
}

const getAllLabels = async (): Promise<(string | object)[]> => {
  const response = await fetch(`${backend}/candidate_labels`)
  const data = await response.json()
  return data as string[]
}

const getAllTasksLength = async (): Promise<AllTasksLength> => {
  const response = await fetch(`${backend}/task`)
  const data = await response.json()
  return data as AllTasksLength
}

const getSingleTask = async (taskIndex: number): Promise<Task | RequestError> => {
  const response = await fetch(`${backend}/task/${taskIndex}`)
  const data = await response.json()
  return data as Task | RequestError
}

const selectText = async (taskIndex: number, req: SelectionRequest): Promise<SectionResponse | RequestError> => {
  const response = await fetch(`${backend}/task/${taskIndex}/select`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  })
  const data = await response.json()
  return data as SectionResponse | RequestError
}

const labelText = async (taskIndex: number, req: LabelRequest, single?: "source" | "summary"): Promise<Normal> => {
  const processedReq = produce(req, draft => {
    if (single) {
      if (single === "source") {
        draft.summary_start = -1
        draft.summary_end = -1
      } else {
        draft.source_start = -1
        draft.source_end = -1
      }
    }
  })
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/task/${taskIndex}/label`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(processedReq),
  })
  const data = await response.json()
  return data as Normal
}

const exportLabel = async (): Promise<LabelData[]> => {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/user/export`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  const data = await response.json()
  return data as LabelData[]
}

const getTaskHistory = async (taskIndex: number): Promise<LabelData[]> => {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/task/${taskIndex}/history`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  const data = await response.json()
  if (Array.isArray(data)) {
    return data as LabelData[]
  }
  return []
}

const deleteRecord = async (recordId: string): Promise<Normal> => {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/record/${recordId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  const data = await response.json()
  return data as Normal
}

const login = async (email: string, password: string): Promise<boolean> => {
  const response = await fetch(`${backend}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username: email, password: password }),
  })
  const data = await response.json()
  if ("access_token" in data) {
    localStorage.setItem("access_token", data.access_token)
    return true
  }
  return false
}

const updateRecord = async (taskIndex: number, recordId: string, labelData: LabelData): Promise<Normal> => {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/task/${taskIndex}/label/${recordId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(labelData),
  })
  const data = await response.json()
  return data as Normal
}

export {
  getAllTasksLength,
  getSingleTask,
  selectText,
  labelText,
  exportLabel,
  getTaskHistory,
  deleteRecord,
  getAllLabels,
  changeName,
  checkUserMe,
  getUserMe,
  login,
  updateRecord
}
