import type { Shape } from "./types";

// srs.ts
export type SRS_Orientation = 0 | 1 | 2 | 3;

export const SRS_KICK_TABLE: Record<string, [number, number][]> = {
  // JLSTZ (J, L, S, T, Z): rotate around (1,1)
  "JLSTZ-0>1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "JLSTZ-1>0": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  "JLSTZ-1>2": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  "JLSTZ-2>1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "JLSTZ-2>3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  "JLSTZ-3>2": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  "JLSTZ-3>0": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  "JLSTZ-0>3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],

  // I piece (rotate around (1.5, 1.5))
  "I-0>1": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  "I-1>0": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  "I-1>2": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  "I-2>1": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  "I-2>3": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  "I-3>2": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  "I-3>0": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  "I-0>3": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],

  // O piece SRS kicks (O rotates around (0.5,0.5), see TGM/TTC guideline)
  "O-0>1": [
    [0, 0],
    [0, -1],
  ],
  "O-1>2": [
    [0, 0],
    [-1, -1],
  ],
  "O-2>3": [
    [0, 0],
    [-1, 0],
  ],
  "O-3>0": [
    [0, 0],
    [0, 0],
  ],
  "O-1>0": [
    [0, 0],
    [0, 1],
  ],
  "O-2>1": [
    [0, 0],
    [1, 1],
  ],
  "O-3>2": [
    [0, 0],
    [1, 0],
  ],
  "O-0>3": [
    [0, 0],
    [0, 0],
  ],
};

export function getSRSKey(shape: Shape, from: number, to: number): string {
  if (shape === "I") return `I-${from}>${to}`;
  if (shape === "O") return `O-${from}>${to}`;
  return `JLSTZ-${from}>${to}`;
}

/**
 * Returns the correct SRS rotation origin for the given tetromino.
 * @param shape The shape of the tetromino ("I", "O", "J", "L", "S", "T", "Z")
 * @returns { x, y } The SRS rotation origin in matrix coordinates
 */
export function getSRSOrigin(shape: string): { x: number; y: number } {
  switch (shape) {
    case "I":
      return { x: 1.5, y: 1.5 };
    case "O":
      return { x: 0.5, y: 0.5 };
    default:
      // J, L, S, T, Z: (1,1) on 4x4 matrix, which is the 2nd cell (0-indexed)
      return { x: 1, y: 1 };
  }
}
