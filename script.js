document.getElementById('yr').textContent = new Date().getFullYear();

/* ── PRELOADER ── */
(function() {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('ldBar');
  const pct = document.getElementById('ldPct');
  const logoT = loader.querySelector('.ld-logo-t');
  const ldSkel = document.getElementById('ldSkel');

  // Stagger skeleton items into view
  if (ldSkel) {
    gsap.fromTo(ldSkel.querySelectorAll('.lsk'),
      { opacity: 0 },
      { opacity: 1, duration: .35, stagger: .035, ease: 'power2.out' }
    );
  }

  // Animate logo name up
  gsap.to(logoT, { y: '0%', duration: .9, ease: 'power3.out', delay: .2 });

  // Fake progress bar
  let p = 0, skelFaded = false;
  const iv = setInterval(() => {
    p += (100 - p) * 0.04 + 0.5;
    if (p > 99) p = 99;
    bar.style.width = p + '%';
    pct.textContent = Math.round(p) + '%';
    // Fade skeleton out at 65% — real content is about to appear
    if (p > 65 && !skelFaded && ldSkel) {
      skelFaded = true;
      gsap.to(ldSkel, { opacity: 0, duration: .55, ease: 'power2.inOut' });
    }
  }, 30);

  function exitLoader() {
    clearInterval(iv);
    bar.style.width = '100%';
    pct.textContent = '100%';
    if (ldSkel && !skelFaded) gsap.to(ldSkel, { opacity: 0, duration: .25 });
    gsap.to(loader, {
      yPercent: -100,
      duration: 0.78,
      delay: 0.3,
      ease: 'power3.inOut',
      onComplete: () => { loader.style.display = 'none'; }
    });
  }

  if (document.readyState === 'complete') {
    setTimeout(exitLoader, 600);
  } else {
    window.addEventListener('load', () => setTimeout(exitLoader, 300));
  }
})();

/* ── LENIS ── */
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ── CUSTOM CURSOR ── */
const cur = document.getElementById('cur');
let mx = -100, my = -100, cx = -100, cy = -100;
cur.style.opacity = '0';
let curMoved = false;
document.addEventListener('mousemove', e => { 
  mx = e.clientX; my = e.clientY; 
  if(!curMoved) { cur.style.opacity = '1'; cx = mx; cy = my; curMoved = true; }
});
(function animCur() {
  cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14;
  cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
  requestAnimationFrame(animCur);
})();
document.addEventListener('mouseleave', () => cur.classList.add('hide'));
document.addEventListener('mouseenter', () => cur.classList.remove('hide'));
document.querySelectorAll('a,button,[data-mag]').forEach(el => {
  el.addEventListener('mouseenter', () => { if (!cur.classList.contains('vw')) cur.classList.add('lg'); });
  el.addEventListener('mouseleave', () => cur.classList.remove('lg'));
});
// VIEW cursor on work cards
document.querySelectorAll('.wc').forEach(card => {
  card.addEventListener('mouseenter', () => { cur.classList.remove('lg'); cur.classList.add('vw'); });
  card.addEventListener('mouseleave', () => cur.classList.remove('vw'));
});

/* ── NAV SCROLL EFFECTS ── */
const nav = document.getElementById('nav');
const navProg = document.getElementById('navProg');
lenis.on('scroll', ({ progress }) => {
  nav.classList.toggle('sc', lenis.scroll > 60);
  navProg.style.width = (progress * 100) + '%';
});

/* ── SMOOTH ANCHOR SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -80, duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) }); }
  });
});

/* ── SPLIT TEXT (manual) ── */
function splitLines(el) {
  const text = el.innerHTML;
  // Split on <br> tags
  const parts = text.split(/<br\s*\/?>/i);
  el.innerHTML = parts.map(p =>
    `<span class="line-wrap"><span class="line-inner">${p}</span></span>`
  ).join('');
  return el.querySelectorAll('.line-inner');
}

