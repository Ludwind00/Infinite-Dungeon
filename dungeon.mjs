export const WIDTH = 25;
export const HEIGHT = 19;
const same = (a, b) => a.x === b.x && a.y === b.y;

// Every room joins the preceding room, so all carved tiles are connected.
export function generateDungeon(random = Math.random) {
  const tiles = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
  const rooms = [];
  const integer = (min, max) => min + Math.floor(random() * (max - min + 1));
  const carve = (x, y) => { tiles[y][x] = 1; };
  for (let i = 0; i < 7; i++) {
    const w = integer(3, 6), h = integer(3, 5);
    const x = integer(1, WIDTH - w - 1), y = integer(1, HEIGHT - h - 1);
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) carve(x + dx, y + dy);
    }
    const center = { x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) };
    if (rooms.length) {
      const previous = rooms.at(-1);
      for (let cx = Math.min(previous.x, center.x); cx <= Math.max(previous.x, center.x); cx++) carve(cx, previous.y);
      for (let cy = Math.min(previous.y, center.y); cy <= Math.max(previous.y, center.y); cy++) carve(center.x, cy);
    }
    rooms.push(center);
  }
  const player = { ...rooms[0] };
  // Put the exit far from the entrance by walking the connected floor graph.
  const queue = [player], seen = new Set([`${player.x},${player.y}`]);
  for (let i = 0; i < queue.length; i++) {
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const next = { x: queue[i].x + dx, y: queue[i].y + dy };
      const id = `${next.x},${next.y}`;
      if (tiles[next.y]?.[next.x] && !seen.has(id)) { seen.add(id); queue.push(next); }
    }
  }
  const exit = { ...queue.at(-1) };
  const choices = queue.filter(p => !same(p, player) && !same(p, exit));
  const key = { ...choices[integer(0, choices.length - 1)] };
  return { tiles, player, key, exit, hasKey: false };
}

export function createGame(random = Math.random) {
  return { ...generateDungeon(random), floor: 1 };
}

export function move(game, dx, dy, random = Math.random) {
  if (Math.abs(dx) + Math.abs(dy) !== 1) return 'blocked';
  const next = { x: game.player.x + dx, y: game.player.y + dy };
  if (!game.tiles[next.y]?.[next.x]) return 'blocked';
  if (same(next, game.exit)) {
    if (!game.hasKey) return 'locked';
    const floor = game.floor + 1;
    Object.assign(game, generateDungeon(random), { floor });
    return 'floor';
  }
  game.player = next;
  if (!game.hasKey && same(next, game.key)) { game.hasKey = true; return 'key'; }
  return 'moved';
}
