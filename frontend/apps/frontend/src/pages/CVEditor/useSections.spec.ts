import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSections } from "./useSections.js";

vi.mock("@cv-builder/api", () => ({
  api: {
    sections: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { api } from "@cv-builder/api";

const mockList = vi.mocked(api.sections.list);
const mockCreate = vi.mocked(api.sections.create);
const mockUpdate = vi.mocked(api.sections.update);
const mockDelete = vi.mocked(api.sections.delete);

const ok = (value: unknown) => Promise.resolve({ isOk: () => true, isErr: () => false, value });
const err = () => Promise.resolve({ isOk: () => false, isErr: () => true, error: { status: 500, message: "error" } });

const makeSection = (id: string) => ({
  id,
  cv_id: "cv-1",
  section_type: "experience" as const,
  order: 0,
  content: { company: "Acme", role: "Dev", start_date: "", end_date: "", description: "" },
  created_at: "",
  updated_at: "",
});

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.clearAllMocks());

describe("useSections — initial load", () => {
  it("fetches and stores sections", async () => {
    const section = makeSection("s1");
    mockList.mockReturnValue(ok([section]) as never);

    const { result } = renderHook(() => useSections("cv-1"));

    await waitFor(() => expect(result.current.sections).toHaveLength(1));
    expect(result.current.sections[0]!.id).toBe("s1");
  });

  it("leaves sections empty when list fails", async () => {
    mockList.mockReturnValue(err() as never);

    const { result } = renderHook(() => useSections("cv-1"));

    await waitFor(() => expect(mockList).toHaveBeenCalled());
    expect(result.current.sections).toHaveLength(0);
  });
});

describe("useSections — handleDeleteSection", () => {
  it("removes section optimistically", async () => {
    const section = makeSection("s1");
    mockList.mockReturnValue(ok([section]) as never);
    mockDelete.mockReturnValue(ok(undefined) as never);

    const { result } = renderHook(() => useSections("cv-1"));
    await waitFor(() => expect(result.current.sections).toHaveLength(1));

    await act(async () => {
      await result.current.handleDeleteSection("s1");
    });

    expect(result.current.sections).toHaveLength(0);
  });

  it("restores sections when delete fails", async () => {
    const section = makeSection("s1");
    mockList.mockReturnValue(ok([section]) as never);
    mockDelete.mockReturnValue(err() as never);

    const { result } = renderHook(() => useSections("cv-1"));
    await waitFor(() => expect(result.current.sections).toHaveLength(1));

    await act(async () => {
      await result.current.handleDeleteSection("s1");
    });

    expect(result.current.sections).toHaveLength(1);
  });
});

describe("useSections — handleUpdateSection", () => {
  it("updates content in state and returns null on success", async () => {
    const section = makeSection("s1");
    mockList.mockReturnValue(ok([section]) as never);
    mockUpdate.mockReturnValue(ok(section) as never);

    const { result } = renderHook(() => useSections("cv-1"));
    await waitFor(() => expect(result.current.sections).toHaveLength(1));

    const newContent = { company: "NewCo", role: "Lead", start_date: "", end_date: "", description: "" };
    let ret: string | null;
    await act(async () => {
      ret = await result.current.handleUpdateSection("s1", newContent);
    });

    expect(ret!).toBeNull();
    expect((result.current.sections[0]!.content as Record<string, string>).company).toBe("NewCo");
  });

  it("returns error message on failure", async () => {
    const section = makeSection("s1");
    mockList.mockReturnValue(ok([section]) as never);
    mockUpdate.mockReturnValue(err() as never);

    const { result } = renderHook(() => useSections("cv-1"));
    await waitFor(() => expect(result.current.sections).toHaveLength(1));

    let ret: string | null;
    await act(async () => {
      ret = await result.current.handleUpdateSection("s1", {});
    });

    expect(ret!).toBe("Failed to save section.");
  });
});

describe("useSections — handleAddSection", () => {
  it("appends section and closes form on success", async () => {
    mockList.mockReturnValue(ok([]) as never);
    const newSection = makeSection("s2");
    mockCreate.mockReturnValue(ok(newSection) as never);

    const { result } = renderHook(() => useSections("cv-1"));
    await waitFor(() => expect(mockList).toHaveBeenCalled());

    act(() => result.current.setShowAddSection(true));

    let ret: string | null;
    await act(async () => {
      ret = await result.current.handleAddSection("experience", { company: "Acme" });
    });

    expect(ret!).toBeNull();
    expect(result.current.sections).toHaveLength(1);
    expect(result.current.showAddSection).toBe(false);
  });

  it("returns error message on failure", async () => {
    mockList.mockReturnValue(ok([]) as never);
    mockCreate.mockReturnValue(err() as never);

    const { result } = renderHook(() => useSections("cv-1"));
    await waitFor(() => expect(mockList).toHaveBeenCalled());

    let ret: string | null;
    await act(async () => {
      ret = await result.current.handleAddSection("skills", { items: "TS" });
    });

    expect(ret!).toBe("Failed to add section.");
  });
});
