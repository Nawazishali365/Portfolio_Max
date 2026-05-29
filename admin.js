/* ══ API CONFIG ══ */
const API_BASE = window.location.origin + '/api';
let AUTH_TOKEN = sessionStorage.getItem('ua_admin_token') || '';

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': AUTH_TOKEN }
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + path, opts);
  if (res.status === 401) { sessionStorage.clear(); location.reload(); return null; }
  return res.json();
}

async function apiUpload(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(API_BASE + '/upload', {
    method: 'POST',
    headers: { 'X-Admin-Token': AUTH_TOKEN },
    body: fd
  });
  return res.json();
}
/* â•â• ADMIN.JS â€“ PART 1: Auth, Navigation, Utilities â•â• */

/* â”€â”€ DEFAULTS â”€â”€ */
const DEFAULTS = {
  hero: {
    badge1: 'Microsoft Cloud Architect', badge2: 'GenAI & Copilot Expert',
    h1l1: 'Cloud Architect &', h1l2: 'Microsoft AI Partner',
    sub: 'Drive digital transformation, accelerate AI adoption, and build modern workplaces that scale.',
    btnPrimary: 'Connect with Me', btnSecondary: 'View Experience',
    marquee: 'Microsoft, KTH Royal Institute, CGI, PostNord, Saab, Blekinge Institute, Direct Link',
    heroImg: 'usman-profile-transparent.png', profileImg: 'usman-profile.png'
  },
  about: {
    introQ1: "If that sounds familiar,", introQ2: "I've been there â€” and I can help.",
    body: "I'm Usman â€” a Senior Cloud Solution Architect at Microsoft with 16+ years helping enterprise organizations across the Nordics and beyond adopt Azure, Microsoft 365, and AI. I bridge the gap between technology strategy and business outcomes, ensuring the platforms you've invested in actually transform how your organization works.",
    quote: "Technology alone doesn't transform organizations. Adoption does. The gap between deploying tools and extracting value is where most digital transformations fail â€” and where I focus."
  },
  stats: [
    { num: '16', suf: '+', label: 'Years in technology' },
    { num: '13', suf: '+', label: 'Years at Microsoft' },
    { num: '100', suf: '+', label: 'Enterprise clients served' },
    { num: '3', suf: '', label: 'Microsoft Awards' }
  ],
  problems: {
    eyebrow: 'The Problem', h2l1: "You've invested in the cloud", h2l2: "but the value hasn't landed",
    img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/6880c8caf3d1726e29f1e6e5_problems-website-bg.avif',
    items: [
      { title: 'Cloud costs grow faster than the value delivered', desc: 'Sprawling subscriptions, under-governed workloads, and zero optimization strategy drain budgets without a clear return.' },
      { title: 'AI tools deployed, adoption stuck at 20%', desc: 'Copilot licenses issued, Viva modules activated â€” but daily usage is low. Technology without change management delivers nothing.' },
      { title: 'Your teams use five tools for what one platform should do', desc: 'Microsoft 365 and Azure are already in your estate. The gap between licensed and realized is where transformation stalls.' }
    ]
  },
  experience: {
    eyebrow: 'Selected Experience', h2l1: 'Initiatives that', h2l2: 'drive transformation',
    items: [
      { tags: 'Cloud Architecture, Azure, Enterprise', title: 'Accelerated cloud adoption', titleL2: 'across the Nordics', desc: 'Led cloud solution architecture engagements with enterprise clients at Microsoft, designing Azure infrastructure strategies that cut time-to-value by months and aligned spend to outcomes.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686bc589c7e82c1afb6c8a16_mf-work-indigo.avif', company: 'Microsoft', linkedIn: 'https://www.linkedin.com/in/usafzal/' },
      { tags: 'Technical Consulting, IT Strategy, Project Leadership', title: 'Enterprise IT delivery', titleL2: 'for PostNord & Saab', desc: 'Technical project leadership at CGI for major Nordic enterprises â€” PostNord, Saab, and Direct Link. Architected and delivered complex IT transformation programs on time and within scope.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686bc589844be9421f067d4e_mf-work-yoda.avif', company: 'CGI', linkedIn: 'https://www.linkedin.com/in/usafzal/' },
      { tags: 'GenAI, Microsoft Copilot, AI Adoption', title: 'Driving GenAI adoption', titleL2: 'for enterprise teams', desc: 'Designed and led Microsoft Copilot deployment strategies, embedding AI into daily workflows to deliver measurable productivity gains at scale â€” from readiness assessment to full rollout.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686bc5890c8d9aac911aae40_mf-work-nimbi.avif', company: 'Copilot for M365', linkedIn: 'https://www.linkedin.com/in/usafzal/' },
      { tags: 'Modern Work, Microsoft 365, Change Management', title: 'Modern Work transformation', titleL2: 'for enterprise organizations', desc: 'As Subject Matter Expert for Modern Work at Microsoft, drove M365 and Teams adoption programs that lifted engagement from pilot to full deployment â€” creating frameworks that scaled across entire organizations.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/69f37c0e86c79c3103644845_mf-work-compaan.jpg', company: 'Microsoft 365', linkedIn: 'https://www.linkedin.com/in/usafzal/' }
    ]
  },
  approach: {
    eyebrow: 'How it works', h2l1: 'Structured. Proven.', h2l2: 'Scalable.',
    items: [
      { title: 'Discover & Assess', desc: 'We start by deeply understanding your technology landscape, business goals, and adoption gaps â€” before any solution is proposed. Clarity first, architecture second.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686cca4e2f1728bde152592d_book-a-call-matteo-fabbiani.avif' },
      { title: 'Design & Architect', desc: 'I design a tailored cloud or AI adoption roadmap aligned to your business priorities, technology constraints, and organizational readiness â€” proven across 100+ enterprise engagements.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686cca4e392303f2fc2366e6_seamless-execution-matteo-fabbiani.avif' },
      { title: 'Deploy & drive adoption', desc: 'Implementation, change management, and ongoing enablement â€” ensuring your teams actually use the technology and your organization realizes measurable, lasting value.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686cca4ec5077d89f745b94b_launch-build-trust-convert-more-matteo-fabbiani.avif' }
    ]
  },
  testimonials: {
    eyebrow: 'Endorsements', h2l1: 'What colleagues', h2l2: 'and clients say.',
    items: [
      { company: 'Microsoft', quote: '"Usman brings a rare combination of deep technical expertise and business acumen. He translated complex Azure concepts into clear strategic decisions for our leadership team."', initials: 'EL', name: 'Erik Lindqvist', role: 'CTO, Nordic Enterprise Client', color: '#0078d4' },
      { company: 'CGI', quote: '"His technical leadership on our PostNord delivery was exceptional â€” structured approach, clear communication, and zero surprises at go-live."', initials: 'AS', name: 'Anna StrÃ¶m', role: 'Programme Director, CGI', color: '#e30613' },
      { company: 'Copilot for M365', quote: '"His GenAI readiness framework gave us a clear path from pilot to production in just three months. Our teams went from skepticism to daily Copilot use."', initials: 'MS', name: 'Maria Svensson', role: 'Head of Digital, Enterprise Client', color: '#6264a7' },
      { company: 'KTH Royal Institute', quote: '"Usman\'s research on enterprise collaboration tools was both academically rigorous and immediately applicable. A genuinely rare combination."', initials: 'PH', name: 'Prof. Per HÃ¥kansson', role: 'KTH Royal Institute of Technology', color: '#1c3f6e' },
      { company: 'Microsoft Azure', quote: '"Usman moved our M365 adoption from 35% to 91% within a year. He doesn\'t just architect solutions â€” he ensures people actually use them."', initials: 'JB', name: 'Johan BergstrÃ¶m', role: 'IT Director, Swedish Enterprise', color: '#005a9e' }
    ]
  },
  services: {
    eyebrow: 'Services', h2: 'What I do',
    items: [
      { tab: 'Cloud Strategy', title: 'Cloud Strategy & Architecture', scope: 'Enterprise', features: 'Azure solution design & architecture\nCloud migration roadmap & planning\nGovernance framework & cost optimization\nExecutive stakeholder alignment', quote: '"Our Azure costs dropped 28% while deployment speed tripled."', quotePerson: 'Erik Lindqvist', quoteRole: 'CTO, Nordic Enterprise', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686bc589c7e82c1afb6c8a16_mf-work-indigo.avif' },
      { tab: 'AI & Copilot', title: 'GenAI & Microsoft Copilot', scope: 'Advisory', features: 'Copilot readiness assessment\nDeployment strategy & governance\nAdoption enablement & training\nROI measurement & reporting', quote: '"From pilot to 2,000 active Copilot users in 90 days."', quotePerson: 'Maria Svensson', quoteRole: 'Head of Digital', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686bc5890c8d9aac911aae40_mf-work-nimbi.avif' },
      { tab: 'Modern Work', title: 'Microsoft 365 & Modern Work', scope: 'Programme', features: 'M365 adoption & engagement programs\nTeams & Power Platform enablement\nChange management & communication\nScalable training & enablement frameworks', quote: '"Teams adoption jumped from 35% to 91% within a year."', quotePerson: 'Johan BergstrÃ¶m', quoteRole: 'IT Director', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/69f37c0e86c79c3103644845_mf-work-compaan.jpg' }
    ]
  },
  why: {
    eyebrow: 'Why work with me', h2l1: 'Strategy, architecture,', h2l2: 'and delivery â€” all in one.',
    items: [
      { title: 'Deep Microsoft expertise', desc: '13+ years inside Microsoft â€” as Cloud Solution Architect, Technical Advisor, and Modern Work SME. Not a generalist consultant, a specialist.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686fc8297a703dda34a576c4_All-in-one-industry-expert-matteo-fabbiani-studio-design.avif' },
      { title: 'End-to-end delivery', desc: 'From business case to architecture to adoption â€” I own the full cycle. No handoffs between strategy and execution.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686fc82988295c2287e32865_Animation-Pro-matteo-fabbiani-studio-design.avif' },
      { title: 'Proven at enterprise scale', desc: 'PostNord, Saab, and 100+ Microsoft enterprise clients across the Nordics. Complex environments, high stakes, real outcomes.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686fc82917a91ca938d05f37_Official-Webflow-Partner-matteo-fabbiani-studio-design.avif' },
      { title: 'AI-forward thinking', desc: 'GenAI and Microsoft Copilot specialist. Recognized by Microsoft as a Nonprofit Advisor AI and Key Talent â€” twice.', img: 'https://cdn.prod.website-files.com/685992d920f7167b41444649/686fc829230eee0263e00a68_Award-level-design-matteo-fabbiani-studio-design.avif' },
      { title: 'Academic & hands-on', desc: 'MBA, Masters from KTH, published researcher. Academic rigor combined with 16 years of practical enterprise delivery.', img: '' },
      { title: 'Nordic base, global mindset', desc: 'Based in Stockholm with experience across Nordic markets and international enterprise environments.', img: '' }
    ]
  },
  faq: {
    items: [
      { q: 'What services do you offer?', a: 'I work across three areas: cloud strategy and Azure architecture, GenAI and Microsoft Copilot, and Microsoft 365 Modern Work. Engagements range from focused advisory to full programme leadership.' },
      { q: 'How do you typically engage with clients?', a: 'Every engagement starts with a discovery phase to understand your technology landscape, business priorities, and adoption gaps. From there I design a tailored roadmap and support execution and change management.' },
      { q: 'Why Microsoft Azure and M365?', a: "Microsoft's platform is deeply integrated, enterprise-grade, and AI-native. The challenge isn't choosing the platform â€” it's unlocking the value already sitting in your estate." },
      { q: 'What size organizations do you work with?', a: "My background is enterprise â€” PostNord, Saab, and Microsoft's largest Nordic clients. I'm most effective in organizations with 500+ employees." },
      { q: 'How do you approach AI adoption?', a: "Adoption starts before deployment. I assess organizational readiness, design a governance framework, identify high-value use cases, and build an enablement programme." },
      { q: 'What makes your approach unique?', a: "I've spent 13+ years inside Microsoft, which means I understand the platform from the inside â€” not just from a customer or partner perspective." }
    ]
  },
  blog: { visible: false, eyebrow: 'Insights', h2: 'Thoughts on Cloud & AI', items: [] },
  events: { visible: false, eyebrow: 'Speaking', h2: 'Upcoming Events', items: [] },
  nav: {
    links: [
      { label: 'Experience', href: '#work' },
      { label: 'Approach', href: '#process' },
      { label: 'Testimonials', href: '#reviews' },
      { label: 'Services', href: '#services' }
    ],
    btnLabel: 'Connect with Me',
    btnUrl: 'https://www.linkedin.com/in/usafzal/'
  },
  cta: { l1: 'Ready to transform', l2: 'your digital workplace?', btn: 'Connect on LinkedIn', btnUrl: 'https://www.linkedin.com/in/usafzal/' },
  settings: { name: 'Usman Afzal', linkedIn: 'https://www.linkedin.com/in/usafzal/', title: 'Usman Afzal â€“ Cloud Architect & Microsoft AI Partner', initials: 'UA', profileImg: 'usman-profile.png' }
};

/* â”€â”€ PASSWORD / AUTH â”€â”€ */
const DEFAULT_PWD = 'admin123';
function getPwd() { return localStorage.getItem('ua_admin_pwd') || DEFAULT_PWD; }
function isLoggedIn() { return sessionStorage.getItem("ua_admin_auth") === "1" && sessionStorage.getItem("ua_admin_token"); }

document.getElementById('loginBtn').addEventListener('click', doLogin);
['loginPwd','loginEmail'].forEach(function(id){ document.getElementById(id).addEventListener('keydown', function(e){ if(e.key==='Enter') doLogin(); }); });
async function doLogin() {
  var email = (document.getElementById("loginEmail").value||"").trim();
  var pwd = document.getElementById("loginPwd").value;
  var errEl = document.getElementById("loginErr");
  if (!email) { errEl.textContent = "Enter your email or username."; return; }
  if (!pwd)   { errEl.textContent = "Enter your password."; return; }
  errEl.textContent = "";
  document.getElementById("loginBtn").textContent = "Signing in…";
  try {
    const res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({email, password: pwd})
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || "Login failed."; document.getElementById("loginBtn").textContent = "Sign In →"; return; }
    AUTH_TOKEN = data.token;
    sessionStorage.setItem("ua_admin_token", AUTH_TOKEN);
    sessionStorage.setItem("ua_admin_auth", "1");
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "flex";
    init();
  } catch(e) {
    errEl.textContent = "Cannot connect to server. Is app.py running?";
    document.getElementById("loginBtn").textContent = "Sign In →";
  }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('ua_admin_auth');
  location.reload();
});

function changePassword() {
  const np = document.getElementById('newPwd').value.trim();
  const cp = document.getElementById('confirmPwd').value.trim();
  if (!np) return toast('Enter a new password.', 'error');
  if (np !== cp) return toast('Passwords do not match.', 'error');
  if (np.length < 6) return toast('Password must be at least 6 characters.', 'error');
  localStorage.setItem('ua_admin_pwd', np);
  document.getElementById('newPwd').value = '';
  document.getElementById('confirmPwd').value = '';
  toast('Password changed successfully!', 'success');
}

/* â”€â”€ INIT â”€â”€ */
async function init() {
  if (isLoggedIn()) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
  }
  buildDashboard();
  setupSidebar();
  setupDropZones();
  await loadAllSections();
  buildNavLinks();
  try {
    const creds = await api("GET", "/credentials");
    if (creds) {
      setValue("adminEmail", creds.email || "");
      setValue("contactEmail", creds.contactEmail || "");
      var disp = document.getElementById("currentEmailDisplay"); if(disp) disp.textContent = creds.email || "";
    }
  } catch(e) {}
}

