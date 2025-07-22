import { drawMatrix } from "./render";
import {
  createMatrix,
  rotate,
  collide,
  applyGravityStep,
  merge,
  arenaSweep,
} from "./engine";
import { getGravityMode, setGravityMode } from "./game";
import { TILE_SIZE, ARENA_WIDTH, ARENA_HEIGHT } from "./constants";
import { GAME_SETTINGS } from "./settings";

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
const canvas = document.getElementById("tetris") as HTMLCanvasElement;
canvas.width = ARENA_WIDTH * TILE_SIZE;
canvas.height = ARENA_HEIGHT * TILE_SIZE;
const context = canvas.getContext("2d")!;
context.scale(TILE_SIZE, TILE_SIZE);

const lockCascadeToggle = document.getElementById(
  "lock-cascade-toggle"
) as HTMLInputElement | null;
const cascadeSpeedSlider = document.getElementById(
  "cascade-speed"
) as HTMLInputElement | null;
const cascadeSpeedLabel = document.getElementById("cascade-speed-label");
const gravitySpeedSlider = document.getElementById(
  "gravity-speed"
) as HTMLInputElement | null;
const gravitySpeedLabel = document.getElementById("gravity-speed-label");
const overlay = document.getElementById("game-overlay") as HTMLDivElement;
const overlayText = document.getElementById("overlay-text") as HTMLSpanElement;
const restartBtn = document.getElementById("restart") as HTMLButtonElement;
const resumeBtn = document.getElementById("resume-btn") as HTMLButtonElement;
const pauseBtn = document.getElementById("pause-btn") as HTMLButtonElement;

// --- State ---
let paused = false;
let gameOver = false;
let isGravityAnimating = false;
let nextTetromino: Tetromino | null = null;

// --- Game Data ---
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

// --- Backend API: Tetromino ---
async function fetchNextTetromino(): Promise<Tetromino> {
  // Always use relative path, let Vite proxy handle it!
  const res = await fetch("/api/tetromino/next", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Tetromino API error");
  return res.json();
}

// --- Next Piece Preview ---
function updateNextPiecePreview(next: Tetromino | null) {
  const preview = document.getElementById("next-piece");
  if (!preview || !next) return;
  preview.innerHTML = `<b>Next:</b> ${next.shape}`;
  // For a real preview: render matrix here (canvas or emoji)
}

// --- Player (re)set using backend ---
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

// --- Overlay logic ---
function updateOverlay() {
  if (!overlay || !overlayText || !resumeBtn || !restartBtn) return;

  if (gameOver) {
    overlayText.textContent = "Game Over!";
    overlay.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
    restartBtn.classList.remove("hidden");
  } else if (paused) {
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

function setPaused(val: boolean) {
  paused = val;
  updateOverlay();

  if (!paused && !gameOver) {
    requestAnimationFrame(update); // ✅ continue game loop, no reset
  }
}

// --- Restart ---
function restartGame() {
  for (const row of arena) row.fill(0);
  player.level = 1;
  gameOver = false;
  paused = false;
  isGravityAnimating = false;
  dropAccumulator = 0;
  lastTime = performance.now();
  safeResetPlayer(player);
  updateOverlay();
  requestAnimationFrame(update);
}

restartBtn?.addEventListener("click", restartGame);

resumeBtn?.addEventListener("click", () => {
  setPaused(false);
});

// --- Pause Button ---
pauseBtn?.addEventListener("click", () => {
  if (gameOver) return;
  setPaused(!paused);
});

// --- Gravity Animation ---
function startGravityAnimation(callbackAfter?: () => void) {
  isGravityAnimating = true;
  function animate() {
    const changed = applyGravityStep(arena);
    draw();
    if (changed) {
      setTimeout(animate, GAME_SETTINGS.gravityCascadeDelayMs);
    } else {
      isGravityAnimating = false;
      if (callbackAfter) callbackAfter();
    }
  }
  animate();
}

// --- Drop + Animate Gravity ---
function dropAndMaybeAnimateGravity() {
  playerDropWithGameOver(player, arena, getGravityMode());
  if (getGravityMode() && !gameOver) {
    startGravityAnimation();
  }
}

// --- Game Over Drop ---
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
      /* handled elsewhere */
    }
    await safeResetPlayer(player);
    if (collide(arena, player)) {
      if (!gameOver) {
        gameOver = true;
        updateOverlay();
      }
      return;
    }
  }
}

// --- Drawing ---
function draw() {
  context.fillStyle = "#122";
  context.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  drawMatrix(context, arena);
  drawMatrix(context, player.matrix, player.pos, player.color);
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.strokeStyle = "#fff";
  context.lineWidth = 2;
  context.strokeRect(0, 0, canvas.width, canvas.height);
  context.restore();
}

