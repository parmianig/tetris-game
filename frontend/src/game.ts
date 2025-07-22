import type { Player } from "./types";
import { drawMatrix } from "./render";
import { collide, merge, applyGravity, arenaSweep } from "./engine";
import { ARENA_WIDTH, ARENA_HEIGHT, TILE_SIZE } from "./constants";

// Canvas setup
const canvas = document.getElementById("tetris") as HTMLCanvasElement;
canvas.width = ARENA_WIDTH * TILE_SIZE;
canvas.height = ARENA_HEIGHT * TILE_SIZE;
const context = canvas.getContext("2d")!;
context.scale(TILE_SIZE, TILE_SIZE);

// Draw current frame
export function draw(arena: number[][], player: Player) {
  context.fillStyle = "#122";
  context.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  drawMatrix(context, arena);
  drawMatrix(context, player.matrix, player.pos, player.color);
}

// Drop player by 1 step or lock+reset if collision
export function playerDrop(
  player: Player,
  arena: number[][],
  gravityMode: boolean
): void {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player.matrix, player.pos);

    if (gravityMode) {
      applyGravity(arena, player.level);
    }

    arenaSweep(arena, ARENA_WIDTH);
    resetPlayer(player);

    if (collide(arena, player)) {
      console.log("Game Over");
    }
  }
}

// Dummy fallback (can be overridden during serverless mode)
function resetPlayer(player: Player) {
  player.pos = { x: 3, y: 0 };
  player.matrix = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ];
}
