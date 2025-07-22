import type { Matrix } from "./engine";

export interface Player {
  pos: Position;
  color: string;
  shape: string;
  matrix: Matrix;
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
