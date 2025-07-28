// types.ts
export type Shape = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
import type { Matrix } from "./engine";

export interface Player {
  pos: { x: number; y: number };
  matrix: Matrix;
  color: string;
  shape: Shape;
  level: number;
  origin: { x: number; y: number }; // from backend
  rotation: 0 | 1 | 2 | 3;
}

export interface Tetromino {
  shape: Shape;
  matrix: number[][];
  color: string;
  origin: { x: number; y: number };
}
