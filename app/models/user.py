from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String,
    )
