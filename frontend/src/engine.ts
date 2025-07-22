// engine.ts
import type { Player } from "./types";

// Now Matrix can store color (string) or 0 (empty)
export type Matrix = (number | string)[][];

export function createMatrix(w: number, h: number): Matrix {
  const matrix: Matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// Update arenaSweep and others to use Matrix type!
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

export function rotate(matrix: Matrix, direction: number): Matrix {
  const transposed: Matrix = (matrix[0] ?? []).map((_, i) =>
    matrix.map((row) => row[i] ?? 0)
  );
  return direction > 0
    ? transposed.map((row) => [...row].reverse())
    : [...transposed].reverse();
}

// 🚩 THIS is the important change:
export function merge(
  arena: Matrix,
  playerMatrix: Matrix,
  offset: { x: number; y: number },
  color: string // pass the player's color!
) {
  playerMatrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const ay = y + offset.y;
        const ax = x + offset.x;
        if (arena[ay]) {
          // Store the color instead of just "1" or "number"
          arena[ay][ax] = color;
        }
      }
    });
  });
}

// Other functions remain unchanged, but change all arena/Matrix types to Matrix

export function applyGravityStep(arena: Matrix): boolean {
  let changed = false;
  for (let y = arena.length - 2; y >= 0; y--) {
    const row = arena[y];
    const nextRow = arena[y + 1];
    if (!row || !nextRow) continue;
    for (let x = 0; x < row.length; x++) {
      // Only operate if both rows have valid indices
      if (row[x] !== 0 && typeof row[x] !== "undefined" && nextRow[x] === 0) {
        nextRow[x] = row[x] as string | number;
        row[x] = 0;
        changed = true;
      }
    }
  }
  return changed;
}

export function applyGravity(arena: Matrix, _level: number): void {
  let changed: boolean;
  do {
    changed = false;
    for (let y = arena.length - 2; y >= 0; y--) {
      const row = arena[y];
      const nextRow = arena[y + 1];
      if (!row || !nextRow) continue;
      for (let x = 0; x < row.length; x++) {
        const current = row[x];
        const below = nextRow[x];
        if (current !== 0 && typeof current !== "undefined" && below === 0) {
          nextRow[x] = current as string | number;
          row[x] = 0;
          changed = true;
        }
      }
    }
  } while (changed);
}

// Update collide to accept Matrix type, works as before
export function collide(arena: Matrix, player: Player): boolean {
  const { matrix, pos } = player;
  if (!matrix || !Array.isArray(matrix)) return false;

  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== 0 && (arena[y + pos.y]?.[x + pos.x] ?? 1) !== 0) {
        return true;
      }
    }
  }
  return false;
}
