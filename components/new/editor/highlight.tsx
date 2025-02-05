import type { HighlightMeta } from "@/utils/types"
import Color from "color"

interface HighlightProps {
  text: string
  highlights: HighlightMeta[]
}

export default function Highlight({ text, highlights }: HighlightProps) {
  const copyHighlights = [...highlights]
  const noLapHighlights = new Array<HighlightMeta>()

  while (copyHighlights.length > 1) {
    copyHighlights.sort((a, b) => a.end - b.end)
    const current = copyHighlights.pop()
    const previous = copyHighlights.pop()

    if (previous.end > current.start) {
      if (previous.end < current.end) {
        noLapHighlights.push({
          start: previous.end,
          end: current.end,
          color: current.color,
        })
      }
      const currentColor = Color(current.color)
      const mixedColor = currentColor.mix(Color(previous.color))
      if (previous.start < current.start) {
        copyHighlights.push({
          start: previous.start,
          end: current.start,
          color: previous.color,
        })
        copyHighlights.push({
          start: current.start,
          end: previous.end,
          color: mixedColor.hsl().string(),
        })
      } else if (previous.start > current.start) {
        copyHighlights.push({
          start: current.start,
          end: previous.start,
          color: current.color,
        })
        copyHighlights.push({
          start: previous.start,
          end: previous.end,
          color: mixedColor.hsl().string(),
        })
      } else {
        noLapHighlights.push({
          start: previous.start,
          end: previous.end,
          color: mixedColor.hsl().string(),
        })
      }
    } else {
      noLapHighlights.push(current)
      copyHighlights.push(previous)
    }
  }

  if (copyHighlights.length === 1) {
    noLapHighlights.push(...copyHighlights)
  }

  noLapHighlights.sort((a, b) => a.start - b.start)

  const segments = []
  let lastIndex = 0
  for (const highlight of noLapHighlights) {
    if (highlight.start > lastIndex) {
      segments.push(text.slice(lastIndex, highlight.start))
    }
    segments.push(<span style={{ backgroundColor: highlight.color }}>{text.slice(highlight.start, highlight.end)}</span>)
    lastIndex = highlight.end
  }

  segments.push(text.slice(lastIndex))

  return segments
}
