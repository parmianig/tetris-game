import type { Player } from "./types";
import { drawMatrix } from "./render";
import type { Matrix } from "./engine";
import { collide, merge, applyGravity, arenaSweep } from "./engine";
import { ARENA_WIDTH, ARENA_HEIGHT, TILE_SIZE } from "./constants";
import { resetPlayerFromBackend } from "./main";
import { updateOverlay } from "./ui";
import { gameState } from "./gameState";

// Canvas setup
const canvas = document.getElementById("tetris") as HTMLCanvasElement;
canvas.width = ARENA_WIDTH * TILE_SIZE;
canvas.height = ARENA_HEIGHT * TILE_SIZE;
const context = canvas.getContext("2d")!;
context.scale(TILE_SIZE, TILE_SIZE);

// Draw current frame
export function draw(arena: Matrix, player: Player) {
  context.fillStyle = "#122";
  context.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  drawMatrix(context, arena);
  drawMatrix(context, player.matrix, player.pos, player.color);
}

// Drop player by 1 step or lock+reset if collision
export function playerDrop(
  player: Player,
  arena: Matrix,
  gravityMode: boolean
): void {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player.matrix, player.pos, player.color);
    if (gravityMode) {
      applyGravity(arena, player.level);
    }
    arenaSweep(arena, ARENA_WIDTH);
    resetPlayer(player); // fallback for serverless mode

    if (collide(arena, player)) {
      gameState.gameOver = true;
      updateOverlay("gameover");
    }
  }
}

// --- Safe player reset wrapper ---
export async function safeResetPlayer(player: Player) {
  try {
    await resetPlayerFromBackend(player); // <-- This is the real async reset
  } catch (e) {
    console.error("Failed to fetch next piece from server:", e);
    gameState.paused = true;
    updateOverlay("error");
  }
}

// Drop with game over and overlay
export async function playerDropWithGameOver(
  player: Player,
  arena: Matrix,
  gravityMode: boolean
) {
  if (gameState.gameOver) return;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player.matrix, player.pos, player.color);
    arenaSweep(arena, ARENA_WIDTH);
    // Gravity animation handled elsewhere
    await safeResetPlayer(player); // <-- Async reset
    if (collide(arena, player)) {
      gameState.gameOver = true;
      updateOverlay("gameover");
    }
  }
}

// Dummy fallback (can be overridden during serverless mode)
export function resetPlayer(player: Player) {
  player.pos = { x: 3, y: 0 };
  player.matrix = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ];
  player.origin = { x: 1, y: 1 }; // Center for classic T
  player.level = 1; // <-- Add this line!
}
