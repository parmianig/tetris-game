// ui.ts

export type OverlayState = "gameover" | "paused" | "hidden" | "error";
export type PauseReason = "user" | "menu" | null;

/**
 * Controls the display of the Tetris overlay (pause/gameover/error/hidden).
 * - If paused by "menu" (settings), overlay stays hidden.
 */
export function updateOverlay(state: OverlayState, reason?: PauseReason) {
  const overlay = document.getElementById("game-overlay");
  const overlayText = document.getElementById("overlay-text");
  const restartBtn = document.getElementById("restart");
  const resumeBtn = document.getElementById("resume-btn");

  if (!overlay || !overlayText || !resumeBtn || !restartBtn) return;

  // Special case: Settings drawer pause (no overlay!)
  if (state === "paused" && reason === "menu") {
    overlay.classList.add("hidden");
    resumeBtn.classList.add("hidden");
    restartBtn.classList.add("hidden");
    return;
  }

  switch (state) {
    case "gameover":
      overlayText.textContent = "Game Over!";
      overlay.classList.remove("hidden");
      resumeBtn.classList.add("hidden");
      restartBtn.classList.remove("hidden");
      break;
    case "paused":
      overlayText.textContent = "Paused";
      overlay.classList.remove("hidden");
      resumeBtn.classList.remove("hidden");
      restartBtn.classList.add("hidden");
      break;
    case "error":
      overlayText.textContent = "Connection Error";
      overlay.classList.remove("hidden");
      resumeBtn.classList.add("hidden");
      restartBtn.classList.add("hidden");
      break;
    case "hidden":
    default:
      overlay.classList.add("hidden");
      resumeBtn.classList.add("hidden");
      restartBtn.classList.add("hidden");
      break;
  }
}
