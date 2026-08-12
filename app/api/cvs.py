from collections.abc import Sequence
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_session
from app.models.cv import CV
from app.models.user import User
from app.schemas.cv import CVCreate, CVResponse, CVUpdate

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


@router.get("/{cv_id}", response_model=CVResponse)
async def get_cv(
    cv_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> CV:
    existing = await session.execute(
        select(CV).where(CV.user_id == current_user.id).where(CV.id == cv_id)
    )

    cv = existing.scalar_one_or_none()

    if cv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Could not find CV"
        )

    return cv


@router.patch("/{cv_id}", response_model=CVResponse)
async def patch(
    cv_id: UUID,
    data: CVUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> CV:
    existing = await session.execute(
        select(CV).where(CV.user_id == current_user.id).where(CV.id == cv_id)
    )

    cv = existing.scalar_one_or_none()

    if cv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Could not find CV"
        )

    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(cv, field, value)

    await session.commit()
    await session.refresh(cv)
    return cv


@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    cv_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    existing = await session.execute(
        select(CV).where(CV.user_id == current_user.id).where(CV.id == cv_id)
    )

    cv = existing.scalar_one_or_none()

    if cv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Could not find CV"
        )

    await session.delete(cv)
    await session.commit()

    return None
