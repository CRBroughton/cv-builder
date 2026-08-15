import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "./Stack.js";

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--cv-color-green-100)",
        border: "1px solid var(--cv-color-line)",
        borderRadius: "var(--cv-radius-sm)",
        padding: "8px",
        textAlign: "center",
        fontSize: "12px",
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <Stack gap={2}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stack direction="row" gap={2} align="center">
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const Wrapped: Story = {
  render: () => (
    <Stack direction="row" gap={2} wrap>
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i}>Item {i + 1}</Box>
      ))}
    </Stack>
  ),
};
