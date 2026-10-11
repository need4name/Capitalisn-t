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
| **The Stagnation Trap** | Every decent choice stops time in an awkward wait, then pays nothing. Daily dues freeze the day until you find money, and only exploitation makes money. | Make the player actively choose corruption in order to keep playing, and feel it. |
| **Visual progression** | Crayon → Y2K pixel art → glossy '90s TV advert → stark cinematic realism. | Mirror Tuck's growing detachment from reality as the empire scales. |
| **Explicit feedback** | Arcade fanfares for every exploit, then a "Meanwhile…" scene of the person you hurt, and a home-time recap of the whole day. | Set hyperactive rewards against raw human damage, and make the player sit with it. |
| **British satire** | Dry, absurdist tone in the vein of *Thank Goodness You're Here!* | Ground big economic critiques in mundane, recognisable school tropes. |
| **Organic progression** | The game never says "Act 2". Time passes, Tuck changes schools, and the world, art and interface change around him. | Let the player feel the slide rather than read about it. |

## 3. Key systems (as built)

### Discovery, not instruction
The game never explains its morality. The title screen is just the name. There are no tutorials, and choices carry no labels: nothing says "decent", "exploit", how much an option pays, or what it will cost. The player learns the rules by living with what happens.

### A school day (turn-based)
Each day has three moments (**morning break, lunch, afternoon break**), then **home time**. The clock only moves when the player taps *Carry on*, and it visibly runs forward to the next moment, so there is always time to read what just happened. Nothing happens in the background.

### Money only comes from choices
There is no passive income: no ledger, no ventures, nothing that earns while you wait. The only way to make money is to choose to take it from someone, face to face. Honest options pay very little, and some cost you.

### Consequences you have to face
Every exploitative choice has consequences that come back later:
- **Meanwhile…** Before the next encounter, the game cuts to the person you just exploited, alone and in the rain, and tells you what happened to them. You have to tap through it.
- **On the way home.** At home time, the day's remaining consequences are listed together before you can go to bed.
- Everything is kept in a log (≡ button), titled *Things That Happened → Gossip → Stakeholder Updates → Evidence* as Tuck changes school.

### Being good: the awkward wait
There are no rewards for being good. Choosing the decent option triggers an **awkward wait**:
- Time stops. The clock above the door stops, it starts to rain, the colour drains out and everyone freezes mid-motion.
- Nothing happens, for an uncomfortably long time (about 20 seconds), with **no indication of when it will end**. Small lines drift in ("Billy shifts from one foot to the other.", "Somebody, somewhere, is making money. It isn't you."). You can count raindrops, look at the clock, retie your shoe, read the poster again or think about the nature of value. None of it speeds anything up.
- At any point you can **Change your mind**, which takes you back to the choice and the options that pay.
- If you wait it out, *"Eventually, the moment passes."* The decent thing happens, and you get no money, no fanfare and nothing back. Soul does not go up.

### Daily dues (the trap)
At home time someone always wants paying: **the hall monitor (50p), Biff (£3), then the payroll (£40)**. If you can't pay, the day doesn't end. The bell doesn't ring, the scene freezes, nobody goes home, and the only way out is to **find the money**, which means another deal. Honest income barely covers the dues and never comes close to the next milestone. A player who keeps choosing decency is stuck at St. Pete's indefinitely, frozen at the gate every few days, until they face the fact that they have to sell their soul to make money.

### Meters
**Soul**, **Playground Happiness** and **Market Monopoly** are shown without numbers. Soul and happiness only ever go down: exploiting lowers them, and kindness never raises them again. Below 30 Soul, Tuck's eyes turn into £ signs.

### Milestones
Each school ends with a purchase that only exploitation can afford: the **Mega-Coated Trench Coat (£6)**, the **bikeshed from the Senior Hall Monitors (£50)**, and the **five-year exclusive contract with Vice-Principal Crane (£500)**. Once the story at a school runs out, quick deals keep turning up until you can afford it.

## 3b. Tone, cast and the world being strange