if (isLoggedIn()) init();

/* â”€â”€ SIDEBAR â”€â”€ */
function setupSidebar() {
  document.querySelectorAll('.sb-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sb-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const panel = btn.dataset.panel;
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + panel).classList.add('active');
      document.getElementById('topbarTitle').textContent = btn.textContent.trim();
      if (window.innerWidth < 900) document.getElementById('sidebar').classList.remove('open');
    });
  });
  document.getElementById('sbToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.querySelectorAll('.editor-card-header').forEach(h => {
    h.addEventListener('click', () => h.closest('.editor-card').classList.toggle('collapsed'));
  });
  document.getElementById('saveTopBtn').addEventListener('click', () => {
    const active = document.querySelector('.sb-nav-item.active');
    const panel = active ? active.dataset.panel : null;
    if (panel && panel !== 'dashboard') saveSection(panel); else toast('Navigate to a section first.', 'info');
  });
}

/* â”€â”€ DASHBOARD â”€â”€ */
const DASH_ITEMS = [
  { panel: 'hero', icon: '✨', bg: 'rgba(65,192,210,.12)', label: 'Hero', sub: 'Headline & badges' },
  { panel: 'about', icon: '👤', bg: 'rgba(62,207,142,.1)', label: 'About', sub: 'Bio & quote' },
  { panel: 'stats', icon: '📊', bg: 'rgba(245,197,24,.1)', label: 'Stats', sub: 'Counter numbers' },
  { panel: 'problems', icon: '⚠️', bg: 'rgba(255,77,77,.1)', label: 'Problems', sub: 'Pain points' },
  { panel: 'experience', icon: '💼', bg: 'rgba(65,192,210,.12)', label: 'Experience', sub: 'Work cards' },
  { panel: 'approach', icon: '🔄', bg: 'rgba(62,207,142,.1)', label: 'Approach', sub: 'Process steps' },
  { panel: 'testimonials', icon: '⭐', bg: 'rgba(245,197,24,.1)', label: 'Testimonials', sub: 'Client quotes' },
  { panel: 'services', icon: '🛠️', bg: 'rgba(65,192,210,.12)', label: 'Services', sub: 'Service tabs' },
  { panel: 'faq', icon: '❓', bg: 'rgba(255,77,77,.1)', label: 'FAQ', sub: 'Q&A pairs' },
  { panel: 'blog', icon: '📝', bg: 'rgba(62,207,142,.1)', label: 'Blog', sub: 'New section' },
  { panel: 'events', icon: '📅', bg: 'rgba(245,197,24,.1)', label: 'Events', sub: 'New section' },
  { panel: 'settings', icon: '⚙️', bg: 'rgba(255,255,255,.05)', label: 'Settings', sub: 'Global config' }
];
function buildDashboard() {
  const grid = document.getElementById('dashGrid');
  grid.innerHTML = DASH_ITEMS.map(d => `
    <div class="dash-card" onclick="gotoPanel('${d.panel}')">
      <div class="dash-card-ico" style="background:${d.bg}">${d.icon}</div>
      <div><div class="dash-card-label">${d.label}</div><div class="dash-card-sub">${d.sub}</div></div>
    </div>`).join('');
}
function gotoPanel(p) {
  document.querySelectorAll('.sb-nav-item').forEach(b => { if (b.dataset.panel === p) b.click(); });
}

