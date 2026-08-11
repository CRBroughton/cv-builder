from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = (
        "postgresql+asyncpg://cv_builder:cv_builder@localhost:5432/cv_builder"
    )
    test_database_url: str = (
        "postgresql+asyncpg://cv_builder:cv_builder@localhost:5432/cv_builder_test"
    )


settings = Settings()
