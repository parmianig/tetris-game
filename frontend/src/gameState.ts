// gameState.ts
export interface GameState {
  paused: boolean;
  gameOver: boolean;
  isGravityAnimating: boolean;
  // ...any other state
}

export const gameState: GameState = {
  paused: false,
  gameOver: false,
  isGravityAnimating: false,
};
