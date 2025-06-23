from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# Serve /static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Temporary in-memory score storage
scores = []

class Score(BaseModel):
    player: str
    points: int

@app.get("/favicon.ico")
async def favicon():
    return FileResponse("backend/app/static/favicon.ico")

@app.get("/")
def read_root():
    return {"message": "Tetris Score API is running"}

@app.get("/scores", response_model=List[Score])
def get_scores():
    # Return scores sorted descending
    return sorted(scores, key=lambda x: x.points, reverse=True)

@app.post("/scores")
def add_score(score: Score):
    scores.append(score)
    return {"message": "Score submitted", "score": score}

