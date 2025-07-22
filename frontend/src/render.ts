import type { Position } from "./game";

export function drawMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: number[][],
  offset: { x: number; y: number } = { x: 0, y: 0 },
  color = "#F00" // Default if none is passed
) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = color;
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, width, height);
}
