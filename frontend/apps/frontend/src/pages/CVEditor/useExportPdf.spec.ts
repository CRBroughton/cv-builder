import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useExportPdf } from "./useExportPdf.js";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  localStorage.setItem("cv_token", "test-token");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

function mockAnchorClick() {
  const clickSpy = vi.fn();
  const anchor = { href: "", download: "", click: clickSpy } as unknown as HTMLAnchorElement;
  const originalCreate = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag, ...args) => {
    if (tag === "a") return anchor;
    return originalCreate(tag, ...(args as unknown[]) as [ElementCreationOptions?]);
  });
  vi.spyOn(document.body, "appendChild").mockImplementation((el) => el);
  vi.spyOn(document.body, "removeChild").mockImplementation((el) => el);
  return { clickSpy, anchor };
}

describe("useExportPdf — handleExportPdf", () => {
  it("fetches with auth header and triggers download", async () => {
    const blob = new Blob(["pdf"], { type: "application/pdf" });
    mockFetch.mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) });

    const { result } = renderHook(() => useExportPdf());
    const { clickSpy } = mockAnchorClick();

    await act(async () => {
      await result.current.handleExportPdf("cv-1", "My CV.pdf");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/cvs/cv-1/export/pdf"),
      expect.objectContaining({ headers: { Authorization: "Bearer test-token" } }),
    );
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(result.current.exportError).toBeNull();
  });

  it("sets exportError when response is not ok", async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useExportPdf());

    await act(async () => {
      await result.current.handleExportPdf("cv-1", "My CV.pdf");
    });

    expect(result.current.exportError).toBe("Failed to export PDF.");
  });

  it("sets exportError when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useExportPdf());

    await act(async () => {
      await result.current.handleExportPdf("cv-1", "My CV.pdf");
    });

    expect(result.current.exportError).toBe("Failed to export PDF.");
  });

  it("sends no auth header when no token in localStorage", async () => {
    localStorage.removeItem("cv_token");
    const blob = new Blob(["pdf"]);
    mockFetch.mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) });

    const { result } = renderHook(() => useExportPdf());
    mockAnchorClick();

    await act(async () => {
      await result.current.handleExportPdf("cv-1", "My CV.pdf");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: {} }),
    );
  });
});
