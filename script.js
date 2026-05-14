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
    const heroHeight = hero.offsetHeight;
    const progress = Math.min(Math.max(scrollY / Math.max(heroHeight, 1), 0), 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const mobile = window.innerWidth < 700;

    hero.style.setProperty('--hero-progress', progress.toFixed(3));

    if (heroBgImage) {
      heroBgImage.style.transform = `scale(${1.02 + eased * 0.16}) translateY(${eased * -3}vh)`;
    }

    const contentOpacity = Math.max(0, 1 - progress * 1.25);
    const contentY = scrollY * 0.28;
    heroContent.style.opacity = contentOpacity;
    heroContent.style.transform = `translate3d(0, -${contentY}px, ${eased * 90}px) scale(${1 + eased * 0.035})`;
    heroContent.style.filter = `blur(${eased * 2.4}px)`;

    if (heroScrollHint) {
      heroScrollHint.style.opacity = Math.max(0, 1 - progress * 3);
    }

    if (heroDepthSpace && !reducedMotion) {
      heroDepthSpace.style.transform = `translate3d(0, ${eased * -8}vh, ${eased * 160}px) rotateX(${eased * 2}deg)`;
      heroDepthPlanes.forEach((plane, i) => {
        const baseX = Number(plane.dataset.x || 0);
        const baseY = Number(plane.dataset.y || 0);
        const baseZ = Number(plane.dataset.z || -400);
        const baseRx = Number(plane.dataset.rx || 0);
        const baseRy = Number(plane.dataset.ry || 0);
        const baseRz = Number(plane.dataset.rz || 0);
        const baseScale = Number(plane.dataset.scale || 1);
        const speed = Number(plane.dataset.speed || 1);
        const phase = i * 0.18;
        const z = baseZ + eased * 760 * speed;
        const y = baseY - eased * 20 + Math.sin((progress + phase) * Math.PI) * 4;
        const x = baseX + Math.sin((progress * 2.2) + i) * 2.5;
        const scale = baseScale + eased * (mobile ? 0.26 : 0.42);
        const opacity = Math.max(0, Math.min(mobile ? 0.32 : 0.78, 0.2 + (1 - Math.abs(progress - 0.48 - phase * 0.18)) * 0.62));

        plane.style.opacity = opacity.toFixed(2);
        plane.style.transform = [
          `translate3d(calc(-50% + ${x}vw), calc(-50% + ${y}vh), ${z}px)`,
          `rotateX(${baseRx - eased * baseRx * 0.75}deg)`,
          `rotateY(${baseRy - eased * baseRy * 1.25}deg)`,
          `rotateZ(${baseRz + eased * (i % 2 ? -8 : 8)}deg)`,
          `scale(${scale})`
        ].join(' ');
      });
    }

    if (trustStrip) {
      const trustScale = 0.96 + eased * 0.04;
      trustStrip.style.transform = `translateY(${(1 - eased) * 22}px) rotateX(${(1 - eased) * 5}deg) scale(${trustScale})`;
      trustStrip.style.transformOrigin = 'center top';
    }

    document.querySelectorAll('.depth-card').forEach((card, i) => {
      const speed = 0.015 + (i * 0.008);
      const y = scrollY * speed;
      const rotateX = scrollY * 0.008;
      card.style.transform = `translateY(${y}px) perspective(1000px) rotateX(${rotateX}deg)`;
    });
  };

  const queueHeroDepthRender = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        renderHeroDepth();
        ticking = false;
      });
      ticking = true;
    }
  };

  renderHeroDepth();
  window.addEventListener('scroll', queueHeroDepthRender, { passive: true });
  window.addEventListener('resize', queueHeroDepthRender);
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
// PARALLAX LAYERS
// ============================================================
const depthGlows = document.querySelectorAll('.depth-glow');
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
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
