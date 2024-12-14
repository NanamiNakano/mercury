"use client"
// No drag now

import { Fragment, useState } from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";

type DragSelectProps = {
  text: string,
  range: [number, number],
  onRangeChange: (range: [number, number]) => void,
  idPrefix: string,
}

const splitText = (text: string, range: [number, number]) => {
  return [
    text.slice(0, range[0]),
    text.slice(range[0], range[1]),
    text.slice(range[1]),
  ]
}

const sortRange = (range: [number, number]): [number, number] => {
  return range[0] < range[1] ? range : [range[1], range[0]]
}

const useStyles = makeStyles({
  pin: {
    display: "inline-block",
    cursor: "pointer",
    height: "1.1rem",
    width: "1rem",
    backgroundColor: "#976728",
    ...shorthands.margin(0),
    ...shorthands.padding(0),
  }
})

const DragSelect = (props: DragSelectProps) => {
  const { text, range, onRangeChange, idPrefix } = props
  const [ownRange, setOwnRange] = useState<[number, number]>([range[0], range[1]])
  const styles = useStyles()

  const handleMouseUp = (e: MouseEvent, id: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount <= 0) return;
    const range = selection.getRangeAt(0);
    // @ts-ignore: exists
    const direction = selection.direction as "forward" | "backward" | "none";
    // TODO: Handle selection direction (start, forward too much & end, backward too much)
    if (id === `${idPrefix}-start`) {
      if (direction === "forward") {
        setOwnRange((prev) => {
          const result = sortRange([range.endOffset + prev[0], prev[1]])
          onRangeChange(result)
          return result
        })
      }

      if (direction === "backward") {
        setOwnRange((prev) => {
          const result = sortRange([range.startOffset, prev[1]])
          onRangeChange(result)
          return result
        })
      }
    }

    if (id === `${idPrefix}-end`) {
      if (direction === "forward") {
        setOwnRange((prev) => {
          const result = sortRange([prev[0], range.endOffset + prev[1]])
          onRangeChange(result)
          return result
        })
      }

      if (direction === "backward") {
        setOwnRange((prev) => {
          const result = sortRange([prev[0] + range.startOffset, prev[0]])
          onRangeChange(result)
          return result
        })
      }
    }

    selection.removeAllRanges();
  }

  return (
    <div
      id={`${idPrefix}-box`}
      style={{
        whiteSpace: "pre-wrap"
      }}
      ref={el => {
        if (!el) return
        el.addEventListener("selectstart", (e) => {
          // @ts-ignore: exists
          if (e.currentTarget.nodeType === Node.TEXT_NODE) {
            e.preventDefault()
            e.stopPropagation()
          }
        })
      }}
    >
      {splitText(text, ownRange).map((part, index) => (
        index === 1
          ? (
            <Fragment key={`${idPrefix}-fragment`}>
              <div
                className={styles.pin}
                id={`${idPrefix}-start`}
                ref={el => {
                  if (!el) return
                  const onMouseUp = (e: MouseEvent) => {
                    handleMouseUp(e, `${idPrefix}-start`)
                    document.removeEventListener("mouseup", onMouseUp)
                  }
                  el.addEventListener("mousedown", () => {
                    document.addEventListener("mouseup", onMouseUp)
                  })
                }}
              />
              <span
                style={{
                  backgroundColor: "#ffbb55"
                }}
              >
                {part}
              </span>
              <div
                className={styles.pin}
                id={`${idPrefix}-end`}
                ref={el => {
                  if (!el) return
                  const onMouseUp = (e: MouseEvent) => {
                    handleMouseUp(e, `${idPrefix}-end`)
                    document.removeEventListener("mouseup", onMouseUp)
                  }
                  el.addEventListener("mousedown", () => {
                    document.addEventListener("mouseup", onMouseUp)
                  })
                }}
              />
            </Fragment>
          ) : (
            <span key={`${idPrefix}-${part}-part`}>{part}</span>
          )

      ))}
    </div>
  )
}

export default DragSelect
