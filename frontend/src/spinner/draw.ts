export function drawSpinnerTetromino(
  ctx: CanvasRenderingContext2D,
  matrix: number[][],
  color: string,
  angle: number,
  alpha = 1
) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.rotate(angle);

  const N = 4;
  const block = Math.floor((ctx.canvas.width / N) * 0.8);
  const margin = Math.floor((ctx.canvas.width / N) * 0.12);

  for (let y = 0; y < N; ++y) {
    for (let x = 0; x < N; ++x) {
      if ((matrix[y]?.[x] ?? 0) > 0.02) {
        const bx = (x - N / 2 + 0.5) * block;
        const by = (y - N / 2 + 0.5) * block;
        const grad = ctx.createLinearGradient(bx, by, bx + block, by + block);
        grad.addColorStop(0, "#fff7");
        grad.addColorStop(0.23, color);
        grad.addColorStop(0.72, "#fff2");
        grad.addColorStop(1, "#0002");
        ctx.save();
        ctx.shadowColor = "#fff6";
        ctx.shadowBlur = 8;
        ctx.fillStyle = grad;
        ctx.globalAlpha = alpha * (matrix[y]?.[x] ?? 0);
        ctx.fillRect(bx, by, block - margin, block - margin);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(220,240,255,0.19)";
        ctx.strokeRect(bx, by, block - margin, block - margin);
        ctx.restore();
      }
    }
  }
  ctx.restore();
}
