import { FieldInput, Grid } from "@cv-builder/components";
import type { SectionType } from "@cv-builder/api";

const spanTwo = { style: { gridColumn: "1 / -1" } };

export function SectionFields({
  type,
  content,
  onChange,
}: {
  type: SectionType;
  content: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  function field(key: string, label: string, placeholder?: string, span?: boolean) {
    return (
      <FieldInput
        key={key}
        label={label}
        value={content[key] ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(key, e.target.value)}
        {...(span ? { wrapperProps: spanTwo } : {})}
      />
    );
  }

  switch (type) {
    case "experience":
      return (
        <Grid cols={2} gap={2}>
          {field("company", "Company")}
          {field("role", "Role")}
          {field("start_date", "Start date", "e.g. Jan 2020")}
          {field("end_date", "End date", "e.g. Present")}
          {field("description", "Description", undefined, true)}
        </Grid>
      );
    case "education":
      return (
        <Grid cols={2} gap={2}>
          {field("institution", "Institution")}
          {field("qualification", "Qualification")}
          {field("start_date", "Start date")}
          {field("end_date", "End date")}
        </Grid>
      );
    case "skills":
      return (
        <Grid cols={2} gap={2}>
          {field("items", "Skills", "e.g. TypeScript, React, Python", true)}
        </Grid>
      );
    case "projects":
      return (
        <Grid cols={2} gap={2}>
          {field("name", "Project name")}
          {field("url", "URL")}
          {field("description", "Description", undefined, true)}
        </Grid>
      );
  }
}
