from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str = "local"
    DB_PATH: str = "./wizwiz.db"
    ECHO_DB_QUERIES: bool = False

    HOST: str = "0.0.0.0"
    PORT: int = 8080

    SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    @property
    def db_uri(self) -> str:
        return f"sqlite:///{self.DB_PATH}"


settings = Settings()
