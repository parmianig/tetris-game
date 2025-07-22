# backend/app/api/tetromino.py
from fastapi import APIRouter
import random

router = APIRouter()

# Standard Tetris tetrominoes
TETROMINOS = {
    "I": [[1, 1, 1, 1]],
    "O": [[1, 1], [1, 1]],
    "T": [[0, 1, 0], [1, 1, 1]],
    "S": [[0, 1, 1], [1, 1, 0]],
    "Z": [[1, 1, 0], [0, 1, 1]],
    "J": [[1, 0, 0], [1, 1, 1]],
    "L": [[0, 0, 1], [1, 1, 1]],
}

# Canonical Tetris colors per shape (or you can randomize fully!)
TETROMINO_COLORS = {
    "I": "#00FFFF",  # Cyan
    "O": "#FFD600",  # Yellow
    "T": "#A000F0",  # Purple
    "S": "#00D000",  # Green
    "Z": "#F00000",  # Red
    "J": "#0000F0",  # Blue
    "L": "#FF8000",  # Orange
}

@router.get("/next")
def get_next_tetromino():
    shape = random.choice(list(TETROMINOS.keys()))
    matrix = TETROMINOS[shape]
    color = TETROMINO_COLORS[shape]  # use canonical color
    # To randomize color each time, use: color = random.choice(list(TETROMINO_COLORS.values()))
    return {
        "shape": shape,
        "matrix": matrix,
        "color": color,
    }
