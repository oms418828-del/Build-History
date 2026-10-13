(() => {
  'use strict';

  /* ===== EDIT ME: your contact links =====
     Leave a value as "" and that button simply stays hidden. */
  const CONFIG = {
    email: 'oms418828@gmail.com',      // e.g. 'om.sharma@gmail.com'
    phone: '',      // e.g. '+91 98765 43210'
    location: '',   // e.g. 'Ranchi, Jharkhand, India'
    github: '',     // e.g. 'https://github.com/your-username'
    linkedin: ''    // e.g. 'https://www.linkedin.com/in/your-name'
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ===== Intro ===== */
  const intro = $('#intro');
  let introClosed = false;
  let rafId = 0;

  function startPage() {
    body.classList.add('ready');
    startTyping();
  }

  function closeIntro() {
    if (introClosed) return;
    introClosed = true;
    cancelAnimationFrame(rafId);
    try { sessionStorage.setItem('omIntroSeen', '1'); } catch (_) {}
    if (intro) intro.classList.add('is-done');
    body.classList.remove('intro-lock');
    setTimeout(startPage, reduce ? 0 : 450);
  }

  function runIntro() {
    const fill = $('#loaderFill'), heart = $('#loaderHeart'), pct = $('#loaderPct');
    const duration = 2800, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2.2);
      const v = Math.round(eased * 100);
      if (fill) fill.style.width = v + '%';
      if (heart) heart.style.left = v + '%';
      if (pct) pct.textContent = v + '%';
      if (p < 1) rafId = requestAnimationFrame(tick); else setTimeout(closeIntro, 250);
    };
    rafId = requestAnimationFrame(tick);
    setTimeout(closeIntro, duration + 1500); // safety net
  }

  let seen = false;
  try { seen = sessionStorage.getItem('omIntroSeen') === '1'; } catch (_) {}
  if (!intro || reduce || seen) {
    if (intro) intro.classList.add('is-done');
    body.classList.remove('intro-lock');
    introClosed = true;
    startPage();
  } else {
    runIntro();
  }
  const skip = $('#skipIntro');
  if (skip) skip.addEventListener('click', closeIntro);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeIntro(); });

  /* ===== Typing roles ===== */
  const roles = ['frontend', 'backend', 'full stack web dev', 'Java, C & C++', 'Excel magic', 'cloud (just starting!)'];
  let typingStarted = false;
  function startTyping() {
    const el = $('#typed');
    if (!el || typingStarted) return;
    typingStarted = true;
    if (reduce) return;
    let r = 0, c = roles[0].length, deleting = true;
    const step = () => {
      const word = roles[r];
      if (deleting) { c--; } else { c++; }
      el.textContent = word.slice(0, c);
      let delay = deleting ? 45 : 85;
      if (!deleting && c === word.length) { delay = 1500; deleting = true; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 300; }
      setTimeout(step, delay);
    };
    setTimeout(step, 1600);
  }

  /* ===== Skill hearts ===== */
  $$('.skill').forEach(card => {
    const level = Math.max(0, Math.min(5, parseInt(card.dataset.level, 10) || 0));
    const box = $('.level', card);
    if (!box) return;
    let html = '';
    for (let i = 0; i < 5; i++) html += `<span class="h${i < level ? ' on' : ''}" style="--i:${i}" aria-hidden="true">♥</span>`;
    html += `<em>${box.dataset.label || ''}</em>`;
    box.innerHTML = html;
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', `${box.dataset.label || 'level'}: ${level} out of 5`);
  });

  /* ===== Scroll reveal ===== */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ===== Scroll progress + active nav ===== */
  const bar = $('#progress');
  const spyLinks = $$('[data-spy]');
  const spySections = spyLinks.map(a => document.getElementById(a.dataset.spy)).filter(Boolean);
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    let current = '';
    const line = window.innerHeight * 0.35;
    spySections.forEach(s => { if (s.getBoundingClientRect().top <= line) current = s.id; });
    spyLinks.forEach(a => a.classList.toggle('active', a.dataset.spy === current));
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ===== Mobile menu ===== */
  const toggle = $('#menuToggle'), nav = $('#nav');
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  }
  if (toggle) toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.addEventListener('click', e => { if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false); });

  /* ===== Cute page transition (pink iris wipe) ===== */
  const curtain = $('#curtain');
  let busy = false;
  function goTo(target, x, y) {
    const top = target.id === 'home' ? 0 : target.getBoundingClientRect().top + window.scrollY - 70;
    const jump = () => window.scrollTo(0, Math.max(0, top));
    if (!curtain || reduce) { jump(); return; }
    busy = true;
    curtain.style.setProperty('--cx', x + 'px');
    curtain.style.setProperty('--cy', y + 'px');
    curtain.classList.add('cover');
    setTimeout(() => {
      jump();
      curtain.classList.add('fade');
      setTimeout(() => {
        curtain.classList.add('reset');
        curtain.classList.remove('cover', 'fade');
        void curtain.offsetWidth;
        curtain.classList.remove('reset');
        busy = false;
        onScroll();
      }, 520);
    }, 780);
  }
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      if (busy) return;
      const r = a.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
      goTo(target, x, y);
      try { history.replaceState(null, '', '#' + id); } catch (_) {}
    });
  });

  /* ===== Mascot eyes follow pointer ===== */
  const mascot = $('#mascot'), pupils = $('#pupils');
  if (mascot && pupils && !reduce) {
    window.addEventListener('pointermove', e => {
      const r = mascot.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.55);
      const d = Math.hypot(dx, dy) || 1, m = Math.min(7, d / 40);
      pupils.style.transform = `translate(${(dx / d) * m}px, ${(dy / d) * m}px)`;
    }, { passive: true });
  }

  /* ===== Sparkle trail + heart burst (mouse/touch, light) ===== */
  if (!reduce) {
    const glyphs = ['✦', '✧', '♥', '✿'];
    let last = 0;
    window.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - last < 70) return;
      last = now;
      const s = document.createElement('span');
      s.className = 'trail';
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 850);
    }, { passive: true });
    window.addEventListener('pointerdown', e => {
      for (let i = 0; i < 6; i++) {
        const h = document.createElement('span');
        const a = (Math.PI * 2 * i) / 6 + Math.random() * 0.6, dist = 40 + Math.random() * 30;
        h.className = 'burst'; h.textContent = '♥';
        h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
        h.style.setProperty('--bx', Math.cos(a) * dist + 'px');
        h.style.setProperty('--by', Math.sin(a) * dist + 'px');
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 950);
      }
    }, { passive: true });
  }

  /* ===== Contact links ===== */
  const toast = $('#toast');
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    setTimeout(() => { if (toast.textContent === msg) toast.textContent = ''; }, 2500);
  }
  let anyLink = false;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.email);
  const urlOk = u => /^https?:\/\//i.test(u);
  const emailBtn = $('[data-link="email"]'), ghBtn = $('[data-link="github"]'), liBtn = $('[data-link="linkedin"]'), copyBtn = $('#copyEmail');
  if (emailOk && emailBtn) { emailBtn.href = 'mailto:' + CONFIG.email; emailBtn.hidden = false; anyLink = true; }
  if (emailOk && copyBtn) {
    copyBtn.hidden = false;
    copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(CONFIG.email); say('email copied ♥'); }
      catch (_) { say(CONFIG.email); }
    });
  }
  if (urlOk(CONFIG.github) && ghBtn) { ghBtn.href = CONFIG.github; ghBtn.hidden = false; anyLink = true; }
  if (urlOk(CONFIG.linkedin) && liBtn) { liBtn.href = CONFIG.linkedin; liBtn.hidden = false; anyLink = true; }
  // contact info list
  function info(key, text, href) {
    const li = $(`[data-info="${key}"]`);
    if (!li || !text) return false;
    const a = $('a', li), v = $('.val', li);
    if (a) { a.textContent = text.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, ''); a.href = href; }
    if (v) v.textContent = text;
    li.hidden = false;
    return true;
  }
  const phoneOk = /^[+\d][\d\s().-]{6,}$/.test(CONFIG.phone);
  if (emailOk) info('email', CONFIG.email, 'mailto:' + CONFIG.email);
  if (phoneOk) { info('phone', CONFIG.phone, 'tel:' + CONFIG.phone.replace(/[^\d+]/g, '')); anyLink = true; }
  if (urlOk(CONFIG.github)) info('github', CONFIG.github, CONFIG.github);
  if (urlOk(CONFIG.linkedin)) info('linkedin', CONFIG.linkedin, CONFIG.linkedin);
  if (info('location', CONFIG.location, '#')) anyLink = true;
  // keep the "on their way" line until GitHub & LinkedIn are added
  const soon = $('#contactSoon'); if (soon) soon.hidden = urlOk(CONFIG.github) && urlOk(CONFIG.linkedin);

  // message form -> opens the visitor's email app with everything pre-filled
  const form = $('#msgForm');
  if (form && emailOk) {
    form.hidden = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const n = $('#fName'), m = $('#fMsg'), em = $('#fEmail');
      const nv = n.value.trim(), mv = m.value.trim(), ev = em.value.trim();
      n.classList.toggle('bad', !nv); m.classList.toggle('bad', !mv);
      em.classList.toggle('bad', !!ev && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev));
      if (!nv || !mv || em.classList.contains('bad')) { say('please fill the highlighted fields ✿'); return; }
      const subject = `Portfolio message from ${nv}`;
      const text = `${mv}\n\n— ${nv}${ev ? ' (' + ev + ')' : ''}`;
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      say('opening your email app ♥');
      form.reset();
    });
  }

  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
})();