/* â”€â”€ TOAST â”€â”€ */
function toast(msg, type = 'info') {
  const ico = type === 'success' ? 'âœ…' : type === 'error' ? 'âŒ' : 'â„¹ï¸';
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-ico">${ico}</span><span class="toast-msg">${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* â”€â”€ DATA HELPERS â”€â”€ */
/* getData/setData are now API-based; these are synchronous fallback for init */
function getData(key) {
  try { const v = sessionStorage.getItem("ua_cache_" + key); return v ? JSON.parse(v) : DEFAULTS[key]; }
  catch { return DEFAULTS[key]; }
}
function setData(key, val) { sessionStorage.setItem("ua_cache_" + key, JSON.stringify(val)); }

/* â”€â”€ DROP ZONES â”€â”€ */
const DROP_ZONES = [
  { id: 'dz-heroImg', fileId: 'file-heroImg', prevId: 'prev-heroImg', urlId: 'url-heroImg', key: 'heroImg' },
  { id: 'dz-probImg', fileId: 'file-probImg', prevId: 'prev-probImg', urlId: 'url-probImg', key: 'probImg' },
  { id: 'dz-profileImg', fileId: 'file-profileImg', prevId: 'prev-profileImg', urlId: 'url-profileImg', key: 'profileImg' }
];
function setupDropZones() {
  DROP_ZONES.forEach(dz => {
    const zone = document.getElementById(dz.id);
    if (!zone) return;
    const fileInput = document.getElementById(dz.fileId);
    const preview = document.getElementById(dz.prevId);
    const urlInput = document.getElementById(dz.urlId);
    fileInput.addEventListener('change', () => handleFile(fileInput.files[0], preview, urlInput));
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      handleFile(e.dataTransfer.files[0], preview, urlInput);
    });
    urlInput.addEventListener('input', () => showPreview(urlInput.value, preview));
  });
}
async function handleFile(file, preview, urlInput) {
  if (!file || !file.type.startsWith("image/")) return toast("Please select an image file.", "error");
  if (file.size > 10 * 1024 * 1024) return toast("Image must be under 10MB.", "error");
  toast("Uploading image…", "info");
  try {
    const res = await apiUpload(file);
    if (res && res.url) {
      showPreview(window.location.origin + res.url, preview);
      urlInput.value = window.location.origin + res.url;
      toast("Image uploaded!", "success");
    } else {
      // fallback to base64 if upload fails
      const reader = new FileReader();
      reader.onload = e => { showPreview(e.target.result, preview); urlInput.value = e.target.result; };
      reader.readAsDataURL(file);
    }
  } catch(e) {
    const reader = new FileReader();
    reader.onload = ev => { showPreview(ev.target.result, preview); urlInput.value = ev.target.result; };
    reader.readAsDataURL(file);
  }
}
function showPreview(src, preview) {
  if (src) { preview.src = src; preview.classList.add('show'); }
  else { preview.src = ''; preview.classList.remove('show'); }
}
function clearImg(key) {
  const prev = document.getElementById('prev-' + key);
  const url = document.getElementById('url-' + key);
  if (prev) { prev.src = ''; prev.classList.remove('show'); }
  if (url) url.value = '';
}

