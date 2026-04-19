from uuid import uuid4

from fastapi.testclient import TestClient

from tests.factories.orm import CharacterORMFactory, UserAccountORMFactory


def test_create_user(client: TestClient):
    response = client.post(
        "/api/user/create",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 201


def test_user_already_exists(client: TestClient):
    UserAccountORMFactory(email="test@example.com")

    response = client.post(
        "/api/user/create",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 400


def test_user_does_not_exist(client: TestClient):
    response = client.get(f"/api/user/{uuid4()}/details")
    assert response.status_code == 404


def test_email_does_not_exist(client: TestClient):
    response = client.get("/api/user/search?email=missing@example.com")
    assert response.status_code == 404


def test_get_user(client: TestClient, db):
    user = UserAccountORMFactory(email="user@example.com")
    CharacterORMFactory(user_id=user.id)
    response = client.get(f"/api/user/{user.id}/details")
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(user.id)
    assert body["email"] == "user@example.com"


def test_promote_to_dm(client: TestClient, db):
    user = UserAccountORMFactory(email="dm@example.com", is_dm=False)
    response = client.post(f"/api/user/{user.id}/promote_dm")
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(user.id)
    assert body["is_dm"] is True


def test_promote_to_dm_unknown_user(client: TestClient):
    response = client.post(f"/api/user/{uuid4()}/promote_dm")
    assert response.status_code == 400
