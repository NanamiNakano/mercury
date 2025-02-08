import { useTrackedEditorStore } from "@/store/useEditorStore"
import { generateUserColor } from "@/utils/color"
import { produce } from "immer"
import Entry from "./entry"

export default function EntryList() {
  const editorStore = useTrackedEditorStore()
  editorStore.setActiveList(editorStore.history.reduce((acc, label) => {
    acc[label.record_id] = true
    return acc
  }, {} as Record<number, boolean>))

  function handleStateChange(recordId: number, active: boolean) {
    editorStore.setActiveList(produce(editorStore.activeList, (draft) => {
      draft[recordId] = active
    }))
  }

  return (
    <div>
      {editorStore.history.map((label) => {
        const color = generateUserColor(label.user_id, label.record_id)
        return (
          <Entry
            key={label.record_id}
            username={label.username}
            hslColor={color}
            onStateChange={active => handleStateChange(label.record_id, active)}
            onSelect={() => editorStore.setViewing(label)}
          />
        )
      })}
    </div>
  )
}