/* â”€â”€ DYNAMIC DROP ZONE for item lists â”€â”€ */
function makeDZ(containerId, fileId, prevId, urlId) {
  const zone = document.getElementById(containerId);
  const fileInput = document.getElementById(fileId);
  const preview = document.getElementById(prevId);
  const urlInput = document.getElementById(urlId);
  if (!zone || !fileInput) return;
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0], preview, urlInput));
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0], preview, urlInput);
  });
  urlInput.addEventListener('input', () => showPreview(urlInput.value, preview));
}

/* -- LOAD ALL SECTIONS (from SQLite via API) -- */
async function loadAllSections() {
  try {
    const all = await api("GET", "/sections/all");
    if (all) { Object.entries(all).forEach(([k,v]) => sessionStorage.setItem("ua_cache_"+k, JSON.stringify(v))); }
  } catch(e) { console.warn("Could not fetch sections:", e); }
  const h = getData('hero');
  setValue('heroBadge1', h.badge1); setValue('heroBadge2', h.badge2);
  setValue('heroH1L1', h.h1l1); setValue('heroH1L2', h.h1l2);
  setValue('heroSub', h.sub);
  setValue('heroBtnPrimary', h.btnPrimary); setValue('heroBtnSecondary', h.btnSecondary);
  setValue('heroMarquee', h.marquee);
  if (h.heroImg) { showPreview(h.heroImg, document.getElementById('prev-heroImg')); document.getElementById('url-heroImg').value = h.heroImg; }

  const ab = getData('about');
  setValue('aboutIntroQ1', ab.introQ1); setValue('aboutIntroQ2', ab.introQ2);
  setValue('aboutBody', ab.body); setValue('aboutQuote', ab.quote);

  const pb = getData('problems');
  setValue('probEyebrow', pb.eyebrow); setValue('probH2L1', pb.h2l1); setValue('probH2L2', pb.h2l2);
  if (pb.img) { showPreview(pb.img, document.getElementById('prev-probImg')); document.getElementById('url-probImg').value = pb.img; }
  renderProblems(pb.items || []);

  const st = getData('stats'); renderStats(st);

  const ex = getData('experience');
  setValue('workEyebrow', ex.eyebrow); setValue('workH2L1', ex.h2l1); setValue('workH2L2', ex.h2l2);
  renderWork(ex.items || []);

  const ap = getData('approach');
  setValue('howEyebrow', ap.eyebrow); setValue('howH2L1', ap.h2l1); setValue('howH2L2', ap.h2l2);
  renderApproach(ap.items || []);

  const te = getData('testimonials');
  setValue('revEyebrow', te.eyebrow); setValue('revH2L1', te.h2l1); setValue('revH2L2', te.h2l2);
  renderTestimonials(te.items || []);

  const sv = getData('services');
  setValue('svcEyebrow', sv.eyebrow); setValue('svcH2', sv.h2);
  renderServices(sv.items || []);

  const wy = getData('why');
  setValue('whyEyebrow', wy.eyebrow); setValue('whyH2L1', wy.h2l1); setValue('whyH2L2', wy.h2l2);
  renderWhy(wy.items || []);

  const fq = getData('faq'); renderFaq(fq.items || []);

  const bl = getData('blog');
  document.getElementById('blogVisible').checked = !!bl.visible;
  setValue('blogEyebrow', bl.eyebrow); setValue('blogH2', bl.h2);
  renderBlog(bl.items || []);

  const ev = getData('events');
  document.getElementById('eventsVisible').checked = !!ev.visible;
  setValue('eventsEyebrow', ev.eyebrow); setValue('eventsH2', ev.h2);
  renderEvents(ev.items || []);

  const nv = getData('nav');
  setValue('navBtnLabel', nv.btnLabel); setValue('navBtnUrl', nv.btnUrl);
  renderNavLinks(nv.links || []);

  const ct = getData('cta');
  setValue('ctaL1', ct.l1); setValue('ctaL2', ct.l2); setValue('ctaBtn', ct.btn); setValue('ctaBtnUrl', ct.btnUrl);
  setValue('footerName', getData('cta').footerName || 'Usman Afzal');

  var sg = getData('settings');
  setValue('settingsName', sg.name); setValue('settingsLinkedIn', sg.linkedIn);
  setValue('settingsTitle', sg.title); setValue('settingsInitials', sg.initials);
  if (sg.profileImg) { showPreview(sg.profileImg, document.getElementById('prev-profileImg')); document.getElementById('url-profileImg').value = sg.profileImg; }
  setValue('adminEmail', getEmail());
  setValue('contactEmail', sg.contactEmail || '');
  var disp = document.getElementById('currentEmailDisplay'); if(disp) disp.textContent = getEmail();
}

