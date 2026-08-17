default:
    @just --list

# start the dev server with reload
dev:
    uv run uvicorn app.main:app --reload

# run black, ruff, mypy
check:
    uv run black --check .
    uv run ruff check .
    uv run mypy .

# auto-fix formatting and lint issues
fmt:
    uv run black .
    uv run ruff check --fix .

# build the Docker image from the Nix flake
build-image:
    nix build \
      --option substituters https://cache.nixos.org \
      --option trusted-public-keys "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY=" \
      .#dockerImage && docker load < result

# bring up app + postgres
up:
    docker compose up -d

# tear down app + postgres
down:
    docker compose down

# run the test suite
test:
    uv run pytest

# generate a new migration: just makemigration "description"
makemigration name:
    uv run alembic revision --autogenerate -m "{{name}}"

# apply migrations
migrate:
    uv run alembic upgrade head

# populate the dev db with sample data
seed:
    uv run python -m app.db.seed

# remove seed data
unseed:
    uv run python -m app.db.seed unseed

# generate frontend API client from running backend OpenAPI spec
generate-api:
    cd frontend && pnpm generate:api
