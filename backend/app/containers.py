from dependency_injector.containers import DeclarativeContainer
from dependency_injector.providers import (
    Container,
    Factory,
    Resource,
    Singleton,
)
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session as sa_scoped_session
from sqlalchemy.orm import sessionmaker

from app.database.db import session_id
from app.database.repos.campaign import CampaignDB
from app.database.repos.campaign_action import CampaignActionDB
from app.database.repos.character import CharacterDB
from app.database.repos.user import UserDB
from app.domain.bus import MessageBus
from app.domain.handlers import command, event
from app.settings import settings


class DBContainer(DeclarativeContainer):
    engine = Resource(
        create_engine,
        settings.db_uri,
        connect_args={"check_same_thread": False},
        echo=settings.ECHO_DB_QUERIES,
    )

    session_factory = Singleton(
        sessionmaker,
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    scoped_session = Singleton(
        sa_scoped_session, session_factory=session_factory, scopefunc=session_id.get
    )

    character_repo = Factory(CharacterDB, db=scoped_session)
    user_repo = Factory(UserDB, db=scoped_session)
    campaign_repo = Factory(CampaignDB, db=scoped_session)
    campaign_action_repo = Factory(CampaignActionDB, db=scoped_session)


class AppContainer(DeclarativeContainer):
    db = Container(DBContainer)

    handler_providers = [
        Factory(command.CreateCharacterHandler, user_repo=db.user_repo),
        Factory(event.CreateCharacter, repo=db.character_repo),
        Factory(command.CreateUserHandler, repo=db.user_repo),
        Factory(event.CreateUser, repo=db.user_repo),
        Factory(command.PromoteToDmHandler, repo=db.user_repo),
        Factory(event.PromoteUserToDm, repo=db.user_repo),
        Factory(command.CreateNpcHandler, user_repo=db.user_repo),
        Factory(command.CreateCampaignHandler, user_repo=db.user_repo),
        Factory(
            command.JoinCampaignHandler,
            campaign_repo=db.campaign_repo,
            character_repo=db.character_repo,
        ),
        Factory(event.CreateCampaign, repo=db.campaign_repo),
        Factory(event.PersistCampaignCharacterAdded, repo=db.campaign_repo),
        Factory(
            command.LogCampaignActionHandler,
            campaign_repo=db.campaign_repo,
            character_repo=db.character_repo,
        ),
        Factory(event.PersistCampaignAction, repo=db.campaign_action_repo),
    ]

    msg_bus = Factory(MessageBus, handler_providers=handler_providers)


container = AppContainer()
