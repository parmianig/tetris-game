import { rotate, collide, type Matrix } from "./engine";
import type { Player } from "./types";

export function bindInput(
  player: Player,
  arena: Matrix,
  isDisabled: () => boolean,
  drop: () => void
) {
  // Keyboard controls
  document.addEventListener("keydown", (event) => {
    if (isDisabled()) return;

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
        drop();
        break;
      case "ArrowUp":
        if (event.shiftKey) {
          player.matrix = rotate(player.matrix, -1); // Counterclockwise
          if (collide(arena, player)) player.matrix = rotate(player.matrix, 1);
        } else {
          player.matrix = rotate(player.matrix, 1); // Clockwise
          if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
        }
        break;
    }
  });

  // --- Ergonomic mobile/desktop controls ---
  // Helper for safe action
  const safe = (action: () => void) => {
    if (!isDisabled()) action();
  };

  // Prolonged tap logic (for left, right, down)
  function setupProlongedButton(
    id: string,
    action: () => void,
    repeatDelay = 90, // ms between repeats (after hold)
    initialDelay = 350 // ms before repeat starts (on first press)
  ) {
    const btn = document.getElementById(id);
    if (!btn) return;

    let interval: any = null;
    let timeout: any = null;

    const handleStart = (e: Event) => {
      e.preventDefault();
      safe(action); // Always trigger once immediately on press
      timeout = setTimeout(() => {
        interval = setInterval(() => safe(action), repeatDelay);
      }, initialDelay);
    };
    const handleEnd = () => {
      clearTimeout(timeout);
      clearInterval(interval);
      timeout = null;
      interval = null;
    };

    btn.addEventListener("touchstart", handleStart, { passive: false });
    btn.addEventListener("mousedown", handleStart);
    btn.addEventListener("touchend", handleEnd);
    btn.addEventListener("touchcancel", handleEnd);
    btn.addEventListener("mouseup", handleEnd);
    btn.addEventListener("mouseleave", handleEnd);
  }

  // Move functions using real Tetris logic
  const moveLeft = () => {
    player.pos.x--;
    if (collide(arena, player)) player.pos.x++;
  };
  const moveRight = () => {
    player.pos.x++;
    if (collide(arena, player)) player.pos.x--;
  };
  const moveDown = () => {
    drop();
  };

  setupProlongedButton("left", moveLeft, 120, 700);
  setupProlongedButton("right", moveRight, 120, 700);
  setupProlongedButton("down", moveDown, 120, 700);

  // Single tap for rotate (no need for prolonged tap)
  document.getElementById("rotate")?.addEventListener("click", () =>
    safe(() => {
      player.matrix = rotate(player.matrix, 1);
      if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
    })
  );
}
