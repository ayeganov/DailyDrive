from pydantic_settings import BaseSettings, SettingsConfigDict


class DailyDriveSettings(BaseSettings):
    """
    Settings class for this microservice.

    When instantiated this reads our settings from the environment or a .env
    file. They may also be passed in as arguments.

    For more information on how to use the settings classes see:
        https://pydantic-docs.helpmanual.io/usage/settings/
    """

    database_url: str = "postgresql+asyncpg://chore_admin:chores@localhost:5432/choredb"
    backend_public_url: str = "/static"
    secret: str = "secret"

    model_config = SettingsConfigDict(env_prefix="", env_file=".env")
