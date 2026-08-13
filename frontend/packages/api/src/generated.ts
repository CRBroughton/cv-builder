import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

export type HTTPValidationError = Partial<{
  detail: Array<ValidationError>;
}>;
export type ValidationError = {
  loc: Array<(string | number) | Array<string | number>>;
  msg: string;
  type: string;
  input?: unknown | undefined;
  ctx?: {} | undefined;
};
export type SectionCreate = {
  section_type: SectionType;
  order: number;
  content: {};
};
export type SectionType = "experience" | "education" | "skills" | "projects";
export type SectionReorder = {
  sections: Array<SectionReorderItem>;
};
export type SectionReorderItem = {
  id: string;
  order: number;
};
export type SectionResponse = {
  id: string;
  cv_id: string;
  section_type: SectionType;
  order: number;
  content: {};
  created_at: string;
  updated_at: string;
};
export type SectionUpdate = Partial<{
  section_type: (SectionType | null) | Array<SectionType | null>;
  order: (number | null) | Array<number | null>;
  content: ({} | null) | Array<{} | null>;
}>;

export const UserCreate = z
  .object({ email: z.string().email(), password: z.string() })
  .passthrough();
export const UserResponse = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export const ValidationError: z.ZodType<ValidationError> = z
  .object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
    input: z.unknown().optional(),
    ctx: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
export const HTTPValidationError: z.ZodType<HTTPValidationError> = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();
export const Body_login_auth_login_post = z
  .object({
    grant_type: z.union([z.string(), z.null()]).optional(),
    username: z.string(),
    password: z.string(),
    scope: z.string().optional().default(""),
    client_id: z.union([z.string(), z.null()]).optional(),
    client_secret: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
export const CVResponse = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    title: z.string(),
    summary: z.union([z.string(), z.null()]),
  })
  .passthrough();
export const CVCreate = z
  .object({
    title: z.string(),
    summary: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
export const CVUpdate = z
  .object({
    title: z.union([z.string(), z.null()]),
    summary: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
export const SectionType = z.enum(["experience", "education", "skills", "projects"]);
export const SectionCreate: z.ZodType<SectionCreate> = z
  .object({
    section_type: SectionType,
    order: z.number().int(),
    content: z.object({}).partial().passthrough(),
  })
  .passthrough();
export const SectionResponse: z.ZodType<SectionResponse> = z
  .object({
    id: z.string().uuid(),
    cv_id: z.string().uuid(),
    section_type: SectionType,
    order: z.number().int(),
    content: z.object({}).partial().passthrough(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export const SectionReorderItem: z.ZodType<SectionReorderItem> = z
  .object({ id: z.string().uuid(), order: z.number().int() })
  .passthrough();
export const SectionReorder: z.ZodType<SectionReorder> = z
  .object({ sections: z.array(SectionReorderItem) })
  .passthrough();
export const SectionUpdate: z.ZodType<SectionUpdate> = z
  .object({
    section_type: z.union([SectionType, z.null()]),
    order: z.union([z.number(), z.null()]),
    content: z.union([z.object({}).partial().passthrough(), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  UserCreate,
  UserResponse,
  ValidationError,
  HTTPValidationError,
  Body_login_auth_login_post,
  CVResponse,
  CVCreate,
  CVUpdate,
  SectionType,
  SectionCreate,
  SectionResponse,
  SectionReorderItem,
  SectionReorder,
  SectionUpdate,
};

export const endpoints = makeApi([
  {
    method: "post",
    path: "/auth/login",
    alias: "login_auth_login_post",
    requestFormat: "form-url",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Body_login_auth_login_post,
      },
    ],
    response: z.record(z.string()),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/auth/me",
    alias: "me_auth_me_get",
    requestFormat: "json",
    response: UserResponse,
  },
  {
    method: "post",
    path: "/auth/register",
    alias: "register_auth_register_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserCreate,
      },
    ],
    response: UserResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/cvs",
    alias: "get_cvs_get",
    requestFormat: "json",
    response: z.array(CVResponse),
  },
  {
    method: "post",
    path: "/cvs",
    alias: "create_cvs_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CVCreate,
      },
    ],
    response: CVResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/cvs/:cv_id",
    alias: "get_cv_cvs__cv_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CVResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/cvs/:cv_id",
    alias: "patch_cvs__cv_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CVUpdate,
      },
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CVResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/cvs/:cv_id",
    alias: "delete_cvs__cv_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/cvs/:cv_id/export/pdf",
    alias: "export_cvs__cv_id__export_pdf_get",
    requestFormat: "json",
    parameters: [
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/cvs/:cv_id/sections",
    alias: "create_cvs__cv_id__sections_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SectionCreate,
      },
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: SectionResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/cvs/:cv_id/sections",
    alias: "get_cvs__cv_id__sections_get",
    requestFormat: "json",
    parameters: [
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(SectionResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/cvs/:cv_id/sections/:section_id",
    alias: "patch_cvs__cv_id__sections__section_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SectionUpdate,
      },
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "section_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: SectionResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/cvs/:cv_id/sections/:section_id",
    alias: "delete_cvs__cv_id__sections__section_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "section_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/cvs/:cv_id/sections/reorder",
    alias: "reorder_sections_cvs__cv_id__sections_reorder_patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SectionReorder,
      },
      {
        name: "cv_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/health",
    alias: "health_health_get",
    requestFormat: "json",
    response: z.record(z.string()),
  },
]);


export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
