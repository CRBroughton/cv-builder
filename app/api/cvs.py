from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_session
from app.models.cv import CV
from app.models.user import User
from app.schemas.cv import CVCreate, CVResponse

router = APIRouter(prefix="/cvs", tags=["cvs"])


@router.post("", response_model=CVResponse, status_code=status.HTTP_201_CREATED)
async def create(
    data: CVCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> CV:
    cv = CV(
        title=data.title,
        summary=data.summary,
        user_id=current_user.id,
    )

    session.add(cv)
    await session.commit()
    await session.refresh(cv)
    return cv


@router.get("", response_model=list[CVResponse])
async def get(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[CV]:
    result = await session.execute(select(CV).where(CV.user_id == current_user.id))

    return result.scalars().all()
