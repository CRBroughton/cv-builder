import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  FieldError,
  FieldInput,
  Stack,
  Text,
} from "@cv-builder/components";
import { useCVEditorContext } from "./CVEditorContext.js";
import { SectionCard } from "./SectionCard.js";
import { AddSectionForm } from "./AddSectionForm.js";

export function CVEditor() {
  const navigate = useNavigate();
  const {
    cv,
    sections,
    isLoading,
    loadError,
    title,
    summary,
    isSaving,
    saveError,
    showAddSection,
    isExporting,
    exportError,
    setTitle,
    setSummary,
    setShowAddSection,
    handleSave,
    handleDeleteSection,
    handleUpdateSection,
    handleAddSection,
    handleExportPdf,
  } = useCVEditorContext();

  if (isLoading) {
    return (
      <Container>
        <Text variant="secondary">Loading…</Text>
      </Container>
    );
  }

  if (loadError || !cv) {
    return (
      <Container>
        <FieldError>{loadError ?? "CV not found."}</FieldError>
      </Container>
    );
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <Container>
      <Stack gap={4}>
        <Box>
          <Button onClick={() => navigate("/")}>← Back</Button>
        </Box>

        <form onSubmit={handleSave}>
          <Stack gap={3}>
            <FieldInput
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <FieldInput
              label="Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            {saveError && <FieldError>{saveError}</FieldError>}
            <Box>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </Box>
          </Stack>
        </form>

        <Stack gap={2}>
          <Stack direction="row" align="center" justify="space-between">
            <Text as="strong">Sections</Text>
            {!showAddSection && (
              <Button onClick={() => setShowAddSection(true)}>Add Section</Button>
            )}
          </Stack>

          {sortedSections.length === 0 && !showAddSection && (
            <Text variant="secondary">No sections yet.</Text>
          )}

          {sortedSections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onDelete={() => handleDeleteSection(section.id)}
              onSave={(content) => handleUpdateSection(section.id, content)}
            />
          ))}

          {showAddSection && (
            <AddSectionForm
              onAdd={handleAddSection}
              onCancel={() => setShowAddSection(false)}
            />
          )}
        </Stack>

        <Stack gap={1}>
          <Box>
            <Button onClick={() => handleExportPdf(cv.id, cv.title)} disabled={isExporting}>
              {isExporting ? "Exporting…" : "Export PDF"}
            </Button>
          </Box>
          {exportError && <FieldError>{exportError}</FieldError>}
        </Stack>
      </Stack>
    </Container>
  );
}
