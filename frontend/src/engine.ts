export type Matrix = number[][];

export function createMatrix(w: number, h: number): Matrix {
  const matrix: Matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

export function drawMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: Matrix,
  offset = { x: 0, y: 0 }
) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = "red";
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

export function rotate(matrix: Matrix, direction: number): Matrix {
  const transposed: Matrix = (matrix[0] ?? []).map((_, i) =>
    matrix.map((row) => (typeof row[i] === "number" ? (row[i] as number) : 0))
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

export function applyGravity(arena: Matrix, level: number): void {
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
      }
    }
  }
}
