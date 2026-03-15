from fastapi import APIRouter

from app.http.endpoints import auth, character, health, user

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(character.router, tags=["character"])
api_router.include_router(user.router, tags=["user"])
