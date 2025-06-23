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
        ctx.fillStyle = 'red';
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

export function rotate(matrix: number[][], direction: number): number[][] {
  // Transpose
  const transposed = matrix[0].map((_, i) => matrix.map(row => row[i]));

  if (direction > 0) {
    // Clockwise: transpose, then reverse rows
    return transposed.map(row => [...row].reverse());
  } else {
    // Counterclockwise: transpose, then reverse order of rows
    return [...transposed].reverse();
  }
}
