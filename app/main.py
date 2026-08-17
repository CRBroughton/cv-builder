from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.auth import router as auth_router
from app.api.cvs import router as cvs_router
from app.api.export import router as export_router
from app.api.sections import router as sections_router

ALLOWED_ORIGINS = ["http://localhost:4200", "http://localhost:4201"]

app = FastAPI(title="CV Builder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
    )

app.include_router(auth_router)

app.include_router(cvs_router)

app.include_router(sections_router)

app.include_router(export_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
