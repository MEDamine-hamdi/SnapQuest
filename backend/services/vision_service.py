import hashlib
from supabase import create_client
from anthropic import Anthropic
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Claude
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


async def verify_challenge_photo(photo_bytes, challenge_description, user_id):
    """
    Vérifie si la photo correspond au défi
    + anti-triche simple
    """

    # =========================
    # 1. Vérifier doublons
    # =========================
    photo_hash = hashlib.md5(photo_bytes).hexdigest()

    existing = (
        supabase
        .table("photo_hashes")
        .select("id")
        .eq("hash", photo_hash)
        .execute()
    )

    if existing.data:
        return {
            "validated": False,
            "score": 0,
            "message": "Cette photo a déjà été utilisée !"
        }

    # =========================
    # 2. Analyse IA Claude Vision
    # =========================
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=300,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": photo_bytes.decode("latin1")
                        }
                    },
                    {
                        "type": "text",
                        "text": f"""
Tu es un système de validation de défis photo.

Défi :
{challenge_description}

Règles :
- Vérifie si la photo correspond au défi.
- Détecte si c'est un screenshot, une image Google ou une image affichée sur écran.
- Donne un score sur 100.
- Répond uniquement au format JSON.

Format :
{{
  "validated": true,
  "score": 85,
  "message": "Bonne photo !"
}}
"""
                    }
                ]
            }
        ]
    )

    result_text = response.content[0].text

    # =========================
    # 3. Sauvegarder hash
    # =========================
    supabase.table("photo_hashes").insert({
        "hash": photo_hash,
        "user_id": user_id
    }).execute()

    return result_text