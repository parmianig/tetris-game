import type { Matrix, Player } from "./types";
import { drawMatrix } from "./render";
import { collide, merge, arenaSweep } from "./engine";
import { ARENA_WIDTH, ARENA_HEIGHT, TILE_SIZE } from "./constants";
import { resetPlayerFromBackend } from "./main";
import { updateOverlay } from "./ui";
import { gameState } from "./gameState";

// Canvas and context MUST be initialized only ONCE and not inside draw()
const canvas = document.getElementById("tetris") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas element #tetris not found");

canvas.width = ARENA_WIDTH * TILE_SIZE;
canvas.height = ARENA_HEIGHT * TILE_SIZE;

const context = canvas.getContext("2d");
if (!context) throw new Error("Failed to get 2D context");

// --- Draw current frame (reset transform/scale every frame) ---
export function draw(arena: Matrix, player: Player) {
  context!.setTransform(1, 0, 0, 1, 0, 0);
  context!.clearRect(0, 0, canvas!.width, canvas!.height);

  context!.scale(TILE_SIZE, TILE_SIZE);

  context!.fillStyle = "#122";
  context!.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  drawMatrix(context!, arena);
  drawMatrix(context!, player.matrix, player.pos, player.color);
}

// --- Drop player by 1 step or lock+reset if collision ---
export function playerDrop(
  player: Player,
  arena: Matrix,
  _gravityMode: boolean
): void {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player.matrix, player.pos, player.color);
    arenaSweep(arena, ARENA_WIDTH);
    resetPlayer(player); // fallback for serverless mode
    if (collide(arena, player)) {
      gameState.gameOver = true;
      updateOverlay("gameover");
    }
  }
}

// --- Safe player reset wrapper (backend first, fallback to overlay error) ---
export async function safeResetPlayer(player: Player) {
  try {
    await resetPlayerFromBackend(player);
  } catch (e) {
    console.error("Failed to fetch next piece from server:", e);
    gameState.paused = true;
    updateOverlay("error");
  }
}

// --- Drop with game over and overlay, async for gravity animation flows ---
export async function playerDropWithGameOver(
  player: Player,
  arena: Matrix,
  _gravityMode: boolean
) {
  if (gameState.gameOver) return;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player.matrix, player.pos, player.color);
    arenaSweep(arena, ARENA_WIDTH);
    // Gravity animation handled externally (by caller)
    await safeResetPlayer(player);
    if (collide(arena, player)) {
      gameState.gameOver = true;
      updateOverlay("gameover");
    }
  }
}

// --- Dummy fallback (serverless/local mode) ---
export function resetPlayer(player: Player) {
  player.pos = { x: 3, y: 0 };
  player.matrix = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ];
  player.origin = { x: 1, y: 1 };
  player.level = 1;
}
