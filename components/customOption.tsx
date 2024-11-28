import type React from "react";
import { useState } from "react";
import { Checkbox } from "@fluentui/react-components";
import { mixedToBoolean } from "../utils/types";

const CustomOption = (props: {
  labels: (string | object)[],
  syncLabels: (labels: Record<string, boolean>) => void,
  initialLabels?: string[],
  style?: React.CSSProperties,
}) => {
  const [labelsStates, setLabelsStates] = useState(() => {
    if (props.initialLabels) {
      const labels: Record<string, boolean> = {}
      for (const label of props.initialLabels) {
        labels[label] = true
      }
      return labels
    }
    return {}
  })

  const setLabelsStatesWithSync = (labels: Record<string, boolean>) => {
    setLabelsStates(labels)
    props.syncLabels(labels)
  }

  const InsideOption = (props: { value: unknown, keys: string[] }) => {
    const level = props.keys.length + 1
    if (typeof props.value === "object" && !Array.isArray(props.value)) {
      const key = Object.keys(props.value)[0]
      const value = Object.values(props.value)[0]

      return (<>
        <Checkbox
          id={`label-${key}`}
          checked={labelsStates[key]}
          onChange={(_, data) => {
            setLabelsStatesWithSync({
              ...labelsStates,
              [key]: mixedToBoolean(data.checked)
            })
          }}
          label={key}
          style={{
            marginLeft: `${(level - 1) * 0.5}rem`
          }}
        />
        <div style={{
          display: labelsStates[key] ? "flex" : "none",
          flexDirection: "column",
        }}>
          <InsideOption value={value} keys={[...props.keys, key]}/>
        </div>
      </>)
    }

    // is array
    if (Array.isArray(props.value)) {
      return props.value.map((value) => {
        return <InsideOption value={value} keys={props.keys}/>
      })
    }

    // is string
    const value_: string = `${props.keys.join(".")}.${props.value}`
    return <Checkbox
      id={`label-${value_}`}
      checked={labelsStates[value_]}
      onChange={(_, data) => setLabelsStatesWithSync({
        ...labelsStates,
        [value_]: mixedToBoolean(data.checked)
      })}
      label={props.value}
      style={{
        marginLeft: `${(level - 1) * 0.5}rem`
      }}
    />
  }

  return (
    <div style={{
      display: "flex",
      marginTop: "1rem",
      gap: "1rem",
      flexWrap: "wrap",
      ...props.style
    }}>
      {
        props.labels.map(label => {
          if (typeof label === "string") {
            return <div style={{
              display: "flex",
              flexDirection: "column",
            }}>
              <Checkbox
                id={`label-${label}`}
                key={label}
                checked={labelsStates[label]}
                onChange={(_, data) => setLabelsStatesWithSync({
                  ...labelsStates,
                  [label]: mixedToBoolean(data.checked)
                })}
                label={label}
              />
            </div>
          }

          const key = Object.keys(label)[0]
          return (
            <div id={`label-${key}-box`} style={{
              display: "flex",
              flexDirection: "column",
            }}>
              <Checkbox
                id={`label-${key}`}
                checked={labelsStates[key]}
                onChange={(_, data) => setLabelsStatesWithSync({
                  ...labelsStates,
                  [key]: mixedToBoolean(data.checked)
                })}
                label={key}
              />
              {labelsStates[key] && <InsideOption value={Object.values(label)[0]} keys={[Object.keys(label)[0]]}/>}
            </div>
          )
        })
      }
    </div>
  )
}


export default CustomOption;
