import { rotate, collide, type Matrix } from "./engine";
import type { Player } from "./types";

export function bindInput(
  player: Player,
  arena: Matrix, // <--- must be Matrix!
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

  // Touch/Control UI
  const safe = (action: () => void) => {
    if (!isDisabled()) action();
  };

  document.getElementById("left")?.addEventListener("click", () =>
    safe(() => {
      player.pos.x--;
      if (collide(arena, player)) player.pos.x++;
    })
  );

  document.getElementById("right")?.addEventListener("click", () =>
    safe(() => {
      player.pos.x++;
      if (collide(arena, player)) player.pos.x--;
    })
  );

  document.getElementById("rotate")?.addEventListener("click", () =>
    safe(() => {
      player.matrix = rotate(player.matrix, 1);
      if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
    })
  );

  document
    .getElementById("down")
    ?.addEventListener("click", () => safe(() => drop()));
}
