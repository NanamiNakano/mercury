import { produce } from "immer"

const colors = [
  "#c4ebff",
  "#a8e1ff",
  "#70cdff",
  "#38baff",
  "#1cb0ff",
  "#00a6ff",
]

export function getColor(score: number){
  return colors[Math.floor(score * (colors.length - 1))]
}

export function normalizationScore(score: number[]) {
  return produce(score, draft => {
    if (draft.length === 0) return []
    if (draft.length === 1) return [1]
    const minScore = Math.min(...draft)
    const maxScore = Math.max(...draft)
    for (let i = 0; i < draft.length; i++) {
      draft[i] = (draft[i] - minScore) / (maxScore - minScore)
    }
  })
}
