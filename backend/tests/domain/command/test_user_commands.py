from unittest.mock import Mock

from app.domain.abstractions import UserRepo
from app.domain.handlers.command import CreateUserHandler
from app.domain.messages import CreateUser, UserCreated


def test_create_user_success(db):
    msg = CreateUser(email="hello@example.com", password="password123")
    user_repo = Mock(UserRepo)
    user_repo.get_by_email.return_value = None
    handler = CreateUserHandler(repo=user_repo)

    events = handler(msg)
    assert len(events) == 1
    output = events[0]
    assert isinstance(output, UserCreated)
    assert output.user.email == "hello@example.com"
