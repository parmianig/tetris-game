import type { Player } from "./types";
import { collide, merge, applyGravity, arenaSweep } from "./engine";
import { ARENA_WIDTH } from "./constants";
let _gravityMode = false;

export function getGravityMode(): boolean {
  return _gravityMode;
}

export function setGravityMode(val: boolean): void {
  _gravityMode = val;
}

export function resetPlayer(player: Player) {
  player.matrix = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ];
  player.pos.y = 0;
  player.pos.x = ((ARENA_WIDTH / 2) | 0) - 1;
}

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
    // Game over detection
    if (collide(arena, player)) {
      console.log("Game Over");
    }
  }
}
export interface Position {
  x: number;
  y: number;
}

export function createPlayer(): Player {
  return {
    pos: { x: 3, y: 0 },
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    level: 1,
  };
}

export function sweepArena(arena: number[][]): void {
  const width = arena[0]?.length ?? 10; // fallback to default width if arena is empty
  for (let y = arena.length - 1; y >= 0; y--) {
    if (arena[y]?.every((cell) => cell !== 0)) {
      arena.splice(y, 1);
      arena.unshift(new Array(width).fill(0));
      y++;
    }
  }
}
