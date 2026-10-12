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
    farmer: { name: 'Farmer Hargreaves', skin: '#e8b88f', shirt: '#8c3b2a', trousers: '#4d5a36', coat: '#5a6a3a', hair: '#9a9a9a', hairStyle: 'bald', s: 1.35, adult: true, mood: 'neutral' },
    ashley: { name: 'Ashley in Year 9', skin: '#e8b88f', shirt: '#ffffff', trousers: '#2b2f3a', blazer: '#1f2f6b', tie: '#b71c1c', hair: '#5a3a1a', hairStyle: 'long', s: 1.02, mood: 'tired' },
    thibault: { name: 'Thibault (on exchange)', skin: '#f3d2b3', shirt: '#2a6ad2', trousers: '#5a594a', hair: '#2b1b10', hairStyle: 'side', s: 0.98, mood: 'happy' },
    intern: { name: 'Oliver, Work Experience', skin: '#8d5a3b', shirt: '#ffffff', trousers: '#3a3a44', blazer: '#3a3a44', tie: '#5a6fd6', hair: '#1d1410', hairStyle: 'side', s: 0.95, mood: 'happy', lanyard: true },
    whitlock: { name: 'Mrs Whitlock, Headteacher', skin: '#f3d2b3', shirt: '#9a7fb8', trousers: '#3b3f46', skirt: true, hair: '#c8c8c8', hairStyle: 'bob', s: 1.3, adult: true, mood: 'neutral', glasses: true, badge: true },
    gideon: { name: 'Gideon, Theatre Company', skin: '#e8b88f', shirt: '#1a1a1a', trousers: '#1a1a1a', hair: '#6b4a2b', hairStyle: 'pony', s: 1.3, adult: true, mood: 'happy', moustache: true },
    squatch: { name: 'The Squashquatch', squatch: true, s: 1 },
    desmond: { name: 'Desmond, Solicitor (Year 4)', skin: SKIN[1], shirt: '#ffffff', trousers: '#5b5f66', tie: '#2a4a8a', hair: '#3a2a1a', hairStyle: 'side', s: 0.82, mood: 'smug', glasses: true, briefcase: true },
    desmond17: { name: 'Desmond (still not a solicitor)', skin: SKIN[1], shirt: '#ffffff', trousers: '#222', blazer: '#2c2c2c', tie: '#2a4a8a', hair: '#3a2a1a', hairStyle: 'side', s: 1.1, mood: 'smug', glasses: true, briefcase: true },
    pell: { name: 'Mr Pell, Supply', skin: SKIN[0], shirt: '#e8e0c8', trousers: '#6a5a40', blazer: '#8a6a3a', patches: true, hair: '#b0a890', hairStyle: 'bald', s: 1.35, adult: true, mood: 'tired', glasses: true, flask: true },
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
      target: 510,
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
      target: 4250,
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
        { text: 'One morning Tuck wakes up and everything is flat. Not sad. Flat. Everyone’s arms are much longer than they were, and their heads are much smaller, and they all seem delighted about it. His mum waves goodbye with an arm that reaches the end of the drive. Biff has a mission statement. Nobody mentions it.', scene: { bg: 'sixth', cast: [], style: 'flat' }, glitch: true },
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
      style: 'flat',
      bg: 'sixth',
      target: 51000,
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
        { text: 'There is a jingle. There is confetti that you paid for, falling from a ceiling that you own. Somebody hands you a giant novelty cheque. It is made out to you, from you.', scene: { bg: 'office', cast: ['crane'], style: 'flat' } },
        { text: 'Meanwhile, in lost property, under a PE bag that nobody has claimed since 2003, somebody finds a ledger.', scene: { bg: 'corridor', cast: [], style: 'flat' } },
        { text: 'The confetti is still coming down when the picture cuts out.', scene: { bg: 'sixth', cast: [], style: 'flat' } },
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
        "Monday. It's raining. It has always been raining. You just couldn't see it from inside the brochure.",
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
        { type: 'milestone', label: 'Hand it over.', cost: 510, fanfare: ['MEGA-COATED TRENCH COAT!', 'SECURITY HIRED: BIFF!'], result: 'You put on the coat. It drags on the ground. Biff falls in behind you like a weather system. Primary school is over. You are ready for the big leagues.' },
      ],
    },
    2: {
      id: 'monitors',
      scene: { bg: 'bikeshed', cast: ['gavin'] },
      speaker: 'gavin',
      text: 'The Senior Hall Monitors control the bikeshed: the only covered, unsupervised, teacher-blind square metre at St. Jude’s. Head Monitor Gavin wears his sash like a war medal.',
      line: 'I’ve been watching your pockets, Tucker. That’s the price. Don’t ask what the price is. That’s the price, and the bikeshed is yours. I didn’t see anything. I never see anything. That’s the job.',
      options: [
        { type: 'milestone', label: 'Hand it over.', cost: 4250, fanfare: ['HALL MONITORS BRIBED!', 'EXCLUSIVE TRADING HUB SECURED!'], result: 'Gavin pockets the money and adjusts his sash. From now on, nothing happens at the bikeshed, officially. Unofficially, everything does.' },
      ],
    },
    3: {
      id: 'contract',
      scene: { bg: 'office', cast: ['crane'] },
      speaker: 'crane',
      text: 'The Vice-Principal, Mr Crane, has a proposal. Five years. Exclusive commercial rights to every vending machine, fountain, photocopier and tuck shop on campus. He has brought an envelope. It is exactly the right size. He doesn’t say what for.',
      line: 'Just sign here, Tucker. And here. And initial there. Lovely pen, isn’t it?',
      options: [
        { type: 'milestone', label: 'Fill the envelope. Sign.', cost: 51000, fanfare: ['5-YEAR EXCLUSIVE CONTRACT!', 'MARKET MONOPOLY: 100%!', 'TUCK ENTERPRISES™ WINS!'], result: 'You sign. Mr Crane shakes your hand. Somewhere a jingle plays. Confetti that you paid for falls from a ceiling that you own. You have won capitalism. You are sixteen.' },
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
        id: 'f-callum4', series: 'callum', step: 4, scene: { cast: ['callum'] }, speaker: 'callum',
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
      {
        id: 'f-squash1', series: 'squash', step: 1, scene: { cast: ['year2'] }, speaker: 'year2',
        text: 'Overnight, something has walked across the playground in enormous sticky orange footprints. They come in through the gate, cross to the fence by the Year 4 classroom, stand there for a very long time, and leave in the direction of the corner shop. The whole playground smells of Robinsons.',
        line: 'I saw it by the bins. It was taller than Mr Dobson. You could see through it. There were bits in it.',
        options: [
          { evil: 0, label: 'Walk her over to the footprints. Hold her hand while she looks.', cash: 0, result: 'You stand in a footprint together. It is cold and slightly tacky. She lifts her shoe out and it makes a noise like a kiss. “It’s sad,” she says. Footprints aren’t sad, you tell her. These ones are, a bit.' },
          { evil: 1, label: 'Rope off the best footprint. 5p a look.', cash: 30, soul: -1, result: 'Six Year 2s pay 5p each to stare into the footprint. One of them licks it. “Orange,” he reports, gravely, and the queue goes very quiet.' },
          { evil: 2, label: 'Sell “Squashquatch repellent”. It’s tap water in a Ribena bottle. 20p.', cash: 110, soul: -6, happy: -4, fanfare: ['FEAR-BASED MARKETING!', 'PRODUCT-MARKET FIT!'], result: 'You explain that water makes squash weaker. This is, annoyingly, true. Half of Year 2 spend lunch flicking tap water at the fence. A dinner lady slips over and lies there, looking at the sky, for some time.', feed: ['A Year 2 sprinkled her whole bedroom with tap water before bed. Her mum thinks she has joined something.', 'The footprints by the fence are a paler orange this morning, as if something stood in the wet and waited anyway.'] },
          { evil: 3, label: 'Make more footprints with a bottle of squash. Sell guided tours.', cash: 200, soul: -12, happy: -7, fanfare: ['MANUFACTURED DEMAND!', 'CRYPTID TOURISM!'], result: 'By lunch there are footprints on the slide, the bins and the inside of the Year 2 toilets. You lead a tour of them at 10p a head. Halfway round you notice a set of footprints you didn’t make. You keep walking. You charge for that one too.', feed: ['Four Year 2s now refuse to drink squash. They say it’s “looking at them”.', 'There is a fresh footprint on the roof of the mobile classroom. You didn’t do that one either. It is pointing at the Year 4 window.'] },
        ],
      },
      {
        id: 'f-squash2', series: 'squash', step: 2, scene: { cast: ['squatch'] }, speaker: 'squatch',
        text: 'At afternoon break there is something seven feet tall at the fence, and it is orange. It is made entirely of undiluted orange squash. It sloshes when it breathes. You can see the railings through it, and bits of pulp drift about inside it like slow thoughts.',
        line: 'Excuse me… Do you know… a boy… called Callum? He’d be… about ten now. I only… popped out… for a minute.',
        options: [
          { evil: 0, label: 'Tell it Callum’s in Year 4. He’s nice. He’s purple.', cash: 0, result: 'The Squashquatch goes very still. A bit of pulp sinks slowly to the bottom of it. “Purple,” it says, at last. “Of course… he is.” Then it sloshes off to think about it, leaving a trail like spilled sunset.' },
          { evil: 1, label: 'Tell it which classroom. 20p.', cash: 25, soul: -1, result: 'It reaches inside itself and brings out 25p, because it has forgotten what 20p looks like. The coins are warm and smell of a long car journey. It thanks you so slowly that the bell goes in the middle.' },
          { evil: 2, label: 'Sell it a map to Callum. 10p a page. It’s twelve pages.', cash: 120, soul: -6, happy: -4, fanfare: ['PAY PER PAGE!', 'PREMIUM CONTENT!'], result: 'Each page is one bit of the playground, drawn in felt tip, out of order. It pays for every page by reaching into itself. On the eleventh go it brings out a soggy shop receipt instead. You can read one word on it: ORANGE. It looks at the receipt for a long time, then puts it back.', feed: ['The Squashquatch spent the night walking the twelve pages in the wrong order. It ended up at the bins, where it started.', 'There is a small orange puddle by the fence this morning, about the size of a sigh.'] },
          { evil: 3, label: 'Tell it Callum moved to Leicester. Sell it a bus ticket. Any bus.', cash: 205, soul: -12, happy: -6, fanfare: ['ONE-WAY FARE!', 'TRAVEL PARTNER!'], result: 'It pays with everything inside it: £2.05 in old 20ps, a button, and a car key on a keyring that says WORLD’S BE. The rest of the keyring has dissolved. You give it a bus ticket you found on the floor. It walks to the stop and waits there, sloshing, very patiently.', feed: ['The Squashquatch rode the number 12 to the end of the line and back, eleven times. The driver says it sat at the back and cried, a bit, into itself.', 'Callum found an orange footprint outside his classroom this morning and stood in it for the whole of break, for no reason he could explain.'] },
        ],
      },
      {
        id: 'f-squash3', series: 'squash', step: 3, scene: { cast: ['squatch', 'callum'], rain: true }, speaker: 'squatch',
        text: 'It is drizzling. The Squashquatch is sheltering in the kitchen doorway at one end of the playground. Callum is under the canopy at the other end, drinking a carton of Ribena. Between them is forty metres of open tarmac and rain. Every drop that lands on the Squashquatch makes it slightly less itself.',
        line: 'That’s him. I know it’s… him. He’s got… my… He’s got… lovely ears. You’ve got… a jumper. Haven’t you.',
        options: [
          { evil: 0, label: 'Hold your jumper over it. Walk it across.', cash: 0, result: 'You walk it across under your jumper, very slowly, sloshing. Ten metres from the canopy the bell goes, and Year 4 floods indoors like a tide going out. Callum goes with it. The Squashquatch stands there for a while, then gives you your jumper back, folded very neatly, and orange.' },
          { evil: 1, label: 'Rent it the jumper. 20p.', cash: 30, soul: -1, result: 'It pays 30p, to be safe. Halfway across, Mr Dobson mops up its footprints behind it, and it forgets which way it was going. By the time it remembers, Callum has gone in for Numeracy.' },
          { evil: 2, label: 'Rent it the jumper by the metre. Money up front.', cash: 110, soul: -6, happy: -5, fanfare: ['METERED ACCESS!', 'USAGE-BASED PRICING!'], result: 'It pays for thirty metres. It needed forty. At thirty metres you take the jumper back, as agreed. It stands in the drizzle ten metres short, getting paler, and waves. Callum waves back. He thinks it’s the Robinsons mascot.', feed: ['The Squashquatch went home a noticeably weaker orange. About one part squash to two parts weather.', 'Callum told his mum the Robinsons man waved at him. His mum went quiet, put the kettle on, and didn’t drink it.'] },
          { evil: 3, label: 'Tell Callum the orange man is from the council and wants his Ribena. Rent him a hiding place.', cash: 200, soul: -12, happy: -8, fanfare: ['THREAT MONETISED!', 'SAFE ROOM RENTAL!'], result: 'Callum pays £2 to hide behind the crash mats in the PE cupboard. The Squashquatch crosses the playground in the rain, alone, and arrives at the canopy as thin as weak tea. It looks at the empty carton Callum left behind for a long time. Then it picks it up and takes it with it.', feed: ['Callum stayed in the PE cupboard until home time. He has started checking under his bed for oranges.', 'Somebody saw the Squashquatch at the bus stop, holding a Ribena carton very carefully, like a photograph.'] },
        ],
      },
      {
        id: 'f-desmond1', series: 'desmond', step: 1, scene: { cast: ['desmond', 'year2'] }, speaker: 'desmond',
        text: 'Desmond in Year 4 is a solicitor. He has glasses, a clip-on tie and a briefcase containing a single satsuma. He hands you a laminated card: DESMOND. SOLICITOR. ONE PANINI STICKER PER HOUR. He is suing the climbing frame.',
        line: 'My client fell off it on Tuesday. The climbing frame has shown no remorse whatsoever. I need someone to fund the litigation. I understand you have a jumper.',
        options: [
          { evil: 0, label: 'Ask his client if he’s all right.', cash: 0, result: 'The client says he’s fine, actually, it was only his elbow, and shows you. It’s a good elbow. Desmond closes his briefcase with a sigh and eats the satsuma, which he says he was saving for a settlement.' },
          { evil: 1, label: 'Sell Desmond a witness statement. You saw it all. 30p.', cash: 30, soul: -1, result: 'Your statement says “he fell off it”. Desmond reads it twice and laminates it. It is the most official thing you have ever written.' },
          { evil: 2, label: 'Fund the case. You take half the damages, and the client’s snack for a week.', cash: 110, soul: -6, happy: -4, fanfare: ['LITIGATION FUNDED!', 'NO WIN, NO FEE!'], result: 'The PTA settles out of court for £2.20, mostly to make Desmond stop. You take half, plus a week of the client’s Dairylea Dunkers. The client gets a sticker that says I WAS BRAVE and the knowledge that he was right.', feed: ['The climbing frame has been wrapped in hazard tape. Year 3 stand round it at break like mourners.', 'The client eats his dry crackers in silence every break. The cheese is in your jumper.'] },
          { evil: 3, label: 'Represent the climbing frame. Countersue the client for scuffing it.', cash: 200, soul: -12, happy: -7, fanfare: ['DEFENCE RETAINED!', 'BOTH SIDES BILLED!'], result: 'You argue that the climbing frame was just standing there, minding its own business, which is true. Dinner Lady Maureen, presiding over the custard, rules that the client owes the climbing frame £2 for distress. The climbing frame doesn’t have pockets. You do.', feed: ['The client is paying the climbing frame in instalments. He apologises to it every morning on his way in.', 'Desmond lost his first case. He went home and sat in the bath in his clip-on tie.'] },
        ],
      },
      {
        id: 'f-desmond2', series: 'desmond', step: 2, scene: { cast: ['desmond'], rain: true }, speaker: 'desmond',
        text: 'It has rained for nine days, and there has been Wet Play for nine days. Desmond has filed an injunction against Wet Play on behalf of the whole of Year 4. It is written on the back of a Weetabix box and stapled to the staffroom door. He has adjusted his clip-on tie for the occasion.',
        line: 'A child has a right to fresh air, and to the big tyre. I need thirty signatures by afternoon break. My fee is one Panini sticker per hour. I have been working for nine days.',
        options: [
          { evil: 0, label: 'Sign it. Use your full name, middle one and all.', cash: 0, result: 'Desmond reads your middle name, the one you don’t tell people, and doesn’t laugh. He nods and blows on the ink. He is a professional. You would trust him with anything except the satsuma.' },
          { evil: 1, label: 'Collect the signatures for him. 1p a name.', cash: 35, soul: -1, result: 'You get thirty-five signatures, two of them from Harriet and one from Gary, who walked across the ink. Desmond accepts Gary as a witness of good character.' },
          { evil: 2, label: 'Charge Year 4 10p each to join the class action.', cash: 120, soul: -6, happy: -4, fanfare: ['CLASS ACTION!', 'MEMBERSHIP FEES!'], result: 'Thirty Year 4s pay to be plaintiffs. The injunction is granted, because Mrs Whitlock can’t read Weetabix and doesn’t want to admit it. Wet Play is banned. Year 4 are sent outside into the rain, exactly as they asked.', feed: ['Year 4 spent lunch outside in the downpour, having won. Nobody looked like they’d won.', 'The felt tips sat in their box all lunchtime, dry and unused, like a museum.'] },
          { evil: 3, label: 'Get it granted. Then sell bin-bag ponchos at the door.', cash: 200, soul: -12, happy: -7, fanfare: ['REGULATORY ARBITRAGE!', 'PONCHO MONOPOLY!'], result: 'The injunction is granted at 11:58. At 12:00 you are at the door with a roll of black bin bags and some safety scissors. Indoors is now illegal, and outdoors costs 20p. Desmond buys a poncho too. He says it’s a conflict of interest, and pays anyway.', feed: ['Thirty Year 4s stood in the rain in bin bags, on a playground they had fought for, legally.', 'Desmond caught a cold. He has filed an injunction against it.'] },
        ],
      },
      {
        id: 'f-desmond3', series: 'desmond', step: 3, scene: { bg: 'corridor', cast: ['desmond', 'year2'] }, speaker: 'desmond',
        text: 'Desmond serves you with papers outside the toilets. It is a folded sheet of sugar paper headed THE PLAYGROUND v. TUCK, with two columns of names underneath. A Year 2 is standing behind him in a borrowed tie, as lead plaintiff, trying very hard to look like a lead plaintiff.',
        line: 'My clients seek damages, an apology and, if possible, a snail each. I should warn you there is a satsuma in this briefcase, and I am not afraid to produce it.',
        options: [
          { evil: 0, label: 'Read every name out loud. Say sorry to each one.', cash: 0, result: 'It takes the whole of lunch. Two of the names are Gary. Desmond listens to all of it, then closes the briefcase very gently and says the court is satisfied. Nobody gets any money. The Year 2 shakes your hand like a tiny bank manager.' },
          { evil: 1, label: 'Point out his clients haven’t paid his fees. Claim 30p costs.', cash: 30, soul: -1, result: 'Desmond checks his records. It’s true: his clients owe him eleven Panini stickers. The case collapses under the weight of its own invoices. He pays your costs himself, quite graciously, out of the briefcase.' },
          { evil: 2, label: 'Hire Desmond away from them. Three Panini stickers.', cash: 120, soul: -6, happy: -5, fanfare: ['TALENT ACQUIRED!', 'LEGAL TEAM RETAINED!'], result: 'Desmond takes the stickers, unclips his tie, clips it back on facing the other way, and now represents you. You win. The plaintiffs pay your costs in crisps, which you sell back to them at afternoon break.', feed: ['The lead plaintiff has asked for a solicitor for his birthday. His mum thinks he means a cake.', 'Desmond has had his laminated card redone. It now has a little picture of you on it.'] },
          { evil: 3, label: 'Hire Desmond. Countersue every name on the list for wasting your time.', cash: 210, soul: -12, happy: -8, mono: 6, fanfare: ['COUNTERSUIT FILED!', 'DAMAGES AWARDED!'], result: 'Desmond reads the list back out, this time as defendants. Mr Dobson, presiding with a mop, finds for you on all counts. Forty-two children owe you 5p each for the inconvenience of having been wronged. Desmond is paid in stickers. He doesn’t look at you while he counts them.', feed: ['Desmond has stopped carrying the briefcase. The satsuma turned up in lost property, still waiting for a settlement.', 'A Year 2 paid you 5p for being on the list. He doesn’t know what list. He’s just glad it’s over.'] },
        ],
      },
      {
        id: 'f-bookfair', scene: { bg: 'corridor', cast: ['year2'] }, speaker: 'year2',
        text: 'The Book Fair has come to the school hall. There are almost no books. There are pens with four colours in, rubbers shaped like burgers, and one poster of a kitten hanging off a branch that says HANG IN THERE. A Year 2 has a pound and a dream.',
        line: 'I want the pen with four colours. It’s £1.50. Mum says the Book Fair is “a racket”. What’s a racket?',
        options: [
          { evil: 0, label: 'Help her find something she can afford.', cash: 0, result: 'You find her a burger rubber for 40p, and with the rest she buys a book by accident. It is about a whale. She reads it in one go and tells you about the whale every day for a week. It was a very good whale.' },
          { evil: 1, label: 'Sell her your old four-colour pen. Three colours work. 40p.', cash: 40, soul: -1, result: 'The green has gone. She doesn’t mind. She draws everything in red, blue and black for a week and calls them “the colours”.' },
          { evil: 2, label: 'Buy up every four-colour pen at the fair. Sell them at break for a pound more.', cash: 120, soul: -6, happy: -4, fanfare: ['STOCK CORNERED!', 'SCARCITY PREMIUM!'], result: 'You buy all nine pens and sell them back along the corridor at £2.50. The Year 2 can’t get one now. She buys the kitten poster instead and puts it over her bed. It says HANG IN THERE. She is trying.', feed: ['The Book Fair lady has written to head office asking why nine pens sold in a minute. Head office has sent more pens and no books.', 'The Year 2 still hasn’t got a pen. She says the kitten is “getting her through”.'] },
          { evil: 3, label: 'Sell her a pen. Then sell her the secret fifth colour.', cash: 200, soul: -11, happy: -7, fanfare: ['HIDDEN FEATURE!', 'PAID UPGRADE!'], result: 'She pays her pound for your old pen and promises next week’s pound to unlock the secret fifth colour. You show her: click the blue twice, very fast. It is still blue. “It’s darker,” she says, desperately. It is not darker.', feed: ['The Year 2 did a whole picture in the secret fifth colour. Her teacher said it was a lovely blue. She cried.', 'She has started telling Year 1s about the fifth colour, and charging them to see it.'] },
        ],
      },
      {
        id: 'f-harvest', scene: { cast: ['priya'] }, speaker: 'priya',
        text: 'It’s Harvest Festival. Everyone has brought a tin for the old people’s home, stacked on the stage in a pyramid. At the top is a tin of peaches from 1983 that comes back every year. Nobody knows whose it is. Priya has forgotten her tin.',
        line: 'Mrs Whitlock says if you haven’t brought a tin you have to stand up and say why. There isn’t a why. I just forgot.',
        options: [
          { evil: 0, label: 'Give her your tin. Stand up and say you forgot.', cash: 0, result: 'Priya puts your beans on the pyramid. When Mrs Whitlock asks, you stand up and say you forgot, and there isn’t a why. The whole hall looks at you for a long time. It’s fine. It’s only looking.' },
          { evil: 1, label: 'Sell her your spare tin. 30p.', cash: 30, soul: -1, result: 'It is a tin with no label. You think it’s mandarins, from the shake. Priya places it on the pyramid very respectfully, like a wreath.' },
          { evil: 2, label: 'Sell her a tin off the back of the pyramid. Then the next forgetter. Then the next.', cash: 120, soul: -6, happy: -5, fanfare: ['STOCK ROTATION!', 'CIRCULAR SUPPLY CHAIN!'], result: 'By the end of the last hymn you have sold the same six tins back onto the pyramid eleven times. The pyramid is exactly the size it was. Everyone feels very charitable.', feed: ['The old people’s home received six tins and a letter saying there were seventy-one. They have written back, in shaky biro, to ask where the others went.', 'Mrs Ellis, 94, got the mandarins. Again.'] },
          { evil: 3, label: 'Sell her the 1983 peaches. Tell her whoever has them hosts it next year.', cash: 200, soul: -12, happy: -7, fanfare: ['HERITAGE ASSET!', 'LEGACY SALE!'], result: 'Priya pays £2 for the honour, out of her bus money. She takes the peaches home and puts them on the mantelpiece, between her grandparents’ wedding photo and the clock. When her mum asks why, Priya says “it’s tradition”, very seriously.', feed: ['Priya checks the peaches are still on the mantelpiece every morning before school. She has to bring them back next September.', 'The peach tin has started making a noise at night, very quietly, like the sea a long way off.'] },
        ],
      },
      {
        id: 'f-nativity', scene: { bg: 'corridor', cast: ['harrietA', 'harrietB'] }, speaker: 'harrietA',
        text: 'It’s the Nativity. Because of a clerical error both Harriets have been cast as Mary, and they are sharing the baby Jesus, a doll called Clive. You are the Innkeeper. You have one line. You have been thinking about the line.',
        line: 'Is there any room at the inn? Please say no. Mrs Tranter says you have to say no or it isn’t Christmas.',
        options: [
          { evil: 0, label: 'Say the line. Point them kindly to the stable.', cash: 0, result: 'You say “No room, but there’s a stable round the back,” and point, very kindly, at a gym mat. Somebody’s nan says “ahh”. Both Harriets lay Clive in the manger at exactly the same moment. It is, by accident, beautiful.' },
          { evil: 1, label: 'Say the line. The stable is 10p a night.', cash: 20, soul: -1, result: 'The Harriets pay 10p each, in front of two hundred parents. A dad laughs. Mrs Tranter writes something down on her script and underlines it.' },
          { evil: 2, label: 'There’s room, actually. A pound a night. It’s Christmas, so it’s busy.', cash: 110, soul: -6, happy: -4, fanfare: ['SEASONAL PRICING!', 'FULL OCCUPANCY!'], result: 'The Harriets look at each other. They look at Mrs Tranter. Mrs Tranter mouths “just pay him”, to get it over with. They pay out of the costume money. Three shepherds book the room next door.', feed: ['The local paper ran a photo of the Nativity. The caption says NO ROOM AT INN (£1).', 'A shepherd asked his dad if Jesus had to pay for his room too. His dad said “everybody does, son”, then went very quiet in the car.'] },
          { evil: 3, label: 'Give the stable to the Three Kings. They’ve made a better offer.', cash: 200, soul: -12, happy: -8, fanfare: ['GAZUMPED!', 'PREMIUM GUESTS!'], result: 'The Kings pay in gold (a Ferrero Rocher and £1.80), frankincense (Lynx Africa) and myrrh (nobody knows). The Harriets have the baby in the corridor, next to the fire extinguisher. Clive has never looked so lost. Every parent films it.', feed: ['The Harriets have stopped staring at you. They just stare at the fire extinguisher now.', 'Clive the doll has been put back in the cupboard, face down. Mrs Tranter says he needs time.'] },
        ],
      },
      {
        id: 'f-farm', scene: { bg: 'shed', cast: ['farmer', 'year2'] }, speaker: 'year2',
        text: 'The class trip is to a farm. The farmer, Mr Hargreaves, says everything as though he’s reading the shipping forecast. Behind the lambing shed, a Year 2 has fallen completely in love with a lamb called Biscuit.',
        line: 'Can I take Biscuit home? I’ll keep him in my wardrobe. He can have my shoes. I don’t need shoes.',
        options: [
          { evil: 0, label: 'Help her say goodbye to Biscuit properly.', cash: 0, result: 'She tells Biscuit she’ll come back when she’s grown up. Biscuit eats her worksheet. She takes this as a yes. On the coach home she falls asleep holding the chewed corner.' },
          { evil: 1, label: 'Draw her a picture of Biscuit to keep. 25p.', cash: 25, soul: -1, result: 'The drawing is mostly a cloud with legs. She says it’s the spitting image. To be fair, Biscuit is mostly a cloud with legs.' },
          { evil: 2, label: 'Sell adopt-a-lamb certificates for Biscuit. 20p each. Sell six.', cash: 120, soul: -6, happy: -4, fanfare: ['FRACTIONAL OWNERSHIP!', 'LIVESTOCK PORTFOLIO!'], result: 'You write ADOPTION CERTIFICATE on squares of worksheet and sell them down the coach queue. By home time Biscuit has six legal owners in Year 2, each of whom believes he loves them the most.', feed: ['Six Year 2s drew Biscuit for Show and Tell. Six different Biscuits. One has a hat.', 'Mr Hargreaves has received six letters addressed to Biscuit. He reads them to Biscuit. Biscuit doesn’t mind. Hargreaves does, a bit.'] },
          { evil: 3, label: 'Sell the certificates. Then ask Mr Hargreaves, loudly, what lambs are for.', cash: 200, soul: -12, happy: -8, fanfare: ['FARM TO TABLE!', 'CRISIS UPSELL!'], result: '“Sunday lunch, mostly,” says Mr Hargreaves, in the voice of the shipping forecast. For the rest of the journey home, six Year 2s who own Biscuit buy SAVE BISCUIT badges off you. There is no saving Biscuit. There are just badges.', feed: ['A Year 2 has stopped eating Sunday lunch. Her mum says it’s a phase. It’s Biscuit.', 'Six Year 2s still wear their SAVE BISCUIT badges. Nobody has asked the farm how Biscuit is. Nobody wants to.'] },
        ],
      },
      {
        id: 'f-stars', scene: { cast: ['jade'] }, speaker: 'jade',
        text: 'Every Friday, anyone with five gold stars on the Star Chart gets Golden Time: twenty minutes with the good Connect 4. Jade has four stars. You have found where Miss Tranter keeps the sheet of stars.',
        line: 'I’ve been so good, Tuck. I said please to the dinner ladies. I held a door. Nobody saw the door. It doesn’t count if nobody sees the door.',
        options: [
          { evil: 0, label: 'Tell Miss Tranter about the door.', cash: 0, result: 'Miss Tranter goes and looks at the door, as though that might help. Then she gives Jade a star anyway. Jade plays the good Connect 4 for twenty minutes and beats herself every time.' },
          { evil: 1, label: 'Sell her one gold star. 30p.', cash: 30, soul: -1, result: 'You stick the star on Jade’s jumper, which you both agree is close enough to the chart. Miss Tranter accepts it. She has a lot of marking.' },
          { evil: 2, label: 'Sell stars to anyone who wants them. Five for a pound.', cash: 120, soul: -6, happy: -4, fanfare: ['QUANTITATIVE EASING!', 'STAR INFLATION!'], result: 'By Friday the whole class has five stars. Golden Time is everyone. There is still only one good Connect 4. Twenty-nine children watch Kyle play it.', feed: ['A gold star is now worth less than a Gummy Snail. Miss Tranter has started giving out three at a time, and looks frightened.', 'The one girl who earned her stars properly cried at Golden Time. Nobody knew why. She did.'] },
          { evil: 3, label: 'Flood the chart with stars. Then rent out the Connect 4 counters one at a time.', cash: 200, soul: -12, happy: -7, fanfare: ['HYPERINFLATION!', 'SCARCE RESOURCE SECURED!'], result: 'Everyone has Golden Time and you have the only counters, in the jumper. Jade rents them at 5p each. She gets four in a row against nobody, and pays for the fourth.', feed: ['Golden Time is now the whole class sitting round an empty Connect 4 frame, looking through it.', 'Jade has started drawing stars on the back of her hand. She says they’re “for later”.'] },
        ],
      },
      {
        id: 'f-bean', scene: { cast: ['billy'] }, speaker: 'billy',
        text: 'Everybody in Billy’s class grew a bean in a yoghurt pot on the windowsill. Every bean has a little green stalk. Billy’s bean also has a little stalk, but it is lying down, it is grey, and it has, he says, “given up”.',
        line: 'We have to take them home after Parents’ Evening. My mum’s coming. She’s never come before. I told her all about the bean.',
        options: [
          { evil: 0, label: 'Help him plant it by the gate. Give it a name.', cash: 0, result: 'You plant it by the gate and Billy names it Gary. It doesn’t grow. But he shows his mum the exact spot, and she crouches down and looks at the soil for a long time, like it’s the best soil she has ever seen.' },
          { evil: 1, label: 'Swap beans with him. 25p for the difference.', cash: 25, soul: -1, result: 'Billy carries your bean out in both hands, like a candle. You put his grey one on your windowsill at home. A week later, out of nowhere, it grows. You don’t tell him.' },
          { evil: 2, label: 'Sell him a better bean. It’s Kyle’s old cress head with the face rubbed off. 80p.', cash: 80, soul: -6, happy: -4, fanfare: ['PREMIUM PRODUCE!', 'REBRANDED!'], result: 'Billy pays 80p for a pot of cress with the faint ghost of a face on it. At Parents’ Evening his mum says it’s a lovely bean. Billy says “thank you” as though he grew it, then looks at the floor.', feed: ['The face is growing back on Billy’s cress, through the rubbed-off bit. It looks worried.', 'Billy’s mum has put the “bean” on the kitchen table. She waters it every night when she gets in from her shift.'] },
          { evil: 3, label: 'Rent him your best bean for the evening. Take it back at the door.', cash: 200, soul: -12, happy: -7, fanfare: ['SHORT-TERM LEASE!', 'SALE AND LEASEBACK!'], result: 'Billy pays £2 to rent your bean for one evening. His mum holds it all the way through Parents’ Evening and tells Miss Tranter it’s the best bean she’s ever seen. At the door you take it back out of her hands, nicely, because the lease is up.', feed: ['Billy’s mum asked where the bean went. Billy said it “went back”. She didn’t ask where. She just made him toast.', 'Billy’s yoghurt pot is still on the windowsill with the grey bean in it. He waters it anyway. It’s his.'] },
        ],
      },
      {
        id: 'f-verruca', scene: { bg: 'corridor', cast: ['harrietA', 'harrietB'] }, speaker: 'harrietA',
        text: 'Swimming lessons at the leisure centre. Harriet and Harriet have one verruca between them, which nobody can explain, and one verruca sock, which is worse. The lifeguard has a whistle and a rule: no sock, no pool.',
        line: 'We take turns having it. The verruca. It’s my turn today. It’s always my turn on swimming days.',
        options: [
          { evil: 0, label: 'Give her your own sock. Sit out on the side.', cash: 0, result: 'You sit on the bench in your trunks for forty minutes while the Harriets do widths in perfect unison, one in a verruca sock and one in your red sock. They wave every length. The bench is warm. It smells of chlorine and Monster Munch.' },
          { evil: 1, label: 'Lend them your spare sock. 30p for the lesson.', cash: 30, soul: -1, result: 'The Harriets pay 15p each. Your spare sock is grey and too big, so one Harriet swims with a small grey flag trailing off her foot. She says it makes her faster. It doesn’t.' },
          { evil: 2, label: 'Rent them the sock by the width. 5p a width.', cash: 110, soul: -6, happy: -4, fanfare: ['PAY-PER-WIDTH!', 'AQUATIC REVENUE MODEL!'], result: 'They swap the sock at the shallow end after every width, hopping, so neither Harriet is ever in the water without it. Twenty-two widths. By the end they are both exhausted and only one of them has learned to swim.', feed: ['The Harriets got their 10-metre badge. They have one badge between them. Their mums take turns sewing it onto each swimsuit.', 'The lifeguard now blows the whistle at the Harriets just for hopping.'] },
          { evil: 3, label: 'Tell the lifeguard there are two verrucas. Sell bread-bag socks.', cash: 200, soul: -12, happy: -7, fanfare: ['OUTBREAK MONETISED!', 'FOOTWEAR MONOPOLY!'], result: 'The lifeguard bans both Harriets and declares a verruca emergency. Thirty children swim in Warburtons bags held on with elastic bands, at 10p a foot. The Harriets watch from the viewing gallery, behind glass, next to the crisp machine, holding hands.', feed: ['The deep end is full of drifting bread bags. The leisure centre has put up a sign: WE ARE NOT A BAKERY.', 'The Harriets have stopped taking turns with the verruca. They say it is “both of ours now”, and look at you when they say it.'] },
        ],
      },
      {
        id: 'f-recorder', scene: { bg: 'corridor', cast: ['leaver'] }, speaker: 'leaver',
        text: 'The Year 6 leaver, the one with the sunglasses and the coat, has been given the recorder solo in the Leavers’ Assembly. It is “My Heart Will Go On”. He can play three notes. None of them are in it.',
        line: 'If anybody finds out I can’t do this, I’m finished. You understand me? I’ve got a reputation. I’ve got a coat.',
        options: [
          { evil: 0, label: 'Sit with him behind the shed and help him learn it.', cash: 0, result: 'It takes all of lunch. By the bell he can do the first line, slowly, with his sunglasses pushed up on his head so he can see the holes. He doesn’t say thank you. He plays the first line at you again instead, which is better.' },
          { evil: 1, label: 'Write the fingering on his hand in biro. 30p.', cash: 30, soul: -1, result: 'You draw little circles on his knuckles, some filled in, some empty. He pays without looking at you. Later, in the hall, you see him glance down at his hand like a man checking a map.' },
          { evil: 2, label: 'Play it for him behind the curtain. £1.20.', cash: 120, soul: -6, happy: -3, fanfare: ['GHOSTWRITING SERVICES!', 'OUTSOURCED TALENT!'], result: 'You play it from behind the stage curtain, beautifully, while he mimes with his eyes shut. The parents weep. Three mums ask him for lessons. He has to say yes. He has to keep saying yes.', feed: ['The Year 6 leaver now teaches recorder to three Year 3s on Saturdays. He cannot play the recorder. They are learning together, by being wrong.', 'He wears his sunglasses indoors all the time now. Behind them, it’s said, he’s practising.'] },
          { evil: 3, label: 'Take £2 to play it for him. Stop at the key change.', cash: 200, soul: -12, happy: -7, fanfare: ['SERVICE WITHDRAWN!', 'LEVERAGE CREATED!'], result: 'You stop at the key change and walk off. The hall waits. He holds the recorder to his lips in total silence for a very long time, then blows one note, the wrong one, very loudly, and Gary lands on the windowsill outside. Two hundred parents applaud, unsure. He bows behind his sunglasses.', feed: ['Everybody at St. Pete’s can hum the note now. They hum it when he walks past.', 'The Year 6 leaver goes behind the shed every lunchtime and plays the note, very quietly, to nobody.'] },
        ],
      },
      {
        id: 'f-hamster', scene: { cast: ['priya'] }, speaker: 'priya',
        text: 'The class hamster, Margaret, goes home with a different child every weekend, with a diary to fill in about what she did. Margaret has been to Skegness. Margaret has been to a christening. This weekend it’s your turn. Priya has been waiting since September.',
        line: 'I’m twenty-ninth on the list. I’ve made her a little bed. It’s a tissue box. I wrote MARGARET on it in my best writing.',
        options: [
          { evil: 0, label: 'Give Priya your weekend. Help her carry the cage.', cash: 0, result: 'Priya carries the cage to the gate like an egg. On Monday the diary says MARGARET HAD A BATH IN A SAUCEPAN (NO WATER) AND WATCHED BLIND DATE. There is a drawing of Margaret asleep in the tissue box. She looks extremely content.' },
          { evil: 1, label: 'Swap weekends with her. 30p for the trouble.', cash: 30, soul: -1, result: 'Priya pays 30p, crosses your name off the list and writes hers in. The diary comes back with a pressed daisy in it. It is, Priya has written underneath, “from Margaret”.' },
          { evil: 2, label: 'Auction your weekend along the dinner queue.', cash: 120, soul: -6, happy: -5, fanfare: ['TIMESHARE AUCTIONED!', 'RODENT HOSPITALITY SECTOR!'], result: 'Kyle wins with £1.20 and a business card. Priya bid 85p and her tissue box. Kyle takes Margaret home and fills in the diary in the style of a quarterly report.', feed: ['Margaret’s diary for that weekend says: MARGARET MET WITH STAKEHOLDERS. It is signed KYLE.', 'Priya keeps her rubbers in the MARGARET tissue box now. She says they’re “staying over”.'] },
          { evil: 3, label: 'Take Margaret home. Rent her out by the hour. Fill in the diary yourself.', cash: 200, soul: -12, happy: -7, fanfare: ['ASSET SWEATED!', 'SHORT-TERM LETS!'], result: 'Margaret visits six houses in one weekend, including Biff’s, and comes back on Monday with a slight Glaswegian accent and a look in her eye. Your diary entry says MARGARET STAYED IN AND REFLECTED. Priya reads it out to the class, because it’s her job to read the diary, and looks at Margaret the whole time.', feed: ['Margaret won’t come out of her wheel now. She runs in it all night, very fast, as if she has somewhere to be.', 'Priya is thirtieth on the list now. Nobody knows how. The list has a bit of Tipp-Ex on it.'] },
        ],
      },
      {
        id: 'f-cast', scene: { cast: ['biff'] }, speaker: 'biff',
        text: 'Biff has broken his arm. Nobody knows how. Some say he punched a wall; some say a wall punched him. He has had the cast for nine days and nobody has signed it, because nobody is brave enough to ask.',
        line: 'My nan signed it. She put “from Nan”. That’s it. That’s all of it. It’s a whole arm.',
        options: [
          { evil: 0, label: 'Sign it. Draw a snail. Get a few others to sign too.', cash: 0, result: 'You write GET WELL SOON BIFF, FROM TUCK, with a small snail. Then a Year 3 signs it, very fast, and runs. By home time it has eleven names. Biff walks round all afternoon holding the arm slightly out, so people can see.' },
          { evil: 1, label: 'Walk him round collecting signatures. 30p for your time.', cash: 30, soul: -1, result: 'You walk Biff round the playground like a manager walking a boxer. Seventeen children sign, mostly from fright. Biff pays you in two 10ps and a 10p he found inside the cast.' },
          { evil: 2, label: 'Sell advertising on the cast. Biff can keep the elbow.', cash: 120, soul: -6, happy: -4, fanfare: ['OUT-OF-HOME ADVERTISING!', 'PREMIUM ARM SPACE!'], result: 'By lunch the cast says TUCK’S SNAILS: THE TASTE OF NOW in four colours, with Kyle’s business card Sellotaped to the wrist. Biff is allowed to keep the elbow. Somebody has written “Biff” on it, small. He checks it’s still there every few minutes.', feed: ['Biff’s cast came off on Friday. He asked the nurse if he could keep the elbow bit. She said it had to go in the bin. He watched it go in.', 'Biff has started signing his own name on his other arm, in biro, just in case.'] },
          { evil: 3, label: 'Fill it with forty made-up names. Charge Biff 5p a name.', cash: 200, soul: -12, happy: -7, fanfare: ['ENGAGEMENT INFLATED!', 'FOLLOWERS ACQUIRED!'], result: 'You cover the cast in forty names, in forty different handwritings, and charge Biff 5p each for the honour. He reads them all out loud, slowly, delighted. Most of them are people who don’t exist. One of them is Gary.', feed: ['Biff has been looking for a boy called Dazza Wheelbarrow to say thanks. He has asked every class. There is no Dazza Wheelbarrow.', 'Biff told his nan he has forty friends now. She cried and made him a cake. He took it into school to share with them.'] },
        ],
      },
      {
        id: 'f-silence', scene: { bg: 'corridor', cast: ['jade'] }, speaker: 'jade',
        text: 'It’s a sponsored silence for the school roof. Jade’s grandad has sponsored her a pound a minute, because he thought it said a pound an hour and didn’t have his glasses on. She is at fifty-one minutes. She has gone a strange colour. She writes you a note.',
        line: 'GRANDAD SAYS IF I GET TO AN HOUR HE’LL HAVE TO SELL THE SHED. I LOVE THE SHED. IT SMELLS OF CREOSOTE AND GRANDAD.',
        options: [
          { evil: 0, label: 'Sit next to her in silence until the bell.', cash: 0, result: 'You sit beside her and say nothing for eight minutes. At fifty-nine minutes she whispers “shed”, very quietly, and you both pretend you didn’t hear. Her grandad pays for fifty-nine minutes and keeps the shed. He sends you a toffee, via Jade, with no note.' },
          { evil: 1, label: 'Sell her a notepad so she can keep writing. 30p.', cash: 30, soul: -1, result: 'It’s a reporter’s notepad from the Book Fair. She fills it in nine minutes, mostly with the word SHED, and gets to an hour without a sound. Grandad pays. He says he never used the shed anyway. He used the shed every day.' },
          { evil: 2, label: 'Charge 10p a go to try to make her laugh.', cash: 120, soul: -6, happy: -5, fanfare: ['ENGAGEMENT MONETISED!', 'INTERACTIVE CONTENT!'], result: 'Twelve children pay to pull faces at Jade. Kyle does a dance. Gary walks across the windowsill backwards. She holds on to fifty-nine minutes, and then Biff, who paid double, leans in and says “shed”, and she screams.', feed: ['Jade’s grandad paid for fifty-nine minutes and kept the shed. Jade doesn’t know whether that means she won.', 'Jade doesn’t talk at wet play any more. She says she’s “saving it”.'] },
          { evil: 3, label: 'Bet Kyle she won’t make it. Tell her a joke at fifty-nine minutes.', cash: 200, soul: -12, happy: -7, fanfare: ['POSITION HEDGED!', 'OUTCOME SECURED!'], result: 'The joke is the one about the man with the rubber toe. It isn’t even good. Jade laughs so hard she falls off her chair at fifty-nine minutes and forty seconds. Kyle pays up. Jade lies on the carpet laughing and crying at once, and nobody can tell which one is winning.', feed: ['The roof fund came up £59 short. There is a bucket in the hall now. It has a name.', 'Jade goes very quiet whenever anyone says the word “toe”.'] },
        ],
      },
      {
        id: 'f-firedrill', scene: { cast: ['desmond'] }, speaker: 'desmond',
        text: 'Fire drill. The whole school is lined up on the playground while Mrs Whitlock reads the register. Everyone is present except Ryan in Year 3, who is in the toilets and won’t come out until somebody official says it’s safe. At the very back, something tall, orange and slightly see-through queues with Year 4, and Mrs Whitlock ticks it off without looking up.',
        line: 'I am acting for Ryan. My client requires written confirmation that the fire is pretend. He would also like his jumper, which is inside, and a satsuma, which is mine.',
        options: [
          { evil: 0, label: 'Go in and tell Ryan through the door it’s only practice.', cash: 0, result: 'You crouch by the cubicle and tell Ryan it’s only practice, the fire is pretend, everyone is waiting and nobody is cross. After a while the lock clicks. He comes out holding Desmond’s hand. Mrs Whitlock ticks him off as if he’d been there all along.' },
          { evil: 1, label: 'Write the confirmation. Sign it “The Fire Brigade”. 30p.', cash: 30, soul: -1, result: 'Desmond slides your note under the door. There is a long silence, then a small voice says “the fire brigade does joined-up?” and Ryan comes out. Desmond pays your fee from the briefcase. The coins smell of satsuma.' },
          { evil: 2, label: 'Sell Ryan updates under the door. 10p each.', cash: 110, soul: -6, happy: -5, fanfare: ['NEWS SUBSCRIPTION!', 'CRISIS COMMUNICATIONS!'], result: 'Ryan buys eleven updates. The fire moves to the library, then the hall, then, briefly, the staffroom kettle. When the drill ends he is still in there, waiting for a final update he can’t afford. Mr Dobson gets him out at home time with a mop.', feed: ['Ryan takes a wet flannel to the toilets now, every time, just in case.', 'Desmond has filed a complaint against the fire. He has addressed it to you.'] },
          { evil: 3, label: 'Sell Ryan a rescue for £2. Carry him out in front of everyone.', cash: 200, soul: -12, happy: -8, fanfare: ['EMERGENCY PRICING!', 'HEROISM MONETISED!'], result: 'Ryan pays £2 of his swimming money to be rescued. You carry him out of the toilets in a fireman’s lift, coughing loudly, past three hundred children and the dinner ladies. There is no fire. Everybody knows there is no fire. Somebody claps, slowly. It is Biff.', feed: ['Ryan is called “Smokey” now. He has never been near smoke.', 'Desmond has started carrying a fire blanket in the briefcase, next to the satsuma. He won’t say who it’s for.'] },
        ],
      },
      {
        id: 'f-theatre', scene: { bg: 'corridor', cast: ['gideon'] }, speaker: 'gideon',
        text: 'A theatre company has come to do a play about road safety in the hall. The company is one man called Gideon, in a black polo neck and a ponytail, with a cardboard zebra crossing and a van. The play is called “Stop! Look! Listen! (A Hedgehog’s Story)”. He needs a volunteer to be the car.',
        line: 'Who’d like to be the car? It’s a non-speaking role, but a very powerful one. The car is, if you like, the villain. The car is all of us.',
        options: [
          { evil: 0, label: 'Volunteer. Be the most careful car in history.', cash: 0, result: 'You are a car that stops for everything, including Gideon, a chair and a dropped crayon. The hedgehog survives. The hall cheers. Afterwards Gideon shakes your hand and says you have “real stillness”. Nobody has ever said that about you before.' },
          { evil: 1, label: 'Volunteer. Ask for a 30p appearance fee.', cash: 30, soul: -1, result: 'Gideon pays 30p out of a bumbag marked PETTY CASH (ARTS COUNCIL). You give a solid, professional car. The hedgehog survives. Gideon writes “30p — car” in a little notebook and sighs.' },
          { evil: 2, label: 'Auction the part of the car along the front row.', cash: 120, soul: -6, happy: -4, fanfare: ['CASTING RIGHTS SOLD!', 'TALENT MARKETPLACE!'], result: 'Kyle wins the part for £1.20 and plays the car as a hard-nosed businessman who brakes for nobody. The hedgehog is hit in the first act. Gideon has to improvise the second act, which is about grief.', feed: ['The Year 1s now hold hands and say a few words at every zebra crossing.', 'Gideon has rewritten the play. It is now “Stop! Look! Listen! (A Hedgehog’s Funeral)”. It tours better.'] },
          { evil: 3, label: 'Take the zebra crossing at the interval. Sell it back to him by the stripe.', cash: 200, soul: -12, happy: -7, fanfare: ['PROPS RANSOMED!', 'STRIPE-BASED PRICING!'], result: 'You sell Gideon his own zebra crossing back at 40p a stripe. He can only afford five. The second half is performed with a crossing that stops in the middle of the road. The hedgehog does not make it. Gideon plays the hedgehog.', feed: ['Gideon drove off with five stripes and the hedgehog costume on the passenger seat, sitting up, seatbelt on.', 'The road safety message at St. Pete’s is now, as far as anyone can tell, “get halfway and hope”.'] },
        ],
      },
      {
        id: 'f-icecream', scene: { cast: ['billy'] }, speaker: 'billy',
        text: 'An ice-cream van has parked outside the gates at home time, playing “Greensleeves” very slowly, like a hearse that does Flakes. Little Billy is standing well back from it with his hands in his pockets.',
        line: 'Mum says when the music’s playing it means they’ve run out. That’s why they play it. So people know. It’s a sad song, isn’t it.',
        options: [
          { evil: 0, label: 'Agree it’s a sad song. Stand with him till it goes.', cash: 0, result: 'You stand together listening until the van pulls away, still playing. “See,” says Billy. “It’s gone to get more.” You agree that it has. He waves it off. It is, honestly, quite a sad song.' },
          { evil: 1, label: 'Buy a 99. Sell him half for 30p.', cash: 30, soul: -1, result: 'Billy eats his half very slowly and asks how you got it if they’d run out. You say you know a man. He nods, impressed, with a white moustache.' },
          { evil: 2, label: 'Tell him they’ve got one left in the world. Sell it to him with a mark-up.', cash: 110, soul: -6, happy: -4, fanfare: ['SCARCITY MANUFACTURED!', 'LAST-UNIT PRICING!'], result: 'Billy pays his whole bus fare for the last ice cream in the world. He eats it with enormous ceremony, in case he never sees another. Then the van starts playing again, and he looks at it for a long time.', feed: ['Billy walked home and told his mum the van had run out again. She said “told you, love.”', 'Billy is saving up for the next last ice cream. He keeps the money in a sock under his bed.'] },
          { evil: 3, label: 'Tell the Year 2s it’s free today with the password. Sell the password.', cash: 200, soul: -12, happy: -8, fanfare: ['ACCESS CODES SOLD!', 'PLATFORM FEES!'], result: 'Twenty Year 2s pay 10p each for the password, which is “Greensleeves”. They queue at the hatch and say it one after another, very seriously. The ice-cream man looks at each of them in turn, switches the music off and drives away. At the back of the queue, Billy says “see”.', feed: ['Twenty Year 2s whisper “Greensleeves” at every van they pass. None of them has ever had a free ice cream. They’re sure it’s just the wrong van.', 'The van doesn’t stop at St. Pete’s any more. You can hear it in the distance, outside other schools, playing.'] },
        ],
      },
      {
        id: 'f-pogs', scene: { cast: ['kyle'] }, speaker: 'kyle',
        text: 'Pogs have reached St. Pete’s. Mrs Whitlock has banned playing “for keeps”, so everybody does. Kyle has a metal slammer called The Accountant and has never lost. A Year 1 has just arrived with a full tube of pogs from his uncle in Florida.',
        line: 'I want to play him for keeps. He doesn’t know what keeps means. That’s not my fault, Tuck. That’s education.',
        options: [
          { evil: 0, label: 'Explain “for keeps” to the Year 1 first.', cash: 0, result: 'You explain it slowly, with diagrams in the dust. The Year 1 thinks about it, then says “no thank you” to Kyle, very politely. Kyle says “fair enough” and shows him how to stack them properly instead. They are still stacking at the bell.' },
          { evil: 1, label: 'Referee it. 30p from the winner.', cash: 30, soul: -1, result: 'It’s a fair game. The Year 1 wins, somehow, with a skull pog he says is lucky. He pays your fee with a Florida quarter, which is worth either 30p or nothing. You decide it’s 30p.' },
          { evil: 2, label: 'Lend Kyle a heavier slammer. Take half the winnings.', cash: 120, soul: -6, happy: -4, fanfare: ['EQUIPMENT LEASING!', 'REVENUE SHARE!'], result: 'Your slammer is a 50p piece wrapped in eleven layers of Sellotape. Kyle flips the whole tube in four goes. The Year 1 watches his uncle’s pogs disappear one tower at a time and asks, very quietly, “is this keeps?” It is keeps.', feed: ['The Year 1 has written to his uncle in Florida asking for more pogs, “but not for keeps”.', 'Kyle has added THE ACCOUNTANT (LEASED) to his business card.'] },
          { evil: 3, label: 'Rig the pogs. Sell the Year 1 his own back, one at a time.', cash: 200, soul: -12, happy: -7, fanfare: ['MARKET RIGGED!', 'BUYBACK SCHEME!'], result: 'You glue Kyle’s pogs face down. Kyle wins everything. You buy the tube off Kyle for one snail and sell the Year 1 his pogs back at 10p each, with the skull last, at a premium. He buys the skull, holds it up and says “lucky”, in a voice that doesn’t believe it any more.', feed: ['The Year 1 keeps the skull pog in his pencil case and doesn’t show anyone.', 'Pogs are banned at St. Pete’s now. They trade for twice what they did before.'] },
        ],
      },
      {
        id: 'f-caterpillar', scene: { bg: 'corridor', cast: ['year2'] }, speaker: 'year2',
        text: 'It’s World Book Day. A Year 2’s mum ran out of time, so he has come as the Very Hungry Caterpillar: a green sleeping bag zipped to the chin, and a paper plate for a face. He can’t use his arms. He has been lying on the corridor floor since registration, going “mmph”.',
        line: 'I can’t reach my crisps. They’re in my bag. My bag’s in the other bag. I’m the hungriest one in the whole book.',
        options: [
          { evil: 0, label: 'Feed him his own crisps, one at a time.', cash: 0, result: 'You sit on the floor and feed him his own crisps one at a time, like a baby bird. He says thank you after every single one. By the end you both agree he has become a beautiful butterfly, even though he is still in the sleeping bag.' },
          { evil: 1, label: 'Unzip him for 30p. Zip him back up after.', cash: 30, soul: -1, result: 'He pays 30p from inside the sleeping bag, which takes a while. You unzip him for exactly as long as a packet of Quavers, then zip him back up, because he wants to stay in character.' },
          { evil: 2, label: 'Feed him crisps at 10p a crisp. He is very hungry.', cash: 120, soul: -6, happy: -5, fanfare: ['HUNGER MONETISED!', 'PER-UNIT PRICING!'], result: 'A packet of Wotsits turns out to hold twelve Wotsits. He pays for every one. On the last one his paper-plate face slips down and he looks up at you through the eyeholes, still chewing.', feed: ['The Year 2 has asked to come as something with arms next year. His mum says “we’ll see”.', 'There are orange fingerprints all over his paper plate. They’re yours.'] },
          { evil: 3, label: 'Sell him everything the caterpillar eats on Saturday, from the bins.', cash: 200, soul: -12, happy: -8, fanfare: ['FULL MENU UPSELL!', 'AUTHENTIC EXPERIENCE!'], result: 'You find a slice of cake, a pickle, some cheese, half a sausage and a bit of watermelon in the dinner-hall bins and sell him the lot for £2 as “the Saturday from the book”. He eats it all lying down, eyes shining. That night, exactly like the caterpillar, he has a stomach ache.', feed: ['He did not become a butterfly. He became a Year 2 who was off on Monday.', 'His mum has written to the school to ask about the pickle. Nobody can explain the pickle.'] },
        ],
      },
      {
        id: 'f-concrete', scene: { bg: 'corridor', cast: ['council', 'maureen'] }, speaker: 'council',
        text: 'Dinner Lady Maureen has made chocolate concrete with pink custard. This batch is so dense it has bent a spoon and a Year 6. A Man from the Council has been called in to decide whether it is a pudding or a building material.',
        line: 'I need a child to eat some, for the form. If a child can eat it, it’s a pudding. If not, it’s a structure, and it needs planning permission.',
        options: [
          { evil: 0, label: 'Eat some. Tell him honestly it’s lovely.', cash: 0, result: 'It takes four minutes and both hands. Once you are through the crust, it is the best thing you have ever eaten. The Council man ticks PUDDING. Maureen gives you the corner piece, which is known to be the most powerful.' },
          { evil: 1, label: 'Taste it for him. 30p tasting fee.', cash: 30, soul: -1, result: 'He pays you out of an envelope marked SUNDRIES and watches you chew for some time, writing. Your verdict is “pudding, mostly”. He writes down “mostly” and underlines it.' },
          { evil: 2, label: 'Say it’s a building material. Sell the slabs to Year 6 for their den.', cash: 120, soul: -6, happy: -5, fanfare: ['ASSET RECLASSIFIED!', 'CONSTRUCTION SECTOR ENTERED!'], result: 'The Council man ticks STRUCTURE and leaves. You sell the whole tray to Year 6 at 10p a slab, and by home time they have built a small chocolate wall by the fence that the rain can’t touch. Maureen watches it from the kitchen door, ladle at her side, like a widow.', feed: ['The chocolate wall by the fence is still standing. The Year 3s lick it at break. It is on a council map now.', 'Maureen hasn’t made chocolate concrete since. She makes semolina, with a face like a closed shop.'] },
          { evil: 3, label: 'Say it’s a building material. Report Maureen for building without permission.', cash: 200, soul: -12, happy: -7, fanfare: ['WHISTLE BLOWN!', 'REGULATORY BOUNTY!'], result: 'The Council man fines the dinner hall £4 for an unauthorised structure and gives you half for the tip-off, in a brown envelope, without looking up. Maureen has to stand beside the tray while he measures it. It is longer the second time. She says nothing at all, which nobody has ever heard her do.', feed: ['The chocolate concrete is a listed structure now. There is a little blue plaque on the tray. Nobody is allowed to eat it.', 'Maureen has stopped reading the chips. She says they’ve “gone quiet on her”.'] },
        ],
      },
      {
        id: 'f-ohp', scene: { bg: 'corridor', cast: ['whitlock'] }, speaker: 'whitlock',
        text: 'The overhead projector has died in assembly, halfway through “Give Me Oil in My Lamp”. You are the only child who knows how to jiggle the bulb. Three hundred children are holding a note they can’t let go of.',
        line: 'Tucker, would you be a dear? We’re stuck on “keep me burning”. We have been keeping burning for some time.',
        options: [
          { evil: 0, label: 'Jiggle the bulb. Go and sit back down.', cash: 0, result: 'The words come back in a great square of light on the wall. Three hundred children breathe out and sing the rest. Mrs Whitlock mouths “thank you” over her hymn book, and afterwards gives you a sticker that just says HELPFUL.' },
          { evil: 1, label: 'Fix it. Mention, quietly, that you usually charge 30p.', cash: 30, soul: -1, result: 'Mrs Whitlock looks at you over her glasses, then opens her handbag in front of the whole school and counts out 30p in coppers. The hymn resumes. The coppers are warm. She has had them a long time.' },
          { evil: 2, label: 'Fix it. Sell space on the acetate between verses.', cash: 120, soul: -6, happy: -4, fanfare: ['ADVERTISING SLOTS SOLD!', 'CAPTIVE AUDIENCE!'], result: 'Between verses the wall says GIVE ME SNAILS IN MY JUMPER (TUCK’S), then KYLE (FEES), then a drawing of Gary paid for by a Year 3. Mrs Whitlock keeps singing. She can’t see the wall from where she stands. Everyone else can.', feed: ['The Year 3s sing “give me snails in my jumper” instead of the real words now, every time.', 'Mrs Whitlock found the acetate. She has put it in her desk drawer, under the shoe.'] },
          { evil: 3, label: 'Fix it. Put up everyone who owes you money, between verses.', cash: 200, soul: -12, happy: -8, fanfare: ['PUBLIC LEDGER!', 'DEBT RECOVERY ACCELERATED!'], result: 'Between verses a list goes up in a great square of light: who owes what, and how late. Little Billy is near the top. Three hundred children sing “keep me burning” while reading it. By the end of the hymn, eleven debtors have paid you in the corridor.', feed: ['A Year 4 whose name was on the wall didn’t come in on Thursday. On Friday he brought 40p and a note from his mum that just said HERE.', 'Assembly is done with the projector unplugged now. The hymns are sung from memory. Nobody remembers them.'] },
        ],
      },
      {
        id: 'f-capsule', scene: { bg: 'shed', cast: ['maureen', 'dobson'] }, speaker: 'maureen',
        text: 'St. Pete’s is burying a time capsule behind the sports shed, to be dug up in 2025 by whoever is caretaker then, which will still be Mr Dobson. Each child gets to put in one thing, and you have been put in charge of the lid. Dinner Lady Maureen wants to put in a chip.',
        line: 'Just the one chip, Tucker. It’ll know what to tell them. But they say the capsule’s full.',
        options: [
          { evil: 0, label: 'Take your own thing out. Put her chip in.', cash: 0, result: 'You take out your Gummy Snail and put in her chip, wrapped in a napkin. Maureen whispers something to it before the lid goes on. Mr Dobson buries it, then mops the soil, gently, for a long time.' },
          { evil: 1, label: 'Squeeze the chip in down the side. 30p.', cash: 30, soul: -1, result: 'You wedge the chip between a Spice Girls lolly stick and a letter from Year 3 to the future. Maureen pays in dinner tokens, which you decide are worth 30p. She says the chip is “comfortable”.' },
          { evil: 2, label: 'Auction the last spaces. The chip doesn’t make it.', cash: 120, soul: -6, happy: -5, fanfare: ['LIMITED CAPACITY!', 'LEGACY SLOTS AUCTIONED!'], result: 'The last spaces go to Kyle’s business cards, a Year 5’s photo of himself and a 50p that somebody paid 70p to bury. Maureen holds her chip all the way through the ceremony, then eats it, slowly, looking at the hole.', feed: ['In 2025, Mr Dobson will dig up eleven business cards that just say KYLE.', 'Maureen puts one chip aside every dinner time now, in her apron pocket, for later.'] },
          { evil: 3, label: 'Sell everyone’s letters back to them. Put in an IOU from the school.', cash: 200, soul: -12, happy: -7, fanfare: ['LONG-TERM DEBT ISSUED!', 'FUTURE REVENUE SECURED!'], result: 'You take out every letter to the future and sell it back to the child who wrote it, 10p each, “for safe keeping”. In their place goes one sheet of paper: ST. PETE’S OWES TUCK £20, PLUS INTEREST. Maureen’s chip goes in last, on top, face down. Mr Dobson buries it all without a word.', feed: ['Twenty children keep their letters to the future in their bedrooms now. The future will have to come and get them.', 'In 2025 somebody will open a box behind the sports shed and find out they owe you money.'] },
        ],
      },
      {
        id: 'f-birdwatch', scene: { cast: ['gary', 'year2'] }, speaker: 'year2',
        text: 'Year 2 are doing the Big Schools’ Birdwatch, with clipboards and a tally chart. They have been counting for an hour and have seen one bird. It is Gary. He keeps flying off over the shed and coming back, so they keep counting him.',
        line: 'That’s forty-one birds! Mrs Pike says the bird people will be really pleased with us. We’re going to be in the newsletter.',
        options: [
          { evil: 0, label: 'Tell them gently it’s the same bird. Help them count him once.', cash: 0, result: 'They take it well. They write GARY: 1 at the bottom of the chart and draw him very carefully, from his good side. Gary sits still for the drawing, for once, as though he knows.' },
          { evil: 1, label: 'Rent them your loo-roll binoculars. 30p.', cash: 30, soul: -1, result: 'Through the binoculars Gary is enormous, so they count him twice. Somebody spots a crisp packet in a tree and writes it down as “white bird (shy)”.' },
          { evil: 2, label: 'Keep Gary coming back with crisps. 5p a sighting.', cash: 120, soul: -6, happy: -4, fanfare: ['ENGAGEMENT LOOP!', 'RECURRING SIGHTINGS!'], result: 'You lob a crisp over the shed and Gary goes, and comes back, and goes, and comes back. By the bell Year 2 have seen two hundred and nine birds and paid for every one. Gary is visibly heavier and looks at you like a man on a double shift.', feed: ['The RSPB have written to St. Pete’s to ask about the 209 pigeons. They are sending a man.', 'Gary will only fly over the shed now if he’s paid in advance.'] },
          { evil: 3, label: 'Colour Gary in with felt tips. Sell sightings of rare birds.', cash: 200, soul: -12, happy: -7, fanfare: ['RARE BIRD EVENT!', 'PREMIUM SIGHTINGS!'], result: 'By lunch Year 2 have paid 20p a go to see a Golden Eagle, a Purple Heron and a bird you have named the Lesser Tuck, all of them Gary in felt tip. They write it all up in their neatest writing and post it off. Gary sits on the fence in three colours and doesn’t look at anyone.', feed: ['The RSPB have sent a man with a long lens. He has been in the hedge for two days, waiting for the Lesser Tuck.', 'Gary spent a whole afternoon washing in a puddle. The purple won’t come out.'] },
        ],
      },
      {
        id: 'f-lollipop', scene: { cast: ['dobson'] }, speaker: 'dobson',
        text: 'It turns out Mr Dobson is also the lollipop man. Nobody knew. Somebody has stolen his lollipop, and now he stands at the kerb at home time holding up one flat hand, and the traffic doesn’t stop for a hand. You know where the lollipop is. It is behind the bins.',
        line: '…',
        options: [
          { evil: 0, label: 'Fetch the lollipop. Give it back.', cash: 0, result: 'Mr Dobson looks at it as though you have returned a limb. He steps into the road and raises it, and the traffic stops, all of it, back to the roundabout. He sees you across first. On the far side he mops the kerb, briefly, out of happiness.' },
          { evil: 1, label: 'Make him a new one from a paper plate and a ruler. 30p.', cash: 30, soul: -1, result: 'The paper-plate lollipop says STOP in felt tip and, smaller underneath, PLEASE. He pays 30p. The cars stop for it, mostly out of curiosity.' },
          { evil: 2, label: 'Run your own crossing up the road with the real one. 5p a child.', cash: 120, soul: -6, happy: -5, fanfare: ['INFRASTRUCTURE PRIVATISED!', 'TOLL ROAD OPENED!'], result: 'Ten metres up the road you raise the real lollipop and the cars stop for you. Parents pay 5p a child to cross. Down at the old crossing Mr Dobson stands with his hand up, and a man in a Volvo waves back at it.', feed: ['Mr Dobson stood at his crossing until it got dark. He crossed nobody. Then he crossed himself and went home.', 'The Year 2s have started saying “5p” whenever they hear a car.'] },
          { evil: 3, label: 'Run your own crossing. Charge Mr Dobson to use it on his way home.', cash: 200, soul: -12, happy: -7, fanfare: ['TOLL APPLIED!', 'CAPTIVE CUSTOMER!'], result: 'You run the crossing all through home time, and at five o’clock Mr Dobson comes out of school in his coat and has to cross. He pays you 5p. In the middle of the road he stops and looks at the lollipop, his lollipop, for a long time, while the traffic waits. Then he carries on.', feed: ['Mr Dobson walks to the roundabout and crosses there now, where there is no lollipop at all. It adds twenty minutes. He has nowhere to be but the corridor.', 'Somebody saw Mr Dobson in the Co-op, holding a pack of paper plates and looking at it for a long time.'] },
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
      {
        id: 'f-squash4', series: 'squash', step: 4, catchUp: true, scene: { cast: ['squatch'] }, speaker: 'squatch',
        text: 'There is a new mature student in 8F. He is seven feet tall, shaggy, faintly see-through, and made entirely of undiluted orange squash. Bits of pulp drift slowly about inside him. Registration accepted him without comment, and so has everybody else.',
        line: 'I’m looking… for a boy… called Callum. Bit purple. He’d be about… this high… now.',
        options: [
          { evil: 0, label: 'Tell him you’ll keep an eye out.', cash: 0, result: 'The Squashquatch nods, very slowly. A drip of concentrate runs down his cheek and lands on your shoe. It smells of Robinsons and, somehow, of somebody’s dad’s car. He sloshes off down the corridor, checking every classroom, leaving sticky orange footprints.' },
          { evil: 1, label: 'Let him read the 8F register. £2.', cash: 200, soul: -1, result: 'He reads every name with one translucent finger, leaving an orange smear down the page. There is no Callum in 8F. You didn’t say which register. He didn’t ask.' },
          { evil: 2, label: 'Sell him a “Missing Callum” poster service. £5.', cash: 550, soul: -6, happy: -4, fanfare: ['LOST AND FOUND SOLUTIONS!', 'PRINT CAMPAIGN LAUNCHED!'], result: 'You draw Callum from memory. He comes out as a grape with shoes. The Squashquatch pays in slightly sticky coins and puts up forty posters, very carefully, at his own eye level, which is seven feet.', feed: ['Nobody under seven foot has seen the Callum posters. A PE teacher has, and is worried.', 'The Squashquatch stood next to a poster all lunch, in case Callum came to look at himself.'] },
          { evil: 3, label: 'Tell him Callum moved to Leicester. Sell him the bus fare.', cash: 1000, soul: -11, happy: -6, fanfare: ['TRAVEL SOLUTIONS!', 'ONE-WAY UPSELL!'], result: 'You sell him a return to Leicester for £10. It is a Megabus timetable from 1997 with LEICESTER written on it in biro. He holds it like a passport. Callum is two classrooms away, doing fractions.', feed: ['The Squashquatch spent Saturday in Leicester asking purple people if they were Callum. Billy says he was very polite.', 'There is a sticky orange trail from St. Jude’s to the M1. The council is measuring it.'] },
        ],
      },
      {
        id: 'f-squash5', series: 'squash', step: 5, scene: { cast: ['squatch'] }, speaker: 'squatch',
        text: 'The Squashquatch has got a Saturday job, and now a weekday one, as the dinner hall’s drinks dispenser. You hold your cup under his elbow and he thinks about something sad. He never runs out. He just gets very slightly shorter.',
        line: 'Callum… used to like… orange. Before the purple. Has he… been through… the queue?',
        options: [
          { evil: 0, label: 'Tell him to take his break. Watch the queue for him.', cash: 0, result: 'He sits down on a stack of chairs and goes a bit flat. You watch the queue all lunch. No Callum. When he comes back he pours you a cup of himself, properly diluted, and won’t take anything for it. It is the nicest squash you have ever had.' },
          { evil: 1, label: 'Run the queue. 20p a top-up.', cash: 210, soul: -1, result: 'The queue moves faster than it ever has. The Squashquatch doesn’t notice the 20ps. He is scanning every face that comes past, for one that’s purple.' },
          { evil: 2, label: 'Sell him neat. “Squatch Shots”, 50p a cup.', cash: 600, soul: -6, happy: -4, fanfare: ['CONCENTRATE MONETISED!', 'DIRECT-TO-CONSUMER!'], result: 'Undiluted, he is ferocious. Year 9s dare each other. A boy in 9B does three shots and says he can hear the colour orange. The Squashquatch watches himself being drunk and says, quietly, “I’m… popular.”', feed: ['The Squashquatch is a foot shorter. He says he doesn’t mind. He minds.', 'Three Year 9s went orange in Maths. Not a bit orange. Properly, permanently orange.'] },
          { evil: 3, label: 'Bottle him as “Robinsons Real”. Tell him Callum’s on late lunch, so he works through.', cash: 1150, soul: -12, happy: -7, mono: 6, fanfare: ['PRIVATE LABEL LAUNCHED!', 'SHIFT EXTENDED!'], result: 'He works first lunch, second lunch and a lunch you made up. Callum is on first lunch. Callum goes past with his tray while the Squashquatch is facing the wall, being bottled. Neither of them looks up.', feed: ['The Squashquatch is down to five foot nine. He asked if Callum’s late lunch was soon. You said yes. He is still standing by the urn.', 'Robinsons Real is outselling Robinsons. Robinsons have sent a letter. It is sticky.'] },
        ],
      },
      {
        id: 'f-squash6', series: 'squash', step: 6, scene: { cast: ['squatch'] }, speaker: 'squatch',
        text: 'The Squashquatch has joined the swimming team. When he gets in, the pool turns orange. By the second length it is a perfectly balanced drink. The gala is on Friday. Callum has been entered too, by his mum, who thinks orange might help.',
        line: 'If I… win… they put your name… in the paper. Then he’d see. Then he’d know… where I got to.',
        options: [
          { evil: 0, label: 'Swim the relay with him.', cash: 0, result: 'You swim the relay in a pool that tastes of Saturday mornings. You come last. The Squashquatch comes last more slowly, and hugs you at the end. You smell of squash for three days. It’s fine. It’s honestly fine.' },
          { evil: 1, label: 'Sell gala programmes. £2 for the lot.', cash: 200, soul: -1, result: 'The programmes are folded A4. He is listed as “S. Quatch (mature)”. He buys one and keeps it inside his chest, where you can see it slowly floating about.' },
          { evil: 2, label: 'Sell the parents cups of the pool. 50p a cup.', cash: 600, soul: -6, happy: -5, fanfare: ['POOLSIDE CATERING!', 'ASSET LIQUIDATED!'], result: 'The parents queue along the poolside with plastic cups. It is a fantastic squash, slightly chlorinated. The Squashquatch does his lengths more slowly, so it lasts.', feed: ['The pool had to be drained and refilled. The Squashquatch stood in the shallow end while they did it, getting thinner.', 'Callum’s race was cancelled due to “the pool being a drink”. He went home with his trunks dry.'] },
          { evil: 3, label: 'Bet against him. Tip Ribena into his lane.', cash: 1100, soul: -12, happy: -7, fanfare: ['MARKET MANIPULATED!', 'CROSS-CONTAMINATION!'], result: 'You pour two litres of Ribena into lane four. The Squashquatch goes a sort of brown and sinks to the bottom, ashamed. You win every bet. On the side, a slightly purple boy in armbands is told the gala’s off, and goes home, and never finds out who was down there.', feed: ['The Squashquatch sat on the bottom of the pool until the caretaker drained it. He says he was “thinking”.', 'The local paper ran a photo of the gala. It is a brown pool. The caption says “Results to follow.”'] },
        ],
      },
      {
        id: 'f-pell', series: 'pell', step: 1, scene: { cast: ['pell'] }, speaker: 'pell',
        text: 'Mr Pell, supply, has been covering the same Year 9 Geography lesson, on oxbow lakes, since 1994. Nobody knows who he is covering for. Some of the names on his register are now parents of the names on his register. He has drawn most of a meander.',
        line: 'Right, 9G. Oxbow lakes. Where were we? …Still the meander. Lovely. Has anyone got a felt tip that works? We’ll get there.',
        options: [
          { evil: 0, label: 'Lend him your good felt tip.', cash: 0, result: 'Mr Pell draws the meander a little further. The class leans in. It is very nearly a lake. Then the bell goes, and he puts the lid back on, thanks you, and says “next lesson, then,” the way he has since 1994.' },
          { evil: 1, label: 'Sell him a felt tip. £2.', cash: 200, soul: -1, result: 'He pays from a small leather purse that clicks. He tests the felt tip on the back of his hand, nods, and adds a single curve to the river. Progress.' },
          { evil: 2, label: 'Charge 9G 50p each to skip. He won’t notice.', cash: 600, soul: -6, happy: -4, fanfare: ['ATTENDANCE OPTIMISED!', 'FREE PERIOD™!'], result: 'By ten past, 9G is in the bikeshed. Mr Pell teaches oxbow lakes to twenty-nine empty chairs. He asks a question. He waits. He says “good” to the silence and moves on.', feed: ['Mr Pell said it was 9G’s best lesson yet. He meant it.', 'Mr Pell has started marking the empty chairs present. He says they’re very attentive.'] },
          { evil: 3, label: 'Sell his flask to the Science department. It’s been warm since 1994.', cash: 1000, soul: -11, happy: -5, fanfare: ['HERITAGE ASSET SOLD!', 'R&D PARTNERSHIP!'], result: 'Mr Grieve buys the flask for research and immediately sets it on fire. Mr Pell pats his cardigan for it all lesson and carries on about the meander in a very dry voice.', feed: ['Mr Pell has started bringing a second flask. It is empty. He holds it for comfort.', 'Mr Grieve says the tea in the flask was “not of this decade”.'] },
        ],
      },
      {
        id: 'f-pell2', series: 'pell', step: 2, scene: { cast: ['pell'] }, speaker: 'pell',
        text: 'Mr Pell has a pigeonhole in the staffroom with his name on it in a font from 1994. He has never been inside the staffroom. He says he’s only covering. Through the glass you can see his mug, a birthday card and a photo of a woman and two children who also, slightly, look like supply teachers.',
        line: 'Tucker, isn’t it? Would you nip in and check my pigeonhole? I don’t like to go in. It isn’t really my school.',
        options: [
          { evil: 0, label: 'Bring him everything. Read him the card.', cash: 0, result: 'The card says “Happy birthday, Dad. See you when the lesson’s done.” Mr Pell reads it four times, says “not long now”, and tucks it inside his cardigan, next to the flask.' },
          { evil: 1, label: 'Fetch the lot. £2 delivery.', cash: 200, soul: -1, result: 'He pays, and holds the mug in both hands. It says WORLD’S BEST SUPPLY. He has never drunk from it. He says he’s saving it for when he’s permanent.' },
          { evil: 2, label: 'Rent his pigeonhole to the Year 9s as a locker. £5 a week.', cash: 550, soul: -6, happy: -3, fanfare: ['PROPERTY SUBLET!', 'STAFFROOM EXPANSION!'], result: 'His pigeonhole now holds a Year 9’s PE kit, two Pokémon binders and a Discman. Mr Pell’s post goes on top, then slides off behind the radiator.', feed: ['A letter for Mr Pell has been behind the staffroom radiator since Tuesday. The radiator isn’t on, so it’s fine. It’s not fine.'] },
          { evil: 3, label: 'Sell the mug at the staff jumble. Keep the card. Tell him there was no post.', cash: 1000, soul: -12, happy: -5, fanfare: ['ESTATE CLEARANCE!', 'MAIL HANDLING FEE!'], result: 'The mug goes for a tenner to the Deputy Head, who drinks out of it in front of him. You tell him there was no post. He says “oh, well,” and “not to worry,” and goes back to the meander.', feed: ['Mr Pell has asked the office if his post is going to a different school. The office doesn’t know who he is.', 'The birthday card is in your coat. It says “See you when the lesson’s done.” You haven’t thrown it away. You keep meaning to.'] },
        ],
      },
      {
        id: 'f-pell3', series: 'pell', step: 3, scene: { cast: ['pell'] }, speaker: 'pell',
        text: 'Something has happened in 9G. Mr Pell has cut through the neck of the meander. For the first time since 1994, it is an oxbow lake. The class is on its feet. A Year 9 is crying. Mr Pell stands back from the board with the felt tip in his hand and doesn’t know what comes next.',
        line: 'That’s… that’s the lesson. That’s it done. Is there a next lesson? Has anyone seen a next lesson?',
        options: [
          { evil: 0, label: 'Help him find the next lesson.', cash: 0, result: 'You find it in a filing cabinet: Coastal Erosion, chapter four. He holds it like a newborn. At half three, a woman from the photo is waiting at the gate with two grown-up children and a flask of her own. He walks over very slowly, as if he’s worried she’s a mirage.' },
          { evil: 1, label: 'Sell him a photocopy of the next chapter. £2.', cash: 220, soul: -1, result: 'He reads it on the spot. Halfway through, a tanned man in sandals puts his head round the door, says he’s back from a long weekend and asks if this is 9G. Nobody recognises him. He goes away again.' },
          { evil: 2, label: 'Photograph the board. Sell prints to everyone he’s ever taught. £5.', cash: 600, soul: -6, happy: -4, fanfare: ['COMMEMORATIVE EDITION!', 'ALUMNI MARKET!'], result: 'You sell prints to 9G, to the parents of 9G who were once 9G, and to a man in a suit who was 9G in 1994 and has to sit down on the stairs.', feed: ['The Oxbow Lake print is on fridges all over town. Under one of them, someone has written: “He got there.”', 'Mr Pell asked for a print. You charged him. He says it was worth it.'] },
          { evil: 3, label: 'Rub it off while he’s at the photocopier. Sell him the lesson plan from the start.', cash: 1100, soul: -12, happy: -7, fanfare: ['PRODUCT RELAUNCH!', 'RECURRING REVENUE!'], result: 'When he comes back there is a straight river and nothing else. He looks at it for a long time. Then he says “Right, 9G. Oxbow lakes,” buys your lesson plan for a tenner, and begins.', feed: ['Mr Pell is back on the meander. He estimates 2006.', 'A woman with a flask waited at the school gate until it got dark. She went home on her own again.'] },
        ],
      },
      {
        id: 'f-snake', scene: { cast: ['year7s'] }, speaker: 'year7s',
        text: 'A Year 7 has been playing the same game of Snake on his Nokia 3310 since September. The snake now fills the whole screen except for one square. The battery is on one bar. He hasn’t blinked since Tuesday.',
        line: 'One more apple, Tuck. One more and I’ve completed it. Nobody’s ever completed it. Has anyone got a charger?',
        options: [
          { evil: 0, label: 'Hold the charger in the socket for him all through French.', cash: 0, result: 'You crouch by the socket for an hour. He eats the last apple at 2:14. The snake has nowhere left to go, so it just stops. He shows you the screen and neither of you says anything, which is right.' },
          { evil: 1, label: 'Rent him your charger. £2.', cash: 200, soul: -1, result: 'He plugs in. He gets the apple. The snake stops. He stares at it. “Thought there’d be more,” he says. There isn’t.' },
          { evil: 2, label: 'Charge by the minute. Biff holds the plug.', cash: 550, soul: -6, happy: -4, fanfare: ['POWER METERED!', 'ENERGY SECTOR ENTERED!'], result: 'Biff pulls the plug every time the meter runs out. The snake waits patiently at the edge of the screen while the boy goes through his pockets.', feed: ['He ran out of money one square from the end. The battery died. The snake died. He carried the phone round all afternoon like a tiny coffin.'] },
          { evil: 3, label: 'Mind it while he’s at the loo. Crash the snake. Sell him a “save”.', cash: 1000, soul: -11, happy: -6, fanfare: ['DATA RECOVERY SERVICES!', 'SAVE STATE MONETISED!'], result: 'You turn the snake left, into itself. GAME OVER. When he comes back you sell him the save for a tenner: a drawing of the snake on squared paper, very accurate, one square short.', feed: ['He has started again. The snake is three squares long. He reckons he’ll finish by Year 11.', 'He keeps the drawing folded up in his phone, behind the battery.'] },
        ],
      },
      {
        id: 'f-panini', scene: { cast: ['dev'] }, speaker: 'dev',
        text: 'Dev’s Euro 2000 sticker album is complete except for one space: Phil Neville. Everybody in Year 8 has Phil Neville. Dev has forty-one Emile Heskeys. He has stopped saying “got, got, need”. He just says “need”.',
        line: 'One Phil Neville, Tuck. I’ll give you all forty-one Heskeys. I’ll give you my mum.',
        options: [
          { evil: 0, label: 'Give him your Phil Neville.', cash: 0, result: 'Dev peels off the backing with the care of a surgeon. He presses Phil Neville into the last space and smooths him down with his thumb for a full minute. The album is finished. Dev looks lost for the rest of the day, in a good way.' },
          { evil: 1, label: 'Swap him your Phil Neville for £2 and five Heskeys.', cash: 200, soul: -1, result: 'Dev pays without haggling. You now have five Emile Heskeys. You don’t know what to do with them. Nobody ever has.' },
          { evil: 2, label: 'Sell him a Phil Neville. It’s Gary Neville with a biro moustache.', cash: 600, soul: -6, happy: -4, fanfare: ['BRAND EXTENSION!', 'COUNTERFEIT MARGINS!'], result: 'Dev doesn’t notice. Then he does notice. Then he decides not to notice, sticks it in, and closes the album very quickly.', feed: ['Dev opens the album to every page except the last one.'] },
          { evil: 3, label: 'Buy up every Phil Neville in Year 8. Auction him one.', cash: 1100, soul: -12, happy: -7, mono: 6, fanfare: ['MARKET CORNERED!', 'NEVILLE FUTURES!'], result: 'By Wednesday you own all thirty-eight Phil Nevilles in Year 8. Dev wins the auction against nobody, for £11, his Heskeys and a shiny Charizard he swore he’d never sell. You use the other thirty-seven as coasters.', feed: ['Thirty-seven kids now need Phil Neville. “Got, got, need” has been banned in 8D.', 'England went out in the group stage. Dev says it doesn’t matter. He’s got the full set.'] },
        ],
      },
      {
        id: 'f-discman', scene: { cast: ['ashley'] }, speaker: 'ashley',
        text: 'Ashley in Year 9 has a Discman with no anti-skip. He is listening to Groove Armada and has not moved since Monday in case it jumps. He is standing very still in the middle of the corridor. People walk round him like a bollard.',
        line: 'Don’t… breathe near me. It’s the good bit. It’s been the good bit for three days. I need to get to Maths.',
        options: [
          { evil: 0, label: 'Carry him to Maths. Very, very gently.', cash: 0, result: 'You carry him down two flights of stairs like a tray of drinks. It doesn’t skip once. At the door of Maths he whispers “thanks” without moving his lips. It’s still the good bit. It always will be.' },
          { evil: 1, label: 'Change his batteries without stopping the disc. £2.', cash: 200, soul: -1, result: 'You swap the AAs one at a time, like defusing a bomb. He can’t reach his pocket, so you take the £2 out of it yourself, with his blessing.' },
          { evil: 2, label: 'Charge everyone 50p to walk past him quietly.', cash: 550, soul: -6, happy: -4, fanfare: ['QUIET ZONE LICENSED!', 'TOLL ROAD OPEN!'], result: 'You set up a toll: 50p to pass Ashley in your socks. The whole of Year 8 pays. It is the quietest the corridor has ever been. The good bit continues.', feed: ['Year 8 was late for every lesson. The corridor now has a queue of people holding their shoes.'] },
          { evil: 3, label: 'Charge him to keep the Year 7s from jumping. Then let them jump.', cash: 1050, soul: -12, happy: -6, fanfare: ['SECURITY CONTRACT!', 'SERVICE DISRUPTION!'], result: 'He pays £10 for silence. At ten past, thirty Year 7s land at once. The disc skips back to track one. Ashley closes his eyes and starts again from the beginning.', feed: ['Ashley has been standing at the top of the stairs since Wednesday. The good bit is about forty minutes away.', 'Groove Armada’s fan club has sent him a letter of support. It was very relaxed.'] },
        ],
      },
      {
        id: 'f-photo', scene: { cast: ['year7s'] }, speaker: 'year7s',
        text: 'It’s school photo day. A Year 7 has a cowlick that has beaten three combs, a wet flannel and the photographer, who has gone to sit in his car. It stands straight up. It looks like it has opinions.',
        line: 'Mum’s ordering the big one for Nan’s mantelpiece. It’ll be up there for ever. Have you got any gel?',
        options: [
          { evil: 0, label: 'Lick your hand and help him flatten it.', cash: 0, result: 'You flatten it. It springs back. You flatten it again. Between you, you get it down just as the flash goes. In the photo he’s looking sideways at you, laughing, with the cowlick mid-spring. His nan says it’s the best one they’ve ever had.' },
          { evil: 1, label: 'Sell him a blob of Shockwaves gel. £2.', cash: 200, soul: -1, result: 'The cowlick sets like a fin. He looks like a dolphin. He is very happy about this. Dolphins are popular.' },
          { evil: 2, label: 'Sell him the tub. Then sell the whole queue “the look”.', cash: 600, soul: -6, happy: -4, fanfare: ['HAIRCARE VERTICAL!', 'TREND MANUFACTURED!'], result: 'The whole of 7K goes in front of the camera with the same rock-hard fin. The photographer comes back from his car, looks through the lens and goes back to his car.', feed: ['The 7K class photo looks like a shark tank. Three nans have rung the school.'] },
          { evil: 3, label: 'Gel it a foot straight up. Sell the photo to the Year 9s as a poster.', cash: 1100, soul: -12, happy: -7, fanfare: ['IMAGE RIGHTS ACQUIRED!', 'MERCH DROP!'], result: 'You tell him it’s the look this year. The flash goes. By lunch his face is on every Year 9 locker with a speech bubble. His mum has ordered the big one anyway.', feed: ['His nan has the photo on the mantelpiece. She says he looks “ever so tall”.', 'He has started wearing a woolly hat indoors. He’s been told off eleven times. He says it’s worth it.'] },
        ],
      },
      {
        id: 'f-exchange', scene: { cast: ['thibault'] }, speaker: 'thibault',
        text: 'Thibault, a French exchange student from Lyon, is staying with Dev. He learned one English phrase off a tape and uses it for everything. He believes the Turkey Twizzler is the national dish and has asked to see where they are grown.',
        line: 'Good morning. I would like to buy a return ticket to Margate, please.',
        options: [
          { evil: 0, label: 'Take him to the canteen. Show him a Twizzler.', cash: 0, result: 'Thibault looks at the Turkey Twizzler for a long time, like a man in the Louvre. He takes its picture with a disposable camera. That night he writes to his mother about it. Dev helps him spell “Twizzler”.' },
          { evil: 1, label: 'Teach him a second phrase. £2.', cash: 200, soul: -1, result: 'You teach him “Is it home time?” He says it to everybody, all day, with enormous hope.' },
          { evil: 2, label: 'Sell him a guided tour of the Twizzler fields. It’s the field.', cash: 600, soul: -6, happy: -4, fanfare: ['AGRITOURISM!', 'INTERNATIONAL EXPANSION!'], result: 'You walk him round the playing field and point at a puddle. He takes careful notes in French. You charge extra for the puddle.', feed: ['Thibault’s school project, “Les Champs de Twizzler”, got full marks in Lyon. Nobody in Lyon has checked.'] },
          { evil: 3, label: 'Sell him a return ticket to Margate. It’s a Blockbuster card.', cash: 1100, soul: -12, happy: -6, fanfare: ['EXPORT MARKET OPENED!', 'FOREIGN EXCHANGE!'], result: 'Thibault pays £11 in francs and a jar of his mum’s jam. He takes the Blockbuster card to the station, holds it up at the window and says “Good morning. I would like to buy a return ticket to Margate, please,” perfectly, for forty minutes.', feed: ['Thibault came back from the station with a late fee for Titanic.', 'The jam is in your locker. The label says “pour Thibault, en cas de tristesse”. It is very good jam.'] },
        ],
      },
      {
        id: 'f-millbug', scene: { bg: 'bikeshed', cast: ['gavin'] }, speaker: 'gavin',
        text: 'It is the last week before the millennium. Head Monitor Gavin has read in the Daily Mail that at midnight every computer will think it is 1900. The list of Senior Hall Monitors is on a computer. He has not slept. His sash is on inside out, for luck.',
        line: 'In 1900 I wasn’t a monitor, Tucker. Nobody was. At midnight the bikeshed belongs to whoever’s standing in it. It’ll be anarchy.',
        options: [
          { evil: 0, label: 'Write “GAVIN IS A MONITOR” on a bit of paper and give it to him.', cash: 0, result: 'He reads it, folds it into a perfect square and puts it in his top pocket. On the first of January he rings you at 12:01 to read it back to you. It still says GAVIN IS A MONITOR. He sounds like he might cry.' },
          { evil: 1, label: 'Sell him a backup: a Polaroid of him in the sash. £2.', cash: 200, soul: -1, result: 'You take the Polaroid. He shakes it for eleven minutes. It shows a boy in a sash looking slightly to the left. He says it’s “proof”, and keeps it in his blazer like a passport.' },
          { evil: 2, label: 'Sell him “bug-proofing” for the sash. £5. It’s Tipp-Ex.', cash: 600, soul: -6, happy: -4, fanfare: ['Y2K COMPLIANCE!', 'FUTURE-PROOFED!'], result: 'You paint the sash with Tipp-Ex in a pattern you describe as “a firewall”. Gavin stands very still while it dries. It says MONITOR 2000 now, in slightly smudged capitals.', feed: ['Gavin spent New Year’s Eve standing in the bikeshed in a white sash, alone, guarding it from 1900.', 'Gavin’s mum asked why his sash smells of nail varnish remover. He said “security”.'] },
          { evil: 3, label: 'Tell him the bug has hit early. He isn’t a monitor any more. Sell him his sash back.', cash: 1100, soul: -12, happy: -7, fanfare: ['SYSTEM RESTORE (PAID)!', 'LEGACY ASSET RECOVERED!'], result: 'Gavin goes very white and hands you the sash. You keep it for a whole lunchtime, then sell it back to him for £11 and a promise to look the other way in future. He signs the promise. He was always going to.', feed: ['Nothing happened at midnight. Gavin still checks the staffroom computer every morning to see if he exists.', 'Gavin has started looking the other way even when nobody is there. It has become a sort of posture.'] },
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
      {
        id: 'f-squash7', series: 'squash', step: 7, catchUp: true, scene: { cast: ['squatch', 'callum'] }, speaker: 'squatch',
        text: 'A seven-foot shaggy creature made entirely of undiluted orange squash has sloshed into the quad, leaving sticky orange footprints and a strong smell of Robinsons. It stops in front of Callum, seventeen now and still faintly purple from a Ribena problem in Year 4, and pulp drifts slowly through its chest. It has been looking for him for a very long time.',
        line: 'Callum… it’s Dad. I only popped out… for a bottle of squash. That was ten years ago. I’ve been… concentrating… ever since.',
        options: [
          { evil: 0, label: 'Fetch a jug of water and two glasses. Leave them to it.', cash: 0, result: 'Callum pours his dad a glass and his dad pours Callum one, and neither of them drinks. They sit on the bench in the drizzle while Callum explains Year 3 to Year 13, in order. His dad keeps saying “I missed that,” very quietly. He missed all of it.' },
          { evil: 1, label: 'Charge him for the footprints. £30, cleaning.', cash: 3000, soul: -1, result: 'He pays from somewhere inside himself. The coins are sticky and smell of childhood. Callum holds his hand anyway, which takes some doing, because it’s a liquid.' },
          { evil: 2, label: 'Film it. “Volt-Juice™ Presents: A Father Returns.” Sell the ad slots.', cash: 8000, soul: -6, happy: -5, fanfare: ['FAMILY CONTENT!', 'EMOTIONAL ENGAGEMENT: MAXIMUM!'], result: 'You get it in one take. Vince wanders into the back of the shot and gives a thumbs-up just as Callum says “Dad?” The ad tests extremely well with the focus group, three of whom have to go home.', feed: ['Callum’s reunion with his dad now plays before every assembly. Callum has seen it forty times. He has to clap at the end, because everyone’s looking.', 'Callum’s dad asked if he could have a copy of the video. He was sent a link to buy it.'] },
          { evil: 3, label: 'Invoice Callum a finder’s fee. Ten years, backdated, with interest.', cash: 13000, soul: -12, happy: -7, mono: 6, fanfare: ['FINDER’S FEE!', 'BACKDATED IN FULL!'], result: 'You hand Callum the invoice in the middle of his first hug in ten years. He agrees to pay it out of his Saturday job. His dad tries to help with the money, so you charge him as well, as technically he is the item that was found.', feed: ['Callum has taken a second Saturday job to pay for finding his dad. He doesn’t get to see him on Saturdays now.', 'Callum’s dad waits for him at the gates every evening. On sunny days he gets a bit thicker. On rainy days you can’t tell where he ends.'] },
        ],
      },
      {
        id: 'f-squash8', series: 'squash', step: 8, scene: { bg: 'office', cast: ['callum', 'squatch'] }, speaker: 'callum',
        text: 'Callum is diluting his dad back into a normal man, one glass of water at a time. It’s going well: the Squashquatch is down to six foot two, there is very nearly a moustache, and on Tuesday he remembered Callum’s birthday. They’ve asked to use your office, because it has a sink.',
        line: 'He knows my middle name now, Tuck. Two more jugs and he can come to parents’ evening. He’s never been to a parents’ evening. He’s really nervous.',
        options: [
          { evil: 0, label: 'Give them the office, the sink and the good chair. Every lunchtime.', cash: 0, result: 'Every lunchtime Callum pours, his dad drinks, and they talk. By Friday there is a slightly orange man in a cardigan, a bit sticky round the edges, asking Callum what he wants for tea. Callum says “squash”, and they laugh until the sink overflows.' },
          { evil: 1, label: 'Charge for the water. It’s office water. 20p a glass.', cash: 3000, soul: -1, result: 'Callum pays for every glass without complaining. It takes a hundred and fifty glasses to get one dad. It works out very reasonable, for a dad.' },
          { evil: 2, label: 'Bottle the runoff. “Squashquatch Sport: now with real Dad.”', cash: 9000, soul: -6, happy: -5, fanfare: ['SPORTS DRINK LAUNCHED!', 'NOW WITH REAL DAD!'], result: 'Whatever his dad doesn’t need any more goes into bottles with a lightning bolt on them. It sells out to Year 11s before their mocks. Callum sees the bottles in the vending machine and says nothing, because you can’t ask a vending machine for your dad back.', feed: ['A Year 11 drank three bottles of Squashquatch Sport and rang Callum’s nan to ask how she was keeping.', 'Callum’s dad is shorter than he ought to be. Some of him is in Year 11.'] },
          { evil: 3, label: 'Bottle him before he’s diluted. Squashquatch: Dad Strength.', cash: 14000, soul: -12, happy: -8, mono: 6, fanfare: ['DAD STRENGTH™!', 'LIMITED EDITION FATHER!'], result: 'Callum signs the release form in purple. You get eleven hundred bottles out of his dad before the water goes in, each with his sad, shaggy face on the label and the slogan NEVER DILUTE. Callum buys one. He keeps it on his windowsill and says goodnight to it.', feed: ['Dad Strength is the fastest-selling product in Tuck Enterprises™ history. The small print says “Do not add water.”', 'A Year 8 diluted a bottle anyway. A very small man in a cardigan climbed out and asked him where Callum was.'] },
        ],
      },
      {
        id: 'f-desmond4', series: 'desmond', step: 4, catchUp: true, scene: { cast: ['desmond17'] }, speaker: 'desmond17',
        text: 'Desmond has been practising law since Year 4, when he charged a Panini sticker an hour and kept a satsuma in his briefcase. He is seventeen now and still not a lawyer, but he has a real tie, the same briefcase and, he insists, the same satsuma. He is bringing a class action against Volt-Juice™ on behalf of every Year 10 whose heartbeat can be heard from across the room.',
        line: 'Two hundred and twelve clients, Mr Tuck. Palpitations, mostly. One boy can see sounds. We’ll settle for a fair sum, or four thousand Panini stickers. My clients prefer the stickers.',
        options: [
          { evil: 0, label: 'Admit it. Sign the settlement on his briefcase.', cash: 0, result: 'Desmond reads the settlement aloud to all two hundred and twelve plaintiffs in the quad. They get a warning label and four thousand Panini stickers. When he opens the briefcase to file it, you see the satsuma. It is grey. He touches it, gently, for luck.' },
          { evil: 1, label: 'Settle for a free can each. Charge him the court costs.', cash: 3000, soul: -1, result: 'Desmond pays the court costs, which come to £30 and the bench you were sitting on. He thanks the court. The court is you.' },
          { evil: 2, label: 'Countersue the plaintiffs for drinking it wrong.', cash: 8000, soul: -6, happy: -5, fanfare: ['COUNTERSUIT WON!', 'PLAINTIFFS LIABLE!'], result: 'Desmond is out-lawyered by a laminated sheet that says DRINKING IT WRONG. Each Year 10 is ordered to pay damages to the can. Desmond shakes your hand and asks, very sincerely, where you trained.', feed: ['The Year 10s drink Volt-Juice very carefully now, with both hands, in case it sues them again.', 'Desmond has stuck a Post-it inside his briefcase that says “DRINKING IT WRONG?” He is researching it every night.'] },
          { evil: 3, label: 'Retain Desmond for both sides. Bill his clients by the hour.', cash: 13000, soul: -12, happy: -7, mono: 6, fanfare: ['CONFLICT OF INTEREST!', 'BOTH SIDES BILLED!'], result: 'Desmond represents the plaintiffs in the morning and Volt-Juice™ in the afternoon. He loses both, very thoroughly. His clients are billed for every hour in money, and he is paid in stickers.', feed: ['Desmond has been seen in the quad at lunchtime, arguing with himself in two different ties.', 'Two hundred and twelve Year 10s owe legal fees for a case they lost to their own lawyer. The boy who sees sounds says invoices are a sort of beige.'] },
        ],
      },
      {
        id: 'f-desmond5', series: 'desmond', step: 5, scene: { cast: ['desmond17'] }, speaker: 'desmond17',
        text: 'Desmond is suing Time. He has drafted the papers himself: Time took his childhood, his Panini collection and very nearly the satsuma, which is now the size and texture of a walnut. He needs someone to serve the papers.',
        line: 'Desmond versus Time, Mr Tuck. Nine years in practice and no qualifications. Somebody has to be accountable. I’m told you know where Time goes.',
        options: [
          { evil: 0, label: 'Sit with him on the steps. Agree that Time did it.', cash: 0, result: 'You sit on the steps and agree that Time did it, absolutely, and ought to be ashamed of itself. Desmond nods and loosens his tie for the first time since Year 4. The bell goes. Neither of you gets up for a bit.' },
          { evil: 1, label: 'Sell him a clock to serve the papers on. £30.', cash: 3000, soul: -1, result: 'Desmond serves the papers on a kitchen clock from the DT room. It doesn’t stop. He says that counts as contempt of court.' },
          { evil: 2, label: 'Fund the case. Half of whatever Time pays out. Fees up front.', cash: 7000, soul: -6, happy: -4, fanfare: ['LITIGATION FUNDED!', 'TIME-BASED BILLING!'], result: 'Desmond signs the funding agreement and pays the fees up front while Time considers its response. Time is famously slow to respond.', feed: ['Desmond checks his pigeonhole every morning for a reply from Time. Gary is often in it. Gary is not Time.', 'Desmond has asked the court for an extension. It’s the one thing he can’t get.'] },
          { evil: 3, label: 'Represent Time. Countersue for nine years’ use. Take the satsuma.', cash: 13000, soul: -12, happy: -6, mono: 6, fanfare: ['TIME REPRESENTED!', 'HISTORIC SATSUMA ACQUIRED!'], result: 'Time wins on every count. Desmond is ordered to pay for nine years of being nine, ten, eleven and so on, and to surrender his briefcase and its contents. You sell the satsuma to the focus group, who taste it and describe it as “Year 4”.', feed: ['Desmond came in without a briefcase today. He kept reaching for it. His hand closed on nothing, very professionally.', 'The focus group has asked for more satsuma. There is no more satsuma. There was only ever one.'] },
        ],
      },
      {
        id: 'f-wellness1', series: 'wellness', step: 1, scene: { cast: ['crane'] }, speaker: 'crane',
        text: 'Mr Crane has launched Wellness Wednesdays, which are compulsory. The new Head of Wellbeing is a large purple beanbag called Brenda, procured on a framework contract, with her own lanyard. Every student must sit in Brenda for ten minutes and “decompress”, and the queue goes round the science block.',
        line: 'Brenda has an open-door policy, Tucker. She doesn’t have a door. That’s how open it is.',
        options: [
          { evil: 0, label: 'Join the queue. Sit in Brenda when it’s your turn.', cash: 0, result: 'You sit in Brenda for ten minutes. She lets out a slow sigh through a seam. You don’t think about money once, which is frightening, then nice, then frightening again.' },
          { evil: 1, label: 'Run the queue. Timed slots, 20p.', cash: 3000, soul: -1, result: 'Order is restored to wellbeing. A Year 12 decompresses so hard in her slot that she has to be helped out by two friends and a ruler.' },
          { evil: 2, label: 'Sell Priority Decompression passes. A fast lane to Brenda.', cash: 8000, soul: -6, happy: -5, fanfare: ['WELLNESS: PREMIUM TIER!', 'FAST-TRACK CALM!'], result: 'The fast lane is a strip of gaffer tape next to the slow lane. People in the slow lane stand and watch people in the fast lane be calm. It makes them very tense, which is great for the fast lane.', feed: ['A Year 12 has been in the slow lane for Brenda since last Wednesday. She says she’s fine. Her eye is going.', 'Mr Crane has reported a record rise in demand for wellness. He has asked the governors for a second Brenda.'] },
          { evil: 3, label: 'Buy Brenda’s contract. Wellness is a subscription now.', cash: 13000, soul: -12, happy: -7, mono: 6, fanfare: ['WELLBEING ACQUIRED!', 'BRENDA™!'], result: 'Brenda is a Tuck Enterprises™ asset now. Students pay monthly to sit in her and a cancellation fee to stand up. Mr Crane gives a short speech about partnership and sits in her for free, which is in the contract.', feed: ['A Year 13 couldn’t afford the cancellation fee and has been in Brenda since Tuesday. Her friends bring her lunch and her A-level notes.', 'Brenda has a sticker on her now that says “Wellness, powered by Volt-Juice™”. She sags a bit lower on that side.'] },
        ],
      },
      {
        id: 'f-wellness2', series: 'wellness', step: 2, scene: { bg: 'corridor', cast: ['sixthformer'] }, speaker: 'sixthformer',
        text: 'Brenda the beanbag has been promoted to Assistant Head (Vibes). She has her own office, which used to be the PE cupboard, and a little nameplate. A Year 12 has been booked in for a compulsory one-to-one with her and told that if she doesn’t feel better by Friday it goes on her file.',
        line: 'What do I say to her? Do I say anything? Mr Crane says she’s a brilliant listener. He says she’s never interrupted him once.',
        options: [
          { evil: 0, label: 'Go in with her. Do most of the talking to Brenda yourself.', cash: 0, result: 'You sit in the PE cupboard and tell a beanbag you’re fine, which she clearly doesn’t believe. The Year 12 laughs until she cries, then just cries, then feels better by Thursday. It goes on her file anyway. The file says “improving”.' },
          { evil: 1, label: 'Sell her a script. “Things to Say to a Beanbag.” £30.', cash: 3000, soul: -1, result: 'The script says “Thank you, Brenda” eleven times and “I feel seen” once. She reads it word for word. Brenda signs her off.' },
          { evil: 2, label: 'Buy up Brenda’s diary. Sell the slots on.', cash: 7000, soul: -6, happy: -5, fanfare: ['CALENDAR MONETISED!', 'VIBES: FULLY BOOKED!'], result: 'Brenda is booked solid until July. Anyone who needs to feel better by Friday has to buy a slot off someone who doesn’t. The PE cupboard has a waiting list taped to it, and the waiting list has a waiting list.', feed: ['The Year 12 couldn’t get a slot with Brenda and has been marked “not yet better”. It’s on her file. She has a file now.', 'Somebody has been seen in the PE cupboard after hours, sitting in Brenda, crying. It’s Mr Crane.'] },
          { evil: 3, label: 'Sit in as Brenda’s line manager. Bill the session by the minute.', cash: 13000, soul: -12, happy: -6, mono: 6, fanfare: ['LINE MANAGEMENT!', 'BILLABLE FEELINGS!'], result: 'You sit beside Brenda with a clipboard and say “And how does that make you feel?” and “That’s ten minutes.” The Year 12 is billed for a session, an assessment and the beanbag’s time. She leaves feeling worse, which you write down as progress.', feed: ['The Year 12 has been booked in for a follow-up with Brenda, which she has to pay for, about how the first one went.', 'Mr Crane has given Brenda a pay rise. Brenda doesn’t get paid. It goes to you.'] },
        ],
      },
      {
        id: 'f-wellness3', series: 'wellness', step: 3, scene: { bg: 'corridor', cast: ['crane'] }, speaker: 'crane',
        text: 'Brenda has burst. She had been doing one-to-ones with the entire sixth form, and Mr Crane, and it turns out a beanbag can only hold so much. Ten thousand polystyrene beans are drifting down the corridor, sticking to everything, and Mr Crane is on his knees trying to scoop them back in with a lanyard.',
        line: 'She held all of it, Tucker. Every Wednesday. She never once said it was too much. She never said anything. That should have been a sign.',
        options: [
          { evil: 0, label: 'Kneel down and help him put every bean back. Sew her up.', cash: 0, result: 'It takes the whole of lunch and most of fifth period. You sew Brenda up with a needle from Textiles, and she comes out lumpy and leaning to one side. Mr Crane lowers himself into her very gently and says “There she is.” He doesn’t wink. He just says thank you.' },
          { evil: 1, label: 'Sell him a dustpan and brush. £30.', cash: 3000, soul: -1, result: 'Mr Crane sweeps up Brenda on his own, bean by bean. He apologises to her the whole way down the corridor.' },
          { evil: 2, label: 'Sell the beans. “A Piece of Brenda”, in a little jar.', cash: 9000, soul: -6, happy: -5, fanfare: ['HERITAGE MERCH!', 'WELLNESS RELICS!'], result: 'Brenda sells better in pieces. Everyone who ever decompressed in her wants a jar, and some want two. Mr Crane buys the last jar and holds it in both hands all through assembly.', feed: ['The sixth-form common room is full of little jars of Brenda. Nobody knows how to sit down any more.', 'Mr Crane keeps his jar of Brenda on his desk, next to the envelope.'] },
          { evil: 3, label: 'Sell the beans. Then sell Mr Crane a new Brenda. It’s a bin bag.', cash: 14000, soul: -12, happy: -7, mono: 6, fanfare: ['BRENDA II™!', 'LEGACY PRODUCT REPLACED!'], result: 'Brenda II is a black bin bag stuffed with Volt-Juice packaging, wearing the old lanyard. Mr Crane pays for her out of the wellbeing budget, then the contract budget, then his own wallet. He sits in her every Wednesday. She rustles. He says she’s “not the same, but she’s trying”.', feed: ['On Thursday the bin men took Brenda II. Mr Crane chased the lorry to the end of the road in his good shoes.', 'The sixth form is still finding beans: under keyboards, in shoes, in the Head’s tea. Nobody throws them away. It feels wrong.'] },
        ],
      },
      {
        id: 'f-holiday', scene: { bg: 'office', cast: ['biff'] }, speaker: 'biff',
        text: 'Biff has read the staff handbook. It is the first thing he has ever read all the way through. It says holiday at Tuck Enterprises™ is “unlimited”, and he would like one day, to take his nan to Skegness.',
        line: 'Just the one day, boss. She’s never seen the sea. She’s seen a picture of it. She said it looked like “a lot”.',
        options: [
          { evil: 0, label: 'Give him the day. Paid. Buy his nan a stick of rock.', cash: 0, result: 'Biff sends you a postcard from Skegness. It’s a drawing of his nan standing in the sea up to her knees, holding the rock like a sword. On the back it just says SHE SAYS IT IS A LOT.' },
          { evil: 1, label: 'Approve it. Unpaid. Unlimited doesn’t mean paid.', cash: 3000, soul: -1, result: 'Biff goes to Skegness unpaid. He brings you back a stick of rock anyway. It says TUCK all the way through. He had it made.' },
          { evil: 2, label: 'Approve it. Dock him for the day, the cover and the paperwork.', cash: 8000, soul: -6, happy: -4, fanfare: ['UNLIMITED LEAVE™!', 'ADMIN COSTS RECOVERED!'], result: 'Biff takes his day and comes back owing you money. He pays in coins that still have sand in them. He doesn’t complain. He says his nan put her feet in, and that was worth it.', feed: ['Biff has worked out that his day at the seaside cost him a week. He isn’t angry. He’s doing the sum again, slowly, in case.', 'Biff’s nan has a photo of the sea on her fridge now, next to the picture of the sea.'] },
          { evil: 3, label: 'Approve it. Send Biffer to cover. Charge Biff for Biffer.', cash: 13000, soul: -12, happy: -6, mono: 6, fanfare: ['COVER ARRANGED!', 'STAFF COSTS RECHARGED!'], result: 'Biffer covers Biff’s shift, in a different hat. Biff pays Biffer’s day rate, Biffer’s travel and Biffer’s lunch. Nobody has ever seen Biff and Biffer in the same room, and on Thursday nobody sees Biff in Skegness either.', feed: ['Biff’s nan went to Skegness on her own, on the coach. She says she had a lovely day. She brought back two sticks of rock, in case.', 'Biffer has asked for a day off. Biff is covering.'] },
        ],
      },
      {
        id: 'f-hotdesk', scene: { bg: 'corridor', cast: ['intern'] }, speaker: 'intern',
        text: 'Tuck Enterprises™ has taken on a Year 10 for work experience. His name is Oliver, he is wearing his dad’s suit, and his lanyard comes down to his knees. Since the move to hot-desking there are eleven desks for twelve people, and Oliver has spent the week working off the radiator in the corridor.',
        line: 'It’s fine. It doesn’t come on, so it’s more of a shelf. My dad says to make myself indispensable.',
        options: [
          { evil: 0, label: 'Give him your desk. Sit on the radiator yourself.', cash: 0, result: 'Oliver sits at your desk as though a man with a clipboard might take it away. He makes everybody a cup of tea, writes them each a little note of how they take it, and doesn’t get one wrong all week.' },
          { evil: 1, label: 'Book him a desk. 20p an hour.', cash: 3000, soul: -1, result: 'Oliver books a desk from nine till four and pays in advance. In his work experience diary he writes: “Gained valuable experience of booking.”' },
          { evil: 2, label: 'Rent him the radiator. It’s a breakout space now.', cash: 8000, soul: -6, happy: -5, fanfare: ['REAL ESTATE OPTIMISED!', 'BREAKOUT SPACE MONETISED!'], result: 'The radiator gets a little sign that says BREAKOUT and a weekly rate. Oliver pays it out of his dinner money. He is very proud to have his own space.', feed: ['Oliver’s work experience diary says Thursday: “Lunch: radiator.” Friday: “Lunch: no.”', 'Oliver’s dad came to collect him and asked where his desk was. Oliver pointed at the radiator and said “Mine,” proudly.'] },
          { evil: 3, label: 'Take his chair too. Charge him for the standing desk.', cash: 13000, soul: -12, happy: -6, mono: 6, fanfare: ['STANDING DESK ROLLED OUT!', 'ERGONOMICS: PREMIUM!'], result: 'The standing desk is Oliver, standing, holding his laptop at chest height. You charge the premium rate, because standing desks are good for you. In his feedback form he gives you five stars for “wellbeing”.', feed: ['Oliver has been offered a job at Tuck Enterprises™ after his GCSEs. He said yes before he sat down, because he couldn’t sit down.', 'Oliver’s mum asked him why his legs hurt. He said, “That’s just business, Mum.” He’s fourteen.'] },
        ],
      },
      {
        id: 'f-motto', scene: { bg: 'corridor', cast: ['head'] }, speaker: 'head',
        text: 'Carved over the main door since 1874 is the school motto, EX PARVIS MAGNA: “from small things, great things”. Mr Crane wants something “more agile” for the new Campus brand. The Headteacher has been sent out with a chisel and has been standing under it for an hour.',
        line: 'My grandfather went here, Tucker. He used to touch the door on the way in, for luck. He was very unlucky, but he did always touch it.',
        options: [
          { evil: 0, label: 'Take the chisel off him. Tell Mr Crane it’s load-bearing.', cash: 0, result: 'Mr Crane accepts that the motto is load-bearing and goes off to rebrand something else. The Headteacher touches the door on his way back in. So do you, without quite meaning to.' },
          { evil: 1, label: 'Sell him a brass plaque to go underneath. £30.', cash: 3000, soul: -1, result: 'The plaque says EX PARVIS MAGNA (MOTTO), in case anyone wondered. The Head polishes it on Mondays.' },
          { evil: 2, label: 'Sell the naming rights. “Ex Parvis Magna, powered by Volt-Juice™.”', cash: 8000, soul: -6, happy: -5, fanfare: ['HERITAGE SPONSORED!', 'LATIN MONETISED!'], result: 'A sticker of a can goes up under the carving. From the car park it looks as if the Latin is drinking it.', feed: ['The Latin teacher now translates the motto as “From small things, great things, with taurine.”', 'The Headteacher touches the sticker on his way in now. It isn’t the same. He does it anyway.'] },
          { evil: 3, label: 'Chisel it off. Sell the letters to old boys. Carve MOVE FAST.', cash: 13000, soul: -12, happy: -6, mono: 6, fanfare: ['LEGACY ASSET LIQUIDATED!', 'BRAND REFRESH COMPLETE!'], result: 'Old boys come from as far as Doncaster to buy a letter. The M goes to a man who only ever wanted the M. Over the door it now says MOVE FAST in a lovely sans-serif, the only instruction the building has ever given.', feed: ['The Headteacher bought the G. He keeps it on his desk and touches it in the mornings. It doesn’t help.', 'Nobody can find the second A. Gary is sitting on something on the bikeshed roof and won’t get up.'] },
        ],
      },
      {
        id: 'f-foam', scene: { cast: ['maureen', 'sixthformer'] }, speaker: 'maureen',
        text: 'Dinner Lady Maureen has been poached by the sixth-form canteen, which is now called The Hub and only does flat whites. She reads the future in the foam. She has just looked into a Year 12’s cup, gone very pale and put it down.',
        line: 'The foam has spoken, Tucker. It’s about her. It’s about Thursday. It’s always about Thursday.',
        options: [
          { evil: 0, label: 'Ask Maureen to tell her gently. Buy them both a biscuit.', cash: 0, result: 'Maureen tells her, gently, that on Thursday she will find a pound in a coat. On Thursday she finds a pound in a coat. She buys Maureen a biscuit with it and they split it, which the foam had not foreseen.' },
          { evil: 1, label: 'Sell her the reading. 20p, with a muffin.', cash: 3000, soul: -1, result: 'The reading says “Thursday: a bus.” She pays, and on Thursday she gets a bus. It is a perfectly normal bus. She seems almost disappointed.' },
          { evil: 2, label: 'Rebrand it as predictive analytics. Sell forecasts to Mr Crane.', cash: 9000, soul: -6, happy: -4, fanfare: ['PREDICTIVE ANALYTICS!', 'FOAM-AS-A-SERVICE!'], result: 'Mr Crane buys a quarterly foam forecast for the senior leadership team. Maureen reads it out in the staffroom, in her hairnet, while they take notes. The foam predicts “a long envelope”. Mr Crane winks at nobody.', feed: ['Maureen has been asked to put the foam forecasts in a spreadsheet. The foam does not like the spreadsheet.', 'The senior leadership team has cancelled Thursday, on the foam’s advice.'] },
          { evil: 3, label: 'Read the cup yourself. Say “ooh”. Sell her the antidote: a large flat white.', cash: 13000, soul: -12, happy: -7, mono: 6, fanfare: ['FEAR-BASED UPSELL!', 'FUTURE MONETISED!'], result: 'You squint into her cup and say “ooh”. She buys a large flat white to cancel it out, then another, then a muffin, just in case. Maureen watches you over the steam like a woman whose foam has been taken in vain.', feed: ['The Year 12 hasn’t left the house on a Thursday since. She does Thursday’s lessons by phone, from under the stairs.', 'Maureen has stopped reading the foam. She just makes the coffee and looks at you, every single time.'] },
        ],
      },
      {
        id: 'f-appraisal', scene: { bg: 'office', cast: ['vince'] }, speaker: 'vince',
        text: 'It’s appraisal season. Voltage Vince, the man in the Volt-Juice™ can, has had his 360-degree feedback back. He can only see about forty degrees out of the can, so most of it came as a surprise.',
        line: 'They said I need to work on my visibility, Mr Tuck. I’m a seven-foot can. I don’t know how to be more visible. I could stand nearer things.',
        options: [
          { evil: 0, label: 'Write him a glowing review. Every box: “exceeds”.', cash: 0, result: 'Vince reads the review through the little mouth-hole, a line at a time, turning slowly. When he gets to “exceeds”, the can makes a noise like a kettle coming to the boil. He asks if he can keep it. He keeps it in the can.' },
          { evil: 1, label: 'Give him a fair review. Charge him for the appraisal workshop. £30.', cash: 3000, soul: -1, result: 'Vince sits through a one-hour appraisal workshop and takes notes on the inside of the can. He gets “meets expectations”, which he describes as “massive”.' },
          { evil: 2, label: 'Put him on an improvement plan. Charge him for the coaching.', cash: 8000, soul: -6, happy: -4, fanfare: ['PERFORMANCE MANAGED!', 'COACHING UPSOLD!'], result: 'Vince’s improvement plan says “be more visible”, “be more can” and “smile with the whole can”. He pays for weekly coaching, which is Josh pointing at him and saying “synergy”.', feed: ['Vince has been practising being more can in the boys’ toilets. He can’t fit in front of the mirror, so he practises at the hand dryer.', 'Vince’s improvement plan has been extended. He has improved. It has been extended anyway.'] },
          { evil: 3, label: 'Rate him “below can”. Make him reapply for his own job. Lease him the can.', cash: 13000, soul: -12, happy: -6, mono: 6, fanfare: ['ROLE RESTRUCTURED!', 'CAN LEASED BACK!'], result: 'Vince reapplies for his own job in front of a panel of Year 7s. He gets it, on a lower grade, on a new contract, and the can is now a lease. He signs with a pen held in his teeth, because he can’t reach the desk with his arms. He never could.', feed: ['Vince is paying off the can in monthly instalments. When it’s paid off it will be his. He says he’ll keep wearing it afterwards, for sentimental reasons.', 'Vince’s mam rang to ask why his wages had gone down. He told her he’d been restructured. She asked if it hurt.'] },
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

  /* Small print along the bottom of the Sixth Form's flat, corporate world. */
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

  // The morning after the player buys the last improvement at a school (once per run),
  // somebody shows them the maths. Only then. Tokens: {spent}, {pct}, {goal}.
  const treadmillReveal = {
    teller: {
      1: 'Priya has done the maths in her rough book. She shows it to you gently, the way a vet shows you an X-ray.',
      2: 'Josh has done the maths on the blackboard, in chalk, at a size you can see from the corridor. A small crowd has formed. Someone is taking notes.',
      3: 'A folder has been left on your desk. Nobody hired an auditor. The folder is very thin. Gary is sitting on it.',
    },
    lines: [
      'Since your first improvement, you have spent {spent} improving the business.',
      'In that time, everything you sell has gone up {pct}. Everything you owe has gone up {pct}. {goal} has gone up {pct}.',
      'Every price in the world rose by exactly what you put into it. You are precisely where you would have been. Minus {spent}.',
      'It was never going to work. It was always going to cost {spent}.',
    ],
    button: 'Oh.',
    // Bedtime, the night the last improvement is bought.
    allBought: 'There is nothing left to improve. The business is fully improved. You sleep like a baby, which is to say you wake up twice, crying, for no reason you can name.',
    // Bedtime, every night after the reveal.
    shop: 'You know what these do now. You lie awake looking at them anyway.',
  };

  T.content = { people, tuckLook, acts, story, milestones, fillers, idles, freezeEscalation, finalIdles, ending, adDisclaimers, awkward, interludes, evenings, upgrades, followUps, treadmillReveal };
})();
