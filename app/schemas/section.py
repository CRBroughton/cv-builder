from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.section import SectionType


class SectionCreate(BaseModel):
    section_type: SectionType
    order: int
    content: dict[str, object]


class SectionUpdate(BaseModel):
    section_type: SectionType | None = None
    order: int | None = None
    content: dict[str, object] | None = None


class SectionReorderItem(BaseModel):
    id: UUID
    order: int


class SectionReorder(BaseModel):
    sections: list[SectionReorderItem]


class SectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    cv_id: UUID
    section_type: SectionType
    order: int
    content: dict[str, object]
    created_at: datetime
    updated_at: datetime
