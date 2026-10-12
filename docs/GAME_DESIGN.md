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
| **The Stagnation Trap** | Any choice kinder than the hidden, rising line stops time in an awkward wait. Daily dues freeze the day until you find money. You have to get progressively worse to keep going. | Make the player actively choose corruption in order to keep playing, and feel it. |
| **Visual progression** | Crayon → Y2K pixel art → flat corporate illustration → stark cinematic realism. | Mirror Tuck's growing detachment from reality as the empire scales. |
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

### The hidden morality score and the rising line
Every ordinary option has a hidden **cruelty rating**:

| Rating | Meaning | Example (Little Billy) |
| --- | --- | --- |
| 0 | Kind | "Have it. It's only a snail." |
| 1 | Fair / selfish | "50p. Fair's fair." |
| 2 | Exploitative | "A pound. You can owe me the other 50p." |
| 3 | Vindictive | "50p. And the Holo-Dragon." |

Each school has a hidden **line**, the cruelty the world currently demands, and it rises as you go:

| Where | Line |
| --- | --- |
| St. Pete's Primary | Fair (1) for the first three days, then exploitative (2) from day 4 |
| St. Jude's Comprehensive | Exploitative (2), then vindictive (3) from day 3 |
| Sixth Form | Exploitative (2), then vindictive (3) from day 3 |

An encounter never demands more than the cruellest option it actually offers, so you can never be stuck.

- **At or above the line,** the choice just happens. Crueller options pay more, so **pure vindictiveness is the speedrun**. Doing only what the line demands is deliberately *just* enough: at St. Pete's it leaves well under a pound spare at the end of most days, so the player keeps weighing whether to go one step further. Going beyond what's needed is counted and shown in the final ledger.
- **Options are shuffled** every time an encounter appears, so the kind answer isn't always at the top and the cruel one at the bottom.
- **Below the line,** the **awkward wait** begins. **It cannot be skipped**: there is no button out. Time stops: the clock above the door stops, it starts to rain, the colour drains out and everyone freezes mid-motion. Nothing happens for an uncomfortably long time (16 seconds; it was 22, which was a few seconds too long), with **no indication of when it will end**. Small absurd lines drift in, and you can count raindrops, look for Gary, retie your shoe and so on. None of it speeds anything up. You have to wait it out. Then *"Eventually, the moment passes."* What you chose happens, slowly, with no fanfare and nothing extra. Soul does not go up.
- The total cruelty of your choices is the hidden **morality score**. The player never sees it until the final ledger, alongside "times you held back" and "times you went further than you had to".
- A player who is always kind never leaves St. Pete's.

**Balance (tested by playing bots end to end):**

| Strategy | St. Pete's | St. Jude's | Sixth Form |
| --- | --- | --- | --- |
| Pure vindictive | 2 days | 3 days | 3 days |
| Only what the line demands | 7 days | 4 days | 4 days |
| Always kind | Stuck: still at St. Pete's on day 12, frozen at the gate every night | | |

### Daily dues (the trap)
At home time someone always wants paying: **the hall monitor, then Biff, then the payroll**. The price **rises every day** for the first few days at each school ("the price depends"), then levels off:

| Where | Day 1 | Rises by | Levels off after |
| --- | --- | --- | --- |
| St. Pete's | 60p | 20p a day | 4 days (£1.40) |
| St. Jude's | £8 | £2 a day | 4 days (£16) |
| Sixth Form | £60 | £20 a day | 3 days (£120) |

If you can't pay, the day doesn't end. The bell doesn't ring, the scene freezes, nobody goes home, and the only way out is to **find the money**, which means another deal.

### IOUs and things that come back
Some options pay only part now and leave a debt (`follow` in the content). On a later morning the debtor turns up with whatever they've scraped together, and that's a new choice with its own cruelty ladder:
- **Billy** pays the other 50p as "38p, a Wotsit, and a small, very clean stone". Charge him a late fee and he's back with 20p in 1971 pennies from his nan's change jar. Then you can sell what's left of his debt to Kyle.
- **Jade's** wound-maintenance subscription comes up for renewal after her knee has healed. Renew or "upgrade to Gold Knee Cover" and she falls over on purpose to make a claim.
- **Priya** brings her 30p in an envelope marked SORRY. You can sell her another box on credit, which brings her back again.

### Bedtime: the tuck shop (the treadmill)
After home time, if you have money left, you lie awake thinking about the business and can buy grubby "improvements". Each one has an in-world description and a consequence that turns up the next morning:

