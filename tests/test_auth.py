from httpx import AsyncClient


async def test_register_creates_user(client: AsyncClient) -> None:
    response = await client.post(
        "/auth/register", json={"email": "test@example.com", "password": "hunter2"}
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "test@example.com"
    assert "hashed_password" not in body


async def test_register_rejects_duplicate_email(client: AsyncClient) -> None:
    payload = {"email": "dupe@example.com", "password": "hunter2"}
    await client.post("/auth/register", json=payload)
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 409


async def test_login_returns_token(client: AsyncClient) -> None:
    await client.post(
        "/auth/register", json={"email": "login@example.com", "password": "hunter2"}
    )
    response = await client.post(
        "/auth/login", data={"username": "login@example.com", "password": "hunter2"}
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


async def test_login_rejects_wrong_password(client: AsyncClient) -> None:
    await client.post(
        "/auth/register", json={"email": "wrong@example.com", "password": "hunter2"}
    )
    response = await client.post(
        "/auth/login", data={"username": "wrong@example.com", "password": "badpassword"}
    )
    assert response.status_code == 401


async def test_login_rejects_unknown_email(client: AsyncClient) -> None:
    response = await client.post(
        "/auth/login", data={"username": "ghost@example.com", "password": "hunter2"}
    )
    assert response.status_code == 401
