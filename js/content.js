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
    billy: { name: 'Little Billy', skin: SKIN[0], shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#e7bf62', hairStyle: 'mop', s: 0.85, mood: 'crying', sandwich: true },
    jade: { name: 'Jade', skin: SKIN[1], shirt: '#d9d9d9', trousers: '#5b5f66', skirt: true, hair: '#7a3f1d', hairStyle: 'pony', s: 0.9, mood: 'sad', graze: true },
    priya: { name: 'Priya', skin: SKIN[2], shirt: '#d9d9d9', trousers: '#5b5f66', skirt: true, hair: '#1d1410', hairStyle: 'long', s: 0.9, mood: 'neutral', sandwich: true },
    kyle: { name: 'Kyle', skin: SKIN[0], shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#c4552b', hairStyle: 'short', s: 0.95, mood: 'happy', card: true },
    biff: { name: 'Biff', skin: SKIN[1], shirt: '#d9d9d9', trousers: '#3b3f46', hair: '#3a2a1a', hairStyle: 'buzz', s: 1.2, mood: 'angry', wide: 1.35, moustache: true },
    year2: { name: 'A Year 2', skin: SKIN[3], shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#1d1410', hairStyle: 'short', s: 0.72, mood: 'happy' },
    leaver: { name: 'Year 6 Leaver', skin: SKIN[2], shirt: '#d9d9d9', trousers: '#3b3f46', hair: '#1d1410', hairStyle: 'short', s: 1.15, mood: 'neutral', shades: true },
    dev: { name: 'Dev', skin: SKIN[2], shirt: '#ffffff', trousers: '#2b2f3a', blazer: '#1f2f6b', tie: '#b71c1c', hair: '#1d1410', hairStyle: 'short', s: 1.0, mood: 'sad' },
    year7s: { name: 'Soggy Year 7s', skin: SKIN[0], shirt: '#ffffff', trousers: '#2b2f3a', blazer: '#1f2f6b', tie: '#b71c1c', hair: '#8a5a2b', hairStyle: 'wet', s: 0.95, mood: 'sad' },
    penny: { name: 'Penny', skin: SKIN[3], shirt: '#ffffff', trousers: '#2b2f3a', skirt: true, blazer: '#1f2f6b', tie: '#b71c1c', hair: '#1d1410', hairStyle: 'bun', s: 1.0, mood: 'tired', glasses: true, eyebags: true },
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
    maureen: { name: 'Dinner Lady Maureen', hairnet: true, skin: SKIN[1], shirt: '#6fae7a', trousers: '#3b3f46', skirt: true, hair: '#c8c8c8', hairStyle: 'bun', s: 1.3, adult: true, mood: 'neutral', apron: true },
    dobson: { name: 'Mr Dobson, Caretaker', skin: SKIN[0], shirt: '#35598c', trousers: '#35598c', hair: '#8a8a8a', hairStyle: 'bald', s: 1.35, adult: true, mood: 'tired', mop: true },
    council: { name: 'A Man from the Council', clipboard: true, skin: SKIN[0], shirt: '#e2dcc6', trousers: '#5a594a', blazer: '#6b6a58', tie: '#4a4a40', hair: '#5a5a5a', hairStyle: 'side', s: 1.4, adult: true, mood: 'neutral', glasses: true, lanyard: true },
    harrietA: { name: 'Harriet and Harriet', skin: SKIN[0], shirt: '#d9d9d9', trousers: '#5b5f66', skirt: true, hair: '#e7bf62', hairStyle: 'pony', s: 0.85, mood: 'neutral' },
    harrietB: { name: 'Harriet', skin: SKIN[3], shirt: '#d9d9d9', trousers: '#5b5f66', skirt: true, hair: '#1d1410', hairStyle: 'pony', s: 0.85, mood: 'neutral' },
    callum: { name: 'Callum (mostly Ribena)', skin: '#dcaee6', purple: true, shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#7a3f8a', hairStyle: 'mop', s: 0.9, mood: 'happy' },
    gary: { name: 'Gary', pigeon: true, s: 1 },
    grieve: { name: 'Mr Grieve, Chemistry', skin: SKIN[0], shirt: '#ffffff', trousers: '#3b3f46', blazer: '#ececec', hair: '#d0d0d0', hairStyle: 'scruff', s: 1.35, adult: true, mood: 'tired', glasses: true, fireBrows: true },
    josh: { name: 'Josh, Head Boy', skin: SKIN[0], shirt: '#ffffff', trousers: '#222', blazer: '#2c2c2c', hair: '#d6b25e', hairStyle: 'mop', s: 1.12, mood: 'happy', badge: true, chalk: true },
    vince: { name: 'Voltage Vince', skin: SKIN[1], shirt: '#e8202a', trousers: '#222', hair: '#222', hairStyle: 'short', s: 1.4, adult: true, mood: 'happy', can: true },
    focus: { name: 'The Year 7 Focus Group', skin: SKIN[2], shirt: '#ffffff', trousers: '#222', hair: '#1d1410', hairStyle: 'short', s: 0.9, mood: 'neutral' },
    cryer: { name: 'Crying Kid', skin: SKIN[0], shirt: '#d9d9d9', trousers: '#5b5f66', hair: '#c4552b', hairStyle: 'pony', s: 0.82, mood: 'crying', sandwich: true },
  };

  /* Tuck's look evolves per act. soul < 30 gives him pound-sign eyes. */
  function tuckLook(act, soul) {
    const base = { name: 'Tuck', skin: SKIN[0], hair: '#6b4a2b', s: 1, mood: 'neutral', pound: soul < 30 };
    if (act === 1) return Object.assign(base, { shirt: '#c9c9c9', trousers: '#1f2a5a', shorts: true, hairStyle: 'scruff', s: 0.9, shoes: ['#c62828', '#e0473a'], jumperRoll: true });
    if (act === 2) return Object.assign(base, { shirt: '#ffffff', trousers: '#2b2f3a', coat: '#7a5a34', hairStyle: 'scruff', s: 1.0, shoes: ['#c62828', '#e0473a'] });
    if (act === 3) return Object.assign(base, { shirt: '#ffffff', trousers: '#111', blazer: '#111', tie: '#ffcc00', hairStyle: 'slick', s: 1.15, mood: 'smug', organiser: true, shoes: ['#111', '#111'], fluff: true });
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
      goal: 'the coat',
      progress: ['The Year 6 leaver walks past, looks at your pockets, and laughs out loud.', 'The Year 6 leaver walks past, looks at your pockets, and shakes his head. Not yet.', 'The Year 6 leaver walks past, looks at your pockets, and nods. Slowly. Almost.'],
      line: [[1, 1], [4, 2]], // [from day, cruelty required]
      dues: 60, // owed at home time on day 1…
      duesStep: 20, // …and this much more every day after (for duesDays days). The price "depends".
      duesDays: 4,
      duesWho: 'the hall monitor',
      broke: 'The hall monitor is waiting at the gate with his hand out. Today it’s {dues}. Yesterday it was less. You have {cash}. The bell doesn’t ring. Nobody goes home.',
      paid: 'Gave the hall monitor {dues} at the gate. He says the price depends. He won’t say on what.',
      start: 605, // 10:05 on day one
      feedTitle: 'Things That Happened',
      objective: 'There’s a Year 6 leaver selling a Mega-Coated Trench Coat. {target}.',
      outro: [
        { text: 'The coat goes down to Tuck’s ankles. He walks out of St. Pete’s for the last time with Biff a step behind him, like weather.', scene: { bg: 'playground', cast: ['biff'], style: 'crayon' } },
        { text: 'Then it’s the summer holidays. It rains for six weeks. Tuck spends them doing stocktake on a jumper.', scene: { bg: 'playground', cast: [], rain: true, style: 'crayon' } },
        { text: 'Billy moves to Leicester. Nobody tells him why. Gary the pigeon sees Tuck off at the gates. He doesn’t wave. Pigeons can’t wave. It’s implied.', scene: { bg: 'shed', cast: ['gary'], noTuck: true, style: 'crayon' } },
        { text: 'On the first morning of big school, Tuck’s mum takes a photo of him on the doorstep. When it comes back from Boots, he is very slightly pixelated. So is she. So is the dog. Nobody mentions it.', scene: { bg: 'corridor', cast: [], style: 'pixel' }, glitch: true },
      ],
      intro: [
        "St. Pete's Primary. Morning break.",
        'This is Tucker. Everyone calls him Tuck. Mismatched shoes — one red, one a different red. Navy shorts in a school of grey trousers.',
        "Rolled inside his jumper: eleven Gummy Snails, liberated from his nan's handbag.",
        'The hall monitor wants paying every day at home time. Nobody knows why. The price, he says, depends.',
        'And behind the sports shed, a Year 6 leaver is selling a Mega-Coated Trench Coat. Eleven inside pockets. It smells of Lynx Africa and ambition. Tuck has never wanted anything more in his life.',
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
      goal: 'the bikeshed',
      progress: ['Gavin watches you from the bikeshed. He doesn’t even bother looking the other way.', 'Gavin watches you from the bikeshed. He looks the other way, but only slightly.', 'Gavin watches you from the bikeshed and very nearly looks completely the other way.'],
      line: [[1, 2], [3, 3]],
      dues: 800,
      duesStep: 200,
      duesDays: 4,
      duesWho: 'Biff',
      broke: 'Biff is waiting by the gates. Today Biff is on {dues}. You have {cash}. Biff doesn’t go home until he’s paid, and neither do you.',
      paid: 'Paid Biff {dues}. He counted it twice. His rate has gone up. He says it’s “inflation”. He pronounces it “inflection”.',
      outro: [
        { text: 'Gavin hands over the keys to the bikeshed. The bikeshed doesn’t have a door. He hands them over anyway, very solemnly, and looks slightly to the left for the rest of his life.', scene: { bg: 'bikeshed', cast: ['gavin'], style: 'pixel' } },
        { text: 'Then Year 9 happens. Then GCSEs happen. A moustache happens, mostly.', scene: { bg: 'corridor', cast: [], style: 'pixel' } },
        { text: 'One morning Tuck wakes up and everything is glossy. The cornflakes have a jingle. His mum’s teeth go *ting* when she smiles. Biff has a slogan. Nobody mentions it.', scene: { bg: 'sixth', cast: [], style: 'ad' }, glitch: true },
      ],
      start: 530,
      feedTitle: 'Gossip',
      objective: 'The Senior Hall Monitors run the bikeshed. Word is they’d sell it for {target}.',
      intro: [
        "St. Jude's Comprehensive. 1,400 pupils. One working radiator.",
        'Tuck is eleven now. The coat is still enormous. It is a statement. The statement is: inside this coat there are things you want.',
        "Biff came too. Biff was held back, then pushed forward, and now he's in Year 7 with you. He's on a daily rate. The rate is whatever Biff says it is.",
        'At St. Jude’s there is exactly one dry, unsupervised, teacher-blind square metre: the bikeshed. Whoever runs the bikeshed runs the school. The Senior Hall Monitors run the bikeshed. For now.',
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
      target: 60000,
      goal: 'the contract',
      progress: ['Mr Crane passes you in the corridor and doesn’t wink.', 'Mr Crane passes you in the corridor and winks. Once.', 'Mr Crane passes you in the corridor, winks twice, and pats his inside pocket, where the envelope lives.'],
      line: [[1, 2], [3, 3]],
      dues: 6000,
      duesStep: 2000,
      duesDays: 3,
      duesWho: 'the payroll',
      broke: 'Biff, Gavin and Mr Pembleton are waiting outside your office. Today they’re owed {dues} between them. You have {cash}. Nobody leaves until everybody’s paid.',
      paid: 'Paid out {dues} in retainers: Biff, Gavin, and an envelope for Mr Pembleton, who has started counting his.',
      outro: [
        { text: 'There is a jingle. There is confetti that you paid for, falling from a ceiling that you own. Somebody hands you a giant novelty cheque. It is made out to you, from you.', scene: { bg: 'office', cast: ['crane'], style: 'ad' } },
        { text: 'Meanwhile, in lost property, under a PE bag that nobody has claimed since 2003, somebody finds a ledger.', scene: { bg: 'corridor', cast: [], style: 'ad' } },
        { text: 'The confetti is still coming down when the picture cuts out.', scene: { bg: 'sixth', cast: [], style: 'ad' } },
      ],
      start: 530,
      feedTitle: 'Stakeholder Updates',
      objective: 'Mr Crane keeps mentioning an envelope. {target} would fill it.',
      intro: [
        'TUCK ENTERPRISES™. Est. Year 9. Now with a Sixth Form Campus Division!',
        "Tuck doesn't deal any more. He has a digital organiser, a mission statement, and a moustache he's very proud of. It's mostly shadow.",
        'Remember: playground happiness is a renewable resource. Until it isn’t.',
        'Mr Crane, the Vice-Principal, keeps mentioning a five-year exclusive contract. He mentions it every time he sees you. Then he winks. It might be a tic. It is not a tic.',
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
            evil: 2, label: '“A pound. You can owe me the other 50p.”', cash: 50, soul: -5, happy: -3, follow: 'billy-iou',
            fanfare: ['IOU ACQUIRED!'],
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
            evil: 3, label: '“Two plasters, £1.20, plus a wound maintenance contract. 10p a day.”', cash: 140, follow: 'jade-sub', soul: -10, happy: -6, mono: 5,
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
            evil: 2, label: '“30p a box. Could be a Wagon Wheel. Could be anything.”', cash: 90, follow: 'priya-credit', soul: -7, happy: -6, mono: 5,
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
      line: 'Show us your pockets. …Yeah. That’ll do. I’ll throw in Biff. He follows the coat.',
      options: [
        { type: 'milestone', label: 'Hand it over.', cost: 600, fanfare: ['MEGA-COATED TRENCH COAT!', 'SECURITY HIRED: BIFF!'], result: 'You put on the coat. It drags on the ground. Biff falls in behind you like a weather system. Primary school is over. You are ready for the big leagues.' },
      ],
    },
    2: {
      id: 'monitors',
      scene: { bg: 'bikeshed', cast: ['gavin'] },
      speaker: 'gavin',
      text: 'The Senior Hall Monitors control the bikeshed: the only covered, unsupervised, teacher-blind square metre at St. Jude’s. Head Monitor Gavin wears his sash like a war medal.',
      line: 'I’ve been watching your pockets, Tucker. That’s the price. Don’t ask what the price is. That’s the price, and the bikeshed is yours. I didn’t see anything. I never see anything. That’s the job.',
      options: [
        { type: 'milestone', label: 'Hand it over.', cost: 5000, fanfare: ['HALL MONITORS BRIBED!', 'EXCLUSIVE TRADING HUB SECURED!'], result: 'Gavin pockets the money and adjusts his sash. From now on, nothing happens at the bikeshed, officially. Unofficially, everything does.' },
      ],
    },
    3: {
      id: 'contract',
      scene: { bg: 'office', cast: ['crane'] },
      speaker: 'crane',
      text: 'The Vice-Principal, Mr Crane, has a proposal. Five years. Exclusive commercial rights to every vending machine, fountain, photocopier and tuck shop on campus. He has brought an envelope. It is exactly the right size. He doesn’t say what for.',
      line: 'Just sign here, Tucker. And here. And initial there. Lovely pen, isn’t it?',
      options: [
        { type: 'milestone', label: 'Fill the envelope. Sign.', cost: 60000, fanfare: ['5-YEAR EXCLUSIVE CONTRACT!', 'MARKET MONOPOLY: 100%!', 'TUCK ENTERPRISES™ WINS!'], result: 'You sign. Mr Crane shakes your hand. Somewhere a jingle plays. Confetti that you paid for falls from a ceiling that you own. You have won capitalism. You are sixteen.' },
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
        id: 'f-ribena', series: 'callum', step: 1, scene: { cast: ['callum'] }, speaker: 'callum',
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
        id: 'f-callum2', series: 'callum', step: 2, scene: { cast: ['callum'] }, speaker: 'callum',
        text: 'Callum is back. He isn’t purple any more. He’s mauve. He says it’s “a phase”. His mum has hidden every bottle of Ribena in the house inside a hollowed-out Bible.',
        line: 'I found it on Sunday. I’ve been reading it all week. Not the words. The Ribena.',
        options: [
          { evil: 0, label: 'Tell him mauve really suits him.', cash: 0, result: 'Callum beams. “Thanks, Tuck.” He looks at his hands. “It does, doesn’t it.” It does, actually.' },
          { evil: 1, label: 'One small cup. 20p.', cash: 25, soul: -1, result: 'Callum drinks it standing up, eyes closed, like a man at a christening.' },
          { evil: 2, label: 'Sell him “Ribena Extra”: Ribena, plus more Ribena.', cash: 110, soul: -6, happy: -4, fanfare: ['NEW PRODUCT LINE!'], result: 'Ribena Extra is a bottle of Ribena with “EXTRA” written on it. Callum holds it up to the light and says “I can taste the extra.”', feed: ['Callum has gone back from mauve to purple. He says it was “a relapse”, then laughs for a full minute.'] },
          { evil: 3, label: 'Ribena by subscription, delivered to his desk by Year 2s on scooters.', cash: 190, soul: -11, happy: -6, fanfare: ['SUBSCRIPTION ACTIVE!', 'LAST-MILE DELIVERY!'], result: 'Every forty minutes a Year 2 scoots into Numeracy, hands Callum a cup, and scoots out. Miss Tranter has stopped asking.', feed: ['Callum’s desk is now permanently sticky. Nothing will stay on it. A pencil case slid off it and out of the window.', 'One of the delivery Year 2s has started demanding a pension.'] },
        ],
      },
      {
        id: 'f-callum3', series: 'callum', step: 3, scene: { cast: ['callum'] }, speaker: 'callum',
        text: 'Callum has started a Ribena support group. It meets behind the mobile classroom. He is the only member. He has asked you to come and speak.',
        line: 'You don’t have to say much. Just “hello Callum” and then whatever’s in your heart. And maybe a bottle.',
        options: [
          { evil: 0, label: 'Go. Say “hello Callum”. Mean it.', cash: 0, result: 'You say hello Callum. He says hello Tuck. Neither of you knows what to say next, so you sit on the step for a bit. A blackbird lands. It’s nice. It’s really nice.' },
          { evil: 1, label: 'Speak. Charge a modest speaker’s fee.', cash: 30, soul: -1, result: 'Your speech is four words long. Callum claps for a long time. He pays in 1p coins, which take longer than the speech.' },
          { evil: 2, label: 'Speak. Sell refreshments. The refreshments are Ribena.', cash: 120, soul: -7, happy: -4, fanfare: ['CATERING CONTRACT!'], result: 'The support group runs for twelve minutes and Callum drinks the entire refreshment table. He calls it “the best meeting we’ve ever had”.', feed: ['Callum has made you an honorary member of his support group. He’s written your name on the sign-in sheet in purple.'] },
          { evil: 3, label: 'Franchise it. Ribena Anonymous: now open to every Year 4. Membership £1.', cash: 210, soul: -12, happy: -8, mono: 6, fanfare: ['FRANCHISE OPENED!', 'MEMBERSHIP FEES!'], result: 'Ribena Anonymous has nineteen members by Friday. None of them drank Ribena before they joined. All of them do now. The meetings are catered.', feed: ['Nineteen Year 4s have gone purple. The school photo has been postponed.', 'Callum says he feels “less alone now, but also worse”.'] },
        ],
      },
      {
        id: 'f-callum4', series: 'callum', step: 4, repeat: true, scene: { cast: ['callum'] }, speaker: 'callum',
        text: 'In assembly, Mrs Whitlock accidentally reads out Callum’s name for the Cycling Proficiency award. He can’t ride a bike. He accepts it anyway, in tears, from a stage he has also never been on.',
        line: 'This is the best day of my life. Everybody’s looking at me. I’m going to remember this when I’m forty.',
        options: [
          { evil: 0, label: 'Clap louder than anyone.', cash: 0, result: 'You clap until your hands hurt. Callum points at you from the stage like a pop star. Mrs Whitlock never corrects it. He keeps the badge for ever.' },
          { evil: 1, label: 'Sell him a frame for the certificate.', cash: 30, soul: -1, result: 'The frame is a cereal box with a square cut out. Callum says it’s “museum quality”.' },
          { evil: 2, label: 'Sell signed photos of “Award-Winning Callum”. 10p each.', cash: 120, soul: -6, happy: -3, fanfare: ['CELEBRITY MERCH!'], result: 'Callum signs forty photos in purple felt tip and sells every one. He thinks the money goes to charity. It goes in the jumper.', feed: ['Callum asked what charity the photos were for. You said “a local one”. He’s very proud of the local one.'] },
          { evil: 3, label: 'Tell the real winner she can have it back. For a fee.', cash: 200, soul: -12, happy: -8, fanfare: ['AWARD BROKERED!'], result: 'Ellie in Year 6, who can actually ride a bike, pays £2 to get her badge back. You take the badge off Callum during wet play while he’s showing it to a radiator.', feed: ['Callum asked everyone if they’d seen his badge. Nobody said anything. Ellie wore it to the end of term, facing inwards.'] },
        ],
      },
      {
        id: 'f-milk', scene: { cast: ['year2'] }, speaker: 'year2',
        text: 'The milk monitor is off with chickenpox, so somebody has to hand out the free milk. “Free” is such an ugly word.',
        line: 'Is it milk time? Mrs Pike says milk makes your bones like Superman.',
        options: [
          { evil: 0, label: 'Hand out the milk. All of it. For free.', cash: 0, result: 'Thirty cartons, thirty straws, thirty very small moustaches. One Year 2 calls you “the milk man” for the rest of the year, with total respect.' },
          { evil: 1, label: 'Hand it out. Sell the spare cartons at 5p.', cash: 30, soul: -1, result: 'There are six spare cartons. They go in a minute. Milk, it turns out, has a secondary market.' },
          { evil: 2, label: 'Charge 5p a carton. Call it “admin”.', cash: 120, soul: -6, happy: -5, fanfare: ['ADMIN FEE!'], result: 'Twenty-four children pay for free milk. Six can’t. They watch the others drink it, which you file under “marketing”.', feed: ['Six Year 2s went without milk. One of them told her mum her bones are “just going to have to cope”.'] },
          { evil: 3, label: 'Charge for the milk, then sell the empty cartons to the art teacher for robot-making.', cash: 190, soul: -11, happy: -6, fanfare: ['CIRCULAR ECONOMY!', 'SOLD TWICE!'], result: 'The art teacher buys thirty empty cartons for the Year 2 robots. The Year 2s spend the afternoon building robots out of the milk they paid for and didn’t all get.', feed: ['The Year 2 robot display is called OUR FRIENDS THE ROBOTS. Three of the robots are crying. The children drew that on themselves.'] },
        ],
      },
      {
        id: 'f-conker', scene: { cast: ['kyle'] }, speaker: 'kyle',
        text: 'It’s conker season. Tommy in Year 5 has a conker that has beaten forty-seven other conkers. It is called Dennis. Dennis has a fan club. Kyle is the treasurer.',
        line: 'Dennis is undefeated, Tuck. Dennis is a legend. Dennis is basically a horse.',
        options: [
          { evil: 0, label: 'Ask if you can hold Dennis. Respectfully.', cash: 0, result: 'You hold Dennis. He is warm from Tommy’s pocket. He is, you have to admit, an incredible conker.' },
          { evil: 1, label: 'Run the queue to fight Dennis. 5p a go.', cash: 40, soul: -1, result: 'Dennis beats eight more conkers. Tommy is carried round the playground. You count the 5ps.' },
          { evil: 2, label: 'Take bets. Soak Dennis in vinegar overnight, “for his health”.', cash: 130, soul: -6, happy: -4, fanfare: ['BOOKMAKER LICENSED!'], result: 'Vinegar Dennis is unstoppable. You knew he would be. You bet on him. Everybody who bet against him pays you, including Tommy’s mum.', feed: ['Tommy’s hands smell of vinegar. He thinks it’s the smell of victory.'] },
          { evil: 3, label: 'Swap Dennis for a painted pebble. Sell the real Dennis to Kyle.', cash: 210, soul: -12, happy: -7, fanfare: ['ASSET STRIPPED!', 'DENNIS ACQUIRED!'], result: 'Tommy loses his first ever match, to a Year 3, with a pebble. He doesn’t understand. Kyle keeps Dennis in a matchbox and visits him at weekends.', feed: ['Tommy has retired from conkers. He says he “lost his touch”. He’s ten.', 'Kyle has added Dennis to his business card.'] },
        ],
      },
      {
        id: 'f-gary2', scene: { cast: ['gary'] }, speaker: '',
        text: 'Gary the pigeon has worked out how to take crisps straight out of open packets. He is bringing them to you and laying them at your feet, like a cat with a mouse.',
        line: '',
        options: [
          { evil: 0, label: 'Give the crisps back to the kids. Tell Gary no.', cash: 0, result: 'Gary looks at you for a long time. Then he takes one crisp back off a Year 3, very deliberately, and eats it in front of you. You respect that.' },
          { evil: 1, label: 'Sell the crisps back to their owners at cost.', cash: 30, soul: -1, result: 'You sell people back their own crisps for what they paid for them. Everyone agrees this is fair. Nobody is sure why they feel worse.' },
          { evil: 2, label: 'Sell them back at full price. Gary gets one crisp in five.', cash: 110, soul: -6, happy: -4, fanfare: ['PIGEON PARTNERSHIP!'], result: 'Gary is an exceptional employee. He works through lunch, takes no breaks, and only bites people who deserve it.', feed: ['Packets of crisps at St. Pete’s are now opened under desks, in silence, like contraband.'] },
          { evil: 3, label: 'Train Gary properly. Give him targets.', cash: 190, soul: -11, happy: -7, mono: 6, fanfare: ['WORKFORCE EXPANDED!', 'GARY: EMPLOYEE OF THE MONTH!'], result: 'Gary takes twenty-two crisps from nine children in a single lunchtime. You give him a little paper hat. He looks magnificent. He looks like he knows exactly what he’s done.', feed: ['The dinner ladies have put up a sign: DO NOT FEED GARY. Underneath, someone has written: GARY FEEDS HIMSELF.', 'A Year 1 had a full sandwich taken out of his hand. He says Gary “looked sorry, but did it anyway”.'] },
        ],
      },
      {
        id: 'f-nits', scene: { cast: ['jade'] }, speaker: 'jade',
        text: 'It’s nit-check day. Nurse Pat has a metal comb and the eyes of a hawk. A Year 4 has already fainted at the sight of the comb.',
        line: 'If I’ve got nits I get to go home. I want to go home. Have YOU got nits?',
        options: [
          { evil: 0, label: 'Tell her she’s fine and walk her to the nurse.', cash: 0, result: 'Jade has no nits. She is outraged. She has to stay for Spelling.' },
          { evil: 1, label: 'Sell carrier-bag “nit hats”. 10p.', cash: 35, soul: -1, result: 'A row of Year 4s sits through nit-check in Tesco bags. Nurse Pat doesn’t say anything. She just combs harder.' },
          { evil: 2, label: 'Tell Year 3 that nits are lucky. Sell them by the nit.', cash: 120, soul: -6, happy: -5, fanfare: ['NEW MARKET!'], result: 'You have no nits to sell. You sell grains of rice, one at a time, in a matchbox. Demand is extraordinary.', feed: ['Three Year 3s asked their mums to “put the nits back in” after a lice treatment.'] },
          { evil: 3, label: 'Sell nits to kids who want a day off. Sell the cure to their parents.', cash: 200, soul: -12, happy: -8, fanfare: ['BOTH SIDES SOLD!', 'VERTICALLY INTEGRATED!'], result: 'You buy a jar of real nits off a Year 6 nobody talks to. By Thursday, half of Year 4 is at home, and their parents are buying your “nit shampoo”. It is washing-up liquid.', feed: ['St. Pete’s has had to close two classrooms. The council has sent a letter. The letter has nits.', 'The Year 6 who sold you the nits has made his first ever friend. It’s a nit.'] },
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
          { evil: 3, label: 'Sign whatever he wants, then sell him a second, angrier witness. Biff.', cash: 1000, soul: -10, happy: -6, fanfare: ['CIVIC CORRUPTION!', 'WITNESS SUPPLIED!'], result: 'Biff signs that the corridor is four miles long, that the canteen is in Belgium, and that he personally saw it happen. The Man from the Council shakes his hand for a full minute.', feed: ['The corridor outside Maths is now officially a motorway. Year 7s are not allowed on it without a responsible adult.', 'Biff has been called as an expert witness in three more council disputes. He is very good. He is always angry.'] },
          { evil: 2, label: 'Sign whatever he wants. £5 a signature.', cash: 500, soul: -5, happy: -4, fanfare: ['+£5!', 'CIVIC ENGAGEMENT!'], result: 'You sign that the corridor is four miles long, that the canteen is in Belgium, and that you personally are a listed building.', feed: ['The corridor outside Maths has been reclassified as a B-road. There is now a speed limit and a lollipop lady.', 'Year 7s have to take a packed lunch to get to Geography.'] },
        ],
      },
      {
        id: 'f-grieve', scene: { cast: ['grieve'] }, speaker: 'grieve',
        text: 'Mr Grieve, Chemistry, has set his eyebrows on fire again and is continuing the lesson. You are the only person holding a bottle of water.',
        line: 'Bit of water, Tucker? Whenever you like. No rush. It’s just my face.',
        options: [
          { evil: 0, label: 'Throw the water at him.', cash: 0, result: 'You put out Mr Grieve. He thanks you, steaming gently, and gives you a detention for throwing things in a lab.' },
          { evil: 3, label: 'Sell him the water. Then sell the class tickets to watch.', cash: 900, soul: -11, happy: -6, fanfare: ['LIVE EVENT!', 'SOLD OUT!'], result: 'Thirty tickets at 20p each. Mr Grieve burns gently through the whole sale, then pays for the water with what’s left of his dignity and a fiver.', feed: ['Mr Grieve’s lesson is now listed in the school calendar as “an event”.', 'Mr Grieve has asked the Head for a fire blanket. He has been told to “budget for it”.'] },
          { evil: 2, label: '“Water’s two quid, sir. Seller’s market.”', cash: 200, soul: -6, happy: -3, fanfare: ['+£2!', 'EMERGENCY PRICING!'], result: 'Mr Grieve pays in coins, one at a time, while still on fire. It is the longest transaction of your life. Neither of you blinks.', feed: ['Mr Grieve now teaches in a balaclava. He says it’s “for the eyebrows”. He hasn’t got eyebrows.'] },
        ],
      },
      {
        id: 'f-shrine', scene: { bg: 'bikeshed', cast: ['year7s'] }, speaker: 'year7s',
        text: 'Somebody has built a shrine to Nibbles the hamster behind the science block: candles, a little wheel, and a photo of a hamster that is clearly a guinea pig. Nobody knew Nibbles. Everybody misses him.',
        line: 'Can we pray to him? Is that allowed? Is he a god now?',
        options: [
          { evil: 0, label: 'Leave them to it.', cash: 0, result: 'They hold a little service. Somebody reads a poem that rhymes “Nibbles” with “Nibbles”. It is genuinely moving.' },
          { evil: 3, label: 'Charge for prayers, then tell them Nibbles hears paid wishes first.', cash: 1200, soul: -11, happy: -7, mono: 6, fanfare: ['PRIORITY PRAYER!', 'RELIGION: PREMIUM TIER!'], result: 'A Year 7 empties her piggy bank for a priority wish. She wishes for her nan to get better. You keep the piggy bank too. It’s a nice piggy bank.', feed: ['The Year 7 checks the shrine every lunchtime to see if the wish worked.', 'Somebody wished for Nibbles to come back. A guinea pig appeared. Nobody can explain the guinea pig.'] },
          { evil: 2, label: '20p to pray. 50p for a wish. £1 to touch the wheel.', cash: 600, soul: -6, happy: -4, mono: 5, fanfare: ['ORGANISED RELIGION!', '+£6!'], result: 'By lunch the shrine has a queue, a gift shop and a man from Year 10 who claims to have been healed. You did not see the healing. You did charge for it.', feed: ['Somebody wished for Nibbles to come back. The next morning there was a guinea pig in the shrine. Nobody can explain the guinea pig.', 'The guinea pig has its own following now. It does not want one.'] },
        ],
      },
      {
        id: 'f-rope', scene: { cast: ['year7s'] }, speaker: 'year7s',
        text: 'Legend says a Year 9 climbed the PE rope in 1998 and never came down. Today a bucket comes down. Inside: a pound coin and a note that says CRISPS PLS.',
        line: 'You can’t not, Tuck. He’s been up there since the Spice Girls.',
        options: [
          { evil: 0, label: 'Send up a whole multipack.', cash: -100, result: 'The bucket goes up. After a long time, a little paper aeroplane comes down. It just says THANK YOU in very old handwriting.' },
          { evil: 3, label: 'Keep the pound. Send up a bill for “bucket handling”.', cash: 900, soul: -10, happy: -4, fanfare: ['LOGISTICS FEE!', 'VERTICAL INTEGRATION!'], result: 'The bucket goes up with an invoice. After a long time it comes back down with his life savings: a Woolworths voucher, nine pounds in 2p coins, and a note that says SORRY.', feed: ['The rope has gone very quiet.', 'Mr Kettle says nobody is allowed to climb the rope now. “Out of respect,” he says, and won’t say for what.'] },
          { evil: 2, label: 'Send up one crisp. Keep the pound.', cash: 100, soul: -5, happy: -3, fanfare: ['+£1!', 'VERTICAL MARKET!'], result: 'One crisp goes up. A long silence comes down.', feed: ['The bucket came down again. The note just said WHY.'] },
        ],
      },
      {
        id: 'f-tamagotchi', scene: { cast: ['year7s'] }, speaker: 'year7s',
        text: 'A Year 7’s Tamagotchi is dying in Geography and she isn’t allowed to feed it in lessons. It’s beeping. Everyone can hear it beeping. It’s beeping in a way that sounds like it knows.',
        line: 'He’s called Kevin Two. Kevin One died in Science. Please.',
        options: [
          { evil: 0, label: 'Feed Kevin Two for her, under your desk.', cash: 0, result: 'You press the little button. Kevin Two eats a little pixel burger and does a little dance. She mouths “thank you” across the room. You get a detention for “fiddling”.' },
          { evil: 1, label: 'Babysit him through Geography. £1.', cash: 200, soul: -1, result: 'Kevin Two survives Geography. So do you, just about. Geography is about rivers this term.' },
          { evil: 2, label: 'Babysit him at £1 an hour. Overtime after the bell.', cash: 550, soul: -6, happy: -4, fanfare: ['CHILDCARE!'], result: 'You keep Kevin Two alive for a day and a half. Your invoice is longer than his life expectancy.', feed: ['The Year 7 paid in instalments. Kevin Two died during the second one.'] },
          { evil: 3, label: 'Take the money. Let Kevin Two die. Sell her Kevin Three.', cash: 1050, soul: -12, happy: -7, fanfare: ['PLANNED OBSOLESCENCE!', 'REPEAT CUSTOMER!'], result: 'Kevin Two dies at 11:14. You’re very sorry. You happen to have Kevin Three in your coat. Kevin Three is the same Tamagotchi with the battery taken out and put back in.', feed: ['She has held a funeral for Kevin Two in the bikeshed. You charged her for the venue.', 'Kevin Three is doing well. She checks him every four minutes, in case.'] },
        ],
      },
      {
        id: 'f-detention', scene: { cast: ['year7s'] }, speaker: 'year7s',
        text: 'Detention. You, eleven others, and Mr Kettle, who has fallen asleep with his mouth open. He makes a noise like a kettle. That’s not why he’s called Mr Kettle. Nobody knows why he’s called Mr Kettle.',
        line: 'Should we just… go? Can we go? Tuck, can we go?',
        options: [
          { evil: 0, label: 'Let him sleep. Do your homework quietly.', cash: 0, result: 'Everyone does their homework in silence while Mr Kettle whistles gently. It’s the most productive hour St. Jude’s has ever seen.' },
          { evil: 1, label: 'Keep watch at the door for 20p each.', cash: 220, soul: -1, result: 'Eleven people leave early on your watch. Mr Kettle wakes up at four, alone with you, and says “well done, everyone”.' },
          { evil: 2, label: 'Charge 50p each to leave early.', cash: 550, soul: -6, happy: -4, fanfare: ['EXIT FEES!'], result: 'Eleven children pay to leave a room with no lock. You hold the door open for them. It feels like a service.', feed: ['Mr Kettle woke up to an empty room and wrote “excellent behaviour” in the detention book.'] },
          { evil: 3, label: 'Charge them to leave. Then wake him up and point at the empty chairs.', cash: 1000, soul: -12, happy: -8, fanfare: ['DOUBLE DIP!', 'GRASS PREMIUM!'], result: 'Eleven Saturday detentions. Mr Kettle thanks you personally and asks if you’d like to be a detention prefect. The badge comes with a 50p allowance.', feed: ['Eleven children did Saturday detention. They all paid you to leave the first one.', 'Somebody has written “GRASS” on your locker. You’ve started charging people to look at it.'] },
        ],
      },
      {
        id: 'f-snow', scene: { cast: ['year7s'], rain: true }, speaker: 'year7s',
        text: 'It has snowed two inches. The whole of St. Jude’s is pressed against the windows, staring at the Head’s office, waiting for the announcement that school is closing. It is the most united anyone has ever been.',
        line: 'They’ll close it. They have to close it. My cousin’s school closed for one inch. ONE INCH.',
        options: [
          { evil: 0, label: 'Go outside and build the worst snowman in Britain.', cash: 0, result: 'He has crisps for eyes and a Ribena bottle for a nose. Thirty people help. School doesn’t close. Nobody minds, for once.' },
          { evil: 1, label: 'Sell sledges made of lunch trays. 20p a go.', cash: 220, soul: -1, result: 'The lunch trays are terrible sledges and an excellent business. Two Year 8s end up in the staff car park, delighted.' },
          { evil: 2, label: 'Sell “inside information” that school is about to close.', cash: 600, soul: -6, happy: -5, fanfare: ['INSIDER TRADING!'], result: 'Sixty kids pay 10p for a whisper that school’s closing at eleven. It doesn’t close at eleven. You sell them a second whisper about twelve.', feed: ['Forty Year 7s walked home at lunch because you told them school was closed. It wasn’t. Their parents have been informed.'] },
          { evil: 3, label: 'Pull the fire alarm. Sell hot chocolate to everyone standing outside.', cash: 1200, soul: -12, happy: -9, fanfare: ['MANUFACTURED DEMAND!', 'HOT CHOCOLATE: £1!'], result: 'Fourteen hundred people stand in the snow for forty minutes. You sell hot chocolate out of the coat at a pound a cup. It is mostly hot water and a feeling.', feed: ['The fire brigade came. They bought hot chocolate too.', 'A Year 7 got frostbite on one ear. Only one. He’s calling it “a souvenir”.'] },
        ],
      },
      {
        id: 'f-darren', scene: { bg: 'corridor', cast: ['year7s'] }, speaker: 'year7s',
        text: 'A Year 7 has found that the radiator in 9C is on. Properly on. Warm. Word has got round. The queue goes past the library, down the stairs and out into the rain.',
        line: 'I touched it. I touched it and I felt my fingers again. Is this what Darren felt?',
        options: [
          { evil: 0, label: 'Join the queue. Wait your turn like everyone else.', cash: 0, result: 'You get forty seconds with the radiator. It’s wonderful. Behind you, someone is crying with happiness. Nobody is charging anybody for anything.' },
          { evil: 1, label: 'Run the queue. Tickets, 10p.', cash: 220, soul: -1, result: 'Order is restored. Everyone gets their thirty seconds. Some people go round twice. You make a reasonable living out of warmth.' },
          { evil: 2, label: '20p a minute. Biff times it with a stopwatch.', cash: 600, soul: -6, happy: -5, fanfare: ['HEAT METERED!'], result: 'Biff takes his job seriously. A Year 8 who goes four seconds over is removed from the radiator like a limpet from a rock.', feed: ['A Year 7 who couldn’t afford a minute stood near the queue to feel the warm air coming off the other people.'] },
          { evil: 3, label: 'Charge for the radiator. Sell commemorative DARREN mugs. Of hot water.', cash: 1150, soul: -12, happy: -8, mono: 6, fanfare: ['HERITAGE BRAND!', 'DARREN™!'], result: 'The DARREN mug sells out by lunch. Each one is a plastic cup with DARREN written on in marker and hot water from the radiator’s bleed valve. People cry holding them.', feed: ['Darren’s mum has seen the mugs. Darren is alive. He’s a plumber in Swindon. He’s furious.', 'The caretaker has turned the radiator off again “for safety”. The queue stayed for an hour anyway.'] },
        ],
      },
      {
        id: 'f-gary3', scene: { bg: 'bikeshed', cast: ['gary'] }, speaker: '',
        text: 'Gary the pigeon has set up on the bikeshed roof and is running a protection racket for the other pigeons. Any pigeon that wants the roof has to bring Gary a crisp. He has a ledger. It’s a leaf.',
        line: '',
        options: [
          { evil: 0, label: 'Leave Gary to it. Respect the hustle.', cash: 0, result: 'You nod at Gary. Gary nods back. Two businessmen. Two different roofs. For now.' },
          { evil: 1, label: 'Charge the pigeons a small landing fee too.', cash: 200, soul: -1, result: 'You charge the pigeons in crisps and sell the crisps back to Year 7s. Gary watches from the gutter, impressed and slightly threatened.' },
          { evil: 2, label: 'Take a cut of Gary’s racket. One crisp in three.', cash: 550, soul: -6, happy: -3, fanfare: ['MERGER COMPLETE!'], result: 'Gary agrees, because what else can a pigeon do. You shake hands. You shake foot. It’s awkward for both of you.', feed: ['The bikeshed pigeons look thinner. Gary looks exactly the same.'] },
          { evil: 3, label: 'Take over. Gary works for you now. Gary’s pigeons pay double.', cash: 1000, soul: -11, happy: -5, mono: 6, fanfare: ['HOSTILE TAKEOVER!', 'GARY: MIDDLE MANAGEMENT!'], result: 'Gary is demoted to middle management. He does the job well and hates every minute of it, which is how you know he’s middle management.', feed: ['A pigeon tried to unionise the bikeshed roof. Gary dealt with it. Nobody knows how. There are feathers.'] },
        ],
      },
      {
        id: 'f-drain', scene: { cast: ['year7s'] }, speaker: 'year7s',
        text: 'A Year 7 has dropped his dinner money down a drain. He is staring at the drain as if it might apologise.',
        line: 'That was my dinner. That was my whole dinner.',
        options: [
          { evil: 0, label: 'Give him £2.', cash: -200, soul: 4, result: 'He eats. He tells everyone. Nobody believes him.' },
          { evil: 3, label: 'Lend him £2 at 500%. Take his blazer as collateral. It’s raining.', cash: 1000, soul: -11, happy: -6, fanfare: ['COLLATERAL SEIZED!', '500% APR!'], result: 'He signs a napkin and hands over his blazer. He eats his chips in the rain in his shirtsleeves, and he says thank you, which is the worst part.', feed: ['The drain boy got a cold. Then a detention for “improper uniform”.', 'His mum came in about the blazer. She was told to take it up with you. Nobody knows how to take things up with you.'] },
          { evil: 2, label: 'Lend him £2. £4 back Monday.', cash: 500, soul: -5, happy: -3, fanfare: ['+£2 INTEREST!', 'NEW CUSTOMER!', 'LOAN SOLD ON: +£3!'], result: 'He signs a napkin. You sell the napkin to Biff for £3 before he’s finished his chips.', feed: ['The drain boy now owes £11. It was £2 on Tuesday.'] },
        ],
      },
      {
        id: 'f-bus', scene: { cast: ['dev'] }, speaker: 'dev',
        text: 'There is a school trip on Friday. Everybody wants the back seat of the coach. The back seat is sacred. The back seat is, as of this moment, yours.',
        line: 'Bagsy back seat!',
        options: [
          { evil: 0, label: '“First come, first served.”', cash: 0, soul: 2, result: 'The back seat goes to whoever runs fastest. As God intended.' },
          { evil: 3, label: 'Auction every seat. Standing room extra. The driver gets 10%.', cash: 1200, soul: -10, happy: -8, fanfare: ['TRANSPORT PRIVATISED!', 'STANDING ROOM ONLY!'], result: 'Every seat on the coach is auctioned. The kids who can’t pay stand in the aisle all the way to the Peak District, holding on to each other like a little human handrail.', feed: ['Four Year 8s threw up on the M1. They were standing. The driver charged them for cleaning.', 'The kid who couldn’t afford standing room went in the luggage hold. He says it was fine. He’s just a bit quieter now.'] },
          { evil: 2, label: 'Auction the back seat.', cash: 650, soul: -4, happy: -5, fanfare: ['AUCTION CLOSED!', '+£6.50!'], result: 'The back seat goes for £6.50 to a Year 8 whose dad sells conservatories. He sits there alone. It is the best day of his life.', feed: ['The coach smelled of Monster Munch and resentment.'] },
        ],
      },
      {
        id: 'f-topup', scene: { cast: ['penny'] }, speaker: 'penny',
        text: 'Mobile phones have arrived at St. Jude’s. Everyone has a Nokia. Nobody has credit.',
        line: 'You’re not going to sell people fake top-up cards, are you?',
        options: [
          { evil: 0, label: '“Course not.”', cash: 0, soul: 2, result: 'You don’t. Penny seems relieved. Her relief costs you about seven quid.' },
          { evil: 3, label: 'Fake top-up codes, then a helpline for when they don’t work. 50p a minute.', cash: 1200, soul: -11, happy: -7, fanfare: ['DIGITAL PRODUCTS!', 'PREMIUM HELPLINE!'], result: 'The helpline is Biff, under a coat, in a cupboard. He has been told to say “have you tried turning it off and on again” and then nothing. He does it perfectly.', feed: ['A Year 9 spent his whole birthday money on the helpline. Biff says he was a very nice boy and they talked about dogs.', 'Your nan has started getting calls about her Lotto numbers. She thinks she’s famous.'] },
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
        id: 'f-billy', scene: { cast: ['billy'] }, speaker: 'billy',
        text: 'Billy is back. He’s sixteen, visiting from Leicester, being shown round his old school by his nan. He’s tall now. He has a moustache that works. He doesn’t recognise you.',
        line: 'Sorry, do I know you? I used to go here when I was little. I was always crying, apparently. Can’t remember why.',
        options: [
          { evil: 0, label: '“It’s me. Tuck. I’m sorry. About the dragon. About all of it.”', cash: 0, result: 'Billy looks at you for a long time. Then he laughs. “The dragon! I’d forgotten the dragon.” He hadn’t. You can tell he hadn’t. He shakes your hand anyway.' },
          { evil: 1, label: 'Sell him a guided tour of the school.', cash: 3000, soul: -1, result: 'You show Billy the bench where he cried. He says “huh”, quietly, and sits on it for a while.' },
          { evil: 2, label: 'Sell him a Holo-Dragon. Mint condition. £60.', cash: 6000, soul: -7, happy: -4, fanfare: ['COLLECTOR’S ITEM!'], result: 'Billy buys the Holo-Dragon. He holds it up to the light and goes very still. He doesn’t know why he wants it so badly. You do.', feed: ['Billy keeps the Holo-Dragon in his wallet, behind his bus pass.'] },
          { evil: 3, label: 'Sell him the Holo-Dragon. It’s his Holo-Dragon. Make him bid against Kyle.', cash: 12000, soul: -15, happy: -6, fanfare: ['AUCTION WON!', 'SOLD BACK TO OWNER!'], result: 'Kyle bids £80 out of spite. Billy bids £120 out of something he can’t name. He wins. He walks out holding his own card. His nan asks if he’s all right. He says he’s fine.', feed: ['Billy’s nan rang the school to ask what happened. Nobody could tell her.', 'Kyle has added “Auctioneer” to his business card.'] },
        ],
      },
      {
        id: 'f-prom', scene: { cast: ['sixthformer'] }, speaker: 'sixthformer',
        text: 'The Sixth Form prom is in a fortnight. The theme is “Enchantment Under the Sea”. The budget is £4 and a roll of blue crepe paper.',
        line: 'Can you help? We were going to do a starfish out of a pizza.',
        options: [
          { evil: 0, label: 'Help them make the pizza starfish.', cash: 0, result: 'The pizza starfish is magnificent and smells of pizza. Everyone agrees it’s the best prom in the history of St. Jude’s. Nobody can afford any other prom, so this is technically true.' },
          { evil: 1, label: 'Sell them decorations at cost.', cash: 3000, soul: -1, result: 'The hall looks like the bottom of the sea, if the sea was mostly crepe paper. It’s lovely.' },
          { evil: 2, label: 'Sponsor it. “Enchantment Under the Volt-Juice™”.', cash: 7000, soul: -7, happy: -6, fanfare: ['EVENT SPONSORED!'], result: 'Voltage Vince is the DJ. He only plays the jingle. Nobody can dance to it, so everyone does a sort of nervous hop.', feed: ['Prom photos have Vince in the background of every single one, giving a thumbs-up.'] },
          { evil: 3, label: 'Sell prom tickets. Then sell tickets to the after-party. It’s the same room.', cash: 12000, soul: -14, happy: -9, fanfare: ['SOLD TWICE!', 'VIP AREA: A CHAIR!'], result: 'At ten o’clock, Biff makes everyone leave the hall, waits a minute, and lets them back in for £10. The VIP area is a chair. The chair sells for £30.', feed: ['Three couples broke up over the VIP chair.', 'Somebody’s dad drove three hours to pick them up from the after-party, which was in the room they were already in.'] },
        ],
      },
      {
        id: 'f-employee', scene: { cast: ['vince'] }, speaker: 'vince',
        text: 'Voltage Vince has been nominated for Employee of the Month. He’s the only employee. He’s also the only nominee. He’s very nervous. He’s written a speech on the inside of the can.',
        line: 'If I win, Mr Tuck, I’d like to thank the can. And me mam. And the can.',
        options: [
          { evil: 0, label: 'Give him the award. Let him read the speech.', cash: 0, result: 'Vince reads the speech from inside the can. It’s mostly muffled. The bit you can hear is “and me mam”. Everyone stands up. Vince cries, which you can hear, and which echoes.' },
          { evil: 1, label: 'Give him the award. Charge for the ceremony.', cash: 3000, soul: -1, result: 'Tickets to Vince’s awards ceremony sell well. It’s the kind of thing people say they were there for, later.' },
          { evil: 2, label: 'Make him pay for his own nomination.', cash: 7000, soul: -7, happy: -4, fanfare: ['NOMINATION FEE!'], result: 'Vince pays the nomination fee in coins from somewhere inside the can. They are warm. You don’t ask.', feed: ['Vince has been saving up for next month’s nomination. He’s stopped eating, which, for Vince, is hard to tell.'] },
          { evil: 3, label: 'Give it to Gary instead. Charge Vince for a seat at the ceremony.', cash: 12000, soul: -14, happy: -6, fanfare: ['SURPRISE WINNER!', 'GARY™!'], result: 'Gary accepts Employee of the Month in his little tie. He says nothing, which is a better speech than most. Vince claps from the back row, which he paid for.', feed: ['Vince has taped his speech to the inside of the can, where he’ll see it every day.', 'Gary’s portrait now hangs in reception. It’s a better portrait than the Head’s.'] },
        ],
      },
      {
        id: 'f-council3', scene: { cast: ['council'] }, speaker: 'council',
        text: 'The Man from the Council is back. He is measuring your profits with a tape measure. It goes out of the door, down the corridor and across the road. He looks worried. He looks impressed.',
        line: 'This is a very long profit, young man. I’m going to have to write it down in two places.',
        options: [
          { evil: 0, label: 'Show him the real books. All of them.', cash: 0, result: 'He reads the books on the spot, in total silence, for forty minutes. Then he takes off his glasses and says, very quietly, “oh, son.” He doesn’t write anything down. He just leaves.' },
          { evil: 1, label: 'Pay him a consultation fee to go away.', cash: 3000, soul: -1, result: 'You pay him to stop measuring. He takes the money and keeps measuring anyway, more slowly, out of principle.' },
          { evil: 2, label: 'Sell him a measuring service. You measure things for the council now.', cash: 7000, soul: -7, happy: -4, fanfare: ['PUBLIC CONTRACT!'], result: 'You win the council measuring contract. Biff measures things. Everything Biff measures is “about a metre”. The council is delighted.', feed: ['The council has declared every road in town “about a metre long”.'] },
          { evil: 3, label: 'Send him to measure Maya’s Greggs. Fine her for the length of her queue.', cash: 12000, soul: -15, happy: -8, fanfare: ['COMPETITOR FINED!', 'REGULATORY CAPTURE!'], result: 'Maya’s Greggs is fined for an “excessively long queue”. The queue was long because the sausage rolls are good. You collect the fine on the council’s behalf.', feed: ['Maya had to let one of her staff go to pay the fine. It was the Year 12 who worked at Greggs. She works for you now.'] },
        ],
      },
      {
        id: 'f-josh2', scene: { cast: ['josh'] }, speaker: 'josh',
        text: 'Josh wants to run for Head Boy again. He is already Head Boy. He wants to be more Head Boy. He has made a campaign poster. It just says MORE JOSH.',
        line: 'People want more Josh, Tuck. I can feel it. I can feel it in my teeth.',
        options: [
          { evil: 0, label: '“You’re already Head Boy, Josh. You’re enough Josh.”', cash: 0, result: 'Josh thinks about this for a long time. Then he hugs you. It smells of chalk. He takes the poster down and keeps it under his bed.' },
          { evil: 1, label: 'Sell him some campaign badges.', cash: 3000, soul: -1, result: 'MORE JOSH badges appear on every lapel. Nobody voted for this. Nobody minds. Josh is everywhere now, and he’s very happy about it.' },
          { evil: 2, label: 'Run his campaign. Charge him a management fee.', cash: 7000, soul: -7, happy: -4, fanfare: ['CAMPAIGN MANAGER!'], result: 'Josh wins Head Boy by a landslide, against nobody. He thanks you in his speech. Then he eats the speech.', feed: ['Josh is now Head Boy twice. Nobody knows what the second one does. It has its own badge.'] },
          { evil: 3, label: 'Run him against himself. Charge both campaigns.', cash: 12000, soul: -14, happy: -6, fanfare: ['BOTH SIDES OWNED!', 'DEMOCRACY™!'], result: 'MORE JOSH runs against LESS JOSH. Both are Josh. Both are your clients. The debate is Josh, alone on stage, arguing with a mirror. He loses. He also wins. He cries either way.', feed: ['Josh hasn’t spoken to himself since the election.', 'The student council has been suspended “until Josh is feeling better”.'] },
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

  /* ------------------------------------------------------------------ */
  /* Follow-ups: IOUs and other things that come back on a later day.   */
  /* An option with `follow: 'id'` schedules one (after: days, def. 1). */
  /* ------------------------------------------------------------------ */
  const followUps = {
    'billy-iou': {
      scene: { cast: ['billy'], bench: true }, speaker: 'billy',
      text: 'Billy finds you at break. He has been saving. He opens his hand, very slowly, like a magician who isn’t sure the trick will work: 38p, a Wotsit, and a small, very clean stone.',
      line: 'That’s nearly 50p, Tuck. The stone’s nice. I washed it.',
      options: [
        { evil: 0, label: '“Keep it, Billy. We’re square.”', cash: 0, result: 'Billy closes his hand around the 38p and the Wotsit and the stone and looks at you as if you’ve done a magic trick. You haven’t been paid. You feel this very precisely, somewhere behind your ribs.' },
        { evil: 1, label: 'Take the 38p. Let him keep the stone.', cash: 38, result: 'Billy keeps the stone. He holds it all afternoon. It’s the only thing he owns that you haven’t had.' },
        { evil: 2, label: 'Take the lot. Stone included.', cash: 50, soul: -6, happy: -3, fanfare: ['DEBT SETTLED!'], result: 'You take the money, the Wotsit and the stone. Billy says “thanks, Tuck” as if you’ve done him a favour. You put the stone in the jumper with the snails.', feed: ['Billy’s mum asked where his special stone went. Billy said he “invested it”.'] },
        { evil: 3, label: 'Take the lot. Add 20p for being late. He can owe you that.', cash: 50, soul: -12, happy: -5, follow: 'billy-iou2', fanfare: ['LATE FEE APPLIED!'], result: 'Billy nods. He writes a new IOU on the back of the old one. I.O.U. 20P. STILL LOVE BILLY. The “still” is the worst part.', feed: ['Billy has stopped buying anything at all. He walks past the tuck stall with his hands in his pockets, holding the 20p he owes you.'] },
      ],
    },
    'billy-iou2': {
      scene: { cast: ['billy'], bench: true }, speaker: 'billy',
      text: 'Billy is back with the 20p. It’s in 1p coins, in a sandwich bag, labelled TUCK. Some of the coins are from 1971. He has clearly had to go into his nan’s change jar.',
      line: 'That’s everything now, isn’t it? We’re done now? I can have snails again?',
      options: [
        { evil: 0, label: '“We’re done. Have a snail. On me.”', cash: 0, result: 'You give Billy a snail. He eats it very slowly, staring at you, as though it might be a trap. It isn’t. He doesn’t believe that. He’s eight and he’s learned.' },
        { evil: 1, label: 'Take the 20p. Call it square.', cash: 20, result: 'Billy watches you count it. All twenty. Then he walks away very lightly, like a boy who’s taken off a heavy coat.' },
        { evil: 2, label: 'Take it. Remind him the snails have gone up.', cash: 20, soul: -6, result: 'Billy nods as if he expected it. He doesn’t ask how much. He just goes back to his bench.' },
        { evil: 3, label: 'Take it. Sell what’s left of his debt to Kyle.', cash: 60, soul: -12, happy: -4, fanfare: ['DEBT SECURITISED!'], result: 'There isn’t any debt left. You sell Kyle a piece of paper that says there is. Kyle collects from Billy for the rest of term. Billy pays. He doesn’t know what else to do.', feed: ['Kyle has added “Debt Recovery” to his business card. Billy is his only client.'] },
      ],
    },
    'jade-sub': {
      after: 2,
      scene: { cast: ['jade'] }, speaker: 'jade',
      text: 'It’s Jade’s wound-maintenance renewal day. Her knee healed on Wednesday. There is no wound. There is a slightly paler bit of knee, which she points at, nervously, in case it counts.',
      line: 'Mum says it’s just a knee now. Do I still have to pay? I’ve still got the scab. I kept it. It’s in a tissue.',
      options: [
        { evil: 0, label: 'Cancel the contract. Tell her the knee is magnificent.', cash: 0, result: 'Jade looks at her knee as if seeing it for the first time. “It is, isn’t it,” she says. She runs off with both knees, at full speed, for the first time in a week.' },
        { evil: 1, label: 'Final payment, and we’re done.', cash: 30, result: 'Jade pays her last 10p three times over to be sure. She asks for a receipt. You draw her one. It has a dinosaur on it.' },
        { evil: 2, label: 'Renew. Scabs need monitoring.', cash: 110, soul: -6, happy: -4, follow: 'jade-sub2', fanfare: ['RENEWED!'], result: 'Jade signs again. You inspect the scab in its tissue with a very serious face. You say “hmm”. She pays for the hmm.', feed: ['Jade has been walking very carefully, so as not to disturb a knee that is completely fine.'] },
        { evil: 3, label: 'Upgrade her to Gold Knee Cover. Both knees. Elbows extra.', cash: 180, soul: -12, happy: -6, follow: 'jade-sub2', fanfare: ['UPSOLD!', 'GOLD KNEE COVER™!'], result: 'Jade is now insured against all four of her joints. You give her a gold star sticker to wear on each one so other people know she’s covered. She is very proud.', feed: ['Jade’s mum found four gold stars and a payment schedule in her book bag. She thinks it’s a maths project. She’s helping.'] },
      ],
    },
    'jade-sub2': {
      after: 2,
      scene: { cast: ['jade'] }, speaker: 'jade',
      text: 'Jade has fallen over on purpose. Properly. On the hopscotch. She thinks if she’s going to be paying for a knee, she might as well use it.',
      line: 'Look! Look, it’s bleeding! Is this covered? Tell me this is covered.',
      options: [
        { evil: 0, label: 'Get her a plaster. Free. End the contract.', cash: 0, result: 'You stick a plaster on Jade’s knee. A free one. It has a dinosaur on it. She stares at it as if it’s the first free thing she’s ever been given. It might be.' },
        { evil: 1, label: 'Claim approved. Final payment.', cash: 30, result: 'Jade pays her last instalment and you give her a plaster. She seems to feel it’s been worth it, which is somehow worse.' },
        { evil: 2, label: 'Claim denied. Small print. Renew anyway.', cash: 110, soul: -6, happy: -4, result: 'There is no small print. You write some, quite small, while she watches. She renews anyway, because she’s already in this deep.', feed: ['Jade has stopped playing hopscotch. She says she has “a bad knee”. She has a perfectly good knee.'] },
        { evil: 3, label: 'Claim denied. Charge her an excess for using it.', cash: 170, soul: -12, happy: -6, fanfare: ['EXCESS APPLIED!'], result: 'Jade pays an excess on a knee you made up, for a wound she gave herself, under a policy you wrote in crayon. She says thank you. They always say thank you.', feed: ['Jade’s knee is fine. Jade is not fine. Nurse Pat has noticed.'] },
      ],
    },
    'priya-credit': {
      scene: { cast: ['priya'] }, speaker: 'priya',
      text: 'Priya brings you the 30p she owes for the fourth box in an envelope. On the front it says SORRY. On the back it says I DIDN’T GET A WAGON WHEEL BUT I STILL OWE IT.',
      line: 'I saved my bus money. I walked. It’s fine. It’s only two miles. It’s fine.',
      options: [
        { evil: 0, label: '“Keep it. There was never a Wagon Wheel.”', cash: 0, result: 'Priya looks at you. Then at the envelope. Then she says “I know,” very quietly, and puts it back in her bag, and you both stand there with that for a bit.' },
        { evil: 1, label: 'Take the 30p.', cash: 30, result: 'You take the envelope. It is warm. She has been holding it all morning.' },
        { evil: 2, label: 'Take the 30p. Plus 15p interest.', cash: 60, soul: -6, happy: -4, fanfare: ['INTEREST!'], result: 'Priya doesn’t have 15p. She gives you a pencil sharpener shaped like a strawberry and promises it’s worth at least 15p. It smells like a strawberry. It’s worth 15p.', feed: ['Priya has started walking to school every day. Her mum thinks she’s “getting fit”.'] },
        { evil: 3, label: 'Take it, and sell her another box on credit. This one might be the one.', cash: 100, soul: -12, happy: -6, follow: 'priya-credit', fanfare: ['REPEAT CUSTOMER!', 'CREDIT EXTENDED!'], result: 'She buys another box on credit. Carrot. She looks at the carrot for a long time. She says “next time, though,” and means it, and you write it down.', feed: ['Priya has drawn up a little chart of every box she’s bought. Every line says CARROT. She’s still filling it in.'] },
      ],
    },
  };

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

  /* ------------------------------------------------------------------ */
  /* The tuck shop: things to spend spare money on at bedtime.          */
  /* Each makes every deal pay more (`mult`). The player is never told  */
  /* that the world quietly scales dues and prices by the same amount,  */
  /* so all an upgrade really does is cost them. `cost` is in pence.    */
  /* ------------------------------------------------------------------ */
  const upgrades = {
    1: [
      { id: 'u-jumper', name: 'A second jumper', cost: 240, mult: 1.15, text: 'Nick your little brother’s school jumper. Twice the pockets. Snails stay warmer, and it turns out people will pay for a warm snail.', feed: 'Your little brother went to school in his pyjama top. He says he’s “trying a look”.' },
      { id: 'u-ribena', name: 'Water down the Ribena', cost: 300, mult: 1.15, text: 'One bottle becomes four. Nobody will notice, apart from Callum, and nobody listens to Callum.', feed: 'Callum says the Ribena tastes “thin”. He’s drinking twice as much to make up for it.' },
      { id: 'u-premium', name: 'Premium snails', cost: 360, mult: 1.15, text: 'Write PREMIUM on the snail bag in biro. Same snails. Better snails.', feed: 'Everybody agrees the Premium Snails taste more premium. Nobody can say how.' },
      { id: 'u-gold', name: 'Gold snails', cost: 450, mult: 1.1, text: 'Colour some snails in with a yellow felt tip and sell them as “gold”. The felt tip is not food-safe. Neither are the snails, really.', feed: 'Three Year 3s have yellow tongues. They show everybody. They think it means they’re rich.' },
      { id: 'u-hat', name: 'A SECURITY hat for Biff', cost: 550, mult: 1.1, text: 'A baseball cap that says SECURITY in Tipp-Ex. Biff wears it like a crown. Biff starts saying “I’m going to have to ask you to leave” to people who aren’t anywhere.', feed: 'Biff asked a dinner lady to leave the dinner hall. She left.' },
      { id: 'u-board', name: 'The PTA noticeboard', cost: 650, mult: 1.1, text: 'Rent the PTA noticeboard from the PTA, who aren’t sure they own it, and fill it with adverts for yourself.', feed: 'The PTA noticeboard now just says TUCK. The bake sale has had to advertise on a car.' },
    ],
    2: [
      { id: 'u-pockets', name: 'Eleven more pockets', cost: 1800, mult: 1.15, text: 'Biff’s nan sews eleven extra pockets into the coat. She thinks it’s for a school play. It is, in a way.', feed: 'Biff’s nan asked how the play is going. Biff said “great”. Biff has never seen a play.' },
      { id: 'u-laminate', name: 'Laminated prices', cost: 2400, mult: 1.15, text: 'Laminate the price list. You can argue with paper. You cannot argue with lamination.', feed: 'A Year 8 tried to argue with the laminated price list. The lamination won.' },
      { id: 'u-biffer', name: 'Hire Biffer', cost: 3000, mult: 1.15, text: 'Biff’s cousin Biffer, for collections. Nobody is sure Biffer isn’t just Biff in a different hat.', feed: 'Biff and Biffer have never been seen in the same room. Biffer is also on a daily rate.' },
      { id: 'u-locker', name: 'A second locker', cost: 3600, mult: 1.1, text: 'And then a third. Then the one belonging to a Year 9 who moved to Wales and nobody told the locker.', feed: 'The Year 9 who moved to Wales has come back for his PE kit. It’s been sold.' },
      { id: 'u-pager', name: 'A pager', cost: 4200, mult: 1.1, text: 'Nobody has your number. Nobody has ever paged you. It’s not about being paged. It’s about the message it sends.', feed: 'Your pager went off for the first time. It was a wrong number. You charged them for it.' },
      { id: 'u-oatbars', name: 'Tuck’s Oaty Bar factory', cost: 5000, mult: 1.1, text: 'Biff’s nan makes Tuck’s Oaty Bars in her kitchen. She thinks they’re for a church raffle. There is no church raffle. There is a church, but it is very confused.', feed: 'The vicar has started buying Tuck’s Oaty Bars. He thinks he’s supporting the raffle.' },
    ],
    3: [
      { id: 'u-platinum', name: 'Volt-Juice™ Platinum', cost: 24000, mult: 1.15, text: 'The same can, with a gold sticker and a price that suggests the gold is real.', feed: 'A Year 10 is saving up for Volt-Juice Platinum. He has stopped buying lunch to afford it.' },
      { id: 'u-loyalty', name: 'A loyalty scheme', cost: 30000, mult: 1.15, text: 'Ten stamps gets you a stamp. The stamp is very glossy.', feed: 'Somebody completed a loyalty card. They got a stamp. They cried a bit, from happiness, they think.' },
      { id: 'u-consultant', name: 'A consultant', cost: 36000, mult: 1.15, text: 'Josh has eaten a book about consultancy. He now consults. Mostly he says “synergy” and points at things.', feed: 'Josh pointed at the radiator and said “synergy”. It has not been switched on since.' },
      { id: 'u-jingle', name: 'A second jingle', cost: 42000, mult: 1.1, text: 'The first jingle is for the product. The second jingle is for the first jingle.', feed: 'Both jingles now play over each other at break. A Year 7 has started speaking only in jingle.' },
      { id: 'u-vince2', name: 'A second Vince', cost: 50000, mult: 1.1, text: 'A second man in a second can. Nobody has seen either of them out of the cans. Nobody has seen them together.', feed: 'There are two Vinces now. They stand at opposite ends of the quad and never look at each other.' },
      { id: 'u-garysalary', name: 'Put Gary on salary', cost: 60000, mult: 1.1, text: 'A full salary, a pension and a company car for Gary. The car is a shoebox. He sits in it every morning.', feed: 'Gary has started arriving late and leaving early. He’s management now.' },
    ],
  };

  T.content = { people, tuckLook, acts, story, milestones, fillers, idles, freezeEscalation, finalIdles, ending, adDisclaimers, awkward, interludes, evenings, upgrades, followUps };
})();
