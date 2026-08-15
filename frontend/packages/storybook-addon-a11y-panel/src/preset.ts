import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const dir = dirname(fileURLToPath(import.meta.url));

export function managerEntries(entry: string[] = []): string[] {
  return [...entry, resolve(dir, "manager.tsx")];
}
