/* ============================================================
   VKREATE Architecture — Public Reviews Engine (Rebuilt)
   ============================================================ */

(function () {

  // 1. Helper to get all approved reviews
  function getApprovedReviews() {
    let reviews = [];

    // 1. Try local storage (synced with admin & Firestore)
    try {
      const raw = localStorage.getItem('vk_admin_reviews');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          reviews = parsed;
        }
      }
    } catch (e) {}

    // 2. Fallback to static dataset if empty
    if (!reviews.length && window.VKREATE_DATA && Array.isArray(VKREATE_DATA.reviews)) {
      reviews = VKREATE_DATA.reviews;
    }

    // Filter only approved reviews
    return reviews.filter(r => r && (r.status === 'approved' || !r.status));
  }

  // 2. Render Review Cards Grid
  function renderReviewsGrid() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    const reviews = getApprovedReviews();

    if (!reviews.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text-muted)">
          <div style="font-size:2rem;margin-bottom:8px">⭐</div>
          <p>No client reviews published yet.</p>
        </div>`;
      return;
    }

    // Calculate score
    const avgRating = (reviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 5), 0) / reviews.length).toFixed(1);
    
    // Update score badge on page if present
    const scoreVal = document.getElementById('agg-score-val');
    const scoreCount = document.getElementById('agg-score-count');
    if (scoreVal) scoreVal.textContent = avgRating;
    if (scoreCount) scoreCount.textContent = `(${reviews.length} Client Review${reviews.length !== 1 ? 's' : ''})`;

    grid.innerHTML = '';
    reviews.forEach((r, idx) => {
      const card = document.createElement('article');
      card.className = 'review-card reveal';
      card.style.animationDelay = `${idx * 0.05}s`;

      const starsHTML = Array.from({ length: 5 }, (_, i) => 
        `<span class="star" style="color:${i < (r.rating || 5) ? '#f59e0b' : '#d1d5db'}">★</span>`
      ).join('');

      const initials = (r.clientName || 'C').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      card.innerHTML = `
        <div class="review-card__header">
          <div class="review-card__avatar" style="background:#3D5C50;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;border-radius:50%;width:44px;height:44px;font-size:0.95rem">
            ${initials}
          </div>
          <div>
            <h4 class="review-card__name" style="font-weight:700;margin:0">${escapeHTML(r.clientName || 'Anonymous Client')}</h4>
            <div class="review-card__role" style="font-size:0.8rem;color:var(--text-body);margin-top:2px">${escapeHTML(r.clientRole || 'Client')}</div>
          </div>
        </div>

        <div class="review-card__stars" style="margin:12px 0 8px 0">
          ${starsHTML}
        </div>

        ${r.projectName ? `
          <div style="font-size:0.75rem;color:var(--green-mid);font-weight:600;margin-bottom:8px">
            🏷️ ${escapeHTML(r.projectName)}
          </div>` : ''}

        <blockquote class="review-card__quote" style="font-size:0.925rem;line-height:1.6;color:var(--charcoal);margin:0 0 12px 0">
          "${escapeHTML(r.reviewText || r.shortTestimonial || '')}"
        </blockquote>

        ${r.studioResponse ? `
          <div style="margin-top:10px;padding:10px 12px;background:rgba(61,92,80,0.06);border-left:2.5px solid var(--green-mid);border-radius:4px">
            <div style="font-size:0.75rem;font-weight:700;color:var(--green-mid)">Studio Response:</div>
            <div style="font-size:0.825rem;color:var(--text-body);margin-top:2px">${escapeHTML(r.studioResponse)}</div>
          </div>` : ''}
      `;

      grid.appendChild(card);
    });
  }

  // 3. Client Review Submission Modal Handler
  function initReviewModal() {
    const closeBtn = document.getElementById('close-pub-review-btn');
    const form = document.getElementById('pub-review-form');
    const starContainer = document.getElementById('pub-star-selector');
    const ratingInput = document.getElementById('pub-rating-val');
    const starLabel = document.getElementById('pub-star-label');

    // Handle open triggers via delegated click listener
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('#open-review-modal-btn, #open-review-modal-btn-proj, .open-review-modal-trigger');
      if (trigger) {
        e.preventDefault();
        const modalOverlay = document.getElementById('pub-review-overlay');
        if (modalOverlay) {
          modalOverlay.classList.add('open', 'show');
          document.body.style.overflow = 'hidden';
        }
      }
    });

    // Handle close trigger
    document.addEventListener('click', (e) => {
      const closeTrigger = e.target.closest('#close-pub-review-btn');
      const modalOverlay = document.getElementById('pub-review-overlay');
      if ((closeTrigger || e.target === modalOverlay) && modalOverlay) {
        modalOverlay.classList.remove('open', 'show');
        document.body.style.overflow = '';
      }
    });

    // Star selector interaction
    if (starContainer && ratingInput) {
      const stars = starContainer.querySelectorAll('.star-rating-star');
      stars.forEach((star) => {
        star.addEventListener('click', () => {
          const val = parseInt(star.dataset.rating) || 5;
          ratingInput.value = val;
          stars.forEach((s, idx) => {
            s.style.color = (idx < val) ? '#f59e0b' : '#d1d5db';
          });
          if (starLabel) starLabel.textContent = `${val} out of 5 stars selected`;
        });
      });
    }

    // Handle form submit
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting Review...';
        }

        const name = document.getElementById('pub-client-name')?.value.trim() || 'Anonymous';
        const role = document.getElementById('pub-client-role')?.value.trim() || 'Client';
        const email = document.getElementById('pub-client-email')?.value.trim() || '';
        const rating = parseInt(ratingInput?.value) || 5;
        const projSel = document.getElementById('pub-project-sel');
        const projName = projSel && projSel.options[projSel.selectedIndex] ? projSel.options[projSel.selectedIndex].text : 'General Studio Review';
        const projId = projSel ? projSel.value : '';
        const text = document.getElementById('pub-review-text')?.value.trim() || '';

        const newReview = {
          id: 'rev-' + Date.now().toString(36),
          clientName: name,
          clientRole: role,
          clientEmail: email,
          rating: rating,
          projectName: projName,
          projectId: projId,
          reviewText: text,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // 1. Save to LocalStorage
        try {
          let list = JSON.parse(localStorage.getItem('vk_admin_reviews')) || [];
          list.unshift(newReview);
          localStorage.setItem('vk_admin_reviews', JSON.stringify(list));
        } catch (err) {}

        // 2. Sync to Firebase Firestore if available
        if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.db) {
          try {
            FirebaseDB.db.collection('reviews').doc(newReview.id).set(newReview).catch(e => console.warn('Review Firestore error:', e));
          } catch (err) {}
        }

        // Show success notification
        const bodyEl = document.getElementById('pub-review-modal-body');
        if (bodyEl) {
          bodyEl.innerHTML = `
            <div style="text-align:center;padding:30px 15px">
              <div style="font-size:3rem;margin-bottom:12px">🎉</div>
              <h3 style="font-size:1.3rem;font-weight:700;color:var(--charcoal);margin-bottom:8px">Thank You, ${escapeHTML(name)}!</h3>
              <p style="font-size:0.9rem;color:var(--text-body);line-height:1.6;max-width:380px;margin:0 auto 20px auto">
                Your review has been submitted successfully and sent to our team for approval.
              </p>
              <button class="btn btn-green" onclick="const o=document.getElementById('pub-review-overlay');if(o)o.classList.remove('open','show');document.body.style.overflow=''">
                Close Window
              </button>
            </div>`;
        }

        window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
      });
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function boot() {
    renderReviewsGrid();
    initReviewModal();
  }

  // Boot immediately if DOM is ready, or on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('vkreate:reviews-updated', () => {
    renderReviewsGrid();
  });
  window.addEventListener('storage', () => {
    renderReviewsGrid();
  });

})();
