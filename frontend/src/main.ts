import { draw, playerDropWithGameOver, safeResetPlayer } from "./game";
import { bindInput } from "./input";
import {
  createMatrix,
  applyGravityStep,
  arenaSweep,
  type Matrix,
} from "./engine";
import { ARENA_WIDTH, ARENA_HEIGHT } from "./constants";
import { GAME_SETTINGS } from "./settings";
import "./settings-drawer";
import { updateOverlay } from "./ui";
import { gameState } from "./gameState";
import { showSpinner, hideSpinner } from "./spinner/spinner";
import type { Player, Tetromino } from "./types";

// --- DOM Elements ---
const restartBtn = document.getElementById(
  "restart"
) as HTMLButtonElement | null;
const resumeBtn = document.getElementById(
  "resume-btn"
) as HTMLButtonElement | null;
const pauseBtn = document.getElementById(
  "pause-btn"
) as HTMLButtonElement | null;

// --- Game State ---
type PauseReason = "user" | "menu" | null;
let nextTetromino: Tetromino | null = null;

const arena: Matrix = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);
const player: Player = {
  pos: { x: 3, y: 0 },
  matrix: [],
  color: "",
  shape: "I",
  level: 1,
  origin: { x: 1, y: 1 },
  rotation: 0,
};

const gravityLevels: number[] = [
  0, 1.0, 0.793, 0.618, 0.473, 0.355, 0.262, 0.19, 0.135, 0.094, 0.064, 0.043,
  0.028, 0.018, 0.012, 0.007,
];

let dropAccumulator = 0;
let lastTime = 0;

// --- API ---
async function fetchNextTetromino(): Promise<Tetromino> {
  const res = await fetch("/api/tetromino/next", { cache: "no-store" });
  if (!res.ok) throw new Error("Tetromino API error");
  return res.json();
}

// --- Player Reset (from backend) ---
export async function resetPlayerFromBackend(player: Player): Promise<void> {
  const tetro = nextTetromino ?? (await fetchNextTetromino());
  player.matrix = tetro.matrix.map((row) => [...row]) as Matrix;
  player.color = tetro.color;
  player.shape = tetro.shape;

  // Defensive: ensure .origin from backend, else fallback to matrix center
  let origin: { x: number; y: number };
  if (
    tetro.origin &&
    typeof tetro.origin.x === "number" &&
    typeof tetro.origin.y === "number" &&
    Number.isFinite(tetro.origin.x) &&
    Number.isFinite(tetro.origin.y)
  ) {
    origin = { x: tetro.origin.x, y: tetro.origin.y };
    player.origin = { x: tetro.origin.x, y: tetro.origin.y };
    player.rotation = 0;
  } else {
    origin = {
      x: (player.matrix[0]?.length ?? 4) / 2 - 0.5,
      y: (player.matrix.length ?? 4) / 2 - 0.5,
    };
    player.origin = origin;
    player.rotation = 0;
  }

  player.pos.y = 0;
  player.pos.x = Math.floor(ARENA_WIDTH / 2) - Math.round(origin.x);
  player.level = 1;
  nextTetromino = await fetchNextTetromino();
  updateNextPiecePreview(nextTetromino);
}

// --- Pause/Resume Logic ---
function setPaused(val: boolean, reason: PauseReason = "user") {
  if (val) {
    gameState.paused = true;
    updateOverlay("paused", reason);
  } else {
    gameState.paused = false;
    updateOverlay("hidden");
  }
  if (!gameState.paused && !gameState.gameOver) {
    requestAnimationFrame(update);
  }
}
(window as any).setPaused = (val: boolean, reason: PauseReason = "menu") =>
  setPaused(val, reason);

// --- Pause/Resume Event Handlers ---
pauseBtn?.addEventListener("click", () => {
  if (gameState.gameOver) return;
  setPaused(!gameState.paused, "user");
});
resumeBtn?.addEventListener("click", () => setPaused(false));

// --- Restart ---
async function restartGame() {
  for (const row of arena) row.fill(0);
  player.level = 1;
  gameState.gameOver = false;
  gameState.paused = false;
  gameState.isGravityAnimating = false;
  dropAccumulator = 0;
  lastTime = 0;
  await safeResetPlayer(player);
  updateOverlay("hidden");
  requestAnimationFrame(update);
}
restartBtn?.addEventListener("click", () => {
  restartGame().catch(console.error);
});

// --- Next Piece Preview ---
function updateNextPiecePreview(next: Tetromino | null) {
  const canvas = document.getElementById(
    "next-piece-canvas"
  ) as HTMLCanvasElement | null;
  if (!canvas || !next || !next.matrix) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  drawMiniTetrominoGlass(ctx, next);
}

