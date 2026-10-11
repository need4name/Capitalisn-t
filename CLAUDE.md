# Tuck: notes for Claude

- **Always update `docs/GAME_DESIGN.md`** (the living game design document) in the same change as any gameplay, story, art, UI or platform change. Add a line to its change log as well. The owner asked for this explicitly.
- Keep the README in step with how to run and edit the game.
- Never show act numbers or act titles to the player. Progression must feel organic: use in-world captions and locations instead. The `title`/`ages` fields in `js/content.js` are internal only.
- The game must stay playable on iPhone in portrait. Check the layout at 390×844 with touch after any UI change.
- Core design intent (from the owner), not to be undone:
  - Never explain the morality to the player: no tutorial text, and no labels on choices (no "decent/exploit" tags, no money previews).
  - No passive income. Money only ever comes from the player choosing to exploit someone.
  - No rewards for being good. Every option has a hidden `evil` rating (0 kind … 3 vindictive). Each school has a hidden rising `line`, and any choice below it triggers the awkward wait. Crueller pays more (vindictive is the speedrun), and Soul never goes back up. Any new encounter must rate every option and should offer a range of cruelty, including one at or above the line where it appears.
  - The game must be paced so the player can read and face the consequences: turn-based days, "Meanwhile…" beats, a home-time recap.
  - The path of least resistance (exactly the line) should only just scrape by. Dues rise daily for a few days per school. Re-run the balance bots after changing any money (see the design doc's balance table).
  - Tuck-shop improvements secretly change nothing: the world scales dues and targets by the same multiplier (reset each school). Never reveal this. Shop prices are fixed list prices. The goal price is never shown as a number: use in-world progress lines and write dues as `{dues}`.
  - Each school's goal is always visible (HUD and intro). Milestones can't be refused (no "Not yet"), so nobody can soft-lock.
  - The awkward wait cannot be skipped.
  - Variety: quick deals come from a no-repeat bag; recurring bits go in a `series`. IOUs use `follow` to bring the debtor back later.
  - No morality meters on screen. Options are shuffled each time.
- Story and tuning live in `js/content.js`. Prefer editing content there over hard-coding text in the engine.
- The site (https://need4name.github.io/Capitalisn-t/) is served by GitHub Pages straight from the `claude/tuck-game` branch: pushing that branch redeploys it within a minute or two. Pages' build status shows up as the "pages build and deployment" workflow run.
- Test with `npx http-server -p 8123 -s -c-1 .` and Playwright (`/opt/node22/lib/node_modules/playwright`). `?debug` exposes `Tuck.debug`.
