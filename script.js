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

if (hero && heroContent) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;

        if (scrollY < heroHeight) {
          const progress = Math.min(scrollY / heroHeight, 1);

          if (heroBgImage) {
            heroBgImage.style.transform = `scale(${1.02 + progress * 0.08})`;
          }

          const contentOpacity = Math.max(0, 1 - progress * 1.8);
          const contentY = scrollY * 0.35;
          heroContent.style.opacity = contentOpacity;
          heroContent.style.transform = `translateY(-${contentY}px)`;
          heroContent.style.filter = `blur(${progress * 3}px)`;

          if (heroScrollHint) {
            heroScrollHint.style.opacity = Math.max(0, 1 - progress * 3);
          }

          document.querySelectorAll('.depth-card').forEach((card, i) => {
            const speed = 0.015 + (i * 0.008);
            const y = scrollY * speed;
            const rotateX = scrollY * 0.008;
            card.style.transform = `translateY(${y}px) perspective(1000px) rotateX(${rotateX}deg)`;
          });
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ============================================================
// SCROLL REVEAL
// ============================================================
const revealEls = document.querySelectorAll(
  '.section-tag, .section-title, .gold-divider, .section-body, ' +
  '.trust-item, .about-visual, .about-feature, .product-card, ' +
  '.sig-product, .pl-step, .pl-visual, .compliance-card, .globe-visual, .country-tag, ' +
  '.why-card, .contact-detail, .contact-form, .testimonial-card, ' +
  '.value-item, .feature-card'
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
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Message Sent!';
    btn.style.background = '#2ecc71';
    setTimeout(() => {
      btn.textContent = 'Send Enquiry →';
      btn.style.background = '';
      btn.disabled = false;
      e.target.reset();
    }, 2000);
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