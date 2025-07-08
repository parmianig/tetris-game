import './style.css';
import { createMatrix, drawMatrix, rotate } from './engine';

declare const __API_BASE__: string;

function isMacOS(): boolean {
  return navigator.userAgent.toUpperCase().includes('MAC');
}

function flashButton(button: HTMLButtonElement | null) {
  if (!button) return;
  button.classList.add('pressed');
  setTimeout(() => button.classList.remove('pressed'), 150);
}

// 🎮 Canvas setup
const canvas = document.getElementById('tetris') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
ctx.scale(20, 20);

// 🧩 Tetris data
const arena = createMatrix(12, 20);
const player = {
  pos: { x: 1, y: 1 },
  matrix: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

// 🧱 Drawing logic
function drawGrid() {
  ctx.strokeStyle = '#444';
  for (let y = 0; y < 20; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(12, y);
    ctx.stroke();
  }
  for (let x = 0; x < 13; x++) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 20);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawMatrix(ctx, arena);
  drawMatrix(ctx, player.matrix, player.pos);
}

function move(dir: number) {
  player.pos.x += dir;
  draw();
}

function drop() {
  player.pos.y++;
  draw();
}

function rotatePlayer(dir: number) {
  player.matrix = rotate(player.matrix, dir);
  draw();
}

// 🛰️ Backend communication
function fetchScores() {
  fetch(`${__API_BASE__}/scores`)
    .then((res) => res.json())
    .then((data) => {
      console.log('Scores from backend:', data);
    })
    .catch((err) => {
      console.error('Failed to fetch scores:', err);
    });
}

// 🧠 UI Wiring
window.addEventListener('DOMContentLoaded', () => {
  const leftButton = document.getElementById('left') as HTMLButtonElement | null;
  const rightButton = document.getElementById('right') as HTMLButtonElement | null;
  const downButton = document.getElementById('down') as HTMLButtonElement | null;
  const rotateButton = document.getElementById('rotate') as HTMLButtonElement | null;

  leftButton?.addEventListener('click', () => move(-1));
  rightButton?.addEventListener('click', () => move(1));
  downButton?.addEventListener('click', () => drop());
  rotateButton?.addEventListener('click', (event) => {
    if (event.shiftKey) {
      rotatePlayer(-1);
    } else {
      rotatePlayer(1);
    }
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    const isCtrlCmd = isMacOS() ? event.metaKey : event.ctrlKey;

    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowLeft':
        flashButton(leftButton);
        move(-1);
        break;
      case 'ArrowRight':
        flashButton(rightButton);
        move(1);
        break;
      case 'ArrowDown':
        flashButton(downButton);
        drop();
        break;
      case ' ':
      case 'ArrowUp':
        flashButton(rotateButton);
        if (event.shiftKey) {
          rotatePlayer(-1);
        } else {
          rotatePlayer(1);
        }
        break;
      default:
        if (isCtrlCmd && event.shiftKey) {
          rotatePlayer(-1);
        } else if (isCtrlCmd) {
          rotatePlayer(1);
        }
        break;
    }
  });

  draw();
  fetchScores(); // 👈 Backend call on load
});
