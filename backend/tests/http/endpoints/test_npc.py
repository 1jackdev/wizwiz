from uuid import uuid4

from fastapi.testclient import TestClient

from tests.factories.orm import CharacterORMFactory, UserAccountORMFactory


def test_create_npc(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm1@example.com", is_dm=True)
    response = client.post(
        "/api/npc/create",
        json={
            "name": "Shopkeeper",
            "character_class": "WIZARD",
            "species": "HUMAN",
            "dm_id": str(dm.id),
        },
    )
    assert response.status_code == 201


def test_create_npc_requires_dm(client: TestClient, db):
    non_dm = UserAccountORMFactory(email="nondm@example.com", is_dm=False)
    response = client.post(
        "/api/npc/create",
        json={
            "name": "Shopkeeper",
            "character_class": "WIZARD",
            "species": "HUMAN",
            "dm_id": str(non_dm.id),
        },
    )
    assert response.status_code == 400


def test_create_npc_unknown_user(client: TestClient):
    response = client.post(
        "/api/npc/create",
        json={
            "name": "Shopkeeper",
            "character_class": "WIZARD",
            "species": "HUMAN",
            "dm_id": str(uuid4()),
        },
    )
    assert response.status_code == 400


def test_list_dm_npcs(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-list@example.com", is_dm=True)
    CharacterORMFactory(user_id=dm.id, name="NPC One", is_npc=True)
    CharacterORMFactory(user_id=dm.id, name="NPC Two", is_npc=True)
    CharacterORMFactory(user_id=dm.id, name="Not NPC", is_npc=False)

    response = client.get(f"/api/npc/dm/{dm.id}")
    assert response.status_code == 200
    body = response.json()
    names = {n["name"] for n in body}
    assert names == {"NPC One", "NPC Two"}


def test_list_dm_npcs_empty(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-empty@example.com", is_dm=True)
    response = client.get(f"/api/npc/dm/{dm.id}")
    assert response.status_code == 200
    assert response.json() == []
