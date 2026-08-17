import { useEffect, useState } from "react";
import { api, type CV } from "@cv-builder/api";

export interface UseCVMetaReturn {
  cv: CV | null;
  isLoading: boolean;
  loadError: string | null;
  title: string;
  summary: string;
  isSaving: boolean;
  saveError: string | null;
  setTitle: (v: string) => void;
  setSummary: (v: string) => void;
  handleSave: (e: React.SyntheticEvent) => Promise<void>;
}

export function useCVMeta(cvId: string | undefined): UseCVMetaReturn {
  const [cv, setCv] = useState<CV | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!cvId) return;
    api.cvs.get(cvId).then((result) => {
      if (result.isOk()) {
        setCv(result.value);
        setTitle(result.value.title);
        setSummary(result.value.summary ?? "");
      } else {
        setLoadError("Failed to load CV.");
      }
      setIsLoading(false);
    });
  }, [cvId]);

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!cvId) return;
    setIsSaving(true);
    setSaveError(null);
    const result = await api.cvs.update(cvId, {
      title,
      ...(summary ? { summary } : {}),
    });
    if (result.isOk()) {
      setCv(result.value);
    } else {
      setSaveError("Failed to save.");
    }
    setIsSaving(false);
  }

  return { cv, isLoading, loadError, title, summary, isSaving, saveError, setTitle, setSummary, handleSave };
}
