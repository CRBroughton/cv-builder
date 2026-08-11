from app.db.base import BaseModel


class Ping(BaseModel):
    """Throwaway table proving the migration pipeline works end to end."""

    __tablename__ = "ping"
