import { Checkbox } from "@/components/ui/checkbox"
import { Window } from "@/components/ui/window"
import { useTrackedLabelsStore } from "@/store/useLabelsStore"
import { produce } from "immer"
import { useEffect, useMemo, useState } from "react"

interface CandidateProps {
  candidate: Array<string>
  prefix: string | null
  initialData: Array<string>
  onResultChange: (labelData: Array<string>) => void
}

function Candidate({ candidate, prefix, initialData, onResultChange }: CandidateProps) {
  const [labels, setLabels] = useState(() =>
    Object.fromEntries(candidate.map(item => [item, false])),
  )
  const [prefixSelected, setPrefixSelected] = useState(false)

  useEffect(() => {
    const newLabels = { ...labels }
    let hasPrefix = false

    initialData.forEach((item) => {
      if (item.includes(".") && prefix) {
        const [_prefix, _candidate] = item.split(".")
        if (_prefix === prefix) {
          newLabels[_candidate] = true
          hasPrefix = true
        }
      } else if (item === prefix) {
        hasPrefix = true
      }
    })

    setLabels(newLabels)
    setPrefixSelected(hasPrefix)
  }, [])

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
  }, [result, onResultChange])

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
  initialData: Array<string>
  onResultChange: (labelData: Array<string>) => void
}

export default function Label({ initialData, onResultChange }: LabelProps) {
  const labelsStore = useTrackedLabelsStore()
  const outerCandidate = labelsStore.candidates.filter(item => typeof item === "string")
  const innerCandidate = (labelsStore.candidates.filter(item => typeof item === "object")).reduce((acc, obj) => {
    return { ...acc, ...obj }
  }, {})

  const [outerResult, setOuterResult] = useState(() =>
    initialData.filter(item => outerCandidate.includes(item)),
  )
  const [innerResult, setInnerResult] = useState(() =>
    Object.entries(innerCandidate).reduce((acc, [prefix]) => ({
      ...acc,
      [prefix]: initialData.filter(item => item.startsWith(`${prefix}.`)),
    }), {} as Record<string, string[]>),
  )

  useEffect(() => {
    const result = [...outerResult, ...Object.values(innerResult).flat()]
    onResultChange(result)
  }, [outerResult, innerResult, onResultChange])

  return (
    <Window name="Label">
      <div>
        <Candidate candidate={outerCandidate} initialData={outerResult} setLabelData={setOuterResult} prefix={null} />
        {Object.entries(innerCandidate).map(([key, value]) => (
          <Candidate
            candidate={value}
            initialData={innerResult[key]}
            setLabelData={result => setInnerResult(produce(innerResult, (draft) => {
              draft[key] = result
            }))}
            prefix={key}
            key={key}
          />
        ))}
      </div>
    </Window>
  )
}
