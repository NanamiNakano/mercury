import { Checkbox } from "@/components/ui/checkbox"
import { produce } from "immer"
import { useEffect, useMemo, useState } from "react"

interface CandidateProps {
  candidate: Array<string>
  prefix: string | null
  onResultChange: (result: Array<string>) => void
}

function Candidate({ candidate, prefix, onResultChange }: CandidateProps) {
  const [labels, setLabels] = useState<Record<string, boolean>>(
    Object.fromEntries(candidate.map(item => [item, false])),
  )
  const [prefixSelected, setPrefixSelected] = useState<boolean>(false)

  function handleChange(item: string, value: boolean | "indeterminate") {
    if (value === "indeterminate") {
      return
    }

    setLabels(produce(labels, (draft) => {
      draft[item] = value
    }))
  }

  function handlePrefixChange(value: boolean | "indeterminate") {
    if (value === "indeterminate") {
      return
    }
    setPrefixSelected(value)
  }

  const result = useMemo(() => {
    if (prefix) {
      const memo = Object.entries(labels).filter(([_, value]) => value).map(([key, _]) => `${prefix}.${key}`)
      if (memo.length > 0) {
        return memo
      }
      if (prefixSelected) {
        return [prefix]
      }
      return []
    }

    return Object.entries(labels).filter(([_, value]) => value).map(([key, _]) => key)
  }, [labels, prefix, prefixSelected])

  useEffect(() => {
    onResultChange(result)
  }, [result])

  return (
    <div>
      { prefix && (
        <div className="flex items-center space-x-2">
          <Checkbox id={prefix} checked={prefixSelected} onCheckedChange={handlePrefixChange} />
          <label htmlFor={prefix} className="font-bold">{prefix}</label>
        </div>
      )}
      {(prefixSelected || !prefix) && (
        <div className="flex flex-col gap-2">
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
      )}
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
        <Candidate candidate={value} onResultChange={result => handleInnerResultChange(key, result)} prefix={key} key={key} />
      ))}
    </div>
  )
}
