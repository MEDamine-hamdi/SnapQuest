from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, chat, challenges, users
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SnapQuest API",
    description="API pour l'application mobile SnapQuest",
    version="1.0.0"
)

# CORS pour l'app mobile
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En prod, mettre l'URL exacte
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(challenges.router, prefix="/challenges", tags=["Challenges"])
app.include_router(users.router, prefix="/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "SnapQuest API 🗺️"}