function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
function getVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function getCheck(id) { const el = document.getElementById(id); return el ? el.checked : false; }

/* -- SAVE SECTIONS -- */
async function saveSection(key) {
  switch(key) {
    case 'hero':
      await api('POST', '/section/hero', { badge1: getVal('heroBadge1'), badge2: getVal('heroBadge2'), h1l1: getVal('heroH1L1'), h1l2: getVal('heroH1L2'), sub: getVal('heroSub'), btnPrimary: getVal('heroBtnPrimary'), btnSecondary: getVal('heroBtnSecondary'), marquee: getVal('heroMarquee'), heroImg: getVal('url-heroImg'), profileImg: getVal('url-profileImg') }); break;
    case 'about':
      await api('POST', '/section/about', { introQ1: getVal('aboutIntroQ1'), introQ2: getVal('aboutIntroQ2'), body: getVal('aboutBody'), quote: getVal('aboutQuote') }); break;
    case 'stats':
      await api('POST', '/section/stats', collectStats()); break;
    case 'problems':
      await api('POST', '/section/problems', { eyebrow: getVal('probEyebrow'), h2l1: getVal('probH2L1'), h2l2: getVal('probH2L2'), img: getVal('url-probImg'), items: collectItems('problemsList', ['title','desc']) }); break;
    case 'experience':
      await api('POST', '/section/experience', { eyebrow: getVal('workEyebrow'), h2l1: getVal('workH2L1'), h2l2: getVal('workH2L2'), items: collectItems('workList', ['tags','title','titleL2','desc','company','linkedIn','img-work']) }); break;
    case 'approach':
      await api('POST', '/section/approach', { eyebrow: getVal('howEyebrow'), h2l1: getVal('howH2L1'), h2l2: getVal('howH2L2'), items: collectItems('approachList', ['title','desc','img-approach']) }); break;
    case 'testimonials':
      await api('POST', '/section/testimonials', { eyebrow: getVal('revEyebrow'), h2l1: getVal('revH2L1'), h2l2: getVal('revH2L2'), items: collectItems('testimonialList', ['company','quote','initials','name','role','color']) }); break;
    case 'services':
      await api('POST', '/section/services', { eyebrow: getVal('svcEyebrow'), h2: getVal('svcH2'), items: collectItems('serviceList', ['tab','title','scope','features','quote','quotePerson','quoteRole','img-svc']) }); break;
    case 'why':
      await api('POST', '/section/why', { eyebrow: getVal('whyEyebrow'), h2l1: getVal('whyH2L1'), h2l2: getVal('whyH2L2'), items: collectItems('whyList', ['title','desc','img-why']) }); break;
    case 'faq':
      await api('POST', '/section/faq', { items: collectItems('faqList', ['q','a']) }); break;
    case 'blog': {
      const bl = { visible: getCheck('blogVisible'), eyebrow: getVal('blogEyebrow'), h2: getVal('blogH2') };
      const blItems = collectItems('blogList', ['title','excerpt','date','link','img-blog']);
      await api('POST', '/section/blog', bl);
      await api('POST', '/blog', blItems);
      break; }
    case 'events': {
      const ev = { visible: getCheck('eventsVisible'), eyebrow: getVal('eventsEyebrow'), h2: getVal('eventsH2') };
      const evItems = collectItems('eventsList', ['title','date','location','desc','link']);
      await api('POST', '/section/events', ev);
      await api('POST', '/events', evItems);
      break; }
    case 'nav':
      await api('POST', '/section/nav', { links: collectNavLinks(), btnLabel: getVal('navBtnLabel'), btnUrl: getVal('navBtnUrl') }); break;
    case 'cta':
      await api('POST', '/section/cta', { l1: getVal('ctaL1'), l2: getVal('ctaL2'), btn: getVal('ctaBtn'), btnUrl: getVal('ctaBtnUrl'), footerName: getVal('footerName') }); break;
    case 'settings':
      await api('POST', '/section/settings', { name: getVal('settingsName'), linkedIn: getVal('settingsLinkedIn'), title: getVal('settingsTitle'), initials: getVal('settingsInitials'), profileImg: getVal('url-profileImg'), contactEmail: getVal('contactEmail') }); break;
  }
  toast('? ' + key.charAt(0).toUpperCase() + key.slice(1) + ' saved! Refresh site to see changes.', 'success');
}

