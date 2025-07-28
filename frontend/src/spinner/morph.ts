export function interpolateMatrix(
  matA: number[][],
  matB: number[][],
  t: number
): number[][] {
  const N = Math.max(matA.length, matB.length);
  const result: number[][] = [];
  for (let y = 0; y < N; ++y) {
    const row: number[] = [];
    for (let x = 0; x < N; ++x) {
      const a = matA[y]?.[x] ?? 0;
      const b = matB[y]?.[x] ?? 0;
      row[x] = (1 - t) * a + t * b;
    }
    result[y] = row;
  }
  return result;
}
