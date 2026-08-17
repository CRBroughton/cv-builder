import { useEffect, useState } from "react";
import { api, type Section, type SectionType } from "@cv-builder/api";

export interface UseSectionsReturn {
  sections: Section[];
  showAddSection: boolean;
  setShowAddSection: (v: boolean) => void;
  handleDeleteSection: (sectionId: string) => Promise<void>;
  handleUpdateSection: (sectionId: string, content: Record<string, string>) => Promise<string | null>;
  handleAddSection: (type: SectionType, content: Record<string, string>) => Promise<string | null>;
}

export function useSections(cvId: string | undefined): UseSectionsReturn {
  const [sections, setSections] = useState<Section[]>([]);
  const [showAddSection, setShowAddSection] = useState(false);

  useEffect(() => {
    if (!cvId) return;
    api.sections.list(cvId).then((result) => {
      if (result.isOk()) {
        setSections(result.value as unknown as Section[]);
      }
    });
  }, [cvId]);

  async function handleDeleteSection(sectionId: string) {
    if (!cvId) return;
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    const result = await api.sections.delete(cvId, sectionId);
    if (result.isErr()) {
      const restored = await api.sections.list(cvId);
      if (restored.isOk()) setSections(restored.value as unknown as Section[]);
    }
  }

  async function handleUpdateSection(
    sectionId: string,
    content: Record<string, string>,
  ): Promise<string | null> {
    if (!cvId) return "No CV loaded.";
    const result = await api.sections.update(cvId, sectionId, { content });
    if (result.isOk()) {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, content } : s)),
      );
      return null;
    }
    return "Failed to save section.";
  }

  async function handleAddSection(
    type: SectionType,
    content: Record<string, string>,
  ): Promise<string | null> {
    if (!cvId) return "No CV loaded.";
    const result = await api.sections.create(cvId, {
      section_type: type,
      order: sections.length,
      content,
    });
    if (result.isOk()) {
      setSections((prev) => [...prev, result.value as unknown as Section]);
      setShowAddSection(false);
      return null;
    }
    return "Failed to add section.";
  }

  return {
    sections,
    showAddSection,
    setShowAddSection,
    handleDeleteSection,
    handleUpdateSection,
    handleAddSection,
  };
}
