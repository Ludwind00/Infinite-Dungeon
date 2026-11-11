import { createGame, move, WIDTH, HEIGHT } from './dungeon.mjs';

const game = createGame();
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const directions = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const keyDirections = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
// Standard 2:1 projection. Keep the full map in view at every screen size.
const halfWidth = 12, halfHeight = 6, wallHeight = 4;
const originX = 48 + HEIGHT * halfWidth, originY = 34;
function project(x, y) {
  return { x: originX + (x - y) * halfWidth, y: originY + (x + y) * halfHeight };
}
function rect(color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function polygon(color, points) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.fill();
}
function diamond(color, x, y, w = halfWidth, h = halfHeight) {
  polygon(color, [[x, y - h], [x + w, y], [x, y + h], [x - w, y]]);
}
function drawWall(x, y) {
  // Low walls keep the player and key visible in narrow corridors.
  polygon('#34434a', [[x - halfWidth, y - wallHeight], [x, y + halfHeight - wallHeight], [x, y + halfHeight], [x - halfWidth, y]]);
  polygon('#26353d', [[x, y + halfHeight - wallHeight], [x + halfWidth, y - wallHeight], [x + halfWidth, y], [x, y + halfHeight]]);
  diamond('#435159', x, y - wallHeight);
  polygon('#536169', [[x - 10, y - wallHeight], [x, y - 5 - wallHeight], [x + 10, y - wallHeight], [x, y - 3 - wallHeight]]);
}
function drawExit(x, y) {
  diamond('#090f15', x, y, 10, 5);
  diamond(game.hasKey ? '#b0c68e' : '#75856a', x, y, 8, 4);
  diamond('#152326', x, y, 6, 3);
  // A small gate stands on the back edge of the exit tile.
  rect('#6c815f', x - 7, y - 16, 3, 14);
  rect('#6c815f', x + 4, y - 16, 3, 14);
  rect(game.hasKey ? '#b0c68e' : '#75856a', x - 7, y - 17, 14, 3);
  if (!game.hasKey) rect('#f5ce66', x - 1, y - 10, 3, 4);
}
function drawKey(x, y) {
  diamond('#152126', x, y + 1, 6, 3);
  rect('#a67b31', x - 5, y - 11, 7, 7);
  rect('#f5ce66', x - 6, y - 12, 7, 7);
  rect('#34392c', x - 4, y - 10, 3, 3);
  rect('#f5ce66', x, y - 9, 7, 3);
  rect('#f5ce66', x + 4, y - 7, 3, 4);
}
function drawPlayer(x, y) {
  diamond('#111d21', x, y + 1, 7, 3);
  rect('#84b7a7', x - 5, y - 17, 10, 7);
  rect('#c4dfbd', x - 4, y - 15, 8, 5);
  rect('#203632', x + 1, y - 14, 2, 2);
  rect('#6f9c9b', x - 6, y - 10, 12, 6);
  rect('#b2cabb', x - 6, y - 10, 3, 4);
  rect('#b2cabb', x + 3, y - 10, 3, 4);
  rect('#638889', x - 5, y - 4, 4, 4);
  rect('#638889', x + 1, y - 4, 4, 4);
}
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  // Ground first; then raised objects from back to front by their tile feet.
  // Equal-depth tiles cannot obscure each other at this sprite width.
  for (let depth = 0; depth < WIDTH + HEIGHT - 1; depth++) {
    for (let y = 0; y < HEIGHT; y++) {
      const x = depth - y;
      if (x < 0 || x >= WIDTH) continue;
      const p = project(x, y);
      diamond(game.tiles[y][x] ? ((x + y) % 2 ? '#2e4039' : '#34473e') : '#18242c', p.x, p.y);
    }
  }
  for (let depth = 0; depth < WIDTH + HEIGHT - 1; depth++) {
    for (let y = 0; y < HEIGHT; y++) {
      const x = depth - y;
      if (x < 0 || x >= WIDTH) continue;
      const p = project(x, y);
      if (!game.tiles[y][x]) drawWall(p.x, p.y);
      if (game.exit.x === x && game.exit.y === y) drawExit(p.x, p.y);
      if (!game.hasKey && game.key.x === x && game.key.y === y) drawKey(p.x, p.y);
      if (game.player.x === x && game.player.y === y) drawPlayer(p.x, p.y);
    }
  }
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
