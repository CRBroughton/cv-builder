import asyncio
from typing import cast

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import async_session_factory
from app.models import CV, User
from app.models.section import Section, SectionType

SEED_EMAIL = "demo@example.com"
SEED_PASSWORD = "password123"

CVS: list[dict[str, object]] = [
    {
        "title": "Software Engineer",
        "summary": (
            "Full-stack engineer with 6 years of experience building "
            "web applications and APIs. Passionate about developer tooling, "
            "clean architecture, and accessible UIs."
        ),
        "sections": [
            {
                "type": SectionType.experience,
                "order": 0,
                "content": {
                    "company": "Acme Corp",
                    "role": "Senior Software Engineer",
                    "start_date": "Jan 2022",
                    "end_date": "Present",
                    "description": (
                        "Led frontend architecture for the core product, "
                        "migrating a legacy jQuery codebase to React. "
                        "Reduced bundle size by 40% and improved Lighthouse scores across the board."
                    ),
                },
            },
            {
                "type": SectionType.experience,
                "order": 1,
                "content": {
                    "company": "Startup Ltd",
                    "role": "Software Engineer",
                    "start_date": "Mar 2019",
                    "end_date": "Dec 2021",
                    "description": (
                        "Built and maintained a multi-tenant SaaS platform "
                        "using FastAPI and React. Designed the database schema, "
                        "wrote the OpenAPI spec, and owned the CI/CD pipeline."
                    ),
                },
            },
            {
                "type": SectionType.education,
                "order": 2,
                "content": {
                    "institution": "University of Example",
                    "qualification": "BSc Computer Science",
                    "start_date": "Sep 2015",
                    "end_date": "Jun 2018",
                },
            },
            {
                "type": SectionType.skills,
                "order": 3,
                "content": {
                    "items": "TypeScript, React, Python, FastAPI, PostgreSQL, Docker, NixOS"
                },
            },
            {
                "type": SectionType.projects,
                "order": 4,
                "content": {
                    "name": "CV Builder",
                    "url": "https://github.com/example/cv-builder",
                    "description": (
                        "Full-stack CV authoring tool with PDF export. "
                        "FastAPI backend, React frontend, WeasyPrint for PDF generation."
                    ),
                },
            },
        ],
    },
    {
        "title": "Product Designer",
        "summary": (
            "Product designer with a background in frontend development. "
            "Comfortable taking a feature from research to shipped UI, "
            "working closely with engineering throughout."
        ),
        "sections": [
            {
                "type": SectionType.experience,
                "order": 0,
                "content": {
                    "company": "Design Studio Co",
                    "role": "Lead Product Designer",
                    "start_date": "Jun 2021",
                    "end_date": "Present",
                    "description": (
                        "Owned end-to-end design for three product lines. "
                        "Established the design system, ran user research sessions, "
                        "and partnered with engineering on component implementation."
                    ),
                },
            },
            {
                "type": SectionType.education,
                "order": 1,
                "content": {
                    "institution": "School of Art and Design",
                    "qualification": "BA Graphic Design",
                    "start_date": "Sep 2014",
                    "end_date": "Jun 2017",
                },
            },
            {
                "type": SectionType.skills,
                "order": 2,
                "content": {
                    "items": "Figma, Storybook, Accessibility, HTML, CSS, User Research"
                },
            },
        ],
    },
    {
        "title": "Backend Engineer",
        "summary": None,
        "sections": [
            {
                "type": SectionType.experience,
                "order": 0,
                "content": {
                    "company": "FinTech Inc",
                    "role": "Backend Engineer",
                    "start_date": "Apr 2020",
                    "end_date": "Present",
                    "description": (
                        "Designed and built event-driven microservices handling "
                        "payment processing at scale. Worked primarily in Python "
                        "and Go, with PostgreSQL and Kafka."
                    ),
                },
            },
            {
                "type": SectionType.skills,
                "order": 1,
                "content": {
                    "items": "Python, Go, PostgreSQL, Kafka, Docker, Kubernetes"
                },
            },
        ],
    },
]


async def seed() -> None:
    async with async_session_factory() as session:
        existing = await session.execute(select(User).where(User.email == SEED_EMAIL))
        if existing.scalars().first() is not None:
            print("Seed data already present, skipping.")
            return

        user = User(email=SEED_EMAIL, hashed_password=hash_password(SEED_PASSWORD))
        session.add(user)
        await session.flush()

        for cv_data in CVS:
            cv = CV(
                title=cv_data["title"],
                summary=cv_data["summary"],
                user_id=user.id,
            )
            session.add(cv)
            await session.flush()

            for section_data in cast(list[dict[str, object]], cv_data["sections"]):
                section = Section(
                    cv_id=cv.id,
                    section_type=section_data["type"],
                    order=section_data["order"],
                    content=section_data["content"],
                )
                session.add(section)

        await session.commit()
        print(f"Seeded user '{SEED_EMAIL}' with {len(CVS)} CVs.")


async def unseed() -> None:
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.email == SEED_EMAIL))
        user = result.scalars().first()
        if user is None:
            print("No seed data found, nothing to clear.")
            return
        await session.delete(user)
        await session.commit()
        print(f"Removed seed user '{SEED_EMAIL}' and all associated CVs.")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "unseed":
        asyncio.run(unseed())
    else:
        asyncio.run(seed())
