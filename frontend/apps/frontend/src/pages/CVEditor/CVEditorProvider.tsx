import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { CVEditorContext } from "./CVEditorContext.js";
import { useCVEditor } from "./useCVEditor.js";

export function CVEditorProvider({ children }: { children: ReactNode }) {
  const { id: cvId } = useParams<{ id: string }>();
  const value = useCVEditor(cvId);
  return <CVEditorContext.Provider value={value}>{children}</CVEditorContext.Provider>;
}
