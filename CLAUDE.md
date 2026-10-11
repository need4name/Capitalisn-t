# Tuck: notes for Claude

- **Always update `docs/GAME_DESIGN.md`** (the living game design document) in the same change as any gameplay, story, art, UI or platform change. Add a line to its change log as well. The owner asked for this explicitly.
- Keep the README in step with how to run and edit the game.
- Never show act numbers or act titles to the player. Progression must feel organic: use in-world captions and locations instead. The `title`/`ages` fields in `js/content.js` are internal only.
- The game must stay playable on iPhone in portrait. Check the layout at 390×844 with touch after any UI change.
- Story and tuning live in `js/content.js`. Prefer editing content there over hard-coding text in the engine.
- The site is served by GitHub Pages from the `gh-pages` branch. After pushing the working branch, update `gh-pages` too (`git push origin HEAD:gh-pages`) so the live link reflects the change.
- Test with `npx http-server -p 8123 -s -c-1 .` and Playwright (`/opt/node22/lib/node_modules/playwright`). `?debug` exposes `Tuck.debug`.
