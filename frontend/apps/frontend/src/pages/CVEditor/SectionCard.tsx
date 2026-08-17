import { useState } from "react";
import { Box, Button, Card, FieldError, Stack, Text } from "@cv-builder/components";
import type { Section, SectionType } from "@cv-builder/api";
import { SectionFields } from "./SectionFields.js";

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
};

export function sectionSummary(section: Section): string {
  const c = section.content as Record<string, string>;
  switch (section.section_type) {
    case "experience":
      return [c.role, c.company].filter(Boolean).join(" at ");
    case "education":
      return [c.qualification, c.institution].filter(Boolean).join(" — ");
    case "skills":
      return c.items ?? "";
    case "projects":
      return c.name ?? "";
  }
}

export function SectionCard({
  section,
  onDelete,
  onSave,
}: {
  section: Section;
  onDelete: () => void;
  onSave: (content: Record<string, string>) => Promise<string | null>;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState<Record<string, string>>(
    section.content as Record<string, string>,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    setContent(section.content as Record<string, string>);
    setError(null);
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const err = await onSave(content);
    if (err) {
      setError(err);
    } else {
      setEditing(false);
    }
    setSaving(false);
  }

  return (
    <Card>
      <Stack gap={2}>
        <Stack direction="row" align="center" justify="space-between">
          <Stack gap={1}>
            <Text as="span" size="sm" variant="secondary">
              {SECTION_TYPE_LABELS[section.section_type]}
            </Text>
            {!editing && (
              <Text as="strong" weight="semibold">
                {sectionSummary(section) || "—"}
              </Text>
            )}
          </Stack>
          <Stack direction="row" gap={2}>
            <Button onClick={editing ? handleCancel : () => setEditing(true)}>
              {editing ? "Cancel" : "Edit"}
            </Button>
            <Button onClick={onDelete}>Delete</Button>
          </Stack>
        </Stack>

        {editing && (
          <>
            <SectionFields
              type={section.section_type}
              content={content}
              onChange={(key, value) => setContent((prev) => ({ ...prev, [key]: value }))}
            />
            {error && <FieldError>{error}</FieldError>}
            <Box>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}
