import {
  attemptSRSRotation,
  collide,
  type Matrix,
  wrapRotation,
} from "./engine";
import type { Player } from "./types";

export function bindInput(
  player: Player,
  arena: Matrix,
  isDisabled: () => boolean,
  drop: () => void
) {
  /**
   * Try to rotate via SRS.
   * On success, update player.matrix, pos, and rotation state.
   */
  function tryRotate(dir: 1 | -1) {
    const result = attemptSRSRotation(player, arena, dir);
    if (result.rotated) {
      player.matrix = result.matrix;
      player.pos.x += result.offset.x;
      player.pos.y += result.offset.y;
      player.rotation = wrapRotation(player.rotation + dir);
    }
  }

  // --- Keyboard controls ---
  document.addEventListener("keydown", (e) => {
    if (isDisabled()) return;

    switch (e.key) {
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
      case "x":
        tryRotate(1);
        break;

      case "z":
        tryRotate(-1);
        break;
    }
  });

  // --- Touch / Button helpers ---
  const safe = (fn: () => void) => {
    if (!isDisabled()) fn();
  };

  function setupButton(id: string, fn: () => void) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("mousedown", () => safe(fn));
    btn.addEventListener(
      "touchstart",
      (ev) => {
        ev.preventDefault();
        safe(fn);
      },
      { passive: false }
    );
  }

  setupButton("left", () => {
    player.pos.x--;
    if (collide(arena, player)) player.pos.x++;
  });
  setupButton("right", () => {
    player.pos.x++;
    if (collide(arena, player)) player.pos.x--;
  });
  setupButton("down", () => drop());

  setupButton("rotate", () => safe(() => tryRotate(1)));
  setupButton("rotate-ccw", () => safe(() => tryRotate(-1)));

  // (Optional) Game-Boy controls:
  setupButton("btn-a", () => safe(() => tryRotate(1)));
  setupButton("btn-b", () => safe(() => tryRotate(-1)));
  setupButton("btn-start", () =>
    safe(() => {
      if ((window as any).setPaused) (window as any).setPaused(true);
    })
  );
}
