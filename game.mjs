import { createGame, move, WIDTH, HEIGHT } from './dungeon.mjs';

const game = createGame();
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const directions = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const keyDirections = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
const tile = 20;
function rect(color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function render() {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const px = x * tile, py = y * tile;
      if (game.tiles[y][x]) {
        rect((x + y) % 2 ? '#293332' : '#2c3735', px, py, tile, tile);
        rect('#36413b', px + 3, py + 15, 3, 1);
      } else {
        rect('#141d24', px, py, tile, tile);
        rect('#29343b', px + 1, py + 1, 18, 5);
        rect('#202c33', px + 1, py + 7, 8, 11);
        rect('#202c33', px + 10, py + 7, 9, 11);
      }
    }
  }
  let x = game.exit.x * tile, y = game.exit.y * tile;
  rect('#0b1217', x + 2, y + 1, 16, 18);
  rect(game.hasKey ? '#b0c68e' : '#75856a', x + 3, y + 2, 14, 3);
  rect('#6c815f', x + 3, y + 5, 3, 14); rect('#6c815f', x + 14, y + 5, 3, 14);
  rect(game.hasKey ? '#b0c68e' : '#dfb854', x + 10, y + 10, 3, 4);
  if (!game.hasKey) {
    x = game.key.x * tile; y = game.key.y * tile;
    rect('#a67b31', x + 5, y + 6, 8, 8); rect('#f5ce66', x + 4, y + 5, 7, 7);
    rect('#34392c', x + 6, y + 7, 3, 3); rect('#f5ce66', x + 10, y + 8, 7, 3); rect('#f5ce66', x + 14, y + 10, 3, 4);
  }
  x = game.player.x * tile; y = game.player.y * tile;
  rect('#111d21', x + 3, y + 17, 14, 2);
  rect('#84b7a7', x + 5, y + 3, 10, 7); rect('#c4dfbd', x + 6, y + 5, 8, 5);
  rect('#203632', x + 11, y + 6, 2, 2); rect('#6f9c9b', x + 4, y + 10, 12, 6);
  rect('#b2cabb', x + 4, y + 10, 3, 4); rect('#b2cabb', x + 13, y + 10, 3, 4);
  rect('#638889', x + 5, y + 16, 4, 2); rect('#638889', x + 11, y + 16, 4, 2);
  document.querySelector('#floor').textContent = String(game.floor).padStart(2, '0');
  const keyStatus = document.querySelector('#key-status');
  keyStatus.textContent = game.hasKey ? '◆ KEY COLLECTED' : '◇ KEY MISSING';
  keyStatus.classList.toggle('collected', game.hasKey);
}
function step(direction) {
  const result = move(game, ...directions[direction]);
  const messages = { key: 'Golden key found. Head to the exit!', locked: 'The exit is locked. Find the golden key.', floor: `Floor ${game.floor}. A new dungeon awaits. Find the key.` };
  if (messages[result]) document.querySelector('#message').textContent = messages[result];
  render();
}
window.addEventListener('keydown', event => {
  const direction = keyDirections[event.key] || keyDirections[event.key.toLowerCase()];
  if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
  // Let keyboard users activate focused direction buttons with Space/Enter.
  event.preventDefault(); step(direction);
});

// Pointer events cover touch, mouse, and pen. Release outside the pad also stops movement.
let repeatTimer, delayTimer, activeButton;
function stopHolding() {
  clearTimeout(delayTimer); clearInterval(repeatTimer);
  activeButton?.classList.remove('pressed'); activeButton = null;
}
for (const button of document.querySelectorAll('[data-direction]')) {
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || activeButton) return;
    event.preventDefault(); activeButton = button;
    button.setPointerCapture(event.pointerId); button.classList.add('pressed');
    step(button.dataset.direction);
    delayTimer = setTimeout(() => { repeatTimer = setInterval(() => step(button.dataset.direction), 140); }, 280);
  });
  button.addEventListener('lostpointercapture', stopHolding);
  button.addEventListener('click', event => { if (event.detail === 0) step(button.dataset.direction); });
}
window.addEventListener('pointerup', stopHolding);
window.addEventListener('pointercancel', stopHolding);
window.addEventListener('blur', stopHolding);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopHolding(); });
render();
