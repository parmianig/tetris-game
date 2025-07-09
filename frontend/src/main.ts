import { createMatrix, drawMatrix, rotate, applyGravity } from "./engine";

const canvas = document.getElementById("tetris") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
context.scale(20, 20);

// Arena setup
const arena = createMatrix(10, 20);

// Active piece
const player = {
  pos: { x: 3, y: 0 },
  matrix: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  level: 1,
};

// Gravity curve
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

const gravityToggle = document.getElementById(
  "gravity-toggle"
) as HTMLInputElement;
if (gravityToggle) {
  gravityToggle.addEventListener("change", () => {
    gravityMode = gravityToggle.checked;
    console.log(`Gravity Mode: ${gravityMode ? "ON" : "OFF"}`);
  });
}

let dropCounter = 0;
let lastTime = 0;

function merge(
  arena: number[][],
  player: { pos: { x: number; y: number }; matrix: number[][] }
) {
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
          if (arena[ay]?.[ax] !== undefined) {
            arena[ay][ax] = value;
          }
        }
      }
    });
  });
}

function collide(
  arena: number[][],
  player: { pos: { x: number; y: number }; matrix: number[][] }
): boolean {
  const m = player.matrix;
  const o = player.pos;

  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < (m[y]?.length ?? 0); x++) {
      if (
        m[y]?.[x] !== 0 &&
        (!arena[y + o.y] || // off the bottom
          (arena[y + o.y]?.[x + o.x] ?? 0) !== 0)
      ) {
        return true;
      }
    }
  }

  return false;
}

function draw() {
  context.fillStyle = "#222";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(context, arena);
  drawMatrix(context, player.matrix, player.pos);
}

function playerDrop() {
  player.pos.y++;

  // Prevent moving beyond arena bottom
  if (collide(arena, player)) {
    player.pos.y--;

    // If we're already at the top row and can't place the piece, game over logic could go here
    merge(arena, player);

    if (gravityMode) {
      applyGravity(arena, player.level);
    }

    arenaSweep(arena);
    resetPlayer(); // must happen after sweep
    updateScore();
  }

  dropCounter = 0;
}

function resetPlayer() {
  player.matrix = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ];
  player.pos.y = 0;
  player.pos.x = (((arena[0]?.length ?? 0) / 2) | 0) - 1;
}

function update(time = 0) {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  dropCounter += deltaTime;

  const gravity = gravityLevels[player.level] ?? 0.01667;
  if (dropCounter >= gravity) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function arenaSweep(arena: number[][]) {
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    if (arena[y]?.every((cell) => cell !== 0)) {
      arena.splice(y, 1);
      arena.unshift(new Array(arena[0]?.length ?? 10).fill(0));
      y++; // check this row again after shift
    }
  }
}

function updateScore() {
  // placeholder
}

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