function collectItems(listId, fields) {
  const entries = document.querySelectorAll('#' + listId + ' .item-entry');
  return Array.from(entries).map(entry => {
    const obj = {};
    fields.forEach(f => {
      if (f.startsWith('img-')) {
        obj.img = entry.querySelector('[data-img-url]') ? entry.querySelector('[data-img-url]').value : '';
      } else {
        const el = entry.querySelector('[data-field="' + f + '"]');
        obj[f] = el ? el.value : '';
      }
    });
    return obj;
  });
}
function collectStats() {
  return Array.from(document.querySelectorAll('#statsList .item-entry')).map(e => ({
    num: e.querySelector('[data-field="num"]').value,
    suf: e.querySelector('[data-field="suf"]').value,
    label: e.querySelector('[data-field="label"]').value
  }));
}
function collectNavLinks() {
  return Array.from(document.querySelectorAll('#navLinksForm .nav-link-row')).map(r => ({
    label: r.querySelector('[data-field="label"]').value,
    href: r.querySelector('[data-field="href"]').value
  }));
}

/* -- RENDER HELPERS -- */
function imgFieldHTML(prefix, idx, src) {
  const dzId = `dz-${prefix}-${idx}`, fileId = `file-${prefix}-${idx}`, prevId = `prev-${prefix}-${idx}`, urlId = `url-${prefix}-${idx}`;
  return `<div class="img-field" style="margin-top:.75rem">
    <label>Image</label>
    <div class="drop-zone" id="${dzId}" style="padding:1rem">
      <input type="file" accept="image/*" id="${fileId}">
      <div class="drop-zone-text"><strong>Drop image</strong> or click</div>
    </div>
    <div class="img-preview-wrap"><img class="img-preview${src?' show':''}" id="${prevId}" src="${src||''}" alt=""></div>
    <input type="text" class="img-url-input" id="${urlId}" data-img-url placeholder="…or paste URL" value="${src||''}">
  </div>`;
}
function initDZ(prefix, idx) {
  const dzId = `dz-${prefix}-${idx}`, fileId = `file-${prefix}-${idx}`, prevId = `prev-${prefix}-${idx}`, urlId = `url-${prefix}-${idx}`;
  const zone = document.getElementById(dzId), fileInput = document.getElementById(fileId), preview = document.getElementById(prevId), urlInput = document.getElementById(urlId);
  if (!zone||!fileInput) return;
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0], preview, urlInput));
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0], preview, urlInput); });
  urlInput.addEventListener('input', () => showPreview(urlInput.value, preview));
}

