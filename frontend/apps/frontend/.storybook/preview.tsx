import "@cv-builder/tokens/dist/tokens.css";
import "@cv-builder/tokens/dist/dark.css";
import "./preview.css";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { withA11yPanel } from "@cv-builder/storybook-addon-a11y-panel/preview";
import { MemoryRouter } from "react-router-dom";
import type { Preview, ReactRenderer } from "@storybook/react";

const wcag22aa = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const preview: Preview = {
  decorators: [
    withA11yPanel,
    withThemeByDataAttribute<ReactRenderer>({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
    (Story) => (
      <MemoryRouter initialEntries={["/cv-123"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    a11y: {
      options: {
        runOnly: { type: "tag", values: wcag22aa },
      },
    },
  },
};

export default preview;
