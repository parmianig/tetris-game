import { GAME_SETTINGS } from "./settings";
import type { Matrix } from "./types";

// Main draw function, now delegates to helpers
export function drawMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: Matrix,
  offset: { x: number; y: number } = { x: 0, y: 0 },
  color?: string
) {
  if (!matrix?.length) return;
  for (let y = 0; y < matrix.length; ++y) {
    drawMatrixRow(ctx, matrix[y], y, offset, color);
  }
}

function drawMatrixRow(
  ctx: CanvasRenderingContext2D,
  row: (string | number)[] | undefined,
  y: number,
  offset: { x: number; y: number },
  color?: string
) {
  if (!row) return;
  for (let x = 0; x < row.length; ++x) {
    drawMatrixCell(ctx, row[x], x, y, offset, color);
  }
}

function drawMatrixCell(
  ctx: CanvasRenderingContext2D,
  value: string | number | undefined | null,
  x: number,
  y: number,
  offset: { x: number; y: number },
  color?: string
) {
  if (!isRenderable(value)) return;
  const tileX = x + offset.x;
  const tileY = y + offset.y;
  const renderColor = typeof value === "string" ? value : color ?? "#4cc9f0";
  if (GAME_SETTINGS.tetrominoStyle === "glass") {
    drawLiquidGlassTile(ctx, tileX, tileY, renderColor);
  } else {
    ctx.fillStyle = renderColor;
    ctx.fillRect(tileX, tileY, 1, 1);
  }
}

function isRenderable(value: string | number | undefined | null): boolean {
  return value !== 0 && value !== null && typeof value !== "undefined";
}

// --- Helper to draw liquid glass effect ---
function drawLiquidGlassTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
  ctx.globalAlpha = 1;

  // Highlight gradient
  const grad = ctx.createLinearGradient(x, y, x + 1, y + 1);
  grad.addColorStop(0, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.13)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, 1, 1);

  // Soft border
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 0.08;
  ctx.strokeRect(x + 0.04, y + 0.04, 0.92, 0.92);

  ctx.restore();
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, width, height);
}
