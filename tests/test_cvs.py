from httpx import AsyncClient


async def test_create_cv(client: AsyncClient) -> None:
    await client.post(
        "/auth/register",
        json={
            "email": "cv@example.com",
            "password": "hunter2",
        },
    )

    login = await client.post(
        "/auth/login",
        data={
            "username": "cv@example.com",
            "password": "hunter2",
        },
    )
    token = login.json()["access_token"]

    response = await client.post(
        "/cvs",
        json={
            "title": "My CV",
            "summary": "A summary",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "My CV"
    assert body["summary"] == "A summary"
    assert "id" in body
