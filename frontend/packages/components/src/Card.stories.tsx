import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card.js";

const meta = {
  title: "Layout/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <p style={{ margin: 0 }}>A basic card with some content inside.</p>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive onClick={() => alert("Card clicked")}>
      <p style={{ margin: 0 }}>Hover me — I have a shadow on hover and a pointer cursor.</p>
    </Card>
  ),
};

export const CustomStyle: Story = {
  render: () => (
    <Card style={{ maxWidth: 320 }}>
      <p style={{ margin: 0 }}>Cards accept any inline style override via the style prop.</p>
    </Card>
  ),
};
