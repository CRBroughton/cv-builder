import type { Config } from "style-dictionary/types";
import StyleDictionary from "style-dictionary";

const config: Config = {
  source: ["src/tokens/*.json"],
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

const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();
