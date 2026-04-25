/* =============================================================
   Nova Web Solutions — vanilla JS (no frameworks)
   ============================================================= */

(function () {
  'use strict';

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky navbar ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 24) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    const toggle = (force) => {
      const open = typeof force === 'boolean' ? force : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', open);
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    };
    hamburger.addEventListener('click', () => toggle());
    navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger when items enter together
          setTimeout(() => entry.target.classList.add('in'), i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Particle canvas (hero) ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const particles = [];
    const COUNT = window.innerWidth < 768 ? 36 : 70;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.4,
        });
      }
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      // particles
      ctx.fillStyle = 'rgba(57,255,20,0.85)';
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      // connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            const alpha = 1 - d2 / 14000;
            ctx.strokeStyle = `rgba(57,255,20,${alpha * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    };

    const start = () => { resize(); init(); step(); };
    start();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 150);
    });
  }

  /* ---------- Contact form: validation + success ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const fields = form.querySelectorAll('input, textarea');
    const successEl = form.querySelector('.form-success');
    const submitBtn = form.querySelector('button[type="submit"]');

    const showError = (input, msg) => {
      const field = input.closest('.field');
      if (!field) return;
      field.classList.add('invalid');
      const err = field.querySelector('.field-error');
      if (err) err.textContent = msg;
    };
    const clearError = (input) => {
      const field = input.closest('.field');
      if (!field) return;
      field.classList.remove('invalid');
      const err = field.querySelector('.field-error');
      if (err) err.textContent = '';
    };
    const validateField = (input) => {
      const v = input.value.trim();
      if (input.required && !v) { showError(input, 'This field is required.'); return false; }
      if (input.type === 'email' && v) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (!ok) { showError(input, 'Please enter a valid email address.'); return false; }
      }
      if (input.minLength && v.length < input.minLength) {
        showError(input, `Please enter at least ${input.minLength} characters.`);
        return false;
      }
      clearError(input);
      return true;
    };

    fields.forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      fields.forEach((input) => { if (!validateField(input)) valid = false; });
      if (!valid) {
        const firstInvalid = form.querySelector('.field.invalid input, .field.invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulate sending (no backend wired; placeholder for real endpoint)
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        if (successEl) {
          successEl.classList.add('show');
          successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        form.reset();
        // hide message after a while
        setTimeout(() => { if (successEl) successEl.classList.remove('show'); }, 6000);
      }, 900);
    });
  }

  /* ---------- Location rotator with glitch effect ---------- */
  const locationEl = document.getElementById('location-text');
  if (locationEl) {
    const LOCATIONS = [
      'Johannesburg',
      'Pretoria',
      'Sandton',
      'Cape Town',
      'Gauteng',
      'South Africa',
    ];

    // Lock the element's min-width to the widest word so layout never shifts.
    // We measure each word by temporarily swapping text content.
    (function lockWidth() {
      const saved = locationEl.textContent;
      // force layout visibility before measuring
      locationEl.style.display = 'inline-block';
      let maxW = 0;
      LOCATIONS.forEach((word) => {
        locationEl.textContent = word;
        maxW = Math.max(maxW, locationEl.offsetWidth);
      });
      locationEl.textContent = saved;
      locationEl.dataset.text = saved;
      if (maxW > 0) locationEl.style.minWidth = maxW + 'px';
    }());

    let currentIdx = LOCATIONS.indexOf(locationEl.textContent.trim());
    if (currentIdx < 0) currentIdx = LOCATIONS.length - 1; // default to last ("South Africa")

    const INTERVAL    = 2600;  // ms between changes
    const GLITCH_DUR  = 380;   // ms total glitch animation
    const SWAP_DELAY  = 160;   // ms into glitch when text actually swaps (mid-glitch)

    // Skip animation for users who prefer reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rotate = () => {
      currentIdx = (currentIdx + 1) % LOCATIONS.length;
      const nextWord = LOCATIONS[currentIdx];

      if (prefersReduced) {
        // Simple instant swap with no animation
        locationEl.textContent = nextWord;
        locationEl.dataset.text = nextWord;
        return;
      }

      // 1 — start the glitch
      locationEl.classList.add('glitching');

      // 2 — swap text at the mid-point so it looks like the glitch births the new word
      setTimeout(() => {
        locationEl.textContent = nextWord;
        locationEl.dataset.text = nextWord; // keeps ::before / ::after in sync
      }, SWAP_DELAY);

      // 3 — remove glitch class so powerfulPulse resumes
      setTimeout(() => {
        locationEl.classList.remove('glitching');
      }, GLITCH_DUR);
    };

    setInterval(rotate, INTERVAL);
  }
})();
