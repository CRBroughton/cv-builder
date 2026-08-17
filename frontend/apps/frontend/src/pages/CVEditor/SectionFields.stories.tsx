import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { SectionFields } from "./SectionFields.js";

const meta: Meta<typeof SectionFields> = {
  title: "Pages/CVEditor/SectionFields",
  component: SectionFields,
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SectionFields>;

export const Experience: Story = {
  args: {
    type: "experience",
    content: {
      company: "Acme Corp",
      role: "Senior Engineer",
      start_date: "Jan 2022",
      end_date: "Present",
      description: "Built things.",
    },
  },
};

export const ExperienceEmpty: Story = {
  args: {
    type: "experience",
    content: {},
  },
};

export const Education: Story = {
  args: {
    type: "education",
    content: {
      institution: "University of Example",
      qualification: "BSc Computer Science",
      start_date: "Sep 2018",
      end_date: "Jun 2021",
    },
  },
};

export const Skills: Story = {
  args: {
    type: "skills",
    content: {
      items: "TypeScript, React, Python",
    },
  },
};

export const Projects: Story = {
  args: {
    type: "projects",
    content: {
      name: "CV Builder",
      url: "https://github.com/example/cv-builder",
      description: "Full-stack CV authoring tool.",
    },
  },
};
