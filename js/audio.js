/*
 * TUCK — synthesised audio (WebAudio, no asset files).
 * Arcade fanfares for exploitation, rain for stagnation, a drone for the end.
 */
(function () {
  const T = (window.Tuck = window.Tuck || {});
  let ac = null, master = null, rain = null, drone = null, muted = false;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.6;
    master.connect(ac.destination);
  }

  function tone(freq, start, dur, type = 'square', vol = 0.12) {
    if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t0 = ac.currentTime + start;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function fanfare(style) {
    if (!ac) return;
    if (style === 'real') { tone(N(45), 0, 1.2, 'sine', 0.08); return; }
    if (style === 'flat') {
      // a soft corporate marimba: the sound of a notification you didn't ask for
      [72, 79, 76, 84].forEach((n, i) => tone(N(n), i * 0.09, 0.28, 'sine', 0.09));
      return;
    }
    const type = style === 'crayon' ? 'triangle' : 'square';
    const seq = [72, 76, 79, 84, 79, 84];
    seq.forEach((n, i) => tone(N(n), i * 0.075, i === seq.length - 1 ? 0.45 : 0.12, type, 0.1));
    tone(N(96), 0.45, 0.25, 'sine', 0.05);
  }

  function coin() { tone(N(88), 0, 0.06, 'square', 0.05); tone(N(93), 0.06, 0.12, 'square', 0.05); }
  function click() { tone(N(70), 0, 0.04, 'triangle', 0.05); }
  function tick() { tone(1800, 0, 0.03, 'square', 0.03); }
  function thud() { tone(N(36), 0, 0.5, 'sine', 0.2); tone(N(37), 0, 0.5, 'sine', 0.1); }

  function noiseBuffer() {
    const len = ac.sampleRate * 2;
    const b = ac.createBuffer(1, len, ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  function rainOn(level = 0.25) {
    if (!ac) return;
    if (rain) { rain.g.gain.linearRampToValueAtTime(level, ac.currentTime + 0.5); return; }
    const src = ac.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1400;
    const g = ac.createGain();
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(level, ac.currentTime + 1);
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
    rain = { src, g };
  }
  function rainOff() {
    if (!rain || !ac) return;
    const r = rain;
    rain = null;
    r.g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.6);
    r.src.stop(ac.currentTime + 0.7);
  }

  function droneOn() {
    if (!ac || drone) return;
    const g = ac.createGain();
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.035, ac.currentTime + 3);
    const o1 = ac.createOscillator(), o2 = ac.createOscillator();
    o1.type = o2.type = 'sine';
    o1.frequency.value = 2600;
    o2.frequency.value = 2607;
    o1.connect(g); o2.connect(g); g.connect(master);
    o1.start(); o2.start();
    drone = { g, o: [o1, o2] };
  }
  function droneOff() {
    if (!drone || !ac) return;
    const d = drone;
    drone = null;
    d.g.gain.cancelScheduledValues(ac.currentTime);
    d.g.gain.setValueAtTime(0, ac.currentTime);
    d.o.forEach((o) => o.stop(ac.currentTime + 0.05));
  }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.value = m ? 0 : 0.6;
  }

  T.audio = { init, fanfare, coin, click, tick, thud, rainOn, rainOff, droneOn, droneOff, setMuted, get muted() { return muted; } };
})();
