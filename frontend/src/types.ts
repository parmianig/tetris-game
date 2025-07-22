export interface Player {
  pos: { x: number; y: number };
  matrix: number[][];
  level: number;
}

export interface Player {
  pos: Position;
  matrix: number[][];
  color: string;
  shape: string;
  level: number;
}

interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  shape: string;
  matrix: number[][];
  color: string;
}
