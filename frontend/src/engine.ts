import type { Position } from "./game";
import type { Player } from "./types";

export type Matrix = number[][];

export function createMatrix(w: number, h: number): Matrix {
  const matrix: Matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// Check collision
export function collide(arena: number[][], player: Player): boolean {
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

export function arenaSweep(arena: number[][], width: number) {
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

export function merge(
  arena: Matrix,
  playerMatrix: Matrix,
  offset: { x: number; y: number }
) {
  playerMatrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const ay = y + offset.y;
        const ax = x + offset.x;
        if (arena[ay]) {
          arena[ay][ax] = value;
        }
      }
    });
  });
}

// engine.ts
export function applyGravityStep(arena: Matrix): boolean {
  let changed = false;
  // Scan from bottom-2 up to top
  for (let y = arena.length - 2; y >= 0; y--) {
    const row = arena[y];
    const nextRow = arena[y + 1];
    if (!row || !nextRow) continue;

    for (let x = 0; x < row.length; x++) {
      if (row[x] !== 0 && nextRow[x] === 0) {
        nextRow[x] = row[x]!;
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
    // Start from second-to-last row upwards
    for (let y = arena.length - 2; y >= 0; y--) {
      const row = arena[y];
      const nextRow = arena[y + 1];

      if (!row || !nextRow) continue;

      for (let x = 0; x < row.length; x++) {
        const current = row[x];
        const below = nextRow[x];

        if (current !== 0 && below === 0) {
          nextRow[x] = current as number;
          row[x] = 0;
          changed = true; // We made a drop, so repeat!
        }
      }
    }
  } while (changed); // Repeat until nothing falls further
}
