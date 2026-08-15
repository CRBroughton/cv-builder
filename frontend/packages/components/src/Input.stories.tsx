import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input.js";

const meta: Meta<typeof Input> = {
  component: Input,
  title: "Components/Input",
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    id: "story-input",
    type: "email",
    placeholder: "you@example.com",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "you@example.com",
  },
};
