from contextlib import asynccontextmanager
from typing import AsyncIterator

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware import Middleware

from app.containers import container
from app.domain.errors import BaseValidationError
from app.http.api import api_router
from app.http.middleware.session import SessionMiddleware
from app.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    container.init_resources()
    yield
    container.shutdown_resources()


app = FastAPI(
    title="wizwiz",
    lifespan=lifespan,
    description="A character management system for tabletop RPGs.",
    middleware=[Middleware(SessionMiddleware)],
)

app.include_router(api_router, prefix="/api")


@app.exception_handler(BaseValidationError)
async def validation_error(request: Request, exc: BaseValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"details": str(exc)},
    )


if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT, reload=False, workers=1)
