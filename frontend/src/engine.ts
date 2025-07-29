import type { Matrix, Player } from "./types";
import { SRS_KICK_TABLE, getSRSKey } from "./srs";

// Utility for deep copy
function copyMatrix(matrix: Matrix): Matrix {
  return matrix.map((row) => [...row]);
}

// —————————— ARENA & MERGE ——————————
export function createMatrix(w: number, h: number): Matrix {
  return Array.from({ length: h }, () => new Array(w).fill(0));
}

export function arenaSweep(arena: Matrix, width: number) {
  for (let y = arena.length - 1; y >= 0; --y) {
    const row = arena[y];
    if (!row) continue;
    if (row.every((cell) => cell !== 0)) {
      arena.splice(y, 1);
      arena.unshift(new Array(width).fill(0));
      y++;
    }
  }
}

export function merge(
  arena: Matrix,
  playerMatrix: Matrix,
  offset: { x: number; y: number },
  color: string
) {
  playerMatrix.forEach((row, y) => {
    if (!row) return;
    row.forEach((value, x) => {
      if (value !== 0 && value !== undefined) {
        const ay = y + offset.y;
        const ax = x + offset.x;
        if (
          ay >= 0 &&
          ay < arena.length &&
          ax >= 0 &&
          ax < (arena[ay]?.length ?? 0)
        ) {
          arena[ay]![ax] = color;
        }
      }
    });
  });
}

// —————————— SRS ROTATION CORE ——————————

export function rotateIMatrix(
  matrix: Matrix,
  _direction: 1 | -1,
  rotation: Player["rotation"]
): Matrix {
  const N = 4;
  const out: Matrix = Array.from({ length: N }, () => Array(N).fill(0));
  const val = matrix.flat().find((v) => v !== 0 && v !== undefined) ?? 1;

  if (rotation % 2 === 0) {
    for (let i = 0; i < 4; ++i) out[i]![2] = val;
  } else {
    for (let i = 0; i < 4; ++i) out[2]![i] = val;
  }
  return out;
}

export function rotateMatrixWithOrigin(
  matrix: Matrix,
  direction: 1 | -1,
  origin: { x: number; y: number }
): Matrix {
  const N = matrix.length;
  const out: Matrix = Array.from({ length: N }, () => Array(N).fill(0));
  for (let y = 0; y < N; ++y) {
    const row = matrix[y];
    if (!row) continue; // Defensive: row may be undefined
    for (let x = 0; x < N; ++x) {
      const v = row[x];
      if (!v) continue;
      const relX = x - origin.x,
        relY = y - origin.y;
      let rx: number, ry: number;
      if (direction === 1) {
        rx = relY;
        ry = -relX;
      } else {
        rx = -relY;
        ry = relX;
      }
      const nx = Math.round(rx + origin.x),
        ny = Math.round(ry + origin.y);
      if (nx >= 0 && nx < N && ny >= 0 && ny < N) out[ny]![nx] = v;
    }
  }
  return out;
}

export function wrapRotation(n: number): 0 | 1 | 2 | 3 {
  return (((n % 4) + 4) % 4) as 0 | 1 | 2 | 3;
}

export function attemptSRSRotation(
  player: Player,
  arena: Matrix,
  direction: 1 | -1
): { matrix: Matrix; offset: { x: number; y: number }; rotated: boolean } {
  const { matrix, pos, shape, rotation, origin } = player;

  let rotated: Matrix;
  if (shape === "I") {
    rotated = rotateIMatrix(matrix, direction, rotation);
  } else if (shape === "O") {
    rotated = copyMatrix(matrix);
  } else {
    rotated = rotateMatrixWithOrigin(matrix, direction, origin);
  }

  const from = wrapRotation(rotation);
  const to = wrapRotation(rotation + direction);
  const key = getSRSKey(shape, from, to);
  const kicks = SRS_KICK_TABLE[key] || [[0, 0]];

  for (const [dx, dy] of kicks) {
    const testPos = { x: pos.x + dx, y: pos.y + dy };
    if (!collideWithMatrix(arena, rotated, testPos)) {
      return {
        matrix: rotated,
        offset: { x: dx, y: dy },
        rotated: true,
      };
    }
  }
  return { matrix, offset: { x: 0, y: 0 }, rotated: false };
}

// —————————— COLLISION & GRAVITY ——————————
export function collideWithMatrix(
  arena: Matrix,
  matrix: Matrix,
  pos: { x: number; y: number }
): boolean {
  const H = arena.length,
    W = arena[0]?.length ?? 0;
  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x++) {
      const v = row[x];
      if (!v) continue;
      const ay = y + pos.y,
        ax = x + pos.x;
      if (ay < 0 || ay >= H || ax < 0 || ax >= W || arena[ay]?.[ax] !== 0) {
        return true;
      }
    }
  }
  return false;
}

export function collide(arena: Matrix, player: Player): boolean {
  return collideWithMatrix(arena, player.matrix, player.pos);
}

export function applyGravityStep(arena: Matrix): boolean {
  let moved = false;
  for (let y = arena.length - 2; y >= 0; y--) {
    const row = arena[y];
    const next = arena[y + 1];
    if (!Array.isArray(row) || !Array.isArray(next)) continue;
    for (let x = 0; x < row.length; x++) {
      const val = row[x];
      // Only move valid numbers that are not zero, and only into empty slots
      if (
        typeof val === "number" &&
        val !== 0 &&
        typeof next[x] === "number" &&
        next[x] === 0
      ) {
        next[x] = val;
        row[x] = 0;
        moved = true;
      }
    }
  }
  return moved;
}

export function applyGravity(arena: Matrix, _level: number): void {
  while (applyGravityStep(arena));
}

export function getCenterOfGravity(matrix: Matrix): { x: number; y: number } {
  let sumX = 0,
    sumY = 0,
    count = 0;
  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    if (!row) continue; // ← Defensive: skip undefined rows
    for (let x = 0; x < row.length; x++) {
      const v = row[x];
      if (v !== 0 && v !== undefined) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }
  return count ? { x: sumX / count, y: sumY / count } : { x: 0, y: 0 };
}
