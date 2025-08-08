// src/layout.ts

export function fitTetrisLayout(): void {
  const arenaBox = document.getElementById("game-area");
  const canvas = document.getElementById("tetris") as HTMLCanvasElement | null;

  if (!arenaBox || !canvas) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isDesktop = vw >= 768;

  let width: number;
  let height: number;

  if (isDesktop) {
    // Desktop: centered, no controls below
    width = Math.min(vw * 0.32, 420);
    height = width * 2;
  } else {
    // Mobile: reserve space for controls + header
    const maxHeight = vh - 300;
    width = Math.min(vw * 0.92, 360);
    height = width * 2;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * 0.5;
    }
  }

  arenaBox.style.width = `${width}px`;
  arenaBox.style.height = `${height}px`;

  // Note: canvas.width/height intentionally omitted to maintain game logic sync
}

export function bindLayoutEvents(): void {
  window.addEventListener("resize", fitTetrisLayout);
  window.addEventListener("orientationchange", fitTetrisLayout);
  window.addEventListener("DOMContentLoaded", fitTetrisLayout);
}
