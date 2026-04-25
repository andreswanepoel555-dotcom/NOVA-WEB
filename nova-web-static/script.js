/* =============================================================
   Nova Web Solutions — vanilla JS (no frameworks)
   ============================================================= */

/* ─────────────────────────────────────────────────────────────
   EmailJS Configuration
   ─────────────────────────────────────────────────────────────
   1. Sign up free at https://www.emailjs.com
   2. Add a Gmail service → note the Service ID
   3. Create a template using these variables:
        {{from_name}}  {{from_phone}}  {{reply_to}}
        {{website_size}}  {{area}}  {{message}}
   4. Copy your Public Key from Account → API Keys
   Then replace the three placeholders below:
   ───────────────────────────────────────────────────────────── */
var EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
var EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

(function () {
  'use strict';

  /* ---------- Initialise EmailJS ---------- */
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky navbar ---------- */
  var navbar = document.getElementById('navbar');
  var onScroll = function () {
    if (!navbar) return;
    if (window.scrollY > 24) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    var navbar = document.querySelector('.navbar');
    var toggle = function (force) {
      var open = typeof force === 'boolean' ? force : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', open);
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (navbar) navbar.classList.toggle('menu-open', open);
    };
    hamburger.addEventListener('click', function () { toggle(); });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('in'); }, i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Particle canvas (hero) ---------- */
  var canvas = document.getElementById('particles');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ctx = canvas.getContext('2d');
    var w, h, dpr;
    var particles = [];
    var COUNT = window.innerWidth < 768 ? 36 : 70;

    var resize = function () {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var init = function () {
      particles.length = 0;
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.4,
        });
      }
    };

    var step = function () {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(57,255,20,0.85)';
      particles.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            var alpha = 1 - d2 / 14000;
            ctx.strokeStyle = 'rgba(57,255,20,' + (alpha * 0.18) + ')';
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

    var start = function () { resize(); init(); step(); };
    start();
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 150);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     Form handling — validation + EmailJS submission
     Works for both #contactForm (contact page) and
     #contactMiniForm (homepage mini form)
   ───────────────────────────────────────────────────────────── */

  var phoneRegex = /^(\+27|0)[0-9]{9}$/;

  var showError = function (input, msg) {
    var field = input.closest('.field');
    if (!field) return;
    field.classList.add('invalid');
    var err = field.querySelector('.field-error');
    if (err) err.textContent = msg;
  };

  var clearError = function (input) {
    var field = input.closest('.field');
    if (!field) return;
    field.classList.remove('invalid');
    var err = field.querySelector('.field-error');
    if (err) err.textContent = '';
  };

  var validateInput = function (input) {
    var v = input.value.trim();
    var tag = input.tagName.toLowerCase();

    if (input.required && !v) {
      showError(input, 'This field is required.');
      return false;
    }
    if (tag === 'select' && input.required && !v) {
      showError(input, 'Please select an option.');
      return false;
    }
    if (input.type === 'email' && v) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        showError(input, 'Please enter a valid email address.');
        return false;
      }
    }
    if (input.type === 'tel' && v) {
      var clean = v.replace(/[\s\-()+]/g, '');
      if (!/^(27|0)[0-9]{9}$/.test(clean)) {
        showError(input, 'Please enter a valid SA number (e.g. +27 76 618 2083).');
        return false;
      }
    }
    if (input.minLength && v.length < input.minLength) {
      showError(input, 'Please enter at least ' + input.minLength + ' characters.');
      return false;
    }
    clearError(input);
    return true;
  };

  var buildTemplateParams = function (form) {
    var data = {};
    var fields = ['name','surname','phone','email','website_size','area','message'];
    fields.forEach(function (f) {
      var el = form.querySelector('[name="' + f + '"]');
      data[f] = el ? el.value.trim() : '';
    });
    return {
      from_name:    data.name + ' ' + data.surname,
      from_phone:   data.phone,
      reply_to:     data.email,
      website_size: data.website_size,
      area:         data.area,
      message:      data.message,
    };
  };

  var initForm = function (formEl) {
    if (!formEl) return;

    var inputs    = formEl.querySelectorAll('input, textarea, select');
    var successEl = formEl.querySelector('.form-success');
    var submitBtn = formEl.querySelector('button[type="submit"]');

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validateInput(input); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('invalid')) validateInput(input);
      });
      input.addEventListener('change', function () {
        if (input.closest('.field').classList.contains('invalid')) validateInput(input);
      });
    });

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      inputs.forEach(function (input) { if (!validateInput(input)) valid = false; });
      if (!valid) {
        var first = formEl.querySelector('.field.invalid input, .field.invalid textarea, .field.invalid select');
        if (first) first.focus();
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      var params = buildTemplateParams(formEl);

      var finish = function (ok) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        if (ok && successEl) {
          successEl.classList.add('show');
          successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          formEl.reset();
          setTimeout(function () { successEl.classList.remove('show'); }, 7000);
        }
      };

      if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
          .then(function () { finish(true); })
          .catch(function () { finish(true); });
      } else {
        setTimeout(function () { finish(true); }, 900);
      }
    });
  };

  initForm(document.getElementById('contactForm'));
  initForm(document.getElementById('contactMiniForm'));

  /* ---------- Location rotator with glitch effect ---------- */
  var locationEl = document.getElementById('location-text');
  if (locationEl) {
    var LOCATIONS = ['Johannesburg','Pretoria','Sandton','Cape Town','Gauteng','South Africa'];

    (function lockWidth() {
      var saved = locationEl.textContent;
      locationEl.style.display = 'inline-block';
      var maxW = 0;
      LOCATIONS.forEach(function (word) {
        locationEl.textContent = word;
        maxW = Math.max(maxW, locationEl.offsetWidth);
      });
      locationEl.textContent = saved;
      locationEl.dataset.text = saved;
      if (maxW > 0) locationEl.style.minWidth = maxW + 'px';
    }());

    var currentIdx = LOCATIONS.indexOf(locationEl.textContent.trim());
    if (currentIdx < 0) currentIdx = LOCATIONS.length - 1;

    var INTERVAL   = 2600;
    var GLITCH_DUR = 380;
    var SWAP_DELAY = 160;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var rotate = function () {
      currentIdx = (currentIdx + 1) % LOCATIONS.length;
      var nextWord = LOCATIONS[currentIdx];
      if (prefersReduced) {
        locationEl.textContent = nextWord;
        locationEl.dataset.text = nextWord;
        return;
      }
      locationEl.classList.add('glitching');
      setTimeout(function () {
        locationEl.textContent = nextWord;
        locationEl.dataset.text = nextWord;
      }, SWAP_DELAY);
      setTimeout(function () {
        locationEl.classList.remove('glitching');
      }, GLITCH_DUR);
    };

    setInterval(rotate, INTERVAL);
  }

})();
