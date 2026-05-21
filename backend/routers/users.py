from fastapi import APIRouter, Depends
from dependencies import get_current_user
from database import supabase

router = APIRouter()

@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    badges = supabase.table("badges").select("*").eq("user_id", user["id"]).execute()
    return {
        "user": user,
        "badges": badges.data
    }