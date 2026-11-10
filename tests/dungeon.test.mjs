import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, move, WIDTH, HEIGHT } from '../dungeon.mjs';

function seeded(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }; }
function path(game, target, avoidExit = false) {
  const queue = [{ ...game.player, steps: [] }], seen = new Set();
  for (const current of queue) {
    if (current.x === target.x && current.y === target.y) return current.steps;
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const x = current.x + dx, y = current.y + dy, id = `${x},${y}`;
      if (!game.tiles[y]?.[x] || seen.has(id) || (avoidExit && x === game.exit.x && y === game.exit.y)) continue;
      seen.add(id); queue.push({ x, y, steps: [...current.steps, [dx, dy]] });
    }
  }
  return null;
}
test('100 random dungeons are connected, bounded, and completable for three consecutive floors', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const random = seeded(seed), game = createGame(random);
    for (let floor = 1; floor <= 3; floor++) {
      assert.equal(game.floor, floor); assert.equal(game.hasKey, false);
      for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
        if (x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1) assert.equal(game.tiles[y][x], 0);
        if (game.tiles[y][x]) assert.ok(path(game, { x, y }));
      }
      const keyPath = path(game, game.key, true); assert.ok(keyPath?.length);
      for (const step of keyPath) move(game, ...step, random);
      assert.equal(game.hasKey, true);
      const exitPath = path(game, game.exit); assert.ok(exitPath?.length);
      for (const step of exitPath) move(game, ...step, random);
      assert.equal(game.floor, floor + 1);
    }
  }
});
test('walls and locked exits block movement; invalid moves do nothing', () => {
  const game = createGame(seeded(42));
  game.player = { x: 0, y: 0 };
  assert.equal(move(game, -1, 0), 'blocked');
  assert.equal(move(game, 1, 1), 'blocked');
  assert.deepEqual(game.player, { x: 0, y: 0 });
  const adjacent = [[0, -1], [1, 0], [0, 1], [-1, 0]].find(([dx, dy]) => game.tiles[game.exit.y - dy]?.[game.exit.x - dx]);
  game.player = { x: game.exit.x - adjacent[0], y: game.exit.y - adjacent[1] };
  const before = { ...game.player };
  assert.equal(move(game, ...adjacent), 'locked');
  assert.deepEqual(game.player, before); assert.equal(game.floor, 1);
});
