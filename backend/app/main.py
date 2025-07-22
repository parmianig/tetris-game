import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from .api.tetromino import router as tetromino_router


app = FastAPI()

# CORS errors on Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tetromino_router, prefix="/api/tetromino")

# Serve static files (e.g., favicon)
# Get the absolute path to static
STATIC_PATH = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")

# In-memory score list (temporary)
scores = []

# Score model
class Score(BaseModel):
    player: str
    points: int

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Tetris Score API is running"}

# Return favicon
@app.get("/favicon.ico")
async def favicon():
    return FileResponse("app/static/favicon.ico")

# Get sorted list of scores
@app.get("/scores", response_model=List[Score])
def get_scores():
    return sorted(scores, key=lambda s: s.points, reverse=True)

# Submit a new score
@app.post("/scores", response_model=Score)
def add_score(score: Score):
    scores.append(score)
    return score

# Health Check
@app.get("/ping")
def ping():
    return {"status": "ok"}
