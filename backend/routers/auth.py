from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from database import supabase
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-this")
ALGORITHM = "HS256"

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    age_range: str = "23-25"
    interests: list[str] = []

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

@router.post("/register")
async def register(req: RegisterRequest):
    # Vérifie si l'email existe déjà
    existing = supabase.table("users").select("id").eq("email", req.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Crée l'utilisateur
    user = supabase.table("users").insert({
        "name": req.name,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "age_range": req.age_range,
        "interests": req.interests,
        "total_xp": 0,
        "level": 1,
        "streak": 0,
        "challenges_completed": 0
    }).execute()

    token = create_access_token(user.data[0]["id"])
    return {"token": token, "user": user.data[0]}

@router.post("/login")
async def login(req: LoginRequest):
    user_data = supabase.table("users").select("*").eq("email", req.email).execute()
    if not user_data.data:
        raise HTTPException(status_code=401, detail="Email introuvable")

    user = user_data.data[0]
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")

    token = create_access_token(user["id"])
    return {"token": token, "user": user}