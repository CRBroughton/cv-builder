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


async def test_list_sections_returns_ordered_sections(client: AsyncClient) -> None:
    token = await register_and_login(client, "list_sections@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    cv = await client.post("/cvs", json={"title": "My CV"}, headers=headers)
    cv_id = cv.json()["id"]

    await client.post(
        f"/cvs/{cv_id}/sections",
        json={"section_type": "skills", "order": 2, "content": {"skill": "Python"}},
        headers=headers,
    )
    await client.post(
        f"/cvs/{cv_id}/sections",
        json={"section_type": "experience", "order": 1, "content": {"company": "Acme"}},
        headers=headers,
    )

    response = await client.get(f"/cvs/{cv_id}/sections", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0]["order"] == 1
    assert body[1]["order"] == 2


async def test_list_sections_returns_404_for_wrong_cv(client: AsyncClient) -> None:
    owner_token = await register_and_login(client, "owner_sections@example.com")
    cv = await client.post(
        "/cvs",
        json={"title": "My CV"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    cv_id = cv.json()["id"]

    other_token = await register_and_login(client, "other_sections@example.com")
    response = await client.get(
        f"/cvs/{cv_id}/sections",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 404
