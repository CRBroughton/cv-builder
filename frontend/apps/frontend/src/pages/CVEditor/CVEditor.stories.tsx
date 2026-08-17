import type { Meta, StoryObj } from "@storybook/react";
import { CVEditorContext } from "./CVEditorContext.js";
import { CVEditor } from "./index.js";
import type { UseCVEditorReturn } from "./useCVEditor.js";

const CV = {
  id: "cv-123",
  title: "Software Engineer",
  summary: "Experienced full-stack developer.",
  user_id: "u-1",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const SECTIONS = [
  {
    id: "s-1",
    cv_id: "cv-123",
    section_type: "experience" as const,
    order: 0,
    content: { company: "Acme Ltd", role: "Engineer", start_date: "Jan 2022", end_date: "Present", description: "Built things." },
    created_at: "",
    updated_at: "",
  },
  {
    id: "s-2",
    cv_id: "cv-123",
    section_type: "skills" as const,
    order: 1,
    content: { items: "TypeScript, React, Python" },
    created_at: "",
    updated_at: "",
  },
];

function noop() {}
function noopAsync() { return Promise.resolve(null); }

function baseValue(overrides: Partial<UseCVEditorReturn> = {}): UseCVEditorReturn {
  return {
    cv: CV,
    sections: SECTIONS,
    isLoading: false,
    loadError: null,
    title: CV.title,
    summary: CV.summary,
    isSaving: false,
    saveError: null,
    showAddSection: false,
    isExporting: false,
    exportError: null,
    setTitle: noop,
    setSummary: noop,
    setShowAddSection: noop,
    handleSave: noopAsync as never,
    handleDeleteSection: noopAsync as never,
    handleUpdateSection: noopAsync as never,
    handleAddSection: noopAsync as never,
    handleExportPdf: noopAsync as never,
    ...overrides,
  };
}

const meta: Meta<typeof CVEditor> = {
  title: "Pages/CVEditor",
  component: CVEditor,
};

export default meta;
type Story = StoryObj<typeof CVEditor>;

function wrap(value: UseCVEditorReturn): NonNullable<Story["decorators"]> {
  return [
    (Story) => (
      <CVEditorContext.Provider value={value}>
        <Story />
      </CVEditorContext.Provider>
    ),
  ];
}

export const Loaded: Story = {
  decorators: wrap(baseValue()),
};

export const LoadedEmpty: Story = {
  decorators: wrap(baseValue({ sections: [] })),
};

export const Loading: Story = {
  decorators: wrap(baseValue({ isLoading: true, cv: null })),
};

export const LoadError: Story = {
  decorators: wrap(baseValue({ isLoading: false, loadError: "Failed to load CV.", cv: null })),
};

export const Saving: Story = {
  decorators: wrap(baseValue({ isSaving: true })),
};

export const SaveError: Story = {
  decorators: wrap(baseValue({ saveError: "Failed to save." })),
};

export const AddingSections: Story = {
  decorators: wrap(baseValue({ showAddSection: true })),
};

export const Exporting: Story = {
  decorators: wrap(baseValue({ isExporting: true })),
};

export const ExportError: Story = {
  decorators: wrap(baseValue({ exportError: "Failed to export PDF." })),
};
