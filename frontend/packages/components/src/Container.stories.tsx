import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "./Container.js";

const meta = {
  title: "Layout/Container",
  component: Container,
  tags: ["autodocs"],
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        background: "var(--cv-color-accent-soft)",
        border: "1px solid var(--cv-color-line)",
        borderRadius: "var(--cv-radius-sm)",
        padding: "var(--cv-space-4)",
        textAlign: "center",
        fontSize: "var(--cv-font-size-sm)",
      }}
    >
      {label}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Container>
      <Placeholder label="Default — max-width 860px, centered, 2rem padding" />
    </Container>
  ),
};

export const Narrow: Story = {
  render: () => (
    <Container maxWidth={400}>
      <Placeholder label="Narrow — max-width 400px (auth pages)" />
    </Container>
  ),
};
