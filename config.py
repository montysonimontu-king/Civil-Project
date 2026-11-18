import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Class to hold application configuration variables loaded from environment."""
    
    # Project Identity
    PROJECT_NAME: str = "CIVIL AI"
    DEVELOPERS: list[str] = ["Montu Soni", "Priyanshu", "Lalit"]

    # Google Gemini API
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")

    # Firebase Configuration
    FIREBASE_API_KEY: str = os.environ.get("FIREBASE_API_KEY", "")
    FIREBASE_AUTH_DOMAIN: str = os.environ.get("FIREBASE_AUTH_DOMAIN", "")
    FIREBASE_PROJECT_ID: str = os.environ.get("FIREBASE_PROJECT_ID", "")
    FIREBASE_STORAGE_BUCKET: str = os.environ.get("FIREBASE_STORAGE_BUCKET", "")
    FIREBASE_MESSAGING_SENDER_ID: str = os.environ.get("FIREBASE_MESSAGING_SENDER_ID", "")
    FIREBASE_APP_ID: str = os.environ.get("FIREBASE_APP_ID", "")
    FIREBASE_MEASUREMENT_ID: str = os.environ.get("FIREBASE_MEASUREMENT_ID", "")
    FIREBASE_DATABASE_URL: str = os.environ.get("FIREBASE_DATABASE_URL", "")

    # Application Settings
    HOST: str = os.environ.get("HOST", "0.0.0.0")
    PORT: int = int(os.environ.get("PORT", 8000))
    DEBUG: bool = os.environ.get("DEBUG", "False").lower() == "true"

    @classmethod
    def validate(cls) -> None:
        """Validates that critical environment variables are set."""
        critical_vars = [
            "GEMINI_API_KEY",
            "FIREBASE_API_KEY",
            "FIREBASE_PROJECT_ID"
        ]
        missing = [var for var in critical_vars if not getattr(cls, var)]
        if missing:
            raise ValueError(f"Missing critical environment variables: {', '.join(missing)}")

if __name__ == "__main__":
    # Example usage: Validate configuration on startup
    try:
        Config.validate()
        print(f"{Config.PROJECT_NAME} configuration loaded successfully.")
    except ValueError as e:
        print(f"Configuration error: {e}")