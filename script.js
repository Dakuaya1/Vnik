// ============================================================
// CURSOR SPOTLIGHT + SHARED MOUSE TRACKING
// ============================================================
const spotlight = document.getElementById('cursorSpotlight');
let mouseNX = 0, mouseNY = 0; // normalised -1..1
document.addEventListener('mousemove', (e) => {
  mouseNX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseNY = (e.clientY / window.innerHeight - 0.5) * 2;
  if (spotlight) {
    document.documentElement.style.setProperty('--cursor-x', e.clientX + 'px');
    document.documentElement.style.setProperty('--cursor-y', e.clientY + 'px');
  }
});

// ============================================================
// HAMBURGER MENU
// ============================================================
let navHamburger = document.getElementById('navHamburger');
let navMobileOverlay = document.getElementById('navMobileOverlay');
const nav = document.getElementById('navbar');

if (nav && !navHamburger) {
  navHamburger = document.createElement('button');
  navHamburger.className = 'nav-hamburger';
  navHamburger.id = 'navHamburger';
  navHamburger.type = 'button';
  navHamburger.setAttribute('aria-label', 'Open menu');
  navHamburger.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(navHamburger);
}

if (nav && !navMobileOverlay) {
  navMobileOverlay = document.createElement('div');
  navMobileOverlay.className = 'nav-mobile-overlay';
  navMobileOverlay.id = 'navMobileOverlay';
  const navLinks = nav.querySelectorAll('.nav-links a');
  navMobileOverlay.innerHTML = Array.from(navLinks)
    .map(link => `<a href="${link.getAttribute('href')}">${link.textContent.trim()}</a>`)
    .join('');
  nav.insertAdjacentElement('afterend', navMobileOverlay);
}

if (navHamburger && navMobileOverlay) {
  navMobileOverlay.setAttribute('aria-hidden', 'true');
  navHamburger.setAttribute('aria-controls', navMobileOverlay.id);
  navHamburger.setAttribute('aria-expanded', 'false');

  const closeMobileMenu = () => {
    navHamburger.classList.remove('open');
    navMobileOverlay.classList.remove('open');
    navMobileOverlay.setAttribute('aria-hidden', 'true');
    navHamburger.setAttribute('aria-expanded', 'false');
    navHamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  };

  navHamburger.addEventListener('click', () => {
    const isOpen = navHamburger.classList.toggle('open');
    navMobileOverlay.classList.toggle('open', isOpen);
    navMobileOverlay.setAttribute('aria-hidden', String(!isOpen));
    navHamburger.setAttribute('aria-expanded', String(isOpen));
    navHamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navMobileOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

// ============================================================
// PROGRESS BAR
// ============================================================
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  if (!progressBar) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressBar.style.width = scrolled + '%';
});

// ============================================================
// NAVBAR SCROLL
// ============================================================
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 80);
});

// ============================================================
// STICKY CTA & WHATSAPP
// ============================================================
const stickyCta = document.getElementById('stickyCta');
const whatsappFloat = document.querySelector('.whatsapp-float');
window.addEventListener('scroll', () => {
  const show = window.scrollY > 500;
  stickyCta?.classList.toggle('show', show);
  whatsappFloat?.classList.toggle('visible', show);
});

