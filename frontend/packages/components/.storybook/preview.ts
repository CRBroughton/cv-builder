import "@cv-builder/tokens/dist/tokens.css";
import type { Preview } from "@storybook/react";

const wcag22aa = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const preview: Preview = {
  parameters: {
    a11y: {
      options: {
        runOnly: {
          type: "tag",
          values: wcag22aa,
        },
      },
    },
  },
};

export default preview;
