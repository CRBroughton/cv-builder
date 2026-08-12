from httpx import AsyncClient


async def test_create_cv(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "cv@example.com", "password": "hunter2"},
    )
    login = await client.post(
        "/auth/login",
        data={"username": "cv@example.com", "password": "hunter2"},
    )
    token = login.json()["access_token"]

    response = await client.post(
        "/cvs",
        json={"title": "My CV", "summary": "A summary"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "My CV"
    assert body["summary"] == "A summary"
    assert "id" in body


async def test_list_cvs_returns_users_cvs(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "list@example.com", "password": "hunter2"},
    )
    login = await client.post(
        "/auth/login",
        data={"username": "list@example.com", "password": "hunter2"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    await client.post("/cvs", json={"title": "My CV"}, headers=headers)

    response = await client.get("/cvs", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["title"] == "My CV"


async def test_list_cvs_excludes_other_users(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={"email": "owner@example.com", "password": "hunter2"},
    )
    owner_login = await client.post(
        "/auth/login",
        data={"username": "owner@example.com", "password": "hunter2"},
    )
    owner_token = owner_login.json()["access_token"]
    await client.post(
        "/cvs",
        json={"title": "Owner CV"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    await client.post(
        "/auth/register",
        json={"email": "other@example.com", "password": "hunter2"},
    )
    other_login = await client.post(
        "/auth/login",
        data={"username": "other@example.com", "password": "hunter2"},
    )
    other_token = other_login.json()["access_token"]

    response = await client.get(
        "/cvs",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 200
    assert response.json() == []
