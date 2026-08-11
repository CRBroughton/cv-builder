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

# bring up app + postgres
up:
    docker compose up -d

# tear down app + postgres
down:
    docker compose down

# run the test suite
test:
    uv run pytest

# apply migrations
migrate:
    uv run alembic upgrade head

# populate the dev db with sample data
seed:
    uv run python -m app.db.seed
