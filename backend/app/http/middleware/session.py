from uuid import uuid4

from starlette.types import ASGIApp, Receive, Scope, Send

from app.containers import container
from app.database.db import session_id


class SessionMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":  # pragma: no cover
            await self.app(scope, receive, send)
            return

        token = session_id.set(uuid4())
        scoped_session = container.db.scoped_session()
        try:
            await self.app(scope, receive, send)
        finally:
            scoped_session.remove()
            session_id.reset(token)
