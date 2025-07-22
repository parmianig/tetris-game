import { draw } from "./game";
import { bindInput } from "./input";
import {
  createMatrix,
  collide,
  merge,
  applyGravityStep,
  arenaSweep,
} from "./engine";
import { ARENA_WIDTH, ARENA_HEIGHT } from "./constants";
import { GAME_SETTINGS } from "./settings";

// Expose for vanilla JS
(window as any).GAME_SETTINGS = GAME_SETTINGS;

// Import settings drawer
import "./settings-drawer";

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
  matrix: number[][];
  color: string;
  shape: string;
  level: number;
}

// --- DOM Elements ---
const overlay = document.getElementById("game-overlay") as HTMLDivElement;
const overlayText = document.getElementById("overlay-text") as HTMLSpanElement;
const restartBtn = document.getElementById("restart") as HTMLButtonElement;
const resumeBtn = document.getElementById("resume-btn") as HTMLButtonElement;
const pauseBtn = document.getElementById("pause-btn") as HTMLButtonElement;

// --- Game State ---
type PauseReason = "user" | "menu" | null;
let paused: PauseReason = null;
let gameOver = false;
let isGravityAnimating = false;
let nextTetromino: Tetromino | null = null;

const arena = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);
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
async function resetPlayerFromBackend(player: Player): Promise<void> {
  const tetro = nextTetromino ?? (await fetchNextTetromino());
  player.matrix = tetro.matrix;
  player.color = tetro.color;
  player.shape = tetro.shape;
  player.pos.y = 0;
  player.pos.x = Math.floor(
    (ARENA_WIDTH - (player.matrix[0]?.length || 0)) / 2
  );
  player.level = 1;
  nextTetromino = await fetchNextTetromino();
  updateNextPiecePreview(nextTetromino);
}

// --- UI Overlay ---
function updateOverlay() {
  if (!overlay || !overlayText || !resumeBtn || !restartBtn) return;
  if (gameOver) {
    overlayText.textContent = "Game Over!";
    overlay.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
    restartBtn.classList.remove("hidden");
  } else if (paused === "user") {
    overlayText.textContent = "Paused";
    overlay.classList.remove("hidden");
    resumeBtn.classList.remove("hidden");
    restartBtn.classList.add("hidden");
  } else {
    overlay.classList.add("hidden");
    resumeBtn.classList.add("hidden");
    restartBtn.classList.add("hidden");
  }
}

// --- Pause/Resume Logic ---
function setPaused(val: boolean, reason: PauseReason = "user") {
  if (val) {
    paused = reason;
  } else {
    paused = null;
  }
  updateOverlay();
  if (!paused && !gameOver) {
    requestAnimationFrame(update);
  }
}
(window as any).setPaused = (val: boolean, reason: PauseReason = "menu") =>
  setPaused(val, reason);

// --- Pause/Resume Event Handlers ---
pauseBtn?.addEventListener("click", () => {
  if (gameOver) return;
  setPaused(paused ? false : true, "user");
});
resumeBtn?.addEventListener("click", () => setPaused(false));

// --- Restart ---
function restartGame() {
  for (const row of arena) row.fill(0);
  player.level = 1;
  gameOver = false;
  paused = null;
  isGravityAnimating = false;
  dropAccumulator = 0;
  lastTime = performance.now();
  safeResetPlayer(player);
  updateOverlay();
  requestAnimationFrame(update);
}

restartBtn?.addEventListener("click", restartGame);

// --- Next Piece Preview ---
function updateNextPiecePreview(next: Tetromino | null) {
  const preview = document.getElementById("next-piece");
  if (!preview || !next) return;
  preview.innerHTML = `<b>Next:</b> ${next.shape}`;
}

// --- Gravity Animation ---
function startGravityAnimation(callbackAfter?: () => void) {
  isGravityAnimating = true;
  function animate() {
    const changed = applyGravityStep(arena);
    draw(arena, player);
    if (changed) {
      setTimeout(animate, GAME_SETTINGS.gravityCascadeDelayMs);
    } else {
      // 🔴 After gravity animation, sweep for completed lines!
      arenaSweep(arena, ARENA_WIDTH);
      isGravityAnimating = false;
      if (callbackAfter) callbackAfter();
    }
  }
  animate();
}

function dropAndMaybeAnimateGravity() {
  playerDropWithGameOver(player, arena, GAME_SETTINGS.gravityMode);
  if (GAME_SETTINGS.gravityMode && !gameOver) {
    startGravityAnimation();
  }
}

async function playerDropWithGameOver(
  player: Player,
  arena: number[][],
  gravityMode: boolean
) {
  if (gameOver) return;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player.matrix, player.pos);
    arenaSweep(arena, ARENA_WIDTH);
    if (gravityMode) {
      // handled in gravity animation
    }
    await safeResetPlayer(player);
    if (collide(arena, player)) {
      gameOver = true;
      updateOverlay();
    }
  }
}

// --- Game Loop ---
function update(time = 0) {
  if (gameOver || paused) {
    draw(arena, player);
    return;
  }

  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  const gravity =
    GAME_SETTINGS.customGravity ||
    gravityLevels[Math.min(player.level, gravityLevels.length - 1)] ||
    1.0;

  if (!isGravityAnimating) {
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
    overlayText.textContent = "Connection Error";
    overlay.classList.add("show");
  }
}

// --- Input Setup ---
bindInput(
  player,
  arena,
  () =>
    gameOver ||
    Boolean(paused) ||
    (isGravityAnimating && GAME_SETTINGS.lockDuringCascade),
  dropAndMaybeAnimateGravity
);

// --- Start Game ---
safeResetPlayer(player)
  .then(() => requestAnimationFrame(update))
  .catch((err) => {
    console.error("Failed to initialize player from backend", err);
  });
