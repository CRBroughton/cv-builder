import type { Config } from "style-dictionary/types";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import StyleDictionary from "style-dictionary";

// ── Light tokens ──────────────────────────────────────────────────────────────

const lightConfig: Config = {
  source: ["src/tokens/primitive.json", "src/tokens/semantic.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "cv",
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: { selector: ":root", outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [
        {
          destination: "tokens.cjs",
          format: "javascript/module-flat",
        },
      ],
    },
  },
};

const lightSd = new StyleDictionary(lightConfig);
await lightSd.buildAllPlatforms();

// ── Dark tokens ───────────────────────────────────────────────────────────────

const darkConfig: Config = {
  source: ["src/tokens/primitive.json", "src/tokens/dark.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "cv",
      buildPath: "dist/",
      files: [
        {
          destination: "_dark-raw.css",
          format: "css/variables",
          options: { selector: ":root", outputReferences: false },
        },
      ],
    },
  },
};

const darkSd = new StyleDictionary(darkConfig);
await darkSd.buildAllPlatforms();

// Post-process: wrap in both the media query and the data-theme selector blocks
const raw = readFileSync("dist/_dark-raw.css", "utf-8");
const match = raw.match(/:root\s*\{([\s\S]+?)\}/);

if (!match) throw new Error("Could not parse dark token output");

const vars = match[1];

writeFileSync(
  "dist/dark.css",
  [
    `@media (prefers-color-scheme: dark) {`,
    `  :root:not([data-theme="light"]) {`,
    vars.trimEnd(),
    `  }`,
    `}`,
    ``,
    `:root[data-theme="dark"] {`,
    vars.trimEnd(),
    `}`,
  ].join("\n"),
);

unlinkSync("dist/_dark-raw.css");
