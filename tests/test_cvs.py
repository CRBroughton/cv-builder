from httpx import AsyncClient


async def register_and_login(client: AsyncClient, email: str) -> str:
    await client.post("/auth/register", json={"email": email, "password": "hunter2"})
    login = await client.post(
        "/auth/login", data={"username": email, "password": "hunter2"}
    )
    return login.json()["access_token"]


async def test_create_cv(client: AsyncClient) -> None:
    token = await register_and_login(client, "cv@example.com")

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
    token = await register_and_login(client, "list@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    await client.post("/cvs", json={"title": "My CV"}, headers=headers)

    response = await client.get("/cvs", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["title"] == "My CV"


async def test_list_cvs_excludes_other_users(client: AsyncClient) -> None:
    owner_token = await register_and_login(client, "owner@example.com")
    await client.post(
        "/cvs",
        json={"title": "Owner CV"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    other_token = await register_and_login(client, "other@example.com")
    response = await client.get(
        "/cvs",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 200
    assert response.json() == []


async def test_get_cv_returns_cv(client: AsyncClient) -> None:
    token = await register_and_login(client, "getone@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    created = await client.post("/cvs", json={"title": "My CV"}, headers=headers)
    cv_id = created.json()["id"]

    response = await client.get(f"/cvs/{cv_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == "My CV"


async def test_get_cv_returns_404_for_other_user(client: AsyncClient) -> None:
    owner_token = await register_and_login(client, "getowner@example.com")
    created = await client.post(
        "/cvs",
        json={"title": "Owner CV"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    cv_id = created.json()["id"]

    other_token = await register_and_login(client, "getother@example.com")
    response = await client.get(
        f"/cvs/{cv_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 404
