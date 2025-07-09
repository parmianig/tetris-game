export type Matrix = number[][];

export function createMatrix(w: number, h: number): Matrix {
  const matrix: Matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0)); // All elements are guaranteed to be numbers (no undefined)
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
    matrix.map((row) => row[i] ?? 0)
  );

  return direction > 0
    ? transposed.map((row) => [...row].reverse())
    : [...transposed].reverse();
}