/* -- STATS -- */
function renderStats(items) {
  document.getElementById('statsList').innerHTML = items.map((s,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">Stat ${i+1}: ${s.label||''}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid three">
        <div class="field"><label>Number</label><input type="text" data-field="num" value="${s.num||''}"></div>
        <div class="field"><label>Suffix</label><input type="text" data-field="suf" value="${s.suf||''}"></div>
        <div class="field"><label>Label</label><input type="text" data-field="label" value="${s.label||''}"></div>
      </div></div>`).join('');
}
function addStat() { const d={num:'0',suf:'',label:'New Stat'}; const items=collectStats(); items.push(d); renderStats(items); }

/* -- PROBLEMS -- */
function renderProblems(items) {
  document.getElementById('problemsList').innerHTML = items.map((p,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">Problem ${i+1}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid one">
        <div class="field"><label>Title</label><input type="text" data-field="title" value="${esc(p.title||'')}"></div>
        <div class="field"><label>Description</label><textarea data-field="desc">${esc(p.desc||'')}</textarea></div>
      </div></div>`).join('');
}
function addProblem() { const items=collectItems('problemsList',['title','desc']); items.push({title:'',desc:''}); renderProblems(items); }

/* -- WORK -- */
function renderWork(items) {
  document.getElementById('workList').innerHTML = items.map((w,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">${w.company||'Work Card '+(i+1)}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>Title Line 1</label><input type="text" data-field="title" value="${esc(w.title||'')}"></div>
        <div class="field"><label>Title Line 2</label><input type="text" data-field="titleL2" value="${esc(w.titleL2||'')}"></div>
        <div class="field"><label>Tags (comma-separated)</label><input type="text" data-field="tags" value="${esc(w.tags||'')}"></div>
        <div class="field"><label>Company Name</label><input type="text" data-field="company" value="${esc(w.company||'')}"></div>
        <div class="field"><label>LinkedIn URL</label><input type="text" data-field="linkedIn" value="${esc(w.linkedIn||'')}"></div>
      </div>
      <div class="field" style="margin-top:.75rem"><label>Description</label><textarea data-field="desc">${esc(w.desc||'')}</textarea></div>
      ${imgFieldHTML('work',i,w.img)}
    </div>`).join('');
  items.forEach((_,i) => initDZ('work',i));
}
function addWork() { const items=collectItems('workList',['tags','title','titleL2','desc','company','linkedIn','img-work']); items.push({tags:'',title:'',titleL2:'',desc:'',company:'',linkedIn:'',img:''}); renderWork(items); }

/* -- APPROACH -- */
function renderApproach(items) {
  document.getElementById('approachList').innerHTML = items.map((a,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">Step ${i+1}: ${a.title||''}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid one">
        <div class="field"><label>Step Title</label><input type="text" data-field="title" value="${esc(a.title||'')}"></div>
        <div class="field"><label>Description</label><textarea data-field="desc">${esc(a.desc||'')}</textarea></div>
      </div>
      ${imgFieldHTML('approach',i,a.img)}
    </div>`).join('');
  items.forEach((_,i) => initDZ('approach',i));
}
function addApproach() { const items=collectItems('approachList',['title','desc','img-approach']); items.push({title:'',desc:'',img:''}); renderApproach(items); }

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* -- TESTIMONIALS -- */
const COLORS = ['#0078d4','#e30613','#6264a7','#1c3f6e','#005a9e','#3ecf8e','#41c0d2','#f5c518'];
function renderTestimonials(items) {
  document.getElementById('testimonialList').innerHTML = items.map((t,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">${t.name||'Testimonial '+(i+1)}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>Name</label><input type="text" data-field="name" value="${esc(t.name||'')}"></div>
        <div class="field"><label>Role / Company</label><input type="text" data-field="role" value="${esc(t.role||'')}"></div>
        <div class="field"><label>Company Label</label><input type="text" data-field="company" value="${esc(t.company||'')}"></div>
        <div class="field"><label>Avatar Initials</label><input type="text" data-field="initials" maxlength="3" value="${esc(t.initials||'')}"></div>
      </div>
      <div class="field" style="margin-top:.75rem"><label>Quote</label><textarea data-field="quote">${esc(t.quote||'')}</textarea></div>
      <div class="field" style="margin-top:.75rem"><label>Avatar Color</label>
        <div class="color-row">${COLORS.map(c=>`<div class="color-swatch${t.color===c?' selected':''}" style="background:${c}" onclick="pickColor(this,'${c}',${i})"></div>`).join('')}</div>
        <input type="hidden" data-field="color" value="${t.color||COLORS[0]}">
      </div></div>`).join('');
}
function pickColor(el, color, idx) {
  el.closest('.item-entry').querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('selected'));
  el.classList.add('selected');
  el.closest('.item-entry').querySelector('[data-field="color"]').value = color;
}
function addTestimonial() {
  const items = collectItems('testimonialList',['company','quote','initials','name','role','color']);
  items.push({company:'',quote:'',initials:'',name:'',role:'',color:COLORS[0]});
  renderTestimonials(items);
}

/* -- SERVICES -- */
function renderServices(items) {
  document.getElementById('serviceList').innerHTML = items.map((s,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">${s.tab||'Service '+(i+1)}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>Tab Label</label><input type="text" data-field="tab" value="${esc(s.tab||'')}"></div>
        <div class="field"><label>Service Title</label><input type="text" data-field="title" value="${esc(s.title||'')}"></div>
        <div class="field"><label>Scope Badge</label><input type="text" data-field="scope" value="${esc(s.scope||'')}"></div>
      </div>
      <div class="field" style="margin-top:.75rem"><label>Features (one per line)</label><textarea data-field="features" rows="5">${esc(s.features||'')}</textarea></div>
      <div class="form-grid" style="margin-top:.75rem">
        <div class="field"><label>Quote</label><textarea data-field="quote" rows="2">${esc(s.quote||'')}</textarea></div>
        <div><div class="field"><label>Quote Person</label><input type="text" data-field="quotePerson" value="${esc(s.quotePerson||'')}"></div>
        <div class="field" style="margin-top:.5rem"><label>Quote Role</label><input type="text" data-field="quoteRole" value="${esc(s.quoteRole||'')}"></div></div>
      </div>
      ${imgFieldHTML('svc',i,s.img)}
    </div>`).join('');
  items.forEach((_,i) => initDZ('svc',i));
}
function addService() {
  const items = collectItems('serviceList',['tab','title','scope','features','quote','quotePerson','quoteRole','img-svc']);
  items.push({tab:'',title:'',scope:'',features:'',quote:'',quotePerson:'',quoteRole:'',img:''});
  renderServices(items);
}

/* -- WHY -- */
function renderWhy(items) {
  document.getElementById('whyList').innerHTML = items.map((w,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">${w.title||'Card '+(i+1)}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>Title</label><input type="text" data-field="title" value="${esc(w.title||'')}"></div>
        <div class="field"><label>Description</label><textarea data-field="desc">${esc(w.desc||'')}</textarea></div>
      </div>
      ${imgFieldHTML('why',i,w.img)}
    </div>`).join('');
  items.forEach((_,i) => initDZ('why',i));
}
function addWhy() {
  const items = collectItems('whyList',['title','desc','img-why']);
  items.push({title:'',desc:'',img:''}); renderWhy(items);
}

/* -- FAQ -- */
function renderFaq(items) {
  document.getElementById('faqList').innerHTML = items.map((f,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">Q${i+1}: ${f.q||''}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid one">
        <div class="field"><label>Question</label><input type="text" data-field="q" value="${esc(f.q||'')}"></div>
        <div class="field"><label>Answer</label><textarea data-field="a">${esc(f.a||'')}</textarea></div>
      </div></div>`).join('');
}
function addFaq() {
  const items = collectItems('faqList',['q','a']);
  items.push({q:'',a:''}); renderFaq(items);
}

/* -- BLOG -- */
function renderBlog(items) {
  document.getElementById('blogList').innerHTML = items.map((b,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">${b.title||'Post '+(i+1)}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>Post Title</label><input type="text" data-field="title" value="${esc(b.title||'')}"></div>
        <div class="field"><label>Date</label><input type="text" data-field="date" value="${esc(b.date||'')}"></div>
        <div class="field"><label>External Link</label><input type="text" data-field="link" value="${esc(b.link||'')}"></div>
      </div>
      <div class="field" style="margin-top:.75rem"><label>Excerpt</label><textarea data-field="excerpt">${esc(b.excerpt||'')}</textarea></div>
      ${imgFieldHTML('blog',i,b.img)}
    </div>`).join('');
  items.forEach((_,i) => initDZ('blog',i));
}
function addBlog() {
  const items = collectItems('blogList',['title','excerpt','date','link','img-blog']);
  items.push({title:'',excerpt:'',date:'',link:'',img:''}); renderBlog(items);
}

/* -- EVENTS -- */
function renderEvents(items) {
  document.getElementById('eventsList').innerHTML = items.map((e,i) => `
    <div class="item-entry">
      <div class="item-entry-header"><span class="item-entry-title">${e.title||'Event '+(i+1)}</span>
        <div class="item-entry-actions"><button class="btn-delete-item" onclick="this.closest('.item-entry').remove()">?? Remove</button></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>Event Title</label><input type="text" data-field="title" value="${esc(e.title||'')}"></div>
        <div class="field"><label>Date</label><input type="text" data-field="date" value="${esc(e.date||'')}"></div>
        <div class="field"><label>Location</label><input type="text" data-field="location" value="${esc(e.location||'')}"></div>
        <div class="field"><label>Link (optional)</label><input type="text" data-field="link" value="${esc(e.link||'')}"></div>
      </div>
      <div class="field" style="margin-top:.75rem"><label>Description</label><textarea data-field="desc">${esc(e.desc||'')}</textarea></div>
    </div>`).join('');
}
function addEvent() {
  const items = collectItems('eventsList',['title','date','location','desc','link']);
  items.push({title:'',date:'',location:'',desc:'',link:''}); renderEvents(items);
}

/* -- NAV LINKS -- */
function buildNavLinks() {
  const nv = getData('nav');
  renderNavLinks(nv.links || []);
}
function renderNavLinks(links) {
  document.getElementById('navLinksForm').innerHTML = links.map((l,i) => `
    <div class="nav-link-row" style="display:contents">
      <div class="field"><label>Link ${i+1} Label</label><input type="text" data-field="label" value="${esc(l.label||'')}"></div>
      <div class="field"><label>Link ${i+1} Href</label><input type="text" data-field="href" value="${esc(l.href||'')}"></div>
    </div>`).join('');
}

/* ── CREDENTIALS MANAGEMENT ── */
const DEFAULT_EMAIL = 'admin@usmanafzal.com';

function getEmail() { return localStorage.getItem('ua_admin_email') || DEFAULT_EMAIL; }

function saveCredentials() {
  var newEmail = document.getElementById('adminEmail').value.trim();
  var np = document.getElementById('newPwd').value;
  var cp = document.getElementById('confirmPwd').value;
  if (!newEmail) { toast('Email / username cannot be empty.', 'error'); return; }
  if (np) {
    if (np !== cp) { toast('Passwords do not match.', 'error'); return; }
    if (np.length < 6) { toast('Password must be at least 6 characters.', 'error'); return; }
    localStorage.setItem('ua_admin_pwd', np);
    document.getElementById('newPwd').value = '';
    document.getElementById('confirmPwd').value = '';
  }
  localStorage.setItem('ua_admin_email', newEmail);
  var disp = document.getElementById('currentEmailDisplay');
  if (disp) disp.textContent = newEmail;
  toast('Credentials saved! Use them on next login.', 'success');
}