export type Task = {
  doc: string
  sum: string
}

export type AllTasksLength = {
  all: number
}

export type LabelRequest = {
  sup: number
  sbottom: number
  dup: number
  dbottom: number
  correct: boolean
}

export type SelectionRequest = {
  up: number
  bottom: number
  from_summary: boolean
}

export type SectionResponseSlice = {
  score: number
  offset: number
  len: number
  to_doc: boolean
}

export type SectionResponse = SectionResponseSlice[]

export function userSectionResponse(start: number, end: number, toDoc: boolean): SectionResponseSlice {
  return {
    score: 2,
    offset: start,
    len: end - start,
    to_doc: toDoc,
  }
}

export type Error = {
  error: string
}

export type Normal = {
  message: string
}
