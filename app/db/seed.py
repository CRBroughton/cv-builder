import asyncio

from sqlalchemy import select

from app.db.session import async_session_factory
from app.models import Ping


async def seed() -> None:
    async with async_session_factory() as session:
        existing = await session.execute(select(Ping))
        if existing.scalars().first() is not None:
            print("Seed data already present, skipping.")
            return

        session.add(Ping())
        await session.commit()
        print("Seeded 1 ping row.")


if __name__ == "__main__":
    asyncio.run(seed())
