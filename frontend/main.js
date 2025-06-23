const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Scale to make pieces 20x20 pixels
context.scale(20, 20);

// Just fill the screen with a test block for now
context.fillStyle = 'red';
context.fillRect(4, 0, 1, 1);

// Mobile controls
document.getElementById('left').addEventListener('click', () => {
  console.log('Move Left');
});

document.getElementById('rotate').addEventListener('click', () => {
  console.log('Rotate');
});

document.getElementById('right').addEventListener('click', () => {
  console.log('Move Right');
});

document.getElementById('down').addEventListener('click', () => {
  console.log('Drop');
});

// Keyboard support
document.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowLeft':
      console.log('Move Left');
      break;
    case 'ArrowRight':
      console.log('Move Right');
      break;
    case 'ArrowDown':
      console.log('Drop');
      break;
    case 'ArrowUp':
      console.log('Rotate');
      break;
  }
});
