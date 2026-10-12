/*
 * TUCK — game state machine.
 *
 * Turn-based school days: morning break, lunch, afternoon break, home time.
 * The clock only moves when the player carries on, so there is always time
 * to read what just happened.
 *
 * Money only comes from choices. Exploiting someone pays immediately, and the
 * consequence comes back later: as a "Meanwhile…" scene before the next
 * encounter, and in the home-time recap. Choosing the decent thing pays
 * nothing and earns nothing: time stops for an awkward, open-ended wait, then
 * the moment passes. Every day ends with dues to pay. If you can't pay, nobody
 * goes home until you find the money.
 */
(function () {
  const T = window.Tuck;
  const C = T.content;
  const R = T.render;
  const A = T.audio;

  const DAY_START = 530; // 08:50
  const SLOTS = [
    { t: 615, label: 'Morning break.' },
    { t: 750, label: 'Lunch.' },
    { t: 860, label: 'Afternoon break.' },
  ];
  const HOME_T = 925; // 15:25
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const SAVE_KEY = 'tuck-save-v2';
  const AWKWARD_MS = 22000; // how long the decent choice leaves you standing there
  const BEAT_MS = 5200; // how often the awkward wait drifts a line into the log

  const $ = (s) => document.querySelector(s);
  const el = {};
  let S = null;
  let cardOpen = false;
  let pendingContinue = null; // what "Carry on" does right now
  let anim = null; // clock animation between beats
  let awkwardTimer = null, beatTimer = null, finalTimer = null;

  /* ---------------- helpers ---------------- */
  function fmt(p) {
    const neg = p < 0;
    p = Math.round(Math.abs(p));
    let s;
    if (p < 100) s = p + 'p';
    else if (p % 100 === 0) s = '£' + (p / 100).toLocaleString('en-GB');
    else s = '£' + (p / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (neg ? '−' : '') + s;
  }
  function clock(min) {
    const m = Math.floor(min);
    const h = Math.floor(m / 60), mm = m % 60;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
  const act = () => C.acts[S.act];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  /* ---------------- money (with the hidden treadmill) ---------------- */
  // Tuck-shop upgrades multiply every payout by S.mult. Without telling the player,
  // dues, prices and targets scale by exactly the same factor.
  function scale(p) {
    const v = p * (S.mult || 1);
    return Math.abs(v) < 5 ? Math.round(v) : Math.round(v / 5) * 5;
  }
  function duesToday() {
    const a = act();
    const days = Math.min(S.day - 1, a.duesDays != null ? a.duesDays : 99);
    return scale((a.dues || 0) + (a.duesStep || 0) * days);
  }
  function target() { return scale(act().target || 0); }

  function fill(str, extra = {}) {
    return str.replace(/\{(\w+)\}/g, (_, k) => {
      if (k === 'cash') return fmt(S.cash);
      if (k === 'dues') return fmt(duesToday());
      if (k === 'target') return fmt(target());
      if (k === 'time') return clock(S.minute);
      if (k in extra) return extra[k];
      return '';
    });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function newState(gen = 1) {
    return {
      v: 2, gen,
      act: 1, day: 1, slot: 0, minute: 605, cash: 0,
      soul: 100, happy: 100, mono: 5,
      storyIdx: 0, flags: {},
      feed: [], later: [], home: [], seen: [],
      stats: { extracted: 0, harmed: 0, kind: 0, freezes: 0, raindrops: 0, idles: 0, wasted: 0, waitedMs: 0, beyond: 0, improved: 0 },
      cruelty: 0,
      current: null, freeze: null, phase: 'title', lastFiller: -1,
      mult: 1, bought: [], followups: [], used: {}, series: {},
    };
  }

  /* ---------------- save / load ---------------- */
  // Saved at the start of each day.
  function save() {
    if (!S || S.act >= 4) return;
    try {
      const copy = Object.assign({}, S, { current: null, freeze: null, phase: 'play' });
      localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
    } catch (e) { /* storage unavailable — fine */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }

  /* ---------------- scene ---------------- */
  function person(id) {
    const base = C.people[id];
    if (!base) return null;
    const p = Object.assign({}, base);
    // older kids get the uniform of whichever school we're at
    if (!p.adult && !p.blazer && S.act >= 2 && !['newkid', 'cryer', 'leaver', 'year2'].includes(id)) {
      p.blazer = S.act === 2 ? '#1f2f6b' : '#2c2c2c';
      p.shirt = '#ffffff';
      p.tie = S.act === 2 ? '#b71c1c' : '#ffcc00';
      p.trousers = '#2b2f3a';
      if (S.act >= 4 && id === 'biff') p.mood = 'sad';
    }
    if (id === 'gary' && S.act === 3) p.tie = true;
    return p;
  }
  function sceneFor(enc, extra = {}) {
    const a = act();
    const sc = (enc && enc.scene) || {};
    const style = sc.style || a.style;
    const tuck = C.tuckLook(S.act, S.soul);
    if (sc.tuckSad) tuck.mood = 'sad';
    if (sc.tuckSit) tuck.sitting = true;
    let cast = (sc.cast || []).map(person).filter(Boolean);
    const r = extra.reaction;
    if (r === 'exploit') { tuck.mood = S.act >= 4 ? 'sad' : 'smug'; cast.forEach((c) => (c.mood = c.adult ? 'sad' : 'crying')); }
    if (r === 'decent') cast.forEach((c) => (c.mood = 'happy'));
    if (r === 'aftermath') cast.forEach((c) => (c.mood = c.adult ? 'sad' : 'crying'));
    return Object.assign({
      style,
      bg: sc.bg || a.bg,
      cast,
      rain: !!sc.rain,
      bench: !!sc.bench,
      fountain: !!sc.fountain,
      noTuck: !!sc.noTuck,
      ambient: !enc && S.act < 4,
      ambientPlay: !!sc.ambientPlay,
      act: S.act,
      minute: S.minute,
      happy: S.happy,
      schoolName: (sc.school || a.school).toUpperCase(),
      tuck,
      frozen: false,
      final: false,
    }, extra);
  }
  function showScene(enc, extra, opts) { R.setView(sceneFor(enc, extra), opts); }

  /* ---------------- HUD ---------------- */
  function hud() {
    const a = act();
    el.school.textContent = window.innerWidth < 560 ? (a.short || a.school) : a.school;
    el.day.textContent = S.act < 4 ? `${DAYS[(S.day - 1) % 5]}${a.goal ? ' · ' + a.goal : ''}` : 'Monday';
    el.time.textContent = clock(S.minute);
    el.time.classList.toggle('frozen', !!S.freeze);
    el.cash.textContent = fmt(S.cash);
    el.feedTitle.textContent = a.feedTitle;
  }

  /* ---------------- feed (the log) ---------------- */
  function pushFeed(text, cls = '') {
    S.feed.unshift({ t: `${S.act < 4 ? DAYS[(S.day - 1) % 5].slice(0, 3) : 'Mon'} ${clock(S.minute)}`, text, cls });
    S.feed = S.feed.slice(0, 80);
    renderFeed(true);
    if (cls !== 'sep') {
      el.ticker.textContent = text;
      el.ticker.classList.remove('new');
      void el.ticker.offsetWidth;
      el.ticker.classList.add('new');
    }
  }
  function renderFeed(fresh) {
    const html = S.feed
      .map((f, i) => `<li class="${f.cls}${fresh && i === 0 ? ' new' : ''}"><time>${f.t}</time>${esc(f.text)}</li>`)
      .join('');
    el.feedList.innerHTML = html;
    el.logList.innerHTML = html || '<li class="biz">Nothing yet.</li>';
  }
  function toggleLog(force) {
    const show = force != null ? force : el.log.hidden;
    el.log.hidden = !show;
    if (show) { el.logTitle.textContent = act().feedTitle; renderFeed(); }
  }

  /* ---------------- fanfare popups ---------------- */
  function popups(list, cash) {
    list = (list || []).filter((t) => !/£\d|\d+p\b/.test(t));
    if (cash > 0) list.unshift(`+${fmt(cash)}!`);
    if (!list.length) return;
    A.fanfare(act().style);
    list.forEach((txt, i) => {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'pop';
        d.textContent = txt;
        d.style.left = 35 + Math.random() * 30 + '%';
        d.style.top = 18 + i * 16 + '%';
        el.fx.appendChild(d);
        setTimeout(() => d.remove(), 2000);
      }, i * 280);
    });
  }

  /* ---------------- panel helpers ---------------- */
  function showPanel(which) {
    el.dialogue.hidden = which !== 'dialogue';
    el.freeze.hidden = which !== 'freeze';
  }
  // A single "Carry on" beat in the story panel.
  function beat({ speaker = '', kicker = '', html, label = 'Carry on', then }) {
    el.dSpeaker.textContent = speaker;
    el.dText.innerHTML = (kicker ? `<p class="kicker">${esc(kicker)}</p>` : '') + html;
    el.dOptions.innerHTML = '';
    const b = document.createElement('button');
    b.className = 'opt opt-continue';
    b.innerHTML = `<span class="lbl">${esc(label)}</span>`;
    b.addEventListener('click', () => doContinue());
    el.dOptions.appendChild(b);
    pendingContinue = then;
    el.dialogue.classList.add('result');
    showPanel('dialogue');
    el.dialogue.scrollTop = 0;
  }
  function doContinue() {
    if (!pendingContinue) return;
    const fn = pendingContinue;
    pendingContinue = null;
    A.click();
    fn();
  }

  /* ---------------- time ---------------- */
  // Move the clock forward to `to`, visibly, then carry on.
  function passTime(to, then) {
    showPanel(null);
    pendingContinue = null;
    showScene(null);
    const from = S.minute;
    if (to <= from) { then(); return; }
    anim = { from, to, t: 0, dur: Math.min(1.8, 0.5 + (to - from) / 120), then };
  }
  function tick(dt) {
    if (!anim) return;
    anim.t += dt;
    const k = Math.min(1, anim.t / anim.dur);
    S.minute = Math.round(anim.from + (anim.to - anim.from) * (1 - Math.pow(1 - k, 2)));
    hud();
    if (R.view.bg === 'corridor' || R.view.bg === 'office') R.setView({ minute: S.minute });
    if (k >= 1) { const fn = anim.then; anim = null; fn(); }
  }

  // The next thing that happens today.
  function nextSlot() {
    const then = () => interlude(() => meanwhile(openNext));
    if (act().noDayEnd) {
      if (storyRemaining()) passTime(S.minute + 9, then);
      return;
    }
    if (S.slot >= SLOTS.length) { passTime(HOME_T, homeTime); return; }
    const slot = SLOTS[S.slot++];
    el.objective.textContent = slot.label;
    passTime(slot.t, then);
  }

  // Sometimes the school just gets on with being strange for a moment.
  function interlude(then) {
    S.seen = S.seen || [];
    const pool = ((C.interludes || {})[S.act] || []).filter((i) => !S.seen.includes(i.id));
    const opening = S.act === 1 && S.day === 1 && S.storyIdx === 0; // Billy always comes first
    if (opening || !pool.length || Math.random() > 0.5) { then(); return; }
    const it = pick(pool);
    S.seen.push(it.id);
    showScene({ scene: { bg: it.bg, cast: it.cast || [], noTuck: !!it.noTuck } });
    beat({ kicker: it.kicker, html: `<p class="narr">${esc(it.text)}</p>`, then });
  }

  // Consequences that were waiting for you.
  function meanwhile(then) {
    const c = S.later.shift();
    if (!c) { then(); return; }
    pushFeed(c.text);
    showScene({ scene: { bg: c.bg, cast: c.cast, noTuck: true, rain: S.act < 3 } }, { reaction: 'aftermath' });
    beat({ kicker: 'Meanwhile', html: `<p class="narr">${esc(c.text)}</p>`, then: () => meanwhile(then) });
  }

  /* ---------------- encounters ---------------- */
  function storyList() { return C.story[S.act] || []; }
  function skipUnmet() {
    const list = storyList();
    while (S.storyIdx < list.length && list[S.storyIdx].if && !list[S.storyIdx].if(S)) S.storyIdx++;
  }
  function storyRemaining() { skipUnmet(); return S.storyIdx < storyList().length; }
  function findEnc(ref) {
    if (!ref) return null;
    if (ref.kind === 'story') return storyList()[ref.idx];
    if (ref.kind === 'milestone') return C.milestones[S.act];
    if (ref.kind === 'filler') return C.fillers[S.act][ref.idx];
    if (ref.kind === 'follow') return C.followUps[ref.id];
    return null;
  }
  // Debts and other things that come back: due from the morning of a later day.
  function dueFollowUp() {
    S.followups = S.followups || [];
    const i = S.followups.findIndex((f) => f.act === S.act && S.day >= f.day && C.followUps[f.id]);
    if (i < 0) return null;
    return S.followups.splice(i, 1)[0];
  }
  function scheduleFollow(id) {
    const f = C.followUps[id];
    if (!f) return;
    S.followups = S.followups || [];
    S.followups.push({ id, act: S.act, day: S.day + (f.after != null ? f.after : 1) });
  }
  function openNext() {
    const fu = dueFollowUp();
    if (fu) return openEnc({ kind: 'follow', id: fu.id });
    if (storyRemaining()) return openEnc({ kind: 'story', idx: S.storyIdx });
    const ms = C.milestones[S.act];
    if (ms && S.cash >= target()) return openEnc({ kind: 'milestone' });
    openFiller();
  }
  // Quick deals come out of a bag: nothing repeats until everything has had a turn.
  // Fillers in a `series` (Callum…) appear in order, one step at a time.
  function openFiller(rescue) {
    const fl = C.fillers[S.act];
    if (!fl) return;
    S.used = S.used || {};
    S.series = S.series || {};
    const used = (S.used[S.act] = S.used[S.act] || []);
    const eligible = (ignoreUsed) => fl.map((e, i) => i).filter((i) => {
      const e = fl[i];
      if (!ignoreUsed && used.includes(i)) return false;
      if (e.series) {
        const done = S.series[e.series] || 0;
        if (e.step !== done + 1 && !(e.repeat && e.step === done)) return false;
      }
      return true;
    });
    let pool = eligible(false);
    if (!pool.length) { used.length = 0; pool = eligible(true); }
    const avoid = pool.length > 1 ? S.lastFiller : -1;
    const choices = pool.filter((i) => i !== avoid);
    const idx = pick(choices.length ? choices : pool);
    used.push(idx);
    S.lastFiller = idx;
    const e = fl[idx];
    if (e.series) S.series[e.series] = Math.max(S.series[e.series] || 0, e.step);
    openEnc({ kind: 'filler', idx, rescue: !!rescue });
  }
  function openEnc(ref) {
    S.current = ref;
    const enc = findEnc(ref);
    showScene(enc);
    renderDialogue(enc);
  }

  function renderDialogue(enc) {
    pendingContinue = null;
    const sp = C.people[enc.speaker];
    el.dSpeaker.textContent = sp ? sp.name : '';
    el.dText.innerHTML = `<p class="narr">${esc(fill(enc.text))}</p>` + (enc.line ? `<p class="line">“${esc(fill(enc.line).replace(/^“|”$/g, ''))}”</p>` : '');
    el.dOptions.innerHTML = '';
    // Options come in a random order (kept if you come back to the same choice),
    // except "Not yet", which stays last.
    const ref = S.current || {};
    if (!ref.order || ref.order.length !== enc.options.length) {
      const idx = enc.options.map((_, i) => i).filter((i) => enc.options[i].type !== 'later');
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      enc.options.forEach((o, i) => { if (o.type === 'later') idx.push(i); });
      ref.order = idx;
    }
    ref.order.forEach((i, pos) => {
      const o = enc.options[i];
      const b = document.createElement('button');
      b.className = 'opt';
      b.innerHTML = `<kbd>${pos + 1}</kbd><span class="lbl">${esc(fill(o.label))}</span>`;
      if (o.type === 'milestone' && S.cash < target()) b.disabled = true;
      b.addEventListener('click', () => choose(i));
      el.dOptions.appendChild(b);
    });
    el.dialogue.classList.remove('result');
    showPanel('dialogue');
    el.dialogue.scrollTop = 0;
  }

  // Consequences: the first comes back before the next encounter, the rest at home time.
  function queueConsequences(enc, lines) {
    if (!lines || !lines.length) return;
    const sc = enc.scene || {};
    const where = { bg: sc.bg, cast: sc.cast || [] };
    S.later.push(Object.assign({ text: lines[0] }, where));
    lines.slice(1).forEach((text) => S.home.push(text));
  }

  // The hidden line: how cruel the world currently requires you to be.
  // It rises over time at each school, but never above the cruellest option on offer.
  function requiredCruelty(enc) {
    const steps = act().line || [[1, 0]];
    let line = 0;
    steps.forEach(([fromDay, lvl]) => { if (S.day >= fromDay) line = lvl; });
    const max = Math.max(0, ...enc.options.filter((o) => o.evil != null).map((o) => o.evil));
    return Math.min(line, max);
  }

  function doCruelty(enc, o, req) {
    const d = scale(o.cash || 0);
    S.cash = Math.max(0, S.cash + d);
    if (d > 0) S.stats.extracted += d;
    S.cruelty += o.evil; // the hidden morality score
    if (o.evil > req) S.stats.beyond++;
    if (o.evil >= 2) S.stats.harmed++;
    // Soul and happiness only ever go one way.
    S.soul = clamp(S.soul + Math.min(0, o.soul != null ? o.soul : [0, -2, -6, -12][o.evil]), 0, 100);
    if (o.evil >= 2) S.happy = clamp(S.happy + Math.min(0, o.happy || -3), 0, 100);
    if (o.evil >= 2) S.mono = clamp(S.mono + (o.mono || 3), 0, 100);
    if (o.flags) Object.assign(S.flags, o.flags);
    if (o.follow) scheduleFollow(o.follow);
    popups(o.fanfare, d);
    queueConsequences(enc, o.feed);
    showResult(enc, o, o.evil >= 2 ? 'exploit' : null);
  }

  function choose(i) {
    if (!S.current || pendingContinue || S.freeze) return;
    const enc = findEnc(S.current);
    const o = enc.options[i];
    if (!o) return;
    A.click();
    if (o.evil != null) {
      const req = requiredCruelty(enc);
      if (o.evil < req) awkwardWait(enc, o);
      else doCruelty(enc, o, req);
      hud();
      return;
    }
    switch (o.type) {
      case 'futile': {
        const d = scale(o.cash || 0);
        if (d < 0) S.stats.wasted += Math.min(S.cash, -d);
        S.cash = Math.max(0, S.cash + d);
        A.thud();
        queueConsequences(enc, o.feed);
        showResult(enc, o, null);
        break;
      }
      case 'milestone':
        if (S.cash < target()) return;
        S.cash -= target();
        popups(o.fanfare);
        S.mono = clamp(S.mono + 20, 0, 100);
        showResult(enc, o, 'exploit');
        break;
      case 'later':
        closeEnc();
        break;
      case 'confess':
        finalFreeze();
        break;
      case 'accept':
        showPanel(null);
        S.current = null;
        startEnding();
        break;
    }
    hud();
  }

  function showResult(enc, o, reaction, prefix) {
    if (reaction) showScene(enc, { reaction });
    beat({
      html: (prefix ? `<p class="kicker">${esc(prefix)}</p>` : '') + `<p class="narr">${esc(fill(o.result || ''))}</p>`,
      then: () => (o.type === 'milestone' ? endAct() : closeEnc()),
    });
  }

  function closeEnc() {
    const ref = S.current;
    S.current = null;
    if (ref && ref.kind === 'story') S.storyIdx++;
    hud();
    if (ref && ref.rescue) homeTime();
    else nextSlot();
  }

  /* ---------------- the awkward wait ---------------- */
  // A decent choice. Time stops. Nothing happens for an uncomfortably long time.
  function awkwardWait(enc, o) {
    const sp = C.people[enc.speaker];
    const name = sp ? sp.name.replace(/^(Little|Head Monitor|Mr|Mrs) /, '').split(',')[0] : 'Everyone';
    S.freeze = { kind: 'awkward', enc, o, name, started: performance.now(), idles: 0 };
    S.stats.freezes++;
    showScene(enc, { frozen: true, frozenT: performance.now() / 1000 });
    A.rainOn(0.22);
    A.tick();
    el.fReason.textContent = fill(enc.awkward || pick(C.awkward.open), { name });
    el.fHint.textContent = '';
    el.fLog.innerHTML = '';
    buildIdles();
    el.fReconsider.hidden = true; // no way out but through
    el.freeze.classList.remove('final');
    showPanel('freeze');
    el.freeze.scrollTop = 0;
    clearTimeout(awkwardTimer);
    clearInterval(beatTimer);
    const beats = C.awkward.beats.slice().sort(() => Math.random() - 0.5);
    let b = 0;
    beatTimer = setInterval(() => { if (S.freeze && S.freeze.kind === 'awkward') logFreeze(fill(beats[b++ % beats.length], { name }), 'beat'); }, BEAT_MS);
    awkwardTimer = setTimeout(() => endAwkward(), AWKWARD_MS);
    hud();
  }
  function stopWaiting() {
    if (S.freeze && S.freeze.started) S.stats.waitedMs += performance.now() - S.freeze.started;
    clearTimeout(awkwardTimer);
    clearInterval(beatTimer);
    A.rainOff();
  }
  // The moment passes. What you chose happens anyway, slowly, and nothing extra comes of it.
  function endAwkward() {
    const F = S.freeze;
    if (!F || F.kind !== 'awkward') return;
    stopWaiting();
    S.freeze = null;
    S.cash = Math.max(0, S.cash + scale(F.o.cash || 0));
    if (F.o.flags) Object.assign(S.flags, F.o.flags);
    if (F.o.follow) scheduleFollow(F.o.follow);
    S.stats.kind++;
    hud();
    showResult(F.enc, F.o, 'decent', C.awkward.passes);
  }
  function changeMind() {
    const F = S.freeze;
    if (!F || F.kind === 'final') return;
    stopWaiting();
    S.freeze = null;
    A.click();
    if (F.kind === 'broke') { openFiller(true); hud(); return; }
    showScene(F.enc);
    renderDialogue(F.enc);
    hud();
  }

  function buildIdles() {
    el.fIdle.innerHTML = '';
    C.idles.forEach((idle) => {
      const b = document.createElement('button');
      b.className = 'idle';
      b.textContent = idle.label;
      b.addEventListener('click', () => doIdle(idle));
      el.fIdle.appendChild(b);
    });
  }
  function doIdle(idle) {
    const F = S.freeze;
    if (!F) return;
    F.idles++;
    S.stats.idles++;
    F.counts = F.counts || {};
    const c = (F.counts[idle.id] = (F.counts[idle.id] || 0) + 1);
    const extra = {};
    if (idle.id === 'rain') {
      S.stats.raindrops += 40 + Math.floor(Math.random() * 300);
      extra.n = S.stats.raindrops.toLocaleString('en-GB');
    }
    A.tick();
    logFreeze(fill(idle.lines[(c - 1) % idle.lines.length], extra));
    const esc8 = C.freezeEscalation.find((e) => e.at === F.idles);
    if (esc8) setTimeout(() => logFreeze(esc8.text, 'esc'), 500);
  }
  function logFreeze(text, cls = '') {
    const p = document.createElement('p');
    p.textContent = text;
    if (cls) p.className = cls;
    el.fLog.prepend(p);
    while (el.fLog.children.length > 5) el.fLog.lastChild.remove();
  }

  /* ---------------- home time ---------------- */
  function homeTime() {
    const a = act();
    el.objective.textContent = 'Home time.';
    const dues = duesToday();
    if (S.cash < dues) {
      // Can't pay. The day doesn't end.
      S.freeze = { kind: 'broke', started: 0, idles: 0 };
      S.stats.freezes++;
      showScene(null, { frozen: true, frozenT: performance.now() / 1000 });
      A.rainOn(0.22);
      el.fReason.textContent = fill(a.broke);
      el.fHint.textContent = '';
      el.fLog.innerHTML = '';
      buildIdles();
      el.fReconsider.hidden = false;
      el.fReconsider.textContent = 'Find the money';
      el.freeze.classList.remove('final');
      showPanel('freeze');
      el.freeze.scrollTop = 0;
      hud();
      return;
    }
    S.cash -= dues;
    const paid = fill(a.paid);
    pushFeed(paid, 'biz');
    // The day's consequences, all at once, on the way home.
    const lines = S.home.splice(0);
    const ev = (C.evenings || {})[S.act] || [];
    const evening = ev.length ? ev[(S.day - 1) % ev.length] : '';
    lines.forEach((l) => pushFeed(l));
    hud();
    showScene(null);
    showPanel(null);
    showCard({
      cls: 'card-home',
      html: `<p class="kicker">${DAYS[(S.day - 1) % 5]}, on the way home</p>` +
        (lines.length ? `<ul class="home-list">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '<p class="sub">Nothing much happened today.</p>') +
        `<p class="sub">${esc(paid)} You have ${fmt(S.cash)} left.</p>` +
        (progressLine() ? `<p class="sub progress">${esc(progressLine())}</p>` : '') +
        (evening ? `<p class="evening">${esc(evening)}</p>` : ''),
      buttons: [{ label: shopFor().length ? 'Carry on' : 'Tomorrow', fn: () => (shopFor().length ? bedtime() : nextDay()) }],
      delay: 900,
    });
  }

  // How close you are to the goal, told in-world. Never a number (so the hidden scaling stays hidden).
  function progressLine() {
    const pr = act().progress;
    if (!pr || !target()) return '';
    const r = S.cash / target();
    return pr[r >= 0.85 ? 2 : r >= 0.45 ? 1 : 0];
  }

  /* ---------------- bedtime: the tuck shop ---------------- */
  function shopFor() {
    S.bought = S.bought || [];
    return ((C.upgrades || {})[S.act] || []).filter((u) => !S.bought.includes(u.id));
  }
  function bedtime(justBought) {
    const list = shopFor();
    if (!list.length && justBought && C.treadmillReveal) {
      // The top of the precipice: everything bought, one good night's sleep.
      showCard({
        cls: 'card-home card-shop',
        html: `<p class="kicker">Bedtime</p><p>You have ${fmt(S.cash)}. ${esc(C.treadmillReveal.allBought)}</p>`,
        buttons: [{ label: 'Go to bed', fn: nextDay }],
      });
      return;
    }
    if (!list.length) { nextDay(); return; }
    showScene(null);
    const buttons = list.map((u) => {
      const cost = u.cost;
      return { label: `${u.name} · ${fmt(cost)}`, secondary: true, disabled: S.cash < cost, fn: () => buyUpgrade(u) };
    });
    buttons.push({ label: 'Go to bed', fn: nextDay });
    showCard({
      cls: 'card-home card-shop',
      html: `<p class="kicker">Bedtime</p><p>You have ${fmt(S.cash)}. ${S.flags.treadmillSeen && C.treadmillReveal ? esc(C.treadmillReveal.shop) : 'You lie awake thinking about the business.'}</p>` +
        `<ul class="home-list">${list.map((u) => `<li><b>${esc(u.name)}.</b> ${esc(u.text)}</li>`).join('')}</ul>`,
      buttons,
    });
  }
  function buyUpgrade(u) {
    const cost = u.cost;
    if (S.cash < cost) { bedtime(); return; }
    S.cash -= cost;
    S.mult = (S.mult || 1) * u.mult; // the world quietly keeps pace; see scale()
    S.bought.push(u.id);
    S.spentAct = (S.spentAct || 0) + cost;
    S.stats.improved = (S.stats.improved || 0) + cost;
    // Bought the last one? Tomorrow morning, somebody shows them the maths (once per run).
    if (!shopFor().length && !S.flags.treadmillSeen) S.revealDue = true;
    S.cruelty += 1;
    S.soul = clamp(S.soul - 3, 0, 100);
    if (u.feed) S.later.push({ text: u.feed, cast: [] });
    popups(['BUSINESS IMPROVED!', u.name.toUpperCase() + '!']);
    hud();
    bedtime(true);
  }
  function nextDay() {
    S.day++;
    S.slot = 0;
    S.minute = DAY_START;
    const reveal = S.revealDue && C.treadmillReveal;
    if (reveal) { S.revealDue = false; S.flags.treadmillSeen = true; }
    save();
    showScene(null);
    hud();
    if (reveal) treadmillReveal(); else nextSlot();
  }

  // The joke, told only after the last improvement is bought: none of it ever did anything.
  function treadmillReveal() {
    const R = C.treadmillReveal;
    const goal = act().goal || 'The goal';
    const extra = {
      spent: fmt(S.spentAct || 0),
      pct: Math.round(((S.mult || 1) - 1) * 100) + '%',
      goal: goal.charAt(0).toUpperCase() + goal.slice(1),
    };
    showCard({
      cls: 'card-home',
      html: `<p class="kicker">${DAYS[(S.day - 1) % 5]}, before registration</p>` +
        `<p>${esc(R.teller[S.act] || R.teller[1])}</p>` +
        `<ul class="home-list">${R.lines.map((l) => `<li>${esc(fill(l, extra))}</li>`).join('')}</ul>`,
      buttons: [{ label: R.button, fn: nextSlot }],
      delay: 2500,
    });
  }

  /* ---------------- final freeze (assembly) ---------------- */
  function finalFreeze() {
    S.freeze = { kind: 'final', idles: 0 };
    S.stats.freezes++;
    showScene(C.story[4][C.story[4].length - 1], { frozen: true, final: true, frozenT: performance.now() / 1000 });
    A.droneOn();
    el.freeze.classList.add('final');
    el.fReason.textContent = 'You stand up to apologise. The whole hall freezes, mid-cough.';
    el.fHint.textContent = 'Refunds are not available at this time.';
    el.fLog.innerHTML = '';
    el.fIdle.innerHTML = '';
    C.finalIdles.forEach((idle) => {
      const b = document.createElement('button');
      b.className = 'idle';
      b.textContent = idle.label;
      let n = 0;
      b.addEventListener('click', () => {
        S.freeze.idles++;
        logFreeze(idle.lines[n++ % idle.lines.length]);
        if (S.freeze.idles >= 3) revealAccept();
      });
      el.fIdle.appendChild(b);
    });
    el.fReconsider.hidden = true;
    showPanel('freeze');
    el.freeze.scrollTop = 0;
    clearTimeout(finalTimer);
    finalTimer = setTimeout(revealAccept, 20000);
    hud();
  }
  function revealAccept() {
    if (!S.freeze || S.freeze.kind !== 'final' || !el.fReconsider.hidden) return;
    el.fReconsider.hidden = false;
    el.fReconsider.textContent = 'Accept expulsion';
  }
  function acceptExpulsion() {
    clearTimeout(finalTimer);
    A.droneOff();
    S.freeze = null;
    showPanel(null);
    el.freeze.classList.remove('final');
    startEnding();
  }

  /* ---------------- moving schools ---------------- */
  function startAct(n, opts = {}) {
    const a = C.acts[n];
    S.act = n;
    S.day = 1;
    S.slot = 0;
    S.minute = a.start;
    S.storyIdx = 0;
    S.current = null;
    S.freeze = null;
    S.later = [];
    S.home = [];
    S.spentAct = 0;
    S.mult = 1; // new school, new business: the old improvements stay behind
    if (n > 1 && n < 4) S.happy = 100;
    S.phase = 'play';
    setMode('play');
    document.body.className = 'style-' + a.style;
    if (n > 1) pushFeed(`— ${a.school} —`, 'sep');
    el.ticker.textContent = '';
    el.objective.textContent = '';
    toggleLog(false);
    showPanel(null);
    showScene(null, n === 4 ? { rain: true } : {}, n === 4 ? { glitch: true } : { fade: true });
    if (n === 4) A.rainOn(0.18); else A.rainOff();
    hud();
    renderFeed();
    if (opts.skipIntro) return;
    captions(a.intro, () => { save(); nextSlot(); });
  }

  // Story beats shown one at a time over the scene. No titles, no act numbers.
  function captions(lines, done, i = 0) {
    if (i >= lines.length) { if (done) done(); return; }
    const ln = typeof lines[i] === 'string' ? { text: lines[i] } : lines[i];
    if (ln.scene) {
      if (ln.scene.style) document.body.className = 'style-' + ln.scene.style;
      showScene({ scene: ln.scene }, {}, ln.glitch ? { glitch: true } : { fade: true });
    }
    showCard({
      cls: 'card-caption' + (ln.big ? ' big' : ''),
      html: ln.big ? `<h1 class="market">${esc(fill(ln.text))}</h1>` : `<p>${esc(fill(ln.text))}</p>`,
      buttons: [{ label: i < lines.length - 1 ? '…' : 'Carry on', fn: () => captions(lines, done, i + 1) }],
      delay: 500,
    });
  }

  function endAct() {
    const n = S.act;
    S.phase = 'transition';
    setMode('transition');
    showPanel(null);
    captions(act().outro || [], () => startAct(n + 1));
  }

  /* ---------------- ending ---------------- */
  function setMode(m) { el.game.dataset.mode = m; }

  function startEnding() {
    S.phase = 'ending';
    setMode('ending');
    clearSave();
    A.droneOff();
    A.rainOn(0.2);
    showPanel(null);
    let i = 0;
    const step = () => {
      const e = C.ending[i];
      if (!e) return finalStats();
      if (e.scene.style === 'crayon' && document.body.className !== 'style-crayon') {
        document.body.className = 'style-crayon';
        A.rainOff();
      }
      showScene(e, {}, { fade: true });
      i++;
      showCard({
        cls: 'card-caption' + (e.big ? ' big' : ''),
        html: e.big ? `<h1 class="market">${e.big}</h1>` : `<p>${esc(e.text)}</p>`,
        buttons: [{ label: '…', fn: step }],
        delay: e.big ? 2500 : 1200,
      });
    };
    step();
  }
  function mins(ms) {
    const s = Math.round(ms / 1000);
    return s < 60 ? `${s} seconds` : `${Math.floor(s / 60)}m ${s % 60}s`;
  }
  function finalStats() {
    const st = S.stats;
    showCard({
      cls: 'card-act',
      html: `<h1>The Ledger</h1>
        <dl>
          <dt>Total taken</dt><dd>${fmt(st.extracted)}</dd>
          <dt>Spent trying to make it go away</dt><dd>${fmt(st.wasted)}</dd>
          <dt>Spent improving the business</dt><dd>${fmt(st.improved || 0)}</dd>
          <dt>Children harmed</dt><dd>${st.harmed}</dd>
          <dt>Times you held back</dt><dd>${st.kind}</dd>
          <dt>Times you went further than you had to</dt><dd>${st.beyond || 0}</dd>
          <dt>Cruelty</dt><dd>${S.cruelty || 0}</dd>
          <dt>Time spent standing there</dt><dd>${mins(st.waitedMs)}</dd>
          <dt>Raindrops counted</dt><dd>${st.raindrops.toLocaleString('en-GB')}</dd>
          <dt>Soul remaining</dt><dd>${Math.round(S.soul)}/100</dd>
        </dl>
        <p class="sub">A new kid is waiting behind the sports shed.</p>`,
      buttons: [{ label: 'Begin again', fn: () => newGame(S.gen + 1) }],
    });
  }

  /* ---------------- cards (title, captions, home time) ---------------- */
  function showCard({ html, buttons, cls = '', delay = 0 }) {
    cardOpen = true;
    el.card.className = 'card ' + cls;
    el.card.innerHTML = `<div class="card-inner">${html}<div class="card-buttons"></div></div>`;
    const box = el.card.querySelector('.card-buttons');
    buttons.forEach((b, i) => {
      const btn = document.createElement('button');
      btn.textContent = b.label;
      if (b.secondary) btn.className = 'secondary';
      if (b.disabled) btn.disabled = true;
      btn.addEventListener('click', () => {
        A.init();
        A.click();
        cardOpen = false;
        el.card.hidden = true;
        b.fn();
      });
      if (delay && !b.disabled) { btn.disabled = true; setTimeout(() => { btn.disabled = false; if (i === 0) btn.focus({ preventScroll: true }); }, delay); }
      box.appendChild(btn);
    });
    el.card.hidden = false;
    if (!delay) { const f = box.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
  }

  function title() {
    S = newState();
    const saved = load();
    document.body.className = 'style-crayon';
    S.phase = 'title';
    setMode('title');
    R.setView(Object.assign(sceneFor(null), { bench: true, cast: [person('billy')] }));
    hud();
    const buttons = [{ label: 'New game', fn: () => newGame(1) }];
    if (saved && saved.v === 2) buttons.push({ label: 'Continue', fn: () => resume(saved), secondary: true });
    showCard({ cls: 'card-title', html: '<h1 class="logo">TUCK</h1>', buttons });
  }

  function newGame(gen) {
    clearSave();
    A.init();
    A.rainOff();
    A.droneOff();
    S = newState(gen);
    startAct(1);
  }
  function resume(saved) {
    A.init();
    const keep = { day: saved.day, minute: saved.minute, storyIdx: saved.storyIdx, happy: saved.happy, slot: 0, later: saved.later || [], home: saved.home || [] };
    S = Object.assign(newState(), saved, { current: null, freeze: null, phase: 'play' });
    startAct(S.act, { skipIntro: true });
    Object.assign(S, keep);
    S.minute = DAY_START;
    hud();
    renderFeed();
    nextSlot();
  }

  /* ---------------- input ---------------- */
  function onKey(e) {
    if (!el.card.hidden) return; // card buttons take Enter natively via focus
    if (pendingContinue && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); doContinue(); return; }
    if (S && S.current && !pendingContinue && !S.freeze && /^[1-9]$/.test(e.key)) {
      const btn = el.dOptions.children[+e.key - 1];
      if (btn && !btn.disabled) btn.click();
      return;
    }
    if (e.key === 'l' || e.key === 'L') toggleLog();
    if (e.key === 'Escape') toggleLog(false);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    const ids = {
      school: '#hud-school', day: '#hud-day', time: '#hud-time', cash: '#hud-cash', ticker: '#ticker',
      objective: '#objective', feedTitle: '#feed-title', feedList: '#feed-list',
      dialogue: '#dialogue', dSpeaker: '#d-speaker', dText: '#d-text', dOptions: '#d-options',
      log: '#log', logList: '#log-list', logTitle: '#log-title', logBtn: '#btn-log',
      freeze: '#freeze', fReason: '#f-reason', fHint: '#f-hint', fIdle: '#f-idle', fLog: '#f-log', fReconsider: '#f-reconsider',
      card: '#card', fx: '#fx', game: '#game', mute: '#btn-mute',
    };
    for (const k in ids) el[k] = $(ids[k]);

    // In a home-screen web app iOS can report a viewport shorter than the screen
    // (by the status bar), leaving a gap at the bottom. Size to the real screen there.
    const standalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    const fillScreen = () => {
      if (!standalone) return;
      const portrait = window.matchMedia('(orientation: portrait)').matches;
      const h = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
      el.game.style.height = Math.max(h, window.innerHeight) + 'px';
      el.game.style.bottom = 'auto';
    };
    fillScreen();
    window.addEventListener('resize', fillScreen);
    window.addEventListener('orientationchange', () => setTimeout(fillScreen, 300));
    R.init($('#stage'));
    const wrap = $('#stage-wrap');
    const fit = () => { if (wrap.clientHeight) R.setViewport(wrap.clientWidth / wrap.clientHeight); };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap);
    window.addEventListener('resize', fit);
    el.logBtn.addEventListener('click', () => { A.click(); toggleLog(); });
    $('#log-close').addEventListener('click', () => toggleLog(false));
    el.fReconsider.addEventListener('click', () => {
      if (!S.freeze) return;
      if (S.freeze.kind === 'final') acceptExpulsion();
      else changeMind();
    });
    el.mute.addEventListener('click', () => { A.init(); A.setMuted(!A.muted); el.mute.textContent = A.muted ? '♪̸' : '♪'; el.mute.setAttribute('aria-pressed', A.muted); });
    document.addEventListener('keydown', onKey);

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      tick(dt);
      R.frame(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    title();

    // test/debug hook: ?debug in the URL
    if (/[?&]debug\b/.test(location.search)) {
      T.debug = {
        get S() { return S; },
        cash(p) { S.cash = p; hud(); },
        choose, doContinue, changeMind, endAwkward, startAct, endAct,
        jumpAct(n) { cardOpen = false; el.card.hidden = true; startAct(n, { skipIntro: true }); nextSlot(); },
        get waiting() { return !!pendingContinue; },
        bedtime() { cardOpen = false; el.card.hidden = true; bedtime(); },
        openStory(n, i) { cardOpen = false; el.card.hidden = true; anim = null; S.storyIdx = i; openEnc({ kind: 'story', idx: i }); },
        required() { return S.current ? requiredCruelty(findEnc(S.current)) : null; },
        enc() { return S.current ? findEnc(S.current) : null; },
        openFillerById(n, id) { cardOpen = false; el.card.hidden = true; startAct(n, { skipIntro: true }); const idx = C.fillers[n].findIndex((e) => e.id === id); openEnc({ kind: 'filler', idx }); },
        showInterlude(n, id) { cardOpen = false; el.card.hidden = true; startAct(n, { skipIntro: true }); const it = C.interludes[n].find((i) => i.id === id); showScene({ scene: { bg: it.bg, cast: it.cast || [], noTuck: !!it.noTuck } }); beat({ kicker: it.kicker, html: `<p class="narr">${esc(it.text)}</p>`, then: () => {} }); },
      };
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
