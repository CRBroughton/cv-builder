import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "./Box.js";
import { Stack } from "./Stack.js";

const meta = {
  title: "Layout/Box",
  component: Box,
  tags: ["autodocs"],
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        background: "var(--cv-color-accent-soft)",
        border: "1px solid var(--cv-color-line)",
        borderRadius: "var(--cv-radius-sm)",
        padding: "var(--cv-space-2)",
        textAlign: "center",
        fontSize: "var(--cv-font-size-sm)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Box>
      <Placeholder label="Box — unstyled div wrapper" />
    </Box>
  ),
};

export const Grow: Story = {
  render: () => (
    <Stack direction="row" gap={2}>
      <Box grow>
        <Placeholder label="Box grow — takes remaining space" />
      </Box>
      <Placeholder label="Fixed" />
    </Stack>
  ),
};
