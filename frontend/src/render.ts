import type { Matrix } from "./engine";

export function drawMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: Matrix,
  offset: { x: number; y: number } = { x: 0, y: 0 },
  color?: string
) {
  for (let y = 0; y < matrix.length; ++y) {
    const row = matrix[y];
    if (!row) continue; // <-- skip if row is undefined/null
    for (let x = 0; x < row.length; ++x) {
      const value = row[x];
      if (value !== 0 && value !== null && typeof value !== "undefined") {
        ctx.fillStyle = typeof value === "string" ? value : color ?? "#EEE";
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    }
  }
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, width, height);
}
