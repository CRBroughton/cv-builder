import { useCVMeta } from "./useCVMeta.js";
import { useSections } from "./useSections.js";
import { useExportPdf } from "./useExportPdf.js";
import type { UseCVMetaReturn } from "./useCVMeta.js";
import type { UseSectionsReturn } from "./useSections.js";
import type { UseExportPdfReturn } from "./useExportPdf.js";

export type UseCVEditorReturn = UseCVMetaReturn & UseSectionsReturn & UseExportPdfReturn;

export function useCVEditor(cvId: string | undefined): UseCVEditorReturn {
  const meta = useCVMeta(cvId);
  const sections = useSections(cvId);
  const exportPdf = useExportPdf();

  return { ...meta, ...sections, ...exportPdf };
}
