import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text.js";

const meta = {
  title: "Typography/Text",
  component: Text,
  tags: ["autodocs"],
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Text>The quick brown fox jumps over the lazy dog.</Text>,
};

export const Secondary: Story = {
  render: () => <Text variant="secondary">Secondary text — used for metadata and supporting copy.</Text>,
};

export const Small: Story = {
  render: () => <Text size="sm">Small text — captions, timestamps, fine print.</Text>,
};

export const SmallSecondary: Story = {
  render: () => (
    <Text size="sm" variant="secondary">
      Small secondary — e.g. "Created 15 Aug 2026"
    </Text>
  ),
};

export const Semibold: Story = {
  render: () => <Text weight="semibold">Semibold text — labels, card titles.</Text>,
};

export const Inline: Story = {
  render: () => (
    <Text>
      Paragraph with an <Text as="strong" weight="semibold">emphasised</Text> word inline.
    </Text>
  ),
};
