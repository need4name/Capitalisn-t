# TUCK — Game Design Document

*Living version of the original "Tuck — Game Design Document & Architectural Blueprint". This file describes the game as it is actually built, and is updated with every change.*

**Play it:** https://need4name.github.io/Capitalisn-t/ (add it to your iPhone home screen from Safari: Share → Add to Home Screen)

---

## 1. Executive summary and core concept

**Tuck** (working title: *Tuck Shop Tycoon*) is a dark satirical narrative management sim about the systemic traps of late-stage capitalism, told through the micro-economy of a British schoolyard. The player controls Tucker ("Tuck"), a poor student who goes from selling Gummy Snails out of a rolled-up jumper to running a predatory monopoly that controls campus infrastructure, student debt and the school's own authorities.

**The core narrative trap.** Ethical choices are not an alternative route to victory. Altruism is a literal deadlock in the game state. Refusing to exploit people doesn't give you a Game Over. It triggers a **Stagnation Freeze**: time stops, progress halts, and the player sits in mundane isolation until they give in to the predatory option.

## 2. Design pillars

| Pillar | How it shows up in play | Intent |
| --- | --- | --- |
| **The Stagnation Trap** | Decent choices you can't afford freeze time. Progress needs exploitation. | Make the player actively choose corruption in order to keep playing. |
| **Visual progression** | Crayon → Y2K pixel art → glossy '90s TV advert → stark cinematic realism. | Mirror Tuck's growing detachment from reality as the empire scales. |
| **Explicit feedback** | Arcade fanfares for every exploit, while a separate feed reports the human cost a few in-game minutes later. | Set hyperactive rewards against raw human damage. |
| **British satire** | Dry, absurdist tone in the vein of *Thank Goodness You're Here!* | Ground big economic critiques in mundane, recognisable school tropes. |
| **Organic progression** | The game never says "Act 2". Time passes, Tuck changes schools, and the world, art and interface change around him. | Let the player feel the slide rather than read about it. |

## 3. Key systems (as built)

### School clock
Each day runs from 08:50 to 15:30. At 1× speed, one real second is three in-game minutes, so a day lasts about 2¼ minutes. Encounters arrive as the day goes on. The clock stops only during a Stagnation Freeze.

### Debt Quota and Soul Meter
- **Quota:** a cash floor that rises every day ("the hall monitor wants paying", "Biff needs to see the money", "the shareholders expect liquidity"). You must be at or above it at the end of every day. Below it, the bell refuses to ring (a freeze) until you take a quick deal.
- **Exploit options always work.** Every other option is **decent**, and is only allowed if your cash *after* the choice is still at or above the quota.
- **Surplus is the kindness bank.** Cash above the quota is shown as "+£x spare". Spending it is the only way to afford decency, so the player commits exploitative acts specifically to afford small moments of kindness, as the original design intended.
- **Soul (0–100)** drops with exploitation and rises a little with kindness. Below 30, Tuck's eyes become £ signs.
- **Playground Happiness** and **Market Monopoly** are tracked as meters and shift with choices and ventures.

### Stagnation Freeze
Triggered by an unaffordable decent choice, or by ending a day below the quota. The clock blinks red, rain falls, the scene loses its colour and everyone stops mid-motion. The only actions are pointless: count raindrops, look at the clock, retie your shoe, read the poster again, think about the nature of value. Each has its own dry lines, and the freeze escalates its commentary the longer you sit there. **Reconsider** returns you to the choice; there is no other way out.

### Ledger (ventures)
Passive income bought with cash: four ventures per school, each posting regular externalities to the feed. Ventures are sold at half price when Tuck changes school.

| School | Ventures |
| --- | --- |
| St. Pete's | Jumper Stall, UFO Snaps Resale, Loot-Box Lunchboxes, Plaster Monopoly |
| St. Jude's | Pawn Desk, Loan Book (200% APR), Rain Shelter Lettings, Homework Factory |
| Sixth Form | Automated Debt Collection, Volt-Juice™ Distribution, Bootleg Revision Guides, Exam Ring |

### Externalities feed
Consequences arrive a little after each choice. The feed's title shifts with the setting: *Things That Happened → Gossip → Stakeholder Updates → Evidence*. The newest item also scrolls under the scene.

## 4. Narrative arc

| Stage | Setting and art | Mechanics and scams | Milestone that moves you on |
| --- | --- | --- | --- |
| Ages 8–10 | St. Pete's Primary. Hand-drawn crayon on paper. | Billy and the Holo-Dragon, the plaster shortage, loot-box lunchboxes, the Swapsies fee, Biff | Buy the Mega-Coated Trench Coat and hire Biff (£10) |
| Ages 11–13 | St. Jude's Comprehensive. Crisp Y2K pixel art. | Dev's loan (200% plus his Game Boy), rain-shelter tenancy, Penny's homework factory, the flapjack/"Nibbles" smear, debt collection | Bribe the Senior Hall Monitors for the bikeshed (£100) |
| Ages 14–16 | Sixth Form Campus. Glossy '90s TV commercial. | Framing Maya in the election, breaking the fountains for Volt-Juice™, Mr Pembleton's photocopier, the exam ring, Penny's contract clause | Sign the five-year exclusive contract with Vice-Principal Crane (£1,000) |
| The Fall | Headteacher's office. Stark cinematic realism. | Mrs Ahmed and the ledger, the audit, Biff's statement, teachers confess, Penny leaves, the assembly | Expulsion. The cycle restarts. |