// --- Draws a glassmorphism ("liquid glass") mini tetromino ---
function drawMiniTetrominoGlass(
  ctx: CanvasRenderingContext2D,
  tetro: Tetromino
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!tetro?.matrix?.length || !Array.isArray(tetro.matrix)) return;
  const mat = tetro.matrix;
  const N = mat.length;

  // Calculate bounding box
  let minX = N,
    maxX = -1,
    minY = N,
    maxY = -1;
  for (let y = 0; y < N; ++y) {
    const row = mat[y];
    if (!row) continue; // Defensive, silences TS2532
    for (let x = 0; x < N; ++x) {
      if (row[x]) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (minX > maxX || minY > maxY) return;

  const blockSize = Math.floor(
    Math.min(
      ctx.canvas.width / (maxX - minX + 1),
      ctx.canvas.height / (maxY - minY + 1)
    ) * 0.9
  );
  const offsetX = Math.floor(
    (ctx.canvas.width - blockSize * (maxX - minX + 1)) / 2 - minX * blockSize
  );
  const offsetY = Math.floor(
    (ctx.canvas.height - blockSize * (maxY - minY + 1)) / 2 - minY * blockSize
  );

  for (let y = 0; y < N; ++y) {
    const row = mat[y];
    if (!row) continue;
    for (let x = 0; x < N; ++x) {
      if (!row[x]) continue;
      const bx = x * blockSize + offsetX;
      const by = y * blockSize + offsetY;

      // 1. Glassy base gradient
      const grad = ctx.createLinearGradient(
        bx,
        by,
        bx + blockSize,
        by + blockSize
      );
      grad.addColorStop(0, "rgba(255,255,255,0.78)");
      grad.addColorStop(0.14, tetro.color);
      grad.addColorStop(0.65, "rgba(120,200,255,0.17)");
      grad.addColorStop(1, "rgba(0,0,0,0.13)");

      ctx.save();
      ctx.globalAlpha = 0.94;
      ctx.fillStyle = grad;
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 7;
      ctx.fillRect(bx, by, blockSize - 1, blockSize - 1);
      ctx.restore();

      // 2. Glass reflection (top)
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(
        bx + blockSize * 0.56,
        by + blockSize * 0.36,
        blockSize * 0.34,
        blockSize * 0.17,
        Math.PI / 9,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.restore();

      // 3. Border glass
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(200,220,255,0.22)";
      ctx.shadowColor = "rgba(100,180,255,0.24)";
      ctx.shadowBlur = 2;
      ctx.strokeRect(bx, by, blockSize - 1.2, blockSize - 1.2);
      ctx.restore();
    }
  }
}

// --- Gravity Animation ---
function startGravityAnimation(callbackAfter?: () => void) {
  gameState.isGravityAnimating = true;
  function animate() {
    const changed = applyGravityStep(arena);
    draw(arena, player);
    if (changed) {
      setTimeout(animate, GAME_SETTINGS.gravityCascadeDelayMs);
    } else {
      arenaSweep(arena, ARENA_WIDTH);
      gameState.isGravityAnimating = false;
      if (callbackAfter) callbackAfter();
    }
  }
  animate();
}

function dropAndMaybeAnimateGravity() {
  playerDropWithGameOver(player, arena, GAME_SETTINGS.gravityMode);
  if (GAME_SETTINGS.gravityMode && !gameState.gameOver) {
    startGravityAnimation();
  }
}

// --- Game Loop ---
function update(time = 0) {
  if (gameState.gameOver || gameState.paused) {
    draw(arena, player);
    return;
  }
  if (!lastTime) lastTime = time;
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  const gravity =
    GAME_SETTINGS.customGravity ||
    gravityLevels[Math.min(player.level, gravityLevels.length - 1)] ||
    1.0;

  if (!gameState.isGravityAnimating) {
    dropAccumulator += deltaTime;
    if (dropAccumulator >= gravity) {
      dropAndMaybeAnimateGravity();
      dropAccumulator = 0;
    }
  }
  draw(arena, player);
  requestAnimationFrame(update);
}

// --- Input Setup ---
bindInput(
  player,
  arena,
  () =>
    gameState.gameOver ||
    gameState.paused ||
    (gameState.isGravityAnimating && GAME_SETTINGS.lockDuringCascade),
  dropAndMaybeAnimateGravity
);

// --- Listen for style changes for glass/traditional preview ---
window.addEventListener("tetromino-style-change", () => {
  updateNextPiecePreview(nextTetromino);
});

// --- Start Game ---
showSpinner();
safeResetPlayer(player)
  .then(() => {
    hideSpinner();
    requestAnimationFrame(update);
  })
  .catch((err) => {
    showSpinner("Failed to connect to backend. Please wait…");
    console.error("Failed to initialize player from backend", err);
  });
