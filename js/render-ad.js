/*
 * TUCK — Act 3 art: a hyper-saturated 1990s TV commercial.
 * Studio sets, Memphis confetti, extruded logos, reflective floors, glossy
 * mascot-proportioned people who grin even while they cry, and broadcast
 * overlays (NEW! sticker, channel bug, small-print disclaimers).
 */
(function () {
  const T = window.Tuck;
  const { rng, K, W, H, GROUND, HAIR } = T.kit;
  const INK = '#1b0f2e';
  const POP = ['#00e5d4', '#ffe600', '#ff3d7f', '#ffffff', INK];

  /* ---------- small canvas helpers (virtual coords × K) ---------- */
  const X = (v) => v * K;
  function rr(g, x, y, w, h, r) {
    x = X(x); y = X(y); w = X(w); h = X(h); r = Math.min(X(r), w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function poly(g, pts) {
    g.beginPath();
    g.moveTo(X(pts[0]), X(pts[1]));
    for (let i = 2; i < pts.length; i += 2) g.lineTo(X(pts[i]), X(pts[i + 1]));
    g.closePath();
  }
  function vgrad(g, y0, y1, stops) {
    const gr = g.createLinearGradient(0, X(y0), 0, X(y1));
    stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
    return gr;
  }
  function hgrad(g, x0, x1, stops) {
    const gr = g.createLinearGradient(X(x0), 0, X(x1), 0);
    stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
    return gr;
  }
  function ink(g, w = 1) {
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.strokeStyle = INK;
    g.lineWidth = X(w);
    g.stroke();
  }
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
    if (f > 0) { r += (255 - r) * f; gg += (255 - gg) * f; b += (255 - b) * f; }
    else { r *= 1 + f; gg *= 1 + f; b *= 1 + f; }
    return `rgb(${r | 0},${gg | 0},${b | 0})`;
  }
  function gloss(g, x, y, w, h) {
    g.save();
    g.clip();
    g.fillStyle = vgrad(g, y, y + h * 0.5, ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']);
    g.fillRect(X(x), X(y), X(w), X(h * 0.5));
    g.restore();
  }
  function star(g, cx, cy, r1, r2, n, rot) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? r2 : r1;
      const a = rot + (i / (n * 2)) * Math.PI * 2;
      g.lineTo(X(cx) + Math.cos(a) * X(r), X(cy) + Math.sin(a) * X(r));
    }
    g.closePath();
  }
  function text3d(g, str, x, y, size, face, side, rot = 0) {
    g.save();
    g.translate(X(x), X(y));
    g.rotate(rot);
    g.font = `${X(size)}px Anton, Impact, "Arial Black", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (let i = 7; i > 0; i--) {
      g.fillStyle = side;
      g.fillText(str, X(i * 0.32), X(i * 0.32));
    }
    g.lineWidth = X(1.6);
    g.lineJoin = 'round';
    g.strokeStyle = INK;
    g.strokeText(str, X(2.4), X(2.4));
    g.fillStyle = face;
    g.fillText(str, 0, 0);
    g.lineWidth = X(0.9);
    g.strokeText(str, 0, 0);
    g.restore();
  }

  /* ---------- set pieces ---------- */
  function backdrop(g, t, cols) {
    const bg = g.createRadialGradient(W * 0.5, H * 0.18, 30, W * 0.5, H * 0.4, W * 0.75);
    cols.forEach((c, i) => bg.addColorStop(i / (cols.length - 1), c));
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    // rotating rays
    g.save();
    g.translate(W * 0.5, H * 0.28);
    g.rotate(t * 0.06);
    g.fillStyle = 'rgba(255,255,255,0.13)';
    for (let i = 0; i < 24; i++) {
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, W, (i / 24) * Math.PI * 2, ((i + 0.5) / 24) * Math.PI * 2);
      g.closePath();
      g.fill();
    }
    g.restore();
  }

  function confetti(g, t, seed, yMax) {
    const r = rng(seed);
    for (let i = 0; i < 30; i++) {
      const x = r() * 320, y0 = 4 + r() * yMax, size = 3 + r() * 5;
      const type = Math.floor(r() * 5), col = POP[Math.floor(r() * 4)];
      const spin = (r() - 0.5) * 1.2, phase = r() * 6;
      const y = y0 + Math.sin(t * 1.3 + phase) * 1.8;
      g.save();
      g.translate(X(x), X(y));
      g.rotate(phase + t * spin);
      g.fillStyle = col;
      g.strokeStyle = INK;
      g.lineWidth = X(0.7);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      if (type === 0) { // triangle
        g.beginPath(); g.moveTo(0, -X(size)); g.lineTo(X(size), X(size * 0.8)); g.lineTo(-X(size), X(size * 0.8)); g.closePath(); g.fill(); g.stroke();
      } else if (type === 1) { // squiggle
        g.beginPath();
        for (let k = 0; k <= 12; k++) g.lineTo(X(-size * 1.4 + (k / 12) * size * 2.8), Math.sin(k * 1.1) * X(size * 0.45));
        g.strokeStyle = col; g.lineWidth = X(1.6); g.stroke();
      } else if (type === 2) { // ring
        g.beginPath(); g.arc(0, 0, X(size * 0.7), 0, Math.PI * 2); g.lineWidth = X(1.5); g.strokeStyle = col; g.stroke();
      } else if (type === 3) { // zigzag
        g.beginPath();
        for (let k = 0; k <= 4; k++) g.lineTo(X(-size + k * size * 0.5), X(k % 2 ? size * 0.4 : -size * 0.4));
        g.strokeStyle = col; g.lineWidth = X(1.4); g.stroke();
      } else { // dot cluster
        for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(X(k * size * 0.6 - size * 0.6), 0, X(size * 0.25), 0, Math.PI * 2); g.fill(); }
      }
      g.restore();
    }
  }

  function shinyFloor(g, top, cols, gridCol) {
    g.fillStyle = vgrad(g, top, 180, cols);
    g.fillRect(0, X(top), W, H - X(top));
    // perspective grid
    g.strokeStyle = gridCol;
    g.lineWidth = X(0.5);
    const vx = 160, vy = top - 50;
    g.beginPath();
    for (let i = -14; i <= 14; i++) {
      const xb = 160 + i * 26;
      const k = (top - vy) / (180 - vy);
      g.moveTo(X(vx + (xb - vx) * k), X(top));
      g.lineTo(X(xb), X(180));
    }
    for (let j = 1; j < 9; j++) {
      const y = top + Math.pow(j / 8, 1.8) * (180 - top);
      g.moveTo(0, X(y)); g.lineTo(W, X(y));
    }
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillRect(0, X(top) - 1, W, X(0.6));
  }

  function voltCan(g, x, y, h, t) {
    const w = h * 0.46;
    // pedestal
    poly(g, [x - w * 1.1, y, x + w * 1.1, y, x + w * 1.25, y + 10, x - w * 1.25, y + 10]);
    g.fillStyle = hgrad(g, x - w * 1.25, x + w * 1.25, ['#ff9ad1', '#ffffff', '#ff6fb8']);
    g.fill(); ink(g, 0.9);
    // can body
    rr(g, x - w / 2, y - h, w, h, 2.4);
    g.fillStyle = hgrad(g, x - w / 2, x + w / 2, ['#5c0010', '#e8202a', '#ff6a5a', '#ff1f3a', '#7a0014']);
    g.fill(); ink(g, 1);
    // label bolt
    poly(g, [x + 1.5, y - h * 0.82, x - 3.5, y - h * 0.45, x - 0.2, y - h * 0.45, x - 2.4, y - h * 0.12, x + 3.8, y - h * 0.55, x + 0.4, y - h * 0.55]);
    g.fillStyle = '#ffe600'; g.fill(); ink(g, 0.6);
    // lid
    g.beginPath();
    g.ellipse(X(x), X(y - h), X(w / 2), X(1.6), 0, 0, Math.PI * 2);
    g.fillStyle = hgrad(g, x - w / 2, x + w / 2, ['#8a8a99', '#ffffff', '#9a9aa8']);
    g.fill(); ink(g, 0.7);
    // vertical text
    g.save();
    g.translate(X(x + w * 0.28), X(y - h * 0.5));
    g.rotate(-Math.PI / 2);
    g.font = `${X(5.2)}px Anton, Impact, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#fff';
    g.fillText('VOLT', 0, 0);
    g.restore();
    // highlight streak
    g.fillStyle = 'rgba(255,255,255,0.55)';
    rr(g, x - w * 0.28, y - h * 0.92, w * 0.1, h * 0.84, 0.6);
    g.fill();
    // lens flare
    const fx = X(x - w * 0.3), fy = X(y - h * 0.9);
    const tw = 0.6 + 0.4 * Math.sin(t * 3);
    const fl = g.createRadialGradient(fx, fy, 0, fx, fy, X(12));
    fl.addColorStop(0, `rgba(255,255,255,${0.9 * tw})`);
    fl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = fl;
    g.fillRect(fx - X(12), fy - X(12), X(24), X(24));
    star(g, x - w * 0.3, y - h * 0.9, 6 * tw + 2, 0.8, 4, t * 0.5);
    g.fillStyle = '#fff';
    g.fill();
  }

  function fountain(g, x, y) {
    rr(g, x - 7, y - 26, 14, 26, 2);
    g.fillStyle = hgrad(g, x - 7, x + 7, ['#9aa3b5', '#f4f7ff', '#8a93a5']);
    g.fill(); ink(g, 1);
    rr(g, x - 10, y - 30, 20, 6, 3);
    g.fillStyle = hgrad(g, x - 10, x + 10, ['#a8b0c0', '#ffffff', '#98a0b0']);
    g.fill(); ink(g, 0.9);
    // hazard tape
    g.save();
    g.translate(X(x), X(y - 16));
    g.rotate(-0.25);
    g.fillStyle = '#ffe600';
    g.fillRect(-X(16), -X(2.6), X(32), X(5.2));
    g.fillStyle = INK;
    for (let i = -16; i < 16; i += 4) { g.beginPath(); g.moveTo(X(i), -X(2.6)); g.lineTo(X(i + 2), -X(2.6)); g.lineTo(X(i), X(2.6)); g.lineTo(X(i - 2), X(2.6)); g.closePath(); g.fill(); }
    g.font = `${X(3.4)}px Anton, Impact, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#e8202a';
    g.restore();
    text3d(g, 'OUT OF ORDER', x, y - 38, 4.5, '#ff3d3d', '#5a0010', -0.08);
  }

  function studio(p, v) {
    const g = p.g, t = p.t;
    backdrop(g, t, ['#fff7b0', '#ff9ad6', '#c63cff', '#4a1cc9']);
    confetti(g, t, 42 + (v.bg === 'bikeshed' ? 7 : 0), 92);
    text3d(g, 'TUCK', 158, 24, 24, '#ffe600', '#7a0a6a', -0.04);
    g.save();
    g.translate(X(158), X(43));
    g.rotate(-0.12);
    g.fillStyle = '#00e5d4';
    rr(g, -34, -5, 68, 10, 5);
    g.fill(); ink(g, 0.9);
    g.font = `${X(5.5)}px Anton, Impact, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = INK;
    g.fillText(v.bg === 'bikeshed' ? 'NOW AT THE BIKESHED!™' : 'IT’S WHAT YOU NEED!™', 0, X(0.4));
    g.restore();
    shinyFloor(g, GROUND - 2, ['#ffe0f4', '#ff9bd6', '#d24cb0'], 'rgba(255,255,255,0.35)');
    p.floorFade = ['255,224,244', '210,76,176'];
    const cx = (v.cast || []).length > 1 ? 143 : 153;
    if (v.fountain) fountain(g, cx, GROUND + 2);
    else voltCan(g, cx, GROUND + 4, 34, t);
  }

  function boardroom(p, v) {
    const g = p.g, t = p.t;
    g.fillStyle = vgrad(g, 0, GROUND, ['#2a0f6e', '#5a2ad0']);
    g.fillRect(0, 0, W, X(GROUND));
    // huge window with a sunset over the school
    rr(g, 18, 12, 284, 86, 3);
    g.fillStyle = vgrad(g, 12, 98, ['#ff5fb8', '#ff9a6b', '#ffe36b']);
    g.fill();
    g.save();
    g.clip();
    const sun = g.createRadialGradient(X(160), X(80), 0, X(160), X(80), X(60));
    sun.addColorStop(0, 'rgba(255,255,220,1)');
    sun.addColorStop(0.25, 'rgba(255,240,150,0.9)');
    sun.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = sun;
    g.fillRect(X(18), X(12), X(284), X(86));
    g.fillStyle = 'rgba(70,10,90,0.85)';
    const sky = [18, 98, 18, 78, 40, 78, 40, 66, 60, 66, 60, 74, 92, 74, 92, 58, 104, 50, 116, 58, 116, 74, 150, 74, 150, 70, 196, 70, 196, 62, 224, 62, 224, 76, 260, 76, 260, 68, 302, 68, 302, 98];
    poly(g, sky); g.fill();
    g.font = `${X(6)}px Anton, Impact, sans-serif`;
    g.textAlign = 'center';
    g.fillStyle = '#ffe600';
    g.fillText('TUCK', X(104), X(66));
    g.restore();
    g.strokeStyle = '#1b0f2e';
    g.lineWidth = X(2);
    for (const mx of [89, 160, 231]) { g.beginPath(); g.moveTo(X(mx), X(12)); g.lineTo(X(mx), X(98)); g.stroke(); }
    rr(g, 18, 12, 284, 86, 3); ink(g, 2);
    // neon sign
    g.save();
    g.shadowColor = '#ff3dbb';
    g.shadowBlur = X(5);
    g.font = `${X(7)}px Anton, Impact, sans-serif`;
    g.textAlign = 'center';
    g.fillStyle = '#ffd6f2';
    g.fillText('TUCK ENTERPRISES™', X(160), X(9.5));
    g.restore();
    shinyFloor(g, GROUND - 2, ['#5a2ad0', '#2a0f6e', '#14063a'], 'rgba(255,120,220,0.25)');
    p.floorFade = ['90,42,208', '20,6,58'];
    // glass desk with a pen and a stack of cash
    poly(g, [124, 92, 182, 92, 188, 98, 118, 98]);
    g.fillStyle = 'rgba(200,240,255,0.55)';
    g.fill(); ink(g, 0.8);
    g.fillStyle = 'rgba(200,240,255,0.25)';
    g.fillRect(X(121), X(98), X(2), X(16));
    g.fillRect(X(183), X(98), X(2), X(16));
    rr(g, 130, 87, 16, 5, 1);
    g.fillStyle = '#3ad16a'; g.fill(); ink(g, 0.6);
    g.save();
    g.translate(X(166), X(90));
    g.rotate(-0.3);
    rr(g, -7, -0.8, 14, 1.6, 0.8);
    g.fillStyle = hgrad(g, -7, 7, ['#8a6a00', '#ffe36b', '#b38a00']);
    g.fill();
    g.restore();
  }

  function bg(p, v) {
    p.noBurst = true;
    if (v.bg === 'office') boardroom(p, v);
    else studio(p, v);
  }

  /* ---------- mascot people ---------- */
  function figure(p, f) {
    const g = p.g;
    const s = f.s || 1;
    const x = f.x, y = f.y != null ? f.y : GROUND;
    const bob = f.frozen ? 0 : Math.sin(p.t * 3 + x * 0.7) * 0.6;
    const legH = 12 * s, bodyH = 14 * s, headR = 8.6 * s;
    const bw = 12.5 * s * (f.wide || 1);
    const hip = y - legH, sh = hip - bodyH + bob, hy = sh - headR + 1.5 * s;
    const skin = f.skin;
    const top = f.coat || f.blazer || f.shirt;
    const shoes = f.shoes || [INK, INK];

    // contact shadow
    g.beginPath();
    g.ellipse(X(x), X(y + 0.5), X(10 * s * (f.wide || 1)), X(1.8 * s), 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(60,0,60,0.3)';
    g.fill();

    // legs / skirt
    if (f.skirt || f.shorts) {
      for (const lx of [-4.2, 0.8]) { rr(g, x + lx * s, hip + 3 * s, 3.4 * s, legH - 4 * s, 1.2 * s); g.fillStyle = hgrad(g, x + lx * s, x + (lx + 3.4) * s, [shade(skin, -0.15), skin, shade(skin, -0.2)]); g.fill(); ink(g, 0.7); }
      if (f.skirt) poly(g, [x - bw / 2, hip - 1 * s, x + bw / 2, hip - 1 * s, x + bw / 2 + 2.4 * s, hip + 6 * s, x - bw / 2 - 2.4 * s, hip + 6 * s]);
      else rr(g, x - 5.6 * s, hip - 1 * s, 11.2 * s, 6 * s, 1.5 * s);
      g.fillStyle = vgrad(g, hip - 1 * s, hip + 6 * s, [shade(f.trousers, 0.2), f.trousers, shade(f.trousers, -0.3)]);
      g.fill(); ink(g, 0.8);
    } else {
      for (const lx of [-5.2, 0.4]) { rr(g, x + lx * s, hip - 1 * s, 4.8 * s, legH, 1.4 * s); g.fillStyle = hgrad(g, x + lx * s, x + (lx + 4.8) * s, [shade(f.trousers, -0.3), shade(f.trousers, 0.25), shade(f.trousers, -0.35)]); g.fill(); ink(g, 0.8); }
    }
    // shoes
    [[-6.6, shoes[0]], [0.2, shoes[1]]].forEach(([lx, c]) => {
      rr(g, x + lx * s, y - 2.8 * s, 6.4 * s, 3 * s, 1.4 * s);
      g.fillStyle = vgrad(g, y - 2.8 * s, y, [shade(c, 0.45), c]);
      g.fill(); ink(g, 0.8);
    });

    // torso
    poly(g, [x - bw / 2, sh + 1 * s, x + bw / 2, sh + 1 * s, x + bw / 2 + 1.4 * s, hip + 1.4 * s, x - bw / 2 - 1.4 * s, hip + 1.4 * s]);
    g.fillStyle = hgrad(g, x - bw / 2, x + bw / 2, [shade(top, -0.35), shade(top, 0.25), shade(top, -0.25)]);
    g.fill();
    gloss(g, x - bw / 2, sh, bw, bodyH);
    poly(g, [x - bw / 2, sh + 1 * s, x + bw / 2, sh + 1 * s, x + bw / 2 + 1.4 * s, hip + 1.4 * s, x - bw / 2 - 1.4 * s, hip + 1.4 * s]);
    ink(g, 1);
    if (f.blazer || f.coat) {
      poly(g, [x - 3 * s, sh + 1 * s, x + 3 * s, sh + 1 * s, x, sh + 8.5 * s]);
      g.fillStyle = f.shirt; g.fill(); ink(g, 0.6);
    }
    if (f.apron) { rr(g, x - bw / 2 + 2 * s, sh + 4 * s, bw - 4 * s, bodyH - 2 * s, 1 * s); g.fillStyle = '#fff'; g.fill(); ink(g, 0.6); }
    if (f.tie) { poly(g, [x - 1.1 * s, sh + 1.5 * s, x + 1.1 * s, sh + 1.5 * s, x + 1.7 * s, sh + 9.5 * s, x, sh + 11 * s, x - 1.7 * s, sh + 9.5 * s]); g.fillStyle = vgrad(g, sh, sh + 11 * s, [shade(f.tie, 0.4), f.tie]); g.fill(); ink(g, 0.5); }
    if (f.sash) { g.beginPath(); g.moveTo(X(x - bw / 2), X(sh + 1 * s)); g.lineTo(X(x + bw / 2), X(hip)); g.strokeStyle = '#ffd400'; g.lineWidth = X(2.6 * s); g.stroke(); }
    if (f.badge) { star(g, x - 3.6 * s, sh + 5 * s, 2.2 * s, 1 * s, 5, -Math.PI / 2); g.fillStyle = '#ffe600'; g.fill(); ink(g, 0.5); }
    if (f.lanyard) { g.beginPath(); g.moveTo(X(x - 3 * s), X(sh + 1 * s)); g.lineTo(X(x), X(sh + 9 * s)); g.lineTo(X(x + 3 * s), X(sh + 1 * s)); g.strokeStyle = '#0077ff'; g.lineWidth = X(0.8); g.stroke(); rr(g, x - 1.8 * s, sh + 9 * s, 3.6 * s, 4 * s, 0.5 * s); g.fillStyle = '#fff'; g.fill(); ink(g, 0.5); }

    // arms (Tuck does the presenter pose)
    const swing = f.frozen ? 0 : Math.sin(p.t * 2 + x) * 0.8 * s;
    const arm = (x1, y1, x2, y2) => {
      g.beginPath(); g.moveTo(X(x1), X(y1)); g.lineTo(X(x2), X(y2));
      g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = X(4.4 * s); g.stroke();
      g.strokeStyle = shade(top, 0.05); g.lineWidth = X(3 * s); g.stroke();
      g.beginPath(); g.arc(X(x2), X(y2), X(1.9 * s), 0, Math.PI * 2);
      g.fillStyle = skin; g.fill(); ink(g, 0.6);
    };
    arm(x - bw / 2, sh + 2.5 * s, x - bw / 2 - 2.6 * s, hip + swing);
    if (f.isTuck) {
      const wave = f.frozen ? 0 : Math.sin(p.t * 4) * 1.2 * s;
      arm(x + bw / 2, sh + 2.5 * s, x + bw / 2 + 8 * s, sh - 3 * s + wave);
      // thumbs up
      rr(g, x + bw / 2 + 7.2 * s, sh - 7 * s + wave, 1.6 * s, 3.4 * s, 0.8 * s);
      g.fillStyle = skin; g.fill(); ink(g, 0.5);
    } else {
      arm(x + bw / 2, sh + 2.5 * s, x + bw / 2 + 2.6 * s, hip - swing);
    }
    if (f.organiser) { rr(g, x - bw / 2 - 6 * s, hip - 6 * s, 5 * s, 7 * s, 1 * s); g.fillStyle = '#222'; g.fill(); ink(g, 0.6); rr(g, x - bw / 2 - 5.2 * s, hip - 5 * s, 3.4 * s, 3 * s, 0.4 * s); g.fillStyle = '#5dff8a'; g.fill(); }
    if (f.sandwich) { poly(g, [x - bw / 2 - 7 * s, hip - 1 * s, x - bw / 2 + 0.5 * s, hip - 1 * s, x - bw / 2 - 3 * s, hip - 7 * s]); g.fillStyle = '#f3e1a1'; g.fill(); ink(g, 0.6); }

    // head
    g.beginPath(); g.arc(X(x - headR * 0.95), X(hy + 1 * s), X(1.8 * s), 0, Math.PI * 2); g.fillStyle = skin; g.fill(); ink(g, 0.7);
    g.beginPath(); g.arc(X(x + headR * 0.95), X(hy + 1 * s), X(1.8 * s), 0, Math.PI * 2); g.fill(); ink(g, 0.7);
    g.beginPath();
    g.arc(X(x), X(hy), X(headR), 0, Math.PI * 2);
    const hg = g.createRadialGradient(X(x - headR * 0.35), X(hy - headR * 0.4), X(1), X(x), X(hy), X(headR * 1.05));
    hg.addColorStop(0, shade(skin, 0.4));
    hg.addColorStop(0.6, skin);
    hg.addColorStop(1, shade(skin, -0.25));
    g.fillStyle = hg;
    g.fill();
    ink(g, 1.1);
    // cheeks
    g.fillStyle = 'rgba(255,90,140,0.35)';
    g.beginPath(); g.ellipse(X(x - headR * 0.55), X(hy + headR * 0.3), X(1.8 * s), X(1 * s), 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(X(x + headR * 0.55), X(hy + headR * 0.3), X(1.8 * s), X(1 * s), 0, 0, Math.PI * 2); g.fill();
    // hair (Painter polys give the glossy outlined look)
    (HAIR[f.hairStyle] || HAIR.short)(p, x, hy, headR, f.hair, f.hairColor2);

    // eyes
    const ex = 3 * s, ey = hy - 0.6 * s;
    if (f.shades) {
      rr(g, x - 6.5 * s, ey - 1.8 * s, 13 * s, 3.6 * s, 1.5 * s);
      g.fillStyle = vgrad(g, ey - 1.8 * s, ey + 1.8 * s, ['#4a3a8a', '#000']); g.fill(); ink(g, 0.6);
    } else {
      for (const dx of [-ex, ex]) {
        g.beginPath(); g.ellipse(X(x + dx), X(ey), X(1.9 * s), X(2.4 * s), 0, 0, Math.PI * 2);
        g.fillStyle = '#fff'; g.fill(); ink(g, 0.55);
        if (f.pound) {
          g.font = `bold ${X(3.6 * s)}px Anton, Impact, sans-serif`;
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = '#00a650';
          g.fillText('£', X(x + dx), X(ey + 0.2 * s));
        } else {
          g.beginPath(); g.arc(X(x + dx * 0.85), X(ey + 0.3 * s), X(1.1 * s), 0, Math.PI * 2); g.fillStyle = INK; g.fill();
          g.beginPath(); g.arc(X(x + dx * 0.85 - 0.4 * s), X(ey - 0.3 * s), X(0.4 * s), 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
        }
        if (f.mood === 'tired') { g.beginPath(); g.ellipse(X(x + dx), X(ey - 1.2 * s), X(2.1 * s), X(1.4 * s), 0, Math.PI, Math.PI * 2); g.fillStyle = skin; g.fill(); }
      }
      if (f.mood === 'angry' || f.mood === 'sad' || f.mood === 'crying') {
        const up = f.mood === 'angry' ? 1 : -1;
        g.beginPath();
        g.moveTo(X(x - ex - 2 * s), X(ey - 3 * s - up * 0.8 * s)); g.lineTo(X(x - ex + 1.6 * s), X(ey - 3 * s + up * 0.8 * s));
        g.moveTo(X(x + ex + 2 * s), X(ey - 3 * s - up * 0.8 * s)); g.lineTo(X(x + ex - 1.6 * s), X(ey - 3 * s + up * 0.8 * s));
        g.strokeStyle = INK; g.lineWidth = X(0.9 * s); g.stroke();
      }
    }
    if (f.glasses) {
      for (const dx of [-ex, ex]) { g.beginPath(); g.arc(X(x + dx), X(ey), X(2.8 * s), 0, Math.PI * 2); g.strokeStyle = INK; g.lineWidth = X(0.7); g.stroke(); }
    }
    // mouth: in the advert, everybody grins. Even the crying ones.
    const my = hy + 3.4 * s;
    if (f.mood === 'angry' || f.mood === 'neutral') {
      g.beginPath(); g.moveTo(X(x - 2.4 * s), X(my)); g.quadraticCurveTo(X(x), X(my + 1.2 * s), X(x + 2.4 * s), X(my));
      g.strokeStyle = INK; g.lineWidth = X(0.8); g.stroke();
    } else {
      const wide = f.mood === 'sad' || f.mood === 'tired' ? 2.6 : 3.4;
      g.beginPath();
      g.moveTo(X(x - wide * s), X(my - 0.6 * s));
      g.quadraticCurveTo(X(x), X(my - 0.2 * s), X(x + wide * s), X(my - 0.6 * s));
      g.quadraticCurveTo(X(x), X(my + 4 * s), X(x - wide * s), X(my - 0.6 * s));
      g.fillStyle = '#7a1030'; g.fill();
      g.save(); g.clip();
      g.fillStyle = '#fff';
      g.fillRect(X(x - wide * s), X(my - 0.8 * s), X(wide * 2 * s), X(1.3 * s));
      g.restore();
      g.beginPath();
      g.moveTo(X(x - wide * s), X(my - 0.6 * s));
      g.quadraticCurveTo(X(x), X(my - 0.2 * s), X(x + wide * s), X(my - 0.6 * s));
      g.quadraticCurveTo(X(x), X(my + 4 * s), X(x - wide * s), X(my - 0.6 * s));
      ink(g, 0.7);
    }
    if (f.mood === 'crying') {
      const drip = f.frozen ? 0.5 : (p.t * 1.4 + x) % 1;
      for (const [dx, ph] of [[-ex, 0], [ex, 0.5]]) {
        const d = (drip + ph) % 1;
        g.beginPath();
        g.ellipse(X(x + dx + (dx < 0 ? -1 : 1) * 0.8 * s), X(ey + 3 * s + d * 6 * s), X(1 * s), X(1.5 * s), 0, 0, Math.PI * 2);
        g.fillStyle = '#5ad1ff'; g.fill(); ink(g, 0.4);
      }
    }
    // specular rim on the head
    g.beginPath();
    g.arc(X(x), X(hy), X(headR * 0.82), Math.PI * 1.1, Math.PI * 1.45);
    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.lineWidth = X(1 * s);
    g.lineCap = 'round';
    g.stroke();
  }

  function beforeCast(p, v, drawCast) {
    // reflections in the shiny floor
    const g = p.g;
    g.save();
    g.globalAlpha = 0.16;
    g.translate(0, X(GROUND) * 2);
    g.scale(1, -1);
    drawCast();
    g.restore();
    g.globalAlpha = 1;
    // fade the reflection out as it goes down into the floor
    if (p.floorFade) {
      const [a, b] = p.floorFade;
      const gr = g.createLinearGradient(0, X(GROUND), 0, X(GROUND + 34));
      gr.addColorStop(0, `rgba(${a},0)`);
      gr.addColorStop(1, `rgba(${b},1)`);
      g.fillStyle = gr;
      g.fillRect(0, X(GROUND), W, X(34));
      g.fillStyle = `rgb(${b})`;
      g.fillRect(0, X(GROUND + 34), W, H);
      // redraw a few grid lines so the floor doesn't go flat
      g.strokeStyle = 'rgba(255,255,255,0.18)';
      g.lineWidth = X(0.5);
      g.beginPath();
      for (let i = -14; i <= 14; i++) { const xb = 160 + i * 26; g.moveTo(X(160 + (xb - 160) * 0.5), X(GROUND + 20)); g.lineTo(X(xb), X(180)); }
      g.stroke();
    }
  }

  /* ---------- broadcast overlays (per frame, main canvas) ---------- */
  let scan = null;
  function scanlines() {
    if (scan) return scan;
    scan = document.createElement('canvas');
    scan.width = 4; scan.height = 4;
    const g = scan.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.09)';
    g.fillRect(0, 0, 4, 1);
    return scan;
  }

  function post(ctx, cw, h, t, view) {
    if (view.frozen) return;
    // sheen sweep
    const ph = (t % 4.5) / 4.5;
    const sx = -400 + ph * (cw + 800);
    const gr = ctx.createLinearGradient(sx - 140, 0, sx + 140, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, cw, h);
  }

  function postTop(ctx, cw, h, t, view) {
    ctx.save();
    ctx.fillStyle = ctx.createPattern(scanlines(), 'repeat');
    ctx.fillRect(0, 0, cw, h);
    // occasional VHS tracking wobble
    if (!view.frozen && (t % 7) < 0.25) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(0, ((t * 900) % h), cw, 14);
    }
    // NEW! starburst
    if (!view.frozen) {
      const lines = ['NEW!', '400%', 'FREE*'];
      const word = lines[Math.floor(t / 2.5) % lines.length];
      ctx.translate(cw - 92, 92);
      ctx.rotate(0.25 + Math.sin(t * 2) * 0.06);
      const pulse = 1 + Math.sin(t * 6) * 0.04;
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      for (let i = 0; i < 28; i++) {
        const r = i % 2 ? 46 : 62;
        const a = (i / 28) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = '#ffe600';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.font = '40px Anton, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e8202a';
      ctx.fillText(word, 0, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    // channel bug
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(24, 22, 168, 46, 23) : ctx.rect(24, 22, 168, 46);
    ctx.fill();
    ctx.font = '30px Anton, Impact, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText('TUCK TV', 64, 46);
    ctx.fillStyle = (Math.floor(t * 2) % 2) ? '#ff2e2e' : '#ff8a8a';
    ctx.beginPath(); ctx.arc(44, 45, 9, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // small print
    const disc = (T.content.adDisclaimers || []);
    if (disc.length) {
      const line = disc[Math.floor(t / 5) % disc.length];
      ctx.fillStyle = 'rgba(20,6,40,0.55)';
      ctx.fillRect(0, h - 40, cw, 40);
      ctx.font = '19px Inter, "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.textAlign = 'center';
      ctx.fillText(line, cw / 2, h - 19, cw - 40);
    }
    ctx.restore();
  }

  T.styles.ad = {
    bg, figure, beforeCast, post, postTop,
    layout: (v) => ({ tuckX: 100, positions: (v.cast || []).length > 1 ? [190, 236] : [214] }),
  };
})();
