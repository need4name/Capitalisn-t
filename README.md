# Tuck

*(working title: Tuck Shop Tycoon)*: a dark satirical management sim about late-stage capitalism, set in the micro-economy of a British schoolyard.

You play Tucker ("Tuck"), the scruffiest kid at St. Pete's Primary. Over three schools you go from selling Gummy Snails out of a rolled-up jumper to holding a five-year exclusive contract with the Vice-Principal. Exploitation always works. Decency costs money you don't have, and if you insist on it anyway, time stops.

## Running it

It's plain HTML5 Canvas and JavaScript, with no build step and no dependencies.

- **Quickest:** open `index.html` in a browser.
- **Or serve it:** `npx serve .` (or any static server), then open the URL it prints.

Fonts load from Google Fonts. Offline, the game falls back to system fonts.

**Controls:** mouse, or `1`–`4` to pick an option, `Enter` to carry on, `L` for the Ledger, `Esc` to close it. The HUD has buttons for game speed (1×/2×/4×) and mute.

Progress autosaves at the start of each day (in `localStorage`) and can be continued from the title screen.

## How it plays

| System | What it does |
| --- | --- |
| **School clock** | Runs from 08:50 to 15:30 each day. Encounters arrive as the day goes on. Ventures pay out every in-game minute. |
| **Quota** | A cash floor that rises every day ("the hall monitor wants paying"). At the end of the day you must be at or above it. |
| **Exploit options** | Always allowed. You get an arcade fanfare and money. Your soul and playground happiness drop, and the human cost shows up later in the feed. |
| **Decent options** | Only allowed if your cash after the choice stays at or above the quota. Surplus above the quota is what buys kindness. To afford a kindness, you have to have exploited enough to bank a surplus. |
| **Stagnation Freeze** | Picking a decent option you can't afford stops the clock. Rain falls, everyone freezes, and all you can do is count raindrops, read the poster, or retie your shoe, forever, until you **Reconsider**. Ending the day below quota does the same ("the bell refuses to ring"). |
| **Ledger** | Buy ventures (Loot-Box Lunchboxes, Loan Book, Exam Ring…) for passive income. Each one posts regular externalities to the feed. Ventures are sold off at half price when you change school. |
| **Externalities feed** | The cost of what you did, arriving a little later, in dry British understatement. Its title changes each act: *Things That Happened → Gossip → Stakeholder Updates → Evidence*. |
| **Meters** | Soul (below 30, Tuck gets £-sign eyes), Playground Happiness, and Market Monopoly. |

### The acts

1. **Crayon Capitalist**, St. Pete's Primary. Hand-drawn crayon on paper. Billy and the Holo-Dragon, plasters, loot-box lunchboxes, swapping fees, Biff. Ends with the Mega-Coated Trench Coat (£10).
2. **The Playground Syndicate**, St. Jude's Comprehensive. Y2K pixel art. Loan sharking, rain-shelter tenancy, Penny's homework factory, the flapjack smear. Ends by bribing the Senior Hall Monitors (£100).
3. **Campus Oligarch**, Sixth Form. Glossy '90s advert. The rigged election, broken fountains and Volt-Juice™, Mr Pembleton's photocopier, the exam ring. Ends with the five-year exclusive contract (£1,000).
4. **The Reckoning**, Headteacher's Office. Bleak grey realism. Every bribe or cover-up costs money and changes nothing. Apologising in assembly triggers the final freeze, with a high-pitched drone and no way out except expulsion.

**Ending:** Tuck sits outside the gates in the rain. The art turns back to crayon, and a new kid steps out from behind the sports shed with a rolled-up jumper. *The devil dies, but the market lives forever.* "Begin again" starts the next generation.

## Changing the story

**All narrative content and tuning lives in [`js/content.js`](js/content.js).** That covers every encounter, line of dialogue, price, quota, venture, idle action and the ending. You can rewrite or reorder beats without touching any engine code:

- `story[act]`: the encounters for each act, played in order. An encounter can have an `if: (S) => …` condition (e.g. Dev's repayment only happens if you took his Game Boy).
- Option `type`: `exploit` (always works), `decent` (subject to the quota and Stagnation Freeze), `futile` (Act 4), `milestone` (ends the act), `later`, `confess`, `accept`.
- `milestones[act]`: the purchase that ends each act.
- `fillers[act]`: repeatable quick deals once the story is done, also used to escape a quota freeze.
- `acts[n]`: target, quota base and daily step, overheads, clock speed, intro text.
- `ventures`: Ledger items, with cost, yield per hour and externality lines.
- Money is always in **pence** (`100` = £1).

## Code layout

```
index.html        page shell and HUD markup
css/style.css     UI, with one skin per act (crayon / pixel / ad / real)
js/content.js     story, numbers, all text
js/render.js      canvas renderer: one scene description, four art styles
js/audio.js       WebAudio synth: fanfares, rain, the drone
js/game.js        state machine: clock, quota, encounters, freezes, ledger, acts, ending
```

The renderer describes each scene once, in a 320×180 virtual space. A per-style `Painter` decides how primitives look: wobbly hatching that redraws at 8fps for crayon, a low-res buffer scaled up nearest-neighbour for pixel, gradients, gloss and outlines for the advert, and desaturation with film grain and vignette for realism.

Add `?debug` to the URL to get a `Tuck.debug` object in the console (`jumpAct(n)`, `cash(p)`, `speed(x)`…).

## Departures from the design doc

- **Engine:** the doc suggests Unity or Godot. This build is browser-native, so it runs anywhere with no install and is quick to iterate on. The four-style "aesthetic state machine" lives in `render.js`.
- **"Photorealism"** in Act 4 is a desaturated, grainy, rain-soaked version of the same scenes rather than real photos. It keeps the hard cut from the advert style without needing an art pipeline.
- **Soul Meter & Debt Quota:** the quota is a rising cash floor, and the surplus above it is the bank you spend on kindness.
