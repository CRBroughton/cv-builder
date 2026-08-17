import { ResultAsync } from "neverthrow";
import { z } from "zod";
import {
  createApiClient,
  CVResponse,
  SectionCreate,
  SectionReorder,
  SectionResponse,
  SectionUpdate,
} from "./generated.js";

export type ApiError = {
  status: number;
  message: string;
};

export type CV = z.infer<typeof CVResponse>;
export type Section = z.infer<typeof SectionResponse>;
export type { SectionType } from "./generated.js";
type SectionCreateInput = z.infer<typeof SectionCreate>;
type SectionUpdateInput = z.infer<typeof SectionUpdate>;
type SectionReorderInput = z.infer<typeof SectionReorder>;
type CVCreate = { title: string; summary?: string };
type CVUpdate = { title?: string; summary?: string };

function toApiError(e: unknown): ApiError {
  if (typeof e === "object" && e !== null && "status" in e && "message" in e) {
    return e as ApiError;
  }
  return { status: 0, message: String(e) };
}

const baseURL = (
  import.meta as unknown as { env: Record<string, string> }
).env["VITE_API_BASE_URL"] ?? "http://localhost:8000";

const zodios = createApiClient(baseURL);

zodios.use({
  name: "auth",
  request: async (_, config) => {
    const token = localStorage.getItem("cv_token");
    if (token) {
      (config as Record<string, unknown>)["headers"] = {
        ...(config.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
});

export const api = {
  auth: {
    register: (body: { email: string; password: string }) =>
      ResultAsync.fromPromise(
        zodios.register_auth_register_post(body),
        toApiError,
      ),
    login: (username: string, password: string) =>
      ResultAsync.fromPromise(
        zodios.login_auth_login_post({ username, password }),
        toApiError,
      ),
    me: () => ResultAsync.fromPromise(zodios.me_auth_me_get(), toApiError),
  },
  cvs: {
    list: (): ResultAsync<CV[], ApiError> =>
      ResultAsync.fromPromise(zodios.get_cvs_get(), toApiError),
    create: (body: CVCreate): ResultAsync<CV, ApiError> =>
      ResultAsync.fromPromise(zodios.create_cvs_post(body), toApiError),
    get: (cv_id: string): ResultAsync<CV, ApiError> =>
      ResultAsync.fromPromise(
        zodios.get_cv_cvs__cv_id__get({ params: { cv_id } }),
        toApiError,
      ),
    update: (cv_id: string, body: CVUpdate): ResultAsync<CV, ApiError> =>
      ResultAsync.fromPromise(
        zodios.patch_cvs__cv_id__patch(body, { params: { cv_id } }),
        toApiError,
      ),
    delete: (cv_id: string): ResultAsync<void, ApiError> =>
      ResultAsync.fromPromise(
        zodios.delete_cvs__cv_id__delete(undefined, { params: { cv_id } }),
        toApiError,
      ),
  },
  sections: {
    list: (cv_id: string): ResultAsync<Section[], ApiError> =>
      ResultAsync.fromPromise(
        zodios.get_cvs__cv_id__sections_get({ params: { cv_id } }),
        toApiError,
      ),
    create: (
      cv_id: string,
      body: SectionCreateInput,
    ): ResultAsync<Section, ApiError> =>
      ResultAsync.fromPromise(
        zodios.create_cvs__cv_id__sections_post(body, { params: { cv_id } }),
        toApiError,
      ),
    update: (
      cv_id: string,
      section_id: string,
      body: SectionUpdateInput,
    ): ResultAsync<Section, ApiError> =>
      ResultAsync.fromPromise(
        zodios.patch_cvs__cv_id__sections__section_id__patch(body, {
          params: { cv_id, section_id },
        }),
        toApiError,
      ),
    delete: (cv_id: string, section_id: string): ResultAsync<void, ApiError> =>
      ResultAsync.fromPromise(
        zodios.delete_cvs__cv_id__sections__section_id__delete(undefined, {
          params: { cv_id, section_id },
        }),
        toApiError,
      ),
    reorder: (
      cv_id: string,
      body: SectionReorderInput,
    ): ResultAsync<void, ApiError> =>
      ResultAsync.fromPromise(
        zodios.reorder_sections_cvs__cv_id__sections_reorder_patch(body, {
          params: { cv_id },
        }),
        toApiError,
      ),
  },
};
