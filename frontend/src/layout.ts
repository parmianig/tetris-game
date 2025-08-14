// TypeScript source for layout logic (compile to layout.js for runtime).

function parsePx(value: string | number): number {
  const n = parseFloat(String(value).trim().replace("px", ""));
  return Number.isFinite(n) ? n : 0;
}

function getSafeViewportHeight(): number {
  const vv = (window as any).visualViewport;
  if (vv && typeof vv.height === "number") {
    return vv.height as number;
  }
  return window.innerHeight;
}

function elementHeight(el: Element | null): number {
  if (!el) return 0;
  const rect = (el as HTMLElement).getBoundingClientRect?.();
  return rect ? rect.height : 0;
}

export function fitTetrisLayout(): void {
  const arenaBox = document.getElementById("game-area") as HTMLElement | null;
  const canvas = document.getElementById("tetris") as HTMLCanvasElement | null;
  const nextCanvas = document.getElementById(
    "next-piece-canvas"
  ) as HTMLCanvasElement | null;
  if (!arenaBox || !canvas) return;

  const vw: number = window.innerWidth;
  const vh: number = getSafeViewportHeight();
  const isDesktop: boolean = vw >= 1025;

  const controls = document.getElementById("controls");
  const title =
    document.querySelector("#game-wrapper h1") ||
    document.querySelector(".game-title");

  const titleH: number = elementHeight(title);

  // top spacer from ::before
  const topPad = getComputedStyle(
    document.querySelector("#game-wrapper") as Element,
    "::before"
  ).getPropertyValue("height");
  const topPadH: number = parsePx(topPad);

  const controlsVisible: boolean =
    !!controls && getComputedStyle(controls).display !== "none";
  const controlsH: number = controlsVisible ? elementHeight(controls) : 0;

  const rootStyle = getComputedStyle(document.documentElement);
  const safeBottom: number = parsePx(
    rootStyle.getPropertyValue("--safe-bottom")
  );

  const verticalGutters = 16;
  const availableH: number = Math.max(
    160,
    vh - titleH - topPadH - controlsH - safeBottom - verticalGutters
  );

  let maxWidth: number = isDesktop
    ? Math.min(vw * 0.36, 480)
    : Math.min(vw * 0.92, 420);
  let width: number = Math.max(140, maxWidth);
  let height: number = width * 2;

  if (height > availableH) {
    height = availableH;
    width = height * 0.5;
  }

  arenaBox.style.width = `${Math.floor(width)}px`;
  arenaBox.style.height = `${Math.floor(height)}px`;

  // Crisp scaling without altering internal resolution
  if (canvas) {
    canvas.style.imageRendering = "pixelated";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.imageSmoothingEnabled = false;
  }

  if (nextCanvas) {
    nextCanvas.style.imageRendering = "pixelated";
    const nctx = nextCanvas.getContext("2d");
    if (nctx) nctx.imageSmoothingEnabled = false;
  }
}

// Debounced resize using rAF
let _rafId = 0;
function requestFit() {
  if (_rafId) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(() => {
    _rafId = 0;
    fitTetrisLayout();
  });
}

window.addEventListener("resize", requestFit, { passive: true });
window.addEventListener("orientationchange", requestFit);
window.addEventListener("DOMContentLoaded", () => fitTetrisLayout());