| Where | Improvements |
| --- | --- |
| St. Pete's | A second jumper (nicked from your little brother), watered-down Ribena, "Premium" snails written on in biro |
| St. Jude's | Eleven more pockets (sewn by Biff's nan, who thinks it's for a play), laminated prices, Biffer (Biff's cousin, or Biff in a hat) |
| Sixth Form | Volt-Juice™ Platinum (a gold sticker), a loyalty scheme (ten stamps gets you a stamp), a consultant (Josh, who ate a book about consultancy) |

There are six per school, at fixed list prices that never change: £2.40–£6.50, £18–£50, then £240–£600. Each makes every deal pay 10–15% more. The effect resets when Tuck changes school, so it never exceeds about 2×. **Hidden from the player:** the world scales every dues payment, every milestone price and every later improvement by exactly the same factor. Upgrades never make the game easier; they only ever cost what you paid for them. In testing, buying every improvement roughly triples the time a school takes, even for a vindictive player. Until the reveal, the game never says so, and the text never contradicts it, because shop prices are fixed list prices and the goal price is never shown. Buying an improvement also counts towards the hidden cruelty score.

**The reveal (the only time the game tells you).** The morning after the player buys the *last* improvement at a school, the joke is told to them, once per run. On the night of the final purchase there's one more bedtime beat: "There is nothing left to improve. The business is fully improved. You sleep like a baby." Then, before registration, somebody shows them the maths (Priya in her rough book "the way a vet shows you an X-ray"; Josh on the blackboard; an auditor's very thin folder with Gary sitting on it). It gives the real numbers: what they spent at this school, and that what they sell, what they owe and the goal all rose by exactly the same percentage (about 100% at St. Pete's). "You are precisely where you would have been. Minus £X." The only button is "Oh." The point is that they only learn it after stepping over the edge, so they watch themselves fall. Afterwards every bedtime shop reads "You know what these do now. You lie awake looking at them anyway." The scaling still applies at later schools; they just know now. The final ledger adds "Spent improving the business".

### Hidden state
Nothing about morality is shown on screen. **Soul**, **playground happiness** and **market monopoly** are still tracked, but there are no meters. The only visible sign is Tuck himself: below 30 Soul, his eyes turn into £ signs. Soul only ever goes down. The player sees their cash and nothing else.

### The goal (always visible, never priced)
Each school's intro sets up what Tuck wants, and the HUD always shows it next to the day ("Monday · the coat"):

| Where | Goal |
| --- | --- |
| St. Pete's | **The coat**: a Mega-Coated Trench Coat with eleven inside pockets, sold by a Year 6 leaver behind the sports shed |
| St. Jude's | **The bikeshed**: the only dry, teacher-blind square metre, run by the Senior Hall Monitors |
| Sixth Form | **The contract**: Mr Crane's five-year exclusive deal ("He winks. It might be a tic. It is not a tic.") |

**The price is never shown as a number.** Progress is told in-world at home time ("The Year 6 leaver walks past, looks at your pockets, and laughs out loud" → "shakes his head. Not yet." → "nods. Slowly. Almost."). When you have enough, the seller just takes it: "Show us your pockets. …Yeah. That'll do." There is **no "Not yet" option**, so a player who has decided money is pointless can't refuse and soft-lock themselves; the world simply moves them on. Keeping the price invisible is also what keeps the hidden scaling hidden. The base prices (£5.10, £42.50 and £510) scale secretly with tuck-shop improvements.

## 3b.## 3b. Tone, cast and the world being strange

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
- **Quick deals** at each school feature the cast. There are enough that a normal playthrough never sees one twice: 42, 24 and 23 of them. They come out of a bag, so none repeats until all have played. Many run as a **series** that escalates each time it appears (series episodes come up a little more often, so they get to finish):
  - **Cordial Callum** (St. Pete's) goes purple, then mauve ("a phase"), starts a one-member Ribena support group, then accidentally wins the Cycling Proficiency award.
  - **The Squashquatch** (all three schools): a seven-foot creature made entirely of undiluted orange squash, looking for Callum. Sticky footprints and a sighting at the fence; then it enrols at St. Jude's as a "mature student"; and finally, in the Sixth Form, it finds Callum and the truth comes out: it is Callum's dad, who popped out for a bottle of squash ten years ago and has been concentrating ever since. Callum can dilute him back to a normal man one glass at a time, or Tuck can bottle him ("Squashquatch: Dad Strength").
  - **Desmond, solicitor** (St. Pete's, then the Sixth Form): a Year 4 with a clip-on tie and a briefcase containing one satsuma, charging a Panini sticker an hour. He sues the climbing frame, gets an injunction against Wet Play, and brings THE PLAYGROUND v. TUCK. At seventeen he's still not a lawyer, brings a class action against Volt-Juice™, then sues Time.
  - **Mr Pell, supply** (St. Jude's): has covered the same Year 9 Geography lesson on oxbow lakes since 1994. Nobody knows who for.
  - **Brenda** (Sixth Form): a purple beanbag hired as Head of Wellbeing, promoted to Assistant Head (Vibes), and then she bursts.

  The first episode at each new school is marked `catchUp`, so it works for someone who missed the earlier ones. Others call back across schools: Billy returns at sixteen and can be sold his own Holo-Dragon. They follow the same rules as everything else: exploiting pays and comes back on you, and decency pays nothing.
- **Evenings:** each home-time recap ends with a line from home (Nan, Countdown, the cat bought to blame, fish fingers arranged as a bar chart).
- **The waits** fill with absurd beats instead of commentary ("A silence arrives. It sits down next to you. It has brought sandwiches."). Dobson, the Council man and Gary wander through.

## 4. Narrative arc

| Stage | Setting and art | Mechanics and scams | Milestone that moves you on |
| --- | --- | --- | --- |
| Ages 8–10 | St. Pete's Primary. Hand-drawn crayon on paper. | Billy and the Holo-Dragon, the plaster shortage, loot-box lunchboxes, the Swapsies fee, Biff | Buy the Mega-Coated Trench Coat and take Biff (£5.10) |
| Ages 11–13 | St. Jude's Comprehensive. Crisp Y2K pixel art. | Dev's loan (200% plus his Game Boy), rain-shelter tenancy, Penny's homework factory, the flapjack/"Nibbles" smear, debt collection | Bribe the Senior Hall Monitors for the bikeshed (£42.50) |
| Ages 14–16 | Sixth Form Campus. Flat corporate illustration (startup-website style). | Framing Maya in the election, breaking the fountains for Volt-Juice™, Mr Pembleton's photocopier, the exam ring, Penny's contract clause | Sign the five-year exclusive contract with Vice-Principal Crane (£510) |
| The Fall | Headteacher's office. Stark cinematic realism. | Mrs Ahmed and the ledger, the audit, Biff's statement, teachers confess, Penny leaves, the assembly | Expulsion. The cycle restarts. |

Transitions between schools are short comic story beats with their own scenes, and each one explains the change in art style:
- **St. Pete's → St. Jude's:** Tuck walks out in the coat with Biff behind him "like weather", spends six weeks of rain doing stocktake on a jumper, and Gary sees him off. On the first morning of big school his mum's photo comes back from Boots and he's "very slightly pixelated. So is she. So is the dog. Nobody mentions it."
- **St. Jude's → Sixth Form:** Gavin hands over the keys to a bikeshed with no door. "Year 9 happens. GCSEs happen. A moustache happens, mostly." Then everything turns flat: "Not sad. Flat." Everyone's arms are much longer, their heads much smaller, and they all seem delighted about it. His mum waves goodbye with an arm that reaches the end of the drive. Biff has a mission statement.
- **Sixth Form → the Fall:** a giant novelty cheque made out to you, from you. Somebody in lost property finds a ledger. "The confetti is still coming down when the picture cuts out."

The HUD is hidden during transitions. The cut from the flat corporate world into the Fall is a hard burst of static: *"The confetti is still coming down when the picture cuts out."*

### The first choice: the sardine sandwich and the Holo-Dragon
Little Billy is crying on a damp bench over a sardine paste sandwich, and wants Tuck's only Gummy Snail. Nothing tells the player what's at stake.
- **"Have it."** Billy looks at you, you look at Billy, it starts to rain, and the clock above the door stops. Nothing happens for a long time. Eventually Billy gets his snail and you get nothing.
- **"50p. Fair's fair."** A plain, honest sale. No pause and no fanfare. Fine, for now.
- **"A pound. You can owe me the other 50p."** Billy hands over an IOU in felt tip: "I.O.U. 50P. LOVE BILLY."
- **"50p. And the Holo-Dragon."** An arcade fanfare plays (+50p! RARE CARD ACQUIRED! SOLD TO KYLE: +£1.25!). Then, before the next encounter, *Meanwhile: Billy didn't finish his sandwich.* This is the speedrun opening.

### The Fall and the twist ending
Every option in the Fall is **futile**: bribes, denial, shredding evidence and hiring a solicitor all cost money and change nothing. In assembly, apologising and offering to give it all back triggers the **final freeze**. A high-pitched drone plays, the whole school freezes mid-cough, and the game refuses redemption ("Refunds are not available at this time"). The only way out is to accept expulsion.

Tuck sits on a wall outside the gates in the rain, assetless, watching kids play freely through the railings. The art returns to crayon: behind the sports shed at St. Pete's, a new eight-year-old steps out with mismatched shoes and a rolled-up jumper, while across the playground someone cries into a sandwich. **"THE DEVIL DIES, BUT THE MARKET LIVES FOREVER."** *Begin again* starts the next generation.

## 5. Art direction

| Style | How it's drawn |
| --- | --- |
| **Crayon** | Hand-drawn wobbly outlines and diagonal hatching on lined paper. The linework redraws ("boils") at 8 fps. Stick-figure kids with big heads. |
| **Y2K pixel** | Drawn at 320×180 and scaled up with nearest-neighbour; dithered skies, scanlines, a navy/cyan/magenta UI and pixel fonts. |
| **Flat corporate illustration** | The style of a startup's About page (replaced the '90s advert in v9, which was too harsh on the eyes). Calm pastels on cream (coral, sage, dusty blue, mustard, lilac), soft blobs behind everything, no outlines, no gradients, nothing flashing. Sets: a common room with a big window, a pendant lamp, a bean bag and a chart that only goes up; Tuck's office with a pastel skyline, a laptop and a framed chart; a corridor of pastel lockers under a "DREAM BIG (£2)" poster; and a rebranded school outside. Everything is branded "tuck." (lower case, with a coral full stop). People have long noodly limbs, tiny heads, dot eyes and big flat shoes, and Tuck always holds one arm out as if presenting a slide. Vince is a big flat can with "volt" on it. Small-print disclaimers drift along the bottom in quiet grey ("*Tuck Enterprises™ accepts no liability for childhood"). |
| **Stark realism** | One-point-perspective rooms (office, corridor, assembly hall, street at dusk) lit by cold window light and failing fluorescent tubes. Rain runs down the glass. People have realistic proportions and are drawn as backlit silhouettes with rim light, with only shadowed eye sockets for faces. Heads drop and shoulders slump when sad; arms fold when angry. Letterboxed with film grain and a vignette. The final freeze fully desaturates the frame. |

### Characters match their descriptions
Every detail the text mentions is drawn: Billy's sardine sandwich, Jade's grazed knee, Priya's sandwich, Kyle's business card, Biff's moustache, Penny's tired eyes, Mr Dobson's mop, Dinner Lady Maureen's hairnet, Callum's purple Ribena stain, Mr Grieve's burning eyebrows, the Council man's clipboard, Josh's chalky mouth, Voltage Vince's can, Gary the pigeon, the Squashquatch (seven feet of see-through orange squash with pulp drifting inside it, a sticky puddle and sad eyes), Desmond's briefcase and clip-on tie, Mr Pell's elbow-patched cardigan and flask, and Tuck's sixth-form moustache ("mostly shadow").

## 6. Platforms and interface

- **Browser game, built for iPhone first.** In portrait the layout stacks a compact HUD (place, day, time, cash), the scene, the latest consequence and the story panel. In landscape and on desktop, the scene sits beside the story panel.
- The camera window adapts to the stage's shape: narrow phone stages see the middle of the scene, where the characters are.
- Tap targets are at least 44 px. The layout respects iPhone safe areas and the notch. Keyboard hints only appear on devices with a keyboard.
- **Home-screen app:** a web app manifest, icons and a service worker mean it can be added to the home screen, runs full-screen and works offline after the first visit. In home-screen mode the game sizes itself to the physical screen, because iOS otherwise reports a viewport one status bar short and leaves a gap at the bottom.
- Progress autosaves at the start of each day.
- Controls are tap-only: options, *Carry on*, the ≡ log and mute. There is no speed control, because the pace is the player's.

## 7. Technical architecture

The original blueprint suggested Unity or Godot. The game is built instead as a **dependency-free HTML5 Canvas / JavaScript web app**, so it runs on any phone with no install and is hosted free on GitHub Pages.

| File | Role |
| --- | --- |
| `js/content.js` | All story, dialogue, characters, interludes, evenings, tuck-shop improvements, prices, dues, awkward-wait lines and disclaimers. Edit this file to change the story. |
| `js/game.js` | Turn-based state machine: day moments, encounters, the awkward wait, consequences, home-time dues, school transitions, ending. |
| `js/render.js` | Core renderer (crayon and pixel styles), camera window, compositing, rain, freeze desaturation. |
| `js/render-flat.js` | The Sixth Form's flat corporate-illustration style (pastel sets, long-limbed small-headed people, small print). |
| `js/render-real.js` | The stark realism style (perspective rooms, silhouettes, lighting, letterbox). |
| `js/audio.js` | Synthesised sound: fanfares, rain, the final drone. |
| `css/style.css` | Mobile-first layout and one UI skin per style. |
| `manifest.webmanifest`, `sw.js`, `icons/` | Home-screen app support. |

## 8. Change log

- **v9:** Fanfare pop-ups now stay on screen until you carry on, so there's time to read them. The awkward wait is 16 seconds (was 22). Every school is shorter (goals 15% cheaper) and there are many more quick deals (St. Pete's 27, St. Jude's 24, Sixth Form 23), so a normal playthrough never repeats one; Callum's last episode no longer loops. New running storylines: the Squashquatch (all three schools, ending in the reveal that it's Callum's dad), Desmond the Year 4 solicitor, Mr Pell the eternal supply teacher, and Brenda the wellbeing beanbag. Series can be joined partway through at a new school (`catchUp`) and come up a little more often so they finish. The Sixth Form's '90s advert art, which was painful to look at, is replaced by a calm flat corporate-illustration style, and the transition into it is rewritten ("everything is flat. Not sad. Flat.").

- **v8:** The tuck-shop treadmill is now revealed, once per run, the morning after the player buys the last improvement at a school, with the real numbers (spent, and the identical percentage rise in sales, dues and the goal). Before that, a "fully improved" bedtime beat; afterwards a knowing bedtime line. The final ledger shows total spent on improvements.

- **v7:** IOUs pay part now, and the debtor returns on a later day as a new choice (Billy, Jade, Priya). Every school shows its goal in the HUD and intro, with progress told in-world and never as a number. Milestones can no longer be refused (no soft-lock). The shop is bigger (six items per school) at fixed prices about three times higher, with smaller effects that reset per school, so the hidden scaling can't be spotted. Added about 19 new quick deals, including a four-part Cordial Callum series and Billy returning at sixteen. Quick deals no longer repeat until all have played. Transitions are now comic story beats that explain each art-style change. The awkward wait can no longer be skipped.

- **v6:** Rebalanced so that doing only what the line demands is just about enough to scrape by. Dues now rise daily for the first few days at each school, then level off. The Sixth Form line starts at exploitative. St. Jude's quick deals gained vindictive options. Added the bedtime tuck shop: immoral improvements that secretly don't help, because the world scales to match. Options are now shuffled. Removed the Soul, Happiness and Monopoly meters from the screen. Characters now visibly match their descriptions. Milestone and dues amounts in the text are generated from the scaled numbers.

- **v5:** Added the hidden morality score. Every option has a cruelty rating (kind / fair / exploitative / vindictive), and each school has a hidden line that rises over time (fair at first, then exploitative, then vindictive). Only choices below the line trigger the awkward wait. Crueller pays more, so pure vindictiveness is the speedrun, and holding back takes longer. New vindictive and fair options were written across the story and quick deals. The final ledger now shows cruelty, times held back, and times you went further than you had to. Fixed the bottom gap on iPhone home-screen apps. Billy is always the first encounter.

- **v4:** Filled the world with character and surreal humour: a recurring cast (Gary the pigeon, Dinner Lady Maureen, Mr Dobson, Harriet and Harriet, Callum, the Man from the Council, Mr Grieve, Josh, Voltage Vince, the focus group, Nan offstage), about 38 interludes between encounters, 16 new quick deals, evening lines at home time, and absurd beats for the waits and freezes. Freeze lines that read as moral commentary were replaced. Added drawing for Gary (in every art style) and Vince's can costume.

- **v3:** Removed all explanation (the title screen is just the name; no choice labels or tutorial hints). Removed passive income and the ledger, so money only comes from choices. The game is now turn-based (three moments a day plus home time), and consequences come back as "Meanwhile…" scenes and a home-time recap. Being good no longer earns anything: the surplus/quota mechanic is replaced by an awkward, open-ended wait, then no reward. Daily dues freeze the day if you can't pay. Milestone prices are rebalanced (£6 / £50 / £500).

- **v2:** Rebuilt the Act 3 art as a full '90s TV commercial and the Act 4 art as cinematic realism. Rebuilt the layout to be playable on iPhone (portrait-first, safe areas, touch). Removed all act labels and title cards in favour of in-world transitions. Made it installable as a home-screen web app and hosted it on GitHub Pages.
- **v1:** First playable build of the whole arc: four art styles, Stagnation Freeze, quota and surplus kindness, ventures, externalities feed, the Fall and the cyclical ending.
