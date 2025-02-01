import type {
  AllTasksLength,
  Comment,
  CommentData,
  LabelData,
  LabelRequest,
  Normal,
  RequestError,
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
function getAccessToken(): string {
  const accessToken = localStorage.getItem("access_token")
  if (accessToken === "" || accessToken === null) {
    console.log("Please login")
  }
  return accessToken
}

async function getUserMe(): Promise<User> {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/user/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  return response.json()
}

async function checkUserMe(access_token: string): Promise<boolean> {
  const response = await fetch(`${backend}/user/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  return response.ok
}

async function changeName(name: string): Promise<Normal> {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/user/name`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify({ name }),
  })
  const data = await response.json()
  localStorage.setItem("name", name)
  return data as Normal
}

async function getAllLabels(): Promise<(string | object)[]> {
  const response = await fetch(`${backend}/candidate_labels`)
  const data = await response.json()
  return data as string[]
}

async function getAllTasksLength(): Promise<AllTasksLength> {
  const response = await fetch(`${backend}/task`)
  const data = await response.json()
  return data as AllTasksLength
}

async function getSingleTask(taskIndex: number): Promise<Task | RequestError> {
  const response = await fetch(`${backend}/task/${taskIndex}`)
  const data = await response.json()
  return data as Task | RequestError
}

async function selectText(taskIndex: number, req: SelectionRequest): Promise<SectionResponse | RequestError> {
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

async function labelText(taskIndex: number, req: LabelRequest, single?: "source" | "summary"): Promise<Normal> {
  const processedReq = produce(req, (draft) => {
    if (single) {
      if (single === "source") {
        draft.summary_start = -1
        draft.summary_end = -1
      }
      else {
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
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify(processedReq),
  })
  const data = await response.json()
  return data as Normal
}

async function exportLabel(): Promise<LabelData[]> {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/user/export`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  const data = await response.json()
  return data as LabelData[]
}

async function getTaskHistory(taskIndex: number): Promise<LabelData[]> {
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

async function deleteRecord(recordId: string): Promise<Normal> {
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

async function login(email: string, password: string): Promise<boolean> {
  const response = await fetch(`${backend}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username: email, password }),
  })
  const data = await response.json()
  if ("access_token" in data) {
    localStorage.setItem("access_token", data.access_token)
    return true
  }
  return false
}

async function updateRecord(taskIndex: number, recordId: string, labelData: LabelData): Promise<Normal> {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/task/${taskIndex}/label/${recordId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify(labelData),
  })
  const data = await response.json()
  return data as Normal
}

async function getComment(annotId: number) {
  const response = await fetch(`${backend}/annot/${annotId}/comments`)
  const data = await response.json()
  return data as Comment[]
}

async function commitComment(comment: CommentData) {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/annot/${comment.annot_id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify(comment),
  })
  const data = await response.json()
  return data as Normal
}

async function patchComment(id: number, comment: CommentData) {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/annot/${comment.annot_id}/comments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify(comment),
  })
  const data = await response.json()
  return data as Normal
}

async function deleteComment(id: number, annotId: number) {
  const access_token = getAccessToken()
  const response = await fetch(`${backend}/annot/${annotId}/comments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  const data = await response.json()
  return data as Normal
}

export {
  changeName,
  checkUserMe,
  commitComment,
  deleteComment,
  deleteRecord,
  exportLabel,
  getAllLabels,
  getAllTasksLength,
  getComment,
  getSingleTask,
  getTaskHistory,
  getUserMe,
  labelText,
  login,
  patchComment,
  selectText,
  updateRecord,
}
