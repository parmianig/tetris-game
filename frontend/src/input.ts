import type { Player } from "./types";
import { rotate, collide } from "./engine";
import { playerDrop, getGravityMode } from "./game";

// Handles keyboard controls for Tetris.
// Rotation: Option (Alt) or Shift = counterclockwise, Space = clockwise.

export function bindInput(player: Player, arena: number[][]) {
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
      case "Alt": // Option key (⌥) on macOS, Alt on Win/Linux
      case "Shift":
        player.matrix = rotate(player.matrix, -1);
        if (collide(arena, player)) player.matrix = rotate(player.matrix, 1);
        break;
      case " ":
        player.matrix = rotate(player.matrix, 1);
        if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
        break;
    }
  });

  // Mobile/touch UI controls (assuming button IDs exist in DOM)
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
}
