import { useState } from "react";
import { Button, Card, FieldError, FieldLabel, Stack } from "@cv-builder/components";
import type { SectionType } from "@cv-builder/api";
import { SectionFields } from "./SectionFields.js";
import { SECTION_TYPE_LABELS } from "./SectionCard.js";

function defaultContent(type: SectionType): Record<string, string> {
  switch (type) {
    case "experience":
      return { company: "", role: "", start_date: "", end_date: "", description: "" };
    case "education":
      return { institution: "", qualification: "", start_date: "", end_date: "" };
    case "skills":
      return { items: "" };
    case "projects":
      return { name: "", description: "", url: "" };
  }
}

export function AddSectionForm({
  onAdd,
  onCancel,
}: {
  onAdd: (type: SectionType, content: Record<string, string>) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [type, setType] = useState<SectionType>("experience");
  const [content, setContent] = useState<Record<string, string>>(defaultContent("experience"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(newType: SectionType) {
    setType(newType);
    setContent(defaultContent(newType));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onAdd(type, content);
    if (err) {
      setError(err);
    }
    setSaving(false);
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <Stack gap={1}>
            <FieldLabel htmlFor="section-type-select">Section type</FieldLabel>
            <select
              id="section-type-select"
              className="cv-input"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as SectionType)}
            >
              {(["experience", "education", "skills", "projects"] as SectionType[]).map((t) => (
                <option key={t} value={t}>
                  {SECTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Stack>

          <SectionFields
            type={type}
            content={content}
            onChange={(key, value) => setContent((prev) => ({ ...prev, [key]: value }))}
          />

          {error && <FieldError>{error}</FieldError>}

          <Stack direction="row" gap={2}>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add"}
            </Button>
            <Button type="button" onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
