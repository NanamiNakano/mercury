import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import Label from "./label"

function LabelWithState(args: any) {
  const [result, setResult] = useState<string[]>([])

  return (
    <div>
      <Label {...args} onResultChange={setResult} />
      <div className="mt-4">
        <h3>Selected Labels:</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  )
}

const meta: Meta<typeof Label> = {
  component: Label,
  render: LabelWithState,
}

export default meta
type Story = StoryObj<typeof Label>

export const Primary: Story = {
  args: {
    label: [
      "Questionable",
      "Benign",
      {
        Unwanted: [
          "Extrinsic",
          "Instrinsic",
        ],
      },
      {
        Unwanted1: [
          "Extrinsic",
          "Instrinsic",
        ],
      },
      {
        Unwanted2: [
          "Extrinsic",
          "Instrinsic",
        ],
      },
    ],
  },
}
