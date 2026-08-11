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
    let hidden = false;
    const hidePreloader = () => {
      if (hidden) return;
      hidden = true;
      if (preloaderProgress) preloaderProgress.style.width = '100%';
      preloader.classList.add('fade-out');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 300);
    };

    // Auto dismiss quickly so hero content displays without delay
    setTimeout(hidePreloader, 100);

    if (preloaderVideo) {
      preloaderVideo.addEventListener('ended', hidePreloader);
      preloaderVideo.addEventListener('error', hidePreloader);
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
    const isOpen = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  mobileNav?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', false);
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

  // ── Contact Form — WhatsApp Integration ─────────────────────
  const WHATSAPP_NUMBER = '919037161861'; // +91 9037161861

  const form        = document.getElementById('inquiry-form');
  const successMsg  = document.getElementById('form-success');
  const submitBtn   = document.getElementById('form-submit-btn');

  /** Map select values → human-readable labels */
  const PROJECT_TYPE_LABELS = {
    office:      'Office / Commercial',
    restaurant:  'Restaurant / F&B',
    retail:      'Retail / Boutique',
    healthcare:  'Healthcare / Clinic',
    hospitality: 'Hotel / Hospitality',
    villa:       'Residential / Villa',
    other:       'Other',
  };
  const BUDGET_LABELS = {
    'sub25': 'Under ₹25L',
    '25-50': '₹25L – ₹50L',
    '50-100': '₹50L – ₹1Cr',
    '1cr+':  '₹1Cr+',
  };
  const TIMELINE_LABELS = {
    immediate: 'Immediately',
    '1-3':     '1–3 months',
    '3-6':     '3–6 months',
    flexible:  'Flexible',
  };

  /** Clear all previous validation marks */
  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
  }

  /** Mark a field as invalid */
  function markError(el, msg) {
    el.classList.add('field-error');
    el.focus();
    const hint = document.createElement('span');
    hint.className = 'field-error-msg';
    hint.setAttribute('role', 'alert');
    hint.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e05252" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${msg}`;
    el.parentNode.appendChild(hint);
  }

  /** Validate required fields — returns true if all pass */
  function validateForm(fields) {
    clearErrors();
    let valid = true;

    if (!fields.name.value.trim()) {
      markError(fields.name, 'Full name is required.');
      valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fields.email.value.trim()) {
      markError(fields.email, 'Email address is required.');
      valid = false;
    } else if (!emailPattern.test(fields.email.value.trim())) {
      markError(fields.email, 'Please enter a valid email address.');
      valid = false;
    }

    if (!fields.type.value) {
      markError(fields.type, 'Please select a project type.');
      valid = false;
    }

    if (!fields.message.value.trim()) {
      markError(fields.message, 'Please describe your project briefly.');
      valid = false;
    }

    return valid;
  }

  /** Build the WhatsApp message string */
  function buildWhatsAppMessage(fields) {
    const name     = fields.name.value.trim();
    const email    = fields.email.value.trim();
    const phone    = fields.phone.value.trim() || 'Not provided';
    const type     = PROJECT_TYPE_LABELS[fields.type.value]     || fields.type.value;
    const budget   = BUDGET_LABELS[fields.budget.value]         || 'Not specified';
    const timeline = TIMELINE_LABELS[fields.timeline.value]     || 'Not specified';
    const brief    = fields.message.value.trim();

    return `Hi VKREATE! 🎨

✨ New Project Inquiry

👤 Name: ${name}
📧 Email: ${email}
📱 Phone: ${phone}
🎯 Project Type: ${type}
💰 Budget: ${budget}
⏰ Timeline: ${timeline}

📝 Project Brief:
${brief}

Looking forward to connecting! 🙏`;
  }

  if (form && submitBtn) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = {
        name:    document.getElementById('f-name'),
        email:   document.getElementById('f-email'),
        phone:   document.getElementById('f-phone'),
        type:    document.getElementById('f-type'),
        budget:  document.getElementById('f-budget'),
        timeline:document.getElementById('f-timeline'),
        message: document.getElementById('f-message'),
      };

      if (!validateForm(fields)) return;

      // Build URL-encoded WhatsApp message
      const message    = buildWhatsAppMessage(fields);
      const encoded    = encodeURIComponent(message);
      const waURL      = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

      // Open WhatsApp in new tab
      window.open(waURL, '_blank', 'noopener,noreferrer');

      // Show success banner
      if (successMsg) {
        successMsg.classList.add('show');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form fields
      form.reset();
      clearErrors();

      // Update button to "sent" state
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Message Sent! ✓`;
      submitBtn.disabled = true;

      // Re-enable button after 8 seconds so user can submit again if needed
      setTimeout(() => {
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle;margin-right:4px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.848L0 24l6.335-1.521A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.819 9.819 0 01-5.003-1.371l-.359-.214-3.72.894.938-3.617-.234-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.431-4.388 9.818-9.818 9.818z"/></svg>
          Send via WhatsApp`;
        submitBtn.disabled = false;
        if (successMsg) successMsg.classList.remove('show');
      }, 8000);
    });

    // ── Live: clear individual error on input/change ───────────
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', () => {
        el.classList.remove('field-error');
        const hint = el.parentNode.querySelector('.field-error-msg');
        if (hint) hint.remove();
      });
      el.addEventListener('change', () => {
        el.classList.remove('field-error');
        const hint = el.parentNode.querySelector('.field-error-msg');
        if (hint) hint.remove();
      });
    });
  }

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
