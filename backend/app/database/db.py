import time
from contextvars import ContextVar
from uuid import UUID

from sqlalchemy import event
from sqlalchemy.engine import Engine

from app.settings import settings

session_id: ContextVar[UUID] = ContextVar("session_id")

if settings.ECHO_DB_QUERIES:

    @event.listens_for(Engine, "before_cursor_execute")
    def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):  # type: ignore
        context._query_start_time = time.time()
        print("Start Query:\n%s" % statement)

    @event.listens_for(Engine, "after_cursor_execute")
    def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):  # type: ignore
        total = time.time() - context._query_start_time  # noqa
        print("Total Time: %.02fms" % (total * 1000))
