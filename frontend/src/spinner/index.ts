import { SPINNER_TETROMINOS } from "./tetrominoDefs";
import { interpolateMatrix } from "./morph";
import { drawSpinnerTetromino } from "./draw";

// Spinner state
let spinnerIndex = 0;
let spinnerAngle = 0;
let spinnerCanvas: HTMLCanvasElement | null = null;
let spinnerCtx: CanvasRenderingContext2D | null = null;
let lastMorph = Date.now();
const morphDuration = 650;
const showDuration = 1100;

function animateSpinnerTetromino() {
  if (!spinnerCanvas || !spinnerCtx || SPINNER_TETROMINOS.length === 0) return;

  const now = Date.now();
  const elapsed = now - lastMorph;
  const from = SPINNER_TETROMINOS[spinnerIndex % SPINNER_TETROMINOS.length];
  const to = SPINNER_TETROMINOS[(spinnerIndex + 1) % SPINNER_TETROMINOS.length];

  if (!from || !to) return;

  if (elapsed < showDuration) {
    drawSpinnerTetromino(spinnerCtx, from.matrix, from.color, spinnerAngle);
  } else if (elapsed < showDuration + morphDuration) {
    const t = (elapsed - showDuration) / morphDuration;
    const mat = interpolateMatrix(from.matrix, to.matrix, t);
    const color = t < 0.5 ? from.color : to.color;
    drawSpinnerTetromino(spinnerCtx, mat, color, spinnerAngle, 1);
  } else {
    lastMorph = now;
    spinnerIndex = (spinnerIndex + 1) % SPINNER_TETROMINOS.length;
  }

  spinnerAngle += 0.08;
  requestAnimationFrame(animateSpinnerTetromino);
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

export function showSpinner(msg = "Loading game…") {
  const overlay = document.getElementById("spinner-overlay");
  const msgEl = document.getElementById("spinner-message");
  if (overlay) overlay.classList.add("show");
  if (msgEl) msgEl.textContent = msg;
  startTetrominoSpinner();
}

export function hideSpinner() {
  const overlay = document.getElementById("spinner-overlay");
  if (overlay) overlay.classList.remove("show");
}
