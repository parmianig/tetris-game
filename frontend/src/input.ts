import { attemptSRSRotation, collide, wrapRotation } from "./engine";
import type { Matrix, Player } from "./types";

const buttonMap = {
  "dpad-left": (player: Player, arena: Matrix) => {
    player.pos.x--;
    if (collide(arena, player)) player.pos.x++;
  },
  "dpad-right": (player: Player, arena: Matrix) => {
    player.pos.x++;
    if (collide(arena, player)) player.pos.x--;
  },
  "dpad-down": (_player: Player, _arena: Matrix, drop: () => void) => {
    drop();
  },
  "dpad-up": (player: Player, arena: Matrix) => {
    tryRotate(player, arena, 1);
  },
  "btn-a": (player: Player, arena: Matrix) => {
    tryRotate(player, arena, 1);
  },
  "btn-b": (player: Player, arena: Matrix) => {
    tryRotate(player, arena, -1);
  },
  "btn-start": () => {
    const pauseBtn = document.getElementById(
      "pause-btn"
    ) as HTMLButtonElement | null;
    if (pauseBtn) pauseBtn.click();
    else if ((window as any).setPaused)
      (window as any).setPaused(!(window as any).gameState?.paused, "user");
  },
  "btn-select": () => {
    // Add select logic if needed
  },
};

function tryRotate(player: Player, arena: Matrix, dir: 1 | -1) {
  const result = attemptSRSRotation(player, arena, dir);
  if (result.rotated) {
    player.matrix = result.matrix;
    player.pos.x += result.offset.x;
    player.pos.y += result.offset.y;
    player.rotation = wrapRotation(player.rotation + dir);
  }
}

export function bindInput(
  player: Player,
  arena: Matrix,
  isDisabled: () => boolean,
  drop: () => void
) {
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
        if (e.shiftKey) {
          tryRotate(player, arena, -1); // Shift+ArrowUp = CCW
        } else {
          tryRotate(player, arena, 1); // ArrowUp = CW
        }
        break;
      case "x":
        tryRotate(player, arena, 1);
        break;
      case "z":
        tryRotate(player, arena, -1);
        break;
      case " ":
        drop();
        break;
      case "Enter": {
        // Block scope for const to avoid SonarQube S6836
        const pauseBtn = document.getElementById(
          "pause-btn"
        ) as HTMLButtonElement | null;
        if (pauseBtn) pauseBtn.click();
        break;
      }
    }
  });

  // --- Button controls: tap/hold ---
  Object.entries(buttonMap).forEach(([id, fn]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    let interval: number | null = null;
    let active = false;

    const fire = () => {
      if (isDisabled()) return;
      if (fn.length === 4) (fn as any)(player, arena, isDisabled, drop);
      else if (fn.length === 3) (fn as any)(player, arena, drop);
      else (fn as any)(player, arena);
    };

    function startPress(e: Event) {
      e.preventDefault();
      if (active) return;
      active = true;
      fire();
      // Only auto-repeat for D-Pad, not Start/Pause
      if (id.startsWith("dpad-")) interval = window.setInterval(fire, 100);
    }
    function stopPress() {
      active = false;
      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }
    }
    btn.addEventListener("mousedown", startPress);
    btn.addEventListener("touchstart", startPress, { passive: false });
    btn.addEventListener("mouseup", stopPress);
    btn.addEventListener("mouseleave", stopPress);
    btn.addEventListener("touchend", stopPress);
    btn.addEventListener("touchcancel", stopPress);
  });
}
