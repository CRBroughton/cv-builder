import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import type { TestRunnerConfig } from "@storybook/test-runner";
import { getAxeResults, injectAxe } from "axe-playwright";

const wcag22aa = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export const REPORT_DIR = "a11y-report";
export const VIOLATIONS_FILE = `${REPORT_DIR}/.violations.ndjson`;

const config: TestRunnerConfig = {
  setup() {
    mkdirSync(REPORT_DIR, { recursive: true });
    writeFileSync(VIOLATIONS_FILE, "");
  },
  async postVisit(page) {
    await injectAxe(page);
    const results = await getAxeResults(page, null, {
      runOnly: { type: "tag", values: wcag22aa },
    });
    appendFileSync(VIOLATIONS_FILE, JSON.stringify(results) + "\n");
    if (results.violations.length > 0) {
      throw new Error(`${results.violations.length} accessibility violation(s) found`);
    }
  },
};

export default config;
