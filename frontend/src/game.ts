export interface Position {
  x: number;
  y: number;
}

export interface Player {
  pos: Position;
  matrix: number[][];
  level: number;
}

export function createPlayer(): Player {
  return {
    pos: { x: 3, y: 0 },
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    level: 1,
  };
}

export function merge(arena: number[][], player: Player): void {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      const ay = y + player.pos.y;
      const ax = x + player.pos.x;
      if (value !== 0 && arena[ay]?.[ax] !== undefined) {
        arena[ay][ax] = value;
      }
    });
  });
}

export function collide(arena: number[][], player: Player): boolean {
  const { matrix, pos } = player;
  return matrix.some((row, y) =>
    row.some(
      (value, x) => value !== 0 && (arena[y + pos.y]?.[x + pos.x] ?? 1) !== 0
    )
  );
}

export function sweepArena(arena: number[][]): void {
  const width = arena[0]?.length ?? 10; // fallback to default width if arena is empty
  for (let y = arena.length - 1; y >= 0; y--) {
    if (arena[y]?.every((cell) => cell !== 0)) {
      arena.splice(y, 1);
      arena.unshift(new Array(width).fill(0));
      y++;
    }
  }
}
