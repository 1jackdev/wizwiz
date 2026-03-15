from uuid import uuid4

from fastapi.testclient import TestClient

from tests.factories.orm import CharacterORMFactory, UserAccountORMFactory


def test_create_user(client: TestClient):
    response = client.post(
        "/api/user/create", json={"username": "test-user-123", "password": "password123"}
    )
    assert response.status_code == 201


def test_user_already_exists(client: TestClient):
    UserAccountORMFactory(username="test-user-123")

    response = client.post(
        "/api/user/create",
        json={"username": "test-user-123", "password": "password123"},
    )
    assert response.status_code == 400


def test_user_does_not_exist(client: TestClient):
    response = client.get(f"/api/user/{uuid4()}/details")
    assert response.status_code == 404


def test_username_does_not_exist(client: TestClient):
    response = client.get("/api/user/search?username=greg101")
    assert response.status_code == 404


def test_get_user(client: TestClient, db):
    user = UserAccountORMFactory(username="123")
    CharacterORMFactory(user_id=user.id)
    response = client.get(f"/api/user/{user.id}/details")
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(user.id)
    assert body["username"] == "123"