Transitions between schools are in-world captions ("Summer comes. Billy moves to Leicester…"), not title cards. The cut from the advert into the Fall is a hard burst of static: *"The confetti is still coming down when the picture cuts out."*

### The tutorial: the sardine sandwich and the Holo-Dragon
Little Billy is crying on a damp bench over a sardine paste sandwich, and wants Tuck's only Gummy Snail.
- **"50p. Fair's fair."** leaves Tuck short of the £1 the hall monitor wants. The Stagnation Freeze begins: rain, and the clock stops.
- **"50p. And the Holo-Dragon."** gets an arcade fanfare (+50p! RARE CARD ACQUIRED! SOLD TO KYLE: +75p!) and lets play continue.

### The Fall and the twist ending
Every option in the Fall is **futile**: bribes, denial, shredding evidence and hiring a solicitor all cost money and change nothing. In assembly, apologising and offering to give it all back triggers the **final freeze**. A high-pitched drone plays, the whole school freezes mid-cough, and the game refuses redemption ("Refunds are not available at this time"). The only way out is to accept expulsion.

Tuck sits on a wall outside the gates in the rain, assetless, watching kids play freely through the railings. The art returns to crayon: behind the sports shed at St. Pete's, a new eight-year-old steps out with mismatched shoes and a rolled-up jumper, while across the playground someone cries into a sandwich. **"THE DEVIL DIES, BUT THE MARKET LIVES FOREVER."** *Begin again* starts the next generation.

## 5. Art direction

| Style | How it's drawn |
| --- | --- |
| **Crayon** | Hand-drawn wobbly outlines and diagonal hatching on lined paper. The linework redraws ("boils") at 8 fps. Stick-figure kids with big heads. |
| **Y2K pixel** | Drawn at 320×180 and scaled up with nearest-neighbour; dithered skies, scanlines, a navy/cyan/magenta UI and pixel fonts. |
| **'90s TV advert** | A studio set with a rotating sunburst, floating Memphis-pattern confetti, an extruded TUCK logo and a reflective floor with a perspective grid. A hero Volt-Juice™ can sits on a pedestal with a lens flare, or the boardroom has a sunset over the school. Glossy mascot characters have big shiny eyes and fixed grins: **everybody smiles in the advert, even the crying kids**. Broadcast overlays include a TUCK TV channel bug, a NEW!/400%/FREE* starburst, scanlines, VHS tracking glitches and rotating small-print disclaimers ("*Tuck Enterprises™ accepts no liability for childhood"). |
| **Stark realism** | One-point-perspective rooms (office, corridor, assembly hall, street at dusk) lit by cold window light and failing fluorescent tubes. Rain runs down the glass. People have realistic proportions and are drawn as backlit silhouettes with rim light, with only shadowed eye sockets for faces. Heads drop and shoulders slump when sad; arms fold when angry. Letterboxed with film grain and a vignette. The final freeze fully desaturates the frame. |

## 6. Platforms and interface

- **Browser game, built for iPhone first.** In portrait the layout stacks a compact HUD, the scene, the meters, the latest consequence and the story panel. In landscape and on desktop, the scene sits beside the story panel.
- The camera window adapts to the stage's shape: narrow phone stages see the middle of the scene, where the characters are.
- Tap targets are at least 44 px. The layout respects iPhone safe areas and the notch. Keyboard hints only appear on devices with a keyboard.
- **Home-screen app:** a web app manifest, icons and a service worker mean it can be added to the home screen, runs full-screen and works offline after the first visit.
- Progress autosaves at the start of each day.

## 7. Technical architecture

The original blueprint suggested Unity or Godot. The game is built instead as a **dependency-free HTML5 Canvas / JavaScript web app**, so it runs on any phone with no install and is hosted free on GitHub Pages.

| File | Role |
| --- | --- |
| `js/content.js` | All story, dialogue, prices, quotas, ventures and disclaimers. Edit this file to change the story. |
| `js/game.js` | State machine: clock, quota, encounters, Stagnation Freeze, ledger, school transitions, ending. |
| `js/render.js` | Core renderer (crayon and pixel styles), camera window, compositing, rain, freeze desaturation. |
| `js/render-ad.js` | The '90s advert style (sets, mascots, broadcast overlays). |
| `js/render-real.js` | The stark realism style (perspective rooms, silhouettes, lighting, letterbox). |
| `js/audio.js` | Synthesised sound: fanfares, rain, the final drone. |
| `css/style.css` | Mobile-first layout and one UI skin per style. |
| `manifest.webmanifest`, `sw.js`, `icons/` | Home-screen app support. |

## 8. Change log

- **v2:** Rebuilt the Act 3 art as a full '90s TV commercial and the Act 4 art as cinematic realism. Rebuilt the layout to be playable on iPhone (portrait-first, safe areas, touch). Removed all act labels and title cards in favour of in-world transitions. Made it installable as a home-screen web app and hosted it on GitHub Pages.
- **v1:** First playable build of the whole arc: four art styles, Stagnation Freeze, quota and surplus kindness, ventures, externalities feed, the Fall and the cyclical ending.
