from uuid import uuid4

from fastapi.testclient import TestClient

from tests.conftest import SessionTest
from tests.factories.orm import (
    CampaignORMFactory,
    CharacterORMFactory,
    UserAccountORMFactory,
)


def test_create_campaign(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-create@example.com", is_dm=True)
    response = client.post(
        f"/api/campaign/create?dm_id={dm.id}",
        json={"name": "New Camp", "level": 2, "description": None},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "New Camp"
    assert body["level"] == 2
    assert body["invite_code"]


def test_create_campaign_requires_dm(client: TestClient, db):
    non_dm = UserAccountORMFactory(email="non-dm@example.com", is_dm=False)
    response = client.post(
        f"/api/campaign/create?dm_id={non_dm.id}",
        json={"name": "New Camp", "level": 2, "description": None},
    )
    assert response.status_code == 400


def test_create_campaign_name_too_short(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-short@example.com", is_dm=True)
    response = client.post(
        f"/api/campaign/create?dm_id={dm.id}",
        json={"name": "x", "level": 1, "description": None},
    )
    assert response.status_code == 400


def test_list_dm_campaigns(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-list@example.com", is_dm=True)
    CampaignORMFactory(dm_id=dm.id, name="Camp A", invite_code="aaa00001")
    CampaignORMFactory(dm_id=dm.id, name="Camp B", invite_code="aaa00002")

    response = client.get(f"/api/campaign/dm/{dm.id}")
    assert response.status_code == 200
    body = response.json()
    assert {c["name"] for c in body} == {"Camp A", "Camp B"}


def test_get_campaign_details(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-det@example.com", is_dm=True)
    camp = CampaignORMFactory(dm_id=dm.id, name="Detail Camp", invite_code="det00001")
    response = client.get(f"/api/campaign/{camp.id}/details")
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(camp.id)
    assert body["name"] == "Detail Camp"
    assert body["characters"] == []


def test_get_campaign_details_not_found(client: TestClient):
    response = client.get(f"/api/campaign/{uuid4()}/details")
    assert response.status_code == 404


def test_update_campaign(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-upd@example.com", is_dm=True)
    camp = CampaignORMFactory(dm_id=dm.id, name="Old Name", invite_code="upd00001")
    response = client.put(
        f"/api/campaign/{camp.id}/update",
        json={"name": "New Name", "level": 5, "description": "Epic"},
    )
    assert response.status_code == 201


def test_update_campaign_no_changes(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-nop@example.com", is_dm=True)
    camp = CampaignORMFactory(
        dm_id=dm.id, name="Same", level=3, description=None, invite_code="nop00001"
    )
    response = client.put(
        f"/api/campaign/{camp.id}/update",
        json={"name": "Same", "level": 3, "description": None},
    )
    assert response.status_code == 204


def test_update_campaign_not_found(client: TestClient):
    response = client.put(
        f"/api/campaign/{uuid4()}/update",
        json={"name": "Nope"},
    )
    assert response.status_code == 404


def test_delete_campaign(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-del@example.com", is_dm=True)
    camp = CampaignORMFactory(dm_id=dm.id, invite_code="del00001")
    response = client.delete(f"/api/campaign/{camp.id}/delete")
    assert response.status_code == 204


def test_delete_campaign_not_found(client: TestClient):
    response = client.delete(f"/api/campaign/{uuid4()}/delete")
    assert response.status_code == 404


def test_regenerate_invite(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-reg@example.com", is_dm=True)
    camp = CampaignORMFactory(dm_id=dm.id, invite_code="reg00001")
    response = client.post(f"/api/campaign/{camp.id}/regenerate_invite")
    assert response.status_code == 200
    body = response.json()
    assert body["invite_code"] != "reg00001"


def test_regenerate_invite_not_found(client: TestClient):
    response = client.post(f"/api/campaign/{uuid4()}/regenerate_invite")
    assert response.status_code == 404


def test_join_campaign(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-join@example.com", is_dm=True)
    camp = CampaignORMFactory(dm_id=dm.id, invite_code="join0001")
    player = UserAccountORMFactory(email="player-join@example.com")
    char = CharacterORMFactory(user_id=player.id, name="Hero")

    response = client.post(
        "/api/campaign/join",
        json={"invite_code": "join0001", "character_id": str(char.id)},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(camp.id)


def test_join_campaign_invalid_code(client: TestClient, db):
    player = UserAccountORMFactory(email="player-bad@example.com")
    char = CharacterORMFactory(user_id=player.id)
    response = client.post(
        "/api/campaign/join",
        json={"invite_code": "nosuch00", "character_id": str(char.id)},
    )
    assert response.status_code == 400


def test_list_character_campaigns(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-char@example.com", is_dm=True)
    camp = CampaignORMFactory(dm_id=dm.id, invite_code="clist001")
    player = UserAccountORMFactory(email="player-char@example.com")
    char = CharacterORMFactory(user_id=player.id, name="Hero")

    session = SessionTest()
    camp.characters.append(char)
    session.flush()

    response = client.get(f"/api/campaign/character/{char.id}")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["id"] == str(camp.id)


def test_remove_character(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-rm@example.com", is_dm=True)
    camp = CampaignORMFactory(dm_id=dm.id, invite_code="rem00001")
    player = UserAccountORMFactory(email="player-rm@example.com")
    char = CharacterORMFactory(user_id=player.id)

    session = SessionTest()
    camp.characters.append(char)
    session.flush()

    response = client.delete(f"/api/campaign/{camp.id}/character/{char.id}")
    assert response.status_code == 204


def test_remove_character_not_in_campaign(client: TestClient, db):
    dm = UserAccountORMFactory(email="dm-rm2@example.com", is_dm=True)
    camp = CampaignORMFactory(dm_id=dm.id, invite_code="rem00002")
    response = client.delete(f"/api/campaign/{camp.id}/character/{uuid4()}")
    assert response.status_code == 400


def test_remove_character_campaign_not_found(client: TestClient):
    response = client.delete(f"/api/campaign/{uuid4()}/character/{uuid4()}")
    assert response.status_code == 404
