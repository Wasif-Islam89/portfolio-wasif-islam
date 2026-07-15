/* ═══════════════════════════════════════════
   WASIF DEV PORTFOLIO — script.js
   Sections:
   1. Space Canvas Animation
   2. Mouse Parallax
   3. Navbar Scroll & Mobile Toggle
   4. Smooth Scroll
   5. Active Nav on Scroll
   6. Portfolio Tabs
   7. Animated Counters
   8. Skill Bars (Intersection Observer)
   9. Fade-in Animations
   10. Contact Form
═══════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. SPACE CANVAS ANIMATION
   Stars, shooting stars, meteors, particles
───────────────────────────────────────── */
(function initSpaceCanvas() {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0;
  let H = 0;
  let dpr = 1;
  let mouseX = 0;
  let mouseY = 0;

  const STAR_COUNT = 220;
  const METEOR_COUNT = 4;
  const PARTICLE_COUNT = 40;

  let stars = [];
  let meteors = [];
  let particles = [];
  let shooters = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.7 + 0.15,
      blink: Math.random() * 0.008 + 0.002,
      dir: Math.random() > 0.5 ? 1 : -1,
      hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 210 : 280) : 220,
    };
  }

  function createShooter() {
    const angle = (Math.random() * 30 + 15) * (Math.PI / 180);
    const speed = Math.random() * 10 + 8;
    return {
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: Math.random() * 120 + 60,
      life: 0,
      maxLife: Math.floor(Math.random() * 30 + 20),
      alpha: 1,
      hue: Math.random() > 0.5 ? 200 : 260,
    };
  }

  function createMeteor() {
    return {
      x: -200 + Math.random() * W,
      y: Math.random() * H * 0.3,
      vx: Math.random() * 4 + 3,
      vy: Math.random() * 2 + 1,
      len: Math.random() * 200 + 100,
      width: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      hue: Math.random() > 0.5 ? '79,70,229' : '6,182,212',
    };
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.05,
      hue: ['79,70,229', '6,182,212', '168,85,247'][Math.floor(Math.random() * 3)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    };
  }

  function init() {
    resize();
    stars = Array.from({ length: STAR_COUNT }, createStar);
    meteors = Array.from({ length: METEOR_COUNT }, createMeteor);
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    shooters = [];
  }

  function drawStars(parallaxX, parallaxY) {
    stars.forEach(star => {
      star.alpha += star.blink * star.dir;
      if (star.alpha >= 0.85 || star.alpha <= 0.05) star.dir *= -1;

      ctx.save();
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = `hsl(${star.hue}, 80%, 80%)`;
      ctx.shadowColor = `hsl(${star.hue}, 80%, 70%)`;
      ctx.shadowBlur = star.r > 1 ? 8 : 0;
      ctx.beginPath();
      ctx.arc(
        star.x + parallaxX * 0.04,
        star.y + parallaxY * 0.04,
        star.r,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    });
  }

  function drawShooters() {
    shooters = shooters.filter(shooter => {
      shooter.life++;
      shooter.x += shooter.vx;
      shooter.y += shooter.vy;
      shooter.alpha = 1 - shooter.life / shooter.maxLife;

      const tailX = shooter.x - (shooter.vx / Math.hypot(shooter.vx, shooter.vy)) * shooter.len;
      const tailY = shooter.y - (shooter.vy / Math.hypot(shooter.vx, shooter.vy)) * shooter.len;
      const gradient = ctx.createLinearGradient(tailX, tailY, shooter.x, shooter.y);
      gradient.addColorStop(0, `hsla(${shooter.hue}, 80%, 70%, 0)`);
      gradient.addColorStop(1, `hsla(${shooter.hue}, 80%, 90%, ${shooter.alpha})`);

      ctx.save();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `hsl(${shooter.hue}, 80%, 70%)`;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(shooter.x, shooter.y);
      ctx.stroke();
      ctx.restore();

      return shooter.life < shooter.maxLife;
    });

    if (Math.random() < 0.008 && shooters.length < 5) {
      shooters.push(createShooter());
    }
  }

  function drawMeteors() {
    meteors.forEach(meteor => {
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;

      if (meteor.x > W + 300 || meteor.y > H + 100) {
        Object.assign(meteor, createMeteor());
        meteor.x = -200;
        meteor.y = Math.random() * H * 0.3;
      }

      const tx = meteor.x - (meteor.vx / Math.hypot(meteor.vx, meteor.vy)) * meteor.len;
      const ty = meteor.y - (meteor.vy / Math.hypot(meteor.vx, meteor.vy)) * meteor.len;
      const gradient = ctx.createLinearGradient(tx, ty, meteor.x, meteor.y);
      gradient.addColorStop(0, `rgba(${meteor.hue}, 0)`);
      gradient.addColorStop(0.5, `rgba(${meteor.hue}, ${meteor.alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(${meteor.hue}, ${meteor.alpha})`);

      ctx.save();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = meteor.width;
      ctx.shadowColor = `rgba(${meteor.hue}, 0.8)`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(meteor.x, meteor.y);
      ctx.stroke();

      ctx.globalAlpha = meteor.alpha * 0.9;
      ctx.fillStyle = `rgba(${meteor.hue}, 1)`;
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, meteor.width * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawParticles() {
    particles.forEach(particle => {
      particle.pulse += particle.pulseSpeed;
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) particle.x = W + 10;
      if (particle.x > W + 10) particle.x = -10;
      if (particle.y < -10) particle.y = H + 10;
      if (particle.y > H + 10) particle.y = -10;

      const alpha = particle.alpha * (0.7 + 0.3 * Math.sin(particle.pulse));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(${particle.hue}, 1)`;
      ctx.shadowColor = `rgba(${particle.hue}, 1)`;
      ctx.shadowBlur = particle.r * 4;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawNebulae() {
    const nebulae = [
      { x: W * 0.15, y: H * 0.25, r: 300, c: 'rgba(79,70,229,0.06)' },
      { x: W * 0.80, y: H * 0.60, r: 250, c: 'rgba(6,182,212,0.05)' },
      { x: W * 0.50, y: H * 0.80, r: 200, c: 'rgba(168,85,247,0.04)' },
    ];

    nebulae.forEach(n => {
      const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      gradient.addColorStop(0, n.c);
      gradient.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, n.r, n.r * 0.6, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const parallaxX = (mouseX - W / 2) * 0.015;
    const parallaxY = (mouseY - H / 2) * 0.015;

    drawNebulae();
    drawStars(parallaxX, parallaxY);
    drawMeteors();
    drawShooters();
    drawParticles();

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    resize();
    init();
  }, { passive: true });

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  init();
  render();
})();


/* ─────────────────────────────────────────
   2. MOUSE PARALLAX on hero elements
───────────────────────────────────────── */
(function initParallax() {
  const hero = document.querySelector('.hero-inner');
  if (!hero) return;

  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 14;
    hero.style.transform = `translate(${x * 0.12}px, ${y * 0.08}px)`;
  }, { passive: true });
})();


/* ─────────────────────────────────────────
   3. NAVBAR — scroll + mobile toggle
───────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (!navbar || !hamburger || !navLinks) return;

  const closeMenu = () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', e => {
    const clickedInsideNav = navbar.contains(e.target);
    if (!clickedInsideNav) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
})();



const texts = [
  "Frontend Developer",
  "WordPress Developer",
  "Shopify Developer"
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typingElement = document.getElementById("typing-text");

function typeEffect() {
  const currentText = texts[textIndex];

  if (!isDeleting) {
    typingElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentText.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1500);
      return;
    }
  } else {
    typingElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
    }
  }

  setTimeout(typeEffect, isDeleting ? 50 : 100);
}

typeEffect();


/* ─────────────────────────────────────────
   4. SMOOTH SCROLL (fallback for older Safari)
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  const href = anchor.getAttribute('href');
  if (!href || href === '#' || anchor.hasAttribute('download')) return;

  const target = document.querySelector(href);
  if (!target) return;

  anchor.addEventListener('click', e => {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


/* ─────────────────────────────────────────
   5. ACTIVE NAV LINK on scroll
───────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) {
          active.classList.add('active');
        }
      }
    });
  }, { rootMargin: '-35% 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));
})();


/* ─────────────────────────────────────────
   6. PORTFOLIO TABS
───────────────────────────────────────── */
(function initPortfolioTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.port-card');
  if (!tabs.length || !cards.length) return;

  function showCategory(category) {
    cards.forEach(card => {
      const isMatch = card.dataset.category === category;
      card.style.display = isMatch ? '' : 'none';
      if (isMatch) {
        card.style.animation = 'fadeUp 0.5s ease forwards';
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(btn => btn.classList.remove('active'));
      tab.classList.add('active');
      showCategory(tab.dataset.filter || 'frontend');
    });
  });

  showCategory('frontend');
})();


/* ─────────────────────────────────────────
   7. ANIMATED COUNTERS
───────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  let triggered = false;

  function animateCount(el) {
    const target = Number(el.dataset.target || 0);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(ease * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        counters.forEach(counter => animateCount(counter));
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) observer.observe(heroStats);
})();


/* ─────────────────────────────────────────
   8. SKILL BARS
───────────────────────────────────────── */
(function initSkillBars() {
  const skillItems = document.querySelectorAll('.skill-item[data-percent]');
  if (!skillItems.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const bar = entry.target.querySelector('.skill-bar');
      if (bar && !bar.style.width) {
        const index = Array.from(skillItems).indexOf(entry.target);
        const pct = entry.target.dataset.percent + '%';
        setTimeout(() => {
          bar.style.width = pct;
        }, index * 80);
      }

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  skillItems.forEach(item => observer.observe(item));
})();


/* ─────────────────────────────────────────
   9. FADE-IN ANIMATIONS (scroll reveal)
───────────────────────────────────────── */
(function initFadeIn() {
  const targets = [
    '.service-card',
    '.port-card',
    '.tl-card',
    '.about-grid',
    '.skills-grid',
    '.contact-grid',
    '.expertise-item',
    '.section-header',
    '.hero-stats',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (!el.classList.contains('fade-in-up')) {
        el.classList.add('fade-in-up');
      }
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────
   10. CONTACT FORM
───────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    if (!button) return;

    const originalHTML = button.innerHTML;
    button.innerHTML = '<span>Sending…</span>';
    button.disabled = true;

    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.disabled = false;

      feedback.className = 'form-feedback success';
      feedback.textContent = '✓ Message sent! I\'ll get back to you within 24 hours.';

      form.reset();

      setTimeout(() => {
        feedback.className = 'form-feedback';
        feedback.textContent = '';
      }, 6000);
    }, 1400);
  });
})();


/* ─────────────────────────────────────────
   SERVICE CARD GLOW — mouse tracking
───────────────────────────────────────── */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const glow = card.querySelector('.service-glow');
    if (!glow) return;

    glow.style.left = `${e.clientX - rect.left - 100}px`;
    glow.style.top = `${e.clientY - rect.top - 100}px`;
  });
});
