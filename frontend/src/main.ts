import { draw, playerDropWithGameOver } from "./game";
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
if (!BACKEND_URL) throw new Error("Missing VITE_BACKEND_URL env variable");

(window as any).GAME_SETTINGS = GAME_SETTINGS;

// --- Types ---
export interface Tetromino {
  shape: string;
  matrix: number[][];
  color: string;
}
interface Position {
  x: number;
  y: number;
}
interface Player {
  pos: Position;
  matrix: Matrix;
  color: string;
  shape: string;
  level: number;
}

// --- DOM Elements ---
const overlay = document.getElementById(
  "game-overlay"
) as HTMLDivElement | null;
const overlayText = document.getElementById(
  "overlay-text"
) as HTMLSpanElement | null;
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
let pauseReason: PauseReason = null; // Only for overlay logic
let nextTetromino: Tetromino | null = null;

const arena: Matrix = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);
const player: Player = {
  pos: { x: 3, y: 0 },
  matrix: [],
  color: "",
  shape: "",
  level: 1,
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
  player.pos.y = 0;
  player.pos.x = Math.floor(
    (ARENA_WIDTH - (player.matrix[0]?.length ?? 0)) / 2
  );
  player.level = 1;
  nextTetromino = await fetchNextTetromino();
  updateNextPiecePreview(nextTetromino);
}

// --- Pause/Resume Logic ---
function setPaused(val: boolean, reason: PauseReason = "user") {
  if (val) {
    gameState.paused = true;
    updateOverlay("paused", reason); // <-- pass the reason!
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
  gameState.gameOver = false; // <-- Use shared state!
  gameState.paused = false;
  gameState.isGravityAnimating = false;
  pauseReason = null;
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
  const preview = document.getElementById("next-piece");
  if (!preview || !next) return;
  preview.innerHTML = `<b>Next:</b> ${next.shape}`;
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

// --- Safe player reset wrapper ---
async function safeResetPlayer(player: Player) {
  try {
    await resetPlayerFromBackend(player);
  } catch (e) {
    console.error("Failed to fetch next piece from server:", e);
    setPaused(true);
    if (overlayText) overlayText.textContent = "Connection Error";
    if (overlay) overlay.classList.add("show");
  }
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

// --- Start Game ---
safeResetPlayer(player)
  .then(() => requestAnimationFrame(update))
  .catch((err) => {
    console.error("Failed to initialize player from backend", err);
  });
