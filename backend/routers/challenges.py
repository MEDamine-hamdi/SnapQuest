from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from services.vision_service import verify_challenge_photo
from services.gamification import award_xp_and_badges
from database import supabase
from dependencies import get_current_user
import uuid, base64

router = APIRouter()

@router.post("/verify")
async def verify_challenge(
    photo: UploadFile = File(...),
    challenge_id: str = Form(...),
    user = Depends(get_current_user)
):
    # 1. Récupérer le défi depuis la DB
    challenge_data = supabase.table("challenges") \
        .select("*").eq("id", challenge_id).execute()
    if not challenge_data.data:
        raise HTTPException(status_code=404, detail="Défi introuvable")
    challenge = challenge_data.data[0]

    # 2. Lire et encoder la photo en base64
    photo_bytes = await photo.read()
    photo_b64 = base64.b64encode(photo_bytes).decode()

    # 3. Uploader la photo dans Supabase Storage
    photo_filename = f"challenges/{user['id']}/{uuid.uuid4()}.jpg"
    supabase.storage.from_("photos").upload(photo_filename, photo_bytes)

    # 4. Appeler Claude Vision pour vérification
    verification = await verify_challenge_photo(
        photo_base64=photo_b64,
        proof_required=challenge["proof_required"],
        challenge_title=challenge["title"],
        category=challenge["category"]
    )

    # 5. Si validé: attribuer XP, badges, enregistrer
    if verification["validated"]:
        result = await award_xp_and_badges(
            user_id=user["id"],
            challenge_id=challenge_id,
            xp_reward=challenge["xp_reward"],
            category=challenge["category"]
        )
        verification.update(result)

    return verification

@router.get("")
async def get_challenges(user = Depends(get_current_user)):
    # Retourne les défis de l'utilisateur (acceptés, complétés, disponibles)
    user_challenges = supabase.table("user_challenges") \
        .select("*, challenges(*)") \
        .eq("user_id", user["id"]) \
        .order("created_at", desc=True) \
        .execute()
    return user_challenges.data