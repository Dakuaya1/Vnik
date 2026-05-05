// ============================================================
// CURSOR SPOTLIGHT
// ============================================================
const spotlight = document.getElementById('cursorSpotlight');
if (spotlight) {
  document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--cursor-x', e.clientX + 'px');
    document.documentElement.style.setProperty('--cursor-y', e.clientY + 'px');
  });
}

// ============================================================
// HAMBURGER MENU
// ============================================================
const navHamburger = document.getElementById('navHamburger');
const navMobileOverlay = document.getElementById('navMobileOverlay');
if (navHamburger && navMobileOverlay) {
  navHamburger.addEventListener('click', () => {
    const isOpen = navHamburger.classList.toggle('open');
    navMobileOverlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navMobileOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navHamburger.classList.remove('open');
      navMobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ============================================================
// PROGRESS BAR
// ============================================================
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressBar.style.width = scrolled + '%';
});

// ============================================================
// NAVBAR SCROLL
// ============================================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
});

// ============================================================
// STICKY CTA
// ============================================================
const stickyCta = document.getElementById('stickyCta');
const whatsappFloat = document.querySelector('.whatsapp-float');
window.addEventListener('scroll', () => {
  const show = window.scrollY > 500;
  stickyCta?.classList.toggle('show', show);
  whatsappFloat?.classList.toggle('visible', show);
});

// ============================================================
// INTERSECTION OBSERVER — SCROLL REVEAL
// ============================================================
const revealEls = document.querySelectorAll(
  '.section-tag, .section-title, .gold-divider, .section-body, ' +
  '.trust-item, .about-visual, .about-feature, .product-card, ' +
  '.sig-product, .pl-step, .pl-visual, .compliance-card, .globe-visual, .country-tag, ' +
  '.why-card, .contact-detail, .contact-form'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Stagger product cards and why cards
      const el = entry.target;
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
      const idx = siblings.indexOf(el);
      const delay = (el.classList.contains('product-card') ||
                     el.classList.contains('why-card') ||
                     el.classList.contains('country-tag') ||
                     el.classList.contains('compliance-card') ||
                     el.classList.contains('about-feature') ||
                     el.classList.contains('testimonial-card'))
                    ? idx * 80 : 0;
      
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

// ============================================================
// COUNT-UP ANIMATION
// ============================================================
const countEls = document.querySelectorAll('.trust-number[data-count]');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.hasAttribute('data-suffix') ? el.getAttribute('data-suffix') : '+';
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current) + suffix;
    }, 16);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
countEls.forEach(el => countObserver.observe(el));

// ============================================================
// PARALLAX LAYERS
// ============================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const parallaxEls = document.querySelectorAll('[data-parallax]');
let ticking = false;

function updateParallax() {
  const y = window.scrollY;
  parallaxEls.forEach(el => {
    const speed = parseFloat(el.dataset.parallax || '0');
    const rect = el.getBoundingClientRect();
    const viewportOffset = rect.top - window.innerHeight;
    if (viewportOffset < 200 && rect.bottom > -200) {
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    }
  });
  ticking = false;
}

if (!reduceMotion) {
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
  updateParallax();
}

// ============================================================
// FORM SUBMIT HANDLER
// ============================================================
function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = form.querySelector('.form-submit');
  const data = new FormData(form);
  const subject = encodeURIComponent('Vnik Export Enquiry');
  const lines = [
    `Name: ${data.get('name') || ''}`,
    `Company: ${data.get('company') || ''}`,
    `Email: ${data.get('email') || ''}`,
    `Country: ${data.get('country') || ''}`,
    `Product Interest: ${data.get('product') || ''}`,
    '',
    data.get('message') || ''
  ];
  window.location.href = `mailto:gentlementea@gmail.com?cc=prithviesharma@gmail.com&subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`;
  btn.textContent = 'Opening Email...';
  btn.style.background = '#2a6b5e';
  btn.style.color = '#f0ebe0';
  btn.style.letterSpacing = '0.18em';
  setTimeout(() => {
    btn.textContent = 'Send Enquiry →';
    btn.style.background = '';
    btn.style.color = '';
  }, 3500);
}

// ============================================================
// ACTIVE PAGE LINK
// ============================================================
const currentPage = document.body.dataset.page;
if (currentPage) {
  document.querySelectorAll(`.nav-links a[data-page="${currentPage}"]`).forEach(link => link.classList.add('active'));
}

// ============================================================
// SMOOTH ANCHOR LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ============================================================
// HERO ENHANCEMENTS
// ============================================================

// Create floating particles
function createHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (8 + Math.random() * 6) + 's';
    container.appendChild(particle);
  }
}

// Trigger glow burst on load
function triggerGlowBurst() {
  const glowBurst = document.getElementById('heroGlowBurst');
  if (!glowBurst) return;

  setTimeout(() => {
    glowBurst.classList.add('animate');
    setTimeout(() => {
      glowBurst.classList.remove('animate');
    }, 1500);
  }, 200);
}

// Magnetic button effect
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-magnetic');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// Hero parallax depth effect
function initHeroParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const xOffset = (clientX / innerWidth - 0.5) * 20;
    const yOffset = (clientY / innerHeight - 0.5) * 20;

    const showcase = hero.querySelector('.hero-showcase');
    if (showcase) {
      showcase.style.transform = `rotateX(${-yOffset * 0.3}deg) rotateY(${xOffset * 0.3}deg)`;
    }
  });

  hero.addEventListener('mouseleave', () => {
    const showcase = hero.querySelector('.hero-showcase');
    if (showcase) {
      showcase.style.transform = '';
    }
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  createHeroParticles();
  triggerGlowBurst();
  initMagneticButtons();
  initHeroParallax();
});
