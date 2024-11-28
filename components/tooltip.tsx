import {
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useClientPoint,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react"
import { Button, Text, Textarea, Subtitle2 } from "@fluentui/react-components"
import { useEffect, useState } from "react"
import CustomOption from "./customOption";


const Tooltip = (props: {
  backgroundColor: string
  textColor: string
  text: string
  score?: number
  labels: (string | object)[]
  onLabel: (label: string[], note: string) => Promise<void>
  start: number
  end: number
  message: string
}) => {
  const [isOpen, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [lock, setLock] = useState(false)
  const [labelsStates, setLabelsStates] = useState({})
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
    transform: false,
    strategy: "fixed",
    placement: "top",
  })
  const hover = useHover(context, { move: false, handleClose: safePolygon(), enabled: !lock })
  const focus = useFocus(context)
  const click = useClick(context, { enabled: false })
  const dismiss = useDismiss(context)
  const role = useRole(context, {
    role: "dialog",
  })
  const clientPoint = useClientPoint(context, { axis: "x", enabled: !isOpen })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role, clientPoint, click])

  useEffect(() => {
    if (!lock && Object.keys(labelsStates).length !== 0) {
      setLock(true)
    }
  }, [labelsStates])

  return (
    <>
      <Text
        as="span"
        style={{
          backgroundColor: props.backgroundColor,
          color: props.textColor,
        }}
        ref={refs.setReference}
        {...getReferenceProps()}
        data-mercury-label-start={props.start}
        data-mercury-label-end={props.end}
      >
        {props.text}
      </Text>
      {isOpen && (
        <div
          data-mercury-disable-selection="true"
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            userSelect: "none",
            backgroundColor: "white",
            padding: ".5rem",
            borderRadius: ".5rem",
            zIndex: 1000,
            border: "1px solid black",
          }}
          {...getFloatingProps()}
        >
          {typeof props.score === "number" ? <Subtitle2>This pair of spans is hallucinated. </Subtitle2> : <Subtitle2>A single span hallucinated against the whole source. </Subtitle2>}
          {/* (Score: {props.score.toFixed(2)}) */}
          <br />
          <Text as="p">{props.message}</Text>
          {/* <br /> */}
          <CustomOption
            labels={props.labels}
            syncLabels={setLabelsStates}
          />
          {/* <br /> */}
          {/* <Text>Note (optional)</Text> */}
          <Textarea
            resize="both"
            style={{
              width: "100%",
            }}
            placeholder="Add an optional note"
            value={note}
            onChange={(_, data) => setNote(data.value)}
          />
          <br />
          <Button
            style={{
              marginTop: "1rem",
            }}
            onMouseDown={(event) => {
              event.stopPropagation()
              event.preventDefault()
              props.onLabel(
                Object.keys(labelsStates).filter((label) => labelsStates[label]),
                note
              )
              .then(() => setOpen(false))
            }}
          >
            Save
          </Button>
        </div>
      )}
    </>
  )
}

export default Tooltip
