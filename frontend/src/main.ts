import { createMatrix, drawMatrix, rotate, applyGravity } from "./engine";

const TILE_SIZE = 20;
const ARENA_WIDTH = 10;
const ARENA_HEIGHT = 20;

const canvas = document.getElementById("tetris") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
context.scale(TILE_SIZE, TILE_SIZE);

interface Position {
  x: number;
  y: number;
}

interface Player {
  pos: Position;
  matrix: number[][];
  level: number;
}

const arena: number[][] = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);

const player: Player = {
  pos: { x: 3, y: 0 },
  matrix: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  level: 1,
};

const gravityLevels: number[] = [
  0, // unused
  0.01667,
  0.021017,
  0.026977,
  0.035256,
  0.04693,
  0.06361,
  0.0879,
  0.1236,
  0.1775,
  0.2598,
  0.388,
  0.59,
  0.92,
  1.46,
  2.36,
];

let gravityMode = false;
let dropAccumulator = 0;
let lastTime = 0;

// Toggle gravity mode
const gravityToggle = document.getElementById(
  "gravity-toggle"
) as HTMLInputElement;
gravityToggle?.addEventListener("change", () => {
  gravityMode = gravityToggle.checked;
});

// Merge tetromino into arena
function merge(arena: number[][], player: Player): void {
  const arenaWidth = arena[0]?.length;
  if (arenaWidth === undefined) return; // Avoid operating on undefined

  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const ay = y + player.pos.y;
        const ax = x + player.pos.x;
        if (
          ay >= 0 &&
          ay < arena.length &&
          ax >= 0 &&
          ax < arenaWidth &&
          arena[ay] !== undefined
        ) {
          arena[ay][ax] = value;
        }
      }
    });
  });
}

// Check collision
function collide(arena: number[][], player: Player): boolean {
  const { matrix, pos } = player;

  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    if (!row) continue;

    for (let x = 0; x < row.length; x++) {
      const ay = y + pos.y;
      const ax = x + pos.x;

      if (row[x] !== 0 && (arena[ay]?.[ax] ?? 1) !== 0) {
        return true;
      }
    }
  }

  return false;
}

// Draw canvas
function draw(): void {
  context.fillStyle = "#222";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(context, arena);
  drawMatrix(context, player.matrix, player.pos);
}

// Drop logic
function playerDrop(): void {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    if (gravityMode) {
      applyGravity(arena, player.level);
    }
    arenaSweep(arena);
    resetPlayer();
    if (collide(arena, player)) {
      console.log("Game Over");
    }
  }
}

// Reset piece
function resetPlayer(): void {
  player.matrix = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ];
  player.pos.y = 0;
  player.pos.x = ((ARENA_WIDTH / 2) | 0) - 1;
}

// Frame-based update
function update(time = 0): void {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  const gravity =
    gravityLevels[Math.min(player.level, gravityLevels.length - 1)] ?? 0.01667;
  dropAccumulator += deltaTime / gravity;

  while (dropAccumulator >= 1) {
    playerDrop();
    dropAccumulator--;
  }

  draw();
  requestAnimationFrame(update);
}

// Clear full lines
function arenaSweep(arena: number[][]): void {
  for (let y = arena.length - 1; y >= 0; y--) {
    if (arena[y]?.every((cell) => cell !== 0)) {
      arena.splice(y, 1);
      arena.unshift(new Array(ARENA_WIDTH).fill(0));
      y++;
    }
  }
}

// Keyboard controls
document.addEventListener("keydown", (event) => {
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
      playerDrop();
      break;
    case "Shift":
    case "Control":
      player.matrix = rotate(player.matrix, -1);
      if (collide(arena, player)) player.matrix = rotate(player.matrix, 1);
      break;
    case " ":
      player.matrix = rotate(player.matrix, 1);
      if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
      break;
  }
});

// Mobile button controls
document.getElementById("left")?.addEventListener("click", () => {
  player.pos.x--;
  if (collide(arena, player)) player.pos.x++;
});

document.getElementById("right")?.addEventListener("click", () => {
  player.pos.x++;
  if (collide(arena, player)) player.pos.x--;
});

document.getElementById("rotate")?.addEventListener("click", () => {
  player.matrix = rotate(player.matrix, 1);
  if (collide(arena, player)) {
    player.matrix = rotate(player.matrix, -1);
  }
});

document.getElementById("down")?.addEventListener("click", () => {
  playerDrop();
});

update();
