/*
 * TUCK — all narrative content, numbers and tuning live here.
 * Nothing in this file is code you need to understand to rewrite the story:
 * edit the text, add/remove encounters, tweak prices.
 *
 * Money is always in PENCE (100 = £1).
 *
 * Every ordinary option has a hidden cruelty rating, `evil`:
 *   0 kind · 1 fair / selfish · 2 exploitative · 3 vindictive
 * Each school has a hidden LINE that rises over time (acts[n].line). An option
 * below the line triggers the awkward wait: time stops, nothing happens for an
 * uncomfortably long time, then the moment passes and you get the outcome with
 * no reward. At or above the line it just happens. Crueller pays more, so pure
 * vindictiveness is the speedrun. The line never asks for more than the
 * cruellest option an encounter actually offers.
 *
 * Special option types (no `evil`):
 *   futile    – Act 4 only. Costs money, changes nothing.
 *   milestone – ends the act. Needs option.cost in cash.
 *   later     – snooze the milestone for an hour.
 *   confess   – the final freeze.
 *   accept    – accept expulsion; roll the ending.
 */
(function () {
  const T = (window.Tuck = window.Tuck || {});

  /* ------------------------------------------------------------------ */
  /* People (appearance only)                                           */
  /* ------------------------------------------------------------------ */
  const SKIN = ['#f3d2b3', '#e8b88f', '#c68e5f', '#8d5a3b', '#5e3a26'];
  const people = {
    billy: { name: 'Little Billy', skin: SKIN[0], shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#e7bf62', hairStyle: 'mop', s: 0.85, mood: 'crying' },
    jade: { name: 'Jade', skin: SKIN[1], shirt: '#d9d9d9', trousers: '#5b5f66', skirt: true, hair: '#7a3f1d', hairStyle: 'pony', s: 0.9, mood: 'sad' },
    priya: { name: 'Priya', skin: SKIN[2], shirt: '#d9d9d9', trousers: '#5b5f66', skirt: true, hair: '#1d1410', hairStyle: 'long', s: 0.9, mood: 'neutral' },
    kyle: { name: 'Kyle', skin: SKIN[0], shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#c4552b', hairStyle: 'short', s: 0.95, mood: 'happy' },
    biff: { name: 'Biff', skin: SKIN[1], shirt: '#d9d9d9', trousers: '#3b3f46', hair: '#3a2a1a', hairStyle: 'buzz', s: 1.2, mood: 'angry', wide: 1.35 },
    year2: { name: 'A Year 2', skin: SKIN[3], shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#1d1410', hairStyle: 'short', s: 0.72, mood: 'happy' },
    leaver: { name: 'Year 6 Leaver', skin: SKIN[2], shirt: '#d9d9d9', trousers: '#3b3f46', hair: '#1d1410', hairStyle: 'short', s: 1.15, mood: 'neutral', shades: true },
    dev: { name: 'Dev', skin: SKIN[2], shirt: '#ffffff', trousers: '#2b2f3a', blazer: '#1f2f6b', tie: '#b71c1c', hair: '#1d1410', hairStyle: 'short', s: 1.0, mood: 'sad' },
    year7s: { name: 'Soggy Year 7s', skin: SKIN[0], shirt: '#ffffff', trousers: '#2b2f3a', blazer: '#1f2f6b', tie: '#b71c1c', hair: '#8a5a2b', hairStyle: 'mop', s: 0.95, mood: 'sad' },
    penny: { name: 'Penny', skin: SKIN[3], shirt: '#ffffff', trousers: '#2b2f3a', skirt: true, blazer: '#1f2f6b', tie: '#b71c1c', hair: '#1d1410', hairStyle: 'bun', s: 1.0, mood: 'tired', glasses: true },
    okafor: { name: 'Mrs Okafor', skin: SKIN[4], shirt: '#e67e22', trousers: '#3b3f46', skirt: true, hair: '#1d1410', hairStyle: 'wrap', hairColor2: '#f1c40f', s: 1.35, adult: true, mood: 'happy', apron: true },
    gavin: { name: 'Head Monitor Gavin', skin: SKIN[0], shirt: '#ffffff', trousers: '#2b2f3a', blazer: '#1f2f6b', tie: '#b71c1c', hair: '#d6b25e', hairStyle: 'side', s: 1.15, mood: 'smug', sash: true },
    maya: { name: 'Maya Patel', skin: SKIN[2], shirt: '#ffffff', trousers: '#222', skirt: true, blazer: '#2c2c2c', hair: '#1d1410', hairStyle: 'long', s: 1.15, mood: 'happy', badge: true },
    pembleton: { name: 'Mr Pembleton', skin: SKIN[0], shirt: '#c7b98f', trousers: '#5a4a35', blazer: '#6e5a3a', tie: '#2e5e3e', hair: '#bbbbbb', hairStyle: 'bald', s: 1.35, adult: true, mood: 'tired', glasses: true },
    crane: { name: 'Mr Crane, Vice-Principal', skin: SKIN[1], shirt: '#ffffff', trousers: '#1a1a1a', blazer: '#1a1a1a', tie: '#c0a000', hair: '#2b2b2b', hairStyle: 'slick', s: 1.4, adult: true, mood: 'smug' },
    sixthformer: { name: 'A Year 12', skin: SKIN[1], shirt: '#ffffff', trousers: '#222', blazer: '#2c2c2c', hair: '#5a3a1a', hairStyle: 'long', s: 1.1, mood: 'sad' },
    ahmed: { name: 'Mrs Ahmed', skin: SKIN[2], shirt: '#2f7d3b', trousers: '#2a2a2a', hair: '#1d1410', hairStyle: 'wrap', hairColor2: '#334', s: 1.35, adult: true, mood: 'angry', ledger: true },
    head: { name: 'The Headteacher', skin: SKIN[0], shirt: '#ffffff', trousers: '#333', blazer: '#3a3a4a', tie: '#552222', hair: '#999', hairStyle: 'side', s: 1.4, adult: true, mood: 'neutral', glasses: true },
    lanyard: { name: 'Safeguarding Lady', skin: SKIN[3], shirt: '#9b59b6', trousers: '#333', skirt: true, hair: '#2b1b10', hairStyle: 'bob', s: 1.35, adult: true, mood: 'neutral', lanyard: true },
    newkid: { name: 'New Kid', skin: SKIN[3], shirt: '#5a6fd6', trousers: '#1f2a5a', shorts: true, hair: '#1d1410', hairStyle: 'mop', s: 0.85, mood: 'neutral', shoes: ['#d22', '#2a6ad2'], jumperRoll: true },
    maureen: { name: 'Dinner Lady Maureen', skin: SKIN[1], shirt: '#6fae7a', trousers: '#3b3f46', skirt: true, hair: '#c8c8c8', hairStyle: 'bun', s: 1.3, adult: true, mood: 'neutral', apron: true },
    dobson: { name: 'Mr Dobson, Caretaker', skin: SKIN[0], shirt: '#35598c', trousers: '#35598c', hair: '#8a8a8a', hairStyle: 'bald', s: 1.35, adult: true, mood: 'tired' },
    council: { name: 'A Man from the Council', skin: SKIN[0], shirt: '#e2dcc6', trousers: '#5a594a', blazer: '#6b6a58', tie: '#4a4a40', hair: '#5a5a5a', hairStyle: 'side', s: 1.4, adult: true, mood: 'neutral', glasses: true, lanyard: true },
    harrietA: { name: 'Harriet and Harriet', skin: SKIN[0], shirt: '#d9d9d9', trousers: '#5b5f66', skirt: true, hair: '#e7bf62', hairStyle: 'pony', s: 0.85, mood: 'neutral' },
    harrietB: { name: 'Harriet', skin: SKIN[3], shirt: '#d9d9d9', trousers: '#5b5f66', skirt: true, hair: '#1d1410', hairStyle: 'pony', s: 0.85, mood: 'neutral' },
    callum: { name: 'Callum (mostly Ribena)', skin: '#e9b9cf', shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#7a3f8a', hairStyle: 'mop', s: 0.9, mood: 'happy' },
    gary: { name: 'Gary', pigeon: true, s: 1 },
    grieve: { name: 'Mr Grieve, Chemistry', skin: SKIN[0], shirt: '#ffffff', trousers: '#3b3f46', blazer: '#ececec', hair: '#d0d0d0', hairStyle: 'scruff', s: 1.35, adult: true, mood: 'tired', glasses: true },
    josh: { name: 'Josh, Head Boy', skin: SKIN[0], shirt: '#ffffff', trousers: '#222', blazer: '#2c2c2c', hair: '#d6b25e', hairStyle: 'mop', s: 1.12, mood: 'happy', badge: true },
    vince: { name: 'Voltage Vince', skin: SKIN[1], shirt: '#e8202a', trousers: '#222', hair: '#222', hairStyle: 'short', s: 1.4, adult: true, mood: 'happy', can: true },
    focus: { name: 'The Year 7 Focus Group', skin: SKIN[2], shirt: '#ffffff', trousers: '#222', hair: '#1d1410', hairStyle: 'short', s: 0.9, mood: 'neutral' },
    cryer: { name: 'Crying Kid', skin: SKIN[0], shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#c4552b', hairStyle: 'pony', s: 0.82, mood: 'crying', sandwich: true },
  };

  /* Tuck's look evolves per act. soul < 30 gives him pound-sign eyes. */
  function tuckLook(act, soul) {
    const base = { name: 'Tuck', skin: SKIN[0], hair: '#6b4a2b', s: 1, mood: 'neutral', pound: soul < 30 };
    if (act === 1) return Object.assign(base, { shirt: '#c9c9c9', trousers: '#1f2a5a', shorts: true, hairStyle: 'scruff', s: 0.9, shoes: ['#c62828', '#e0473a'], jumperRoll: true });
    if (act === 2) return Object.assign(base, { shirt: '#ffffff', trousers: '#2b2f3a', coat: '#7a5a34', hairStyle: 'scruff', s: 1.0, shoes: ['#c62828', '#e0473a'] });
    if (act === 3) return Object.assign(base, { shirt: '#ffffff', trousers: '#111', blazer: '#111', tie: '#ffcc00', hairStyle: 'slick', s: 1.15, mood: 'smug', organiser: true, shoes: ['#111', '#111'] });
    return Object.assign(base, { shirt: '#cfcfcf', trousers: '#2a2a2a', coat: '#4a4038', hairStyle: 'wet', s: 1.15, mood: 'sad', shoes: ['#222', '#222'] });
  }

  /* ------------------------------------------------------------------ */
  /* Acts                                                               */
  /* ------------------------------------------------------------------ */
  const acts = {
    1: {
      num: 1,
      title: 'Crayon Capitalist',
      school: "St. Pete's Primary",
      short: "St. Pete's",
      ages: 'Ages 8–10',
      style: 'crayon',
      bg: 'playground',
      target: 600,
      line: [[1, 1], [4, 2]], // [from day, cruelty required]
      dues: 50, // owed every day at home time
      duesWho: 'the hall monitor',
      broke: 'The hall monitor is waiting at the gate with his hand out. He wants 50p. You have {cash}. The bell doesn’t ring. Nobody goes home.',
      paid: 'Gave the hall monitor 50p at the gate. Nobody knows why.',
      start: 605, // 10:05 on day one
      feedTitle: 'Things That Happened',
      objective: 'There’s a Year 6 leaver selling a Mega-Coated Trench Coat. Six quid.',
      outro: [
        'Summer comes. Billy moves to Leicester. Nobody tells him why, and nobody tells you. Gary the pigeon sees you off at the gates. He does not wave. Pigeons can’t wave. It’s implied.',
        'The coat comes with you to big school. So does Biff.',
      ],
      intro: [
        "St. Pete's Primary. Morning break.",
        'This is Tucker. Everyone calls him Tuck. Mismatched shoes — one red, one a different red. Navy shorts in a school of grey trousers.',
        "Rolled inside his jumper: eleven Gummy Snails, liberated from his nan's handbag.",
        'The hall monitor wants 50p every day by home time. Nobody knows why. That is just how it is.',
      ],
    },
    2: {
      num: 2,
      title: 'The Playground Syndicate',
      school: "St. Jude's Comprehensive",
      short: "St. Jude's",
      ages: 'Ages 11–13',
      style: 'pixel',
      bg: 'corridor',
      target: 5000,
      line: [[1, 2], [3, 3]],
      dues: 300,
      duesWho: 'Biff',
      broke: 'Biff is waiting by the gates. Biff is on £3 a day. You have {cash}. Biff doesn’t go home until he’s paid, and neither do you.',
      paid: 'Paid Biff his £3. He counted it twice.',
      outro: [
        'Three years go by the way three years do at that age: all at once, and then forever.',
        'You stop selling things. You start owning the things other people sell.',
      ],
      start: 530,
      feedTitle: 'Gossip',
      objective: 'The Senior Hall Monitors run the bikeshed. Word is they’d sell it for fifty quid.',
      intro: [
        "St. Jude's Comprehensive. 1,400 pupils. One working radiator.",
        'Tuck is eleven now. The coat is still enormous. It is a statement. The statement is: inside this coat there are things you want.',
        "Biff came too. Biff was held back, then pushed forward, and now he's in Year 7 with you. He's on £3 a day.",
      ],
    },
    3: {
      num: 3,
      title: 'Campus Oligarch',
      school: 'Sixth Form Campus',
      short: 'Sixth Form',
      ages: 'Ages 14–16',
      style: 'ad',
      bg: 'sixth',
      target: 50000,
      line: [[1, 3]],
      dues: 4000,
      duesWho: 'the payroll',
      broke: 'Biff, Gavin and Mr Pembleton are waiting outside your office. Between them they’re owed £40 a day. You have {cash}. Nobody leaves until everybody’s paid.',
      paid: 'Paid out £40 in retainers: Biff, Gavin, and an envelope for Mr Pembleton.',
      outro: [
        'The confetti is still coming down when the picture cuts out.',
      ],
      start: 530,
      feedTitle: 'Stakeholder Updates',
      objective: 'Mr Crane keeps mentioning an envelope. Five hundred pounds would fill it.',
      intro: [
        'TUCK ENTERPRISES™. Est. Year 9. Now with a Sixth Form Campus Division!',
        "Tuck doesn't deal any more. He has a digital organiser, a mission statement, and a moustache he's very proud of. It's mostly shadow.",
        'Remember: playground happiness is a renewable resource. Until it isn’t.',
      ],
    },
    4: {
      num: 4,
      title: 'The Reckoning',
      school: "Headteacher's Office",
      short: "Head's Office",
      ages: 'The Fall',
      style: 'real',
      bg: 'office',
      target: 0,
      dues: 0,
      start: 552,
      noDayEnd: true,
      feedTitle: 'Evidence',
      objective: '',
      intro: [
        "Monday. It's raining. It has always been raining. You just couldn't see it from inside the advert.",
        "Dev's mum found the ledger, in the inside pocket of the coat you left in lost property. It has everyone's name in it. Some names more than once.",
      ],
    },
  };

  /* ------------------------------------------------------------------ */
  /* Story encounters — played in order within each act                 */
  /* ------------------------------------------------------------------ */
  const story = {
    1: [
      {
        id: 'billy',
        scene: { cast: ['billy'], bench: true },
        speaker: 'billy',
        text: 'Little Billy is on the damp bench, crying into a sardine paste sandwich. His mum cut the crusts off. It didn’t help. He is looking at your Gummy Snail the way men in films look at the sea.',
        line: 'Tuck… can I have your snail? I’ve got 50p.',
        awkward: 'Billy looks at you. You look at Billy. It starts to rain. The clock above the door stops at {time}. Neither of you moves.',
        options: [
          { evil: 1, label: '“50p. Fair’s fair.”', cash: 50, result: 'Billy hands over a warm 50p and eats the snail slowly, like it’s the last good thing that will ever happen to him.' },
          { evil: 0, label: '“Have it. It’s only a snail.”', cash: 0, soul: 3, result: 'Billy stops crying. He says thank you four times. You feel something warm in your chest. It doesn’t pay the hall monitor.' },
          {
            evil: 2, label: '“A pound. You can owe me the other 50p.”', cash: 100, soul: -5, happy: -3,
            fanfare: ['+50p!', 'IOU ACQUIRED!'],
            result: 'Billy hands over 50p and an IOU in felt tip. It says I.O.U. 50P. LOVE BILLY. The “love” is the worst part. You fold it into the jumper with the snails.',
            feed: ['Billy has started skipping his Wotsits to pay back the 50p. He is eight. He has a repayment plan.'],
          },
          {
            evil: 3, label: '“50p. And the Holo-Dragon.”', cash: 175, soul: -10, happy: -6,
            fanfare: ['+50p!', 'RARE CARD ACQUIRED!', 'SOLD TO KYLE: +£1.25!'],
            result: 'Billy’s fingers hold on to the card exactly one second longer than is dignified. Then he lets go. Kyle from Year 5 buys it off you at lunch for £1.25. Billy watches the whole transaction from the bench.',
            feed: ['Billy didn’t finish his sandwich. Or the snail, in the end.', 'Billy told his mum he lost the Holo-Dragon. He’s started saying he “lost” things a lot.'],
          },
        ],
      },
      {
        id: 'jade',
        scene: { cast: ['jade'] },
        speaker: 'jade',
        text: 'Jade has grazed her knee on the hopscotch. Nurse Pat has run out of plasters, because on Saturday somebody bought every plaster in the Co-op. That somebody was you.',
        line: 'It’s bleeding. Have you got a plaster? Nurse Pat says there’s a national shortage.',
        options: [
          { evil: 1, label: '“One plaster. 40p.”', cash: 40, result: 'Jade pays 40p. It’s a good plaster. It has a dinosaur on it. The dinosaur looks a bit smug.' },
          { evil: 0, label: '“Here. Free. Keep it clean.”', cash: 0, soul: 3, result: 'Jade says you’re her best friend now. You are not sure you can afford friends.' },
          {
            evil: 2, label: '“Plasters are 60p. It’s a two-plaster knee.”', cash: 120, soul: -6, happy: -5, mono: 5,
            fanfare: ['+£1.20!', 'MARKET CORNERED!'],
            result: 'Jade pays with her trip money. You apply the plasters with the tenderness of a man buying a lake.',
            feed: ['Jade’s class went to the Sea Life Centre. Jade stayed behind and did colouring with the deputy head.', 'Nurse Pat has started recommending “walking it off”.'],
          },
          {
            evil: 3, label: '“Two plasters, £1.20, plus a wound maintenance contract. 10p a day.”', cash: 220, soul: -10, happy: -6, mono: 5,
            fanfare: ['+£1.20!', 'RECURRING REVENUE!', 'SUBSCRIPTION ACTIVE!'],
            result: 'Jade signs the contract in crayon. Every morning you inspect her knee by looking at it from about a metre away and nodding. She pays 10p for the nod.',
            feed: ['Jade’s knee healed on Wednesday. She’s still paying. The contract has no end date. She’s eight.', 'Jade has started limping on purpose. She thinks that’s what she’s paying for.'],
          },
        ],
      },
      {
        id: 'priya',
        scene: { cast: ['priya'] },
        speaker: 'priya',
        text: 'Priya has had the same cheese sandwich every day since Reception. You have had an idea. It involves her lunch, a felt tip, and the concept of chance.',
        line: 'What’s in the box?',
        options: [
          { evil: 1, label: '“It’s a carrot, Priya. 30p.”', cash: 30, result: 'Priya buys the carrot. She appreciates the honesty. Honesty, it turns out, is 30p.' },
          { evil: 0, label: 'Swap lunches with her. No charge.', cash: 0, soul: 3, result: 'Priya eats your crisps. You eat her cheese sandwich. It is, honestly, a superb cheese sandwich.' },
          {
            evil: 2, label: '“30p a box. Could be a Wagon Wheel. Could be anything.”', cash: 120, soul: -7, happy: -6, mono: 5,
            fanfare: ['+£1.20!', 'NEW REVENUE STREAM!'],
            result: 'Priya opens three boxes. Carrot. Carrot. A different carrot. She buys a fourth on credit. There is no Wagon Wheel. There has never been a Wagon Wheel.',
            feed: ['Priya owes you 30p. She has started drawing Wagon Wheels in her maths book.', 'Mystery lunchboxes are now banned at St. Pete’s. Demand has doubled.'],
          },
          {
            evil: 3, label: 'Sell her the box. Then sell her the premium key to open it. 50p.', cash: 200, soul: -10, happy: -6, mono: 5,
            fanfare: ['+£2!', 'PREMIUM TIER UNLOCKED!'],
            result: 'Priya buys the box for 30p and the premium key for 50p. The key is a key-shaped bit of cereal box. The lunchbox was never locked. She opens it with the key anyway, very carefully, so it counts.',
            feed: ['Priya keeps a jar of cardboard keys on her windowsill. Her mum thinks it’s a craft project.', 'Priya has asked for a key to her own house. Her dad says she already has one. She says it isn’t premium.'],
          },
        ],
      },
      {
        id: 'kyle',
        scene: { cast: ['kyle'] },
        speaker: 'kyle',
        text: 'The Swapsies Market behind the climbing frame runs on an honour system. Honour is, in your view, a market inefficiency. Kyle is nine. He has business cards. They just say KYLE.',
        line: 'Swap you two UFO Snaps for a Gummy Snail? I’ll throw in a business card.',
        options: [
          { evil: 1, label: '“Two snaps for a snail. Done.”', cash: 40, result: 'A clean swap. Kyle seems genuinely delighted. The honour system holds for one more day.' },
          { evil: 0, label: 'Leave the Swapsies Market alone.', cash: 0, soul: 2, result: 'The market thrives without you. It’s annoying to watch.' },
          {
            evil: 2, label: 'Introduce a 10p swapping fee. For everyone. Forever.', cash: 130, soul: -7, happy: -8, mono: 10,
            fanfare: ['TRANSACTION FEES!', '+£1.60!'],
            result: 'By the end of lunch every swap behind the climbing frame costs 10p. Nobody remembers agreeing to this. That’s how you know it’s working.',
            feed: ['Two Year 3s tried to swap stickers in secret. Biff made them pay the fee twice. Biff doesn’t work for you. He’s just enthusiastic.'],
          },
          {
            evil: 3, label: 'A fee for swapping, a fee for not swapping, and a fee for asking about the fees. Kyle collects.', cash: 240, soul: -10, happy: -9, mono: 12,
            fanfare: ['TOTAL MARKET CAPTURE!', '+£2.40!'],
            result: 'Kyle walks the climbing frame with a biscuit tin, collecting. He prints a new business card. It says KYLE (FEES). A Year 3 pays a fee for looking at the card.',
            feed: ['A Year 3 paid to walk past the climbing frame. He doesn’t remember agreeing to this. Nobody does.', 'The Swapsies Market has closed. There is now just a queue to pay Kyle, which is also, technically, a market.'],
          },
        ],
      },
      {
        id: 'biff',
        scene: { cast: ['biff'] },
        speaker: 'biff',
        text: 'Biff is in Year 6. Biff has been in Year 6 for what feels like several years. He has a moustache and, it is rumoured, a mortgage. Biff has noticed your jumper.',
        line: 'Give us the snails or I’ll put you in the bin.',
        options: [
          { evil: 0, label: 'Give him a snail and walk away.', cash: -15, result: 'Biff takes the snail and pats you on the head, quite hard. You walk away with your dignity, and fewer snails.' },
          {
            evil: 3, label: '“Billy’s got loads of snails, actually. And dinner money.”', cash: 160, soul: -12, happy: -6, flags: { biffImpressed: true },
            fanfare: ['THREAT REDIRECTED!', 'FINDER’S FEE: +£1.60!'],
            result: 'Biff goes to investigate Billy. Billy does not have loads of snails. He does have dinner money. Biff comes back with it, splits it with you without being asked, and looks at you differently. Impressed.',
            feed: ['Billy is in the bin.'],
          },
          {
            evil: 1, label: 'Sell Biff a snail for £1. Call it “protection”.', cash: 70, soul: -3, mono: 5,
            fanfare: ['+70p!', 'PROTECTION RACKET (INVERTED)!'],
            result: 'Biff pays 70p, which is all he’s got, to not have to put you in the bin. He walks off feeling like he won. That’s the trick.',
            feed: ['Biff tells everyone he “bought protection off Tuck”. Nobody knows what that means. Demand rises.'],
          },
        ],
      },
    ],

    2: [
      {
        id: 'dev',
        scene: { cast: ['dev'] },
        speaker: 'dev',
        text: 'Dev needs £5 for the Year 7 trip to Alton Towers. His mum’s on nights. The letter says DEADLINE TODAY in a font that means it.',
        line: 'Can you lend us a fiver? I’ll pay you back. I swear down.',
        options: [
          { evil: 0, label: '“Fiver. Pay me back whenever.”', cash: -500, soul: 4, result: 'Dev hugs you, which is not a thing that happens at St. Jude’s. He goes to Alton Towers. He sends you a postcard. It’s of Oblivion.' },
          {
            evil: 2, label: '“£5 now, £15 Friday. I’m holding your Game Boy.”', cash: 400, soul: -9, happy: -6, mono: 5, flags: { devDebt: true },
            fanfare: ['200% INTEREST!', 'COLLATERAL: GAME BOY COLOR!', 'PAWNED: +£4.00!'],
            result: 'You lend him a fiver you borrowed off Biff at lunch. You pawn the Game Boy to a Year 10 before Dev’s coach has left the car park.',
            feed: ['Dev went on Oblivion twice. He couldn’t afford the photo either time.'],
          },
          {
            evil: 3, label: 'Lend the fiver, keep the Game Boy, and sell his save file to his rival in 8C.', cash: 800, soul: -12, happy: -7, mono: 5, flags: { devDebt: true },
            fanfare: ['200% INTEREST!', 'DIGITAL ASSETS SEIZED!', '+£8.00!'],
            result: 'Dev’s Pokémon team (Sparky, Mum, and a Snorlax called Kevin) now belongs to a boy in 8C called Ross. Ross renames Kevin. You don’t ask what to.',
            feed: ['Dev cried about Kevin in Food Tech. Mrs Okafor gave him a flapjack.', 'Ross renamed Kevin “DEV”. Dev has seen it.'],
          },
        ],
      },
      {
        id: 'shelter',
        scene: { bg: 'bikeshed', cast: ['year7s'], rain: true },
        speaker: 'year7s',
        text: 'It’s raining. It has been raining since September. The only dry spot at St. Jude’s is the overhang outside the science block, and you have just put a skipping rope across it.',
        line: 'Let us in, it’s chucking it down!',
        options: [
          { evil: 0, label: '“It’s raining. Everyone in.”', cash: 0, soul: 3, result: 'Thirty-one Year 7s cram under the overhang. Someone starts a singalong. It’s Steps. You hate that you know the words.' },
          {
            evil: 2, label: '“50p per ten minutes.”', cash: 600, soul: -7, happy: -8, mono: 5,
            fanfare: ['+£6.00!', 'PROPERTY PORTFOLIO: 1 OVERHANG!'],
            result: 'By the end of break the overhang is fully let. Biff handles evictions. Mrs Dobbs from Geography pays 50p too, out of habit.',
            feed: ['Aaliyah’s homework turned to mush in her bag. She got a detention for it. You rented her a dry spot for the detention.'],
          },
          {
            evil: 3, label: 'Dynamic pricing. It’s heavier now, so it’s £1.', cash: 1100, soul: -13, happy: -12, mono: 8,
            fanfare: ['SURGE PRICING!', '+£11.00!'],
            result: 'The rain gets heavier. So do the prices. You have discovered that weather is just demand you haven’t invoiced yet.',
            feed: ['Thirty Year 7s sat through Maths wet. The radiator was on. It still doesn’t work.', 'Two Year 7s shared one coat and one 50p slot. Biff charged them per head.'],
          },
        ],
      },
      {
        id: 'penny',
        scene: { cast: ['penny'] },
        speaker: 'penny',
        text: 'Penny is the cleverest person at St. Jude’s. She has dark rings under her eyes and three younger brothers. She does everybody’s homework anyway, for free, because people ask.',
        line: '…You want people to pay? For my homework? Paid to who?',
        options: [
          { evil: 1, label: '“Fifty-fifty. It’s your brain.”', cash: 300, soul: 4, result: 'Penny looks at you as if you’ve spoken Latin. Then she smiles. It is the first time anybody has seen her smile since the Year 6 SATs. Your half of the first week is £3.' },
          { evil: 0, label: '“Start charging. Without me.”', cash: 0, soul: 6, result: 'Penny starts charging 20p an essay. Within a week she can afford new glasses. You did a nice thing and made no money. It feels very strange.' },
          {
            evil: 2, label: '“You get 10%. In exposure. And a reference, when we’re older.”', cash: 450, soul: -9, happy: -4, mono: 8, flags: { pennyHired: true },
            fanfare: ['NEW HIRE!', 'HOMEWORK FACTORY: ONLINE!', '+£4.50!'],
            result: 'Penny agrees, because nobody has ever asked her what she wants and she’s not sure there is an answer. First order: twenty-six essays on Of Mice and Men. Done by Thursday. Her name isn’t on any of them.',
            feed: ['Penny was up until 2am writing about loneliness for twenty-six people.'],
          },
          {
            evil: 3, label: 'Exposure. And she does your homework too, as a “trial period”. Indefinitely.', cash: 750, soul: -12, happy: -5, mono: 10, flags: { pennyHired: true },
            fanfare: ['UNPAID INTERNSHIP!', 'HOMEWORK FACTORY: ONLINE!', '+£7.50!'],
            result: 'Penny writes your homework, the homework of twenty-six others, and a personal statement for Biff, who is applying to be “a Biff”. The trial period has no end date. You checked.',
            feed: ['Penny’s mum found her asleep in the bath with a pen still in her hand.', 'Biff’s personal statement got him into a college. He doesn’t know which one. Neither does the college.'],
          },
        ],
      },
      {
        id: 'flapjack',
        scene: { cast: ['okafor'] },
        speaker: 'okafor',
        text: 'Mrs Okafor’s Food Tech class has started a bake sale for the minibus fund. Flapjacks, 20p. They are, frankly, the best thing to happen at St. Jude’s since the fire alarm went off during PE. They are also killing your margins.',
        line: 'Flapjack, Tucker? Every penny goes to the minibus!',
        options: [
          { evil: 0, label: 'Lower your prices. Compete.', cash: -200, soul: 2, result: 'You go to 15p a snail. Mrs Okafor goes to two-for-30p. You lose. Everybody else wins. Economists call this “a market”.' },
          {
            evil: 2, label: 'Start a rumour: there’s hamster in the flapjacks.', cash: 700, soul: -9, happy: -6, mono: 10,
            fanfare: ['COMPETITOR ELIMINATED!', '+£7.00!'],
            result: 'By Wednesday the rumour has a name: Nibbles. Nibbles had a family. Nibbles’ family has a Bebo page. The bake sale raises 40p.',
            feed: ['The minibus fund is £1,960 short. The Year 8 trip to the Tate is cancelled. Most of them had never been to London.', 'Kemi in 8B gets called “hamster eater” every day now. She brought in a flapjack once.'],
          },
          {
            evil: 3, label: 'Rumour, then buy her leftovers at 2p and rebrand them “Tuck’s Oaty Bars”.', cash: 1300, soul: -14, happy: -8, mono: 15,
            fanfare: ['HOSTILE TAKEOVER!', 'TUCK’S OATY BARS™!', '+£13.00!'],
            result: 'Mrs Okafor sells you forty flapjacks for 80p because otherwise they go in the bin. You sell them back to the school as Tuck’s Oaty Bars. Same flapjacks. Nobody mentions the hamster.',
            feed: ['Mrs Okafor has handed in her notice. The Food Tech room is now a storage cupboard.'],
          },
        ],
      },
      {
        id: 'devpay',
        if: (S) => S.flags.devDebt,
        scene: { cast: ['dev'] },
        speaker: 'dev',
        text: 'It’s Friday. Dev is back from Alton Towers. He went on Oblivion twice. He has 60p.',
        line: 'Can I have a bit longer? Mum gets paid on the 28th.',
        options: [
          { evil: 0, label: '“Course. The 28th.”', cash: 0, soul: 3, result: 'Dev nods. You let it go. Biff looks at you as if you’ve gone soft. You check your shoes for softness.' },
          {
            evil: 2, label: '“Interest doesn’t sleep, Dev. It’s £20 now. Biff will walk you home.”', cash: 700, soul: -11, happy: -7, mono: 5,
            fanfare: ['DEBT ROLLED OVER!', '+£7.00!'],
            result: 'Dev pays in instalments: his bus pass, his PE kit and, eventually, his little brother’s Pokémon cards. His little brother is six. You give him a receipt, because you’re not an animal.',
            feed: ['Dev walks to school now. It’s 2.4 miles. He’s late most days. He’s on report.', 'Dev’s mum found the receipt. She doesn’t know what a “rollover fee” is. Neither does Dev.'],
          },
          {
            evil: 3, label: 'Collect from his little brother instead. In person. At the primary school gates.', cash: 1100, soul: -14, happy: -8,
            fanfare: ['DEBT TRANSFERRED!', '+£11.00!'],
            result: 'You go back to St. Pete’s at home time. Dev’s brother is six. He gives you his Pokémon cards, his lunchbox and, for reasons nobody can explain, one of his shoes. You give him a receipt, because you’re not an animal.',
            feed: ['Dev’s little brother walked home in one shoe. Gary the pigeon walked with him the whole way.', 'Dev’s mum found the receipt. It was in the shoe that came home.'],
          },
        ],
      },
    ],

    3: [
      {
        id: 'maya',
        scene: { cast: ['maya'] },
        speaker: 'maya',
        text: 'Maya Patel is running for Head Girl on a platform of “free tuck shop for everyone” and “fixing the radiator”. She is polling at 78%. She is, by any measure, a direct threat to the business model.',
        line: 'Vote Maya! Free snacks, warm classrooms, no more loan sharks. No offence, Tuck.',
        options: [
          { evil: 0, label: 'Run against her. Fairly. On the issues.', cash: -2000, soul: 2, result: 'You lose by 611 votes to 4. Biff voted for Maya. Biff liked the bit about the radiator.' },
          {
            evil: 2, label: 'Plant forged cheat sheets in her locker. Tip off Mr Crane.', cash: 5000, soul: -15, happy: -10, mono: 10, flags: { mayaFramed: true },
            fanfare: ['ELECTION WON!', 'REGULATORY CAPTURE!', '+£50 CAMPAIGN DONATIONS!'],
            result: 'Maya is suspended pending investigation. Her replacement is a Year 12 called Josh who once ate a chalk. Josh wins. Josh’s first act is to rename the tuck shop “Tuck’s”.',
            feed: ['Maya’s university offer has been “reviewed”. She’s taking a year out. It’s going to be a long year.', 'Head Boy Josh has proposed removing the radiator altogether, to save on maintenance.'],
          },
          {
            evil: 3, label: 'Cheat sheets, a tip-off, and a forged letter to her university. In her handwriting.', cash: 9000, soul: -15, happy: -12, mono: 12, flags: { mayaFramed: true },
            fanfare: ['ELECTION WON!', 'COMPETITOR DELETED!', '+£90!'],
            result: 'The letter is beautifully forged. The bit about her “lifelong hatred of radiators” is a nice touch. Her offer is withdrawn by return of post. Josh wins. Josh renames the tuck shop “Tuck’s”, then renames himself “Josh’s”.',
            feed: ['Maya works at the Greggs where the Year 12 works now. They don’t talk about it. They do talk about sausage rolls, a lot.', 'Josh has proposed removing the radiator altogether, to save on maintenance.'],
          },
        ],
      },
      {
        id: 'fountain',
        scene: { cast: ['biff'], fountain: true },
        speaker: 'biff',
        text: 'The water fountains are free. “Free” is a word you find increasingly difficult to say out loud.',
        line: 'I’ve got a spanner, boss. Just saying. I’ve got a spanner.',
        options: [
          { evil: 0, label: 'Leave the fountains alone.', cash: 0, soul: 2, result: 'The fountains keep being free. Biff puts the spanner away, disappointed. He’d brought it from home.' },
          {
            evil: 2, label: 'Fountains “mysteriously” break. Volt-Juice: £2.50 a can.', cash: 8000, soul: -10, happy: -12, mono: 10,
            fanfare: ['NEW PRODUCT LAUNCH!', 'VOLT-JUICE™: 400% MORE VOLT!', '+£80!'],
            result: 'Biff does the fountains with the spanner. Volt-Juice sells out by second period. Four Year 10s go home with palpitations. You launch Volt-Juice Zero: same caffeine, calmer can.',
            feed: ['Ellie in Year 11 can’t afford Volt-Juice. She drinks from the toilet taps now.'],
          },
          {
            evil: 3, label: 'Break the fountains. Then charge for the toilet taps too. Biff guards the sinks.', cash: 13000, soul: -14, happy: -14, mono: 12,
            fanfare: ['WATER PRIVATISED!', 'TAP WATER: NOW “VINTAGE”!', '+£130!'],
            result: 'Biff stands guard over the sinks with a clipboard. Tap water is now a premium tier. You call it “vintage”. A Year 7 pays 40p to wash his hands and then, quietly, cries into them.',
            feed: ['A Year 8 fainted in PE. The nurse gave him Volt-Juice. It was all she had.', 'Somebody has started a black market in rain. It’s the focus group. You’re letting it go, for now.'],
          },
        ],
      },
      {
        id: 'pembleton',
        scene: { cast: ['pembleton'] },
        speaker: 'pembleton',
        text: 'Mr Pembleton has taught Biology for 31 years. His car is older than most of his pupils. His salary hasn’t gone up since the Spice Girls. He controls the staffroom photocopier.',
        line: 'I’m not sure I like what you’re suggesting, Tucker.',
        options: [
          { evil: 0, label: '“Never mind, sir.”', cash: 0, soul: 1, result: 'Mr Pembleton nods, relieved. He goes back to marking. He marks in green pen because red “upsets them”.' },
          {
            evil: 2, label: '£40 a week to run off “revision guides” after hours. Cash.', cash: 6000, soul: -10, happy: -6, mono: 10,
            fanfare: ['TEACHER SUBCONTRACTED!', 'BOOTLEG GUIDES: +£60!'],
            result: 'Mr Pembleton takes the envelope with the face of a man watching his own funeral from a nice seat. The guides sell for £15. They are photocopied from a textbook the school already owns.',
            feed: ['Mr Pembleton has stopped coming into the staffroom. He eats in his car. It is very cold in his car.'],
          },
          {
            evil: 3, label: '£40 a week. And a photo of him taking the envelope. Insurance.', cash: 10000, soul: -14, happy: -6, mono: 10,
            fanfare: ['TEACHER ACQUIRED!', 'LEVERAGE SECURED!', '+£100!'],
            result: 'He takes the envelope. Click. He looks up at the camera. He knows. You know. He photocopies until four in the morning and the photocopier, for the first time, says nothing at all.',
            feed: ['Mr Pembleton flinches at camera flashes now. School photo day was very difficult.', 'His car has a blanket in it, and a little kettle that plugs into the lighter.'],
          },
        ],
      },
      {
        id: 'exams',
        scene: { cast: ['sixthformer'] },
        speaker: 'sixthformer',
        text: 'Somebody in the exams office has a key and a gambling problem. You have a Year 13 who can work a scanner, and a customer base of 340 terrified sixteen-year-olds.',
        line: 'Is it true? Have you got the Chemistry paper? I’ll pay anything. My dad will literally kill me.',
        options: [
          { evil: 0, label: '“Too far. I haven’t got it.”', cash: 0, soul: 2, result: 'She looks almost relieved. She goes to the library. It is the first time she has been in the library.' },
          {
            evil: 2, label: 'Leak the Chemistry paper. £50 a copy.', cash: 15000, soul: -15, happy: -15, mono: 15,
            fanfare: ['EXAM RING ACTIVE!', '+£150!', 'MARKET MONOPOLY ↑'],
            result: '340 pupils get an A* in Chemistry. The exam board calls it “statistically poetic”. Penny, who didn’t buy the paper, gets a B. She had been up until 3am every night for six weeks.',
            feed: ['The Chemistry results have been annulled for the whole school. Everyone resits in November, except the ones who have given up.', 'Penny got a B. She’s been crying in the library. She’s not sure who to be angry at. You are sure. You’ve decided not to mention it.'],
          },
          {
            evil: 3, label: 'Leak the real paper to half the year and a fake one to the other half. Charge both.', cash: 22000, soul: -16, happy: -16, mono: 15,
            fanfare: ['EXAM RING ACTIVE!', 'A/B TESTING!', '+£220!'],
            result: 'Half the year revise the wrong paper with total confidence. Half get A*s. Afterwards you sell both halves a support group, run by Biff, in the bikeshed, for £5 a session. Biff mostly just holds people.',
            feed: ['170 pupils answered questions about the Tudors in a Chemistry exam. The examiner gave one of them a mark for passion.', 'Penny got a B. She bought the real paper from nobody. She’s been crying in the library.'],
          },
        ],
      },
      {
        id: 'pennyburn',
        scene: { bg: 'office', cast: ['penny'] },
        speaker: 'penny',
        text: 'Penny comes to see you in your office. You have an office now. It used to be the Year 12 common room. There is a beanbag with your initials on it.',
        line: 'I need a week off. My own exams are in a month. I haven’t done any of my own work since Year 8.',
        options: [
          { evil: 0, label: '“Take the week. Paid.”', cash: -5000, soul: 8, result: 'Penny takes the week. She sleeps for most of it. When she comes back she looks like a person again. You lose £50 and feel weirdly fine about it.' },
          {
            evil: 2, label: 'Point at the clause. There’s always a clause.', cash: 3000, soul: -12, happy: -5, flags: { pennyBroken: true },
            fanfare: ['RETENTION SECURED!', '+£30 PRODUCTIVITY!'],
            result: 'Penny reads the clause. She drew it up herself, in Year 8, for you, for free. She goes back to work. She has stopped saying things.',
            feed: ['Penny handed in her own coursework late. It was on Of Mice and Men. It was about loneliness.'],
          },
          {
            evil: 3, label: 'Point at the clause. Then add a new clause. She’s too tired to read it.', cash: 6000, soul: -15, happy: -6, flags: { pennyBroken: true },
            fanfare: ['CONTRACT EXTENDED!', 'WEEKENDS ACQUIRED!', '+£60!'],
            result: 'The new clause says she works weekends. She signs it lying face down on the beanbag with your initials on it. She doesn’t get up for a while. You let her keep the beanbag. That’s generous, in a way.',
            feed: ['Penny has started signing everything. Detention slips. Birthday cards. Her own name, over and over, in her maths book.'],
          },
        ],
      },
    ],

    4: [
      {
        id: 'ahmed',
        scene: { cast: ['ahmed'] },
        speaker: 'ahmed',
        text: 'Mrs Ahmed is in the Headteacher’s office, still in her Asda uniform. She is holding your ledger. She holds it carefully, like it might go off.',
        line: 'You took my youngest’s Pokémon cards. He’s six.',
        options: [
          { type: 'futile', label: 'Offer her £200 to forget about it.', cash: -20000, result: 'She looks at the money. She looks at you. She puts the ledger in her handbag and asks for a receipt. You give her one, because you’re not an animal. It doesn’t help.', feed: ['EXHIBIT A: A ledger. 1,412 entries. Joined-up handwriting.'] },
          { type: 'futile', label: 'Deny everything.', cash: 0, result: '“That’s your handwriting,” she says. It is. You did joined-up for the first time in that ledger. You were proud of it.', feed: ['EXHIBIT A: A ledger. 1,412 entries. Joined-up handwriting.'] },
        ],
      },
      {
        id: 'biffsnitch',
        scene: { cast: ['biff', 'lanyard'] },
        speaker: 'biff',
        text: 'The audit begins. Governors. A man from the council. A lady with a lanyard who says “safeguarding” like a spell. Biff is called in first.',
        line: 'Sorry, boss.',
        options: [
          { type: 'futile', label: 'Double Biff’s wages. Triple them.', cash: -30000, result: 'Biff takes the money, then signs a twelve-page statement. He spells “extortion” correctly. Somebody helped him. He was given a solicitor. It was Maya’s mum.', feed: ['EXHIBIT B: Witness statement, R. “Biff” Bifford. Twelve pages. One drawing.'] },
          { type: 'futile', label: '“Remember who made you, Biff.”', cash: 0, result: '“You did,” says Biff. “That’s sort of the problem.”', feed: ['EXHIBIT B: Witness statement, R. “Biff” Bifford. Twelve pages. One drawing.'] },
        ],
      },
      {
        id: 'teachers',
        scene: { cast: ['pembleton', 'crane'] },
        speaker: 'crane',
        text: 'Mr Pembleton confesses next. Then Mr Crane, who weeps, which nobody expected. They confess to everything, plus several things you didn’t do.',
        line: 'He made me sign it. He had a pen. A really nice pen.',
        options: [
          { type: 'futile', label: 'Destroy the evidence. The DT shredder.', cash: 0, result: 'The DT shredder has been broken since 1997. You feed the ledger into it anyway. It makes the noise of a dying goose and hands the ledger back.', feed: ['EXHIBIT C: One (1) envelope, signed. One (1) really nice pen.'] },
          { type: 'futile', label: 'Hire a solicitor.', cash: -40000, result: 'The solicitor takes £400, reads the file, and asks whether your parents are coming. They aren’t. He leaves at quarter past.', feed: ['EXHIBIT C: One (1) envelope, signed. One (1) really nice pen.'] },
        ],
      },
      {
        id: 'pennyleaves',
        scene: { bg: 'corridor', cast: ['penny'] },
        speaker: 'penny',
        text: 'Penny is waiting outside the office with her coat on. She has a bag. She has a place at a sixth form college two towns over. She isn’t asking.',
        line: '…',
        options: [
          { type: 'futile', label: '“Partnership. Fifty-fifty. Finally.”', cash: 0, result: '“You could always have done that,” Penny says. Then she goes. She doesn’t look back. You check. Twice.', feed: ['Penny has left St. Jude’s. She took nothing with her. She was owed quite a lot.'] },
          { type: 'futile', label: '“Penny. I’m sorry.”', cash: 0, result: '“I know,” she says. That’s all. Somehow it’s worse.', feed: ['Penny has left St. Jude’s. She took nothing with her. She was owed quite a lot.'] },
        ],
      },
      {
        id: 'assembly',
        scene: { bg: 'assembly', cast: ['head'] },
        speaker: 'head',
        text: 'The whole school is in the hall. They have asked you to address it. The Headteacher calls it “restorative”. It isn’t clear who is being restored.',
        line: 'Whenever you’re ready, Tucker.',
        options: [
          { type: 'confess', label: 'Apologise. Give it all back.' },
          { type: 'accept', label: 'Say nothing. Accept expulsion.' },
        ],
      },
    ],
  };

  /* ------------------------------------------------------------------ */
  /* Milestones — end each act                                          */
  /* ------------------------------------------------------------------ */
  const milestones = {
    1: {
      id: 'coat',
      scene: { bg: 'shed', cast: ['leaver'] },
      speaker: 'leaver',
      text: 'Behind the sports shed, a Year 6 leaver is selling a Mega-Coated Trench Coat. It is enormous. It has eleven inside pockets. It smells of Lynx Africa and ambition.',
      line: 'Six quid. And I’ll throw in Biff. He follows the coat.',
      options: [
        { type: 'milestone', label: 'Buy the coat. Take Biff. (£6)', cost: 600, fanfare: ['MEGA-COATED TRENCH COAT!', 'SECURITY HIRED: BIFF!'], result: 'You put on the coat. It drags on the ground. Biff falls in behind you like a weather system. Primary school is over. You are ready for the big leagues.' },
        { type: 'later', label: '“Not yet.”' },
      ],
    },
    2: {
      id: 'monitors',
      scene: { bg: 'bikeshed', cast: ['gavin'] },
      speaker: 'gavin',
      text: 'The Senior Hall Monitors control the bikeshed: the only covered, unsupervised, teacher-blind square metre at St. Jude’s. Head Monitor Gavin wears his sash like a war medal.',
      line: 'Fifty quid, Tucker, and the bikeshed is yours. I didn’t see anything. I never see anything. That’s the job.',
      options: [
        { type: 'milestone', label: 'Pay Gavin. Take the bikeshed. (£50)', cost: 5000, fanfare: ['HALL MONITORS BRIBED!', 'EXCLUSIVE TRADING HUB SECURED!'], result: 'Gavin pockets the money and adjusts his sash. From now on, nothing happens at the bikeshed, officially. Unofficially, everything does.' },
        { type: 'later', label: '“Not yet.”' },
      ],
    },
    3: {
      id: 'contract',
      scene: { bg: 'office', cast: ['crane'] },
      speaker: 'crane',
      text: 'The Vice-Principal, Mr Crane, has a proposal. Five years. Exclusive commercial rights to every vending machine, fountain, photocopier and tuck shop on campus. He would like £500. He has brought an envelope.',
      line: 'Just sign here, Tucker. And here. And initial there. Lovely pen, isn’t it?',
      options: [
        { type: 'milestone', label: 'Sign the five-year exclusive contract. (£500)', cost: 50000, fanfare: ['5-YEAR EXCLUSIVE CONTRACT!', 'MARKET MONOPOLY: 100%!', 'TUCK ENTERPRISES™ WINS!'], result: 'You sign. Mr Crane shakes your hand. Somewhere a jingle plays. Confetti that you paid for falls from a ceiling that you own. You have won capitalism. You are sixteen.' },
        { type: 'later', label: '“Not yet.”' },
      ],
    },
  };

  /* ------------------------------------------------------------------ */
  /* Fillers — repeatable quick deals once the story for an act is done */
  /* (also used to find the money when you can't pay at home time)    */
  /* ------------------------------------------------------------------ */
  const fillers = {
    1: [
      {
        id: 'f-gary', scene: { cast: ['gary', 'year2'] }, speaker: 'year2',
        text: 'A pigeon has a whole sausage roll and is guarding it from three Year 2s, who are trying to reason with him. The Year 2s call him Gary. Gary does not accept the name, but he doesn’t reject it either.',
        line: 'Gary won’t share. We asked nicely. We asked in French.',
        options: [
          { evil: 1, label: 'Buy the sausage roll off Gary for a crisp. Sell it whole for 30p.', cash: 30, soul: -1, result: 'Gary accepts the crisp, which is all the paperwork a pigeon needs. The Year 2s club together and buy the sausage roll whole. One of them pays in Lego.' },
          { evil: 0, label: 'Shoo Gary off and let them share it.', cash: 0, result: 'Gary leaves, eventually, with enormous dignity. The Year 2s split the sausage roll into exactly fair pieces using a ruler. Gary watches from the fence. He will remember this.' },
          { evil: 2, label: 'Buy it off Gary for a crisp. Sell it to the Year 2s by the flake.', cash: 80, soul: -5, happy: -3, fanfare: ['PIGEON ARBITRAGE!', '+80p!'], result: 'Gary accepts the crisp, which is all the paperwork a pigeon needs. You sell the sausage roll back flake by flake. The last flake goes for 9p. The Year 2s clap anyway.', feed: ['Gary has learned what a crisp is worth. He looks at you differently now. Like a colleague.', 'One Year 2 had their pastry flakes on credit. They are seven. They have a credit rating.'] },
        ],
      },
      {
        id: 'f-pudding', scene: { cast: ['maureen'] }, speaker: 'maureen',
        text: 'Dinner Lady Maureen is holding the last jam roly-poly over her head like a newborn lion. The custard is steaming in a way that feels deliberate.',
        line: 'The pudding chooses its owner, Tucker. The pudding has chosen Little Billy. I don’t make the rules. The custard makes the rules.',
        options: [
          { evil: 1, label: 'Buy it off Maureen for 10p. Sell it to Billy for 30p.', cash: 20, soul: -1, result: 'Billy pays 30p for the pudding the custard chose for him. Maureen watches the whole thing with the expression of a woman whose custard has been ignored.' },
          { evil: 0, label: '“Then Billy should have it.”', cash: 0, result: 'Maureen nods, slowly, as though you’ve passed a test you didn’t know you were sitting. Billy gets the pudding. He eats it with both hands, like a raccoon.' },
          { evil: 2, label: '“Actually, the pudding spoke to me.” Then sell it in slices.', cash: 90, soul: -6, happy: -4, fanfare: ['DIVINE RIGHT OF PUDDING!', '+90p!'], result: 'Maureen hands it over, shaken. You cut it into eleven slices and sell them along the dinner queue. Billy buys a slice of his own destiny for 8p.', feed: ['Maureen has stopped consulting the pudding. Something between them is broken.', 'Billy has started bringing his own pudding. It is a sardine paste sandwich he has labelled PUDDING.'] },
        ],
      },
      {
        id: 'f-harriets', scene: { cast: ['harrietA', 'harrietB'] }, speaker: 'harrietA',
        text: 'Harriet and Harriet are twins, but not to each other. Nobody has asked how that works. They want one Gummy Snail and cannot agree which Harriet is paying.',
        line: 'We share everything. Except a birthday. And a mum.',
        options: [
          { evil: 1, label: 'Snip the snail in half. 10p a half.', cash: 20, result: 'Two Harriets, two halves, one snail. They eat in perfect unison. It is quite unsettling.' },
          { evil: 2, label: 'Full price each. They’re two people. Technically.', cash: 60, soul: -4, happy: -3, fanfare: ['DOUBLE BILLING!', '+60p!'], result: 'Each Harriet pays full price for half a snail. They look at each other for a long time. A small, important friendship quietly closes for business.', feed: ['Harriet and Harriet aren’t holding hands today. They are standing exactly one snail apart.'] },
        ],
      },
      {
        id: 'f-ribena', scene: { cast: ['callum'] }, speaker: 'callum',
        text: 'Callum in Year 4 has drunk so much Ribena that the school nurse says he is “technically a cordial”. His mum has banned it. He has found out that you have a bottle.',
        line: 'I can feel my blood going normal, Tuck. Please. I don’t like it.',
        options: [
          { evil: 1, label: 'One small cup. Diluted. 20p.', cash: 20, soul: -1, result: 'Callum drinks it in one go and says “oh, that’s nice” in a voice like a man stepping into a bath.' },
          { evil: 0, label: 'Give him a glass of water. Tell him he’s fine.', cash: 0, result: 'Callum drinks the water like it’s a betrayal. He goes very slightly less purple. He says the world tastes “loud”.' },
          { evil: 2, label: 'Undiluted. 30p a swig.', cash: 120, soul: -6, happy: -4, fanfare: ['+£1.20!', 'CONCENTRATED GROWTH!'], result: 'Callum has four swigs and briefly sees the face of God. He says God is also mostly Ribena.', feed: ['Callum went purple in Numeracy. Not a bit purple. Properly, permanently purple.', 'The nurse has started a page in her notebook just called CALLUM. It is now three pages.'] },
        ],
      },
      {
        id: 'f-keys', scene: { cast: ['dobson'] }, speaker: 'dobson',
        text: 'Mr Dobson the caretaker has dropped his keys down the drain and is staring at them. He has been mopping the same dry corridor since 1987. Without the keys, he cannot get to the corridor.',
        line: '…',
        options: [
          { evil: 1, label: 'Fish them out. Wait meaningfully for a tip.', cash: 20, soul: -1, result: 'Mr Dobson gives you 20p and a single nod. The nod is worth more. The 20p is worth 20p.' },
          { evil: 0, label: 'Fish them out with a ruler and some chewing gum.', cash: 0, result: 'You hand back the keys. Mr Dobson looks at you, then at the keys, then mops your shoes, slowly and with great tenderness. It is the nicest thing anyone has ever done to your shoes.' },
          { evil: 2, label: 'Fish them out. Rent him his keys by the hour.', cash: 100, soul: -6, happy: -3, fanfare: ['+£1!', 'KEY WORKER!'], result: 'Mr Dobson pays 10p an hour for his own keys. He says nothing. He mops the drain where they fell, for a very long time.', feed: ['Mr Dobson mopped the same tile all lunchtime. It was a mop of grief.'] },
        ],
      },
      {
        id: 'f-tooth', scene: { cast: ['year2'] }, speaker: 'year2',
        text: 'A Year 2 wants a Gummy Snail. They have 20p and a wobbly tooth.',
        line: 'The tooth fairy gives you a pound, you know.',
        options: [
          { evil: 1, label: '“20p, then.”', cash: 20, result: 'A fair deal. The Year 2 runs off delighted.' },
          { evil: 2, label: '“20p and the tooth. I’ll handle the fairy.”', cash: 120, soul: -5, happy: -3, fanfare: ['+20p!', 'TOOTH ACQUIRED!', 'FAIRY INVOICED: +£1!'], result: 'You wiggle the tooth out yourself. It takes some doing. The fairy, it turns out, will pay anyone.', feed: ['A Year 2 told the class the tooth fairy isn’t real, actually, it’s Tuck.'] },
        ],
      },
      {
        id: 'f-jumper', scene: { cast: ['kyle'] }, speaker: 'kyle',
        text: 'There’s a lost-property jumper on the radiator. The name tag says MOHAMMED R. Mohammed R. is looking for it.',
        line: 'Have you seen a jumper? It’s got my name in it. My mum’ll go mad.',
        options: [
          { evil: 1, label: 'Give it back. Accept the 20p his mum sent “for your trouble”.', cash: 20, soul: -1, result: 'Mohammed R. hands over 20p from an envelope labelled FOR THE JUMPER BOY. His mum is very organised.' },
          { evil: 0, label: 'Give it back.', cash: 0, soul: 2, result: 'Mohammed R. gets his jumper back. His mum doesn’t go mad. Nobody pays you anything.' },
          { evil: 2, label: '“Finder’s fee. 75p.”', cash: 75, soul: -4, happy: -3, fanfare: ['+75p!', 'ASSET RECOVERED!'], result: 'Mohammed R. pays 75p for his own jumper. He thanks you, which is the worst part.', feed: ['Mohammed R.’s mum went a bit mad anyway, about the 75p.'] },
        ],
      },
      {
        id: 'f-wetplay', scene: { cast: ['priya'], rain: true }, speaker: 'priya',
        text: 'Wet play. Thirty kids stuck inside with one box of felt tips. Most of the felt tips are dead. You have the good ones.',
        line: 'Can I borrow the purple? I need it for a horse.',
        options: [
          { evil: 1, label: 'Lend the good felt tips. 1p a horse.', cash: 30, soul: -1, result: 'Thirty horses, thirty pence. Every horse is a different colour. One is tartan. That one cost 2p.' },
          { evil: 0, label: 'Share the felt tips.', cash: 0, soul: 2, result: 'Everybody draws horses. The horses are purple. It is a nice afternoon. You make no money.' },
          { evil: 2, label: 'Rent them out. 5p per colour per drawing.', cash: 90, soul: -4, happy: -4, fanfare: ['+90p!', 'COLOUR RENTAL!'], result: 'By home time the class has produced thirty grey horses and one purple one. The purple one belongs to the richest kid.', feed: ['The wet play display board is now mostly grey horses.'] },
        ],
      },
    ],
    2: [
      {
        id: 'f-council', scene: { cast: ['council'] }, speaker: 'council',
        text: 'A Man from the Council needs a witness to confirm the corridor is the length he says it is. He says it is four miles long. It is the corridor outside Maths.',
        line: 'Just a signature, young man. For the corridor. The corridor needs this.',
        options: [
          { evil: 0, label: '“It’s about twenty metres, mate.”', cash: 0, result: 'He measures it again, in front of you, very slowly. It is twenty metres. He looks betrayed. He writes “HOSTILE” on his clipboard and draws a little sad face.' },
          { evil: 2, label: 'Sign whatever he wants. £5 a signature.', cash: 500, soul: -5, happy: -4, fanfare: ['+£5!', 'CIVIC ENGAGEMENT!'], result: 'You sign that the corridor is four miles long, that the canteen is in Belgium, and that you personally are a listed building.', feed: ['The corridor outside Maths has been reclassified as a B-road. There is now a speed limit and a lollipop lady.', 'Year 7s have to take a packed lunch to get to Geography.'] },
        ],
      },
      {
        id: 'f-grieve', scene: { cast: ['grieve'] }, speaker: 'grieve',
        text: 'Mr Grieve, Chemistry, has set his eyebrows on fire again and is continuing the lesson. You are the only person holding a bottle of water.',
        line: 'Bit of water, Tucker? Whenever you like. No rush. It’s just my face.',
        options: [
          { evil: 0, label: 'Throw the water at him.', cash: 0, result: 'You put out Mr Grieve. He thanks you, steaming gently, and gives you a detention for throwing things in a lab.' },
          { evil: 2, label: '“Water’s two quid, sir. Seller’s market.”', cash: 200, soul: -6, happy: -3, fanfare: ['+£2!', 'EMERGENCY PRICING!'], result: 'Mr Grieve pays in coins, one at a time, while still on fire. It is the longest transaction of your life. Neither of you blinks.', feed: ['Mr Grieve now teaches in a balaclava. He says it’s “for the eyebrows”. He hasn’t got eyebrows.'] },
        ],
      },
      {
        id: 'f-shrine', scene: { bg: 'bikeshed', cast: ['year7s'] }, speaker: 'year7s',
        text: 'Somebody has built a shrine to Nibbles the hamster behind the science block: candles, a little wheel, and a photo of a hamster that is clearly a guinea pig. Nobody knew Nibbles. Everybody misses him.',
        line: 'Can we pray to him? Is that allowed? Is he a god now?',
        options: [
          { evil: 0, label: 'Leave them to it.', cash: 0, result: 'They hold a little service. Somebody reads a poem that rhymes “Nibbles” with “Nibbles”. It is genuinely moving.' },
          { evil: 2, label: '20p to pray. 50p for a wish. £1 to touch the wheel.', cash: 600, soul: -6, happy: -4, mono: 5, fanfare: ['ORGANISED RELIGION!', '+£6!'], result: 'By lunch the shrine has a queue, a gift shop and a man from Year 10 who claims to have been healed. You did not see the healing. You did charge for it.', feed: ['Somebody wished for Nibbles to come back. The next morning there was a guinea pig in the shrine. Nobody can explain the guinea pig.', 'The guinea pig has its own following now. It does not want one.'] },
        ],
      },
      {
        id: 'f-rope', scene: { cast: ['year7s'] }, speaker: 'year7s',
        text: 'Legend says a Year 9 climbed the PE rope in 1998 and never came down. Today a bucket comes down. Inside: a pound coin and a note that says CRISPS PLS.',
        line: 'You can’t not, Tuck. He’s been up there since the Spice Girls.',
        options: [
          { evil: 0, label: 'Send up a whole multipack.', cash: -100, result: 'The bucket goes up. After a long time, a little paper aeroplane comes down. It just says THANK YOU in very old handwriting.' },
          { evil: 2, label: 'Send up one crisp. Keep the pound.', cash: 100, soul: -5, happy: -3, fanfare: ['+£1!', 'VERTICAL MARKET!'], result: 'One crisp goes up. A long silence comes down.', feed: ['The bucket came down again. The note just said WHY.'] },
        ],
      },
      {
        id: 'f-drain', scene: { cast: ['year7s'] }, speaker: 'year7s',
        text: 'A Year 7 has dropped his dinner money down a drain. He is staring at the drain as if it might apologise.',
        line: 'That was my dinner. That was my whole dinner.',
        options: [
          { evil: 0, label: 'Give him £2.', cash: -200, soul: 4, result: 'He eats. He tells everyone. Nobody believes him.' },
          { evil: 2, label: 'Lend him £2. £4 back Monday.', cash: 500, soul: -5, happy: -3, fanfare: ['+£2 INTEREST!', 'NEW CUSTOMER!', 'LOAN SOLD ON: +£3!'], result: 'He signs a napkin. You sell the napkin to Biff for £3 before he’s finished his chips.', feed: ['The drain boy now owes £11. It was £2 on Tuesday.'] },
        ],
      },
      {
        id: 'f-bus', scene: { cast: ['dev'] }, speaker: 'dev',
        text: 'There is a school trip on Friday. Everybody wants the back seat of the coach. The back seat is sacred. The back seat is, as of this moment, yours.',
        line: 'Bagsy back seat!',
        options: [
          { evil: 0, label: '“First come, first served.”', cash: 0, soul: 2, result: 'The back seat goes to whoever runs fastest. As God intended.' },
          { evil: 2, label: 'Auction the back seat.', cash: 650, soul: -4, happy: -5, fanfare: ['AUCTION CLOSED!', '+£6.50!'], result: 'The back seat goes for £6.50 to a Year 8 whose dad sells conservatories. He sits there alone. It is the best day of his life.', feed: ['The coach smelled of Monster Munch and resentment.'] },
        ],
      },
      {
        id: 'f-topup', scene: { cast: ['penny'] }, speaker: 'penny',
        text: 'Mobile phones have arrived at St. Jude’s. Everyone has a Nokia. Nobody has credit.',
        line: 'You’re not going to sell people fake top-up cards, are you?',
        options: [
          { evil: 0, label: '“Course not.”', cash: 0, soul: 2, result: 'You don’t. Penny seems relieved. Her relief costs you about seven quid.' },
          { evil: 2, label: 'Sell “top-up codes” that are just your nan’s Lotto numbers.', cash: 700, soul: -6, happy: -5, fanfare: ['DIGITAL PRODUCTS!', '+£7.00!'], result: 'You sell fourteen codes. None work. One of them wins a tenner on the Lotto. You keep that too.', feed: ['Fourteen kids spent break typing your nan’s Lotto numbers into Nokias.'] },
        ],
      },
    ],
    3: [
      {
        id: 'f-vince', scene: { cast: ['vince'] }, speaker: 'vince',
        text: 'Voltage Vince, the Volt-Juice™ mascot, has fallen over in the quad. He is a man in a can costume. Nobody has ever seen him take it off. Payroll lists him as “ongoing”. He is fine, he says, from inside the can.',
        line: 'Bit of help, Mr Tuck? Can’t reach the ground with me arms. Never could.',
        options: [
          { evil: 0, label: 'Stand him up. Ask if he wants to come out.', cash: 0, result: 'You stand him up. There is a long pause. “Out of what?” says Vince. He does a little dance. It is the saddest dance you have ever seen.' },
          { evil: 2, label: 'Leave him down. £1 a selfie with the fallen can.', cash: 6000, soul: -6, happy: -5, fanfare: ['VIRAL CONTENT!', '+£60!'], result: 'Sixty Year 7s pose with Vince. He gives a thumbs-up in every photo, from the floor. The photos are glossy and everyone in them is smiling, especially Vince, who can’t stop.', feed: ['Vince has been standing in the quad since Tuesday. He says he’s fine. The can says he’s fine.', 'Someone left Vince a sandwich. He couldn’t reach it. Nobody could reach it for him. It’s still there.'] },
        ],
      },
      {
        id: 'f-focus', scene: { cast: ['focus'] }, speaker: 'focus',
        text: 'Your Year 7 focus group has unionised. They have a banner and a chant. The chant is just “WAGON WHEELS”, but with real anger.',
        line: 'Two Wagon Wheels a day each or we stop tasting things. We have tasted Blue. We won’t taste Blue again.',
        options: [
          { evil: 0, label: 'Give them the Wagon Wheels.', cash: 0, result: 'The focus group returns to work. They describe the new flavour as “purple, but sad”. It is the first honest review Tuck Enterprises™ has ever had.' },
          { evil: 2, label: 'Replace them with Year 6s from your old primary. Cheaper.', cash: 7000, soul: -7, happy: -6, mono: 5, fanfare: ['SUPPLY CHAIN OPTIMISED!', '+£70!'], result: 'A coach arrives from St. Pete’s every Thursday. The Year 6s call it the Taste Bus. They taste anything. One of them tasted a fire door.', feed: ['One of the Year 6s on the Taste Bus was Billy’s little brother. He said Blue was nice.', 'The original focus group now meets in the car park, tasting rain in protest.'] },
        ],
      },
      {
        id: 'f-radiator', scene: { cast: ['josh'] }, speaker: 'josh',
        text: 'Head Boy Josh wants to fix the radiator, like Maya promised. He has a spanner, a dream, and chalk all round his mouth.',
        line: 'I’ve been reading up. Radiators are just warm windows. How hard can it be?',
        options: [
          { evil: 0, label: '“Go on then, Josh.”', cash: 0, result: 'Josh hits the radiator with the spanner. It comes on for the first time since 1996. Somewhere a plaque that just says DARREN gets very slightly warmer.' },
          { evil: 2, label: 'Sell him a “radiator repair licence”. £70. Non-transferable.', cash: 7000, soul: -6, happy: -5, fanfare: ['REGULATORY FRAMEWORK!', '+£70!'], result: 'Josh buys the licence and laminates it. The licence is a Post-it note that says LICENCE. He laminates that too.', feed: ['Josh fixed the radiator, then got fined £70 for not displaying his licence. You run the fines.', 'Josh has eaten the licence.'] },
        ],
      },
      {
        id: 'f-coursework', scene: { cast: ['sixthformer'] }, speaker: 'sixthformer',
        text: 'A Year 12 needs an extension on her coursework. Her teacher says no. You say “maybe”, which is worse.',
        line: 'It’s due tomorrow. I haven’t started. I’ve been working at Greggs.',
        options: [
          { evil: 0, label: '“Ask him again. Tell him about Greggs.”', cash: 0, soul: 2, result: 'She asks. He says yes. Teachers are people, occasionally.' },
          { evil: 2, label: 'Sell her one of Penny’s. £80.', cash: 8000, soul: -6, happy: -5, fanfare: ['+£80!', 'IP MONETISED!'], result: 'She gets a distinction. The examiner writes “a strikingly mature voice”. It is Penny’s voice. Penny is very tired.', feed: ['The coursework moderator has flagged four identical essays about loneliness.'] },
        ],
      },
      {
        id: 'f-sports', scene: { cast: ['crane'] }, speaker: 'crane',
        text: 'Sports Day is coming. Mr Crane wonders aloud whether it might benefit from “a commercial partner”.',
        line: 'The egg-and-spoon race has no sponsor, Tucker. It keeps me up at night.',
        options: [
          { evil: 0, label: '“Let them have one thing, sir.”', cash: 0, soul: 2, result: 'Sports Day happens, unsponsored. A Year 7 wins the egg-and-spoon race and cries with happiness. You find it confusing.' },
          { evil: 2, label: 'The Volt-Juice™ Egg-and-Spoon Invitational.', cash: 7000, soul: -5, happy: -6, fanfare: ['NAMING RIGHTS SOLD!', '+£70!'], result: 'The eggs are replaced with Volt-Juice cans. Three runners finish the race and keep running. One is found in Kettering.', feed: ['Sports Day now has an official energy drink, an official crisp, and an official ambulance.'] },
        ],
      },
      {
        id: 'f-library', scene: { cast: ['pembleton'] }, speaker: 'pembleton',
        text: 'The library is closing for budget reasons. The librarian is boxing up the books herself. She is crying onto the Brontës.',
        line: 'They’re selling the building. To whom, Tucker? To whom?',
        options: [
          { evil: 0, label: 'Help her box up the books.', cash: 0, soul: 3, result: 'You carry boxes for an hour. She calls you a good lad. It is the first time anyone has said that. You don’t know what to do with your face.' },
          { evil: 2, label: 'Buy it. Rent it back as a “Study Lounge”. £3 an hour.', cash: 10000, soul: -7, happy: -7, mono: 5, fanfare: ['REAL ESTATE ACQUIRED!', '+£100!'], result: 'The Study Lounge opens Monday. It is the library, minus the books, plus a Volt-Juice machine. The librarian works there now, on a zero-hours contract.', feed: ['The books went in a skip. A Year 9 rescued Jane Eyre. He is reading it at the bus stop.'] },
        ],
      },
    ],
  };

  /* ------------------------------------------------------------------ */
  /* Stagnation Freeze — mundane things to do while time doesn't pass   */
  /* ------------------------------------------------------------------ */
  const idles = [
    {
      id: 'rain', label: 'Count raindrops',
      lines: [
        'You count {n} raindrops. The rain does not run out.',
        '{n} raindrops. One of them looked like Mr Dobson. You don’t mention it.',
        '{n} raindrops. You lose count and start again. You lose count deliberately, for something to do.',
      ],
    },
    {
      id: 'clock', label: 'Look at the clock',
      lines: [
        'It is {time}. It was {time} a moment ago.',
        'Still {time}. The second hand twitches, as if it wants to say something, then thinks better of it.',
        'It is {time}. It has been {time} for quite a while now.',
      ],
    },
    {
      id: 'shoe', label: 'Retie your shoe',
      lines: [
        'You retie your shoe. Then the other shoe. They’re still different.',
        'You double-knot it. It feels like progress. It isn’t.',
        'Your laces are the neatest they have ever been. Nobody will ever know.',
      ],
    },
    {
      id: 'poster', label: 'Read the poster again',
      lines: [
        '“NOW WASH YOUR HANDS.” You read it again. Same instructions.',
        '“BE KIND. IT COSTS NOTHING.” Someone has drawn a moustache on the word KIND. It suits it.',
        '“EVERY CHILD MATTERS.” The poster is laminated. It has been laminated for a long time.',
      ],
    },
    {
      id: 'gary', label: 'Look for Gary',
      lines: [
        'Gary isn’t here. You can feel the absence of Gary like a draught.',
        'A pigeon lands nearby. It isn’t Gary. It knows it isn’t Gary. It leaves, ashamed.',
        'You whisper “Gary?” Nothing. Then, very far away, a single coo. Possibly Gary. Possibly a pipe.',
      ],
    },
    {
      id: 'think', label: 'Think about the nature of value',
      lines: [
        'What is a snail worth? Whatever someone will pay. What is a person worth? You stop thinking.',
        'You think about value for a while. Value doesn’t think about you back.',
        'You try to think of the price of a cloud. You get as far as “quite a lot” and stop.',
      ],
    },
  ];

  /* Things the freeze says once you've been sitting in it a while. */
  const freezeEscalation = [
    { at: 4, text: 'Mr Dobson mops past, very slowly, in the opposite direction to time. He nods. He is gone.' },
    { at: 7, text: 'They’re still there, by the way. Mid-sentence. Neither of you is going anywhere.' },
    { at: 11, text: 'A pigeon hangs in the air above the playground, mid-flap. It looks embarrassed for you.' },
    { at: 16, text: 'A Man from the Council appears, measures the silence with a tape measure, writes down “too long” and leaves.' },
    { at: 22, text: 'Gary the pigeon lands on your shoe and goes to sleep. You can’t move now. That’s just the rules.' },
    { at: 30, text: 'A dinner lady somewhere has dropped a tray. It is still falling. It might never land.' },
    { at: 40, text: 'You are beginning to suspect you live here now.' },
  ];

  /* The final freeze, in the assembly hall. */
  const finalIdles = [
    { label: 'Say sorry', lines: ['Your mouth opens. The hall stays frozen. Sorry doesn’t have a market rate.', 'You say it again, louder. Nothing. The drone gets higher.'] },
    { label: 'Hand back the money', lines: ['You hold out the money. Nobody takes it. It isn’t that kind of debt.', 'You put the money on the floor. It is still yours. It will always be yours.'] },
    { label: 'Wait', lines: ['The drone continues.', 'The drone continues. Somewhere, a refund policy is being consulted.'] },
  ];

  /* ------------------------------------------------------------------ */
  /* Ending                                                             */
  /* ------------------------------------------------------------------ */
  const ending = [
    { scene: { bg: 'gates', cast: [], rain: true, style: 'real', tuckSad: true, tuckSit: true, school: "St. Jude's" }, text: 'Tuck is expelled. All assets are seized, including the coat. He sits on the wall outside the gates. It is still raining.' },
    { scene: { bg: 'gates', cast: ['gary'], rain: true, style: 'real', ambientPlay: true, tuckSad: true, tuckSit: true, school: "St. Jude's" }, text: 'Through the railings, kids are playing. Nobody is charging anybody for anything. It looks stupid. It looks brilliant. Gary lands on the wall beside you. He doesn’t want anything. That’s new.' },
    { scene: { bg: 'shed', cast: ['newkid'], noTuck: true, style: 'crayon', school: "St. Pete's Primary" }, text: 'Behind the sports shed at St. Pete’s Primary, a new kid steps out. Eight years old. Mismatched shoes. A jumper rolled tight under one arm.' },
    { scene: { bg: 'playground', cast: ['newkid', 'cryer'], noTuck: true, bench: true, style: 'crayon', school: "St. Pete's Primary" }, text: 'Across the playground, somebody is crying into a sandwich.' },
    { scene: { bg: 'playground', cast: ['newkid', 'cryer'], noTuck: true, bench: true, style: 'crayon', school: "St. Pete's Primary" }, text: '', big: 'THE DEVIL DIES,<br>BUT THE MARKET LIVES FOREVER.' },
  ];

  /* Small print scrolled along the bottom of the Act 3 "advert". */
  const adDisclaimers = [
    '*Results not typical. Happiness not guaranteed. Children may be harmed.',
    '*Volt-Juice™ is not a food, a drink, or legally a liquid.',
    '*Tuck Enterprises™ accepts no liability for childhood.',
    '*Your playground may go down as well as up.',
    '*Terms apply. The terms are: you lose.',
    '*Free means free at the point of use. The point of use is later.',
    '*No hamsters were harmed. One hamster was defamed.',
    '*Voltage Vince is fine. Please stop asking if Vince is fine.',
    '*Blue is a flavour. Blue has always been a flavour.',
    '*Gary the pigeon is a non-executive director and is not available for comment.',
  ];

  /* The awkward wait after a decent choice. {name} is whoever you're with. */
  const awkward = {
    open: [
      '{name} looks at you. You look at {name}. Nobody says anything.',
      'There is a pause. It goes on slightly too long. Then it keeps going.',
      'Nothing happens. You had expected something to happen.',
      'The clock above the door stops at {time}. Nobody else seems to notice.',
      'A silence arrives. It sits down next to you. It has brought sandwiches.',
      'You and {name} stand there. A leaf falls. It takes the scenic route.',
    ],
    // drift into the log while you wait, whether you do anything or not
    beats: [
      '{name} shifts from one foot to the other.',
      'Somewhere, a bell should be ringing. It isn’t.',
      'A crisp packet blows past. It doesn’t come back.',
      '{name} clears their throat, then thinks better of it.',
      'You become aware of your own hands.',
      'It is still {time}.',
      'Somebody, somewhere, is making money. It isn’t you.',
      'A teacher walks past, sees the two of you, and decides it isn’t worth it.',
      '{name} blinks. It takes about a week.',
      'Your stomach makes a noise. It is the loudest thing that has ever happened.',
      'Gary the pigeon lands nearby, assesses the situation, and leaves.',
      'Somewhere in the building, a radiator thinks about coming on, and doesn’t.',
      'Mr Dobson mops into view, mops a perfect circle around both of you, and mops away.',
      'A crisp packet blows back the other way. It’s the same crisp packet. It looks tired.',
      'You think you hear the tannoy clear its throat. It doesn’t say anything.',
    ],
    passes: 'Eventually, the moment passes.',
  };

  /* ------------------------------------------------------------------ */
  /* Interludes: the school getting on with being strange. No choices.  */
  /* One may turn up between encounters. Each plays once per run.       */
  /* ------------------------------------------------------------------ */
  const interludes = {
    1: [
      { id: 'i1-astra', kicker: 'Tannoy', text: 'Ding-dong. “Would the owner of a blue Vauxhall Astra please move it, as it is now in the pond.” There is no pond at St. Pete’s. Everybody goes to look anyway.' },
      { id: 'i1-field', kicker: 'Tannoy', text: '“Children are reminded that the field is out of bounds due to the field.” Mrs Whitlock does not elaborate. Nobody has been on the field since 2004. It has started to look back.' },
      { id: 'i1-maureen', kicker: 'Overheard', cast: ['maureen'], text: 'Dinner Lady Maureen leans over the custard. “The chips have told me things, Tucker. About you. About Thursday.” She won’t say what. She gives you one chip. It is warm with prophecy.' },
      { id: 'i1-dobson', kicker: 'Corridor', bg: 'corridor', cast: ['dobson'], text: 'Mr Dobson is mopping a dry corridor. He has been mopping it since 1987. When you ask why, he mops slightly faster, which is all the answer you’re going to get.' },
      { id: 'i1-gary', kicker: 'Playground', cast: ['gary'], noTuck: true, text: 'A pigeon lands on the hopscotch and completes it perfectly, all the way to ten, then back. The Year 3s burst into applause. Gary takes no questions.' },
      { id: 'i1-shoe', kicker: 'Assembly', text: 'In assembly, Mrs Whitlock holds up a single shoe and asks whose it is. It has been three weeks. Nobody claims the shoe. The shoe now has its own hymn.' },
      { id: 'i1-harriets', kicker: 'Playground', cast: ['harrietA', 'harrietB'], text: 'Harriet and Harriet are holding hands and staring at you. They do not blink. They will keep doing this until the bell. It is not personal. It might be personal.' },
      { id: 'i1-callum', kicker: 'Overheard', cast: ['callum'], text: 'Callum walks past, leaving faint purple footprints. A Year 1 follows them all the way to the toilets and comes back changed.' },
      { id: 'i1-parachute', kicker: 'Wet play', text: 'Somebody has found the parachute. Thirty children went under it. Miss Tranter went in after them. Nobody has come out. You can hear singing.' },
      { id: 'i1-grandad', kicker: 'Show and tell', text: 'Ellie brings in a stone she says is her grandad. The class passes it round, very respectfully. Ellie’s grandad is alive and in the corridor, waving through the window.' },
      { id: 'i1-photo', kicker: 'Overheard', text: 'Two Year 6s argue about whether Mr Dobson is the same Mr Dobson as in the school photo from 1952. The photo is labelled “Mr Dobson”. He is mopping in it.' },
      { id: 'i1-nan', kicker: 'Your jumper', text: 'You find a note from your nan tucked between the Gummy Snails. It says: “I KNOW.” Just that. In capitals. Underlined three times.' },
    ],
    2: [
      { id: 'i2-hamster', kicker: 'Tannoy', text: '*Crackle.* “This is a message for… *crackle* …the hamster. We know what you did.” *Click.* Nobody at St. Jude’s owns a hamster. Several people feel guilty.' },
      { id: 'i2-alarm', kicker: 'Tannoy', text: '“The fire alarm will be tested at eleven. If you hear it at any other time, that is the real one, and you should assume it is personal.”' },
      { id: 'i2-council', kicker: 'Corridor', bg: 'corridor', cast: ['council'], text: 'A Man from the Council is measuring the corridor with a tape measure. He measures it twice. It is longer the second time. He writes this down and looks at you as though it is your fault.' },
      { id: 'i2-grieve', kicker: 'Chemistry', cast: ['grieve'], text: 'Mr Grieve has set his eyebrows on fire again. He is teaching through it. “And this,” he says, smouldering gently, “is an exothermic reaction.”' },
      { id: 'i2-darren', kicker: 'Overheard', text: 'Legend says the radiator in 9C was switched on once, in 1996, and a boy called Darren got so warm he ascended. There is a plaque. It just says DARREN.' },
      { id: 'i2-bus', kicker: 'The 47 bus', text: 'The school bus has taken a different route this morning. Nobody on it recognises anything. The driver says it is a shortcut. That was forty minutes ago. Some of them are still on it.' },
      { id: 'i2-gary', kicker: 'Bikeshed', bg: 'bikeshed', cast: ['gary'], noTuck: true, text: 'Gary the pigeon has followed you to big school. He has put on weight. He is sitting on the bikeshed roof like he owns it. He doesn’t own it. Yet.' },
      { id: 'i2-twizzler', kicker: 'Canteen', text: 'The canteen is serving Turkey Twizzler Surprise. The surprise is that it is Monday’s Turkey Twizzler. It has been reheated so often it has started to remember things.' },
      { id: 'i2-gavin', kicker: 'Overheard', cast: ['gavin'], text: 'Head Monitor Gavin is practising looking the other way in the mirror of the boys’ toilets. He is very good. His head now naturally points slightly to the left, even in photos.' },
      { id: 'i2-rope', kicker: 'PE', text: 'Mr Kettle makes everyone climb the rope. Nobody has ever reached the top. A Year 9 who went up in 1998 is still up there. Sometimes, if you listen, he is doing his GCSEs.' },
      { id: 'i2-tamagotchi', kicker: 'Tannoy', text: '“Would whoever is leaving Tamagotchis in the trophy cabinet please stop. They are not trophies. They are not even dead. They are just very, very hungry.”' },
      { id: 'i2-nan', kicker: 'Your phone', text: 'Your nan has left a voicemail. It is eleven minutes of her breathing, a kettle, and then, very quietly, “Tucker.”' },
    ],
    3: [
      { id: 'i3-jingle', kicker: 'Tannoy', text: '♪ “This break is brought to you by Volt-Juice™! Volt-Juice: because sleep is for the poor!” ♪ The jingle is in a key that doesn’t exist. Three Year 7s start crying and don’t know why.' },
      { id: 'i3-vince', kicker: 'The quad', cast: ['vince'], text: 'Voltage Vince is doing a little dance in the quad. Nobody has seen him eat. Nobody has seen him sit. He has been described, in a staff meeting, as “structural”.' },
      { id: 'i3-josh', kicker: 'Student council', cast: ['josh'], text: 'Head Boy Josh has called an emergency student council meeting to discuss the chalk situation. He has eaten all the chalk. That is the situation.' },
      { id: 'i3-council', kicker: 'Audit', cast: ['council'], text: 'The Man from the Council is back. He is measuring the vending machines. He asks how many you have. You say eleven. He writes down “twelve” and underlines it.' },
      { id: 'i3-focus', kicker: 'Market research', cast: ['focus'], text: 'Your focus group has tested the new Volt-Juice flavour, Blue. They describe it as “loud”, “a smell you can hear” and, in one case, “my dad”. Approved for sale.' },
      { id: 'i3-gary', kicker: 'Board meeting', bg: 'office', cast: ['gary'], text: 'Gary the pigeon now wears a little tie. Nobody gave him the tie. He attends every board meeting. He has never spoken, which puts him ahead of Josh.' },
      { id: 'i3-copier', kicker: 'Staffroom', cast: ['pembleton'], text: 'Mr Pembleton has started talking to the photocopier. The photocopier has started talking back. It mostly says PC LOAD LETTER, but with real feeling.' },
      { id: 'i3-mug', kicker: 'Staffroom', text: 'A sign in the staffroom says PLEASE WASH YOUR OWN MUG. Underneath, in your handwriting, it now says: “Mug washing available. 50p. Ask Biff.”' },
      { id: 'i3-fountain', kicker: 'Tannoy', text: '♪ “A happy student is a hydrated student! A hydrated student is a paying student! Volt-Juice!” ♪ The broken water fountains gurgle in what sounds a lot like grief.' },
      { id: 'i3-careers', kicker: 'Careers', text: 'The careers adviser has replaced every career in the booklet with “Tuck Enterprises™ (Junior Associate)”. The booklet is now one page long. It is incredibly glossy.' },
      { id: 'i3-nan', kicker: 'Your phone', text: 'Nan has texted. It just says “£”. You don’t know if it’s a question.' },
    ],
    4: [
      { id: 'i4-tannoy', kicker: 'Tannoy', text: 'The tannoy clicks on. Nobody says anything. You hear someone breathing, a long sigh, a mug being put down. It clicks off.' },
      { id: 'i4-council', kicker: 'Corridor', bg: 'corridor', cast: ['council'], text: 'The Man from the Council is in the corridor. He isn’t measuring anything today. He just nods at you, once, like he knew all along how long this would be.' },
      { id: 'i4-gary', kicker: 'Window', text: 'Through the window, Gary the pigeon is sitting on the bikeshed roof in the rain. He isn’t wearing the tie any more. Nobody is wearing the tie any more.' },
    ],
  };

  /* One of these closes each day's walk home. */
  const evenings = {
    1: [
      'At home, Nan is watching Countdown with the sound off and shouting the numbers anyway.',
      'Nan has noticed eleven Gummy Snails missing from her handbag. She has blamed the cat. You don’t have a cat. You do now. She bought one to blame.',
      'Tea is fish fingers. You arrange them into a small bar chart. Your mum asks what it’s a chart of. You don’t know yet.',
      'Your mum asks how school was. You say “fine”. The snails in your jumper say nothing. They are very loyal snails.',
      'You lie in bed and count your money twice. It comes out the same both times. That feels like a sort of love.',
    ],
    2: [
      'At home there’s a programme on about a man who sold his own kidney to buy a better kidney. You take notes.',
      'Nan rings to ask if you’ve made any friends. You count Biff. Biff counts as about two.',
      'You fall asleep doing homework. In the dream you’re charging the homework rent. It pays.',
      'Your mum has found the coat. She asks what the eleven pockets are for. You say “pockets”. She seems to accept this.',
    ],
    3: [
      'At home you pay your little cousin to do your chores, then subcontract him to the kid next door.',
      'Nan watches you count money at the kitchen table. “You’ve got your grandad’s hands,” she says. You don’t ask what happened to your grandad.',
      'You dream about the jingle. You wake up humming it. So does the fridge.',
      'Your dad asks if you want to go fishing at the weekend. You ask what the margins are like on fish. He goes fishing on his own.',
    ],
  };

  T.content = { people, tuckLook, acts, story, milestones, fillers, idles, freezeEscalation, finalIdles, ending, adDisclaimers, awkward, interludes, evenings };
})();
