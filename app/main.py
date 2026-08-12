from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.cvs import router as cvs_router

app = FastAPI(title="CV Builder")

app.include_router(auth_router)

app.include_router(cvs_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
