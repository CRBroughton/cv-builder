import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class SectionType(enum.StrEnum):
    experience = "experience"
    education = "education"
    skills = "skills"
    projects = "projects"


class Section(BaseModel):
    __tablename__ = "sections"

    cv_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cvs.id", ondelete="CASCADE")
    )

    section_type: Mapped[SectionType] = mapped_column(Enum(SectionType))

    order: Mapped[int] = mapped_column(Integer)

    content: Mapped[dict[str, object]] = mapped_column(JSONB)
