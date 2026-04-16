from fastapi import APIRouter, Depends

from ..db.repositories import create_or_update_profile
from ..deps import get_current_user
from ..schemas import User


router = APIRouter()


@router.get("/me", response_model=User)
async def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    await create_or_update_profile(
        current_user.id,
        current_user.email,
        current_user.name,
        current_user.avatar_url,
    )
    return current_user