// --- Game Loop ---
function update(time = 0) {
  if (gameOver || paused) {
    draw();
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

  draw();
  requestAnimationFrame(update);
}

// --- Async Safe Player Reset ---
async function safeResetPlayer(player: Player) {
  try {
    await resetPlayerFromBackend(player);
  } catch (e) {
    console.error("Failed to fetch next piece from server:", e);
    setPaused(true); // Pause the game on error
    overlayText.textContent = "Connection Error";
    overlay.classList.add("show");
  }
}

// --- Settings Listeners ---
if (lockCascadeToggle) {
  lockCascadeToggle.checked = GAME_SETTINGS.lockDuringCascade;
  lockCascadeToggle.addEventListener("change", () => {
    GAME_SETTINGS.lockDuringCascade = lockCascadeToggle.checked;
  });
}
if (cascadeSpeedSlider && cascadeSpeedLabel) {
  cascadeSpeedSlider.value = GAME_SETTINGS.gravityCascadeDelayMs.toString();
  cascadeSpeedLabel.textContent = `${cascadeSpeedSlider.value}ms`;
  cascadeSpeedSlider.addEventListener("input", () => {
    GAME_SETTINGS.gravityCascadeDelayMs = Number(cascadeSpeedSlider.value);
    cascadeSpeedLabel.textContent = `${cascadeSpeedSlider.value}ms`;
  });
}
if (gravitySpeedSlider && gravitySpeedLabel) {
  gravitySpeedSlider.value = GAME_SETTINGS.customGravity.toString();
  gravitySpeedLabel.textContent = `${Number(gravitySpeedSlider.value).toFixed(
    2
  )}s`;
  gravitySpeedSlider.addEventListener("input", () => {
    GAME_SETTINGS.customGravity = Number(gravitySpeedSlider.value);
    gravitySpeedLabel.textContent = `${Number(gravitySpeedSlider.value).toFixed(
      2
    )}s`;
  });
}
const gravityToggle = document.getElementById(
  "gravity-toggle"
) as HTMLInputElement | null;
gravityToggle?.addEventListener("change", () =>
  setGravityMode(gravityToggle.checked)
);

// --- Keyboard ---
document.addEventListener("keydown", (event) => {
  if (
    gameOver ||
    (isGravityAnimating && GAME_SETTINGS.lockDuringCascade) ||
    paused
  )
    return;
  switch (event.key) {
    case "ArrowLeft":
      player.pos.x--;
      if (collide(arena, player)) player.pos.x++;
      break;
    case "ArrowRight":
      player.pos.x++;
      if (collide(arena, player)) player.pos.x--;
      break;
    case "ArrowDown":
      dropAndMaybeAnimateGravity();
      break;
    case "Shift":
    case "Alt":
      player.matrix = rotate(player.matrix, -1);
      if (collide(arena, player)) player.matrix = rotate(player.matrix, 1);
      break;
    case " ":
      player.matrix = rotate(player.matrix, 1);
      if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
      break;
  }
});

// --- Touch/Control Buttons ---
document.querySelectorAll(".control-btn").forEach((btn) => {
  btn.addEventListener(
    "touchstart",
    (e) => {
      if ((e as TouchEvent).touches.length > 1) e.preventDefault();
    },
    { passive: false }
  );
});
document.getElementById("left")?.addEventListener("click", () => {
  if (
    gameOver ||
    (isGravityAnimating && GAME_SETTINGS.lockDuringCascade) ||
    paused
  )
    return;
  player.pos.x--;
  if (collide(arena, player)) player.pos.x++;
});
document.getElementById("right")?.addEventListener("click", () => {
  if (
    gameOver ||
    (isGravityAnimating && GAME_SETTINGS.lockDuringCascade) ||
    paused
  )
    return;
  player.pos.x++;
  if (collide(arena, player)) player.pos.x--;
});
document.getElementById("rotate")?.addEventListener("click", () => {
  if (
    gameOver ||
    (isGravityAnimating && GAME_SETTINGS.lockDuringCascade) ||
    paused
  )
    return;
  player.matrix = rotate(player.matrix, 1);
  if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
});
document.getElementById("down")?.addEventListener("click", () => {
  if (
    gameOver ||
    (isGravityAnimating && GAME_SETTINGS.lockDuringCascade) ||
    paused
  )
    return;
  dropAndMaybeAnimateGravity();
});

// --- Start game ---
safeResetPlayer(player)
  .then(() => requestAnimationFrame(update))
  .catch((err) => {
    console.error("Failed to initialize player from backend", err);
    // Optionally: show error UI, etc.
  });
