/* Салхи: нүүрний hero анимаци (canvas). index.html дотор window.salkhiHero = initSalkhiHero(...) гэж эхэлнэ. */
/**
 * Салхи hero animation
 * Ашиглах: initSalkhiHero(document.getElementById('salkhiHero'))
 * Буцаах утга: { gust(), setWeather(d), destroy() }
 */
function initSalkhiHero(root) {
  const cv = root.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1;
  let stars = [], flows = [];
  let t = 0, g = 0, sweep = -200, auto = 4;
  let ph = 0, ang1 = 0, ang2 = 1;
  let capY = 34, moonX = 0;
  let wx = null, flash = 0, clouds = [], drops = [];
  let running = true, visible = true, raf = 0;
  const kite = { x: 0, y: 0, vx: 0, vy: 0, init: false };
  const kid = { mid: 0, amp: 0, x: 0, hx: 0, hy: 0, w: 0 };
  const logoEl = root.querySelector('.brand img');
  const logoImg = new Image();
  let LP = [], LPC = [];

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    if (!W || !H) return;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Нар/сар зүүн дээд буланд, дээд товчны мөрийн (цаг агаар, theme…) доор
    const ov = root.querySelector('.salkhi-hero__overlay');
    capY = (ov ? parseFloat(getComputedStyle(ov).paddingTop) || 0 : 0) + 76;
    moonX = Math.max(56, W * 0.12);

    stars = [];
    for (let i = 0; i < 16; i++)
      stars.push({ x: Math.random() * W, y: 10 + Math.random() * H * 0.5, r: 0.8 + Math.random() * 1.3, p: Math.random() * 6 });

    flows = [];
    for (let i = 0; i < 22; i++)
      flows.push({ x: Math.random() * W, y: H * 0.1 + Math.random() * H * 0.6, l: 30 + Math.random() * 70, s: 0.5 + Math.random() * 1.2, a: 0.07 + Math.random() * 0.15 });

    clouds = [];
    for (let i = 0; i < 4; i++)
      clouds.push({ x: Math.random() * W, y: H * (0.1 + i * 0.07), r: 0.7 + Math.random() * 0.6, s: 0.6 + Math.random() * 0.8 });
    drops = [];
    for (let i = 0; i < 90; i++)
      drops.push({ x: Math.random() * W, y: Math.random() * H, s: 0.7 + Math.random() * 0.6, p: Math.random() * 6 });

    const lr = buildLogo();

    // Хүүхэд логоны баруун талаас салхин тээрэм хүртэлх зайд алхана
    const x0 = (lr ? lr : 24 + Math.min(300, W * 0.62)) + 18, x1 = W * 0.74;
    kid.mid = (x0 + x1) / 2;
    kid.amp = Math.max(0, Math.min(120, (x1 - x0) / 2));

    kite.init = false;
  }

  /* Лого: .brand img-ийн яг байрлалд зургийн пикселээс цэгүүд үүсгэнэ (хуучин цэгэн гарчиг шиг салхинд тарна).
     HTML зураг байрлал, дэлгэц уншигчид үлдэнэ, харин ил тод болно. Буцаах утга: логоны баруун ирмэг. */
  function buildLogo() {
    LP = [];
    if (!logoEl || !logoImg.complete || !logoImg.naturalWidth) return 0;
    const r = logoEl.getBoundingClientRect(), c = cv.getBoundingClientRect();
    const lx = Math.round(r.left - c.left), ly = Math.round(r.top - c.top);
    const lw = Math.round(r.width), lh = Math.round(r.height);
    if (!lw || !lh) return 0;
    const o = document.createElement('canvas'); o.width = lw; o.height = lh;
    const oc = o.getContext('2d'); oc.drawImage(logoImg, 0, 0, lw, lh);
    let d; try { d = oc.getImageData(0, 0, lw, lh).data; } catch (e) { return 0; }
    const step = 2, cols = ['#F4F8F7', '#5AA9F0', '#2A7AD6'];
    for (let y = 0; y < lh; y += step)
      for (let x = 0; x < lw; x += step) {
        const i = (y * lw + x) * 4;
        if (d[i + 3] < 110) continue;
        const k = d[i + 2] - d[i] > 60 ? (d[i + 1] > 150 ? 1 : 2) : 0;
        LP.push({ hx: lx + x, hy: ly + y, x: lx + x, y: ly + y, vx: 0, vy: 0, k });
      }
    LP.sort((a, b) => a.k - b.k);
    LPC = cols;
    logoEl.style.opacity = '0';
    return lx + lw;
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

  function hillY(x, y, amp, len, sp) {
    return y + Math.sin(x / len + ph * sp) * amp + Math.sin(x / (len * 0.45) - ph * sp * 0.6) * amp * 0.4;
  }

  function hill(y, amp, len, sp, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) ctx.lineTo(x, hillY(x, y, amp, len, sp));
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }

  // Цаасан шувууны утас барьсан хүүхэд: зүүн тийш (шувуу руу) харж алхана
  function drawKid(dt) {
    kid.w += dt * (5 + g * 3);
    kid.x = kid.mid + Math.sin(t * 0.22) * kid.amp;
    const x = kid.x;
    const fy = hillY(x, H * 0.82, 6, 55, 0.8) + 1;
    const sw = Math.sin(kid.w), bob = Math.abs(Math.cos(kid.w)) * 1.2;
    const hip = fy - 13 - bob, sh = fy - 25 - bob, head = fy - 31 - bob;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // Хөл (гутал хар)
    ctx.strokeStyle = '#2B3A55'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, hip); ctx.lineTo(x + sw * 5, fy); ctx.moveTo(x, hip); ctx.lineTo(x - sw * 5, fy); ctx.stroke();
    ctx.fillStyle = '#1B1B1F';
    ctx.beginPath(); ctx.arc(x + sw * 5 - 1, fy, 2, 0, 6.28); ctx.arc(x - sw * 5 - 1, fy, 2, 0, 6.28); ctx.fill();

    // Сул гар (савлана)
    ctx.strokeStyle = '#F1C9A0'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x + 1, sh + 2); ctx.lineTo(x + 3 + sw * 3, sh + 11); ctx.stroke();

    // Дээл
    ctx.fillStyle = '#2F6FD8';
    ctx.beginPath(); ctx.moveTo(x - 4, sh); ctx.lineTo(x + 4, sh); ctx.lineTo(x + 6, hip + 3); ctx.lineTo(x - 6, hip + 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FAC775'; ctx.fillRect(x - 5, hip - 3, 10, 2); // бүс

    // Утас барьсан гар: шувуу руу өргөнө
    kid.hx = x - 8; kid.hy = sh - 8 + Math.sin(t * 1.3) * 1;
    ctx.strokeStyle = '#F1C9A0'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x - 2, sh + 1); ctx.lineTo(kid.hx, kid.hy); ctx.stroke();

    // Толгой + үс
    ctx.fillStyle = '#F1C9A0'; ctx.beginPath(); ctx.arc(x, head, 5, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#23180F'; ctx.beginPath(); ctx.arc(x, head - 1, 5.3, 3.3, 6.2); ctx.fill();
    ctx.fillStyle = '#23180F'; ctx.beginPath(); ctx.arc(x - 2.4, head + 0.5, 0.8, 0, 6.28); ctx.fill(); // нүд
  }

  function drawKite(k) {
    const ax = kid.hx, ay = kid.hy;
    const base = kid.x - Math.min(70, W * 0.12);
    if (!kite.init) { kite.x = base; kite.y = capY + 50; kite.init = true; }
    const tx = base + Math.sin(t * 0.8) * 10 + g * 40;
    const ty = capY + 52 + Math.sin(t * 1.3) * 8 - g * 30;
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

    // Бодит цаг агаар (setWeather): салхи хүчтэй бол урсгал, сэнс хурдан, шуурга ойр ойрхон
    const wf = wx ? Math.max(0.4, Math.min(2.5, wx.w / 5)) : 1;
    const day = !!(wx && wx.day), cl = wx ? wx.c : 0;
    const overcast = cl >= 3, cloudN = cl === 0 ? 0 : cl <= 2 ? 2 : 4;

    auto -= dt * wf;
    if (auto <= 0) { gust(); auto = 5 + Math.random() * 3; }
    g *= 0.985;
    const k = 0.25 + g * 0.75;
    ph += dt * (1 + g * 3) * (0.6 + wf * 0.4);
    ang1 += dt * (1.2 * wf + g * 6);
    ang2 += dt * (1.5 * wf + g * 6);
    if (sweep > -100) { sweep += 6 + g * 4; if (sweep > W + 100) sweep = -200; }

    // Тэнгэр: өдөр/шөнө, бүрхэг үед бүдэг
    const sky = day ? (overcast ? ['#6F8794', '#8FA5B0'] : ['#4F93C4', '#86BEDD']) : (overcast ? ['#1A2629', '#22333A'] : ['#132226', '#18303A']);
    ctx.fillStyle = sky[0]; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = sky[1]; ctx.fillRect(0, H * 0.5, W, H);

    const mx = moonX, my = capY + 2;
    if (day) {
      // Нар (бүрхэг үед үүлэн цаана бүдэг)
      ctx.globalAlpha = overcast ? 0.35 : 1;
      ctx.fillStyle = 'rgba(255,236,170,0.25)'; ctx.beginPath(); ctx.arc(mx, my, 34 + Math.sin(t * 1.5) * 2, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#FFD86B'; ctx.beginPath(); ctx.arc(mx, my, 18, 0, 6.28); ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      // Сар
      ctx.globalAlpha = overcast ? 0.4 : 1;
      ctx.fillStyle = 'rgba(255,255,255,0.045)'; ctx.beginPath(); ctx.arc(mx, my, 48, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#E9E4D4'; ctx.beginPath(); ctx.arc(mx, my, 18, 0, 6.28); ctx.fill();
      ctx.fillStyle = sky[0]; ctx.beginPath(); ctx.arc(mx + 8, my - 5, 16, 0, 6.28); ctx.fill();
      ctx.globalAlpha = 1;
      // Од (бүрхэг үед харагдахгүй)
      if (!overcast) for (const s of stars) {
        s.x += 0.1 * wf + g * 0.8; if (s.x > W + 3) s.x = -3;
        ctx.fillStyle = `rgba(210,225,225,${0.3 + 0.35 * Math.sin(t * 2 + s.p)})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
      }
    }

    // Үүл
    for (let i = 0; i < cloudN; i++) {
      const c = clouds[i];
      c.x += (0.15 + g * 0.6) * wf * c.s; if (c.x - 60 * c.r > W) c.x = -60 * c.r;
      ctx.fillStyle = day ? `rgba(255,255,255,${overcast ? 0.75 : 0.85})` : `rgba(150,170,175,${overcast ? 0.35 : 0.25})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 14 * c.r, 0, 6.28); ctx.arc(c.x + 16 * c.r, c.y - 8 * c.r, 17 * c.r, 0, 6.28);
      ctx.arc(c.x + 34 * c.r, c.y, 13 * c.r, 0, 6.28); ctx.rect(c.x, c.y, 34 * c.r, 13 * c.r);
      ctx.fill();
    }

    // Аянга: хааяа гялсхийнэ
    if (cl >= 95 && Math.random() < 0.004) flash = 1;
    if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash * 0.5})`; ctx.fillRect(0, 0, W, H); flash -= 0.08; }

    // Салхины урсгал
    ctx.lineCap = 'round';
    for (const f of flows) {
      f.x += f.s * (1 + g * 4) * wf;
      if (f.x - f.l > W) { f.x = -10; f.y = H * 0.1 + Math.random() * H * 0.6; }
      const yy = f.y + Math.sin(f.x / 60 + t) * 5;
      ctx.strokeStyle = `rgba(150,215,205,${f.a * (1 + g)})`; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(f.x - f.l, yy); ctx.quadraticCurveTo(f.x - f.l / 2, yy - 5, f.x, yy); ctx.stroke();
    }

    turbine(W * 0.8, H * 0.8, 118, 1, ang1);
    turbine(W * 0.93, H * 0.8, 96, 0.8, ang2);
    hill(H * 0.74, 7, 70, 0.5, '#3E5E63');
    hill(H * 0.82, 6, 55, 0.8, '#557A7E');
    drawKid(dt);
    drawKite(k);
    hill(H * 0.90, 5, 45, 1.1, '#6E9294');

    // Бороо / цас: салхины чиглэлд хазайж унана
    const kind = !wx ? 0 : (cl >= 71 && cl <= 77) || cl === 85 || cl === 86 ? 2 : (cl >= 51 && cl <= 67) || (cl >= 80 && cl <= 82) || cl >= 95 ? 1 : 0;
    if (kind) {
      const n = cl === 51 || cl === 71 || cl === 80 || cl === 85 ? 40 : drops.length;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = day ? 'rgba(235,245,255,0.7)' : 'rgba(180,205,215,0.55)';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < n; i++) {
        const p = drops[i];
        if (kind === 1) {
          p.y += 7 * p.s; p.x += (1 + g * 3) * wf;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - (1 + g * 3) * wf * 1.5, p.y - 9 * p.s); ctx.stroke();
        } else {
          p.y += 1.1 * p.s; p.x += (0.4 + g * 2) * wf + Math.sin(t * 2 + p.p) * 0.4;
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 + p.s, 0, 6.28); ctx.fill();
        }
        if (p.y > H) { p.y = -10; p.x = Math.random() * W; }
        if (p.x > W + 10) p.x = -10;
      }
    }

    // Манан
    if (cl >= 45 && cl <= 48) { ctx.fillStyle = day ? 'rgba(230,235,238,0.35)' : 'rgba(120,135,140,0.3)'; ctx.fillRect(0, H * 0.45, W, H); }

    // Цэгэн лого: салхины давалгаа (sweep) хүрэхэд тарж, буцаж нийлнэ; бодит салхи хүчтэй бол илүү ширүүн
    let lk = -1;
    for (const p of LP) {
      if (sweep > -100) {
        const dx = p.hx - sweep;
        if (dx > -50 && dx < 10) { p.vx += (0.5 + Math.random() * g * 1.8) * wf; p.vy += (Math.random() - 0.6) * g * 1.2 * wf; }
      }
      p.vx += (p.hx - p.x) * 0.03 + Math.sin(t * 2 + p.hy * 0.05) * 0.015 * wf;
      p.vy += (p.hy - p.y) * 0.03 + (kind === 2 ? Math.sin(t * 3 + p.hx * 0.1) * 0.01 : 0);
      p.vx *= 0.87; p.vy *= 0.87;
      p.x += p.vx; p.y += p.vy;
      if (p.k !== lk) { lk = p.k; ctx.fillStyle = LPC[lk]; }
      ctx.fillRect(p.x, p.y, 1.9, 1.9);
    }

    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && running && visible) raf = requestAnimationFrame(frame); }

  // Дэлгэц дээр дарвал салхи
  const onDown = () => gust();
  cv.addEventListener('pointerdown', onDown);

  // Хэмжээ өөрчлөгдөхөд дахин бүтээх
  const ro = new ResizeObserver(() => build());
  ro.observe(cv);
  if (logoEl) {
    ro.observe(logoEl);
    logoImg.onload = () => { if (W) build(); };
    logoImg.src = logoEl.currentSrc || logoEl.src;
  }

  // Харагдахгүй үед зогсоох (батарей хэмнэх)
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); });
  io.observe(root);
  const onVis = () => { running = !document.hidden; start(); };
  document.addEventListener('visibilitychange', onVis);

  const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  fontsReady.then(() => { build(); start(); });

  return {
    gust,
    // d: {t, c (WMO weather_code), day, w (м/с)} эсвэл null
    setWeather(d) { wx = d && typeof d.c === 'number' ? d : null; },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      cv.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVis);
    }
  };
}
