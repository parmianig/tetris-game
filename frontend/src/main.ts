import { createMatrix, drawMatrix, rotate, collide } from "./engine";
import { playerDrop, getGravityMode, setGravityMode } from "./game";
import { TILE_SIZE, ARENA_WIDTH, ARENA_HEIGHT } from "./constants";

const canvas = document.getElementById("tetris") as HTMLCanvasElement;
canvas.width = ARENA_WIDTH * TILE_SIZE; // Ensure these are set dynamically!
canvas.height = ARENA_HEIGHT * TILE_SIZE;
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

// Arena setup
const arena = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);

// Player state
const player: Player = {
  pos: { x: 3, y: 0 },
  matrix: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  level: 1,
};

// Gravity (seconds per drop per level, Tetris-style)
const gravityLevels: number[] = [
  0, // unused (index 0)
  1.0, // Level 1
  0.793, // Level 2
  0.618, // Level 3
  0.473, // etc...
  0.355,
  0.262,
  0.19,
  0.135,
  0.094,
  0.064,
  0.043,
  0.028,
  0.018,
  0.012,
  0.007,
];

let dropAccumulator = 0;
let lastTime = 0;

// Toggle gravity mode
const gravityToggle = document.getElementById(
  "gravity-toggle"
) as HTMLInputElement | null;
gravityToggle?.addEventListener("change", () => {
  setGravityMode(gravityToggle.checked);
});

// Merge tetromino into arena
function merge(arena: number[][], player: Player) {
  if (!arena.length || !arena[0]) return;
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const ay = y + player.pos.y;
        const ax = x + player.pos.x;
        if (
          ay >= 0 &&
          ay < arena.length &&
          ax >= 0 &&
          ax < (arena[0]?.length ?? 0)
        ) {
          arena[ay]![ax] = value;
        }
      }
    });
  });
}

// Render loop with white border after scaling
function draw() {
  context.fillStyle = "#222";
  context.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT); // in grid units (scaled)

  drawMatrix(context, arena);
  drawMatrix(context, player.matrix, player.pos);

  // Draw white border at pixel-perfect edge of canvas
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for border
  context.strokeStyle = "#fff";
  context.lineWidth = 2;
  context.strokeRect(0, 0, canvas.width, canvas.height);
  context.restore();
}

// Frame-based update (seconds per drop)
function update(time = 0) {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  const gravity =
    gravityLevels[Math.min(player.level, gravityLevels.length - 1)] ?? 1.0;

  dropAccumulator += deltaTime;
  if (dropAccumulator >= gravity) {
    playerDrop(player, arena, getGravityMode());
    dropAccumulator = 0;
  }

  draw();
  requestAnimationFrame(update);
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
      playerDrop(player, arena, getGravityMode());
      break;
    case "Shift":
    case "Alt": // Option on Mac
      player.matrix = rotate(player.matrix, -1);
      if (collide(arena, player)) player.matrix = rotate(player.matrix, 1);
      break;
    case " ":
      player.matrix = rotate(player.matrix, 1);
      if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
      break;
  }
});

// Touch/mobile controls
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
  if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
});
document.getElementById("down")?.addEventListener("click", () => {
  playerDrop(player, arena, getGravityMode());
});

update();
