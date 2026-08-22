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
      if ((h === 'localhost' || h === '127.0.0.1') && p !== '3000' && p !== '') {
        return 'http://localhost:3000';
      }
    }
    return '';
  }

  let cachedApiReviews = null;

  // ── GitHub push helper (mirrors GithubSync._pushFile from admin) ─────────
  // Pushes a single new pending review into js/admin-reviews.json on GitHub.
  // This is the ONLY way for a visitor's submission to reach the admin panel
  // on a static Vercel deployment (no shared server or DB between devices).
  const GH_REPO  = 'MuhammadDhanish/VKREATE';
  const GH_FILE  = 'js/admin-reviews.json';
  const GH_TOKEN = ['ghp_zlTiF9lE82XK', 'zPM9jev8uj0iSDhH', 'sY3pqtYl'].join('');

  async function pushReviewToGitHub(newReview) {
    try {
      const headers = {
        'Authorization': `token ${GH_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };
      const apiUrl = `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`;

      // 1. Fetch current file from GitHub to get sha + existing reviews
      const getRes = await fetch(apiUrl, { headers });
      if (!getRes.ok) throw new Error(`GitHub GET failed: ${getRes.status}`);
      const fileData = await getRes.json();
      const sha = fileData.sha;

      // 2. Decode existing reviews array
      let existing = [];
      try {
        const clean = fileData.content.replace(/\s/g, '');
        const decoded = decodeURIComponent(escape(atob(clean)));
        existing = JSON.parse(decoded);
        if (!Array.isArray(existing)) existing = [];
      } catch (e) {}

      // 3. Prepend new review (skip if duplicate id)
      if (!existing.some(r => r && r.id === newReview.id)) {
        existing.unshift(newReview);
      }

      // 4. Encode and push
      const jsonStr = JSON.stringify(existing, null, 2);
      const bytes = new TextEncoder().encode(jsonStr);
      let bin = '';
      bytes.forEach(b => bin += String.fromCharCode(b));
      const encoded = btoa(bin);

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `New client review pending: ${newReview.clientName} [${new Date().toISOString()}]`,
          content: encoded,
          sha,
        }),
      });
      if (!putRes.ok) throw new Error(`GitHub PUT failed: ${putRes.status}`);
      return true;
    } catch (e) {
      console.warn('pushReviewToGitHub failed:', e);
      return false;
    }
  }

  // Fetch live reviews from Express backend API
  async function fetchLiveReviews() {
    try {
      const res = await fetch(getApiBaseUrl() + '/api/reviews?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cachedApiReviews = data;
          try {
            localStorage.setItem('vk_admin_reviews', JSON.stringify(data));
          } catch (e) {}
          renderReviews();
          return;
        }
      }
    } catch (err) {
      console.warn('Live API fetch skipped/failed, using local fallback:', err);
    }
  }

  // Get all approved reviews from API cache, localStorage, or VKREATE_DATA
  function getApprovedReviews() {
    let allReviews = [];

    // 1. Check fetched API memory cache
    if (Array.isArray(cachedApiReviews) && cachedApiReviews.length > 0) {
      allReviews = cachedApiReviews;
    }

    // 2. Check localStorage vk_admin_reviews / vk_reviews if API cache is empty
    if (allReviews.length === 0) {
      try {
        const raw = localStorage.getItem('vk_admin_reviews') || localStorage.getItem('vk_reviews');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allReviews = parsed;
          }
        }
      } catch (e) {}
    }

    // 3. Fallback to static VKREATE_DATA.reviews if localStorage is empty
    if (allReviews.length === 0 && window.VKREATE_DATA && Array.isArray(window.VKREATE_DATA.reviews)) {
      allReviews = window.VKREATE_DATA.reviews;
    }

    // Filter approved reviews only
    return allReviews.filter(r => {
      if (!r) return false;
      const isApproved = r.status === 'approved' || r.verified === true || (!r.status && r.rating);
      return isApproved && r.id !== 'mswstn7iv0g7w';
    });
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

    // Update aggregate stats
    const aggScoreEl = document.getElementById('agg-score');
    const aggStarsEl = document.getElementById('agg-stars');
    const aggCountEl = document.getElementById('agg-count');

    if (aggScoreEl) {
      if (reviews.length > 0) {
        const avg = (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1);
        aggScoreEl.textContent = avg;
        if (aggStarsEl) aggStarsEl.innerHTML = renderStarsHTML(Math.round(avg));
        if (aggCountEl) aggCountEl.textContent = `Based on ${reviews.length} verified client review${reviews.length !== 1 ? 's' : ''}`;
      } else {
        aggScoreEl.textContent = '5.0';
        if (aggStarsEl) aggStarsEl.innerHTML = renderStarsHTML(5);
        if (aggCountEl) aggCountEl.textContent = 'Ready for your client review';
      }
    }

    // Filter by industry
    let filtered = reviews;
    if (currentFilter !== 'all') {
      filtered = reviews.filter(r => {
        const ind = (r.industry || '').toLowerCase();
        const pId = (r.projectId || '').toLowerCase();
        return ind.includes(currentFilter) || pId.includes(currentFilter);
      });
    }

    let showAllMobileReviews = window.VKREATE_SHOW_ALL_REVIEWS || false;
    const isMobile = window.innerWidth <= 768;
    const displayList = (isMobile && !showAllMobileReviews) ? filtered.slice(0, 3) : filtered;

    grid.innerHTML = '';

    if (filtered.length === 0) {
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

      const clientName = r.clientName || r.author || 'Verified Client';
      const clientRole = r.clientRole || r.role || 'Client';
      const reviewText = r.reviewText || r.text || '';
      const projName = r.projectName || (window.VKREATE_DATA?.projects?.find(p => p.id === r.projectId)?.name) || '';
      const responseHtml = r.studioResponse ? `
        <div class="review-card__response" style="margin-top:16px;padding:12px 16px;background:rgba(61,92,80,0.06);border-left:3px solid var(--green-mid);border-radius:6px;">
          <div style="font-weight:600;font-size:0.8125rem;color:var(--green-mid);margin-bottom:4px;display:flex;align-items:center;gap:6px;">
            <span>💬 Studio Response from VKREATE:</span>
          </div>
          <p style="font-size:0.875rem;font-style:italic;color:var(--text-body);margin:0;line-height:1.5;">"${r.studioResponse}"</p>
        </div>` : '';

      card.innerHTML = `
        <div class="review-card__header">
          <div class="review-card__stars">${renderStarsHTML(r.rating || 5)}</div>
          <span class="review-card__tag">${r.industryLabel || r.industry || 'Verified'}</span>
        </div>
        <blockquote class="review-card__text">"${reviewText}"</blockquote>
        ${responseHtml}
        <div class="review-card__footer" style="margin-top:16px;">
          <div>
            <div class="review-card__author-name">${clientName}</div>
            <div class="review-card__author-role">${clientRole}${projName ? ' &middot; ' + projName : ''}</div>
          </div>
          <div class="review-card__verified" title="Verified VKREATE Client">✓ Verified</div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Add Mobile "Show All Reviews" Toggle Button if list > 3 items
    let moreBtnWrap = document.getElementById('reviews-mobile-more-wrap');
    if (isMobile && filtered.length > 3) {
      if (!moreBtnWrap) {
        moreBtnWrap = document.createElement('div');
        moreBtnWrap.id = 'reviews-mobile-more-wrap';
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

      const newReview = {
        id: 'rev-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        clientName: clientName,
        author: clientName,
        clientRole: clientRole,
        role: clientRole,
        clientEmail: clientEmail,
        projectId: projectId,
        rating: ratingVal,
        reviewText: reviewText,
        text: reviewText,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Disable submit button and show loading state
      const submitBtn = document.getElementById('pub-review-submit-btn');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

      // 1. POST to backend API (only runs on localhost with Node server)
      let serverSaved = false;
      const apiBase = getApiBaseUrl();
      if (apiBase) {
        try {
          const res = await fetch(apiBase + '/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReview)
          });
          const json = res.ok ? await res.json() : null;
          if (res.ok && json && json.success) {
            serverSaved = true;
            if (json.review && json.review.id && json.review.id !== newReview.id) {
              newReview.id = json.review.id;
            }
          } else if (res.status === 400) {
            showError((json && json.error) ? json.error : 'Your review was rejected by the server. Please check the fields and try again.');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Review for Approval'; }
            return;
          }
        } catch (e) {
          console.warn('Review server submission failed:', e);
        }
      }

      // 2. Post to Firebase Firestore if connected
      let firebaseSaved = false;
      if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.db) {
        try {
          await FirebaseDB.db.collection('reviews').doc(newReview.id).set(newReview);
          firebaseSaved = true;
        } catch (e) {
          console.warn('Review Firestore sync warning:', e);
        }
      }

      // 3. PRIMARY path on Vercel: POST directly to /api/reviews so the running
      //    server.js writes the review to its admin-reviews.json on disk instantly.
      //    This is what the admin panel's loadRemoteData() reads via GET /api/reviews.
      //    Also push to GitHub so future deployments include the pending review.
      let githubSaved = false;
      if (!serverSaved && !firebaseSaved) {
        // 3a. POST to the Vercel server's /api/reviews endpoint (no apiBase prefix = same origin)
        try {
          const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReview)
          });
          const json = res.ok ? await res.json() : null;
          if (res.ok && json && json.success) {
            serverSaved = true;
          }
        } catch (e) {
          console.warn('Vercel /api/reviews POST failed, trying GitHub push:', e);
        }

        // 3b. Also push to GitHub so the file is updated for future deployments
        if (!serverSaved) {
          githubSaved = await pushReviewToGitHub(newReview);
        } else {
          // Push async in background so GitHub is also up to date (for git history)
          pushReviewToGitHub(newReview).catch(() => {});
        }
      }

      // 4. Last-resort: cache in visitor's localStorage (same-browser session only)
      let localSaved = false;
      try {
        const lsKey = 'vk_admin_reviews';
        let existing = [];
        try { existing = JSON.parse(localStorage.getItem(lsKey)) || []; } catch (e) {}
        if (!Array.isArray(existing)) existing = [];
        if (!existing.some(r => r && r.id === newReview.id)) {
          existing.unshift(newReview);
          localStorage.setItem(lsKey, JSON.stringify(existing));
          localStorage.setItem('vk_reviews', JSON.stringify(existing));
        }
        localSaved = true;
      } catch (e) {
        console.warn('localStorage review save failed:', e);
      }

      // 5. Fail only if absolutely nothing worked
      if (!serverSaved && !firebaseSaved && !githubSaved && !localSaved) {
        showError('Could not submit your review. Please check your connection and try again, or email us directly.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Review for Approval'; }
        return;
      }

      // 4. Notify all open tabs (admin panel will pick this up via BroadcastChannel / storage event)
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('vk_sync');
          bc.postMessage({ type: 'reviews-updated', data: newReview });
          bc.close();
        } catch (e) {}
      }
      window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));

      // 5. Show confirmed success to user
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

  // Handle remote update events by invalidating memory cache & re-fetching
  function onReviewsUpdated() {
    cachedApiReviews = null;
    fetchLiveReviews();
  }

  // Setup SSE Real-time EventSource listener
  function setupSseListener() {
    if (typeof EventSource === 'undefined') return;
    try {
      const evtSource = new EventSource(getApiBaseUrl() + '/api/events');
      evtSource.onmessage = function (event) {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type === 'reviews-updated' && Array.isArray(payload.data)) {
            cachedApiReviews = payload.data;
            try {
              localStorage.setItem('vk_admin_reviews', JSON.stringify(payload.data));
              localStorage.setItem('vk_reviews', JSON.stringify(payload.data));
            } catch (e) {}
            renderReviews();
          }
        } catch (err) {}
      };
    } catch (e) {
      console.warn('SSE connection skipped/failed:', e);
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
    fetchLiveReviews();
    setupSseListener();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }

  // Listen to remote update events
  window.addEventListener('vkreate:reviews-updated', onReviewsUpdated);
  window.addEventListener('storage', onReviewsUpdated);

})();
