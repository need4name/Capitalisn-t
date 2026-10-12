/*
 * TUCK — Sixth Form art style: flat "corporate illustration".
 * The kind of picture that lives on a startup's About page: calm pastels, soft
 * shapes, no outlines, potted plants, and people with long bendy limbs and very
 * small heads who all seem extremely pleased about something.
 * Small print still drifts along the bottom.
 */
(() => {
  const T = window.Tuck;
  const { K, GROUND, HAIR, rng, props } = T.kit;
  const X = (v) => v * K;

  const C = {
    cream: '#f3ece0', wall: '#efe5d4', floor: '#e3d4bd', floorDark: '#d6c4a8',
    coral: '#e9846c', peach: '#f2c0a2', sage: '#a9c2a3', sageDark: '#7d9d79', leaf: '#6f9a6c',
    blue: '#a8bfdc', blueDark: '#7c97bd', sky: '#d7e3ee', mustard: '#ecc35c', lilac: '#c6b6de',
    ink: '#2d2a32', white: '#fffdf8', grey: '#cfc8bd', terracotta: '#d98a66',
  };

  /* ---------- drawing helpers (virtual 320×180 coordinates) ---------- */
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    if (g.roundRect) g.roundRect(X(x), X(y), X(w), X(h), X(r));
    else g.rect(X(x), X(y), X(w), X(h));
  }
  function fillRR(g, x, y, w, h, r, col) { rr(g, x, y, w, h, r); g.fillStyle = col; g.fill(); }
  function ell(g, x, y, rx, ry, col, rot = 0) {
    g.beginPath();
    g.ellipse(X(x), X(y), X(rx), X(ry), rot, 0, Math.PI * 2);
    g.fillStyle = col;
    g.fill();
  }
  // A soft organic blob: the background shapes this style is known for.
  function blob(g, cx, cy, rx, ry, seed, col, t = 0) {
    const r = rng(seed);
    const n = 9, ph = [r() * 6, r() * 6, r() * 6];
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 1 + 0.12 * Math.sin(a * 2 + ph[0] + t * 0.15) + 0.08 * Math.sin(a * 3 + ph[1]);
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    g.beginPath();
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let m = mid(pts[n - 1], pts[0]);
    g.moveTo(X(m[0]), X(m[1]));
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      m = mid(p, q);
      g.quadraticCurveTo(X(p[0]), X(p[1]), X(m[0]), X(m[1]));
    }
    g.closePath();
    g.fillStyle = col;
    g.fill();
  }
  function stroke(g, pts, col, w) {
    g.beginPath();
    g.moveTo(X(pts[0]), X(pts[1]));
    if (pts.length === 6) g.quadraticCurveTo(X(pts[2]), X(pts[3]), X(pts[4]), X(pts[5]));
    else for (let i = 2; i < pts.length; i += 2) g.lineTo(X(pts[i]), X(pts[i + 1]));
    g.strokeStyle = col;
    g.lineWidth = X(w);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.stroke();
  }
  function text(g, s, x, y, size, col, weight = 800, align = 'center') {
    g.font = `${weight} ${X(size)}px Inter, "Helvetica Neue", Arial, sans-serif`;
    g.textAlign = align;
    g.textBaseline = 'middle';
    g.fillStyle = col;
    g.fillText(s, X(x), X(y));
  }

  // A potted plant with big leaves that sway a little.
  function plant(g, x, y, s, t, frozen) {
    const sway = frozen ? 0 : Math.sin(t * 0.9 + x) * 0.05;
    const leaves = [[-0.9, 20, C.leaf], [-0.35, 24, C.sageDark], [0.2, 23, C.leaf], [0.75, 19, C.sageDark], [-0.1, 16, '#8fb08a']];
    leaves.forEach(([a, len, col]) => {
      g.save();
      g.translate(X(x), X(y - 10 * s));
      g.rotate(a + sway);
      g.beginPath();
      g.ellipse(0, X(-len * s * 0.5), X(4.2 * s), X(len * s * 0.5), 0, 0, Math.PI * 2);
      g.fillStyle = col;
      g.fill();
      g.restore();
    });
    g.beginPath();
    g.moveTo(X(x - 7 * s), X(y - 12 * s));
    g.lineTo(X(x + 7 * s), X(y - 12 * s));
    g.lineTo(X(x + 5 * s), X(y));
    g.lineTo(X(x - 5 * s), X(y));
    g.closePath();
    g.fillStyle = C.terracotta;
    g.fill();
  }
  function floor(g, top, col) {
    g.fillStyle = col;
    g.fillRect(0, X(top), X(320), X(180 - top));
  }
  function cloud(g, x, y, s) {
    ell(g, x, y, 9 * s, 4 * s, C.white);
    ell(g, x + 6 * s, y - 2 * s, 6 * s, 4.5 * s, C.white);
    ell(g, x - 6 * s, y + 0.5 * s, 5 * s, 3 * s, C.white);
  }
  // The rebrand: "tuck." in lower case, with a full stop, because it's a lifestyle now.
  function wordmark(g, x, y, size, col = C.ink) {
    text(g, 'tuck', x, y, size, col, 800, 'right');
    ell(g, x + size * 0.18, y + size * 0.26, size * 0.11, size * 0.11, C.coral);
  }

  /* ---------- backgrounds ---------- */
  function commonRoom(p, v) {
    const g = p.g, t = p.t;
    g.fillStyle = C.wall;
    g.fillRect(0, 0, X(320), X(180));
    blob(g, 60, 52, 46, 38, 3, '#f5d9c4', t);
    blob(g, 268, 40, 34, 30, 8, '#dcd2ea', t);
    // window
    fillRR(g, 118, 20, 84, 62, 8, C.sky);
    const drift = v.frozen ? 0 : (t * 2) % 120;
    g.save();
    rr(g, 118, 20, 84, 62, 8);
    g.clip();
    cloud(g, 120 + drift, 36, 1);
    cloud(g, 60 + drift, 30, 0.8);
    blob(g, 160, 92, 70, 22, 5, '#bcd2b5');
    ell(g, 182, 54, 9, 10, C.sageDark);
    g.fillStyle = '#9a7a5a';
    g.fillRect(X(181), X(60), X(2), X(16));
    g.restore();
    fillRR(g, 157, 20, 2.5, 62, 1, C.white);
    fillRR(g, 118, 49, 84, 2.5, 1, C.white);
    // pendant lamp
    stroke(g, [86, 0, 86, 16], C.ink, 0.6);
    g.beginPath();
    g.arc(X(86), X(22), X(7), Math.PI, 0);
    g.fillStyle = C.mustard;
    g.fill();
    // poster: a chart that only goes up
    fillRR(g, 228, 26, 54, 44, 4, C.white);
    [[236, 14, C.sage], [246, 20, C.blue], [256, 27, C.mustard], [266, 35, C.coral]].forEach(([x, h, c]) => fillRR(g, x, 64 - h, 7, h, 1.5, c));
    stroke(g, [234, 52, 252, 44, 276, 30], C.ink, 0.8);
    wordmark(g, 249, 33, 6.5);
    floor(g, 106, C.floor);
    ell(g, 160, 128, 120, 12, '#eadfcb');
    // bean bag and a plant
    blob(g, 300, 112, 20, 12, 11, C.coral);
    plant(g, 24, 110, 1.15, t, v.frozen);
  }

  function office(p, v) {
    const g = p.g, t = p.t;
    g.fillStyle = '#ece6dc';
    g.fillRect(0, 0, X(320), X(180));
    // big window with a pastel skyline
    fillRR(g, 54, 16, 212, 72, 6, C.sky);
    g.save();
    rr(g, 54, 16, 212, 72, 6);
    g.clip();
    const drift = v.frozen ? 0 : (t * 1.5) % 260;
    cloud(g, 40 + drift, 30, 1.1);
    const r = rng(12);
    for (let x = 50; x < 270; x += 15) {
      const h = 18 + r() * 40;
      fillRR(g, x, 88 - h, 13, h + 4, 2, [C.blue, C.lilac, '#f0cdb6', '#c9d8c4'][Math.floor(r() * 4)]);
      for (let wy = 92 - h; wy < 84; wy += 6) fillRR(g, x + 3, wy, 7, 2, 1, 'rgba(255,253,248,0.6)');
    }
    g.restore();
    for (const x of [124, 194]) fillRR(g, x, 16, 2.5, 72, 1, C.white);
    floor(g, 106, '#e0cdb0');
    // desk
    fillRR(g, 118, 92, 92, 6, 3, C.white);
    fillRR(g, 124, 98, 4, 16, 2, C.grey);
    fillRR(g, 200, 98, 4, 16, 2, C.grey);
    // laptop with sticker, and a mug
    g.beginPath();
    g.moveTo(X(140), X(92)); g.lineTo(X(144), X(78)); g.lineTo(X(166), X(78)); g.lineTo(X(170), X(92));
    g.closePath();
    g.fillStyle = '#b9b3aa';
    g.fill();
    ell(g, 155, 85, 2.2, 2.2, C.coral);
    fillRR(g, 182, 85, 6, 7, 2, C.mustard);
    // framed chart
    fillRR(g, 274, 30, 34, 26, 3, C.white);
    stroke(g, [279, 50, 290, 42, 303, 35], C.coral, 1.2);
    wordmark(g, 22 + 18, 36, 8);
    plant(g, 296, 112, 1.25, t, v.frozen);
  }

  function corridor(p, v) {
    const g = p.g, t = p.t;
    g.fillStyle = C.wall;
    g.fillRect(0, 0, X(320), X(180));
    blob(g, 250, 30, 50, 24, 21, '#f3dccb', t);
    // lockers
    const cols = [C.sage, C.blue, C.coral, C.mustard, C.lilac];
    for (let i = 0; i < 12; i++) {
      const x = 6 + i * 22;
      if (x > 228) break;
      fillRR(g, x, 40, 20, 66, 4, cols[i % 5]);
      for (let k = 0; k < 3; k++) fillRR(g, x + 5, 46 + k * 3, 10, 1.2, 0.6, 'rgba(255,253,248,0.55)');
      ell(g, x + 16, 74, 1.4, 1.4, C.white);
    }
    // door with a round window
    fillRR(g, 252, 34, 42, 72, 5, '#d9c7aa');
    ell(g, 273, 54, 9, 9, C.sky);
    ell(g, 287, 72, 1.8, 1.8, C.ink);
    // motivational poster
    fillRR(g, 60, 10, 92, 22, 4, C.white);
    text(g, 'DREAM BIG (£2)', 106, 21.5, 7, C.ink, 800);
    floor(g, 106, C.floor);
    for (let x = -10; x < 330; x += 28) fillRR(g, x, 116, 20, 3, 1.5, C.floorDark);
    plant(g, 238, 112, 0.95, t, v.frozen);
  }

  function outside(p, v) {
    const g = p.g, t = p.t;
    g.fillStyle = C.sky;
    g.fillRect(0, 0, X(320), X(180));
    const drift = v.frozen ? 0 : (t * 1.2) % 360;
    cloud(g, (40 + drift) % 360 - 20, 24, 1.2);
    cloud(g, (220 + drift) % 360 - 20, 38, 0.9);
    ell(g, 270, 26, 12, 12, '#f6dc8c');
    blob(g, 70, 108, 110, 34, 31, '#bcd2b5');
    blob(g, 250, 112, 120, 30, 33, '#a9c2a3');
    // school building, very rebranded
    fillRR(g, 108, 42, 104, 64, 6, '#f0cdb6');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) fillRR(g, 116 + c * 16, 50 + r * 16, 10, 9, 2, C.white);
    fillRR(g, 150, 84, 20, 22, 4, C.coral);
    wordmark(g, 168, 37, 9);
    floor(g, 106, '#d8cdb8');
    // lollipop trees
    for (const [x, s] of [[30, 1.1], [290, 1.2]]) {
      g.fillStyle = '#9a7a5a';
      g.fillRect(X(x - 1), X(80), X(2.4), X(28));
      ell(g, x, 72 - 4 * s, 12 * s, 14 * s, C.sageDark);
    }
  }

  function bg(p, v) {
    if (v.bg === 'office') office(p, v);
    else if (v.bg === 'corridor') corridor(p, v);
    else if (v.bg === 'sixth' || !v.bg) commonRoom(p, v);
    else outside(p, v);
  }

  /* ---------- people: long bendy limbs, very small heads ---------- */
  function figure(p, f) {
    const g = p.g;
    const s = f.s || 1;
    const x = f.x, y = f.y != null ? f.y : GROUND;
    const still = f.frozen;
    const bob = still ? 0 : Math.sin(p.t * 2.2 + x * 0.7) * 0.5;
    const legH = 19 * s, bodyH = 15 * s, headR = 4.6 * s;
    const bw = 11.5 * s * (f.wide || 1);
    const hip = y - legH, sh = hip - bodyH + bob, hy = sh - 1.6 * s - headR;
    const c = (col) => p.c(col);
    const top = c(f.coat || f.blazer || f.shirt);
    const shoe = c((f.shoes || ['#2d2a32'])[0]);

    ell(g, x, y + 0.6, 11 * s * (f.wide || 1), 1.8 * s, 'rgba(90,70,50,0.12)');

    if (f.can) return canFigure(p, f, { x, y, s, hy, headR, c });

    // legs: one stroke each with a soft bend, big flat shoes
    const legCol = c(f.trousers || '#2d2a32');
    const skinCol = c(f.skin);
    const bare = f.skirt || f.shorts;
    const step = still ? 0 : Math.sin(p.t * 2 + x) * 0.6 * s;
    for (const side of [-1, 1]) {
      const hx = x + side * 2.6 * s, fx = x + side * 4.2 * s + (side < 0 ? step : -step);
      stroke(g, [hx, hip, hx + side * 1.6 * s, hip + legH * 0.55, fx, y - 1.6 * s], bare ? skinCol : legCol, 4 * s);
      ell(g, fx + side * 1.4 * s, y - 1 * s, 3.4 * s, 1.5 * s, shoe);
    }
    if (f.skirt) {
      g.beginPath();
      g.moveTo(X(x - bw / 2 + 0.5 * s), X(hip - 1 * s));
      g.lineTo(X(x + bw / 2 - 0.5 * s), X(hip - 1 * s));
      g.lineTo(X(x + bw / 2 + 2.5 * s), X(hip + 8 * s));
      g.lineTo(X(x - bw / 2 - 2.5 * s), X(hip + 8 * s));
      g.closePath();
      g.fillStyle = legCol;
      g.fill();
    } else if (f.shorts) {
      fillRR(g, x - bw / 2 + 0.5 * s, hip - 1.5 * s, bw - 1 * s, 7 * s, 2 * s, legCol);
    }

    // long coat to the knees
    if (f.coat) {
      g.beginPath();
      g.moveTo(X(x - bw / 2), X(sh + 1 * s));
      g.lineTo(X(x + bw / 2), X(sh + 1 * s));
      g.lineTo(X(x + bw / 2 + 3 * s), X(hip + 10 * s));
      g.lineTo(X(x - bw / 2 - 3 * s), X(hip + 10 * s));
      g.closePath();
      g.fillStyle = top;
      g.fill();
    }
    // torso: a soft trapezoid
    g.beginPath();
    g.moveTo(X(x - bw / 2 + 2 * s), X(sh));
    g.lineTo(X(x + bw / 2 - 2 * s), X(sh));
    g.quadraticCurveTo(X(x + bw / 2 + 0.5 * s), X(sh), X(x + bw / 2), X(sh + 3 * s));
    g.lineTo(X(x + bw / 2 - 1 * s), X(hip + 1 * s));
    g.lineTo(X(x - bw / 2 + 1 * s), X(hip + 1 * s));
    g.lineTo(X(x - bw / 2), X(sh + 3 * s));
    g.quadraticCurveTo(X(x - bw / 2 - 0.5 * s), X(sh), X(x - bw / 2 + 2 * s), X(sh));
    g.closePath();
    g.fillStyle = top;
    g.fill();
    if (f.blazer || f.coat) {
      g.beginPath();
      g.moveTo(X(x - 2.4 * s), X(sh)); g.lineTo(X(x + 2.4 * s), X(sh)); g.lineTo(X(x), X(sh + 6.5 * s));
      g.closePath();
      g.fillStyle = c(f.shirt);
      g.fill();
    }
    if (f.apron) fillRR(g, x - bw / 2 + 2 * s, sh + 4 * s, bw - 4 * s, bodyH - 2 * s, 1.5 * s, c('#ffffff'));
    if (f.tie) {
      g.beginPath();
      g.moveTo(X(x - 0.9 * s), X(sh + 0.8 * s)); g.lineTo(X(x + 0.9 * s), X(sh + 0.8 * s));
      g.lineTo(X(x + 1.2 * s), X(sh + 9 * s)); g.lineTo(X(x), X(sh + 10.5 * s)); g.lineTo(X(x - 1.2 * s), X(sh + 9 * s));
      g.closePath();
      g.fillStyle = c(f.tie);
      g.fill();
    }
    if (f.sash) stroke(g, [x - bw / 2 + 1 * s, sh + 1 * s, x + bw / 2 - 1 * s, hip], c('#ecc35c'), 2.2 * s);
    if (f.lanyard) { stroke(g, [x - 2.6 * s, sh, x, sh + 8 * s, x + 2.6 * s, sh], c('#6f8fb8'), 0.7); fillRR(g, x - 1.6 * s, sh + 8 * s, 3.2 * s, 3.8 * s, 0.6 * s, c('#ffffff')); }
    if (f.badge) ell(g, x - 3.2 * s, sh + 4 * s, 1.4 * s, 1.4 * s, c('#ecc35c'));

    // arms: long and noodly, hands down by the knees. Tuck presents.
    const swing = still ? 0 : Math.sin(p.t * 1.8 + x) * 0.8 * s;
    const sleeve = top;
    const handL = [x - bw / 2 - 3 * s, hip + 7 * s + swing];
    let handR = [x + bw / 2 + 3 * s, hip + 7 * s - swing];
    stroke(g, [x - bw / 2 + 0.8 * s, sh + 2 * s, x - bw / 2 - 4 * s, sh + bodyH * 0.6, handL[0], handL[1]], sleeve, 3.2 * s);
    if (f.isTuck && !f.pound && f.mood !== 'sad' && f.mood !== 'crying') {
      handR = [x + bw / 2 + 11 * s, sh + 3 * s + swing * 0.5];
      stroke(g, [x + bw / 2 - 0.8 * s, sh + 2 * s, x + bw / 2 + 6 * s, sh + 7 * s, handR[0], handR[1]], sleeve, 3.2 * s);
    } else {
      stroke(g, [x + bw / 2 - 0.8 * s, sh + 2 * s, x + bw / 2 + 4 * s, sh + bodyH * 0.6, handR[0], handR[1]], sleeve, 3.2 * s);
    }
    ell(g, handL[0], handL[1], 1.6 * s, 1.6 * s, skinCol);
    ell(g, handR[0], handR[1], 1.6 * s, 1.6 * s, skinCol);

    // carried things
    if (f.jumperRoll) { blob(g, x + bw / 2 + 4 * s, hip - 2 * s, 5 * s, 3.2 * s, 7, c('#8a8a8a')); ell(g, x + bw / 2 + 7 * s, hip - 3 * s, 1.3 * s, 1.3 * s, c('#2ecc71')); }
    if (f.organiser) { fillRR(g, x + bw / 2 + 1 * s, hip - 4 * s, 4.5 * s, 6.5 * s, 1 * s, c('#2d2a32')); fillRR(g, x + bw / 2 + 1.7 * s, hip - 3 * s, 3.1 * s, 2.6 * s, 0.5 * s, c('#a8e0a0')); }
    if (f.sandwich) { g.beginPath(); g.moveTo(X(handL[0] - 3 * s), X(handL[1])); g.lineTo(X(handL[0] + 3 * s), X(handL[1])); g.lineTo(X(handL[0]), X(handL[1] - 5 * s)); g.closePath(); g.fillStyle = c('#f3e1a1'); g.fill(); }
    if (f.ledger) fillRR(g, handL[0] - 3 * s, handL[1] - 7 * s, 5 * s, 7 * s, 0.8 * s, c('#7a1f1f'));

    // neck, head, hair
    fillRR(g, x - 1.1 * s, sh - 2.2 * s, 2.2 * s, 3 * s, 1 * s, skinCol);
    ell(g, x, hy, headR, headR * 1.05, skinCol);
    (HAIR[f.hairStyle] || HAIR.short)(p, x, hy, headR, f.hair, f.hairColor2);

    // face: dots and a line
    const ex = 1.6 * s, ey = hy + 0.2 * s, my = hy + 2.2 * s;
    if (f.pound) {
      text(g, '£', x - ex, ey, 2.6 * s, c('#2e8b3a'));
      text(g, '£', x + ex, ey, 2.6 * s, c('#2e8b3a'));
    } else if (f.shades) {
      fillRR(g, x - 3.4 * s, ey - 0.9 * s, 6.8 * s, 1.8 * s, 0.8 * s, '#2d2a32');
    } else if (f.mood === 'tired') {
      stroke(g, [x - ex - 0.6 * s, ey, x - ex + 0.6 * s, ey], C.ink, 0.45);
      stroke(g, [x + ex - 0.6 * s, ey, x + ex + 0.6 * s, ey], C.ink, 0.45);
    } else {
      ell(g, x - ex, ey, 0.55 * s, 0.55 * s, C.ink);
      ell(g, x + ex, ey, 0.55 * s, 0.55 * s, C.ink);
    }
    if (f.glasses) {
      for (const d of [-ex, ex]) { g.beginPath(); g.arc(X(x + d), X(ey), X(1.25 * s), 0, Math.PI * 2); g.strokeStyle = C.ink; g.lineWidth = X(0.3); g.stroke(); }
    }
    if (f.mood === 'angry') {
      stroke(g, [x - ex - 1 * s, ey - 1.5 * s, x - ex + 0.8 * s, ey - 0.9 * s], C.ink, 0.45);
      stroke(g, [x + ex + 1 * s, ey - 1.5 * s, x + ex - 0.8 * s, ey - 0.9 * s], C.ink, 0.45);
    }
    const mouth = '#8a4a40';
    switch (f.mood) {
      case 'happy': stroke(g, [x - 1.4 * s, my - 0.3 * s, x, my + 0.8 * s, x + 1.4 * s, my - 0.3 * s], mouth, 0.45); break;
      case 'smug': stroke(g, [x - 1.2 * s, my, x + 0.6 * s, my, x + 1.5 * s, my - 0.7 * s], mouth, 0.45); break;
      case 'sad': case 'tired': stroke(g, [x - 1.2 * s, my + 0.5 * s, x, my - 0.2 * s, x + 1.2 * s, my + 0.5 * s], mouth, 0.45); break;
      case 'crying': {
        ell(g, x, my + 0.2 * s, 0.8 * s, 0.7 * s, mouth);
        const drip = still ? 0.5 : (p.t * 1.2 + x) % 1;
        ell(g, x - ex - 0.3 * s, ey + 1.2 * s + drip * 3 * s, 0.5 * s, 0.7 * s, c('#6fa8dc'));
        ell(g, x + ex + 0.3 * s, ey + 1.2 * s + ((drip + 0.5) % 1) * 3 * s, 0.5 * s, 0.7 * s, c('#6fa8dc'));
        break;
      }
      case 'angry': stroke(g, [x - 1.2 * s, my + 0.3 * s, x + 1.2 * s, my + 0.3 * s], mouth, 0.5); break;
      default: stroke(g, [x - 1 * s, my, x + 1 * s, my], mouth, 0.4);
    }
    // the shared details (moustaches, clipboards, mops, briefcases…), placed on this body
    props(p, f, { x, s, hy, headR, ex, ey, my: my + 0.6 * s, hip, sh, bw, yy: y, legH });
  }

  // Voltage Vince, inside a giant can, waving.
  function canFigure(p, f, { x, y, s, hy, headR, c }) {
    const g = p.g;
    const wave = f.frozen ? 0 : Math.sin(p.t * 3) * 2 * s;
    stroke(g, [x - 3 * s, y - 8 * s, x - 3.5 * s, y - 1.5 * s], c('#2d2a32'), 3.6 * s);
    stroke(g, [x + 3 * s, y - 8 * s, x + 3.5 * s, y - 1.5 * s], c('#2d2a32'), 3.6 * s);
    stroke(g, [x - 10 * s, y - 30 * s, x - 17 * s, y - 36 * s - wave], c('#e8202a'), 3 * s);
    stroke(g, [x + 10 * s, y - 30 * s, x + 16 * s, y - 22 * s], c('#e8202a'), 3 * s);
    ell(g, x - 17 * s, y - 36 * s - wave, 1.7 * s, 1.7 * s, c(f.skin));
    ell(g, x + 16 * s, y - 22 * s, 1.7 * s, 1.7 * s, c(f.skin));
    fillRR(g, x - 11 * s, y - 46 * s, 22 * s, 39 * s, 5 * s, c('#e8202a'));
    fillRR(g, x - 11 * s, y - 30 * s, 22 * s, 6 * s, 0, c('#ffffff'));
    text(g, 'volt', x, y - 27 * s, 4.6 * s, c('#e8202a'), 800);
    ell(g, x, y - 46 * s, 11 * s, 2.4 * s, c('#d6d1c8'));
    // face through the hole in the lid
    ell(g, x, y - 46 * s - headR * 0.6, headR, headR, c(f.skin));
    (HAIR[f.hairStyle] || HAIR.short)(p, x, y - 46 * s - headR * 0.6, headR, f.hair);
    const ey = y - 46 * s - headR * 0.6;
    ell(g, x - 1.6 * s, ey, 0.55 * s, 0.55 * s, C.ink);
    ell(g, x + 1.6 * s, ey, 0.55 * s, 0.55 * s, C.ink);
    stroke(g, [x - 1.4 * s, ey + 1.8 * s, x, ey + 2.8 * s, x + 1.4 * s, ey + 1.8 * s], '#8a4a40', 0.45);
  }

  /* ---------- small print ---------- */
  function postTop(ctx, cw, h, t) {
    const disc = T.content.adDisclaimers || [];
    if (!disc.length) return;
    const line = disc[Math.floor(t / 6) % disc.length];
    ctx.save();
    ctx.font = '500 17px Inter, "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(45,42,50,0.5)';
    ctx.fillText(line, cw / 2, h - 18, cw - 40);
    ctx.restore();
  }

  T.styles.flat = {
    bg, figure, postTop,
    layout: (v) => ({ tuckX: 100, positions: (v.cast || []).length > 1 ? [190, 238] : [214] }),
  };
})();
