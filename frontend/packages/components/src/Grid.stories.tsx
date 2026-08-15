import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid } from "./Grid.js";

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
  title: "Layout/Grid",
  component: Grid,
  tags: ["autodocs"],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoColumns: Story = {
  render: () => (
    <Grid cols={2} gap={2}>
      <Box>1</Box>
      <Box>2</Box>
      <Box>3</Box>
      <Box>4</Box>
    </Grid>
  ),
};

export const ThreeColumns: Story = {
  render: () => (
    <Grid cols={3} gap={3}>
      <Box>1</Box>
      <Box>2</Box>
      <Box>3</Box>
      <Box>4</Box>
      <Box>5</Box>
      <Box>6</Box>
    </Grid>
  ),
};

export const CustomTemplate: Story = {
  render: () => (
    <Grid cols="1fr 2fr" gap={2}>
      <Box>Sidebar</Box>
      <Box>Main</Box>
    </Grid>
  ),
};
