// ============================================================
// VKREATE — Main JS (Nav, Scroll, Reveal, FAQ, Services, Form)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflow = '';

  const preloader = document.getElementById('preloader');
  if (preloader) {
    try { preloader.remove(); } catch(e) {}
  }
  document.body.style.overflow = '';






  // ── Scroll Reveal (IntersectionObserver) ──────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // Immediately reveal elements already in viewport on load
  function revealInView() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('visible');
      }
    });
  }
  revealInView();
  window.addEventListener('scroll', revealInView, { passive: true });

  // Hard safety fallback — reveal everything after 1.5s no matter what
  setTimeout(() => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      el.classList.add('visible');
    });
  }, 1500);


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

  // ── Global Mobile Nav Toggle System ────────────────────────
  window.toggleMobileNav = function (e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }
    const hamburger = document.getElementById('hamburger') || document.querySelector('.nav__hamburger');
    const mobileNav = document.getElementById('mobile-nav') || document.querySelector('.nav__mobile');
    if (!hamburger || !mobileNav) return;

    const isOpen = hamburger.classList.toggle('open');
    if (isOpen) {
      mobileNav.classList.add('open');
      mobileNav.style.display = 'flex';
      mobileNav.style.opacity = '1';
      mobileNav.style.pointerEvents = 'all';
      document.body.classList.add('nav-open');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-expanded', 'true');
    } else {
      mobileNav.classList.remove('open');
      mobileNav.style.display = '';
      mobileNav.style.opacity = '';
      mobileNav.style.pointerEvents = '';
      document.body.classList.remove('nav-open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    }
  };

  const hamburger = document.getElementById('hamburger') || document.querySelector('.nav__hamburger');
  const mobileNav = document.getElementById('mobile-nav') || document.querySelector('.nav__mobile');

  if (hamburger) {
    hamburger.addEventListener('click', window.toggleMobileNav);
    hamburger.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.toggleMobileNav(e);
    }, { passive: false });
  }

  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (hamburger) {
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
        mobileNav.classList.remove('open');
        mobileNav.style.display = '';
        mobileNav.style.opacity = '';
        mobileNav.style.pointerEvents = '';
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Floating Back to Top Button ──
  let bttBtn = document.getElementById('back-to-top');
  if (!bttBtn) {
    bttBtn = document.createElement('button');
    bttBtn.id = 'back-to-top';
    bttBtn.className = 'back-to-top-btn';
    bttBtn.type = 'button';
    bttBtn.setAttribute('aria-label', 'Back to top of page');
    bttBtn.innerHTML = '↑ Top';
    document.body.appendChild(bttBtn);
  }

  const handleBttScroll = () => {
    if (window.scrollY > 400) {
      bttBtn.classList.add('visible');
    } else {
      bttBtn.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', handleBttScroll, { passive: true });
  handleBttScroll();
  bttBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ── Render Services Grid (6 Disciplines 3x2) ──────────────
  function renderServicesGrid() {
    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) return;
    const data = (window.VKREATE_DATA || (typeof VKREATE_DATA !== 'undefined' ? VKREATE_DATA : null));
    const services = data && data.services;
    if (!services || !services.length) return;

    servicesGrid.innerHTML = services.map((s, idx) => `
      <article class="service-card card-hover" style="animation-delay:${idx * 70}ms">
        <div class="service-card__top">
          <div class="service-card__icon">${s.icon}</div>
          <span class="service-card__num">${s.num || '0' + (idx + 1)}</span>
        </div>
        <h3 class="service-card__title">${s.title}</h3>
        <div class="service-card__subtitle">${s.subtitle}</div>
        <p class="service-card__desc">${s.description}</p>
        <div class="service-card__features">
          ${(s.features || []).map(f => `<span class="service-chip">${f}</span>`).join('')}
        </div>
        <div class="service-card__footer">
          <a href="contact.html" class="service-card__link">
            <span>See this in action →</span>
          </a>
        </div>
      </article>
    `).join('');
  }

  renderServicesGrid();
  setTimeout(renderServicesGrid, 50);
  setTimeout(renderServicesGrid, 250);

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

    return `PROJECT INQUIRY BRIEF — VKREATE DESIGN STUDIO\n\n` +
      `Client Information:\n` +
      `• Full Name: ${name}\n` +
      `• Email Address: ${email}\n` +
      `• Phone Number: ${phone}\n\n` +
      `Project Parameters:\n` +
      `• Space Category: ${type}\n` +
      `• Budget Range: ${budget}\n` +
      `• Target Timeline: ${timeline}\n\n` +
      `Brief & Requirements:\n` +
      `${brief}`;
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

      // Save inquiry to Admin localStorage
      try {
        const typeLabel   = PROJECT_TYPE_LABELS[fields.type.value] || fields.type.value;
        const budgetLabel = BUDGET_LABELS[fields.budget.value]     || 'Not specified';
        const timeLabel   = TIMELINE_LABELS[fields.timeline.value]   || 'Not specified';

        const newInquiry = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          name: fields.name.value.trim(),
          email: fields.email.value.trim(),
          phone: fields.phone.value.trim() || '',
          industry: typeLabel,
          projectBudget: budgetLabel,
          timeline: timeLabel,
          brief: fields.message.value.trim(),
          status: 'new',
          notes: '',
          createdAt: new Date().toISOString(),
          respondedAt: null
        };

        const existingRaw = localStorage.getItem('vk_admin_inquiries');
        let inquiries = existingRaw ? JSON.parse(existingRaw) : [];
        inquiries.unshift(newInquiry);
        localStorage.setItem('vk_admin_inquiries', JSON.stringify(inquiries));

        // 1. Post to API
        const apiUrl = (typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : '') + '/api/inquiries';
        fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInquiry)
        }).catch(e => console.warn('Inquiry API sync warning:', e));

        // 2. Post to BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
          try {
            const bc = new BroadcastChannel('vk_sync');
            bc.postMessage({ type: 'inquiries-updated', data: newInquiry });
          } catch (e) {}
        }
        window.dispatchEvent(new Event('storage'));

        if (typeof sendInquiryEmailNotification === 'function') {
          try { sendInquiryEmailNotification(newInquiry); } catch (e) {}
        }
      } catch (err) {
        console.warn('Could not save inquiry:', err);
      }

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

  async function sendInquiryEmailNotification(inquiry) {
    try {
      const settings = JSON.parse(localStorage.getItem('vk_admin_settings')) || {};
      const notif = settings.notifications || {};
      if (notif.newInquiry === false) return;
      const recipient = notif.notifEmail || 'vkreatearchitecture@gmail.com';

      const formData = new FormData();
      formData.append('_subject', `🔔 New Inquiry from ${inquiry.name} — VKREATE Studio`);
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');
      formData.append('Client Name', inquiry.name);
      formData.append('Email', inquiry.email);
      formData.append('Phone', inquiry.phone || 'N/A');
      formData.append('Industry', inquiry.industry || 'N/A');
      formData.append('Budget', inquiry.projectBudget || 'N/A');
      formData.append('Timeline', inquiry.timeline || 'N/A');
      formData.append('Project Brief', inquiry.brief || 'No brief provided');

      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).catch(e => console.warn('Inquiry email dispatch warning:', e));
    } catch(e) {}
  }



  // ── Scroll to top button ──────────────────────────────────
  const scrollTopBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Live Visitor & Analytics Sync ─────────────────────────
  (function trackLiveAnalytics() {
    try {
      const raw = localStorage.getItem('vk_admin_analytics');
      let analytics = raw ? JSON.parse(raw) : { days: [] };
      if (!analytics.days) analytics.days = [];

      const todayStr = new Date().toISOString().split('T')[0];
      let today = analytics.days.find(d => d.date === todayStr);

      if (!today) {
        today = { date: todayStr, visitors: 1, pageViews: 1, inquiries: 0 };
        analytics.days.push(today);
      } else {
        today.pageViews = (today.pageViews || 0) + 1;
        if (!sessionStorage.getItem('vk_visited_today')) {
          today.visitors = (today.visitors || 0) + 1;
          sessionStorage.setItem('vk_visited_today', '1');
        }
      }
      localStorage.setItem('vk_admin_analytics', JSON.stringify(analytics));
    } catch (e) {}
  })();

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

  // ── Contact Info Dynamic Sync ──
  const syncContactDOM = () => {
    const email = 'vkreatearchitecture@gmail.com';
    const address = 'LPOne Beyond, Venture Arcade, Thondayad, Kozhikode - 673016';
    const mapUrl = 'https://maps.app.goo.gl/452k5apcwZBYBL2v6?g_st=aw';
    
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.href = 'mailto:' + email;
      if (el.textContent.includes('@') && !el.textContent.includes('Email')) {
        el.textContent = email;
      }
    });

    document.querySelectorAll('.contact__detail').forEach(el => {
      const label = el.querySelector('.contact__detail-label');
      if (label) {
        const txt = label.textContent.trim().toLowerCase();
        if (txt === 'email') {
          const emailLink = el.querySelector('a');
          if (emailLink) { emailLink.href = 'mailto:' + email; emailLink.textContent = email; }
        } else if (txt.includes('hour')) {
          el.remove();
        }
      }
    });
  };
  syncContactDOM();

  // ── Loop 6: Process Section Accordion on Mobile ──
  const processSteps = document.querySelectorAll('.process__step');
  processSteps.forEach((step, idx) => {
    const titleEl = step.querySelector('.process__step-title');
    const numEl = step.querySelector('.process__num');
    const descEl = step.querySelector('.process__step-desc');

    if (titleEl && numEl && descEl && !step.querySelector('.process__step-header')) {
      const header = document.createElement('div');
      header.className = 'process__step-header';
      
      const headLeft = document.createElement('div');
      headLeft.className = 'process__step-head-left';
      headLeft.appendChild(numEl.cloneNode(true));
      headLeft.appendChild(titleEl.cloneNode(true));

      const icon = document.createElement('span');
      icon.className = 'process__step-icon mobile-only';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '+';

      header.appendChild(headLeft);
      header.appendChild(icon);

      step.innerHTML = '';
      step.appendChild(header);
      step.appendChild(descEl);

      step.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          const isCurrentlyOpen = step.classList.contains('open');
          processSteps.forEach(s => {
            s.classList.remove('open');
            const ic = s.querySelector('.process__step-icon');
            if (ic) ic.textContent = '+';
          });
          if (!isCurrentlyOpen) {
            step.classList.add('open');
            icon.textContent = '−';
          }
        }
      });
    }
  });

  // ── Services Section Accordion on Mobile ──
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    let toggleBtn = card.querySelector('.service-card__toggle-btn');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'service-card__toggle-btn mobile-only';
      toggleBtn.type = 'button';
      toggleBtn.innerHTML = '<span>Expand Details</span> <span class="toggle-icon">▾</span>';
      
      const footer = card.querySelector('.service-card__footer') || card;
      card.insertBefore(toggleBtn, footer);

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = card.classList.contains('open');
        if (isOpen) {
          card.classList.remove('open');
          toggleBtn.innerHTML = '<span>Expand Details</span> <span class="toggle-icon">▾</span>';
        } else {
          card.classList.add('open');
          toggleBtn.innerHTML = '<span>Collapse Details</span> <span class="toggle-icon">▴</span>';
        }
      });
    }
  });

  // ── Loop 10: Footer Accordion Columns on Mobile ──
  const footerAccBtns = document.querySelectorAll('.footer__accordion-btn');
  footerAccBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const col = btn.closest('.footer__col--accordion');
        if (!col) return;
        const isOpen = col.classList.contains('open');
        document.querySelectorAll('.footer__col--accordion').forEach(c => {
          c.classList.remove('open');
          const b = c.querySelector('.footer__accordion-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          col.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });

});




