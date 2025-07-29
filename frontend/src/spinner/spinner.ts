// src/spinner/spinner.ts
import { SPINNER_TETROMINOS } from "./tetrominoDefs"; // ✅ Imports the actual array to use at runtime

let spinnerIndex = 0;
let spinnerAngle = 0;
let spinnerCanvas: HTMLCanvasElement | null = null;
let spinnerCtx: CanvasRenderingContext2D | null = null;
let lastMorph = Date.now();
const morphDuration = 700; // ms
const showDuration = 1200; // ms

function interpolateMatrix(matA: number[][], matB: number[][], t: number) {
  const N = Math.max(matA.length, matB.length);
  const result: number[][] = [];
  for (let y = 0; y < N; ++y) {
    const row: number[] = [];
    for (let x = 0; x < N; ++x) {
      const a = matA[y]?.[x] ?? 0;
      const b = matB[y]?.[x] ?? 0;
      row[x] = (1 - t) * a + t * b;
    }
    result[y] = row;
  }
  return result;
}

function drawSpinnerTetromino(
  matrix: number[][],
  color: string,
  angle: number,
  alpha = 1
) {
  if (!spinnerCtx) return;
  const ctx = spinnerCtx;
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.rotate(angle);

  const N = matrix.length;
  const block = Math.floor(
    Math.min(ctx.canvas.width, ctx.canvas.height) / (N + 0.2)
  );

  for (let y = 0; y < N; ++y) {
    for (let x = 0; x < N; ++x) {
      if ((matrix[y]?.[x] ?? 0) > 0.02) {
        const bx = (x - N / 2 + 0.5) * block;
        const by = (y - N / 2 + 0.5) * block;
        const grad = ctx.createLinearGradient(bx, by, bx + block, by + block);
        grad.addColorStop(0, "#fff7");
        grad.addColorStop(0.23, color);
        grad.addColorStop(0.72, "#fff3");
        grad.addColorStop(1, "#0003");
        ctx.save();
        ctx.shadowColor = "#fff6";
        ctx.shadowBlur = 7;
        ctx.fillStyle = grad;
        ctx.globalAlpha = alpha * (matrix[y]?.[x] ?? 0);
        ctx.fillRect(bx, by, block - 2, block - 2);
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = "rgba(220,240,255,0.22)";
        ctx.strokeRect(bx, by, block - 2, block - 2);
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

function animateSpinnerTetromino() {
  if (SPINNER_TETROMINOS.length === 0) return;

  const now = Date.now();
  const elapsed = now - lastMorph;
  const from = SPINNER_TETROMINOS[spinnerIndex % SPINNER_TETROMINOS.length];
  const to = SPINNER_TETROMINOS[(spinnerIndex + 1) % SPINNER_TETROMINOS.length];

  if (!from || !to) return;

  if (elapsed < showDuration) {
    drawSpinnerTetromino(from.matrix, from.color, spinnerAngle);
  } else if (elapsed < showDuration + morphDuration) {
    const t = (elapsed - showDuration) / morphDuration;
    const mat = interpolateMatrix(from.matrix, to.matrix, t);
    const color = t < 0.5 ? from.color : to.color;
    drawSpinnerTetromino(mat, color, spinnerAngle, 1);
  } else {
    lastMorph = now;
    spinnerIndex = (spinnerIndex + 1) % SPINNER_TETROMINOS.length;
  }
  spinnerAngle += 0.07;
  requestAnimationFrame(animateSpinnerTetromino);
}

// --- DOM Setup ---
function setupSpinnerOverlay() {
  if (document.getElementById("spinner-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "spinner-overlay";
  overlay.className = "spinner-overlay";

  // Spinner canvas
  const canvas = document.createElement("canvas");
  canvas.id = "tetromino-spinner-canvas";
  canvas.width = 128; // Match CSS size for sharpness
  canvas.height = 128;

  // "Loading" text
  const msg = document.createElement("div");
  msg.id = "spinner-message";
  msg.textContent = "Loading";

  overlay.appendChild(canvas);
  overlay.appendChild(msg);
  document.body.appendChild(overlay);
}

// --- Spinner API ---
export function showSpinner(msg: string = "Loading") {
  setupSpinnerOverlay();
  const overlay = document.getElementById("spinner-overlay");
  const msgEl = document.getElementById("spinner-message");
  if (msgEl && msg) msgEl.textContent = msg;
  if (overlay) {
    overlay.classList.add("show");
    startTetrominoSpinner();
  }
}

export function hideSpinner() {
  const overlay = document.getElementById("spinner-overlay");
  if (overlay) {
    overlay.classList.remove("show");
    if (spinnerCtx && spinnerCanvas)
      spinnerCtx.clearRect(0, 0, spinnerCanvas.width, spinnerCanvas.height);
  }
}

function startTetrominoSpinner() {
  spinnerCanvas = document.getElementById(
    "tetromino-spinner-canvas"
  ) as HTMLCanvasElement;
  if (!spinnerCanvas) return;
  spinnerCtx = spinnerCanvas.getContext("2d");
  spinnerIndex = 0;
  spinnerAngle = 0;
  lastMorph = Date.now();
  animateSpinnerTetromino();
}

// On first load, create the overlay and animate spinner (for SSR/SPA)
window.addEventListener("DOMContentLoaded", () => {
  setupSpinnerOverlay();
  startTetrominoSpinner();
});
