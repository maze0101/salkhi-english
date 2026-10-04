/* Салхи: нүүрний hero анимаци (canvas). index.html дотор window.salkhiHero = initSalkhiHero(...) гэж эхэлнэ. */
/**
 * Салхи hero animation
 * Ашиглах: initSalkhiHero(document.getElementById('salkhiHero'), { title, lines })
 * Буцаах утга: { gust(), destroy() }
 */
function initSalkhiHero(root, opts = {}) {
  const TITLE = opts.title || 'Салхи';
  const LINES = opts.lines || [
    'Англи, япон, солонгос, хятад,',
    'орос, герман хэлний үг, дүрэм, яриа'
  ];
  const FONT = opts.font || '-apple-system, system-ui, "Segoe UI", Roboto, sans-serif';

  const cv = root.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1;
  let P = [], stars = [], flows = [];
  let t = 0, g = 0, sweep = -200, auto = 4;
  let ph = 0, ang1 = 0, ang2 = 1;
  let running = true, visible = true, raf = 0;
  const kite = { x: 0, y: 0, vx: 0, vy: 0, init: false };

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    if (!W || !H) return;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Гарчгийг цэгүүд болгож задлах
    const o = document.createElement('canvas');
    o.width = W; o.height = H;
    const oc = o.getContext('2d');
    const fs = Math.min(84, W * 0.2);
    oc.font = `800 ${fs}px ${FONT}`;
    oc.fillStyle = '#fff';
    oc.textBaseline = 'middle';
    oc.fillText(TITLE, 24, H * 0.3);
    const d = oc.getImageData(0, 0, W, H).data;
    P = [];
    const step = 3;
    for (let y = 0; y < H; y += step)
      for (let x = 0; x < W; x += step)
        if (d[(y * W + x) * 4 + 3] > 128)
          P.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, c: Math.random() });

    stars = [];
    for (let i = 0; i < 16; i++)
      stars.push({ x: Math.random() * W, y: 10 + Math.random() * H * 0.5, r: 0.8 + Math.random() * 1.3, p: Math.random() * 6 });

    flows = [];
    for (let i = 0; i < 22; i++)
      flows.push({ x: Math.random() * W, y: H * 0.1 + Math.random() * H * 0.6, l: 30 + Math.random() * 70, s: 0.5 + Math.random() * 1.2, a: 0.07 + Math.random() * 0.15 });

    kite.init = false;
  }

  function gust() { g = 1; sweep = -60; }

  function turbine(x, base, h, sc, ang) {
    ctx.strokeStyle = '#8E9BA3'; ctx.lineWidth = 2.5 * sc; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base - h); ctx.stroke();
    ctx.save(); ctx.translate(x, base - h); ctx.rotate(ang);
    ctx.fillStyle = '#B4C0C6';
    for (let i = 0; i < 3; i++) {
      ctx.rotate(2.094);
      ctx.beginPath(); ctx.moveTo(-2 * sc, 0); ctx.lineTo(0, -40 * sc); ctx.lineTo(3 * sc, -6 * sc); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#DDE4E7'; ctx.beginPath(); ctx.arc(0, 0, 3 * sc, 0, 6.28); ctx.fill();
    ctx.restore();
  }

  function hill(y, amp, len, sp, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6)
      ctx.lineTo(x, y + Math.sin(x / len + ph * sp) * amp + Math.sin(x / (len * 0.45) - ph * sp * 0.6) * amp * 0.4);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }

  function drawKite(k) {
    const ax = W * 0.52, ay = H * 0.78;
    if (!kite.init) { kite.x = W * 0.68; kite.y = H * 0.3; kite.init = true; }
    const tx = W * 0.66 + Math.sin(t * 0.8) * 10 + g * 40;
    const ty = H * 0.32 + Math.sin(t * 1.3) * 8 - g * 30;
    kite.vx += (tx - kite.x) * 0.02; kite.vy += (ty - kite.y) * 0.02;
    kite.vx *= 0.9; kite.vy *= 0.9;
    kite.x += kite.vx; kite.y += kite.vy;

    // Утас
    ctx.strokeStyle = 'rgba(230,235,235,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo((ax + kite.x) / 2 - 10, (ay + kite.y) / 2 + 30, kite.x, kite.y + 14); ctx.stroke();

    // Сүүл
    ctx.strokeStyle = '#F0997B'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(kite.x, kite.y + 18);
    for (let i = 1; i <= 6; i++)
      ctx.lineTo(kite.x - i * 7 * (0.6 + k), kite.y + 18 + i * 4 + Math.sin(t * 6 - i) * 4 * (0.5 + k));
    ctx.stroke();
    for (let i = 1; i <= 3; i++) {
      const bx = kite.x - i * 14 * (0.6 + k);
      const by = kite.y + 18 + i * 8 + Math.sin(t * 6 - i * 2) * 4 * (0.5 + k);
      ctx.fillStyle = i % 2 ? '#FAC775' : '#5DCAA5';
      ctx.beginPath(); ctx.moveTo(bx - 4, by - 3); ctx.lineTo(bx + 4, by + 3); ctx.lineTo(bx + 4, by - 3); ctx.lineTo(bx - 4, by + 3); ctx.fill();
    }

    // Биe + нүүр
    ctx.save(); ctx.translate(kite.x, kite.y);
    ctx.rotate(Math.sin(t * 1.7) * 0.12 + kite.vx * 0.03);
    ctx.fillStyle = '#D85A30'; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(12, 0); ctx.lineTo(0, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F0997B'; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(-12, 0); ctx.lineTo(0, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4A1B0C'; ctx.beginPath(); ctx.arc(-4, -2, 1.6, 0, 6.28); ctx.arc(4, -2, 1.6, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#4A1B0C'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 3, 3, 0.3, 2.84); ctx.stroke();
    ctx.restore();
  }

  function frame() {
    if (!running || !visible) { raf = 0; return; }
    const dt = reduceMotion ? 0.004 : 0.016;
    t += dt;

    auto -= dt;
    if (auto <= 0) { gust(); auto = 5 + Math.random() * 3; }
    g *= 0.985;
    const k = 0.25 + g * 0.75;
    ph += dt * (1 + g * 3);
    ang1 += dt * (1.2 + g * 6);
    ang2 += dt * (1.5 + g * 6);
    if (sweep > -100) { sweep += 6 + g * 4; if (sweep > W + 100) sweep = -200; }

    // Тэнгэр
    ctx.fillStyle = '#132226'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#18303A'; ctx.fillRect(0, H * 0.5, W, H);

    // Сар
    const mx = W * 0.56, my = H * 0.16;
    ctx.fillStyle = 'rgba(255,255,255,0.045)'; ctx.beginPath(); ctx.arc(mx, my, 48, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#E9E4D4'; ctx.beginPath(); ctx.arc(mx, my, 18, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#132226'; ctx.beginPath(); ctx.arc(mx + 8, my - 5, 16, 0, 6.28); ctx.fill();

    // Од
    for (const s of stars) {
      s.x += 0.1 + g * 0.8; if (s.x > W + 3) s.x = -3;
      ctx.fillStyle = `rgba(210,225,225,${0.3 + 0.35 * Math.sin(t * 2 + s.p)})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
    }

    // Салхины урсгал
    ctx.lineCap = 'round';
    for (const f of flows) {
      f.x += f.s * (1 + g * 4);
      if (f.x - f.l > W) { f.x = -10; f.y = H * 0.1 + Math.random() * H * 0.6; }
      const yy = f.y + Math.sin(f.x / 60 + t) * 5;
      ctx.strokeStyle = `rgba(150,215,205,${f.a * (1 + g)})`; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(f.x - f.l, yy); ctx.quadraticCurveTo(f.x - f.l / 2, yy - 5, f.x, yy); ctx.stroke();
    }

    turbine(W * 0.8, H * 0.8, 118, 1, ang1);
    turbine(W * 0.93, H * 0.8, 96, 0.8, ang2);
    drawKite(k);

    hill(H * 0.74, 7, 70, 0.5, '#3E5E63');
    hill(H * 0.82, 6, 55, 0.8, '#557A7E');
    hill(H * 0.90, 5, 45, 1.1, '#6E9294');

    // Цэгэн гарчиг
    for (const p of P) {
      if (sweep > -100) {
        const dx = p.hx - sweep;
        if (dx > -50 && dx < 10) { p.vx += 0.5 + Math.random() * g * 1.8; p.vy += (Math.random() - 0.6) * g * 1.2; }
      }
      p.vx += (p.hx - p.x) * 0.03 + Math.sin(t * 2 + p.hy * 0.05) * 0.015;
      p.vy += (p.hy - p.y) * 0.03;
      p.vx *= 0.87; p.vy *= 0.87;
      p.x += p.vx; p.y += p.vy;
      const sp = Math.min(1, Math.abs(p.vx) + Math.abs(p.vy));
      ctx.fillStyle = sp > 0.3 ? '#9FE1CB' : (p.c > 0.9 ? '#CFEDE4' : '#F4F8F7');
      ctx.fillRect(p.x, p.y, 2.2, 2.2);
    }

    // Тайлбар: доод толгод дээр
    ctx.font = `500 14px ${FONT}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(10,30,32,0.55)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 1;
    LINES.forEach((line, i) => ctx.fillText(line, 24, H - 20 - (LINES.length - 1 - i) * 20));
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && running && visible) raf = requestAnimationFrame(frame); }

  // Дэлгэц дээр дарвал салхи
  const onDown = () => gust();
  cv.addEventListener('pointerdown', onDown);

  // Хэмжээ өөрчлөгдөхөд дахин бүтээх
  const ro = new ResizeObserver(() => build());
  ro.observe(cv);

  // Харагдахгүй үед зогсоох (батарей хэмнэх)
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); });
  io.observe(root);
  const onVis = () => { running = !document.hidden; start(); };
  document.addEventListener('visibilitychange', onVis);

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { build(); start(); });

  return {
    gust,
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      cv.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVis);
    }
  };
}
