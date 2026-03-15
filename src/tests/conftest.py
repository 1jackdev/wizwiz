from collections.abc import Generator
from unittest.mock import patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.containers import container
from app.context import Context, set_context
from app.database.db import session_id
from app.database.models import Base
from app.http.main import app

app.user_middleware = []
app.middleware_stack = app.build_middleware_stack()

_test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
Base.metadata.create_all(_test_engine)
container.db.engine.override(_test_engine)

session_id.set(uuid4())
SessionTest = container.db.scoped_session()


@pytest.fixture(autouse=True)
def db() -> Generator[Session, None, None]:
    """Provides a database session for each test and rolls back any changes after the test."""
    with patch.object(Session, "commit", Session.flush):
        session = SessionTest()
        yield session
    session.close()


@pytest.fixture(autouse=True)
def context():
    context = Context(user_id=None, request_id=None)
    with set_context(context):
        yield context


@pytest.fixture
def user_context():
    context = Context(user_id=uuid4(), request_id="test-request-id")
    with set_context(context):
        yield context


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
