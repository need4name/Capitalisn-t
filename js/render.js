/*
 * TUCK — renderer.
 * Every scene is described once in a 320x180 virtual space and drawn by a
 * "Painter" whose style decides how primitives look:
 *   crayon – wobbly hand-drawn hatching on paper, boiling at 8fps
 *   pixel  – drawn at 320x180 and blown up with nearest-neighbour, dithered skies
 *   ad     – glossy gradients, thick outlines, sunbursts, sparkles
 *   real   – desaturated, unoutlined, grainy, rainy, vignetted
 */
(function () {
  const T = (window.Tuck = window.Tuck || {});
  const VW = 320, VH = 180, W = 1280, H = 720, K = W / VW;
  const GROUND = 114;
  const FIG = 1.5; // cast figures are drawn larger than ambient ones

  /* ---------------- colour helpers ---------------- */
  function hex(c) {
    c = c.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const n = parseInt(c, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const lum = (a) => a[0] * 0.299 + a[1] * 0.587 + a[2] * 0.114;
  const sat = (a, f) => { const l = lum(a); return a.map((v) => l + (v - l) * f); };
  const cache = new Map();
  function mapColor(style, c) {
    const key = style + c;
    let a = cache.get(key);
    if (a) return a;
    a = hex(c);
    if (style === 'pixel') a = sat(a, 1.25);
    else if (style === 'ad') a = mix(sat(a, 1.5), [255, 255, 255], 0.04);
    else if (style === 'real') a = mix(sat(a, 0.15), [70, 78, 86], 0.3).map((v) => v * 0.9);
    a = a.map((v) => Math.max(0, Math.min(255, Math.round(v))));
    cache.set(key, a);
    return a;
  }

  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- Painter ---------------- */
  function Painter(g, style, seed, t) {
    this.g = g;
    this.st = style;
    this.r = rng(seed);
    this.t = t;
    this.k = style === 'pixel' ? 1 : K;
  }
  const P = Painter.prototype;

  P.c = function (col, a = 1, shade = 0) {
    let v = mapColor(this.st, col);
    if (shade > 0) v = mix(v, [255, 255, 255], shade);
    else if (shade < 0) v = mix(v, [0, 0, 0], -shade);
    return `rgba(${v[0] | 0},${v[1] | 0},${v[2] | 0},${a})`;
  };

  // Scale points; in crayon style subdivide edges and jitter.
  P.pts = function (pts, closed) {
    const k = this.k;
    if (this.st !== 'crayon') return pts.map((v) => v * k);
    const out = [];
    const n = pts.length / 2;
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const x1 = pts[i * 2], y1 = pts[i * 2 + 1];
      const j = (i + 1) % n;
      const x2 = pts[j * 2], y2 = pts[j * 2 + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(len / 7));
      for (let s = 0; s < steps; s++) {
        const tt = s / steps;
        out.push((x1 + (x2 - x1) * tt + (this.r() - 0.5) * 1.1) * k, (y1 + (y2 - y1) * tt + (this.r() - 0.5) * 1.1) * k);
      }
    }
    if (!closed) out.push((pts[pts.length - 2] + (this.r() - 0.5)) * k, (pts[pts.length - 1] + (this.r() - 0.5)) * k);
    return out;
  };

  function tracePath(g, P, closed) {
    g.beginPath();
    g.moveTo(P[0], P[1]);
    for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]);
    if (closed) g.closePath();
  }
  function bbox(P) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < P.length; i += 2) {
      if (P[i] < x0) x0 = P[i];
      if (P[i] > x1) x1 = P[i];
      if (P[i + 1] < y0) y0 = P[i + 1];
      if (P[i + 1] > y1) y1 = P[i + 1];
    }
    return { x0, y0, x1, y1 };
  }

  // Fill the current path according to the style. `trace` re-traces the path.
  P._fill = function (trace, b, col, o) {
    const g = this.g, k = this.k;
    const outline = o.outline !== false;
    if (o.fill === false) {
      trace();
      g.strokeStyle = this.c(col, 1, this.st === 'real' ? 0 : -0.1);
      g.lineWidth = (o.w || 1) * (this.st === 'pixel' ? 1 : k * 0.8);
      g.lineJoin = 'round';
      g.stroke();
      return;
    }
    switch (this.st) {
      case 'crayon': {
        trace();
        g.save();
        if (o.wash == null) { g.fillStyle = '#f8f2e2'; g.fill(); } // paper underneath, so layers don't show through
        g.fillStyle = this.c(col, o.wash != null ? o.wash : 0.3);
        g.fill();
        g.clip();
        g.strokeStyle = this.c(col, 0.85);
        g.lineWidth = 0.95 * k;
        g.lineCap = 'round';
        const sp = (o.hatch || 1.8) * k;
        const ang = o.horizontal ? 0 : 1;
        g.beginPath();
        const span = b.x1 - b.x0 + b.y1 - b.y0;
        for (let d = -span; d < span; d += sp) {
          const jit = (this.r() - 0.5) * k;
          if (ang) {
            g.moveTo(b.x0 + d + jit, b.y1 + k);
            g.lineTo(b.x0 + d + (b.y1 - b.y0) + jit + k, b.y0 - k);
          } else {
            const y = b.y0 + (d + span) / 2;
            if (y > b.y1 + k) break;
            g.moveTo(b.x0 - k, y + jit);
            g.lineTo(b.x1 + k, y - jit);
          }
        }
        g.stroke();
        g.restore();
        if (outline) {
          trace(true);
          g.strokeStyle = this.c(col, 0.95, -0.4);
          g.lineWidth = 1.1 * k;
          g.lineJoin = 'round';
          g.stroke();
        }
        break;
      }
      case 'pixel': {
        trace();
        g.fillStyle = this.c(col);
        g.fill();
        if (outline) {
          g.strokeStyle = this.c(col, 1, -0.6);
          g.lineWidth = 1;
          g.stroke();
        }
        break;
      }
      case 'ad': {
        trace();
        const gr = g.createLinearGradient(0, b.y0, 0, b.y1);
        gr.addColorStop(0, this.c(col, 1, 0.35));
        gr.addColorStop(0.5, this.c(col));
        gr.addColorStop(1, this.c(col, 1, -0.25));
        g.fillStyle = gr;
        g.fill();
        if (o.gloss !== false && b.y1 - b.y0 > 2 * k) {
          g.save();
          g.clip();
          const gl = g.createLinearGradient(0, b.y0, 0, b.y0 + (b.y1 - b.y0) * 0.5);
          gl.addColorStop(0, 'rgba(255,255,255,0.55)');
          gl.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gl;
          g.fillRect(b.x0, b.y0, b.x1 - b.x0, (b.y1 - b.y0) * 0.5);
          g.restore();
        }
        if (outline) {
          trace();
          g.strokeStyle = '#1b0f2e';
          g.lineWidth = 0.9 * k;
          g.lineJoin = 'round';
          g.stroke();
        }
        break;
      }
      default: {
        // real
        trace();
        const gr = g.createLinearGradient(0, b.y0, 0, b.y1);
        gr.addColorStop(0, this.c(col, 1, 0.06));
        gr.addColorStop(1, this.c(col, 1, -0.18));
        g.fillStyle = gr;
        g.fill();
      }
    }
  };

  P.poly = function (pts, col, o = {}) {
    let Pp = this.pts(pts, true);
    const b = bbox(Pp);
    this._fill((again) => {
      if (again && this.st === 'crayon') Pp = this.pts(pts, true);
      tracePath(this.g, Pp, true);
    }, b, col, o);
  };

  P.rect = function (x, y, w, h, col, o = {}) {
    if (this.st === 'pixel' && o.fill !== false) {
      const g = this.g;
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      g.fillStyle = this.c(col);
      g.fillRect(x, y, w, h);
      if (o.outline !== false && w > 1 && h > 1) {
        g.strokeStyle = this.c(col, 1, -0.6);
        g.lineWidth = 1;
        g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      }
      return;
    }
    this.poly([x, y, x + w, y, x + w, y + h, x, y + h], col, o);
  };

  P.circle = function (x, y, rad, col, o = {}) {
    if (this.st === 'crayon') {
      const pts = [];
      const n = Math.max(8, Math.min(18, Math.round(rad * 2)));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        pts.push(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
      }
      return this.poly(pts, col, o);
    }
    const k = this.k;
    const b = { x0: (x - rad) * k, y0: (y - rad) * k, x1: (x + rad) * k, y1: (y + rad) * k };
    this._fill(() => {
      this.g.beginPath();
      this.g.arc(x * k, y * k, rad * k, 0, Math.PI * 2);
    }, b, col, o);
  };

  P.path = function (pts, col, w = 1) {
    const g = this.g, k = this.k;
    const Pp = this.pts(pts, false);
    tracePath(g, Pp, false);
    g.strokeStyle = this.st === 'ad' && w > 1.5 ? this.c(col) : this.c(col);
    g.lineWidth = this.st === 'pixel' ? Math.max(1, Math.round(w)) : w * k * (this.st === 'crayon' ? 1.1 : 1);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    if (this.st === 'ad' && w > 1.5) {
      g.save();
      g.strokeStyle = '#1b0f2e';
      g.lineWidth += 0.9 * k;
      g.stroke();
      g.restore();
      g.strokeStyle = this.c(col);
    }
    g.stroke();
  };
  P.line = function (x1, y1, x2, y2, col, w = 1) {
    this.path([x1, y1, x2, y2], col, w);
  };

  const FONTS = {
    crayon: '"Patrick Hand", "Comic Sans MS", cursive',
    pixel: '"Press Start 2P", monospace',
    ad: 'Anton, Impact, "Arial Black", sans-serif',
    real: 'Inter, "Helvetica Neue", Arial, sans-serif',
  };
  P.text = function (s, x, y, size, col, o = {}) {
    const g = this.g, k = this.k;
    const px = this.st === 'pixel' ? Math.max(5, Math.round(size * 0.8)) : size * k;
    g.save();
    g.font = `${o.bold ? 'bold ' : ''}${px}px ${FONTS[this.st]}`;
    g.textAlign = o.align || 'center';
    g.textBaseline = 'middle';
    g.translate(x * k, y * k);
    if (this.st === 'crayon') g.rotate((this.r() - 0.5) * 0.05);
    if (this.st === 'ad') {
      g.lineWidth = 0.8 * k;
      g.strokeStyle = '#1b0f2e';
      g.strokeText(s, 0, 0);
    }
    g.fillStyle = this.c(col);
    g.fillText(s, 0, 0);
    g.restore();
  };

  // Full-screen sky / wall gradient.
  P.sky = function (top, bottom, h = VH) {
    const g = this.g, k = this.k;
    if (this.st === 'pixel') {
      const bands = 6;
      const a = mapColor('pixel', top), b = mapColor('pixel', bottom);
      const bh = Math.ceil(h / bands);
      for (let i = 0; i < bands; i++) {
        const c = mix(a, b, i / (bands - 1));
        g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
        g.fillRect(0, i * bh, VW, bh);
        if (i > 0) {
          const c0 = mix(a, b, (i - 1) / (bands - 1));
          g.fillStyle = `rgb(${c0[0] | 0},${c0[1] | 0},${c0[2] | 0})`;
          for (let x = 0; x < VW; x += 2) g.fillRect(x + ((i & 1) ? 1 : 0), i * bh, 1, 1);
          for (let x = 1; x < VW; x += 4) g.fillRect(x, i * bh + 1, 1, 1);
        }
      }
      return;
    }
    if (this.st === 'crayon') {
      this.rect(0, 0, VW, h, top, { outline: false, wash: 0.25, horizontal: true, hatch: 3 });
      return;
    }
    const gr = g.createLinearGradient(0, 0, 0, h * k);
    gr.addColorStop(0, this.c(top));
    gr.addColorStop(1, this.c(bottom));
    g.fillStyle = gr;
    g.fillRect(0, 0, W, h * k);
    if (this.st === 'ad' && !this.noBurst) {
      // rotating sunburst
      g.save();
      g.translate(W * 0.35, H * 0.25);
      g.rotate(this.t * 0.08);
      g.fillStyle = 'rgba(255,255,255,0.18)';
      for (let i = 0; i < 16; i++) {
        g.beginPath();
        g.moveTo(0, 0);
        g.arc(0, 0, W * 1.2, (i / 16) * Math.PI * 2, ((i + 0.5) / 16) * Math.PI * 2);
        g.closePath();
        g.fill();
      }
      g.restore();
    }
  };

  /* ---------------- figures ---------------- */
  const HAIR = {
    mop(p, x, hy, r, c) { p.poly([x - r * 1.1, hy + r * 0.1, x - r, hy - r * 0.8, x - r * 0.3, hy - r * 1.25, x + r * 0.5, hy - r * 1.2, x + r * 1.1, hy - r * 0.6, x + r * 1.05, hy + r * 0.15, x + r * 0.5, hy - r * 0.45, x - r * 0.4, hy - r * 0.5], c); },
    scruff(p, x, hy, r, c) { p.poly([x - r * 1.05, hy, x - r * 1.2, hy - r * 0.7, x - r * 0.6, hy - r * 0.8, x - r * 0.7, hy - r * 1.3, x - r * 0.1, hy - r * 1.0, x + r * 0.2, hy - r * 1.4, x + r * 0.6, hy - r * 0.95, x + r * 1.25, hy - r * 1.05, x + r * 1.05, hy - r * 0.2, x + r * 0.6, hy - r * 0.5, x - r * 0.5, hy - r * 0.5], c); },
    short(p, x, hy, r, c) { p.poly([x - r * 1.02, hy - r * 0.1, x - r * 0.9, hy - r * 0.85, x, hy - r * 1.15, x + r * 0.9, hy - r * 0.85, x + r * 1.02, hy - r * 0.1, x + r * 0.7, hy - r * 0.55, x - r * 0.7, hy - r * 0.55], c); },
    buzz(p, x, hy, r, c) { p.poly([x - r, hy - r * 0.35, x - r * 0.7, hy - r * 0.9, x + r * 0.7, hy - r * 0.9, x + r, hy - r * 0.35, x, hy - r * 0.65], c); },
    side(p, x, hy, r, c) { p.poly([x - r * 1.05, hy, x - r, hy - r * 0.9, x - r * 0.2, hy - r * 1.2, x + r, hy - r * 0.8, x + r * 1.05, hy - r * 0.2, x + r * 0.4, hy - r * 0.6, x - r * 0.6, hy - r * 0.45], c); },
    slick(p, x, hy, r, c) { p.poly([x - r * 1.02, hy - r * 0.2, x - r * 0.8, hy - r * 1.0, x + r * 0.2, hy - r * 1.2, x + r * 1.2, hy - r * 0.9, x + r * 1.02, hy - r * 0.3, x - r * 0.3, hy - r * 0.6], c); },
    wet(p, x, hy, r, c) { p.poly([x - r * 1.05, hy + r * 0.4, x - r, hy - r * 0.8, x, hy - r * 1.1, x + r, hy - r * 0.8, x + r * 1.05, hy + r * 0.4, x + r * 0.6, hy - r * 0.2, x + r * 0.2, hy + r * 0.1, x - r * 0.2, hy - r * 0.3, x - r * 0.6, hy + r * 0.1], c); },
    pony(p, x, hy, r, c) { HAIR.short(p, x, hy, r, c); p.poly([x + r * 0.8, hy - r * 0.6, x + r * 1.6, hy - r * 0.2, x + r * 1.5, hy + r * 1.1, x + r * 1.0, hy + r * 0.2], c); },
    long(p, x, hy, r, c) { p.poly([x - r * 1.15, hy + r * 1.5, x - r * 1.1, hy - r * 0.6, x - r * 0.5, hy - r * 1.2, x + r * 0.5, hy - r * 1.2, x + r * 1.1, hy - r * 0.6, x + r * 1.15, hy + r * 1.5, x + r * 0.75, hy + r * 1.5, x + r * 0.8, hy - r * 0.4, x - r * 0.8, hy - r * 0.4, x - r * 0.75, hy + r * 1.5], c); },
    bob(p, x, hy, r, c) { p.poly([x - r * 1.15, hy + r * 0.7, x - r * 1.1, hy - r * 0.6, x - r * 0.5, hy - r * 1.2, x + r * 0.5, hy - r * 1.2, x + r * 1.1, hy - r * 0.6, x + r * 1.15, hy + r * 0.7, x + r * 0.8, hy + r * 0.7, x + r * 0.8, hy - r * 0.4, x - r * 0.8, hy - r * 0.4, x - r * 0.8, hy + r * 0.7], c); },
    bun(p, x, hy, r, c) { HAIR.short(p, x, hy, r, c); p.circle(x, hy - r * 1.35, r * 0.5, c); },
    wrap(p, x, hy, r, c, c2) { p.poly([x - r * 1.15, hy - r * 0.1, x - r * 1.0, hy - r * 1.1, x - r * 0.2, hy - r * 1.6, x + r * 0.9, hy - r * 1.3, x + r * 1.15, hy - r * 0.1, x, hy - r * 0.5], c2 || c); },
    bald(p, x, hy, r, c) { p.poly([x - r * 1.02, hy - r * 0.05, x - r * 0.9, hy - r * 0.5, x - r * 0.7, hy - r * 0.2], c); p.poly([x + r * 1.02, hy - r * 0.05, x + r * 0.9, hy - r * 0.5, x + r * 0.7, hy - r * 0.2], c); },
  };

  function figure(p, f) {
    const s = f.s || 1;
    const x = f.x, y = f.y != null ? f.y : GROUND;
    const bob = f.frozen ? 0 : Math.sin(p.t * 3 + x * 0.7) * 0.5;
    const jump = f.jump && !f.frozen ? Math.abs(Math.sin(p.t * 5 + x)) * 4 * s : 0;
    const yy = y - jump;
    const legH = 14 * s, bodyH = 16 * s, headR = 7 * s;
    const bw = 12 * s * (f.wide || 1);
    const hip = yy - legH, sh = hip - bodyH + bob, hy = sh - headR + 1 * s;
    const shoes = f.shoes || ['#222', '#222'];

    // shadow
    if (p.st !== 'pixel') p.poly([x - 9 * s, y, x + 9 * s, y, x + 7 * s, y + 2 * s, x - 7 * s, y + 2 * s], '#000000', { outline: false, wash: 0.12, gloss: false, hatch: 3 });

    // legs
    if (f.shorts || f.skirt) {
      p.rect(x - 4.5 * s, hip + 4 * s, 3.5 * s, legH - 6 * s, f.skin, { outline: p.st !== 'real' });
      p.rect(x + 1 * s, hip + 4 * s, 3.5 * s, legH - 6 * s, f.skin, { outline: p.st !== 'real' });
      if (f.skirt) p.poly([x - bw / 2, hip - 1 * s, x + bw / 2, hip - 1 * s, x + bw / 2 + 2 * s, hip + 6 * s, x - bw / 2 - 2 * s, hip + 6 * s], f.trousers);
      else p.rect(x - 5.5 * s, hip - 1 * s, 11 * s, 6 * s, f.trousers);
    } else {
      p.rect(x - 5 * s, hip - 1 * s, 4.5 * s, legH - 1 * s, f.trousers);
      p.rect(x + 0.5 * s, hip - 1 * s, 4.5 * s, legH - 1 * s, f.trousers);
    }
    p.rect(x - 6 * s, yy - 2.5 * s, 5.5 * s, 2.5 * s, shoes[0]);
    p.rect(x + 0.5 * s, yy - 2.5 * s, 5.5 * s, 2.5 * s, shoes[1]);

    // long coat
    if (f.coat) {
      p.poly([x - bw / 2 - 1 * s, sh, x + bw / 2 + 1 * s, sh, x + bw / 2 + 5 * s, yy - 3 * s, x - bw / 2 - 5 * s, yy - 3 * s], f.coat);
    }
    // torso
    const torso = f.blazer || f.shirt;
    p.poly([x - bw / 2, sh, x + bw / 2, sh, x + bw / 2 + 1 * s, hip + 1 * s, x - bw / 2 - 1 * s, hip + 1 * s], f.coat || torso);
    if (f.blazer || f.coat) {
      p.poly([x - 2.5 * s, sh, x + 2.5 * s, sh, x, sh + 7 * s], f.shirt, { outline: false });
    }
    if (f.apron) p.rect(x - bw / 2 + 2 * s, sh + 4 * s, bw - 4 * s, bodyH - 3 * s, '#ffffff');
    if (f.tie) p.poly([x - 1 * s, sh + 1 * s, x + 1 * s, sh + 1 * s, x + 1.5 * s, sh + 9 * s, x, sh + 10.5 * s, x - 1.5 * s, sh + 9 * s], f.tie, { outline: false });
    if (f.sash) p.line(x - bw / 2, sh + 1 * s, x + bw / 2, hip, '#ffd400', 2.4 * s);
    if (f.lanyard) { p.path([x - 3 * s, sh, x, sh + 9 * s, x + 3 * s, sh], '#2266cc', 0.8); p.rect(x - 1.5 * s, sh + 9 * s, 3 * s, 3.5 * s, '#ffffff'); }
    if (f.badge) { p.circle(x - 3.5 * s, sh + 4 * s, 1.6 * s, '#ffcc00'); }

    // arms
    const sleeve = f.coat || f.blazer || f.shirt;
    const swing = f.frozen ? 0 : Math.sin(p.t * 2 + x) * 0.6 * s;
    p.line(x - bw / 2, sh + 2 * s, x - bw / 2 - 2.5 * s, hip + swing, sleeve, 3 * s);
    p.line(x + bw / 2, sh + 2 * s, x + bw / 2 + 2.5 * s, hip - swing, sleeve, 3 * s);
    p.circle(x - bw / 2 - 2.5 * s, hip + swing + 0.5 * s, 1.5 * s, f.skin, { outline: p.st === 'ad' });
    p.circle(x + bw / 2 + 2.5 * s, hip - swing + 0.5 * s, 1.5 * s, f.skin, { outline: p.st === 'ad' });

    // carried items
    if (f.jumperRoll) {
      p.poly([x + bw / 2 - 2 * s, hip - 6 * s, x + bw / 2 + 6 * s, hip - 7 * s, x + bw / 2 + 7 * s, hip - 2 * s, x + bw / 2 - 1 * s, hip - 1 * s], '#8a8a8a');
      p.circle(x + bw / 2 + 6.5 * s, hip - 4.5 * s, 1.4 * s, '#2ecc71', { outline: false });
    }
    if (f.organiser) {
      p.rect(x + bw / 2 + 1 * s, hip - 6 * s, 5 * s, 7 * s, '#222222');
      p.rect(x + bw / 2 + 1.8 * s, hip - 5 * s, 3.4 * s, 3 * s, '#7fff7f', { outline: false });
    }
    if (f.sandwich) {
      p.poly([x - bw / 2 - 6 * s, hip - 2 * s, x - bw / 2, hip - 2 * s, x - bw / 2 - 3 * s, hip - 7 * s], '#f3e1a1');
    }
    if (f.ledger) p.rect(x - bw / 2 - 6 * s, hip - 6 * s, 5 * s, 7 * s, '#7a1f1f');

    // head
    p.circle(x, hy, headR, f.skin);
    const hairFn = HAIR[f.hairStyle] || HAIR.short;
    hairFn(p, x, hy, headR, f.hair, f.hairColor2);

    // face
    const ex = 2.5 * s, ey = hy - 0.3 * s;
    if (f.pound) {
      p.text('£', x - ex, ey, 4.5 * s, '#1e8f3a', { bold: true });
      p.text('£', x + ex, ey, 4.5 * s, '#1e8f3a', { bold: true });
    } else if (f.shades) {
      p.rect(x - 5 * s, ey - 1.3 * s, 10 * s, 2.6 * s, '#111111');
    } else {
      const er = (p.st === 'pixel' ? 0.9 : 0.85) * s;
      if (f.mood === 'tired') {
        p.line(x - ex - 1 * s, ey, x - ex + 1 * s, ey, '#222', 0.7);
        p.line(x + ex - 1 * s, ey, x + ex + 1 * s, ey, '#222', 0.7);
      } else {
        p.circle(x - ex, ey, er, '#222222', { outline: false });
        p.circle(x + ex, ey, er, '#222222', { outline: false });
      }
      if (f.mood === 'angry') {
        p.line(x - ex - 1.5 * s, ey - 2.2 * s, x - ex + 1.2 * s, ey - 1.3 * s, '#222', 0.8);
        p.line(x + ex + 1.5 * s, ey - 2.2 * s, x + ex - 1.2 * s, ey - 1.3 * s, '#222', 0.8);
      }
    }
    if (f.glasses) {
      p.circle(x - ex, ey, 1.9 * s, '#333333', { fill: false, w: 0.5 });
      p.circle(x + ex, ey, 1.9 * s, '#333333', { fill: false, w: 0.5 });
    }
    const my = hy + 3 * s;
    switch (f.mood) {
      case 'happy':
        p.path([x - 2.2 * s, my - 0.6 * s, x, my + 0.8 * s, x + 2.2 * s, my - 0.6 * s], '#5a1f1f', 0.7);
        break;
      case 'smug':
        p.path([x - 2 * s, my, x + 1 * s, my, x + 2.5 * s, my - 1.2 * s], '#5a1f1f', 0.7);
        break;
      case 'sad': case 'tired':
        p.path([x - 2 * s, my + 0.6 * s, x, my - 0.4 * s, x + 2 * s, my + 0.6 * s], '#5a1f1f', 0.7);
        break;
      case 'crying': {
        p.circle(x, my + 0.2 * s, 1.3 * s, '#5a1f1f', { outline: false });
        const drip = f.frozen ? 0.5 : (p.t * 1.5 + x) % 1;
        p.circle(x - ex - 0.5 * s, ey + 2 * s + drip * 4 * s, 0.9 * s, '#4aa3ff', { outline: false });
        p.circle(x + ex + 0.5 * s, ey + 2 * s + ((drip + 0.5) % 1) * 4 * s, 0.9 * s, '#4aa3ff', { outline: false });
        break;
      }
      case 'angry':
        p.line(x - 2 * s, my + 0.4 * s, x + 2 * s, my + 0.4 * s, '#5a1f1f', 0.8);
        break;
      default:
        p.line(x - 1.6 * s, my, x + 1.6 * s, my, '#5a1f1f', 0.6);
    }
  }

  /* ---------------- backgrounds ---------------- */
  function wallClock(p, x, y, r, minute) {
    p.circle(x, y, r, '#ffffff');
    const h = (minute / 60) % 12, m = minute % 60;
    const ah = (h / 12) * Math.PI * 2 - Math.PI / 2, am = (m / 60) * Math.PI * 2 - Math.PI / 2;
    p.line(x, y, x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5, '#222', 0.9);
    p.line(x, y, x + Math.cos(am) * r * 0.8, y + Math.sin(am) * r * 0.8, '#222', 0.6);
  }

  const BG = {
    playground(p, v) {
      p.sky('#9fd4ff', '#e4f3ff');
      // building
      p.rect(0, 40, 190, 74, '#b8553f');
      p.poly([-6, 41, 95, 12, 196, 41], '#6b3b2e');
      for (let i = 0; i < 4; i++) if (i !== 1 && i !== 2) p.rect(10 + i * 46, 58, 30, 18, '#a9dcf5');
      p.rect(10, 86, 30, 18, '#a9dcf5');
      p.rect(148, 86, 30, 18, '#a9dcf5');
      p.rect(80, 80, 30, 34, '#2f4f9f');
      p.rect(48, 44, 94, 10, '#fff4cc');
      p.text(v.schoolName, 95, 49.5, 6, '#3a2a1a');
      // fence + tree
      for (let x = 198; x <= 320; x += 9) p.line(x, 76, x, 114, '#2e7d32', 1);
      p.line(196, 80, 320, 80, '#2e7d32', 1.2);
      p.line(196, 100, 320, 100, '#2e7d32', 1.2);
      p.rect(290, 60, 8, 54, '#6d4c2f');
      p.circle(294, 52, 22, '#3f9a45');
      // tarmac
      p.rect(0, 112, 320, 68, '#8b9099');
      for (let i = 0; i < 4; i++) p.rect(112 + i * 13, 120, 12, 8, '#f5d142', { fill: false, w: 1 });
      if (v.bench) {
        p.rect(196, 98, 44, 4, '#8b5a2b');
        p.rect(196, 88, 44, 3, '#8b5a2b');
        p.line(200, 102, 200, 114, '#5a3a1a', 1.5);
        p.line(236, 102, 236, 114, '#5a3a1a', 1.5);
      }
    },
    shed(p, v) {
      p.sky('#a8dcff', '#eaf7ff');
      p.rect(0, 100, 320, 80, '#5fae4e');
      p.rect(14, 40, 130, 74, '#9a5a2e');
      p.poly([6, 42, 79, 16, 152, 42], '#5c3317');
      p.rect(30, 66, 34, 48, '#6b3a1a');
      p.rect(46, 46, 66, 12, '#fff4cc');
      p.text('SPORTS', 79, 52, 7, '#3a2a1a');
      p.circle(132, 110, 5, '#f2f2f2');
      p.rect(250, 50, 7, 64, '#6d4c2f');
      p.circle(254, 42, 20, '#3f9a45');
    },
    corridor(p, v) {
      p.sky('#efe2b5', '#e2d39e', 114);
      // poster + clock
      p.rect(96, 6, 48, 28, '#ffffff');
      p.text(v.act >= 4 ? 'SAFEGUARDING' : 'BE KIND!', 120, 15, 5, '#c0392b');
      p.text(v.act >= 4 ? 'IS EVERYONE’S JOB' : 'IT COSTS NOTHING', 120, 25, 3.6, '#333');
      wallClock(p, 172, 20, 10, v.minute);
      p.rect(196, 6, 44, 28, '#c69c6d');
      p.rect(200, 10, 12, 9, '#ffffff', { outline: false });
      p.rect(216, 12, 10, 12, '#ffe08a', { outline: false });
      p.rect(228, 9, 9, 8, '#a8e6a1', { outline: false });
      // lockers
      for (let i = 0; i < 14; i++) {
        const x = i * 23;
        p.rect(x, 40, 22, 74, i % 2 ? '#3f7fc0' : '#2f6aa8');
        p.line(x + 6, 50, x + 16, 50, '#1b3c60', 0.8);
        p.line(x + 6, 54, x + 16, 54, '#1b3c60', 0.8);
        p.rect(x + 16, 76, 2, 6, '#c0c0c0', { outline: false });
      }
      p.rect(0, 112, 320, 68, '#9c7a54');
      for (let x = 0; x < 340; x += 20) p.line(x, 112, x - 24, 180, '#7a5c3c', 0.6);
    },
    bikeshed(p, v) {
      p.sky(v.rain ? '#8a99a8' : '#9fd4ff', v.rain ? '#c2ccd6' : '#e4f3ff');
      p.rect(0, 22, 90, 92, '#8a5a44');
      for (let i = 0; i < 3; i++) p.rect(10 + i * 26, 50, 18, 16, '#a9dcf5');
      p.rect(100, 42, 220, 72, '#7d8c99');
      p.poly([92, 44, 320, 24, 320, 34, 92, 52], '#4a5560');
      for (let x = 104; x < 320; x += 40) p.line(x, 50, x, 114, '#39424a', 1.5);
      p.text(v.act >= 3 ? 'TUCK ENTERPRISES™' : 'GAV WOZ ERE', 200, 62, 6, '#ffeb3b');
      for (const bx of [118, 250]) {
        p.circle(bx, 105, 7, '#222222', { fill: false, w: 1.2 });
        p.circle(bx + 18, 105, 7, '#222222', { fill: false, w: 1.2 });
        p.path([bx, 105, bx + 8, 95, bx + 18, 105, bx + 8, 105, bx, 105], '#d32f2f', 1.2);
      }
      p.rect(0, 112, 320, 68, '#6f757d');
    },
    sixth(p, v) {
      p.sky('#47c6ff', '#ffe0f4');
      p.rect(0, 22, 210, 92, '#8fe0f0');
      for (let x = 0; x < 210; x += 21) p.line(x, 22, x, 114, '#2f8fb0', 0.8);
      for (let y = 22; y < 114; y += 18) p.line(0, y, 210, y, '#2f8fb0', 0.8);
      p.rect(18, 28, 170, 16, '#ff2e88');
      p.text('TUCK ENTERPRISES™', 103, 36.5, 9, '#ffffff', { bold: true });
      p.rect(122, 54, 28, 60, '#e8202a');
      p.text('VOLT', 136, 64, 6, '#fff700');
      p.rect(126, 72, 20, 26, '#222222');
      for (let i = 0; i < 3; i++) p.rect(128 + i * 6, 76, 4, 8, ['#ffea00', '#00e5ff', '#ff4081'][i], { outline: false });
      if (v.fountain) {
        p.rect(24, 86, 18, 28, '#c0c0c0');
        p.rect(20, 82, 26, 6, '#e0e0e0');
        if (v.act >= 3) p.text('OUT OF ORDER', 33, 77, 3.5, '#e8202a');
      }
      p.rect(0, 112, 320, 68, '#ffd6ec');
      for (let x = 0; x < 320; x += 24) p.rect(x, 112, 12, 68, '#ffc1e1', { outline: false, gloss: false });
    },
    office(p, v) {
      p.sky('#d5ccb6', '#c8bea6', 114);
      p.rect(14, 22, 72, 56, '#b9d3e0');
      for (let y = 26; y < 78; y += 5) p.line(14, y, 86, y, '#ece6d6', 1.2);
      p.rect(132, 20, 34, 42, '#8a6a3a');
      p.rect(137, 25, 24, 32, '#e8dcc0', { outline: false });
      p.circle(149, 37, 6, '#d9b38c');
      p.text(v.act >= 4 ? 'HEADTEACHER' : 'VICE-PRINCIPAL', 149, 68, 4.5, '#3a2a1a');
      wallClock(p, 205, 28, 9, v.minute);
      p.rect(0, 58, 22, 56, '#8c8c8c');
      p.line(2, 86, 20, 86, '#5c5c5c', 0.8);
      p.line(2, 104, 20, 104, '#5c5c5c', 0.8);
      p.rect(236, 80, 84, 34, '#6b4a2b');
      p.rect(262, 72, 22, 8, '#e8e0cc');
      p.rect(0, 112, 320, 68, '#6c6455');
    },
    assembly(p, v) {
      p.sky('#c9b99a', '#b5a582', 96);
      p.poly([0, 0, 40, 0, 52, 96, 0, 96], '#8e1b1b');
      p.poly([320, 0, 280, 0, 268, 96, 320, 96], '#8e1b1b');
      p.rect(30, 84, 260, 14, '#7a5230');
      p.rect(246, 58, 22, 26, '#5a3a1a');
      p.rect(0, 98, 320, 82, '#6d5a40');
    },
    gates(p, v) {
      p.sky('#7a8590', '#a9b2ba');
      p.rect(0, 64, 320, 50, '#5d6b5a');
      p.rect(80, 26, 160, 50, '#6e6258');
      for (let i = 0; i < 5; i++) p.rect(90 + i * 30, 38, 18, 14, '#9aa5ad');
      if (v.ambientPlay) {
        const cols = ['#d9d9d9', '#5a6fd6', '#c62828', '#2ecc71'];
        for (let i = 0; i < 5; i++) {
          figure(p, { x: 120 + i * 26, y: 98, s: 0.5, skin: ['#f3d2b3', '#c68e5f', '#8d5a3b'][i % 3], shirt: cols[i % 4], trousers: '#555', hair: '#3a2a1a', hairStyle: 'short', mood: 'happy', jump: true, frozen: v.frozen });
        }
      }
      p.rect(0, 112, 320, 68, '#4a4f55');
      p.rect(60, 46, 18, 68, '#7a4a3a');
      p.rect(242, 46, 18, 68, '#7a4a3a');
      p.rect(56, 42, 26, 6, '#5a3a2a');
      p.rect(238, 42, 26, 6, '#5a3a2a');
      p.text(v.schoolName, 69, 60, 3, '#e0e0e0');
      for (let x = 82; x < 240; x += 7) p.line(x, 52, x, 112, '#1c1f22', 1.2);
      p.line(78, 56, 242, 56, '#1c1f22', 1.6);
      p.line(78, 106, 242, 106, '#1c1f22', 1.6);
      p.rect(0, 100, 60, 14, '#7a6a5a');
      p.rect(262, 100, 58, 14, '#7a6a5a');
    },
  };

  // Gary. Drawn with the Painter so he works in every art style.
  function pigeon(p, f) {
    const s = (f.s || 1) * 1.1, x = f.x, y = f.y != null ? f.y : GROUND;
    const bob = f.frozen ? 0 : Math.abs(Math.sin(p.t * 3 + x)) * 1.2;
    const grey = '#8b93a1', dark = '#4f5763';
    p.line(x - 2 * s, y - 4 * s, x - 2.5 * s, y, '#e08a3a', 0.8);
    p.line(x + 1.5 * s, y - 4 * s, x + 1.8 * s, y, '#e08a3a', 0.8);
    p.poly([x - 9 * s, y - 9 * s, x - 4 * s, y - 12 * s - bob * 0.3, x + 5 * s, y - 11 * s, x + 7 * s, y - 6 * s, x + 2 * s, y - 3.5 * s, x - 6 * s, y - 5 * s], grey);
    p.poly([x - 6 * s, y - 10 * s, x + 2 * s, y - 10.5 * s, x + 1 * s, y - 6.5 * s, x - 5 * s, y - 6.5 * s], dark, { outline: false });
    p.circle(x + 6 * s, y - 14 * s - bob, 3.3 * s, grey);
    p.poly([x + 4 * s, y - 12.5 * s - bob, x + 8.5 * s, y - 12.5 * s - bob, x + 7.5 * s, y - 9.5 * s, x + 4.5 * s, y - 9.5 * s], '#5a8a7a', { outline: false });
    p.poly([x + 9 * s, y - 14.6 * s - bob, x + 11.5 * s, y - 13.8 * s - bob, x + 9 * s, y - 13.2 * s - bob], '#e0a040', { outline: false });
    p.circle(x + 7 * s, y - 14.8 * s - bob, 0.7 * s, '#ff7a1a', { outline: false });
    if (f.tie) p.poly([x + 5.5 * s, y - 10 * s, x + 6.5 * s, y - 10 * s, x + 6.3 * s, y - 6.5 * s, x + 5.7 * s, y - 6.5 * s], '#c0392b', { outline: false });
  }

  function crowd(p, v) {
      const r = rng(77);
      const cols = ['#1d1410', '#6b4a2b', '#e7bf62', '#c4552b', '#3a2a1a'];
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 18; i++) {
          const x = 8 + i * 18 + (row % 2) * 9 + (r() - 0.5) * 4;
          const y = 104 + row * 8;
          const bobble = v.frozen ? 0 : Math.sin(p.t * 2 + i + row) * 0.4;
          p.circle(x, y + bobble, 5, ['#f3d2b3', '#c68e5f', '#8d5a3b', '#e8b88f'][(i + row) % 4], { outline: p.st !== 'real' });
          p.poly([x - 5, y - 1 + bobble, x - 4, y - 5 + bobble, x + 4, y - 5 + bobble, x + 5, y - 1 + bobble], cols[(i * 3 + row) % 5], { outline: false });
        }
      }
  }

  function ambientKids(p, v) {
    if (!v.ambient) return;
    const r = rng(v.act * 31 + 5);
    const n = Math.round(2 + (v.happy / 100) * 4);
    const cols = v.act === 1 ? ['#d9d9d9'] : v.act === 2 ? ['#1f2f6b'] : ['#2c2c2c', '#ff2e88'];
    for (let i = 0; i < n; i++) {
      const x = 20 + r() * 210;
      figure(p, {
        x, y: 108, s: 0.6,
        skin: ['#f3d2b3', '#c68e5f', '#8d5a3b', '#e8b88f'][i % 4],
        shirt: cols[i % cols.length], trousers: '#555', hair: ['#1d1410', '#e7bf62', '#c4552b'][i % 3],
        hairStyle: ['mop', 'short', 'pony'][i % 3], mood: v.happy > 40 ? 'happy' : 'sad',
        jump: v.happy > 55, frozen: v.frozen,
      });
    }
  }

  /* ---------------- frame compositing ---------------- */
  let canvas, ctx, sceneC, sceneG, lowC, lowG, prevC, prevG, paper;
  const grain = [];
  let view = { style: 'crayon', bg: 'playground', cast: [], act: 1, minute: 600, happy: 100 };
  let lastSceneT = -1, sceneSeed = 1, fade = 0, staticFlash = 0, sceneDirty = true;
  let cropX = 0; // left edge of the camera window, in canvas pixels (portrait phones see a 4:3 crop)
  const drops = [];
  const styles = (T.styles = T.styles || {}); // per-style modules (render-ad.js, render-real.js)

  function makePaper() {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#f8f2e2';
    g.fillRect(0, 0, W, H);
    const r = rng(9);
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = `rgba(120,100,70,${r() * 0.08})`;
      g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
    }
    g.strokeStyle = 'rgba(120,150,200,0.12)';
    g.lineWidth = 2;
    for (let y = 40; y < H; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    return c;
  }
  function makeGrain() {
    for (let n = 0; n < 4; n++) {
      const c = document.createElement('canvas');
      c.width = 320; c.height = 180;
      const g = c.getContext('2d');
      const img = g.createImageData(320, 180);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 26;
      }
      g.putImageData(img, 0, 0);
      grain.push(c);
    }
  }

  function init(c) {
    canvas = c;
    ctx = c.getContext('2d');
    const mk = (w, h) => { const cc = document.createElement('canvas'); cc.width = w; cc.height = h; return cc; };
    sceneC = mk(W, H); sceneG = sceneC.getContext('2d');
    prevC = mk(W, H); prevG = prevC.getContext('2d');
    lowC = mk(VW, VH); lowG = lowC.getContext('2d');
    paper = makePaper();
    makeGrain();
    for (let i = 0; i < 220; i++) drops.push({ x: Math.random() * W, y: Math.random() * H, v: 0.7 + Math.random() * 0.6 });
  }

  // The camera window matches the shape of the stage on screen: narrow stages (phones in
  // portrait) see the middle of the 16:9 scene, where the people are, instead of a tiny letterboxed picture.
  function setViewport(aspect) {
    const w = Math.round(Math.max(800, Math.min(W, H * (aspect || 16 / 9))));
    cropX = Math.round((W - w) / 2);
    if (canvas.width !== w) { canvas.width = w; canvas.height = H; sceneDirty = true; }
  }

  function setView(v, opts = {}) {
    const styleChanged = v.style && v.style !== view.style;
    if ((styleChanged || opts.fade) && canvas) {
      prevG.clearRect(0, 0, W, H);
      prevG.drawImage(canvas, 0, 0);
      fade = 1;
    }
    if (opts.glitch) staticFlash = 1;
    view = Object.assign({}, view, v);
    sceneDirty = true;
  }

  function drawScene(t) {
    const st = view.style;
    const mod = styles[st];
    const pixel = st === 'pixel';
    const g = pixel ? lowG : sceneG;
    if (st === 'crayon' && !view.frozen) sceneSeed = Math.floor(t * 8);
    const p = new Painter(g, st, st === 'crayon' ? sceneSeed : 3, view.frozen ? view.frozenT || t : t);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    if (st === 'crayon') g.drawImage(paper, 0, 0);
    else g.clearRect(0, 0, pixel ? VW : W, pixel ? VH : H);

    if (mod && mod.bg) mod.bg(p, view);
    else (BG[view.bg] || BG.playground)(p, view);
    if (!mod) ambientKids(p, view);

    const cast = view.cast || [];
    const fig = (mod && mod.figure) || figure;
    const lay = mod && mod.layout ? mod.layout(view) : {};
    const tuckX = lay.tuckX || 100;
    const positions = lay.positions || (cast.length > 1 ? [184, 232] : [206]);
    const onStage = view.bg === 'assembly' && !mod;
    const fy = lay.y || (onStage ? 96 : GROUND);
    const fs = lay.scale || (onStage ? FIG * 0.85 : FIG);
    const one = (f) => (f.pigeon ? pigeon(p, f) : fig(p, f));
    const drawCast = () => {
      if (!view.noTuck && view.tuck) fig(p, Object.assign({}, view.tuck, { x: tuckX, y: fy, s: (view.tuck.s || 1) * fs, frozen: view.frozen, isTuck: true }));
      cast.forEach((f, i) => {
        const x = view.noTuck ? (i === 0 ? 110 : 216) : positions[i] || 220;
        one(Object.assign({}, f, { x, y: fy, s: (f.s || 1) * fs, frozen: view.frozen }));
      });
    };
    if (mod && mod.beforeCast) mod.beforeCast(p, view, drawCast);
    drawCast();
    if (onStage) crowd(p, view);
    if (mod && mod.fg) mod.fg(p, view);

    if (pixel) {
      sceneG.setTransform(1, 0, 0, 1, 0, 0);
      sceneG.imageSmoothingEnabled = false;
      sceneG.drawImage(lowC, 0, 0, W, H);
      sceneG.fillStyle = 'rgba(0,0,0,0.08)';
      for (let y = 0; y < H; y += 4) sceneG.fillRect(0, y, W, 1);
    }
  }

  function drawRain(dt, cw) {
    const st = view.style;
    const heavy = st === 'real' ? 1 : 0.7;
    const n = Math.floor(drops.length * heavy);
    ctx.save();
    if (st === 'pixel') ctx.fillStyle = '#9fd0ff';
    else ctx.strokeStyle = st === 'real' ? 'rgba(190,205,215,0.22)' : st === 'crayon' ? 'rgba(60,110,220,0.7)' : 'rgba(255,255,255,0.8)';
    ctx.lineWidth = st === 'crayon' ? 3 : st === 'real' ? 1.2 : 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const d = drops[i];
      d.y += d.v * dt * 900;
      d.x -= d.v * dt * 120;
      if (d.y > H) { d.y = -20; d.x = Math.random() * (cw + 200); }
      if (st === 'pixel') ctx.fillRect(Math.round(d.x / 4) * 4, Math.round(d.y / 4) * 4, 4, 12);
      else { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 5, d.y + 26); }
    }
    if (st !== 'pixel') ctx.stroke();
    ctx.restore();
  }

  // Desaturate whatever is on the main canvas (works without ctx.filter, which iOS Safari lacks).
  function desaturate(amount, cw) {
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.globalAlpha = amount;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, cw, H);
    ctx.restore();
  }

  let lastT = 0;
  function frame(tMs) {
    const t = tMs / 1000;
    const dt = Math.min(0.1, t - (lastT || t));
    lastT = t;
    if (!ctx) return;
    const cw = canvas.width;
    const mod = styles[view.style];
    const fps = view.style === 'crayon' ? 8 : 12;
    if (sceneDirty || (!view.frozen && t - lastSceneT > 1 / fps)) {
      drawScene(t);
      lastSceneT = t;
      sceneDirty = false;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(sceneC, cropX, 0, cw, H, 0, 0, cw, H);
    if (mod && mod.post) mod.post(ctx, cw, H, t, view, dt, grain);
    if ((view.rain || view.frozen || view.style === 'real') && !(mod && mod.noRain && mod.noRain(view))) drawRain(dt, cw);
    if (view.frozen) {
      desaturate(view.final ? 1 : 0.8, cw);
      ctx.fillStyle = view.final ? 'rgba(10,10,14,0.2)' : 'rgba(40,60,90,0.2)';
      ctx.fillRect(0, 0, cw, H);
    }
    if (mod && mod.postTop) mod.postTop(ctx, cw, H, t, view, dt, grain);
    if (fade > 0) {
      ctx.globalAlpha = fade;
      ctx.drawImage(prevC, 0, 0);
      ctx.globalAlpha = 1;
      fade = Math.max(0, fade - dt / 1.4);
    }
    if (staticFlash > 0) {
      ctx.globalAlpha = Math.min(1, staticFlash * 1.5);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(grain[Math.floor(Math.random() * grain.length)], 0, 0, cw, H);
      ctx.fillStyle = `rgba(255,255,255,${staticFlash * 0.25})`;
      ctx.fillRect(0, Math.random() * H, cw, 30 + Math.random() * 80);
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = true;
      staticFlash = Math.max(0, staticFlash - dt / 0.9);
    }
  }

  // Shared toolkit for the style modules.
  T.kit = { Painter, rng, hex, mix, mapColor, figure, wallClock, HAIR, VW, VH, W, H, K, GROUND, FIG };
  T.render = { init, setView, setViewport, frame, get view() { return view; } };
})();
