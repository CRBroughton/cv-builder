import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AddSectionForm } from "./AddSectionForm.js";

const meta: Meta<typeof AddSectionForm> = {
  title: "Pages/CVEditor/AddSectionForm",
  component: AddSectionForm,
  args: {
    onAdd: fn().mockResolvedValue(null),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AddSectionForm>;

function onceReturns(mock: unknown, value: unknown) {
  (mock as ReturnType<typeof fn>).mockResolvedValueOnce(value);
}

export const Default: Story = {};

export const SubmitExperience: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText("Company"), "Acme Ltd");
    await userEvent.type(canvas.getByLabelText("Role"), "Senior Engineer");
    await userEvent.type(canvas.getByLabelText("Start date"), "Jan 2022");
    await userEvent.type(canvas.getByLabelText("End date"), "Present");
    await userEvent.type(canvas.getByLabelText("Description"), "Built things.");

    await userEvent.click(canvas.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(args.onAdd).toHaveBeenCalledWith("experience", {
        company: "Acme Ltd",
        role: "Senior Engineer",
        start_date: "Jan 2022",
        end_date: "Present",
        description: "Built things.",
      }),
    );
    await waitFor(() => expect(canvas.getByRole("button", { name: "Add" })).not.toBeDisabled());
  },
};

export const SubmitEducation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.selectOptions(canvas.getByLabelText("Section type"), "education");
    await userEvent.type(canvas.getByLabelText("Institution"), "University of Example");
    await userEvent.type(canvas.getByLabelText("Qualification"), "BSc Computer Science");
    await userEvent.type(canvas.getByLabelText("Start date"), "Sep 2018");
    await userEvent.type(canvas.getByLabelText("End date"), "Jun 2021");

    await userEvent.click(canvas.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(args.onAdd).toHaveBeenCalledWith("education", {
        institution: "University of Example",
        qualification: "BSc Computer Science",
        start_date: "Sep 2018",
        end_date: "Jun 2021",
      }),
    );
    await waitFor(() => expect(canvas.getByRole("button", { name: "Add" })).not.toBeDisabled());
  },
};

export const SubmitSkills: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.selectOptions(canvas.getByLabelText("Section type"), "skills");
    await userEvent.type(canvas.getByLabelText("Skills"), "TypeScript, React, Python");

    await userEvent.click(canvas.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(args.onAdd).toHaveBeenCalledWith("skills", {
        items: "TypeScript, React, Python",
      }),
    );
    await waitFor(() => expect(canvas.getByRole("button", { name: "Add" })).not.toBeDisabled());
  },
};

export const SubmitProjects: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.selectOptions(canvas.getByLabelText("Section type"), "projects");
    await userEvent.type(canvas.getByLabelText("Project name"), "CV Builder");
    await userEvent.type(canvas.getByLabelText("URL"), "https://github.com/example");
    await userEvent.type(canvas.getByLabelText("Description"), "A portfolio project.");

    await userEvent.click(canvas.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(args.onAdd).toHaveBeenCalledWith("projects", {
        name: "CV Builder",
        url: "https://github.com/example",
        description: "A portfolio project.",
      }),
    );
    await waitFor(() => expect(canvas.getByRole("button", { name: "Add" })).not.toBeDisabled());
  },
};

export const Cancel: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(args.onCancel).toHaveBeenCalledOnce());
  },
};

// ─── Unhappy paths ────────────────────────────────────────────────────────────

export const SubmitError: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    onceReturns(args.onAdd, "Failed to add section.");

    await userEvent.type(canvas.getByLabelText("Company"), "Acme Ltd");
    await userEvent.click(canvas.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(args.onAdd).toHaveBeenCalledOnce());
    await waitFor(() => expect(canvas.getByRole("alert")).toHaveTextContent("Failed to add section."));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Add" })).not.toBeDisabled());
  },
};

export const TypeSwitchResetsFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText("Company"), "Acme Ltd");
    await expect(canvas.getByLabelText("Company")).toHaveValue("Acme Ltd");

    await userEvent.selectOptions(canvas.getByLabelText("Section type"), "skills");

    await expect(canvas.queryByLabelText("Company")).not.toBeInTheDocument();
    await expect(canvas.getByLabelText("Skills")).toHaveValue("");
  },
};
