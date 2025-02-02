import { Checkbox } from "@/components/ui/checkbox"
import { produce } from "immer"
import { useEffect, useMemo, useRef, useState } from "react"

interface CandidateProps {
  candidate: Array<string>,
  prefix: string | null,
  onResultChange: (result: Array<string>) => void
}


function Candidate({ candidate, prefix, onResultChange }: CandidateProps) {
  const [labels, setLabels] = useState<Record<string, boolean>>(
    Object.fromEntries(candidate.map(item => [item, false])),
  )

  function handleChange(item: string, value: boolean | "indeterminate") {
    if (value === "indeterminate") {
      return
    }

    setLabels(produce(labels, (draft) => {
      draft[item] = value
    }))
  }

  const result = useMemo(() => {
    if (prefix) {
      return Object.entries(labels).filter(([_, value]) => value).map(([key, _]) => `${prefix}.${key}`)
    }
    return Object.entries(labels).filter(([_, value]) => value).map(([key, _]) => key)
  }, [labels, prefix])

  useEffect(() => {
    onResultChange(result)
  }, [result])

  return (
    <div>
      {candidate.map(item => (
        <div className="flex items-center space-x-2" key={item}>
          <Checkbox id={item} checked={labels[item]} onCheckedChange={value => handleChange(item, value)} />
          <label
            htmlFor={item}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {item}
          </label>
        </div>
      ))}
    </div>
  )
}

interface LabelProps {
  label: Array<string | Record<string, string[]>>
  onResultChange: (result: Array<string>) => void
}

export default function Label({ label, onResultChange }: LabelProps) {
  const outer = label.filter(item => typeof item === "string")
  const inner = (label.filter(item => typeof item === "object")).reduce((acc, obj) => {
    return { ...acc, ...obj }
  }, {})

  const [outerResult, setOuterResult] = useState<Array<string>>([])
  const [innerResult, setInnerResult] = useState<Record<string, Array<string>>>({})

  function handleInnerResultChange(key: string, result: Array<string>) {
    setInnerResult(produce(innerResult, (draft) => {
      draft[key] = result
    }))
  }

  useEffect(() => {
    const result = [...outerResult, ...Object.values(innerResult).flat()]
    onResultChange(result)
  }, [outerResult, innerResult])

  return (
    <div>
      <Candidate candidate={outer} onResultChange={setOuterResult} prefix={null} />
      {Object.entries(inner).map(([key, value]) => (
        <div key={key}>
          <h1>{key}</h1>
          <Candidate candidate={value} onResultChange={(result) => handleInnerResultChange(key, result)} prefix={key} />
        </div>
      ))}
    </div>
  )
}
