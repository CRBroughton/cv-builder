import type { Meta, StoryObj } from "@storybook/react";
import { FieldInput } from "./FieldInput.js";

const meta: Meta<typeof FieldInput> = {
  title: "Forms/FieldInput",
  component: FieldInput,
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    type: "email",
  },
};

export const WithError: Story = {
  args: {
    label: "Email address",
    defaultValue: "not-an-email",
    error: "Enter a valid email address.",
  },
};

export const Disabled: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    disabled: true,
  },
};
