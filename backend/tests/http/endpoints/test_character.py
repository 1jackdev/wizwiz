from uuid import uuid4

from fastapi.testclient import TestClient

from tests.factories.orm import CharacterORMFactory, UserAccountORMFactory


def test_create_user(client: TestClient):
    user = UserAccountORMFactory()
    response = client.post(
        "/api/character/create",
        json={
            "name": "Legolas",
            "character_class": "RANGER",
            "species": "HIGH_ELF",
            "user_id": str(user.id),
        },
    )
    assert response.status_code == 201


def test_user_does_not_exist(client: TestClient):
    response = client.post(
        "/api/character/create",
        json={
            "name": "Legolas",
            "character_class": "RANGER",
            "species": "HIGH_ELF",
            "user_id": str(uuid4()),
        },
    )
    assert response.status_code == 400


def test_character_name_does_not_exist(client: TestClient):
    response = client.get("/api/character/search?name=rorik")
    assert response.status_code == 404


def test_get_character(client: TestClient, db):
    user = UserAccountORMFactory(username="123")
    char = CharacterORMFactory(user_id=user.id, name="Legolas")
    response = client.get(f"/api/character/{char.id}/details")
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(char.id)
    assert body["name"] == "Legolas"
    assert body["proficiency_bonus"] == 2


def test_delete_character(client: TestClient, db):
    user = UserAccountORMFactory(username="456")
    char = CharacterORMFactory(user_id=user.id, name="Gimli")
    response = client.delete(f"/api/character/{char.id}/delete")
    assert response.status_code == 204


def test_delete_character_not_found(client: TestClient):
    response = client.delete(f"/api/character/{uuid4()}/delete")
    assert response.status_code == 404


def test_update_character(client: TestClient, db):
    user = UserAccountORMFactory(username="update-user")
    char = CharacterORMFactory(user_id=user.id, name="Aragorn")
    response = client.put(
        f"/api/character/{char.id}/update",
        json={"name": "Strider"},
    )
    assert response.status_code == 201


def test_update_character_no_changes(client: TestClient, db):
    user = UserAccountORMFactory(username="no-change-user")
    char = CharacterORMFactory(user_id=user.id, name="Aragorn")
    response = client.put(
        f"/api/character/{char.id}/update",
        json={"name": "Aragorn"},
    )
    assert response.status_code == 204


def test_update_character_not_found(client: TestClient):
    response = client.put(
        f"/api/character/{uuid4()}/update",
        json={"name": "Ghost"},
    )
    assert response.status_code == 404


def test_update_character_invalid_level(client: TestClient, db):
    user = UserAccountORMFactory(username="invalid-level-user")
    char = CharacterORMFactory(user_id=user.id, name="Aragorn")
    response = client.put(
        f"/api/character/{char.id}/update",
        json={"level": 99},
    )
    assert response.status_code == 400
