import type { Player } from "./game";
import { rotate } from "./engine"; // or wherever your rotate function lives
import { collide } from "./game";

export function bindInput(
  player: Player,
  arena: number[][],
  dropCallback: () => void
) {
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
        dropCallback();
        break;
      case " ":
        player.matrix = rotate(player.matrix, 1);
        if (collide(arena, player)) player.matrix = rotate(player.matrix, -1);
        break;
      case "Shift":
      case "Control":
        player.matrix = rotate(player.matrix, -1);
        if (collide(arena, player)) player.matrix = rotate(player.matrix, 1);
        break;
    }
  });
}