The comedy is deadpan, absurd and surreal, in the vein of *Thank Goodness You're Here!*: mundane British school life treated with enormous gravity, small things escalating past reason, and nobody remarking on it. The jokes keep coming at you while the moral weight lands quietly underneath.

**Recurring cast** (beyond the story characters):

| Who | Where | The bit |
| --- | --- | --- |
| **Gary** | Everywhere | A pigeon. Completes the hopscotch, guards sausage rolls, follows Tuck to big school, gets fat, gets a little tie and sits on the board, then loses the tie. He's the last thing beside Tuck on the wall at the end, and the only one who doesn't want anything. |
| **Dinner Lady Maureen** | St. Pete's | Reads the future in chips. "The pudding chooses its owner." |
| **Mr Dobson, Caretaker** | St. Pete's | Has mopped the same dry corridor since 1987. Appears in a 1952 photo, mopping. Mops through the freezes. |
| **Harriet and Harriet** | St. Pete's | Twins, but not to each other. Stare at you until the bell. |
| **Callum** | St. Pete's | Has drunk so much Ribena he is "technically a cordial". Leaves purple footprints. |
| **Nan** | Offstage | Notes in the jumper ("I KNOW."), eleven-minute voicemails of breathing, a cat bought specifically to blame. |
| **A Man from the Council** | St. Jude's onwards | Measures things. They are never the length they should be. Appears in the freezes to measure the silence ("too long"). Nods at you in the Fall. |
| **Mr Grieve, Chemistry** | St. Jude's | Regularly on fire. Keeps teaching. |
| **The Year 9 on the rope** | St. Jude's | Climbed the PE rope in 1998 and never came down. Lowers a bucket for crisps. |
| **Darren** | St. Jude's | Got so warm when the radiator came on in 1996 that he ascended. There's a plaque. |
| **Nibbles** | St. Jude's | The defamed hamster. Gets a shrine, a religion and, inexplicably, a guinea pig. |
| **Head Boy Josh** | Sixth Form | Ate all the chalk. Then ate his licence. |
| **Voltage Vince** | Sixth Form | The Volt-Juice™ mascot: a man in a can who has never been seen out of it. Payroll lists him as "ongoing". |
| **The Year 7 Focus Group** | Sixth Form | Unionises over Wagon Wheels. Describes the flavour Blue as "my dad". |

**How the world fills in around the choices:**
- **Interludes:** between encounters there's a coin-flip chance of a short in-world beat with no choice: a tannoy announcement ("the field is out of bounds due to the field"), something overheard, wet play, show and tell, a board meeting with Gary. Each plays once per run. There are about 12 per school, and 3 quiet ones in the Fall.
- **Quick deals** at each school feature the cast. They follow the same rules as everything else: exploiting pays and comes back on you, and decency pays nothing.
- **Evenings:** each home-time recap ends with a line from home (Nan, Countdown, the cat bought to blame, fish fingers arranged as a bar chart).
- **The waits** fill with absurd beats instead of commentary ("A silence arrives. It sits down next to you. It has brought sandwiches."). Dobson, the Council man and Gary wander through.

## 4. Narrative arc

| Stage | Setting and art | Mechanics and scams | Milestone that moves you on |
| --- | --- | --- | --- |
| Ages 8–10 | St. Pete's Primary. Hand-drawn crayon on paper. | Billy and the Holo-Dragon, the plaster shortage, loot-box lunchboxes, the Swapsies fee, Biff | Buy the Mega-Coated Trench Coat and take Biff (£6) |
| Ages 11–13 | St. Jude's Comprehensive. Crisp Y2K pixel art. | Dev's loan (200% plus his Game Boy), rain-shelter tenancy, Penny's homework factory, the flapjack/"Nibbles" smear, debt collection | Bribe the Senior Hall Monitors for the bikeshed (£50) |
| Ages 14–16 | Sixth Form Campus. Glossy '90s TV commercial. | Framing Maya in the election, breaking the fountains for Volt-Juice™, Mr Pembleton's photocopier, the exam ring, Penny's contract clause | Sign the five-year exclusive contract with Vice-Principal Crane (£500) |
| The Fall | Headteacher's office. Stark cinematic realism. | Mrs Ahmed and the ledger, the audit, Biff's statement, teachers confess, Penny leaves, the assembly | Expulsion. The cycle restarts. |

