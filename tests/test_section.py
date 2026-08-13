from httpx import AsyncClient


async def register_and_login(client: AsyncClient, email: str) -> str:
    await client.post("/auth/register", json={"email": email, "password": "hunter2"})
    login = await client.post(
        "/auth/login", data={"username": email, "password": "hunter2"}
    )
    return str(login.json()["access_token"])


async def test_create_section(client: AsyncClient) -> None:
    token = await register_and_login(client, "section@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    cv = await client.post("/cvs", json={"title": "My CV"}, headers=headers)
    cv_id = cv.json()["id"]

    response = await client.post(
        f"/cvs/{cv_id}/sections",
        json={"section_type": "experience", "order": 1, "content": {"company": "Acme"}},
        headers=headers,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["section_type"] == "experience"
    assert body["order"] == 1
    assert body["content"] == {"company": "Acme"}
