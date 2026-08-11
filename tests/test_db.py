from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Ping


async def test_db_connection_round_trips(db_session: AsyncSession) -> None:
    ping = Ping()
    db_session.add(ping)
    await db_session.commit()

    result = await db_session.execute(select(Ping).where(Ping.id == ping.id))
    fetched = result.scalar_one()

    assert fetched.id == ping.id