Transitions between schools are in-world captions ("Summer comes. Billy moves to Leicester…"), not title cards. The cut from the advert into the Fall is a hard burst of static: *"The confetti is still coming down when the picture cuts out."*

### The first choice: the sardine sandwich and the Holo-Dragon
Little Billy is crying on a damp bench over a sardine paste sandwich, and wants Tuck's only Gummy Snail. Nothing tells the player what's at stake.
- **"50p. Fair's fair."** or **"Have it."** Billy looks at you, you look at Billy, it starts to rain, and the clock above the door stops. Nothing happens for a long time. Eventually Billy gets his snail. You're left with 50p or less, and the hall monitor wants paying at home time.
- **"50p. And the Holo-Dragon."** An arcade fanfare plays (+50p! RARE CARD ACQUIRED! SOLD TO KYLE: +75p!). Then, before the next encounter, *Meanwhile: Billy didn't finish his sandwich.*

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
- Controls are tap-only: options, *Carry on*, the ≡ log and mute. There is no speed control, because the pace is the player's.

## 7. Technical architecture

The original blueprint suggested Unity or Godot. The game is built instead as a **dependency-free HTML5 Canvas / JavaScript web app**, so it runs on any phone with no install and is hosted free on GitHub Pages.

| File | Role |
| --- | --- |
| `js/content.js` | All story, dialogue, characters, interludes, evenings, prices, dues, awkward-wait lines and disclaimers. Edit this file to change the story. |
| `js/game.js` | Turn-based state machine: day moments, encounters, the awkward wait, consequences, home-time dues, school transitions, ending. |
| `js/render.js` | Core renderer (crayon and pixel styles), camera window, compositing, rain, freeze desaturation. |
| `js/render-ad.js` | The '90s advert style (sets, mascots, broadcast overlays). |
| `js/render-real.js` | The stark realism style (perspective rooms, silhouettes, lighting, letterbox). |
| `js/audio.js` | Synthesised sound: fanfares, rain, the final drone. |
| `css/style.css` | Mobile-first layout and one UI skin per style. |
| `manifest.webmanifest`, `sw.js`, `icons/` | Home-screen app support. |

## 8. Change log

- **v4:** Filled the world with character and surreal humour: a recurring cast (Gary the pigeon, Dinner Lady Maureen, Mr Dobson, Harriet and Harriet, Callum, the Man from the Council, Mr Grieve, Josh, Voltage Vince, the focus group, Nan offstage), about 38 interludes between encounters, 16 new quick deals, evening lines at home time, and absurd beats for the waits and freezes. Freeze lines that read as moral commentary were replaced. Added drawing for Gary (in every art style) and Vince's can costume.

- **v3:** Removed all explanation (the title screen is just the name; no choice labels or tutorial hints). Removed passive income and the ledger, so money only comes from choices. The game is now turn-based (three moments a day plus home time), and consequences come back as "Meanwhile…" scenes and a home-time recap. Being good no longer earns anything: the surplus/quota mechanic is replaced by an awkward, open-ended wait, then no reward. Daily dues freeze the day if you can't pay. Milestone prices are rebalanced (£6 / £50 / £500).

- **v2:** Rebuilt the Act 3 art as a full '90s TV commercial and the Act 4 art as cinematic realism. Rebuilt the layout to be playable on iPhone (portrait-first, safe areas, touch). Removed all act labels and title cards in favour of in-world transitions. Made it installable as a home-screen web app and hosted it on GitHub Pages.
- **v1:** First playable build of the whole arc: four art styles, Stagnation Freeze, quota and surplus kindness, ventures, externalities feed, the Fall and the cyclical ending.
