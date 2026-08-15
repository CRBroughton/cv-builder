import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@cv-builder/storybook-addon-a11y-panel",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
