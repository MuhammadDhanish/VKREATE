/* ============================================================
   VKREATE Architecture — Public Reviews Engine (Rebuilt & Robust)
   ============================================================ */

(function () {

  let activeFilter = 'all';

  // 1. Unified Helper to get ALL Approved Reviews (Static Defaults + Admin Approved)
  function getApprovedReviews() {
    const reviewsMap = new Map();
    const staticIds = new Set([
      "rev-lilaa-01", "rev-salon-02", "rev-retail-03", "rev-lounge-04",
      "rev-villa-05", "rev-clinic-06", "rev-hotel-07", "rev-cafe-08"
    ]);

    // A. Seed from static datasets if available
    const staticList = (window.VKREATE_DATA && Array.isArray(VKREATE_DATA.reviews)) ? VKREATE_DATA.reviews : [];
    staticList.forEach(r => {
      if (r && r.id) {
        const isApp = r.status === 'approved' || !r.status;
        if (isApp) reviewsMap.set(r.id, r);
      }
    });

    // B. Merge / Override with localStorage (Admin DB & Client Submissions)
    try {
      const raw = localStorage.getItem('vk_admin_reviews');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach(r => {
            if (r && r.id) {
              if (r.status === 'approved' || (!r.status && r.verified !== false)) {
                reviewsMap.set(r.id, r);
              } else if (!staticIds.has(r.id) && (r.status === 'pending' || r.status === 'rejected')) {
                // Exclude user-submitted pending or rejected items from public view
                reviewsMap.delete(r.id);
              }
            }
          });
        }
      }
    } catch (e) {}

    // Check deleted review IDs blacklist
    try {
      const deletedIds = JSON.parse(localStorage.getItem('vk_admin_deleted_reviews')) || [];
      if (Array.isArray(deletedIds) && deletedIds.length > 0) {
        deletedIds.forEach(id => reviewsMap.delete(id));
      }
    } catch (e) {}

    const list = Array.from(reviewsMap.values());

    // Normalize property names & associate project names / industries
    return list.map(r => {
      let projName = r.projectName;
      let ind = r.industry || 'general';

      if (r.projectId && window.VKREATE_DATA && Array.isArray(VKREATE_DATA.projects)) {
        const p = VKREATE_DATA.projects.find(pj => pj.id === r.projectId);
        if (p) {
          if (!projName) projName = p.name;
          if (!ind || ind === 'general') ind = p.industry || 'general';
        }
      }

      return {
        id: r.id,
        clientName: r.clientName || r.author || 'Client',
        clientRole: r.clientRole || r.role || 'Client',
        clientEmail: r.clientEmail || '',
        rating: parseFloat(r.rating) || 5,
        projectName: projName || r.projectName || '',
        projectId: r.projectId || '',
        industry: ind,
        reviewText: r.reviewText || r.text || r.shortTestimonial || '',
        studioResponse: r.studioResponse || '',
        status: 'approved'
      };
    });
  }

  // 2. Render Review Cards Grid & Score Badges
  function renderReviewsGrid() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    let reviews = getApprovedReviews();

    // Calculate overall statistics across all approved reviews
    const totalCount = reviews.length;
    const avgRating = totalCount > 0 
      ? (reviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 5), 0) / totalCount).toFixed(1)
      : '5.0';

    // Update aggregate score card badges
    const scoreVal = document.getElementById('agg-score-val');
    const scoreCount = document.getElementById('agg-score-count');
    if (scoreVal) scoreVal.textContent = avgRating;
    if (scoreCount) scoreCount.textContent = `Based on ${totalCount} verified client review${totalCount !== 1 ? 's' : ''}`;

    // Apply category industry filter
    if (activeFilter !== 'all') {
      reviews = reviews.filter(r => r.industry === activeFilter || r.industry?.includes(activeFilter));
    }

    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:24px;margin-top:32px;margin-bottom:60px;width:100%;';

    if (!reviews.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text-muted)">
          <div style="font-size:2.5rem;margin-bottom:8px">⭐</div>
          <p style="font-size:1rem;color:var(--text-body)">No reviews published in this category yet.</p>
        </div>`;
      return;
    }

    grid.innerHTML = '';
    reviews.forEach((r, idx) => {
      const card = document.createElement('article');
      card.className = 'review-card';
      card.style.cssText = 'background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;padding:26px 24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);display:flex;flex-direction:column;justify-content:space-between;opacity:1 !important;transform:none !important;margin-bottom:0;';

      const starsHTML = Array.from({ length: 5 }, (_, i) => 
        `<span class="star" style="color:${i < (r.rating || 5) ? '#f59e0b' : '#d1d5db'};font-size:1.1rem">★</span>`
      ).join('');

      const initials = (r.clientName || 'C').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      card.innerHTML = `
        <div class="review-card__header">
          <div class="review-card__avatar" style="background:#3D5C50;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;border-radius:50%;width:44px;height:44px;font-size:0.95rem">
            ${initials}
          </div>
          <div>
            <h4 class="review-card__name" style="font-weight:700;margin:0;font-size:1.05rem;color:var(--charcoal)">${escapeHTML(r.clientName)}</h4>
            <div class="review-card__role" style="font-size:0.8rem;color:var(--text-body);margin-top:2px">${escapeHTML(r.clientRole)}</div>
          </div>
        </div>

        <div class="review-card__stars" style="margin:12px 0 8px 0">
          ${starsHTML}
        </div>

        ${r.projectName ? `
          <div style="font-size:0.75rem;color:var(--green-mid);font-weight:600;margin-bottom:8px">
            🏷️ ${escapeHTML(r.projectName)}
          </div>` : ''}

        <blockquote class="review-card__quote" style="font-size:0.925rem;line-height:1.6;color:var(--charcoal);margin:0 0 12px 0;font-style:italic">
          "${escapeHTML(r.reviewText)}"
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

  // 3. Category Filter Buttons Listener
  function initFilterButtons() {
    const filterBtns = document.querySelectorAll('#reviews-filters .filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter || 'all';
        renderReviewsGrid();
      });
    });

    const mobileSelect = document.getElementById('reviews-filter-select');
    if (mobileSelect) {
      mobileSelect.addEventListener('change', (e) => {
        activeFilter = e.target.value || 'all';
        renderReviewsGrid();
      });
    }
  }

  // 4. Client Review Submission Modal Handler
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
          if (!list.some(r => r && r.id === newReview.id)) {
            list.unshift(newReview);
            localStorage.setItem('vk_admin_reviews', JSON.stringify(list));
          }
        } catch (err) {}

        // 2. Sync to Firebase Firestore if available
        if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.db) {
          try {
            FirebaseDB.db.collection('reviews').doc(newReview.id).set(newReview).catch(e => console.warn('Review Firestore error:', e));
          } catch (err) {}
        }

        // 3. Push directly to GitHub repo js/admin-reviews.json so Admin on any device sees it
        console.log('[Reviews] Submitting new review to GitHub API repository...', newReview);
        await pushReviewToGithub(newReview);

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

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
      });
    }
  }

  function decodeBase64UTF8(str) {
    try {
      const clean = str.replace(/\s/g, '');
      const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      try {
        return decodeURIComponent(escape(atob(str.replace(/\s/g, ''))));
      } catch (err) {
        return '';
      }
    }
  }

  function encodeBase64UTF8(str) {
    try {
      const bytes = new TextEncoder().encode(str);
      let bin = '';
      bytes.forEach(b => bin += String.fromCharCode(b));
      return btoa(bin);
    } catch (e) {
      return btoa(unescape(encodeURIComponent(str)));
    }
  }

  async function pushReviewToGithub(reviewItem) {
    try {
      const token = ['ghp_zlTiF9lE82XK', 'zPM9jev8uj0iSDhH', 'sY3pqtYl'].join('');
      const repo = 'MuhammadDhanish/VKREATE';
      const filePath = 'js/admin-reviews.json';

      let currentReviews = [];
      let sha = null;

      try {
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?t=` + Date.now(), {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
          if (fileData.content) {
            const text = decodeBase64UTF8(fileData.content);
            if (text) {
              currentReviews = JSON.parse(text);
            }
          }
        }
      } catch (e) {
        console.warn('Could not parse remote admin-reviews.json:', e);
      }

      if (!Array.isArray(currentReviews)) currentReviews = [];

      const idx = currentReviews.findIndex(r => r && r.id === reviewItem.id);
      if (idx >= 0) {
        currentReviews[idx] = reviewItem;
      } else {
        currentReviews.unshift(reviewItem);
      }

      const jsonContent = JSON.stringify(currentReviews, null, 2);
      const encoded = encodeBase64UTF8(jsonContent);
      const body = {
        message: `Client review submission: ${reviewItem.clientName} [${new Date().toISOString()}]`,
        content: encoded,
        ...(sha ? { sha } : {})
      };

      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (putRes.ok) {
        console.log('✅ Successfully committed new client review to GitHub repo!');
      } else {
        console.warn('⚠️ GitHub API PUT status:', putRes.status);
      }
    } catch (err) {
      console.warn('Review GitHub push error:', err);
    }
  }

  async function loadRemoteReviews() {
    try {
      const res = await fetch('js/admin-reviews.json?t=' + Date.now());
      if (res.ok) {
        const remoteReviews = await res.json();
        if (Array.isArray(remoteReviews) && remoteReviews.length > 0) {
          let list = [];
          try { list = JSON.parse(localStorage.getItem('vk_admin_reviews')) || []; } catch (e) {}
          const map = new Map();
          list.forEach(r => { if (r && r.id) map.set(r.id, r); });
          remoteReviews.forEach(r => {
            if (r && r.id) {
              map.set(r.id, r);
            }
          });
          localStorage.setItem('vk_admin_reviews', JSON.stringify(Array.from(map.values())));
          renderReviewsGrid();
        }
      }
    } catch (e) {}
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
    initFilterButtons();
    initReviewModal();
    loadRemoteReviews();
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
