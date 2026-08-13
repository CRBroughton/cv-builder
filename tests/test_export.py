from httpx import AsyncClient


async def register_and_login(client: AsyncClient, email: str) -> str:
    await client.post("/auth/register", json={"email": email, "password": "hunter2"})
    login = await client.post(
        "/auth/login", data={"username": email, "password": "hunter2"}
    )
    return str(login.json()["access_token"])


async def test_export_pdf_returns_pdf(client: AsyncClient) -> None:
    token = await register_and_login(client, "export@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    cv = await client.post(
        "/cvs", json={"title": "My CV", "summary": "A summary"}, headers=headers
    )
    cv_id = cv.json()["id"]

    response = await client.get(f"/cvs/{cv_id}/export/pdf", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"


async def test_export_pdf_returns_404_for_wrong_cv(client: AsyncClient) -> None:
    owner_token = await register_and_login(client, "export_owner@example.com")
    cv = await client.post(
        "/cvs",
        json={"title": "My CV"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    cv_id = cv.json()["id"]

    other_token = await register_and_login(client, "export_other@example.com")
    response = await client.get(
        f"/cvs/{cv_id}/export/pdf",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 404
