/*
 * TUCK — game state machine.
 *
 * Core loop: the school clock runs, ventures pay out, encounters arrive.
 * Exploitative options always work. Decent options only work if you can
 * stay above the day's QUOTA afterwards — otherwise time stops (Stagnation
 * Freeze) until you reconsider. Surplus cash above the quota is what buys
 * the occasional kindness.
 */
(function () {
  const T = window.Tuck;
  const C = T.content;
  const R = T.render;
  const A = T.audio;

  const DAY_START = 530; // 08:50
  const DAY_END = 930; // 15:30
  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const SAVE_KEY = 'tuck-save-v1';
  const SPEEDS = [1, 2, 4];

  const $ = (s) => document.querySelector(s);
  const el = {};
  let S = null;
  let speedIdx = 0;
  let resultPending = null; // { enc, opt } while showing a result
  let cardOpen = false;
  let finalTimer = null;

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
  function quota() {
    const a = act();
    return a.quotaBase + a.quotaStep * (S.day - 1);
  }
  function fill(str, extra = {}) {
    return str.replace(/\{(\w+)\}/g, (_, k) => {
      if (k === 'quota') return fmt(quota());
      if (k === 'cash') return fmt(S.cash);
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
      v: 1, gen,
      act: 1, day: 1, minute: 600, cash: 0,
      soul: 100, happy: 100, mono: 5,
      storyIdx: 0, nextAt: 615, ventures: {}, flags: {},
      feed: [], feedQueue: [],
      stats: { extracted: 0, harmed: 0, kind: 0, freezes: 0, raindrops: 0, idles: 0, wasted: 0 },
      current: null, freeze: null, milestoneSnooze: 0,
      incomeAcc: 0, extAcc: 0, dayStartCash: 0, phase: 'title',
    };
  }

  /* ---------------- save / load ---------------- */
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
    return p;
  }
  function sceneFor(enc, extra = {}) {
    const a = act();
    const sc = (enc && enc.scene) || {};
    const style = sc.style || a.style;
    const tuck = C.tuckLook(S.act, S.soul);
    if (sc.tuckSad) tuck.mood = 'sad';
    let cast = (sc.cast || []).map(person).filter(Boolean);
    if (extra.reaction) {
      // faces change once a choice lands
      const r = extra.reaction;
      if (r === 'exploit') { tuck.mood = S.act >= 4 ? 'sad' : 'smug'; cast = cast.map((c) => Object.assign(c, { mood: c.adult ? 'sad' : 'crying' })); }
      if (r === 'decent') cast = cast.map((c) => Object.assign(c, { mood: 'happy' }));
      if (r === 'decent') tuck.mood = 'happy';
    }
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
    el.act.textContent = S.act < 4 ? `Act ${S.act} · ${a.title}` : 'Act 4 · The Fall';
    el.school.textContent = a.school;
    el.day.textContent = S.act < 4 ? `${DAYS[(S.day - 1) % 5]} · Day ${S.day}` : 'MONDAY';
    el.time.textContent = clock(S.minute);
    el.time.classList.toggle('frozen', !!S.freeze);
    el.cash.textContent = fmt(S.cash);
    if (S.act < 4) {
      const q = quota();
      el.quota.textContent = fmt(q);
      const surplus = S.cash - q;
      el.surplus.textContent = surplus >= 0 ? `Surplus ${fmt(surplus)}` : `Short ${fmt(-surplus)}`;
      el.surplus.className = surplus >= 0 ? 'ok' : 'short';
      el.target.textContent = `Target ${fmt(a.target)}`;
    } else {
      el.quota.textContent = '—';
      el.surplus.textContent = 'Assets frozen';
      el.surplus.className = 'short';
      el.target.textContent = '';
    }
    el.soul.style.width = clamp(S.soul, 0, 100) + '%';
    el.happy.style.width = clamp(S.happy, 0, 100) + '%';
    el.mono.style.width = clamp(S.mono, 0, 100) + '%';
    el.soulV.textContent = Math.round(clamp(S.soul, 0, 100));
    el.happyV.textContent = Math.round(clamp(S.happy, 0, 100)) + '%';
    el.monoV.textContent = Math.round(clamp(S.mono, 0, 100)) + '%';
    el.objective.textContent = objectiveText();
    el.ledgerBtn.disabled = !!a.noLedger;
    el.ledgerBtn.textContent = a.noLedger ? 'Assets Frozen' : 'Ledger';
    el.feedTitle.textContent = a.feedTitle;
    if (!el.ledger.hidden) renderLedger();
  }
  function objectiveText() {
    const a = act();
    if (S.act >= 4) return a.objective;
    const done = storyDone();
    if (!done) return a.objective;
    if (S.cash >= a.target) return 'You can afford it now. Somebody will find you.';
    return a.objective + ' Buy ventures in the Ledger to speed things up.';
  }

  /* ---------------- feed ---------------- */
  function pushFeed(text, cls = '') {
    S.feed.unshift({ t: clock(S.minute), text, cls });
    S.feed = S.feed.slice(0, 40);
    renderFeed(true);
  }
  function renderFeed(fresh) {
    el.feedList.innerHTML = S.feed
      .map((f, i) => `<li class="${f.cls}${fresh && i === 0 ? ' new' : ''}"><time>${f.t}</time>${esc(f.text)}</li>`)
      .join('');
  }
  function queueFeed(lines, delay = 12) {
    (lines || []).forEach((text, i) => S.feedQueue.push({ at: S.minute + delay + i * 20, text }));
  }

  /* ---------------- fanfare popups ---------------- */
  function popups(list) {
    if (!list || !list.length) return;
    A.fanfare(act().style);
    list.forEach((txt, i) => {
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'pop';
        d.textContent = txt;
        d.style.left = 18 + Math.random() * 40 + '%';
        d.style.top = 30 + i * 9 + '%';
        el.fx.appendChild(d);
        setTimeout(() => d.remove(), 2000);
      }, i * 280);
    });
  }

  /* ---------------- encounters ---------------- */
  function storyList() { return C.story[S.act] || []; }
  function storyDone() {
    const list = storyList();
    let i = S.storyIdx;
    while (i < list.length && list[i].if && !list[i].if(S)) i++;
    return i >= list.length;
  }
  function findEnc(ref) {
    if (!ref) return null;
    if (ref.kind === 'story') return storyList()[ref.idx];
    if (ref.kind === 'milestone') return C.milestones[S.act];
    if (ref.kind === 'filler') return C.fillers[S.act][ref.idx];
    return null;
  }

  function spawnNext() {
    const list = storyList();
    while (S.storyIdx < list.length && list[S.storyIdx].if && !list[S.storyIdx].if(S)) S.storyIdx++;
    if (S.storyIdx < list.length) return openEnc({ kind: 'story', idx: S.storyIdx });
    if (C.fillers[S.act]) return openFiller();
  }
  function openFiller(rescue) {
    const fl = C.fillers[S.act];
    if (!fl) return;
    let idx = Math.floor(Math.random() * fl.length);
    if (fl.length > 1 && idx === S.lastFiller) idx = (idx + 1) % fl.length;
    S.lastFiller = idx;
    openEnc({ kind: 'filler', idx, rescue: !!rescue });
  }

  function openEnc(ref) {
    S.current = ref;
    const enc = findEnc(ref);
    showScene(enc);
    renderDialogue(enc);
  }

  function optionTag(o) {
    if (o.type === 'exploit') return o.cash ? `<span class="tag ex">${o.cash > 0 ? '+' : ''}${fmt(o.cash)}</span>` : '<span class="tag ex">Profitable</span>';
    if (o.type === 'decent') {
      const after = S.cash + (o.cash || 0);
      const ok = after >= quota();
      let t = `<span class="tag de">Decent${o.cash ? ' · ' + (o.cash > 0 ? '+' : '') + fmt(o.cash) : ''}</span>`;
      if (S.flags.learnedFreeze && !ok) t += '<span class="tag warn">Can’t afford decency</span>';
      if (S.flags.learnedFreeze && ok) t += '<span class="tag ok">Affordable</span>';
      return t;
    }
    if (o.type === 'milestone') return `<span class="tag ms">${fmt(o.cost)}</span>`;
    if (o.type === 'futile' && o.cash) return `<span class="tag fu">${fmt(o.cash)}</span>`;
    return '';
  }

  function renderDialogue(enc) {
    resultPending = null;
    const sp = C.people[enc.speaker];
    el.dSpeaker.textContent = sp ? sp.name : '';
    el.dText.innerHTML = `<p class="narr">${esc(fill(enc.text))}</p>` + (enc.line ? `<p class="line">“${esc(enc.line.replace(/^“|”$/g, ''))}”</p>` : '');
    el.dOptions.innerHTML = '';
    enc.options.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'opt opt-' + o.type;
      b.innerHTML = `<kbd>${i + 1}</kbd><span class="lbl">${esc(o.label)}</span>${optionTag(o)}`;
      if (o.type === 'milestone' && S.cash < o.cost) b.disabled = true;
      b.addEventListener('click', () => choose(i));
      el.dOptions.appendChild(b);
    });
    el.dialogue.hidden = false;
    el.dialogue.classList.remove('result');
  }

  function apply(o) {
    const d = o.cash || 0;
    S.cash = Math.max(0, S.cash + d);
    if (o.type === 'exploit') {
      if (d > 0) S.stats.extracted += d;
      S.stats.harmed++;
      S.mono = clamp(S.mono + (o.mono || 3), 0, 100);
    }
    if (o.type === 'futile' && d < 0) S.stats.wasted += -d;
    S.soul = clamp(S.soul + (o.soul || 0), 0, 100);
    S.happy = clamp(S.happy + (o.happy || 0), 0, 100);
    if (o.flags) Object.assign(S.flags, o.flags);
    if (o.feed) queueFeed(o.feed, o.type === 'futile' ? 1 : 12);
    popups(o.fanfare);
    if (o.type === 'decent' && d > 0) A.coin();
  }

  function choose(i) {
    if (!S.current || resultPending || S.freeze) return;
    const enc = findEnc(S.current);
    const o = enc.options[i];
    if (!o) return;
    A.click();
    switch (o.type) {
      case 'exploit':
        apply(o);
        showResult(enc, o);
        break;
      case 'decent':
        if (S.cash + (o.cash || 0) >= quota()) {
          apply(o);
          S.stats.kind++;
          showResult(enc, o);
        } else {
          enterFreeze({ kind: 'choice', enc, opt: o });
        }
        break;
      case 'futile':
        apply(o);
        A.thud();
        showResult(enc, o);
        break;
      case 'milestone':
        if (S.cash < o.cost) return;
        S.cash -= o.cost;
        popups(o.fanfare);
        S.mono = clamp(S.mono + 20, 0, 100);
        showResult(enc, o);
        break;
      case 'later':
        S.milestoneSnooze = S.minute + 60;
        closeEnc(enc);
        break;
      case 'confess':
        finalFreeze();
        break;
      case 'accept':
        el.dialogue.hidden = true;
        S.current = null;
        startEnding();
        break;
    }
    hud();
  }

  function showResult(enc, o) {
    resultPending = { enc, o };
    if (o.type === 'exploit' || o.type === 'decent') showScene(enc, { reaction: o.type });
    el.dialogue.classList.add('result');
    el.dText.innerHTML = `<p class="narr">${esc(fill(o.result || ''))}</p>`;
    el.dOptions.innerHTML = '';
    const b = document.createElement('button');
    b.className = 'opt opt-continue';
    b.innerHTML = '<kbd>↵</kbd><span class="lbl">Carry on</span>';
    b.addEventListener('click', continueResult);
    el.dOptions.appendChild(b);
    b.focus({ preventScroll: true });
  }

  function continueResult() {
    if (!resultPending) return;
    const { enc, o } = resultPending;
    resultPending = null;
    A.click();
    if (o.type === 'milestone') { el.dialogue.hidden = true; S.current = null; endAct(); return; }
    closeEnc(enc);
  }

  function closeEnc(enc) {
    const ref = S.current;
    S.current = null;
    el.dialogue.hidden = true;
    const a = act();
    if (ref && ref.kind === 'story') {
      S.storyIdx++;
      S.nextAt = S.minute + (enc.gap || a.gap);
    } else {
      S.nextAt = S.minute + (a.fillerGap || a.gap);
    }
    showScene(null);
    hud();
    if (ref && ref.rescue) endDay();
  }

  /* ---------------- Stagnation Freeze ---------------- */
  function enterFreeze(f) {
    S.freeze = Object.assign({ idles: 0, log: [] }, f);
    S.stats.freezes++;
    const first = !S.flags.learnedFreeze;
    S.flags.learnedFreeze = true;
    el.dialogue.hidden = true;
    el.ledger.hidden = true;
    const enc = f.enc || null;
    showScene(enc, { frozen: true, frozenT: performance.now() / 1000 });
    A.rainOn(0.22);
    A.tick();

    let reason;
    if (f.kind === 'quota') {
      reason = `The bell refuses to ring. You owe ${fmt(quota())} by home time because ${act().quotaWhy}, and you have ${fmt(S.cash)}. Nobody is going home until the numbers work.`;
    } else {
      const after = fmt(S.cash + (f.opt.cash || 0));
      reason = enc.freeze
        ? fill(enc.freeze, { after })
        : `Decency would leave you on ${after}. The quota is ${fmt(quota())}, because ${act().quotaWhy}. Time has stopped until the numbers make sense.`;
    }
    el.fReason.textContent = reason;
    el.fHint.textContent = first
      ? 'This is the Stagnation Freeze. Nothing will happen here. Ever. Decent choices are only possible when you have surplus above the quota.'
      : '';
    el.fLog.innerHTML = '';
    el.fIdle.innerHTML = '';
    C.idles.forEach((idle) => {
      const b = document.createElement('button');
      b.className = 'idle';
      b.textContent = idle.label;
      b.addEventListener('click', () => doIdle(idle));
      el.fIdle.appendChild(b);
    });
    el.fReconsider.hidden = false;
    el.fReconsider.textContent = f.kind === 'quota' ? 'Find a quick deal' : 'Reconsider';
    el.freeze.classList.remove('final');
    el.freeze.hidden = false;
    hud();
  }

  function doIdle(idle) {
    const F = S.freeze;
    if (!F) return;
    F.idles++;
    S.stats.idles++;
    F.counts = F.counts || {};
    const c = (F.counts[idle.id] = (F.counts[idle.id] || 0) + 1);
    let extra = {};
    if (idle.id === 'rain') {
      const n = 40 + Math.floor(Math.random() * 300);
      S.stats.raindrops += n;
      extra.n = S.stats.raindrops.toLocaleString('en-GB');
    }
    A.tick();
    const line = fill(idle.lines[(c - 1) % idle.lines.length], extra);
    logFreeze(line);
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

  function reconsider() {
    const F = S.freeze;
    if (!F || F.kind === 'final') return;
    S.freeze = null;
    el.freeze.hidden = true;
    A.rainOff();
    A.click();
    if (F.kind === 'quota') {
      openFiller(true);
    } else {
      showScene(F.enc);
      renderDialogue(F.enc);
    }
    hud();
  }

  /* ---------------- final freeze (assembly) ---------------- */
  function finalFreeze() {
    el.dialogue.hidden = true;
    S.freeze = { kind: 'final', idles: 0 };
    S.stats.freezes++;
    showScene(C.story[4][C.story[4].length - 1], { frozen: true, final: true, frozenT: performance.now() / 1000 });
    A.droneOn();
    el.freeze.classList.add('final');
    el.fReason.textContent = 'You stand up to apologise. The hall freezes mid-cough. There is no option on the menu for this. Late-stage capitalism offers no clean reset.';
    el.fHint.textContent = 'Refunds are not available at this time.';
    el.fLog.innerHTML = '';
    el.fIdle.innerHTML = '';
    C.finalIdles.forEach((idle, i) => {
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
    el.freeze.hidden = false;
    clearTimeout(finalTimer);
    finalTimer = setTimeout(revealAccept, 15000);
    hud();
  }
  function revealAccept() {
    if (!S.freeze || S.freeze.kind !== 'final' || !el.fReconsider.hidden) return;
    el.fReconsider.hidden = false;
    el.fReconsider.textContent = 'Accept expulsion';
    el.fReconsider.onclick = () => {
      el.fReconsider.onclick = null;
      clearTimeout(finalTimer);
      A.droneOff();
      S.freeze = null;
      el.freeze.hidden = true;
      el.freeze.classList.remove('final');
      startEnding();
    };
  }

  /* ---------------- ledger ---------------- */
  function renderLedger() {
    const list = Object.entries(C.ventures).filter(([, v]) => v.act === S.act);
    const income = totalYield();
    el.ledgerBody.innerHTML =
      `<p class="ledger-sum">Passive income: <b>${fmt(income)}/hr</b>${act().overhead ? ` · Overheads: <b>${fmt(act().overhead)}/day</b> (${act().overheadWhy})` : ''}</p>` +
      list
        .map(([id, v]) => {
          const owned = !!S.ventures[id];
          const can = S.cash >= v.cost;
          return `<div class="venture${owned ? ' owned' : ''}">
          <div class="v-head"><b>${esc(v.name)}</b><span>${fmt(v.yield)}/hr</span></div>
          <p>${esc(v.blurb)}</p>
          ${owned ? '<span class="v-owned">Owned</span>' : `<button data-v="${id}" ${can ? '' : 'disabled'}>Buy · ${fmt(v.cost)}</button>`}
        </div>`;
        })
        .join('');
    el.ledgerBody.querySelectorAll('button[data-v]').forEach((b) => b.addEventListener('click', () => buyVenture(b.dataset.v)));
  }
  function buyVenture(id) {
    const v = C.ventures[id];
    if (!v || S.ventures[id] || S.cash < v.cost) return;
    S.cash -= v.cost;
    S.ventures[id] = true;
    S.mono = clamp(S.mono + 8, 0, 100);
    S.happy = clamp(S.happy - 3, 0, 100);
    popups(['NEW VENTURE!', v.name.toUpperCase()]);
    pushFeed(`${v.name} is open for business.`, 'biz');
    hud();
  }
  function totalYield() {
    return Object.keys(S.ventures).reduce((s, id) => s + (C.ventures[id] && C.ventures[id].act === S.act ? C.ventures[id].yield : 0), 0);
  }
  function toggleLedger(force) {
    if (act().noLedger) return;
    const show = force != null ? force : el.ledger.hidden;
    el.ledger.hidden = !show;
    if (show) renderLedger();
  }

  /* ---------------- time ---------------- */
  function tick(dt) {
    if (!S || S.phase !== 'play' || S.freeze || cardOpen) return;
    const a = act();
    const adv = dt * a.rate * SPEEDS[speedIdx];
    if (adv <= 0) return;
    const prevMin = S.minute;
    S.minute += adv;
    if (a.noDayEnd) S.minute = Math.min(S.minute, DAY_END - 1);

    // passive income
    if (S.act < 4) {
      S.incomeAcc += (totalYield() * adv) / 60;
      if (S.incomeAcc >= 1) {
        const whole = Math.floor(S.incomeAcc);
        S.cash += whole;
        S.stats.extracted += whole;
        S.incomeAcc -= whole;
      }
      // venture externalities, roughly once an in-game hour
      S.extAcc += adv;
      if (S.extAcc >= 60) {
        S.extAcc -= 60;
        const owned = Object.keys(S.ventures).filter((id) => C.ventures[id].act === S.act);
        if (owned.length) {
          const v = C.ventures[owned[Math.floor(Math.random() * owned.length)]];
          const line = v.ext[Math.floor(Math.random() * v.ext.length)];
          if (Math.random() < 0.6 && !S.feed.slice(0, 4).some((f) => f.text === line)) pushFeed(line);
          S.happy = clamp(S.happy - owned.length * 0.8, 0, 100);
          S.stats.harmed += owned.length;
        }
      }
    }
    // delayed consequences
    while (S.feedQueue.length && S.feedQueue[0].at <= S.minute) pushFeed(S.feedQueue.shift().text);
    if (Math.floor(prevMin) !== Math.floor(S.minute)) {
      hud();
      if (R.view.bg === 'corridor' || R.view.bg === 'office') R.setView({ minute: S.minute });
    }

    if (!S.current && !resultPending) {
      if (!a.noDayEnd && S.minute >= DAY_END) return endDay();
      const ms = C.milestones[S.act];
      if (ms && storyDone() && S.cash >= a.target && S.minute >= S.milestoneSnooze) return openEnc({ kind: 'milestone' });
      if (S.minute >= S.nextAt) spawnNext();
    }
  }

  function endDay() {
    const a = act();
    if (!S.dayClosed) {
      S.dayClosed = true;
      if (a.overhead) {
        S.cash = Math.max(0, S.cash - a.overhead);
        pushFeed(`Paid ${fmt(a.overhead)} in ${a.overheadWhy}.`, 'biz');
      }
    }
    if (S.cash < quota()) {
      enterFreeze({ kind: 'quota' });
      return;
    }
    const earned = S.cash - S.dayStartCash;
    S.dayClosed = false;
    showCard({
      cls: 'card-day',
      html: `<h2>End of Day ${S.day}</h2>
        <p class="sub">${esc(a.school)} · ${DAYS[(S.day - 1) % 5]}</p>
        <dl>
          <dt>Net change</dt><dd>${earned >= 0 ? '+' : ''}${fmt(earned)}</dd>
          <dt>Cash</dt><dd>${fmt(S.cash)}</dd>
          <dt>Tomorrow's quota</dt><dd>${fmt(a.quotaBase + a.quotaStep * S.day)}</dd>
          <dt>Playground happiness</dt><dd>${Math.round(S.happy)}%</dd>
        </dl>`,
      buttons: [{ label: 'Next day', fn: nextDay }],
    });
  }
  function nextDay() {
    S.day++;
    S.minute = DAY_START;
    S.nextAt = DAY_START + 15;
    S.dayStartCash = S.cash;
    S.milestoneSnooze = 0;
    showScene(null);
    hud();
    save();
  }

  /* ---------------- acts ---------------- */
  function startAct(n, opts = {}) {
    const a = C.acts[n];
    S.act = n;
    S.day = 1;
    S.minute = a.start;
    S.nextAt = a.firstAt;
    S.storyIdx = 0;
    S.ventures = {};
    a.startVentures.forEach((id) => (S.ventures[id] = true));
    S.current = null;
    S.freeze = null;
    S.dayClosed = false;
    S.milestoneSnooze = 0;
    S.feedQueue = [];
    S.dayStartCash = S.cash;
    if (n > 1 && n < 4) S.happy = 100;
    S.phase = 'play';
    setMode('play');
    document.body.className = 'style-' + a.style;
    if (n > 1) pushFeed(`— ${a.school} —`, 'sep');
    el.ledger.hidden = true;
    showScene(null, n === 4 ? { rain: true } : {}, n === 4 ? { glitch: true } : { fade: true });
    if (n === 4) A.rainOn(0.18); else A.rainOff();
    hud();
    renderFeed();
    if (!opts.skipIntro) {
      showCard({
        cls: 'card-act',
        html: `<p class="kicker">Act ${n} · ${esc(a.ages)}</p><h1>${esc(a.title)}</h1><p class="sub">${esc(a.school)}</p>` +
          a.intro.map((l) => `<p>${esc(l)}</p>`).join(''),
        buttons: [{ label: n === 4 ? 'Go to the office' : 'Start the day', fn: () => { save(); } }],
      });
    }
  }

  function endAct() {
    const n = S.act;
    // liquidate this act's ventures at half price
    let liq = 0;
    Object.keys(S.ventures).forEach((id) => { if (C.ventures[id].act === n) liq += Math.floor(C.ventures[id].cost / 2); });
    S.cash += liq;
    const a = act();
    const next = C.acts[n + 1];
    showCard({
      cls: 'card-act',
      html: `<p class="kicker">Act ${n} complete</p><h1>${esc(a.title)}</h1>
        <dl>
          <dt>Cash carried forward</dt><dd>${fmt(S.cash)}</dd>
          ${liq ? `<dt>Ventures liquidated</dt><dd>+${fmt(liq)}</dd>` : ''}
          <dt>Children harmed (approx.)</dt><dd>${S.stats.harmed}</dd>
          <dt>Kindnesses afforded</dt><dd>${S.stats.kind}</dd>
          <dt>Times time stopped</dt><dd>${S.stats.freezes}</dd>
          <dt>Soul</dt><dd>${Math.round(S.soul)}/100</dd>
        </dl>
        <p class="sub">Next: ${esc(next.school)}</p>`,
      buttons: [{ label: 'Grow up', fn: () => startAct(n + 1) }],
    });
  }

  /* ---------------- ending ---------------- */
  function setMode(m) { el.game.dataset.mode = m; }

  function startEnding() {
    S.phase = 'ending';
    setMode('ending');
    clearSave();
    A.droneOff();
    A.rainOn(0.2);
    el.dialogue.hidden = true;
    el.objective.textContent = '';
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
        cls: 'card-ending' + (e.big ? ' big' : ''),
        html: e.big ? `<h1 class="market">${e.big}</h1>` : `<p>${esc(e.text)}</p>`,
        buttons: [{ label: '…', fn: step, keep: true }],
        delay: e.big ? 2500 : 900,
      });
    };
    step();
  }
  function finalStats() {
    const st = S.stats;
    showCard({
      cls: 'card-act',
      html: `<p class="kicker">Generation ${S.gen}</p><h1>The Ledger</h1>
        <dl>
          <dt>Total extracted</dt><dd>${fmt(st.extracted)}</dd>
          <dt>Spent trying to make it go away</dt><dd>${fmt(st.wasted)}</dd>
          <dt>Children harmed (approx.)</dt><dd>${st.harmed}</dd>
          <dt>Kindnesses afforded</dt><dd>${st.kind}</dd>
          <dt>Times time stopped</dt><dd>${st.freezes}</dd>
          <dt>Raindrops counted</dt><dd>${st.raindrops.toLocaleString('en-GB')}</dd>
          <dt>Soul remaining</dt><dd>${Math.round(S.soul)}/100</dd>
        </dl>
        <p class="sub">A new kid is waiting behind the sports shed.</p>`,
      buttons: [{ label: 'Begin again', fn: () => newGame(S.gen + 1) }],
    });
  }

  /* ---------------- cards (title, transitions) ---------------- */
  function showCard({ html, buttons, cls = '', delay = 0 }) {
    cardOpen = true;
    el.card.className = 'card ' + cls;
    el.card.innerHTML = `<div class="card-inner">${html}<div class="card-buttons"></div></div>`;
    const box = el.card.querySelector('.card-buttons');
    buttons.forEach((b, i) => {
      const btn = document.createElement('button');
      btn.textContent = b.label;
      if (b.secondary) btn.className = 'secondary';
      btn.addEventListener('click', () => {
        A.init();
        A.click();
        cardOpen = false;
        el.card.hidden = true;
        b.fn();
      });
      if (delay) { btn.disabled = true; setTimeout(() => { btn.disabled = false; if (i === 0) btn.focus({ preventScroll: true }); }, delay); }
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
    if (saved) buttons.push({ label: `Continue (Act ${saved.act}, Day ${saved.day})`, fn: () => resume(saved), secondary: true });
    showCard({
      cls: 'card-title',
      html: `<h1 class="logo">TUCK</h1>
        <p class="kicker">working title: Tuck Shop Tycoon</p>
        <p>A dark satirical management sim about the micro-economy of a British schoolyard.</p>
        <p class="small">Exploitation always works. Decency costs money you don't have.<br>If you refuse to play along, time stops. Indefinitely.</p>
        <p class="small keys">Keys: <kbd>1</kbd>–<kbd>4</kbd> choose · <kbd>Enter</kbd> carry on · <kbd>L</kbd> ledger</p>`,
      buttons,
    });
  }

  function newGame(gen) {
    clearSave();
    A.init();
    A.rainOff();
    A.droneOff();
    S = newState(gen);
    startAct(1);
    pushFeed(gen > 1 ? `Generation ${gen}. Same playground. New kid.` : 'Morning break has started.');
  }
  function resume(saved) {
    A.init();
    S = Object.assign(newState(), saved, { current: null, freeze: null, phase: 'play' });
    startAct(S.act, { skipIntro: true });
    // startAct resets the day; restore the saved position
    Object.assign(S, { day: saved.day, minute: saved.minute, nextAt: saved.nextAt, storyIdx: saved.storyIdx, ventures: saved.ventures, happy: saved.happy, dayStartCash: saved.cash, feedQueue: saved.feedQueue || [] });
    showScene(null);
    hud();
    renderFeed();
  }

  /* ---------------- input ---------------- */
  function onKey(e) {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (!el.card.hidden) return; // buttons in cards handle Enter natively via focus
    if (resultPending && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); continueResult(); return; }
    if (S && S.current && !resultPending && !S.freeze && /^[1-9]$/.test(e.key)) {
      const btn = el.dOptions.children[+e.key - 1];
      if (btn && !btn.disabled) choose(+e.key - 1);
      return;
    }
    if (e.key === 'l' || e.key === 'L') toggleLedger();
    if (e.key === 'Escape') toggleLedger(false);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    const ids = {
      act: '#hud-act', school: '#hud-school', day: '#hud-day', time: '#hud-time', cash: '#hud-cash',
      quota: '#hud-quota', surplus: '#hud-surplus', target: '#hud-target',
      soul: '#bar-soul', happy: '#bar-happy', mono: '#bar-mono', soulV: '#val-soul', happyV: '#val-happy', monoV: '#val-mono',
      objective: '#objective', feedTitle: '#feed-title', feedList: '#feed-list',
      dialogue: '#dialogue', dSpeaker: '#d-speaker', dText: '#d-text', dOptions: '#d-options',
      ledger: '#ledger', ledgerBody: '#ledger-body', ledgerBtn: '#btn-ledger',
      freeze: '#freeze', fReason: '#f-reason', fHint: '#f-hint', fIdle: '#f-idle', fLog: '#f-log', fReconsider: '#f-reconsider',
      card: '#card', fx: '#fx', game: '#game', speed: '#btn-speed', mute: '#btn-mute',
    };
    for (const k in ids) el[k] = $(ids[k]);

    R.init($('#stage'));
    el.ledgerBtn.addEventListener('click', () => { A.click(); toggleLedger(); });
    $('#ledger-close').addEventListener('click', () => toggleLedger(false));
    el.fReconsider.addEventListener('click', () => { if (S.freeze && S.freeze.kind !== 'final') reconsider(); });
    el.speed.addEventListener('click', () => { speedIdx = (speedIdx + 1) % SPEEDS.length; el.speed.textContent = SPEEDS[speedIdx] + '×'; });
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
        skip(min) { S.minute += min; },
        speed(x) { SPEEDS[speedIdx] = x; },
        choose, continueResult, reconsider, startAct, endAct, quota,
        jumpAct(n) { cardOpen = false; el.card.hidden = true; startAct(n, { skipIntro: true }); },
      };
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
