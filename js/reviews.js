/* ============================================================
   VKREATE — Client Reviews Engine (Live Site)
   ============================================================ */

(function () {
  'use strict';

  let currentFilter = 'all';

  // Helper to format stars HTML
  function renderStarsHTML(rating) {
    const r = Math.round(Number(rating) || 5);
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<span class="star" style="${i <= r ? '' : 'opacity:0.2'}">★</span>`;
    }
    return html;
  }

  function getApiBaseUrl() {
    if (typeof window !== 'undefined' && window.location) {
      const h = window.location.hostname;
      const p = window.location.port;
      const proto = window.location.protocol || 'http:';
      if (p !== '3000' && p !== '' && p !== '80' && p !== '443') {
        return `${proto}//${h}:3000`;
      }
    }
    return '';
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function getDeletedReviewIds() {
    try {
      const raw = localStorage.getItem('vk_admin_deleted_reviews');
      return raw ? (JSON.parse(raw) || []) : [];
    } catch (e) {
      return [];
    }
  }

  function isDeletedReview(r, deletedIds) {
    if (!r || !deletedIds || !deletedIds.length) return false;
    const strSet = new Set(deletedIds.map(id => String(id)));
    if (r.id && (strSet.has(String(r.id)) || deletedIds.includes(r.id))) return true;
    if (r.projectId && (strSet.has(String(r.projectId)) || strSet.has('proj:' + String(r.projectId)))) return true;
    const name = (r.clientName || r.author || '').toLowerCase().trim();
    if (name && (strSet.has(name) || strSet.has('name:' + name))) return true;
    return false;
  }

  // Get all approved reviews from VKREATE_DATA or local offline snapshot
  function getApprovedReviews() {
    let list = null;
    if (window.VKREATE_DATA && Array.isArray(window.VKREATE_DATA.reviews)) {
      list = window.VKREATE_DATA.reviews;
    }
    if (!Array.isArray(list)) {
      try {
        const raw = localStorage.getItem('vk_reviews');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) list = parsed;
          else if (parsed && Array.isArray(parsed.reviews)) list = parsed.reviews;
        }
      } catch (e) {}
    }
    if (!Array.isArray(list)) list = [];
    // Copy array so we don't mutate underlying array
    list = [...list];

    // Synthesize project testimonials into approved reviews if not already present
    if (window.VKREATE_DATA && Array.isArray(window.VKREATE_DATA.projects)) {
      const existingRevIds = new Set(list.map(r => String(r.id)));
      const existingProjRevIds = new Set(list.filter(r => r && r.projectId).map(r => String(r.projectId)));

      window.VKREATE_DATA.projects.forEach(p => {
        if (p && p.testimonial && p.testimonial.text && (p.testimonial.author || p.testimonial.name || p.client)) {
          const synId = 'rev-' + p.id;
          const authorName = p.testimonial.author || p.testimonial.name || p.client || 'Verified Client';
          if (!existingRevIds.has(synId) && !existingProjRevIds.has(String(p.id))) {
            list.push({
              id: synId,
              clientName: authorName,
              author: authorName,
              clientRole: p.testimonial.role || 'Client',
              role: p.testimonial.role || 'Client',
              projectId: p.id,
              industry: p.industry || '',
              industryLabel: p.industryLabel || '',
              rating: parseInt(p.testimonial.rating || 5, 10),
              reviewText: p.testimonial.text,
              status: 'approved',
              createdAt: p.createdAt || new Date().toISOString()
            });
            existingRevIds.add(synId);
          }
        }
      });
    }

    const deletedIds = getDeletedReviewIds();
    return list.filter(r => r && r.id && !isDeletedReview(r, deletedIds));
  }

  // Populate projects dropdown in client submission modal
  function populateProjectDropdown() {
    const sel = document.getElementById('pub-project-sel');
    if (!sel) return;
    sel.innerHTML = '<option value="general">General Studio Review</option>';

    const projects = (window.VKREATE_DATA && window.VKREATE_DATA.projects) ? window.VKREATE_DATA.projects : [];
    projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.industryLabel || p.industry || 'Project'})`;
      sel.appendChild(opt);
    });
  }

  // Render Reviews Grid & Update Aggregate Header
  function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    const reviews = getApprovedReviews();

    // Update aggregate stats & Hero rating
    const aggScoreEl = document.getElementById('agg-score');
    const aggStarsEl = document.getElementById('agg-stars');
    const aggCountEl = document.getElementById('agg-count');
    const heroRatingEl = document.getElementById('hero-rating-score');

    if (reviews.length > 0) {
      const avg = (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1);
      if (aggScoreEl) aggScoreEl.textContent = avg;
      if (aggStarsEl) aggStarsEl.innerHTML = renderStarsHTML(Math.round(avg));
      if (aggCountEl) aggCountEl.textContent = `Based on ${reviews.length} verified client review${reviews.length !== 1 ? 's' : ''}`;
      if (heroRatingEl) heroRatingEl.textContent = `${avg}★`;
    } else {
      if (aggScoreEl) aggScoreEl.textContent = '5.0';
      if (aggStarsEl) aggStarsEl.innerHTML = renderStarsHTML(5);
      if (aggCountEl) aggCountEl.textContent = 'Ready for your client review';
      if (heroRatingEl) heroRatingEl.textContent = '5.0★';
    }

    // Filter by industry
    let filtered = reviews;
    if (currentFilter !== 'all') {
      filtered = reviews.filter(r => {
        const ind = (r.industry || r.industryLabel || '').toLowerCase();
        const pId = (r.projectId || '').toLowerCase();
        const pObj = (window.VKREATE_DATA && Array.isArray(window.VKREATE_DATA.projects))
          ? window.VKREATE_DATA.projects.find(p => p && p.id === r.projectId)
          : null;
        const pInd = (pObj?.industry || pObj?.industryLabel || '').toLowerCase();
        return ind.includes(currentFilter) || pId.includes(currentFilter) || pInd.includes(currentFilter);
      });
    }

    const isReviewsPage = !!window.IS_FULL_REVIEWS_PAGE || window.location.pathname.endsWith('/reviews') || window.location.pathname.endsWith('reviews.html');
    let showAllHomeReviews = window.VKREATE_SHOW_ALL_HOME_REVIEWS || false;
    let showAllMobileReviews = window.VKREATE_SHOW_ALL_REVIEWS || false;
    const isMobile = window.innerWidth <= 768;

    let displayList = filtered;
    if (!isReviewsPage && !showAllHomeReviews && filtered.length > 6) {
      displayList = filtered.slice(0, 6);
    } else if (isMobile && !showAllMobileReviews && !showAllHomeReviews && filtered.length > 3) {
      displayList = filtered.slice(0, 3);
    }

    grid.innerHTML = '';

    if (filtered.length === 0) {
      if (window.VKREATE_SYNC && window.VKREATE_SYNC._isFetchingReviews) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:48px 24px;color:var(--text-muted);">
            <div style="font-size:1.5rem;margin-bottom:12px;">⏳</div>
            <p style="margin:0;font-size:0.9375rem;">Loading verified client reviews...</p>
          </div>`;
        return;
      }
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:56px 24px;background:rgba(255,255,255,0.03);border:1px dashed var(--border-color);border-radius:var(--radius-lg);margin-top:20px;">
          <div style="font-size:2.5rem;margin-bottom:16px">✍️</div>
          <h3 class="t-h3" style="color:var(--charcoal);margin-bottom:8px;">No Verified Reviews Yet</h3>
          <p class="t-body" style="color:var(--text-muted);margin:0 auto 24px auto;max-width:440px;line-height:1.6;">
            Be the first client to share your experience working with VKREATE Design Studio on an interior architecture project!
          </p>
          <button type="button" class="btn btn-green" onclick="window.openReviewModal()" style="padding:12px 24px;font-size:0.9375rem;">
            ✍️ Write a Client Review
          </button>
        </div>`;
      return;
    }

    displayList.forEach((r, idx) => {
      const card = document.createElement('article');
      card.className = 'review-card reveal';
      card.style.transitionDelay = `${(idx % 3) * 0.1}s`;

      const clientName = escapeHTML(r.clientName || r.author || 'Verified Client');
      const clientRole = escapeHTML(r.clientRole || r.role || 'Client');
      const reviewText = escapeHTML(r.reviewText || r.text || '');
      const projName = escapeHTML(r.projectName || (window.VKREATE_DATA?.projects?.find(p => p.id === r.projectId)?.name) || '');
      const initials = clientName.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'VC';
      const responseHtml = r.studioResponse ? `
        <div class="review-card__response" style="margin-top:16px;padding:12px 16px;background:rgba(61,92,80,0.06);border-left:3px solid var(--green-mid);border-radius:6px;">
          <div style="font-weight:600;font-size:0.8125rem;color:var(--green-mid);margin-bottom:4px;display:flex;align-items:center;gap:6px;">
            <span>💬 Studio Response from VKREATE:</span>
          </div>
          <p style="font-size:0.875rem;font-style:italic;color:var(--text-body);margin:0;line-height:1.5;">"${escapeHTML(r.studioResponse)}"</p>
        </div>` : '';

      card.innerHTML = `
        <div class="review-card__header">
          <div class="review-card__stars">${renderStarsHTML(r.rating || 5)}</div>
          <span class="review-card__tag">${escapeHTML(r.industryLabel || r.industry || 'Verified')}</span>
        </div>
        <blockquote class="review-card__quote review-card__text">"${reviewText}"</blockquote>
        ${responseHtml}
        <div class="review-card__footer" style="margin-top:16px;">
          <div class="review-card__author">
            <div class="review-card__avatar">${initials}</div>
            <div>
              <div class="review-card__name review-card__author-name">${clientName}</div>
              <div class="review-card__role review-card__author-role">${clientRole}${projName ? ' &middot; ' + projName : ''}</div>
            </div>
          </div>
          <div class="review-card__verified" title="Verified VKREATE Client">✓ Verified</div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Add "View More Reviews" Single Button
    let moreBtnWrap = document.getElementById('reviews-more-wrap');
    if (!isReviewsPage && filtered.length > 6) {
      if (!moreBtnWrap) {
        moreBtnWrap = document.createElement('div');
        moreBtnWrap.id = 'reviews-more-wrap';
        moreBtnWrap.style.cssText = 'grid-column:1/-1;text-align:center;margin-top:36px;display:flex;justify-content:center;align-items:center;';
        grid.parentNode.insertBefore(moreBtnWrap, grid.nextSibling);
      }
      moreBtnWrap.style.display = 'flex';
      moreBtnWrap.innerHTML = `
        <button type="button" class="btn btn-outline" id="reviews-home-toggle-btn" style="padding:14px 32px;font-weight:600;display:inline-flex;align-items:center;gap:8px;">
          <span>${showAllHomeReviews ? 'Show Fewer Reviews ▲' : `Explore All Client Reviews (${filtered.length}) ▼`}</span>
        </button>
      `;

      document.getElementById('reviews-home-toggle-btn')?.addEventListener('click', () => {
        window.VKREATE_SHOW_ALL_HOME_REVIEWS = !showAllHomeReviews;
        renderReviews();
      });
    } else if (isMobile && filtered.length > 3 && isReviewsPage) {
      if (!moreBtnWrap) {
        moreBtnWrap = document.createElement('div');
        moreBtnWrap.id = 'reviews-more-wrap';
        moreBtnWrap.style.cssText = 'grid-column:1/-1;text-align:center;margin-top:24px;';
        grid.parentNode.insertBefore(moreBtnWrap, grid.nextSibling);
      }
      moreBtnWrap.style.display = 'block';
      moreBtnWrap.innerHTML = `
        <button type="button" class="btn btn-outline" id="reviews-toggle-more-btn" style="min-height:48px;padding:12px 24px;width:100%;justify-content:center;">
          ${showAllMobileReviews ? 'Show Fewer Reviews ▲' : `Show All Verified Reviews (${filtered.length}) ▼`}
        </button>
      `;

      document.getElementById('reviews-toggle-more-btn')?.addEventListener('click', () => {
        window.VKREATE_SHOW_ALL_REVIEWS = !showAllMobileReviews;
        renderReviews();
      });
    } else if (moreBtnWrap) {
      moreBtnWrap.style.display = 'none';
    }

    // Trigger reveal animations
    setTimeout(() => {
      const reveals = grid.querySelectorAll('.reveal');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      reveals.forEach(el => observer.observe(el));
    }, 50);
  }

  // Filter Buttons Handler
  function setupFilters() {
    const desktopFilters = document.querySelectorAll('#reviews-filters .filter-btn');
    desktopFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        desktopFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter || 'all';
        renderReviews();
      });
    });

    const mobileSelect = document.getElementById('reviews-filter-select');
    if (mobileSelect) {
      mobileSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value || 'all';
        renderReviews();
      });
    }
  }

  // Interactive Star Selector inside Submission Modal
  function setupStarSelector() {
    const selector = document.getElementById('pub-star-selector');
    const label = document.getElementById('pub-star-label');
    const hiddenVal = document.getElementById('pub-rating-val');
    if (!selector) return;

    const stars = selector.querySelectorAll('.star-rating-star');
    const labels = ['', 'Poor (1/5)', 'Fair (2/5)', 'Good (3/5)', 'Very Good (4/5)', 'Outstanding (5/5)'];

    let selectedRating = 0;

    stars.forEach(star => {
      const val = parseInt(star.dataset.rating, 10);

      star.addEventListener('mouseenter', () => {
        stars.forEach((s, idx) => {
          s.style.color = (idx < val) ? '#C9A96E' : 'rgba(0,0,0,0.15)';
        });
        if (label) label.textContent = labels[val] || '';
      });

      star.addEventListener('mouseleave', () => {
        stars.forEach((s, idx) => {
          s.style.color = (idx < selectedRating) ? '#C9A96E' : 'rgba(0,0,0,0.15)';
        });
        if (label) label.textContent = selectedRating > 0 ? labels[selectedRating] : 'Click stars to rate (1–5)';
      });

      star.addEventListener('click', () => {
        selectedRating = val;
        if (hiddenVal) hiddenVal.value = val;
        stars.forEach((s, idx) => {
          s.style.color = (idx < selectedRating) ? '#C9A96E' : 'rgba(0,0,0,0.15)';
        });
        if (label) label.textContent = labels[val];
      });
    });
  }

  // Global modal open/close functions for inline onclick & event listener support
  window.openReviewModal = function() {
    const overlay = document.getElementById('pub-review-overlay');
    if (!overlay) return;
    overlay.classList.add('active', 'open', 'show');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeReviewModal = function() {
    const overlay = document.getElementById('pub-review-overlay');
    if (!overlay) return;
    overlay.classList.remove('active', 'open', 'show');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  // Submission Modal Open/Close Controls
  function setupModalControls() {
    const overlay = document.getElementById('pub-review-overlay');
    const closeBtn = document.getElementById('close-pub-review-btn');
    if (!overlay) return;

    document.querySelectorAll('.open-review-modal-trigger, #open-review-modal-btn, #open-review-modal-btn-proj').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openReviewModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', window.closeReviewModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) window.closeReviewModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.closeReviewModal();
    });
  }

  // Live Character Counter for Review Textarea
  function setupCharCounter() {
    const textarea = document.getElementById('pub-review-text');
    const counter = document.getElementById('pub-char-counter');
    if (!textarea || !counter) return;

    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / 500 characters (min 20)`;
      if (len < 20) {
        counter.style.color = '#Eab308'; // Amber warning
      } else {
        counter.style.color = 'var(--text-muted)';
      }
    });
  }

  // Review Form Submit Handler
  function setupFormSubmit() {
    const form = document.getElementById('pub-review-form');
    const overlay = document.getElementById('pub-review-overlay');
    const modalBody = document.getElementById('pub-review-modal-body');
    const errorBanner = document.getElementById('pub-form-error');
    if (!form) return;

    setupCharCounter();

    function showError(msg) {
      if (errorBanner) {
        errorBanner.textContent = '⚠️ ' + msg;
        errorBanner.style.display = 'block';
      } else {
        alert(msg);
      }
    }

    function clearError() {
      if (errorBanner) {
        errorBanner.textContent = '';
        errorBanner.style.display = 'none';
      }
    }

    async function sendReviewEmailNotification(review) {
      try {
        const settings = JSON.parse(localStorage.getItem('vk_admin_settings')) || {};
        const notif = settings.notifications || {};
        if (notif.newReview === false) return;
        const recipient = notif.notifEmail || 'vkreatearchitecture@gmail.com';

        const formData = new FormData();
        formData.append('_subject', `⭐ New Review from ${review.author} — VKREATE Studio`);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');
        formData.append('Author Name', review.author || 'Anonymous');
        formData.append('Role/Company', review.role || 'N/A');
        formData.append('Email', review.clientEmail || 'N/A');
        formData.append('Rating', `${review.rating || 5} Stars`);
        formData.append('Review Content', review.reviewText || '');
        formData.append('Submitted Date', new Date().toLocaleString());

        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }).catch(e => console.warn('Review email dispatch warning:', e));
      } catch(e) {}
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearError();

      const ratingVal = parseInt(document.getElementById('pub-rating-val')?.value || '0', 10);
      if (!ratingVal || ratingVal < 1) {
        showError('Please select a star rating between 1 and 5 stars.');
        return;
      }

      const clientName = (document.getElementById('pub-client-name')?.value || '').trim();
      if (!clientName || clientName.length < 2) {
        showError('Please enter your full name (at least 2 characters).');
        return;
      }

      const clientRole = (document.getElementById('pub-client-role')?.value || '').trim();
      if (!clientRole) {
        showError('Please enter your role or title (e.g. Homeowner, Business Owner).');
        return;
      }

      const clientEmail = (document.getElementById('pub-client-email')?.value || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!clientEmail || !emailRegex.test(clientEmail)) {
        showError('Please enter a valid email address.');
        return;
      }

      const projectId = document.getElementById('pub-project-sel')?.value || 'general';
      const reviewText = (document.getElementById('pub-review-text')?.value || '').trim();
      if (!reviewText || reviewText.length < 20) {
        showError('Please write a review of at least 20 characters.');
        return;
      }
      if (reviewText.length > 500) {
        showError('Review must not exceed 500 characters.');
        return;
      }

      let newReview = {
        id: 'rev-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        clientName: clientName,
        clientRole: clientRole,
        clientEmail: clientEmail,
        projectId: projectId,
        rating: ratingVal,
        reviewText: reviewText,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Disable submit button and show loading state
      const submitBtn = document.getElementById('pub-review-submit-btn');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

      // Save to LocalStorage single source of truth so review is never lost (works offline & on Live Server)
      try {
        const rawLocal = localStorage.getItem('vk_admin_reviews');
        let localReviews = rawLocal ? JSON.parse(rawLocal) : [];
        if (Array.isArray(localReviews)) {
          if (!localReviews.some(r => r && r.id === newReview.id)) {
            localReviews.unshift(newReview);
            localStorage.setItem('vk_admin_reviews', JSON.stringify(localReviews));
          }
        }
      } catch (err) {
        console.warn('LocalStorage save review warning:', err);
      }

      // Sync to Express backend API if running
      try {
        const apiUrl = (getApiBaseUrl() || '') + '/api/reviews';
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReview)
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json && json.success && json.review && json.review.id) {
          const oldId = newReview.id;
          newReview = { ...newReview, ...json.review };
          // Update local storage with server-assigned ID to keep client & server in sync
          try {
            const rawLocal = localStorage.getItem('vk_admin_reviews');
            let localReviews = rawLocal ? JSON.parse(rawLocal) : [];
            if (Array.isArray(localReviews)) {
              const idx = localReviews.findIndex(r => r && (r.id === oldId || r.id === json.review.id));
              if (idx >= 0) {
                localReviews[idx] = newReview;
              } else {
                localReviews.unshift(newReview);
              }
              localStorage.setItem('vk_admin_reviews', JSON.stringify(localReviews));
            }
          } catch (stErr) {}
        }
      } catch (e) {
        console.warn('API POST /api/reviews skipped or offline (saved locally):', e);
      }

      // Dispatch instant email notification to studio admin
      sendReviewEmailNotification(newReview);

      // Notify all open tabs
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('vk_sync');
          bc.postMessage({ type: 'reviews-updated', data: newReview });
          bc.close();
        } catch (e) {}
      }
      window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));

      // Show confirmed success to user
      if (modalBody) {
        modalBody.innerHTML = `
          <div style="text-align:center;padding:32px 16px;">
            <div style="font-size:3rem;margin-bottom:16px;">🎉</div>
            <h3 class="t-h3" style="color:var(--charcoal);margin-bottom:8px;">Thank You for Your Review!</h3>
            <p class="t-body" style="color:var(--text-muted);font-size:0.9375rem;line-height:1.6;max-width:380px;margin:0 auto 24px auto;">
              Your review has been submitted to the VKREATE Studio Admin team for verification and approval. It will appear on the website once approved.
            </p>
            <button type="button" class="btn btn-green" onclick="window.closeReviewModal()" style="padding:10px 24px;cursor:pointer;">Close</button>
          </div>
        `;
      }

      setTimeout(() => { window.closeReviewModal(); }, 4000);
    });
  }

  // Handle remote update events by re-rendering reviews
  function onReviewsUpdated() {
    renderReviews();
  }

  function checkAutoOpenModal() {
    if (window.location.search.includes('write=true') || window.location.hash === '#write' || window.location.hash === '#review-modal') {
      setTimeout(() => {
        if (typeof window.openReviewModal === 'function') {
          window.openReviewModal();
        }
      }, 150);
    }
  }

  // Init Engine
  function initEngine() {
    populateProjectDropdown();
    renderReviews();
    setupFilters();
    setupStarSelector();
    setupModalControls();
    setupFormSubmit();
    checkAutoOpenModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }

  // Listen to remote update events (js/data.js dispatches this on remote sync or storage change)
  window.addEventListener('vkreate:reviews-updated', onReviewsUpdated);

})();
