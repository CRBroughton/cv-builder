import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCVMeta } from "./useCVMeta.js";

vi.mock("@cv-builder/api", () => ({
  api: {
    cvs: {
      get: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { api } from "@cv-builder/api";

const mockGet = vi.mocked(api.cvs.get);
const mockUpdate = vi.mocked(api.cvs.update);

const ok = (value: unknown) => Promise.resolve({ isOk: () => true, isErr: () => false, value });
const err = () => Promise.resolve({ isOk: () => false, isErr: () => true, error: { status: 500, message: "error" } });

const CV = { id: "cv-1", title: "My CV", summary: "A summary", user_id: "u1", created_at: "", updated_at: "" };

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.clearAllMocks());

describe("useCVMeta — initial load", () => {
  it("fetches the CV and populates title and summary", async () => {
    mockGet.mockReturnValue(ok(CV) as never);

    const { result } = renderHook(() => useCVMeta("cv-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cv).toEqual(CV);
    expect(result.current.title).toBe("My CV");
    expect(result.current.summary).toBe("A summary");
    expect(result.current.loadError).toBeNull();
  });

  it("sets loadError when fetch fails", async () => {
    mockGet.mockReturnValue(err() as never);

    const { result } = renderHook(() => useCVMeta("cv-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.cv).toBeNull();
    expect(result.current.loadError).toBe("Failed to load CV.");
  });

  it("uses empty string for summary when CV has none", async () => {
    mockGet.mockReturnValue(ok({ ...CV, summary: null }) as never);

    const { result } = renderHook(() => useCVMeta("cv-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary).toBe("");
  });

  it("does not fetch when cvId is undefined", async () => {
    const { result } = renderHook(() => useCVMeta(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe("useCVMeta — handleSave", () => {
  it("updates cv state on success", async () => {
    const updated = { ...CV, title: "Updated" };
    mockGet.mockReturnValue(ok(CV) as never);
    mockUpdate.mockReturnValue(ok(updated) as never);

    const { result } = renderHook(() => useCVMeta("cv-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setTitle("Updated"));

    await act(async () => {
      await result.current.handleSave({ preventDefault: vi.fn() } as never);
    });

    expect(result.current.cv?.title).toBe("Updated");
    expect(result.current.saveError).toBeNull();
  });

  it("sets saveError on failure", async () => {
    mockGet.mockReturnValue(ok(CV) as never);
    mockUpdate.mockReturnValue(err() as never);

    const { result } = renderHook(() => useCVMeta("cv-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.handleSave({ preventDefault: vi.fn() } as never);
    });

    expect(result.current.saveError).toBe("Failed to save.");
    expect(result.current.cv).toEqual(CV);
  });
});
