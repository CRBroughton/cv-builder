from io import BytesIO
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from weasyprint import HTML

from app.core.dependencies import get_current_user
from app.db.session import get_session
from app.models.cv import CV
from app.models.section import Section
from app.models.user import User

router = APIRouter(prefix="/cvs", tags=["cvs"])


@router.get("/{cv_id}/export/pdf", status_code=status.HTTP_200_OK)
async def export(
    cv_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> StreamingResponse:
    existing = await session.execute(
        select(CV).where(CV.user_id == current_user.id).where(CV.id == cv_id)
    )

    cv = existing.scalar_one_or_none()

    if cv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Could not find CV"
        )

    sections_result = await session.execute(
        select(Section).where(Section.cv_id == cv_id).order_by(Section.order)
    )

    sections = sections_result.scalars().all()

    env = Environment(loader=FileSystemLoader("app/templates"))
    template = env.get_template("cv.html")
    html = template.render(
        cv=cv,
        sections=sections,
    )

    pdf_bytes = HTML(string=html).write_pdf()
    assert pdf_bytes is not None
    return StreamingResponse(BytesIO(pdf_bytes), media_type="application/pdf")
