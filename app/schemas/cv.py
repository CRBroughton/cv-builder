from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CVCreate(BaseModel):
    title: str
    summary: str | None = None


class CVUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None


class CVResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime
    updated_at: datetime

    id: UUID
    user_id: UUID
    title: str
    summary: str | None
