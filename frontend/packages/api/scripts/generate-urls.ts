import { readFileSync, writeFileSync } from "node:fs";

// Export types and consts in generated.ts
let generated = readFileSync("src/generated.ts", "utf-8");
generated = "// @ts-nocheck\n" + generated
  .replace(/^type /gm, "export type ")
  .replace(/^const /gm, "export const ")
  .replace(/^export const api = new Zodios.*;\n/m, "");
writeFileSync("src/generated.ts", generated);
console.log("Cleaned up src/generated.ts");
