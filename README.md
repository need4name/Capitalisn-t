# Tuck

*(working title: Tuck Shop Tycoon)*: a dark satirical management sim about late-stage capitalism, set in the micro-economy of a British schoolyard.

**▶ Play: https://need4name.github.io/Capitalisn-t/**

On iPhone, open the link in **Safari**, tap **Share → Add to Home Screen**, and Tuck becomes a full-screen app on your home screen that also works offline.

📄 **Design doc:** [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md). This is the living game design document, kept up to date with every change.

## What it is

You play Tucker ("Tuck"), the scruffiest kid at St. Pete's Primary. Over three schools you go from selling Gummy Snails out of a rolled-up jumper to holding a five-year exclusive contract with the Vice-Principal. Exploitation always works. Decency costs money you don't have, and if you insist on it anyway, time stops.

The art changes as Tuck does: crayon, then Y2K pixel art, then a glossy '90s TV advert, then stark grey realism. The game never tells you which "act" you're in.

## Running it locally

It's plain HTML5 Canvas and JavaScript, with no build step and no dependencies.

```
npx http-server -p 8123 -c-1 .
```

Then open http://localhost:8123. Opening `index.html` directly also works, but the home-screen and offline features need a server.

**Controls:** tap, or on a keyboard `1`–`4` to choose, `Enter` to carry on, `L` for the log. Add `?debug` to the URL for a `Tuck.debug` console helper.

## Changing the story

All narrative content and tuning lives in [`js/content.js`](js/content.js): encounters, characters, interludes (tannoy announcements, overheard bits), evenings at home, tuck-shop improvements, dialogue, prices, daily dues, the awkward-wait lines, the ending and the advert's small print. Money is in **pence** (`100` = £1). The design doc explains each system.

## Code layout

```
index.html              page shell, mobile-first layout
css/style.css           layout + one UI skin per art style
js/content.js           story, numbers, all text
js/game.js              turn-based state machine: days, awkward wait, consequences, dues, ending
js/render.js            core renderer (crayon, pixel), camera, compositing
js/render-ad.js         '90s TV advert art style
js/render-real.js       stark realism art style
js/audio.js             synthesised sound
manifest.webmanifest, sw.js, icons/   home-screen app support
docs/GAME_DESIGN.md     living design document
```

## Hosting

The site is served by GitHub Pages from the `claude/tuck-game` branch. Pushing to that branch updates the live link within a minute or two.
