from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_session
from app.models.cv import CV
from app.models.section import Section
from app.models.user import User
from app.schemas.section import SectionCreate, SectionResponse

router = APIRouter(prefix="/cvs", tags=["cvs"])


@router.post("", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create(
    cv_id: UUID,
    data: SectionCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Section:
    existing = await session.execute(
        select(CV).where(CV.user_id == current_user.id).where(CV.id == cv_id)
    )

    cv = existing.scalar_one_or_none()

    if cv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Could not find CV"
        )

    section = Section(cv_id=cv_id, **data.model_dump())

    session.add(section)
    await session.commit()
    await session.refresh(section)
    return section