function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="w-word">${w}</span>`).join(' ');
  return el.querySelectorAll('.w-word');
}

/* ── H2 SPLIT REVEAL ── */
document.querySelectorAll('[data-split-h2]').forEach(el => {
  const lines = splitLines(el);
  gsap.set(lines, { y: '108%' });
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    onEnter: () => {
      gsap.to(lines, {
        y: '0%',
        duration: 1.0,
        ease: 'expo.out',
        stagger: 0.13,
      });
    }
  });
});

/* ── SINGLE LINE REVEAL ── */
document.querySelectorAll('[data-split-line]').forEach(el => {
  // Wrap in line-wrap
  const orig = el.innerHTML;
  el.innerHTML = `<span class="line-wrap"><span class="line-inner">${orig}</span></span>`;
  const inner = el.querySelector('.line-inner');
  gsap.set(inner, { y: '105%' });
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    onEnter: () => {
      gsap.to(inner, { y: '0%', duration: .85, ease: 'power3.out' });
    }
  });
});

/* ── FADE UP (p tags next to split lines) ── */
document.querySelectorAll('.pb-p, .w-desc, .how-p').forEach((el, i) => {
  gsap.set(el, { opacity: 0, y: 16 });
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    onEnter: () => {
      gsap.to(el, { opacity: 1, y: 0, duration: .7, ease: 'power2.out', delay: .15 });
    }
  });
});

/* ── EYEBROW SCRAMBLE REVEAL ── */
const SC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#&';
function scrambleText(el, finalText, dur) {
  const frames = Math.round(dur * 60);
  let f = 0;
  (function run() {
    el.textContent = finalText.split('').map((ch, i) =>
      ch === ' ' ? ' ' : (f / frames > i / finalText.length
        ? ch
        : SC_CHARS[Math.floor(Math.random() * SC_CHARS.length)])
    ).join('');
    if (++f <= frames) requestAnimationFrame(run);
    else el.textContent = finalText;
  })();
}
document.querySelectorAll('[data-ey]').forEach(el => {
  const t = el.querySelector('.ey-t');
  if (!t) return;
  const orig = t.textContent;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    onEnter: () => { el.classList.add('visible'); scrambleText(t, orig, 0.85); }
  });
});

/* ── PROB IMAGE CLIP-PATH REVEAL + PARALLAX ── */
const probImg = document.getElementById('probImg');
if (probImg) {
  const pInner = probImg.querySelector('img');
  gsap.set(probImg, { clipPath: 'inset(0 0 100% 0 round .5rem)' });
  if (pInner) gsap.set(pInner, { scale: 1.14 });
  ScrollTrigger.create({
    trigger: probImg,
    start: 'top 85%',
    onEnter: () => {
      probImg.classList.add('in');
      gsap.to(probImg, { clipPath: 'inset(0 0 0% 0 round .5rem)', duration: 1.35, ease: 'power4.out' });
      if (pInner) gsap.to(pInner, { scale: 1, duration: 1.5, ease: 'power2.out' });
    }
  });
  gsap.to(probImg, {
    y: -40, ease: 'none',
    scrollTrigger: { trigger: probImg, start: 'top bottom', end: 'bottom top', scrub: true }
  });
}

/* ── WORDS REVEAL (staggered per word) ── */
const wordsEl = document.getElementById('wordsEl');
if (wordsEl) {
  const wds = splitWords(wordsEl);
  gsap.set(wds, { color: 'var(--nd)' });
  ScrollTrigger.create({
    trigger: wordsEl,
    start: 'top 75%',
    end: 'bottom 50%',
    scrub: .5,
    onUpdate: self => {
      const idx = Math.floor(self.progress * wds.length);
      wds.forEach((w, i) => w.classList.toggle('on', i <= idx));
    }
  });
}

/* ── WORK CARD REVEAL ── */
document.querySelectorAll('[data-work-card]').forEach(card => {
  const wm = card.querySelector('.wm');
  const wmImg = wm?.querySelector('img');
  // y:40 instead of 90 — less travel means the clip-path child recalculates
  // across a shorter range, eliminating the compositor stutter
  gsap.set(card, { opacity: 0, y: 40, force3D: true });
  if (wm) gsap.set(wm, { clipPath: 'inset(0 0 100% 0 round .75rem)' });
  if (wmImg) gsap.set(wmImg, { scale: 1.16, force3D: true });
  ScrollTrigger.create({
    trigger: card,
    start: 'top 88%',
    onEnter: () => {
      // Card settles into position first (force3D keeps it on GPU layer)
      gsap.to(card, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', force3D: true });
      // Clip-path starts after card is mostly in position to avoid jitter
      if (wm) gsap.to(wm, { clipPath: 'inset(0 0 0% 0 round .75rem)', duration: 1.15, ease: 'power4.out', delay: 0.28 });
      if (wmImg) gsap.to(wmImg, { scale: 1, duration: 1.5, ease: 'power2.out', delay: 0.28, force3D: true });
    }
  });
});

/* ── PROOF CARDS REVEAL ── */
const pcs = document.querySelectorAll('.pc');
if (pcs.length) {
  gsap.set(pcs, { opacity: 0, y: 50 });
  ScrollTrigger.create({
    trigger: pcs[0],
    start: 'top 88%',
    onEnter: () => {
      gsap.to(pcs, {
        opacity: 1, y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: { each: 0.1, from: 'start' }
      });
    }
  });
}

/* ── WHY CARDS ── */
const wys = document.querySelectorAll('.wy');
wys.forEach((wy, i) => {
  ScrollTrigger.create({
    trigger: wy,
    start: 'top 88%',
    onEnter: () => {
      setTimeout(() => wy.classList.add('in'), i * 80);
    }
  });
});

/* ── HOW STEPS ── */
document.querySelectorAll('.how-step').forEach((step, i) => {
  gsap.set(step, { opacity: 0, y: 40 });
  ScrollTrigger.create({
    trigger: step,
    start: 'top 85%',
    onEnter: () => {
      gsap.to(step, { opacity: 1, y: 0, duration: .85, ease: 'power3.out', delay: i * .12 });
    }
  });
});

/* ── CTA TEXT REVEAL ── */
const ctaEl = document.getElementById('ctaText');
if (ctaEl) {
  const ctaLines = splitLines(ctaEl);
  gsap.set(ctaLines, { y: '110%' });
  ScrollTrigger.create({
    trigger: ctaEl,
    start: 'top 80%',
    onEnter: () => {
      gsap.to(ctaLines, { y: '0%', duration: 1.1, ease: 'power4.out', stagger: .14 });
    }
  });
}

/* ── MARQUEE with scroll velocity ── */
const mqList = document.getElementById('mqList');
if (mqList) {
  // Clone for seamless loop
  const clone = mqList.cloneNode(true);
  mqList.parentNode.appendChild(clone);

  let mqX = 0, mqSpeed = 1, mqTarget = 1;
  const baseSpeed = 0.4; // px per frame

  lenis.on('scroll', ({ velocity }) => {
    mqTarget = baseSpeed + Math.abs(velocity) * 0.4;
  });

  let totalW = mqList.offsetWidth;
  window.addEventListener('resize', () => { totalW = mqList.offsetWidth; });
  (function mqAnim() {
    mqSpeed += (mqTarget - mqSpeed) * 0.06;
    mqTarget = Math.max(baseSpeed, mqTarget - 0.02);
    mqX -= mqSpeed;
    if (Math.abs(mqX) >= totalW) mqX = 0;
    mqList.style.transform = `translateX(${mqX}px)`;
    clone.style.transform = `translateX(${mqX}px)`;
    requestAnimationFrame(mqAnim);
  })();
}

/* ── MAGNETIC BUTTONS ── */
document.querySelectorAll('[data-mag]').forEach(btn => {
  const strength = 0.3;
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(btn, { x: x * strength, y: y * strength, duration: .4, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.5)' });
  });
});

/* ── TABS ── */
document.querySelectorAll('.fb').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.t;
    const panel = document.getElementById('tp' + t);
    
    document.querySelectorAll('.fb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    
    document.querySelectorAll('.tp').forEach(p => {
      if (p !== panel) {
        gsap.to(p, { opacity: 0, duration: .2, onComplete: () => p.classList.remove('on') });
      }
    });
    
    gsap.killTweensOf(panel);
    panel.classList.add('on');
    const fis = panel.querySelectorAll('.fi');
    gsap.set(fis, { opacity: 0, x: -10 });
    gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: .35 });
    gsap.to(fis, { opacity: 1, x: 0, duration: .45, ease: 'power2.out', stagger: .07, delay: .15 });
  });
});

/* ── ACCORDION ── */
document.querySelectorAll('.ab').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.ai');
    const open = item.classList.contains('on');
    document.querySelectorAll('.ai.on').forEach(i => i.classList.remove('on'));
    if (!open) item.classList.add('on');
  });
});

/* ── PAGE LOAD SEQUENCE ── */
window.addEventListener('load', () => {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const D = 0.85; // offset — content starts animating as loader lifts

  // Hero box opens from a slightly inset clip
  gsap.set('.hero-box', { clipPath: 'inset(4% round 3rem)' });
  tl.to('.hero-box', { clipPath: 'inset(0% round var(--r-xl))', duration: 1.6, ease: 'expo.out' }, D - 0.1);

  // Nav
  tl.fromTo('.nav-in', { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, D);

  // Badges
  gsap.set('#heroBadges', { y: 14, opacity: 0 });
  tl.to('#heroBadges', { opacity: 1, y: 0, duration: 0.65 }, D + 0.15);

  // Hero H1 lines
  const heroH1 = document.getElementById('heroH1');
  const h1Lines = splitLines(heroH1);
  gsap.set(h1Lines, { y: '110%' });
  tl.to(h1Lines, { y: '0%', duration: 1.1, stagger: 0.11 }, D + 0.2);

  // Sub text
  gsap.set('#heroSub', { y: 18, opacity: 0 });
  tl.to('#heroSub', { opacity: 1, y: 0, duration: 0.75 }, D + 0.55);

  // Buttons
  gsap.set('#heroBtns', { y: 14, opacity: 0 });
  tl.to('#heroBtns', { opacity: 1, y: 0, duration: 0.65 }, D + 0.72);

  // Gradient sphere
  tl.to('#heroGrad', { opacity: 1, duration: 1.4, ease: 'power2.out' }, D - 0.1);

  // Hero image slides in from right
  gsap.set('#heroImg', { x: 100, opacity: 0 });
  tl.to('#heroImg', { opacity: 1, x: 0, duration: 1.3, ease: 'power3.out' }, D + 0.1);

  // Marquee
  tl.to('#mqSec', { opacity: 1, duration: 0.7 }, D + 1.0);

  // Recalculate all ScrollTrigger positions now that images/fonts are loaded
  ScrollTrigger.refresh();
});

/* ── SECTION PARALLAX SUBTLE ── */
gsap.utils.toArray('.wc').forEach(card => {
  gsap.to(card, {
    y: -20,
    ease: 'none',
    scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
  });
});

/* ── WHY GRID SUBTLE STAGGER ON SCROLL ── */
gsap.utils.toArray('.wy-img img').forEach((img, i) => {
  gsap.to(img, {
    scale: 1.04,
    ease: 'none',
    scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
  });
});

/* ── WORK CARD 3D TILT ── */
document.querySelectorAll('.wc').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card, {
      rotateY: x * 3,
      rotateX: -y * 2,
      duration: .5,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: .7, ease: 'elastic.out(1,.6)' });
  });
});

/* ── INTRO BRIDGE BODY FADE ── */
const introBridgeBody = document.getElementById('introBridgeBody');
if (introBridgeBody) {
  ScrollTrigger.create({
    trigger: introBridgeBody,
    start: 'top 88%',
    onEnter: () => introBridgeBody.classList.add('in')
  });
}

/* ── STAT COUNTERS with staggered entrance ── */
const statItems = document.querySelectorAll('.stat-item');
if (statItems.length) {
  gsap.set(statItems, { opacity: 0, y: 55 });
  let statsStarted = false;
  ScrollTrigger.create({
    trigger: '.stats-row',
    start: 'top 85%',
    onEnter: () => {
      if (statsStarted) return;
      statsStarted = true;
      gsap.to(statItems, {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.12
      });
      statItems.forEach((item, i) => {
        const el = item.querySelector('.stat-val');
        if (!el) return;
        const target = parseInt(el.dataset.target, 10);
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          delay: i * 0.12,
          onUpdate: function() { el.textContent = Math.round(this.targets()[0].val); },
          onComplete: () => {
            item.classList.add('flash');
            setTimeout(() => item.classList.remove('flash'), 950);
          }
        });
      });
    }
  });
}

/* ── HERO PARALLAX ON SCROLL ── */
gsap.to('.hero-cnt', {
  y: -100,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
});
gsap.to('#heroImg', {
  y: -160,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
});
gsap.to('#mqSec', {
  y: -50,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
});

/* ── NAV LIGHT MODE when over light sections ── */
document.querySelectorAll('.lt').forEach(sec => {
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 80px',
    end: 'bottom 80px',
    onEnter: () => nav.classList.add('lt-mode'),
    onLeave: () => nav.classList.remove('lt-mode'),
    onEnterBack: () => nav.classList.add('lt-mode'),
    onLeaveBack: () => nav.classList.remove('lt-mode'),
  });
});

/* ── FLOATING BADGE DELAYED SHOW ── */
setTimeout(() => document.getElementById('floatBd')?.classList.add('show'), 2600);

/* ── NAV ACTIVE SECTION TRACKING ── */
{
  const secIds = ['hero', 'featured', 'about', 'activities', 'upcoming', 'work', 'reviews', 'contact'];
  const navAs = document.querySelectorAll('.nav-link[href^="#"]');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: () => {
      let active = '';
      secIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && lenis.scroll >= el.offsetTop - 200) active = id;
      });
      navAs.forEach(a => a.classList.toggle('act', !!active && a.getAttribute('href') === '#' + active));
    }
  });
}

/* ── HOW IMAGES CLIP-PATH REVEAL ── */
document.querySelectorAll('.how-img').forEach(wrap => {
  const img = wrap.querySelector('img');
  if (!img) return;
  gsap.set(wrap, { clipPath: 'inset(0 0 100% 0 round .5rem)' });
  gsap.set(img, { scale: 1.14 });
  ScrollTrigger.create({
    trigger: wrap.closest('.how-step') || wrap,
    start: 'top 86%',
    onEnter: () => {
      gsap.to(wrap, { clipPath: 'inset(0 0 0% 0 round .5rem)', duration: 1.2, ease: 'power4.out' });
      gsap.to(img, { scale: 1, duration: 1.4, ease: 'power2.out' });
    }
  });
});

/* ── PROCESS CIRCLE DRAW ── */
document.querySelectorAll('.how-num').forEach((num, i) => {
  const circle = num.querySelector('circle');
  if (!circle) return;
  const r = parseFloat(circle.getAttribute('r') || 18);
  const c = 2 * Math.PI * r;
  gsap.set(circle, { strokeDasharray: c, strokeDashoffset: c });
  ScrollTrigger.create({
    trigger: num,
    start: 'top 85%',
    onEnter: () => {
      gsap.to(circle, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out', delay: i * 0.2 });
    }
  });
});

/* ── SCROLL VELOCITY SKEW ON IMAGE CONTAINERS ── */
let _prevS = 0, _skew = 0;
const _skewEls = document.querySelectorAll('.wm, .how-img, .prob-img');
gsap.ticker.add(() => {
  const s = lenis?.scroll ?? 0;
  const delta = s - _prevS;
  _prevS = s;
  const target = Math.max(-4, Math.min(4, delta * -0.09));
  _skew += (target - _skew) * 0.1;
  if (Math.abs(_skew) > 0.008 || Math.abs(target) > 0.008) {
    _skewEls.forEach(el => gsap.set(el, { skewY: _skew }));
  }
});

/* ── HOW CONNECTOR LINE (scroll-scrubbed linear draw) ── */
const howConLine = document.getElementById('howConLine');
if (howConLine) {
  gsap.to(howConLine, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.how-nums',
      start: 'top 78%',
      end: 'top 22%',
      scrub: 1.2
    }
  });
}

/* ── VIDEO LAZY LOAD ON HOVER ── */
document.querySelectorAll('[data-lazy-video]').forEach(video => {
  const card = video.closest('.wc');
  if (!card) return;
  let loaded = false;
  card.addEventListener('mouseenter', () => {
    if (!loaded) {
      video.load();
      loaded = true;
    }
    video.play().catch(() => {});
    gsap.to(video, { opacity: 1, duration: 0.25 });
  });
  card.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
    gsap.to(video, { opacity: 0, duration: 0.25 });
  });
});

/* ── FOOTER ENTRANCE ── */
gsap.set('footer', { opacity: 0, y: 24 });
ScrollTrigger.create({
  trigger: 'footer',
  start: 'top 95%',
  onEnter: () => gsap.to('footer', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' })
});

/* ── SEPARATOR FUNNEL BARS (scroll-scrubbed grow/shrink) ── */
document.querySelectorAll('.sep-lines').forEach(container => {
  const bars = container.querySelectorAll('.sep-bar');
  if (!bars.length) return;
  const sep = container.closest('.sep');
  const isBtm = sep.classList.contains('btm');

  /* animate from the widest bar to the narrowest */
  gsap.fromTo(bars,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      stagger: { each: 0.05, from: isBtm ? 'start' : 'end' },
      scrollTrigger: {
        trigger: sep,
        start: 'top 80%',
        end:   'bottom 20%',
        scrub: 1.6
      }
    }
  );
});

/* ── REFRESH SCROLLTRIGGER ON LENIS ── */
lenis.on('scroll', ScrollTrigger.update);

/* ── HERO MOUSE PARALLAX ── */
(function(){
  const heroEl = document.getElementById('hero');
  if (!heroEl) return;
  heroEl.addEventListener('mousemove', e => {
    const r = heroEl.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    gsap.to('.hero-inner', {
      x: nx * 14, y: ny * 7,
      duration: 1.1, ease: 'power2.out', overwrite: 'auto'
    });
    gsap.to('#heroImg', {
      x: nx * -22,
      duration: 1.0, ease: 'power2.out', overwrite: 'auto'
    });
  });
  heroEl.addEventListener('mouseleave', () => {
    gsap.to('.hero-inner', { x: 0, y: 0, duration: 0.9, ease: 'power2.out' });
    gsap.to('#heroImg', { x: 0, duration: 0.9, ease: 'power2.out' });
  });
})();

/* ── HERO GRADIENT GENTLE PULSE ── */
gsap.to('#heroGrad', {
  scale: 1.055,
  duration: 8,
  ease: 'sine.inOut',
  yoyo: true,
  repeat: -1,
  delay: 2
});

/* ── HERO FLOATING BRAND PARTICLES ── */
(function(){
  const heroBox = document.querySelector('.hero-box');
  if (!heroBox) return;
  for (let i = 0; i < 20; i++) {
    const pt = document.createElement('div');
    pt.className = 'hero-pt';
    const size = Math.random() * 2.5 + 1;
    const initOpacity = Math.random() * 0.18 + 0.05;
    pt.style.cssText =
      'width:' + size + 'px;height:' + size + 'px;' +
      'background:#41c0d2;' +
      'left:' + (Math.random() * 56 + 2) + '%;' +
      'top:' + (Math.random() * 72 + 8) + '%;' +
      'opacity:' + initOpacity + ';';
    heroBox.appendChild(pt);
    gsap.to(pt, {
      y: () => -(Math.random() * 65 + 25),
      opacity: 0,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 7,
      ease: 'power1.in',
      repeat: -1,
      repeatDelay: Math.random() * 3 + 0.5,
      repeatRefresh: true,
      onRepeat: function() {
        gsap.set(pt, {
          y: 0, x: 0,
          opacity: Math.random() * 0.18 + 0.05,
          left: (Math.random() * 56 + 2) + '%',
          top: (Math.random() * 72 + 8) + '%'
        });
      }
    });
  }
})();

/* ── INTRO PARAGRAPH WORD-BY-WORD REVEAL ── */
(function(){
  const para = document.querySelector('.intro-bridge-p');
  if (!para) return;
  const words = para.textContent.trim().split(/\s+/);
  para.innerHTML = words.map(w =>
    '<span class="iw" style="opacity:0">' + w + ' </span>'
  ).join('');
  ScrollTrigger.create({
    trigger: para,
    start: 'top 82%',
    onEnter: () => {
      gsap.to(para.querySelectorAll('.iw'), {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.026,
        delay: 0.85
      });
    }
  });
})();

/* ── TESTIMONIAL CARD HOVER LIFT ── */
document.querySelectorAll('.pc').forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, { y: -7, scale: 1.012, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1,.55)', overwrite: 'auto' });
  });
});

/* ── SERVICE PANEL INITIAL FI STAGGER ON SCROLL ── */
(function(){
  let done = false;
  ScrollTrigger.create({
    trigger: '#activities',
    start: 'top 72%',
    onEnter: () => {
      if (done) return; done = true;
      const fis = document.querySelectorAll('#tp0 .fi');
      gsap.set(fis, { opacity: 0, x: -10 });
      gsap.to(fis, { opacity: 1, x: 0, duration: .45, ease: 'power2.out', stagger: .07, delay: .3 });
    }
  });
})();

/* ── FAQ ITEMS ENTRANCE STAGGER ── */
(function(){
  const ais = document.querySelectorAll('.ai');
  gsap.set(ais, { opacity: 0, x: -14 });
  ScrollTrigger.create({
    trigger: '.acc-list',
    start: 'top 86%',
    onEnter: () => {
      gsap.to(ais, {
        opacity: 1, x: 0,
        duration: 0.55, ease: 'power3.out',
        stagger: 0.07
      });
    }
  });
})();

/* ── H2 HEADINGS SUBTLE GLOW ON ENTER ── */
document.querySelectorAll('[data-split-h2]').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    onEnter: () => {
      gsap.to(el, {
        textShadow: '0 0 80px rgba(65,192,210,.07)',
        duration: 1.6, ease: 'power2.out'
      });
    }
  });
});

/* ── WORK CARD TAGS STAGGER ON REVEAL ── */
document.querySelectorAll('[data-work-card]').forEach(card => {
  const tags = card.querySelectorAll('.tag');
  gsap.set(tags, { opacity: 0, y: 6 });
  ScrollTrigger.create({
    trigger: card,
    start: 'top 88%',
    onEnter: () => {
      gsap.to(tags, {
        opacity: 1, y: 0,
        duration: 0.4, ease: 'power2.out',
        stagger: 0.06, delay: 0.55
      });
    }
  });
});

/* ── MOBILE BURGER MENU JS ── */
(function() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobMenu = document.getElementById('mobMenu');
  if (burgerBtn && mobMenu) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('open');
      mobMenu.classList.toggle('open');
      if (mobMenu.classList.contains('open')) {
        if (window.lenis) lenis.stop(); // Stop page scrolling when menu is open
      } else {
        if (window.lenis) lenis.start();
      }
    });

    mobMenu.querySelectorAll('.mob-menu-link').forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('open');
        mobMenu.classList.remove('open');
        if (window.lenis) lenis.start();
      });
    });
  }
})();