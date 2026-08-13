from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.cvs import router as cvs_router
from app.api.export import router as export_router
from app.api.sections import router as sections_router

app = FastAPI(title="CV Builder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:4201"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

app.include_router(cvs_router)

app.include_router(sections_router)

app.include_router(export_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
