import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from .api.tetromino import router as tetromino_router

app = FastAPI()

# CORS for local dev AND production
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://tetris-game-umber.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tetromino_router, prefix="/api/tetromino")

STATIC_PATH = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")

# In-memory score list (temporary)
scores = []

class Score(BaseModel):
    player: str
    points: int

@app.get("/")
def read_root():
    return {"message": "Tetris Score API is running"}

@app.get("/favicon.ico")
async def favicon():
    return FileResponse("app/static/favicon.ico")

@app.get("/scores", response_model=List[Score])
def get_scores():
    return sorted(scores, key=lambda s: s.points, reverse=True)

@app.post("/scores", response_model=Score)
def add_score(score: Score):
    scores.append(score)
    return score

@app.get("/ping")
def ping():
    return {"status": "ok"}
