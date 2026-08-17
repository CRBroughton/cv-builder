import { createContext, useContext } from "react";
import type { UseCVEditorReturn } from "./useCVEditor.js";

export const CVEditorContext = createContext<UseCVEditorReturn | null>(null);

export function useCVEditorContext(): UseCVEditorReturn {
  const ctx = useContext(CVEditorContext);
  if (!ctx) throw new Error("useCVEditorContext must be used within CVEditorContext.Provider");
  return ctx;
}
