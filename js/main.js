// ============================================================
// VKREATE — Main JS (Nav, Scroll, Reveal, FAQ, Services, Form)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Preloader Handling ────────────────────────────────────
  const preloader = document.getElementById('preloader');
  const preloaderVideo = document.getElementById('preloader-video');
  const preloaderProgress = document.getElementById('preloader-progress');
  const preloaderSkip = document.getElementById('preloader-skip');

  if (preloader) {
    document.body.style.overflow = 'hidden';

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 95) progress = 95;
      if (preloaderProgress) preloaderProgress.style.width = `${progress}%`;
    }, 120);

    let hidden = false;
    const hidePreloader = () => {
      if (hidden) return;
      hidden = true;
      clearInterval(progressInterval);
      if (preloaderProgress) preloaderProgress.style.width = '100%';
      setTimeout(() => {
        preloader.classList.add('fade-out');
        document.body.style.overflow = '';
        setTimeout(() => {
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 800);
      }, 350);
    };

    if (preloaderVideo) {
      preloaderVideo.addEventListener('ended', hidePreloader);
      // Fallback timeout in case video loading is delayed
      setTimeout(hidePreloader, 3200);
    } else {
      setTimeout(hidePreloader, 2000);
    }

    preloaderSkip?.addEventListener('click', hidePreloader);
  }

  // ── Scroll Reveal (IntersectionObserver) ──────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // ── Sticky Nav ────────────────────────────────────────────
  const nav = document.getElementById('main-nav');
  const handleNavScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── Active nav link on scroll ─────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[data-section]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => sectionObserver.observe(s));

  // ── Mobile nav ────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  mobileNav?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  // ── Smooth scroll for nav links ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  // ── Process line animation ────────────────────────────────
  const track = document.querySelector('.process__track');
  if (track) {
    const trackObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        track.classList.add('animate');
        trackObserver.disconnect();
      }
    }, { threshold: 0.4 });
    trackObserver.observe(track);
  }

  // ── FAQ Accordion ─────────────────────────────────────────
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── Services Accordion ────────────────────────────────────
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const isExpanded = card.classList.contains('expanded');
      document.querySelectorAll('.service-card.expanded').forEach(c => c.classList.remove('expanded'));
      if (!isExpanded) card.classList.add('expanded');
    });
  });

  // ── Contact Form ──────────────────────────────────────────
  const form = document.getElementById('inquiry-form');
  const successMsg = document.getElementById('form-success');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      form.style.display = 'none';
      successMsg.classList.add('show');
    }, 1200);
  });

  // ── Scroll to top button ──────────────────────────────────
  const scrollTopBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Animated stat counters ────────────────────────────────
  const statEls = document.querySelectorAll('.stats__value[data-target]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.dataset.target;
      const isFloat = raw.includes('.');
      const num = parseFloat(raw.replace(/[^\d.]/g, ''));
      const suffix = raw.replace(/[\d.]/g, '');
      const duration = 1600;
      const start = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = isFloat ? (ease * num).toFixed(1) : Math.round(ease * num);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  statEls.forEach(el => countObserver.observe(el));

});
