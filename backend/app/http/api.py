from fastapi import APIRouter

from app.http.endpoints import auth, campaign, character, health, npc, user

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(character.router, tags=["character"])
api_router.include_router(user.router, tags=["user"])
api_router.include_router(campaign.router, tags=["campaign"])
api_router.include_router(npc.router, tags=["npc"])
