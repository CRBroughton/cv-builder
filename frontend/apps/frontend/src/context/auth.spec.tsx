import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth.js";

vi.mock("@cv-builder/api", () => ({
  api: {
    auth: {
      me: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
    },
  },
}));

import { api } from "@cv-builder/api";

const mockMe = vi.mocked(api.auth.me);
const mockLogin = vi.mocked(api.auth.login);
const mockRegister = vi.mocked(api.auth.register);

// Helpers that mimic the neverthrow Result shape returned by the real api
const ok = (value: unknown) => Promise.resolve({ isOk: () => true, value });
const err = (message: string) =>
  Promise.resolve({ isOk: () => false, error: { status: 401, message } });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe("AuthProvider — initial load", () => {
  it("sets isLoading false without calling me() when no token", async () => {
    const { result } = renderHook<ReturnType<typeof useAuth>, void>(useAuth, { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(mockMe).not.toHaveBeenCalled();
  });

  it("sets user when stored token is valid", async () => {
    localStorage.setItem("cv_token", "good-token");
    mockMe.mockReturnValue(ok({ id: "u1", email: "a@b.com" }) as never);

    const { result } = renderHook<ReturnType<typeof useAuth>, void>(useAuth, { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toEqual({ id: "u1", email: "a@b.com" });
  });

  it("clears token and leaves user null when me() fails", async () => {
    localStorage.setItem("cv_token", "bad-token");
    mockMe.mockReturnValue(err("Unauthorized") as never);

    const { result } = renderHook<ReturnType<typeof useAuth>, void>(useAuth, { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("cv_token")).toBeNull();
  });
});

describe("AuthProvider — login()", () => {
  it("stores token, sets user, and returns null on success", async () => {
    mockMe.mockReturnValue(ok({ id: "u2", email: "c@d.com" }) as never);
    mockLogin.mockReturnValue(ok({ access_token: "tok-abc" }) as never);

    const { result } = renderHook<ReturnType<typeof useAuth>, void>(useAuth, { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let ret: string | null | undefined;
    await act(async () => {
      ret = await result.current.login("c@d.com", "pass");
    });

    expect(ret).toBeNull();
    expect(localStorage.getItem("cv_token")).toBe("tok-abc");
    expect(result.current.user).toEqual({ id: "u2", email: "c@d.com" });
  });

  it("returns error message and leaves user null on failure", async () => {
    mockLogin.mockReturnValue(err("Invalid credentials") as never);

    const { result } = renderHook<ReturnType<typeof useAuth>, void>(useAuth, { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let ret: string | null | undefined;
    await act(async () => {
      ret = await result.current.login("x@y.com", "wrong");
    });

    expect(ret).toBe("Invalid credentials");
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("cv_token")).toBeNull();
  });
});

describe("AuthProvider — register()", () => {
  it("calls login after successful registration and returns null", async () => {
    mockRegister.mockReturnValue(ok({ id: "u3" }) as never);
    mockLogin.mockReturnValue(ok({ access_token: "tok-reg" }) as never);
    mockMe.mockReturnValue(ok({ id: "u3", email: "e@f.com" }) as never);

    const { result } = renderHook<ReturnType<typeof useAuth>, void>(useAuth, { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let ret: string | null | undefined;
    await act(async () => {
      ret = await result.current.register("e@f.com", "pass");
    });

    expect(ret).toBeNull();
    expect(mockLogin).toHaveBeenCalledWith("e@f.com", "pass");
    expect(result.current.user).toEqual({ id: "u3", email: "e@f.com" });
  });

  it("returns error message on failure without calling login", async () => {
    mockRegister.mockReturnValue(err("Email already taken") as never);

    const { result } = renderHook<ReturnType<typeof useAuth>, void>(useAuth, { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let ret: string | null | undefined;
    await act(async () => {
      ret = await result.current.register("taken@x.com", "pass");
    });

    expect(ret).toBe("Email already taken");
    expect(mockLogin).not.toHaveBeenCalled();
  });
});

describe("AuthProvider — logout()", () => {
  it("clears token and sets user to null", async () => {
    localStorage.setItem("cv_token", "live-token");
    mockMe.mockReturnValue(ok({ id: "u1", email: "a@b.com" }) as never);

    const { result } = renderHook<ReturnType<typeof useAuth>, void>(useAuth, { wrapper });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("cv_token")).toBeNull();
  });
});

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    expect(() => renderHook<ReturnType<typeof useAuth>, void>(useAuth)).toThrow(
      "useAuth must be used within AuthProvider",
    );
  });
});
