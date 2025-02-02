import type { Meta, StoryObj } from "@storybook/react"
import Actions from "./actions"

const meta: Meta<typeof Actions> = {
  component: Actions,
  argTypes: {
    type: {
      options: ["editing", "viewing"],
      control: { type: "radio" },
    },
  },
}

export default meta
type Story = StoryObj<typeof Actions>

export const EditingMode: Story = {
  args: {
    type: "editing",
    onSubmit: () => console.log("Submit clicked"),
    onDelete: () => console.log("Delete clicked"),
    onReset: () => console.log("Reset clicked"),
  },
}

export const ViewingMode: Story = {
  args: {
    type: "viewing",
    onReset: () => console.log("Reset clicked"),
  },
}
