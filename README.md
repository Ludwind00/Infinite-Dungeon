# Infinite Dungeon v0.1

A tiny, dependency-free browser dungeon crawl. Find the golden key, then step into the exit to descend to a fresh floor. No enemies or combat.

## Run

From this directory:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open the served page in a modern browser. Use arrow keys or WASD, or tap/hold the direction pad. The responsive canvas and pointer controls support mobile browsers, including iPhone Safari. Progress lasts for the current page session.

## Check

```sh
node --test tests/*.test.mjs
```

The tests cover connectivity, walls, locked exits, key collection, and three consecutive completed floors across 100 seeded dungeon sequences.

## Files

- `dungeon.mjs`: connected room/corridor generation and game rules.
- `game.mjs`: canvas placeholder pixel graphics and keyboard/pointer input.
- `style.css` and `index.html`: responsive layout and accessible controls.

There is no build step, package install, or external asset request. Replace the canvas drawing functions when PixelLab artwork is available; game rules are independent of rendering.

## Publish with GitHub Pages

Merge the game files into `main`, including the root-level `index.html`,
`style.css`, `game.mjs`, and `dungeon.mjs`. Keep these files together; there is no
build output to publish.

In the GitHub repository, open **Settings → Pages** and choose **Deploy from a
branch**, branch **main**, folder **/ (root)**, then save. Wait for the Pages
deployment to finish successfully in **Actions**.

The expected project URL is https://ludwind00.github.io/Infinite-Dungeon/.
This is a publication target, not a claim that deployment has been verified.
After deployment, open that URL and confirm the map renders, movement works,
the key unlocks the exit, and three consecutive floors can be completed.
