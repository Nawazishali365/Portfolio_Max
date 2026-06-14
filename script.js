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
    
    // Disable pointer events immediately so the loader can't block scrolling during/after transit
    if (loader) loader.style.pointerEvents = 'none';

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

/* ── TOUCH DETECTION ──
   Used to skip scroll-driven parallax, hover effects, and per-frame
   animations on mobile. On touch devices these compete with the browser's
   native scroll, making the page feel sticky/laggy under the finger. */
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 1024;

/* ── LENIS ── */
let lenis;
if (!IS_TOUCH) {
  lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  window.lenis = lenis;
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}


/* ── NAV SCROLL EFFECTS ── */
const nav = document.getElementById('nav');
const navProg = document.getElementById('navProg');
if (lenis) {
  lenis.on('scroll', ({ progress }) => {
    nav.classList.toggle('sc', lenis.scroll > 60);
    navProg.style.width = (progress * 100) + '%';
  });
} else {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('sc', scrollY > 60);
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (scrollY / totalHeight) : 0;
    navProg.style.width = (progress * 100) + '%';
  });
}

/* ── SMOOTH ANCHOR SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(el, { offset: -80, duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
      } else {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
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
  if (window.innerWidth > 1024) {
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
  } else {
    gsap.set(el, { opacity: 0, y: 20 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      }
    });
  }
});

/* ── SINGLE LINE REVEAL ── */
document.querySelectorAll('[data-split-line]').forEach(el => {
  if (window.innerWidth > 1024) {
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
  } else {
    gsap.set(el, { opacity: 0, y: 15 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      }
    });
  }
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
  if (!IS_TOUCH) {
    gsap.to(probImg, {
      y: -40, ease: 'none',
      scrollTrigger: { trigger: probImg, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
}

/* ── WORDS REVEAL (staggered per word) ── */
const wordsEl = document.getElementById('wordsEl');
if (wordsEl) {
  const wds = splitWords(wordsEl);
  gsap.set(wds, { color: 'var(--nd)' });
  if (IS_TOUCH) {
    /* One-shot stagger on touch — avoids per-frame DOM mutation while scrolling. */
    ScrollTrigger.create({
      trigger: wordsEl,
      start: 'top 80%',
      onEnter: () => {
        wds.forEach((w, i) => setTimeout(() => w.classList.add('on'), i * 35));
      }
    });
  } else {
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
}

/* ── WORK CARD REVEAL ── */
document.querySelectorAll('[data-work-card]').forEach(card => {
  const wm = card.querySelector('.wm');
  const wmImg = wm?.querySelector('img');
  const grid = card.querySelector('.wc-grid');
  const bg = card.querySelector('.wc-bg');
  
  gsap.set(card, { opacity: 0 });
  if (grid) gsap.set(grid, { y: 40, force3D: true });
  if (bg) gsap.set(bg, { y: 40, force3D: true });
  if (wm) gsap.set(wm, { clipPath: 'inset(0 0 100% 0 round .75rem)' });
  if (wmImg) gsap.set(wmImg, { scale: 1.16, force3D: true });
  
  ScrollTrigger.create({
    trigger: card,
    start: 'top 88%',
    onEnter: () => {
      // Card settles into position first (force3D keeps it on GPU layer)
      gsap.to(card, { opacity: 1, duration: 0.8, ease: 'power2.out' });
      if (grid) gsap.to(grid, { y: 0, duration: 1.4, ease: 'expo.out', force3D: true });
      if (bg) gsap.to(bg, { y: 0, duration: 1.4, ease: 'expo.out', force3D: true });
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
  if (window.innerWidth > 1024) {
    const ctaLines = splitLines(ctaEl);
    gsap.set(ctaLines, { y: '110%' });
    ScrollTrigger.create({
      trigger: ctaEl,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(ctaLines, { y: '0%', duration: 1.1, ease: 'power4.out', stagger: .14 });
      }
    });
  } else {
    gsap.set(ctaEl, { opacity: 0, y: 20 });
    ScrollTrigger.create({
      trigger: ctaEl,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(ctaEl, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
      }
    });
  }
}

/* ── MARQUEE with scroll velocity ── */
const mqList = document.getElementById('mqList');
if (mqList) {
  // Clone for seamless loop
  const clone = mqList.cloneNode(true);
  mqList.parentNode.appendChild(clone);

  let mqX = 0, mqSpeed = 1, mqTarget = 1;
  const baseSpeed = 0.4; // px per frame

  if (lenis) {
    lenis.on('scroll', ({ velocity }) => {
      mqTarget = baseSpeed + Math.abs(velocity) * 0.4;
    });
  } else {
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const dt = Math.max(1, currentTime - lastTime);
      const dy = currentScrollY - lastScrollY;
      const velocity = dy / dt;
      mqTarget = baseSpeed + Math.abs(velocity) * 15;
      lastScrollY = currentScrollY;
      lastTime = currentTime;
    });
  }

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
  // Skip magnetic effect on touch devices to prevent scroll interference
  if (IS_TOUCH) return;
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
  if (IS_TOUCH) {
    /* On touch, the first second after load is when the user usually
       reaches for the screen. Run a single short fade-in instead of the
       multi-track timeline so the main thread is free for scroll. */
    gsap.set(['#heroBadges', '#heroSub', '#heroBtns'], { opacity: 0, y: 10 });
    gsap.set('#heroImg', { opacity: 0 });
    gsap.set('#heroGrad', { opacity: 0 });
    const heroH1 = document.getElementById('heroH1');
    gsap.set(heroH1, { opacity: 0, y: 10 });

    gsap.to('#heroGrad', { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 });
    gsap.to('#heroImg', { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.15 });
    gsap.to([heroH1, '#heroBadges', '#heroSub', '#heroBtns'], {
      opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08, delay: 0.2
    });
    gsap.to('#mqSec', { opacity: 1, duration: 0.5, delay: 0.6 });

    /* Defer ScrollTrigger.refresh past the first-interaction window so
       the layout measurement doesn't compete with the user's first scroll. */
    setTimeout(() => ScrollTrigger.refresh(), 800);
    return;
  }

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
if (!IS_TOUCH) {
  gsap.utils.toArray('.wc').forEach(card => {
    gsap.to(card, {
      y: -20,
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
}

/* ── WHY GRID SUBTLE STAGGER ON SCROLL ── */
if (!IS_TOUCH) {
  gsap.utils.toArray('.wy-img img').forEach((img, i) => {
    gsap.to(img, {
      scale: 1.04,
      ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
}


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

/* ── HERO PARALLAX ON SCROLL ──
   Scrub-driven transforms fight the native scroll on touch devices and make
   the hero feel "sticky" under the finger. Desktop only. */
if (!IS_TOUCH) {
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
}

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
        const scrollY = lenis ? lenis.scroll : (window.scrollY || document.documentElement.scrollTop);
        if (el && scrollY >= el.offsetTop - 200) active = id;
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


/* ── HOW CONNECTOR LINE (scroll-scrubbed linear draw) ── */
const howConLine = document.getElementById('howConLine');
if (howConLine) {
  if (IS_TOUCH) {
    /* Skip scrub on touch — show the line drawn once it enters view. */
    ScrollTrigger.create({
      trigger: '.how-nums',
      start: 'top 78%',
      onEnter: () => gsap.to(howConLine, { width: '100%', duration: 1.2, ease: 'power2.out' })
    });
  } else {
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
}

/* ── VIDEO LAZY LOAD ON HOVER ──
   Hover events fire on tap on touch devices, kicking off a video load +
   play right as the user starts scrolling. Skip on touch. */
if (!IS_TOUCH) {
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
}

/* ── VIDEO OVERLAY CLICK TO PLAY ── */
(function() {
  const overlay = document.getElementById('videoOverlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      overlay.classList.add('hidden');
      
      const iframe = overlay.previousElementSibling;
      if (iframe && iframe.tagName === 'IFRAME') {
        let src = iframe.src;
        if (src.indexOf('?') > -1) {
          src += '&autoplay=1';
        } else {
          src += '?autoplay=1';
        }
        iframe.src = src;
      }
    });
  }
})();

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

  if (IS_TOUCH) {
    /* One-shot reveal on touch — no scrub. */
    gsap.set(bars, { scaleX: 0 });
    ScrollTrigger.create({
      trigger: sep,
      start: 'top 85%',
      onEnter: () => gsap.to(bars, {
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.out',
        stagger: { each: 0.05, from: isBtm ? 'start' : 'end' }
      })
    });
    return;
  }

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
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
}

/* ── HERO MOUSE PARALLAX ── */
(function(){
  const heroEl = document.getElementById('hero');
  if (!heroEl) return;
  // Skip on touch devices — mousemove listeners can block scroll propagation
  if (IS_TOUCH) return;
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

/* ── HERO GRADIENT GENTLE PULSE ──
   Continuous transform on a large element triggers nonstop repaints over
   the hero; on mobile this compounds with scroll redraw and feels sticky. */
if (!IS_TOUCH) {
  gsap.to('#heroGrad', {
    scale: 1.055,
    duration: 8,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 2
  });
}

/* ── HERO FLOATING BRAND PARTICLES ──
   20 always-animating absolutely-positioned dots above the hero gradient
   keep the compositor busy. Skip on touch where the cost shows up as
   scroll jank. */
(function(){
  if (IS_TOUCH) return;
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
  if (window.innerWidth > 1024) {
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
  } else {
    gsap.set(para, { opacity: 0, y: 15 });
    ScrollTrigger.create({
      trigger: para,
      start: 'top 82%',
      onEnter: () => {
        gsap.to(para, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.45 });
      }
    });
  }
})();

/* ── TESTIMONIAL CARD HOVER LIFT ── */
if (!IS_TOUCH) {
  document.querySelectorAll('.pc').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -7, scale: 1.012, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1,.55)', overwrite: 'auto' });
    });
  });
}

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
        if (window.lenis) lenis.stop();
        document.body.classList.add('scroll-lock');
      } else {
        if (window.lenis) lenis.start();
        document.body.classList.remove('scroll-lock');
      }
    });

    mobMenu.querySelectorAll('.mob-menu-link').forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('open');
        mobMenu.classList.remove('open');
        if (window.lenis) lenis.start();
        document.body.classList.remove('scroll-lock');
      });
    });
  }
})();