import { useState } from "react";

const API_BASE =
  (import.meta as unknown as { env: Record<string, string> }).env["VITE_API_BASE_URL"] ??
  "http://localhost:8000";

export interface UseExportPdfReturn {
  isExporting: boolean;
  exportError: string | null;
  handleExportPdf: (cvId: string, filename: string) => Promise<void>;
}

export function useExportPdf(): UseExportPdfReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExportPdf(cvId: string, filename: string) {
    setIsExporting(true);
    setExportError(null);
    try {
      const token = localStorage.getItem("cv_token");
      const res = await fetch(`${API_BASE}/cvs/${cvId}/export/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Failed to export PDF.");
    }
    setIsExporting(false);
  }

  return { isExporting, exportError, handleExportPdf };
}
