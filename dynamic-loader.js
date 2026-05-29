async function loadDynamicContent() {
  try {
    const res = await fetch('/api/sections/all');
    if (!res.ok) return;
    const data = await res.json();
    
    // Helper to safely set text
    const setText = (selector, text) => {
      const el = document.querySelector(selector);
      if (el && text !== undefined) el.textContent = text;
    };
    // Helper to safely set html
    const setHtml = (selector, html) => {
      const el = document.querySelector(selector);
      if (el && html !== undefined) el.innerHTML = html;
    };
    // Helper to safely set src
    const setSrc = (selector, src) => {
      const el = document.querySelector(selector);
      if (el && src) el.src = src;
    };

    // 1. Settings (global overrides)
    if (data.settings) {
      if (data.settings.title) document.title = data.settings.title;
      setText('.nav-logo text:nth-of-type(1)', data.settings.initials);
      setText('.nav-logo text:nth-of-type(2)', (data.settings.name || '').toUpperCase());
      document.querySelectorAll('.btn-in img').forEach(img => {
        if (data.settings.profileImg) img.src = data.settings.profileImg;
      });
    }

    // 2. Hero
    if (data.hero) {
      setText('.hero-badge:nth-child(1) span', data.hero.badge1);
      setText('.hero-badge:nth-child(2) span', data.hero.badge2);
      if (data.hero.h1l1 && data.hero.h1l2) {
        setHtml('#heroH1', `${data.hero.h1l1}<br>${data.hero.h1l2}`);
      }
      setText('#heroSub', data.hero.sub);
      setText('#heroBtns .btn-p span', data.hero.btnPrimary);
      setText('#heroBtns .btn-s .btn-in', data.hero.btnSecondary);
      setSrc('#heroImg', data.hero.heroImg);
      
      if (data.hero.marquee) {
        const items = data.hero.marquee.split(',').map(s => s.trim());
        const mqList = document.getElementById('mqList');
        if (mqList && items.length > 0) {
          mqList.innerHTML = items.map((item, i) => {
            const svg = i === 0 ? `<svg width="14" height="14" viewBox="0 0 22 22" fill="none" style="flex:none;margin-right:0.4rem"><rect x="0" y="0" width="10" height="10" fill="rgba(255,255,255,0.45)"/><rect x="12" y="0" width="10" height="10" fill="rgba(255,255,255,0.45)"/><rect x="0" y="12" width="10" height="10" fill="rgba(255,255,255,0.45)"/><rect x="12" y="12" width="10" height="10" fill="rgba(255,255,255,0.45)"/></svg>` : '';
            return `<div class="mq-item"><span style="font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:-.02em;white-space:nowrap;display:flex;align-items:center;">${svg}${item}</span></div>`;
          }).join('');
        }
      }
    }

    // 3. About
    if (data.about) {
      const abSec = document.getElementById('about'); // Needs ID in HTML
      // We will map based on structure or inject completely. 
      // It's safer to just inject standard classes if we're replacing
    }

    // 4. Dynamic Upcoming Events
    try {
      const eventsRes = await fetch('/api/events');
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        const container = document.getElementById('eventsContainer');
        if (container) {
          if (!events || events.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:var(--nm);grid-column:1/-1;padding:2rem 0;font-size:1rem;">No upcoming events scheduled at this time. Check back soon!</p>`;
          } else {
            container.innerHTML = events.map(ev => {
              // Extract a nice category like "Webinar", "Workshop", "Speaking" from location/type or default to "ACTIVITY"
              let cat = 'Activity';
              if (ev.location) {
                const locLower = ev.location.toLowerCase();
                if (locLower.includes('webinar') || locLower.includes('online') || locLower.includes('zoom') || locLower.includes('teams')) {
                  cat = 'Webinar';
                } else if (locLower.includes('workshop') || locLower.includes('class') || locLower.includes('bootcamp')) {
                  cat = 'Workshop';
                } else if (locLower.includes('speaking') || locLower.includes('talk') || locLower.includes('keynote') || locLower.includes('conference')) {
                  cat = 'Speaking';
                }
              }
              const cleanLoc = ev.location || 'Online';
              const cleanLink = ev.link ? (ev.link.startsWith('http') ? ev.link : 'https://' + ev.link) : '';
              return `
                <div class="event-card">
                  <div class="event-card-content">
                    <div class="event-meta">
                      <span class="event-cat">${cat}</span>
                      <span class="event-date">${ev.date || 'Upcoming'}</span>
                    </div>
                    <h3 class="event-title">${ev.title || 'Special Event'}</h3>
                    <p class="event-desc">${ev.description || 'Join us for this special professional learning and architecture session.'}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                      <span class="feat-event-meta">📍 ${cleanLoc}</span>
                      ${cleanLink ? `<a href="${cleanLink}" target="_blank" class="event-link">Learn More <span>→</span></a>` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('');
          }
        }
      }
    } catch (err) {
      console.error("Failed to load events calendar:", err);
    }

    // Let's implement a simpler reload for GSAP
    if (window.ScrollTrigger) {
      setTimeout(() => ScrollTrigger.refresh(), 500);
    }
  } catch (e) {
    console.error("Failed to load dynamic content", e);
  }
}

document.addEventListener('DOMContentLoaded', loadDynamicContent);
