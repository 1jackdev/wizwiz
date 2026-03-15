from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from uuid import UUID

ctx: ContextVar["Context"] = ContextVar("context")


@dataclass(frozen=True)
class Context:
    user_id: UUID | None
    request_id: str | None = None


@contextmanager
def set_context(context: Context):  # type: ignore
    token = ctx.set(context)
    try:
        yield
    finally:
        ctx.reset(token)