// ============================================================
// HERO PARALLAX ON SCROLL
// ============================================================
const hero = document.getElementById('hero');
const heroBgImage = document.querySelector('.hero-bg-image');
const heroContent = document.querySelector('.hero-content');
const heroScrollHint = document.querySelector('.hero-scroll-hint');
const heroDepthSpace = document.getElementById('heroDepthSpace');
const heroDepthPlanes = document.querySelectorAll('.hero-depth-plane');
const trustStrip = document.getElementById('trust');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hero && heroContent) {
  let ticking = false;

  const renderHeroDepth = () => {
    const scrollY = window.scrollY;
    const heroH  = hero.offsetHeight;
    const progress = Math.min(Math.max(scrollY / Math.max(heroH, 1), 0), 1);
    const eased   = 1 - Math.pow(1 - progress, 2.6);
    const mobile  = window.innerWidth < 700;

    hero.style.setProperty('--hero-progress', progress.toFixed(3));

    // ── Background: slow zoom driven by scroll ──────────────────
    if (heroBgImage) {
      heroBgImage.style.transform =
        `scale(${1.02 + eased * 0.26}) translateY(${eased * -2.5}vh)`;
    }

    // ── Hero text: 3-D tilt on mouse, recede into depth on scroll ─
    heroContent.style.opacity   = Math.max(0, 1 - progress * 1.5).toFixed(3);
    heroContent.style.transform =
      `translate3d(0, -${scrollY * 0.14}px, ${eased * -140}px)
       rotateX(${eased * 5 - mouseNY * 3}deg)
       rotateY(${mouseNX * 4}deg)
       scale(${1 - eased * 0.06})`;
    heroContent.style.filter    = `blur(${eased * 4}px)`;

    if (heroScrollHint)
      heroScrollHint.style.opacity = Math.max(0, 1 - progress * 5).toFixed(3);

    // ── 3-D camera fly-through: planes rush toward the viewer ───
    if (heroDepthSpace && !reducedMotion) {
      // Scene tilts with scroll + mouse look-around
      const tiltX = mouseNY * 7 + eased * 3;
      const tiltY = mouseNX * -10;
      heroDepthSpace.style.transform =
        `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${eased * 200}px)`;

      heroDepthPlanes.forEach((plane, i) => {
        const bX    = Number(plane.dataset.x     || 0);
        const bY    = Number(plane.dataset.y     || 0);
        const bZ    = Number(plane.dataset.z     || -400);
        const bRx   = Number(plane.dataset.rx    || 0);
        const bRy   = Number(plane.dataset.ry    || 0);
        const bRz   = Number(plane.dataset.rz    || 0);
        const bSc   = Number(plane.dataset.scale || 1);
        const speed = Number(plane.dataset.speed || 1);

        // Camera advances: planes fly from deep-z toward viewer
        const advance = eased * 740 * speed;
        const z = bZ + advance;

        // Proximity 0=far, 1=at-camera
        const prox = Math.max(0, Math.min(1, (z + 700) / 700));

        // X/Y drift + mouse look parallax
        const drift = 1 - prox * 0.55;
        const wave  = Math.sin(progress * Math.PI * 2 + i * 1.1) * 0.9;
        const x = bX * drift + wave + mouseNX * (5 - i * 0.8);
        const y = bY * drift           + mouseNY * (4 - i * 0.6);

        // Rotations unwind as plane approaches
        const unwind = 1 - eased * 0.92;
        const rx = bRx * unwind;
        const ry = bRy * unwind;
        const rz = bRz * unwind + eased * (i % 2 ? -7 : 7);

        // Scale grows with proximity
        const sc = bSc * (0.88 + prox * 0.58);

        // Opacity peaks at ideal viewing distance, fades when too close
        let op = 0;
        if      (z < -55) op = Math.min(0.85, (-z - 55) / 260);
        else if (z <  0 ) op = Math.max(0,    (-z) / 55) * 0.3;

        plane.style.opacity   = op.toFixed(3);
        plane.style.transform = [
          `translate3d(calc(-50% + ${x}vw), calc(-50% + ${y}vh), ${z}px)`,
          `rotateX(${rx}deg)`,
          `rotateY(${ry}deg)`,
          `rotateZ(${rz}deg)`,
          `scale(${sc})`
        ].join(' ');
      });
    }

    // ── Trust strip: 3-D rise from below ───────────────────────
    if (trustStrip) {
      const tp = Math.max(0, Math.min(1, (progress - 0.62) / 0.38));
      const te = 1 - Math.pow(1 - tp, 2.5);
      trustStrip.style.transform =
        `perspective(700px)
         translateY(${(1 - te) * 55}px)
         translateZ(${(te - 1) * 90}px)
         rotateX(${(1 - te) * 12}deg)
         scale(${0.92 + te * 0.08})`;
      trustStrip.style.transformOrigin = 'center top';
    }

    // ── Background depth-cards: multi-axis parallax ─────────────
    document.querySelectorAll('.depth-card').forEach((card, i) => {
      const tY  = scrollY * (0.014 + i * 0.007);
      const rX  = scrollY * 0.007 * (i % 2 ? 1 : -1);
      const rZ  = mouseNX * (2 + i * 0.6);
      card.style.transform =
        `translateY(${tY}px) perspective(900px) rotateX(${rX}deg) rotateZ(${rZ}deg)`;
    });
  };

  const queueHeroDepthRender = () => {
    if (!ticking) {
      requestAnimationFrame(() => { renderHeroDepth(); ticking = false; });
      ticking = true;
    }
  };

  renderHeroDepth();
  window.addEventListener('scroll', queueHeroDepthRender, { passive: true });
  window.addEventListener('resize', queueHeroDepthRender);
  // Re-render on mouse move so look-around feels live
  document.addEventListener('mousemove', queueHeroDepthRender, { passive: true });
}

