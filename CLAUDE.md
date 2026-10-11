# Tuck: notes for Claude

- **Always update `docs/GAME_DESIGN.md`** (the living game design document) in the same change as any gameplay, story, art, UI or platform change. Add a line to its change log as well. The owner asked for this explicitly.
- Keep the README in step with how to run and edit the game.
- Never show act numbers or act titles to the player. Progression must feel organic: use in-world captions and locations instead. The `title`/`ages` fields in `js/content.js` are internal only.
- The game must stay playable on iPhone in portrait. Check the layout at 390×844 with touch after any UI change.
- Story and tuning live in `js/content.js`. Prefer editing content there over hard-coding text in the engine.
- The site (https://need4name.github.io/Capitalisn-t/) is served by GitHub Pages straight from the `claude/tuck-game` branch: pushing that branch redeploys it within a minute or two. Pages' build status shows up as the "pages build and deployment" workflow run.
- Test with `npx http-server -p 8123 -s -c-1 .` and Playwright (`/opt/node22/lib/node_modules/playwright`). `?debug` exposes `Tuck.debug`.
