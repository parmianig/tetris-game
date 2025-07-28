# backend/app/api/tetromino.py
from fastapi import APIRouter
import random

router = APIRouter()

TETROMINOS = {
    "I": [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    "O": [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    "T": [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    "S": [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    "Z": [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    "J": [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    "L": [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
}

TETROMINO_ORIGINS = {
    "I": (1.5, 0.5),  # 4x4 SRS
    "O": (0.5, 0.5),  # 4x4 SRS
    # All others: center of 3x3 matrix, which is (1,1)
    "T": (1, 1),
    "S": (1, 1),
    "Z": (1, 1),
    "J": (1, 1),
    "L": (1, 1),
}

TETROMINO_COLORS = {
    "I": "#00FFFF",
    "O": "#FFD600",
    "T": "#A000F0",
    "S": "#00D000",
    "Z": "#F00000",
    "J": "#0000F0",
    "L": "#FF8000",
}

@router.get("/next")
def get_next_tetromino():
    shape = random.choice(list(TETROMINOS.keys()))
    matrix = TETROMINOS[shape]
    # If 3x3, pad to 4x4 for universal client logic (optional, but helps SRS)
    if len(matrix) < 4:
        # Pad rows
        for row in matrix:
            while len(row) < 4:
                row.append(0)
        while len(matrix) < 4:
            matrix.append([0, 0, 0, 0])
    color = TETROMINO_COLORS[shape]
    origin = TETROMINO_ORIGINS[shape]
    return {
        "shape": shape,
        "matrix": matrix,
        "color": color,
        "origin": {"x": origin[0], "y": origin[1]},
    }