// ============================================================
// SCROLL REVEAL
// ============================================================
const revealEls = document.querySelectorAll(
  '.section-tag, .section-title, .gold-divider, .section-body, ' +
  '.trust-item, .about-visual, .about-feature, .product-card, ' +
  '.sig-product, .pl-step, .pl-visual, .compliance-card, .globe-visual, .country-tag, ' +
  '.why-card, .contact-detail, .contact-form, .testimonial-card, ' +
  '.value-item, .feature-card, .format-card, .pl-step-card, .compliance-icon'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
      const idx = siblings.indexOf(el);
      const delay = (el.classList.contains('product-card') ||
                     el.classList.contains('why-card') ||
                     el.classList.contains('country-tag') ||
                     el.classList.contains('compliance-card') ||
                     el.classList.contains('about-feature') ||
                     el.classList.contains('testimonial-card') ||
                     el.classList.contains('value-item') ||
                     el.classList.contains('feature-card'))
                    ? idx * 100 : 0;

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
// SMOOTH SCROLL TO ANCHORS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================================
// FORM HANDLING
// ============================================================
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  const status = e.target.querySelector('.form-status');

  if (!e.target.checkValidity()) {
    e.target.reportValidity();
    return;
  }

  const formData = new FormData(e.target);
  const subject = `Vnik export enquiry from ${formData.get('name') || 'website visitor'}`;
  const body = [
    'New Vnik export enquiry',
    '',
    `Name: ${formData.get('name') || ''}`,
    `Company: ${formData.get('company') || ''}`,
    `Email: ${formData.get('email') || ''}`,
    `Country: ${formData.get('country') || ''}`,
    `Product Interest: ${formData.get('product') || ''}`,
    '',
    'Message:',
    formData.get('message') || ''
  ].join('\n');

  const mailtoUrl = `mailto:gentlementea@gmail.com,prithviesharma@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  btn.textContent = 'Opening Email App...';
  btn.disabled = true;
  if (status) {
    status.textContent = 'Your email app is opening with the enquiry details prefilled.';
  }

  window.location.href = mailtoUrl;

  setTimeout(() => {
    btn.textContent = 'Send Enquiry →';
    btn.disabled = false;
  }, 1500);
}

// ============================================================
// PARALLAX LAYERS (uses shared mouseNX/mouseNY)
// ============================================================
const depthGlows = document.querySelectorAll('.depth-glow');
document.addEventListener('mousemove', () => {
  const x = mouseNX * 10;
  const y = mouseNY * 10;
  depthGlows.forEach((glow, i) => {
    const speed = (i + 1) * 0.5;
    glow.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
});

// ============================================================
// CONTACT FORM VALIDATION
// ============================================================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', handleSubmit);
}
