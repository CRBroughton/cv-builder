import type { Meta, StoryObj } from "@storybook/react";
import { SectionCard } from "./SectionCard.js";

const meta: Meta<typeof SectionCard> = {
  title: "Pages/CVEditor/SectionCard",
  component: SectionCard,
  args: {
    onDelete: () => {},
    onSave: () => Promise.resolve(null),
  },
};

export default meta;
type Story = StoryObj<typeof SectionCard>;

export const Experience: Story = {
  args: {
    section: {
      id: "s-1",
      cv_id: "cv-123",
      section_type: "experience",
      order: 0,
      content: { company: "Acme Ltd", role: "Senior Engineer", start_date: "Jan 2022", end_date: "Present", description: "Built things." },
      created_at: "",
      updated_at: "",
    },
  },
};

export const Education: Story = {
  args: {
    section: {
      id: "s-2",
      cv_id: "cv-123",
      section_type: "education",
      order: 1,
      content: { institution: "University of Example", qualification: "BSc Computer Science", start_date: "Sep 2018", end_date: "Jun 2021" },
      created_at: "",
      updated_at: "",
    },
  },
};

export const Skills: Story = {
  args: {
    section: {
      id: "s-3",
      cv_id: "cv-123",
      section_type: "skills",
      order: 2,
      content: { items: "TypeScript, React, Python, PostgreSQL" },
      created_at: "",
      updated_at: "",
    },
  },
};

export const Projects: Story = {
  args: {
    section: {
      id: "s-4",
      cv_id: "cv-123",
      section_type: "projects",
      order: 3,
      content: { name: "CV Builder", description: "Portfolio project.", url: "https://github.com/example/cv-builder" },
      created_at: "",
      updated_at: "",
    },
  },
};

export const SaveError: Story = {
  args: {
    ...Experience.args,
    onSave: () => Promise.resolve("Failed to save section."),
  },
};
