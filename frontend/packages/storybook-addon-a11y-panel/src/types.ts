import type { AxeResults } from "axe-core";

export interface StoryResult {
  storyId: string;
  storyName: string;
  componentTitle: string;
  light: AxeResults;
  dark: AxeResults;
}
