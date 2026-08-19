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

  // Get all approved reviews from localStorage and VKREATE_DATA
  function getApprovedReviews() {
    let allReviews = [];

    // First check localStorage vk_admin_reviews
    try {
      const raw = localStorage.getItem('vk_admin_reviews');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allReviews = parsed;
        }
      }
    } catch (e) {}

    // Fallback to static VKREATE_DATA.reviews if localStorage is empty
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

    if (aggScoreEl && reviews.length > 0) {
      const avg = (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1);
      aggScoreEl.textContent = avg;
      if (aggStarsEl) aggStarsEl.innerHTML = renderStarsHTML(Math.round(avg));
      if (aggCountEl) aggCountEl.textContent = `Based on ${reviews.length} verified client review${reviews.length !== 1 ? 's' : ''}`;
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

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:48px 20px;background:rgba(255,255,255,0.03);border:1px dashed var(--border-color);border-radius:var(--radius-lg)">
          <div style="font-size:2rem;margin-bottom:12px">✍️</div>
          <h3 class="t-h3" style="color:var(--charcoal)">No Reviews in this Category Yet</h3>
          <p class="t-body" style="color:var(--text-muted);margin-top:4px">Be the first client to review a project in this category.</p>
        </div>`;
      return;
    }

    filtered.forEach((r, idx) => {
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

  // Submission Modal Open/Close Controls
  function setupModalControls() {
    const overlay = document.getElementById('pub-review-overlay');
    const closeBtn = document.getElementById('close-pub-review-btn');
    if (!overlay) return;

    document.querySelectorAll('.open-review-modal-trigger, #open-review-modal-btn, #open-review-modal-btn-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });
  }

  // Review Form Submit Handler
  function setupFormSubmit() {
    const form = document.getElementById('pub-review-form');
    const overlay = document.getElementById('pub-review-overlay');
    const modalBody = document.getElementById('pub-review-modal-body');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const ratingVal = parseInt(document.getElementById('pub-rating-val')?.value || '0', 10);
      if (!ratingVal || ratingVal < 1) {
        alert('Please select a star rating between 1 and 5 stars.');
        return;
      }

      const clientName = (document.getElementById('pub-client-name')?.value || '').trim();
      const clientRole = (document.getElementById('pub-client-role')?.value || '').trim();
      const clientEmail = (document.getElementById('pub-client-email')?.value || '').trim();
      const projectId = document.getElementById('pub-project-sel')?.value || 'general';
      const reviewText = (document.getElementById('pub-review-text')?.value || '').trim();

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

      // Save to localStorage vk_admin_reviews
      try {
        let existing = JSON.parse(localStorage.getItem('vk_admin_reviews')) || [];
        existing.unshift(newReview);
        localStorage.setItem('vk_admin_reviews', JSON.stringify(existing));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      // Sync to Firebase Firestore if initialized
      if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.db) {
        try {
          FirebaseDB.db.collection('reviews').doc(newReview.id).set(newReview, { merge: true });
        } catch (err) {}
      }

      // Notify other open tabs / admin panel via storage event
      window.dispatchEvent(new Event('storage'));

      // Show Thank You Feedback inside modal
      if (modalBody) {
        modalBody.innerHTML = `
          <div style="text-align:center;padding:32px 16px;">
            <div style="font-size:3rem;margin-bottom:16px;">🎉</div>
            <h3 class="t-h3" style="color:var(--charcoal);margin-bottom:8px;">Thank You for Your Review!</h3>
            <p class="t-body" style="color:var(--text-muted);font-size:0.9375rem;line-height:1.6;max-width:380px;margin:0 auto 24px auto;">
              Your review has been submitted to the VKREATE Studio Admin team for verification and approval.
            </p>
            <button class="btn btn-green" onclick="document.getElementById('pub-review-overlay').classList.remove('active');document.body.style.overflow='';" style="padding:10px 24px;">Close</button>
          </div>
        `;
      }

      setTimeout(() => {
        if (overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      }, 3500);
    });
  }

  // Init Engine
  document.addEventListener('DOMContentLoaded', () => {
    populateProjectDropdown();
    renderReviews();
    setupFilters();
    setupStarSelector();
    setupModalControls();
    setupFormSubmit();
  });

  // Listen to remote update events
  window.addEventListener('vkreate:reviews-updated', renderReviews);
  window.addEventListener('storage', renderReviews);

})();
