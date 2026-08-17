# CV Builder

A full-stack CV authoring and export tool — create structured CVs with sections (experience, education, skills, projects), edit them in a browser, and export to PDF.

## Stack and why

| Layer | Choice | Reason |
|-------|--------|--------|
| Backend | FastAPI + SQLAlchemy | Async-first, Pydantic schema validation at the boundary, thin route handlers delegating to service layer |
| Database | PostgreSQL + Alembic | Relational model for CVs and sections; Alembic autogenerate keeps migrations in sync with the ORM models |
| PDF export | WeasyPrint + Jinja2 | Server-side HTML-to-PDF via templated output; no headless browser required |
| Auth | PyJWT + bcrypt | Stateless JWT tokens; bcrypt for password hashing |
| Monorepo | NX 23 | `nx affected` in CI — only rebuilds changed frontend projects |
| Fetch layer | `ofetch` + `neverthrow` | Single `ResultAsync.fromPromise`; components pattern-match on `Result` with `ts-pattern` instead of scattered `try/catch` |
| API client | `openapi-zod-client` | Client and types generated from the OpenAPI spec; no hand-written types for API shapes |
| Design tokens | Style Dictionary | `--cv-*` CSS custom properties generated from JSON; zero hardcoded values in component CSS |
| Routing | React Router v6 | URL-driven navigation; CV id in the URL survives refresh and is linkable |
| Testing | Vitest + Playwright | Unit tests share the Vite transform pipeline; e2e runs against real servers |
| Component tests | Storybook + play functions | Story play functions prove positive and negative paths for every form and page |

## Workspace layout

```
app/                  FastAPI application
  api/                Route handlers
  core/               Config, auth, dependencies
  db/                 SQLAlchemy models and session
  schemas/            Pydantic request / response schemas
  services/           Business logic
  templates/          Jinja2 HTML templates for PDF export
tests/                pytest test suite
alembic/              Database migrations

frontend/
  apps/
    frontend/         React + Vite frontend
    frontend-e2e/     Playwright e2e tests
  packages/
    api/              Generated API client (openapi-zod-client)
    components/       Design system components
    tokens/           Style Dictionary token pipeline
    storybook-addon-a11y-panel/  Custom Storybook a11y panel addon
```

## Running locally

### Backend

```bash
# Install Python deps
uv sync

# Start PostgreSQL (Docker)
just up

# Run migrations
uv run alembic upgrade head

# Start the API (port 8000)
just dev
```

### Frontend

```bash
cd frontend
pnpm install

# Web (port 5173)
pnpm nx run @cv-builder/web:dev

# Component Storybook (port 6006)
pnpm nx run @cv-builder/components:storybook

# Frontend Storybook (port 6007)
pnpm nx run @cv-builder/web:storybook
```

Both the API and frontend must be running for the app to function.

## Tests

```bash
# Backend unit tests
just test

# Frontend unit tests (all projects)
cd frontend && pnpm nx run-many -t test

# E2E (requires both servers running)
cd frontend && pnpm nx run @cv-builder/frontend-e2e:e2e
```

## Key design decisions

**Service layer over fat routes**
Route handlers validate input and delegate immediately to a service function. Services own all business logic and are tested independently of the HTTP layer. This makes routes thin and services mockable without spinning up the full ASGI app.

**Generated API client**
The frontend never hand-writes types for API shapes. `openapi-zod-client` generates the client and Zod schemas from the FastAPI OpenAPI output — a type mismatch between backend and frontend is a CI failure, not a runtime surprise.

**Context-as-contract for Storybook**
Pages are wrapped in a thin `Provider` component that supplies state via React context. In production the provider runs the real hooks; in Storybook it receives mock values directly. This makes story states declarative and immediate — no MSW, no network, no async delays.

**`safeFetch` + `neverthrow` instead of a data-fetching library**
Server state is fetched with `ofetch` wrapped in `ResultAsync`. Each callsite pattern-matches on the `Result` with `ts-pattern` — abort, HTTP error, and network failure are all handled explicitly. This trades cache invalidation for explicit control over every error path.

**Custom a11y Storybook addon**
A bespoke Storybook panel runs axe-core on every story and supports a "Scan All" mode with fingerprint caching — stories whose DOM hasn't changed since the last scan are skipped automatically, keeping the full-suite scan fast.

## AI-assisted workflow

Used AI tooling throughout: generating test skeletons, scaffolding the hook decomposition pattern (`useCVMeta` / `useSections` / `useExportPdf`), and drafting the Storybook addon architecture. In each case the output was reviewed and edited — generated story play functions used text queries that broke on copy changes, so they were replaced with role-based queries; the `mockResolvedValueOnce` pattern for Storybook instrumented args required understanding how Storybook instruments meta-level `fn()` vs story-level overrides. AI is fast at scaffold and slow at project-specific context; knowing which is which is the skill.
