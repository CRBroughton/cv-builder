from fastapi import FastAPI

app = FastAPI(title="CV Builder")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
