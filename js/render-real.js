/*
 * TUCK — Act 4 art: stark, cinematic realism.
 * One-point-perspective rooms lit by cold window light and failing
 * fluorescent tubes, rain running down the glass, people drawn with real
 * proportions as backlit silhouettes, letterboxed with film grain.
 */
(function () {
  const T = window.Tuck;
  const { rng, K, W, H, GROUND } = T.kit;
  const X = (v) => v * K;

  /* ---------- colour ---------- */
  function rgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  // desaturate toward a cold grey and darken; amt 0..1 of "realism"
  function cold(hex, light = 0) {
    const c = rgb(hex);
    const l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
    let r = l + (c[0] - l) * 0.28, g = l + (c[1] - l) * 0.28, b = l + (c[2] - l) * 0.28;
    r = r * 0.85 + 66 * 0.15; g = g * 0.85 + 78 * 0.15; b = b * 0.85 + 88 * 0.15;
    if (light > 0) { r += (235 - r) * light; g += (240 - g) * light; b += (245 - b) * light; }
    else { r *= 1 + light; g *= 1 + light; b *= 1 + light; }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
  function poly(g, pts) {
    g.beginPath();
    g.moveTo(X(pts[0]), X(pts[1]));
    for (let i = 2; i < pts.length; i += 2) g.lineTo(X(pts[i]), X(pts[i + 1]));
    g.closePath();
  }
  function lin(g, x0, y0, x1, y1, stops) {
    const gr = g.createLinearGradient(X(x0), X(y0), X(x1), X(y1));
    stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
    return gr;
  }
  function glow(g, x, y, r, col, a) {
    const gr = g.createRadialGradient(X(x), X(y), 0, X(x), X(y), X(r));
    gr.addColorStop(0, `rgba(${col},${a})`);
    gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr;
    g.fillRect(X(x - r), X(y - r), X(r * 2), X(r * 2));
  }
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- reusable pieces ---------- */
  // Rain on a pane of glass: streaks that run, beads that sit.
  function rainGlass(g, x0, y0, x1, y1, t, frozen, seed) {
    g.save();
    g.beginPath();
    g.rect(X(x0), X(y0), X(x1 - x0), X(y1 - y0));
    g.clip();
    const r = rng(seed);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 70; i++) {
      const bx = lerp(x0, x1, r()), by = lerp(y0, y1, r());
      g.fillRect(X(bx), X(by), X(0.5 + r() * 0.5), X(0.6 + r() * 0.8));
    }
    g.strokeStyle = 'rgba(255,255,255,0.28)';
    g.lineWidth = X(0.35);
    g.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const sx = lerp(x0, x1, r()), speed = 4 + r() * 10, len = 4 + r() * 10;
      const yy = frozen ? lerp(y0, y1, r()) : y0 + ((t * speed + r() * 100) % (y1 - y0 + len)) - len;
      g.beginPath();
      g.moveTo(X(sx), X(yy));
      g.bezierCurveTo(X(sx + 0.6), X(yy + len * 0.3), X(sx - 0.5), X(yy + len * 0.6), X(sx + 0.2), X(yy + len));
      g.stroke();
    }
    g.restore();
  }

  function tube(g, pts, t, frozen, seed) {
    // a fluorescent tube that occasionally gives up
    const flick = frozen ? 1 : (Math.sin(t * 31 + seed) + Math.sin(t * 7.3 + seed * 2) > 1.75 ? 0.25 : 1);
    poly(g, pts);
    g.fillStyle = `rgba(225,235,238,${0.85 * flick})`;
    g.fill();
    const cx = (pts[0] + pts[2] + pts[4] + pts[6]) / 4, cy = (pts[1] + pts[3] + pts[5] + pts[7]) / 4;
    glow(g, cx, cy, 34, '200,215,220', 0.18 * flick);
  }

  function clock(g, x, y, r, minute) {
    g.beginPath(); g.arc(X(x), X(y), X(r), 0, Math.PI * 2);
    g.fillStyle = cold('#e8e8e0', -0.1); g.fill();
    g.strokeStyle = cold('#222'); g.lineWidth = X(0.8); g.stroke();
    const hh = (minute / 60) % 12, mm = minute % 60;
    const ah = (hh / 12) * Math.PI * 2 - Math.PI / 2, am = (mm / 60) * Math.PI * 2 - Math.PI / 2;
    g.beginPath();
    g.moveTo(X(x), X(y)); g.lineTo(X(x + Math.cos(ah) * r * 0.5), X(y + Math.sin(ah) * r * 0.5));
    g.moveTo(X(x), X(y)); g.lineTo(X(x + Math.cos(am) * r * 0.8), X(y + Math.sin(am) * r * 0.8));
    g.strokeStyle = '#1a1d20'; g.lineWidth = X(0.6); g.stroke();
  }

  // Generic box room in one-point perspective. Returns the back-wall rect.
  function room(g, b, cols) {
    const [bx0, by0, bx1, by1] = b;
    poly(g, [0, 0, 320, 0, bx1, by0, bx0, by0]); // ceiling
    g.fillStyle = lin(g, 0, 0, 0, by0, [cols.ceil[0], cols.ceil[1]]); g.fill();
    poly(g, [0, 0, bx0, by0, bx0, by1, 0, 180]); // left wall
    g.fillStyle = lin(g, 0, 0, bx0, 0, [cols.side[0], cols.side[1]]); g.fill();
    poly(g, [320, 0, bx1, by0, bx1, by1, 320, 180]); // right wall
    g.fillStyle = lin(g, 320, 0, bx1, 0, [cols.side[0], cols.side[1]]); g.fill();
    poly(g, [bx0, by1, bx1, by1, 320, 180, 0, 180]); // floor
    g.fillStyle = lin(g, 0, by1, 0, 180, [cols.floor[0], cols.floor[1]]); g.fill();
    g.fillStyle = lin(g, 0, by0, 0, by1, [cols.back[0], cols.back[1]]);
    g.fillRect(X(bx0), X(by0), X(bx1 - bx0), X(by1 - by0));
    // corner shading (ambient occlusion)
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = X(1.2);
    g.beginPath();
    g.moveTo(X(bx0), X(by0)); g.lineTo(X(bx0), X(by1)); g.lineTo(X(bx1), X(by1)); g.lineTo(X(bx1), X(by0));
    g.stroke();
  }

  // a quad on the left or right wall between depths u0..u1 (0 = near, 1 = back wall)
  function wallQuad(b, side, u0, u1, v0, v1) {
    const [bx0, by0, bx1, by1] = b;
    const nearX = side < 0 ? 0 : 320, farX = side < 0 ? bx0 : bx1;
    const pt = (u, v) => {
      const x = lerp(nearX, farX, u);
      const top = lerp(0, by0, u), bot = lerp(180, by1, u);
      return [x, lerp(top, bot, v)];
    };
    return [...pt(u0, v0), ...pt(u1, v0), ...pt(u1, v1), ...pt(u0, v1)];
  }
  // perspective depth spacing: equal steps in real space
  const depth = (i, n) => 1 - 1 / (1 + (i / n) * 3);

  /* ---------- scenes ---------- */
  function office(p, v) {
    const g = p.g, t = p.t, fr = v.frozen;
    const b = [70, 20, 250, 96];
    room(g, b, {
      ceil: [cold('#3a4247'), cold('#555e63')],
      side: [cold('#2a3236'), cold('#4a555b')],
      back: [cold('#69767d'), cold('#57636a')],
      floor: [cold('#3d4245'), cold('#22272a')],
    });
    // window on the back wall
    const wx0 = 114, wx1 = 206, wy0 = 28, wy1 = 82;
    g.fillStyle = lin(g, 0, wy0, 0, wy1, [cold('#d8e2e6', 0.1), cold('#9eadb4')]);
    g.fillRect(X(wx0), X(wy0), X(wx1 - wx0), X(wy1 - wy0));
    g.fillStyle = 'rgba(70,82,90,0.35)'; // trees/buildings outside, out of focus
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(X(wx0 + 8 + i * 16), X(wy1 - 6), X(10), X(8 + (i % 3) * 3), 0, 0, Math.PI * 2); g.fill(); }
    rainGlass(g, wx0, wy0, wx1, wy1, t, fr, 11);
    // blinds, half down
    g.fillStyle = 'rgba(40,46,50,0.55)';
    for (let y = wy0; y < wy0 + 20; y += 2.2) g.fillRect(X(wx0), X(y), X(wx1 - wx0), X(1.1));
    g.strokeStyle = cold('#1c2124'); g.lineWidth = X(1.6);
    g.strokeRect(X(wx0), X(wy0), X(wx1 - wx0), X(wy1 - wy0));
    g.beginPath(); g.moveTo(X(160), X(wy0)); g.lineTo(X(160), X(wy1)); g.stroke();
    // light spilling onto the floor and through the air
    poly(g, [wx0, 96, wx1, 96, 270, 180, 50, 180]);
    g.fillStyle = lin(g, 0, 96, 0, 180, ['rgba(210,225,230,0.14)', 'rgba(210,225,230,0)']); g.fill();
    glow(g, 160, 56, 90, '200,214,220', 0.12);
    // certificates, clock
    g.fillStyle = cold('#2e3337'); g.fillRect(X(80), X(34), X(18), X(24));
    g.fillStyle = cold('#c9c6b8', -0.2); g.fillRect(X(82), X(36), X(14), X(20));
    g.fillStyle = cold('#2e3337'); g.fillRect(X(222), X(30), X(16), X(12));
    clock(g, 230, 56, 6, v.minute);
    // filing cabinet on the left wall
    poly(g, wallQuad(b, -1, 0.55, 0.85, 0.42, 1));
    g.fillStyle = cold('#5b6266', -0.2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = X(0.5); g.stroke();
    // head's desk against the back wall
    poly(g, [196, 84, 248, 84, 252, 92, 192, 92]);
    g.fillStyle = cold('#4a3d32', -0.2); g.fill();
    g.fillStyle = cold('#2c2620'); g.fillRect(X(194), X(92), X(56), X(8));
    g.fillStyle = cold('#d0d0c8', -0.3); g.fillRect(X(210), X(81), X(14), X(3)); // papers
    // ceiling tubes
    tube(g, [128, 6, 192, 6, 186, 10, 134, 10], t, fr, 1);
    tube(g, [138, 15, 182, 15, 179, 17, 141, 17], t, fr, 2);
  }

  function corridor(p, v) {
    const g = p.g, t = p.t, fr = v.frozen;
    const b = [140, 46, 180, 84];
    room(g, b, {
      ceil: [cold('#33393c'), cold('#4c5458')],
      side: [cold('#3a4246'), cold('#5c666b')],
      back: [cold('#5d676c'), cold('#4c555a')],
      floor: [cold('#4a5354'), cold('#262b2c')],
    });
    // door at the end, with daylight
    g.fillStyle = cold('#2e3437'); g.fillRect(X(150), X(56), X(20), X(28));
    g.fillStyle = cold('#dfe7ea', 0.2); g.fillRect(X(154), X(59), X(12), X(11));
    glow(g, 160, 64, 30, '220,230,235', 0.25);
    // lockers down both walls
    for (const side of [-1, 1]) {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const u0 = depth(i, n), u1 = depth(i + 1, n);
        const q = wallQuad(b, side, u0, u1, 0.28, 0.98);
        poly(g, q);
        g.fillStyle = cold(i % 2 ? '#3f6a8a' : '#365d7a', side < 0 ? -0.15 : -0.05);
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = X(0.4); g.stroke();
        // vents
        const vq = wallQuad(b, side, lerp(u0, u1, 0.25), lerp(u0, u1, 0.75), 0.33, 0.36);
        poly(g, vq); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
      }
      // poster high on the wall
      const pq = wallQuad(b, side, 0.12, 0.28, 0.06, 0.22);
      poly(g, pq); g.fillStyle = cold('#e0ddd2', -0.15); g.fill();
    }
    // tubes receding
    for (let i = 0; i < 6; i++) {
      const u = depth(i + 0.3, 6), u2 = depth(i + 0.6, 6);
      const y0 = lerp(0, b[1], u), y1 = lerp(0, b[1], u2);
      const hw0 = lerp(26, 6, u), hw1 = lerp(26, 6, u2);
      tube(g, [160 - hw0, y0 + 3, 160 + hw0, y0 + 3, 160 + hw1, y1 + 3, 160 - hw1, y1 + 3], t, fr, i + 3);
      // reflection on the polished floor
      const fy = lerp(180, b[3], u);
      g.fillStyle = 'rgba(200,215,220,0.06)';
      g.fillRect(X(160 - hw0 * 0.8), X(fy - 8), X(hw0 * 1.6), X(6));
    }
  }

  function assembly(p, v) {
    const g = p.g, t = p.t, fr = v.frozen;
    const b = [30, 8, 290, 94];
    room(g, b, {
      ceil: [cold('#2e3437'), cold('#424a4e')],
      side: [cold('#2a3033'), cold('#454e52')],
      back: [cold('#5a6267'), cold('#454c50')],
      floor: [cold('#5a4c40', -0.15), cold('#2a241f')],
    });
    // tall windows
    for (let i = 0; i < 5; i++) {
      const x0 = 44 + i * 50;
      g.fillStyle = lin(g, 0, 14, 0, 62, [cold('#cfdade', 0.05), cold('#8d9ca3')]);
      g.fillRect(X(x0), X(14), X(26), X(48));
      rainGlass(g, x0, 14, x0 + 26, 62, t, fr, 20 + i);
      g.strokeStyle = cold('#1e2326'); g.lineWidth = X(1.2);
      g.strokeRect(X(x0), X(14), X(26), X(48));
      glow(g, x0 + 13, 40, 30, '200,214,220', 0.07);
    }
    // stage
    g.fillStyle = cold('#3f342b', -0.2); g.fillRect(X(70), X(78), X(180), X(16));
    g.fillStyle = cold('#2b231d'); g.fillRect(X(70), X(92), X(180), X(3));
    g.fillStyle = cold('#5a2626', -0.25);
    poly(g, [62, 8, 84, 8, 80, 94, 62, 94]); g.fill();
    poly(g, [258, 8, 236, 8, 240, 94, 258, 94]); g.fill();
    // court lines on the floor
    g.strokeStyle = 'rgba(200,200,190,0.12)'; g.lineWidth = X(0.6);
    g.beginPath(); g.moveTo(X(30), X(120)); g.lineTo(X(290), X(120)); g.moveTo(X(160), X(94)); g.lineTo(X(160), X(180)); g.stroke();
    tube(g, [100, 4, 150, 4, 148, 6, 102, 6], t, fr, 7);
    tube(g, [170, 4, 220, 4, 218, 6, 172, 6], t, fr, 8);
  }

  function gates(p, v) {
    const g = p.g, t = p.t;
    g.fillStyle = lin(g, 0, 0, 0, 110, ['#56636d', '#a3adb4']);
    g.fillRect(0, 0, W, X(110));
    // school beyond, a few lit windows
    g.fillStyle = '#3a444b';
    g.fillRect(X(40), X(30), X(240), X(70));
    const r = rng(5);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 10; i++) {
      const lit = r() < 0.18;
      g.fillStyle = lit ? 'rgba(214,180,120,0.75)' : 'rgba(60,70,76,0.6)';
      g.fillRect(X(50 + i * 23), X(38 + row * 19), X(12), X(10));
      if (lit) glow(g, 56 + i * 23, 43 + row * 19, 12, '214,180,120', 0.12);
    }
    // playground tarmac beyond the railings
    g.fillStyle = lin(g, 0, 96, 0, 112, ['#46525a', '#566169']);
    g.fillRect(0, X(96), W, X(16));
    if (v.ambientPlay) {
      for (let i = 0; i < 6; i++) {
        const jx = 120 + i * 22, jump = v.frozen ? 0 : Math.abs(Math.sin(t * 4 + i * 1.7)) * 4;
        silhouette(g, jx, 108 - jump, 18, '#7d8a92', null, { happy: true });
      }
    }
    // pavement, wet
    g.fillStyle = lin(g, 0, 112, 0, 180, ['#5a656d', '#2c3338']);
    g.fillRect(0, X(112), W, H - X(112));
    // street lamp and its reflection
    g.fillStyle = '#0c0f10';
    g.fillRect(X(292), X(24), X(2.6), X(92));
    g.fillRect(X(282), X(22), X(14), X(3));
    glow(g, 284, 26, 40, '210,190,150', 0.3);
    glow(g, 284, 26, 8, '255,235,200', 0.9);
    g.fillStyle = 'rgba(210,190,150,0.12)';
    for (let i = 0; i < 5; i++) g.fillRect(X(279 + i * 2.2), X(118 + i * 3), X(1.2), X(40 - i * 4));
    // puddles reflecting the sky
    g.fillStyle = 'rgba(80,96,108,0.4)';
    g.beginPath(); g.ellipse(X(200), X(150), X(40), X(5), 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(X(60), X(168), X(30), X(4), 0, 0, Math.PI * 2); g.fill();
    // railings
    g.fillStyle = '#0b0d0e';
    for (let x = 0; x < 320; x += 6) {
      g.fillRect(X(x), X(44), X(1.4), X(70));
      poly(g, [x - 0.8, 45, x + 0.7, 40, x + 2.2, 45]); g.fill();
    }
    g.fillRect(0, X(52), W, X(1.4));
    g.fillRect(0, X(104), W, X(1.4));
    // pillars + sign
    for (const px of [30, 272]) {
      g.fillStyle = lin(g, px, 0, px + 18, 0, ['#2c2421', '#46383a', '#241d1a']);
      g.fillRect(X(px), X(36), X(18), X(80));
      g.fillStyle = '#1a1514';
      g.fillRect(X(px - 2), X(32), X(22), X(5));
    }
    g.fillStyle = cold('#cfd4d0', -0.35);
    g.fillRect(X(32), X(58), X(14), X(8));
    // low wall Tuck sits on
    g.fillStyle = lin(g, 0, 102, 0, 118, ['#5a4e48', '#2e2724']);
    g.fillRect(X(56), X(104), X(92), X(14));
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(X(56), X(104), X(92), X(1));
  }

  function bg(p, v) {
    const scenes = { office, corridor, assembly, gates };
    (scenes[v.bg] || office)(p, v);
  }

  /* ---------- people ---------- */
  // Head-and-shoulders silhouette for crowds / distant kids.
  function silhouette(g, x, y, h, fill, rim, o = {}) {
    const hr = h * 0.14;
    g.fillStyle = fill;
    g.beginPath(); g.ellipse(X(x), X(y - h + hr), X(hr * 0.85), X(hr), 0, 0, Math.PI * 2); g.fill();
    poly(g, [x - h * 0.16, y - h + hr * 2.1, x + h * 0.16, y - h + hr * 2.1, x + h * 0.12, y - h * 0.48, x + h * 0.1, y, x - h * 0.1, y, x - h * 0.12, y - h * 0.48]);
    g.fill();
    if (o.happy) {
      g.strokeStyle = fill; g.lineWidth = X(h * 0.07); g.lineCap = 'round';
      g.beginPath();
      g.moveTo(X(x - h * 0.15), X(y - h * 0.68)); g.lineTo(X(x - h * 0.3), X(y - h * 0.95));
      g.moveTo(X(x + h * 0.15), X(y - h * 0.68)); g.lineTo(X(x + h * 0.3), X(y - h * 0.95));
      g.stroke();
    }
  }

  function figure(p, f) {
    const g = p.g;
    const x = f.x, y = f.y != null ? f.y : GROUND;
    const h = 36 * (f.s || 1); // real proportions: ~7 heads tall
    const sad = f.mood === 'sad' || f.mood === 'crying' || f.mood === 'tired';
    const slump = sad ? h * 0.025 : 0;
    const breathe = f.frozen ? 0 : Math.sin(p.t * 1.6 + x) * h * 0.004;
    const wide = f.wide || 1;
    const headR = h * 0.068;
    const hipY = f.sitting ? y - h * 0.24 : y - h * 0.48;
    const top = (f.sitting ? hipY - h * 0.52 : y - h) + slump + breathe;
    const neck = top + headR * 2.05;
    const shW = h * 0.125 * wide * (sad ? 0.92 : 1);
    const hipW = h * 0.085 * wide;
    const lightX = 160; // window is behind/centre; rim the side facing it
    const rimSide = x < lightX ? 1 : -1;
    const garment = f.coat || f.blazer || f.shirt;
    const body = cold(garment, -0.45);
    const legs = cold(f.trousers || '#333', -0.5);
    const skin = cold(f.skin, -0.42);
    const rim = 'rgba(215,228,235,0.55)';

    // soft contact shadow
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath(); g.ellipse(X(x), X(y), X(h * 0.18 * wide), X(h * 0.025), 0, 0, Math.PI * 2); g.fill();

    const shape = (dx) => {
      // returns a path builder offset by dx (for rim light)
      const legsPath = () => {
        if (f.sitting) {
          poly(g, [x - hipW + dx, hipY, x + hipW + dx, hipY, x + hipW + dx, hipY + h * 0.05, x + hipW * 0.6 + dx, y, x + hipW * 0.1 + dx, y, x - hipW * 0.1 + dx, y, x - hipW * 0.6 + dx, y, x - hipW + dx, hipY + h * 0.05]);
        } else if (f.skirt) {
          poly(g, [x - hipW * 1.2 + dx, hipY, x + hipW * 1.2 + dx, hipY, x + hipW * 1.6 + dx, hipY + h * 0.16, x + hipW * 0.7 + dx, hipY + h * 0.16, x + hipW * 0.6 + dx, y, x + hipW * 0.1 + dx, y, x + dx, hipY + h * 0.17, x - hipW * 0.1 + dx, y, x - hipW * 0.6 + dx, y, x - hipW * 0.7 + dx, hipY + h * 0.16, x - hipW * 1.6 + dx, hipY + h * 0.16]);
        } else {
          poly(g, [x - hipW + dx, hipY, x + hipW + dx, hipY, x + hipW * 0.85 + dx, y, x + hipW * 0.15 + dx, y, x + dx, hipY + h * 0.1, x - hipW * 0.15 + dx, y, x - hipW * 0.85 + dx, y]);
        }
      };
      const torsoPath = () => {
        const hem = f.coat ? y - h * 0.2 : hipY + h * 0.02;
        const hemW = f.coat ? hipW * 1.5 : hipW * 1.05;
        poly(g, [x - shW * 0.55 + dx, neck, x + shW * 0.55 + dx, neck, x + shW + dx, neck + h * 0.035 + slump, x + shW * 0.92 + dx, hipY - h * 0.08, x + hemW + dx, hem, x - hemW + dx, hem, x - shW * 0.92 + dx, hipY - h * 0.08, x - shW + dx, neck + h * 0.035 + slump]);
      };
      return { legsPath, torsoPath };
    };

    // rim pass (offset toward the light)
    const off = rimSide * h * 0.012;
    const rp = shape(off);
    g.fillStyle = rim;
    rp.legsPath(); g.fill();
    rp.torsoPath(); g.fill();
    // body pass
    const bp = shape(0);
    g.fillStyle = legs; bp.legsPath(); g.fill();
    g.fillStyle = lin(g, 0, neck, 0, hipY, [cold(garment, -0.3), body]); bp.torsoPath(); g.fill();
    if (f.skirt) { g.fillStyle = cold(f.trousers, -0.45); poly(g, [x - hipW * 1.2, hipY, x + hipW * 1.2, hipY, x + hipW * 1.6, hipY + h * 0.16, x - hipW * 1.6, hipY + h * 0.16]); g.fill(); }
    if (f.blazer || f.coat) { // shirt V
      g.fillStyle = cold(f.shirt, -0.3);
      poly(g, [x - h * 0.03, neck, x + h * 0.03, neck, x, neck + h * 0.09]); g.fill();
    }
    if (f.tie) { g.fillStyle = cold(f.tie, -0.4); poly(g, [x - h * 0.008, neck + h * 0.01, x + h * 0.008, neck + h * 0.01, x + h * 0.012, neck + h * 0.12, x - h * 0.012, neck + h * 0.12]); g.fill(); }
    if (f.lanyard) {
      g.strokeStyle = 'rgba(140,165,190,0.7)'; g.lineWidth = X(0.4);
      g.beginPath(); g.moveTo(X(x - h * 0.04), X(neck)); g.lineTo(X(x), X(neck + h * 0.13)); g.lineTo(X(x + h * 0.04), X(neck)); g.stroke();
      g.fillStyle = 'rgba(220,225,228,0.8)'; g.fillRect(X(x - h * 0.018), X(neck + h * 0.13), X(h * 0.036), X(h * 0.045));
    }

    // arms
    const armW = h * 0.042 * wide;
    g.lineCap = 'round';
    const drawArm = (sx, sy, ex, ey, ex2, ey2) => {
      g.save();
      g.translate(X(off), 0);
      g.beginPath(); g.moveTo(X(sx), X(sy)); g.quadraticCurveTo(X(ex), X(ey), X(ex2), X(ey2));
      g.strokeStyle = 'rgba(215,228,235,0.35)'; g.lineWidth = X(armW); g.stroke();
      g.restore();
      g.beginPath(); g.moveTo(X(sx), X(sy)); g.quadraticCurveTo(X(ex), X(ey), X(ex2), X(ey2));
      g.strokeStyle = body; g.lineWidth = X(armW); g.stroke();
      g.fillStyle = skin; g.beginPath(); g.arc(X(ex2), X(ey2), X(armW * 0.55), 0, Math.PI * 2); g.fill();
    };
    const shY = neck + h * 0.045 + slump;
    if (f.mood === 'crying') { // hands to face
      drawArm(x - shW, shY, x - shW * 1.1, hipY - h * 0.05, x - headR * 0.6, top + headR * 1.4);
      drawArm(x + shW, shY, x + shW * 1.1, hipY - h * 0.05, x + headR * 0.6, top + headR * 1.4);
    } else if (f.mood === 'angry' && f.adult) { // arms folded
      drawArm(x - shW, shY, x - shW * 1.1, hipY - h * 0.12, x + shW * 0.6, hipY - h * 0.13);
      drawArm(x + shW, shY, x + shW * 1.1, hipY - h * 0.1, x - shW * 0.6, hipY - h * 0.11);
    } else if (f.ledger) { // holding the ledger close
      drawArm(x - shW, shY, x - shW * 1.15, hipY - h * 0.1, x - shW * 0.2, hipY - h * 0.12);
      g.fillStyle = cold('#7a1f1f', -0.4);
      g.fillRect(X(x - shW * 0.8), X(hipY - h * 0.2), X(shW * 1.2), X(h * 0.12));
      drawArm(x + shW, shY, x + shW * 1.1, hipY - h * 0.1, x + shW * 0.2, hipY - h * 0.1);
    } else {
      const hang = sad ? 0.95 : 1.1;
      drawArm(x - shW, shY, x - shW * 1.2, hipY - h * 0.15, x - shW * hang, hipY + h * 0.03);
      drawArm(x + shW, shY, x + shW * 1.2, hipY - h * 0.15, x + shW * hang, hipY + h * 0.03);
    }

    // head (tilted down when sad)
    const hx = x, hy = top + headR + (sad ? h * 0.01 : 0);
    g.fillStyle = rim;
    g.beginPath(); g.ellipse(X(hx + off), X(hy), X(headR * 0.86), X(headR), 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = skin;
    g.beginPath(); g.ellipse(X(hx), X(hy), X(headR * 0.86), X(headR), 0, 0, Math.PI * 2); g.fill();
    g.fillRect(X(hx - headR * 0.35), X(hy + headR * 0.8), X(headR * 0.7), X(headR * 0.5)); // neck
    // hair
    const hc = cold(f.hair || '#222', -0.5);
    g.fillStyle = hc;
    const hs = f.hairStyle;
    if (hs === 'bald') {
      g.beginPath(); g.ellipse(X(hx), X(hy + headR * 0.1), X(headR * 0.9), X(headR * 0.5), 0, Math.PI * 0.05, Math.PI * 0.95, true); g.fill();
    } else if (hs === 'long' || hs === 'bob' || hs === 'wrap') {
      const len = hs === 'long' ? 2.2 : hs === 'bob' ? 1.3 : 0.6;
      g.beginPath();
      g.ellipse(X(hx), X(hy - headR * 0.15), X(headR * 0.95), X(headR * 0.95), 0, Math.PI, 0);
      g.lineTo(X(hx + headR * 0.95), X(hy + headR * len));
      g.lineTo(X(hx + headR * 0.6), X(hy + headR * len));
      g.lineTo(X(hx + headR * 0.6), X(hy - headR * 0.1));
      g.lineTo(X(hx - headR * 0.6), X(hy - headR * 0.1));
      g.lineTo(X(hx - headR * 0.6), X(hy + headR * len));
      g.lineTo(X(hx - headR * 0.95), X(hy + headR * len));
      g.closePath(); g.fill();
      if (hs === 'wrap') { g.fillStyle = cold(f.hairColor2 || '#334', -0.4); g.beginPath(); g.ellipse(X(hx), X(hy - headR * 0.4), X(headR * 1.05), X(headR * 0.85), 0, Math.PI, 0); g.fill(); }
    } else {
      const wet = hs === 'wet' ? 0.35 : 0.1;
      g.beginPath();
      g.ellipse(X(hx), X(hy - headR * 0.2), X(headR * 0.92), X(headR * 0.85), 0, Math.PI * 1.02, Math.PI * 1.98);
      g.lineTo(X(hx + headR * 0.9), X(hy + headR * wet));
      g.lineTo(X(hx - headR * 0.9), X(hy + headR * wet));
      g.closePath(); g.fill();
      if (hs === 'bun') { g.beginPath(); g.arc(X(hx), X(hy - headR * 1.05), X(headR * 0.4), 0, Math.PI * 2); g.fill(); }
      if (hs === 'pony') { g.beginPath(); g.ellipse(X(hx + headR * 0.9), X(hy + headR * 0.3), X(headR * 0.3), X(headR * 0.8), 0.3, 0, Math.PI * 2); g.fill(); }
    }
    // the suggestion of a face: shadowed eye sockets, nothing more
    if (!sad || f.mood === 'tired') {
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.beginPath(); g.ellipse(X(hx - headR * 0.32), X(hy + headR * 0.05), X(headR * 0.18), X(headR * 0.1), 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(X(hx + headR * 0.32), X(hy + headR * 0.05), X(headR * 0.18), X(headR * 0.1), 0, 0, Math.PI * 2); g.fill();
    } else {
      // looking down: the hair falls forward, the face is in shadow
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.beginPath(); g.ellipse(X(hx), X(hy + headR * 0.3), X(headR * 0.7), X(headR * 0.5), 0, 0, Math.PI * 2); g.fill();
    }
    if (f.glasses) {
      g.strokeStyle = 'rgba(200,210,215,0.35)'; g.lineWidth = X(0.3);
      g.strokeRect(X(hx - headR * 0.55), X(hy - headR * 0.08), X(headR * 0.45), X(headR * 0.28));
      g.strokeRect(X(hx + headR * 0.1), X(hy - headR * 0.08), X(headR * 0.45), X(headR * 0.28));
    }
  }

  function fg(p, v) {
    if (v.bg !== 'assembly') return;
    // the whole school, from behind, filling the hall. Frozen when it matters.
    const g = p.g;
    const rows = [[132, 14, 13], [146, 18, 16], [164, 24, 20], [186, 32, 26]];
    rows.forEach(([y, h, step], ri) => {
      const r = rng(31 + ri);
      for (let x = -10; x < 340; x += step) {
        const jx = x + (r() - 0.5) * step * 0.5;
        const sway = v.frozen ? 0 : Math.sin(p.t * 1.5 + x * 0.3 + ri) * 0.25;
        const shadeV = 20 + ri * 3 + r() * 10;
        const col = `rgb(${shadeV},${shadeV + 4},${shadeV + 7})`;
        g.fillStyle = col;
        g.beginPath(); g.ellipse(X(jx + sway), X(y), X(h * 0.42), X(h * 0.3), 0, Math.PI, 0); g.fill(); // shoulders
        g.fillRect(X(jx + sway - h * 0.42), X(y), X(h * 0.84), X(h * 0.4));
        g.beginPath(); g.ellipse(X(jx + sway), X(y - h * 0.36), X(h * 0.2), X(h * 0.24), 0, 0, Math.PI * 2); g.fill(); // head
        g.fillStyle = `rgba(${shadeV + 25},${shadeV + 30},${shadeV + 36},0.6)`; // hair catching the window light
        g.beginPath(); g.ellipse(X(jx + sway), X(y - h * 0.44), X(h * 0.19), X(h * 0.15), 0, Math.PI, 0); g.fill();
      }
    });
  }

  function beforeCast(p, v, drawCast) {
    if (v.bg !== 'gates') return;
    const g = p.g;
    g.save();
    g.globalAlpha = 0.15;
    g.translate(0, X(118) * 2);
    g.scale(1, -1);
    drawCast();
    g.restore();
    g.globalAlpha = 1;
  }

  function postTop(ctx, cw, h, t, view, dt, grain) {
    ctx.save();
    // grain
    ctx.globalAlpha = 0.9;
    ctx.drawImage(grain[Math.floor(t * 24) % grain.length], 0, 0, cw, h);
    ctx.globalAlpha = 1;
    // vignette
    const vg = ctx.createRadialGradient(cw / 2, h / 2, h * 0.35, cw / 2, h / 2, h * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, cw, h);
    // letterbox
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, h * 0.07);
    ctx.fillRect(0, h * 0.93, cw, h * 0.07);
    ctx.restore();
  }

  T.styles.real = {
    bg, figure, fg, beforeCast, postTop,
    noRain: (v) => v.bg !== 'gates',
    layout: (v) => {
      if (v.bg === 'gates') return { tuckX: 100, y: GROUND + 4, positions: [210] };
      return { tuckX: 104, positions: (v.cast || []).length > 1 ? [196, 238] : [214] };
    },
  };
})();
