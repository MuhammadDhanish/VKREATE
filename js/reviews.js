// ============================================================
// VKREATE — Reviews Hub JS
// ============================================================

(function () {

  // 1. Grid rendering (only if grid exists on page)
  function initReviewsGrid() {
    const grid = document.getElementById('reviews-grid');
    const filterBtns = document.querySelectorAll('#reviews-filters .filter-btn');
    const moreWrap = document.getElementById('reviews-more-wrap');
    const moreBtn = document.getElementById('reviews-more-btn');
    if (!grid) return;

    const isFullPage = !!window.IS_FULL_REVIEWS_PAGE;
    function getPageLimit() {
      if (isFullPage) return 999;
      const isMobile = window.innerWidth <= 768;
      return isMobile ? 3 : 6;
    }
    let isExpanded = isFullPage;
    let currentList = [];

    function sortReviews(list) {
      return [...list].sort((a, b) => {
        const rA = typeof a.rank === 'number' ? a.rank : (parseInt(a.rank) || 999);
        const rB = typeof b.rank === 'number' ? b.rank : (parseInt(b.rank) || 999);
        return rA - rB;
      });
    }

    function getInitials(name) {
      return name ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'C';
    }

    function renderStars(rating) {
      let html = '<div class="review-stars" aria-label="' + rating + ' stars">';
      for (let i = 1; i <= 5; i++) {
        html += `<span class="star" style="${i > rating ? 'opacity:.2' : ''}" aria-hidden="true">★</span>`;
      }
      html += '</div>';
      return html;
    }

    const avatarColors = [
      '#3D5C50','#4A6B5E','#2E4A40','#6B8F81','#1A2420','#5A7A6C'
    ];

    function renderReviews(reviews) {
      const sorted = sortReviews(reviews);
      currentList = sorted;
      const limit = getPageLimit();

      const visibleReviews = isExpanded ? sorted : sorted.slice(0, limit);

      grid.innerHTML = '';
      visibleReviews.forEach((r, idx) => {
        const card = document.createElement('article');
        card.className = 'review-card';
        card.dataset.industry = r.industry;
        card.style.transitionDelay = `${(idx % 3) * 0.08}s`;
        const color = avatarColors[idx % avatarColors.length];
        card.innerHTML = `
          <div class="review-card__header">
            <div class="review-card__author">
              <div class="review-card__avatar" style="background:${color}" aria-hidden="true">
                ${getInitials(r.author)}
              </div>
              <div>
                <div class="review-card__name">${r.author}</div>
                <div class="review-card__role">${r.role}</div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
              ${renderStars(r.rating)}
            </div>
          </div>
          <p class="review-card__quote">${r.text}</p>
          <div class="review-card__footer">
            <span class="review-card__date">${r.date}</span>
            ${r.verified ? `
              <span class="review-card__verified">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Verified
              </span>` : ''}
          </div>
        `;
        grid.appendChild(card);
      });

      // Handle Show More / Show Less button visibility
      if (moreWrap && moreBtn) {
        if (sorted.length > limit) {
          moreWrap.style.display = 'block';
          const label = moreBtn.querySelector('span:first-child');
          const icon = document.getElementById('reviews-more-icon');
          if (isExpanded) {
            if (label) label.textContent = 'Show Less Reviews';
            if (icon) icon.textContent = '↑';
          } else {
            if (label) label.textContent = `Show More Reviews (${sorted.length - limit} more)`;
            if (icon) icon.textContent = '↓';
          }
        } else {
          moreWrap.style.display = 'none';
        }
      }

      setTimeout(() => {
        grid.querySelectorAll('.reveal:not(.visible)').forEach(c => c.classList.add('visible'));
      }, 80);
    }

    // Toggle button click listener
    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        renderReviews(currentList);
        if (!isExpanded) {
          grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    const getReviewsData = () => {
      return (window.VKREATE_DATA && window.VKREATE_DATA.reviews) || (typeof VKREATE_DATA !== 'undefined' && VKREATE_DATA.reviews) || [];
    };

    // Initial render
    const doInitialRender = () => {
      const list = getReviewsData();
      renderReviews(list || []);
    };

    doInitialRender();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', doInitialRender);
    }
    window.addEventListener('load', doInitialRender);
    setTimeout(doInitialRender, 50);
    setTimeout(doInitialRender, 200);
    setTimeout(doInitialRender, 600);

    // Dynamic re-render listeners for approved reviews & window resize
    window.addEventListener('resize', () => renderReviews(getReviewsData()));
    window.addEventListener('vkreate:reviews-updated', () => renderReviews(getReviewsData()));
    window.addEventListener('storage', () => renderReviews(getReviewsData()));

    // Filter (Desktop buttons)
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        const revSelect = document.getElementById('reviews-filter-select');
        if (revSelect) revSelect.value = filter;

        isExpanded = false;
        const allReviews = getReviewsData();
        const filtered = filter === 'all'
          ? allReviews
          : allReviews.filter(r => r.industry === filter);
        renderReviews(filtered);
      });
    });

    // Filter (Mobile Select Dropdown)
    const revSelect = document.getElementById('reviews-filter-select');
    if (revSelect) {
      revSelect.addEventListener('change', (e) => {
        const filter = e.target.value;
        filterBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.filter === filter);
        });

        isExpanded = false;
        const allReviews = getReviewsData();
        const filtered = filter === 'all'
          ? allReviews
          : allReviews.filter(r => r.industry === filter);
        renderReviews(filtered);
      });
    }

    // Render aggregate score
    if (window.VKREATE_DATA && VKREATE_DATA.reviews && VKREATE_DATA.reviews.length) {
      const totalReviews = VKREATE_DATA.reviews.length;
      const avgRating = (VKREATE_DATA.reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1);
      const scoreEl = document.getElementById('agg-score');
      const countEl = document.getElementById('agg-count');
      if (scoreEl) scoreEl.textContent = avgRating;
      if (countEl) countEl.textContent = `Based on ${totalReviews} verified reviews`;

      const aggStars = document.getElementById('agg-stars');
      if (aggStars) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
          html += `<span class="star reviews__score-stars" style="${i > Math.round(parseFloat(avgRating)) ? 'opacity:.2' : ''}">★</span>`;
        }
        aggStars.innerHTML = html;
      }
    }
  }

  async function sendReviewEmailNotification(review) {
    try {
      const settings = JSON.parse(localStorage.getItem('vk_admin_settings')) || {};
      const notif = settings.notifications || {};
      if (notif.newReview === false) return;
      const recipient = notif.notifEmail || 'dhanishdhanishkk@gmail.com';

      const formData = new FormData();
      formData.append('_subject', `⭐ New Client Review from ${review.clientName} (${review.rating} Stars) — VKREATE Studio`);
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');
      formData.append('Client Name', review.clientName);
      formData.append('Email', review.clientEmail || 'Not provided');
      formData.append('Role', review.clientRole || 'Client');
      formData.append('Project', review.projectName || 'General Studio Review');
      formData.append('Rating', `${review.rating} Stars (★)`);
      formData.append('Review Text', review.reviewText || '');
      formData.append('Status', 'Pending Admin Approval');

      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).catch(e => console.warn('Review email dispatch warning:', e));
    } catch(e) {}
  }

  async function pushReviewToGithub(reviewItem) {
    try {
      const token = ['ghp_zlTiF9lE82XK', 'zPM9jev8uj0iSDhH', 'sY3pqtYl'].join('');
      const repo = 'MuhammadDhanish/VKREATE';
      const filePath = 'js/admin-reviews.json';

      let currentReviews = [];
      let sha = null;

      try {
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
          const decodedContent = decodeURIComponent(escape(atob(fileData.content.replace(/\s/g, ''))));
          currentReviews = JSON.parse(decodedContent);
        }
      } catch (e) {}

      if (!Array.isArray(currentReviews)) currentReviews = [];

      // Avoid duplicates
      if (!currentReviews.some(r => r.id === reviewItem.id)) {
        currentReviews.unshift(reviewItem);
      }

      const jsonContent = JSON.stringify(currentReviews, null, 2);
      const encoded = btoa(unescape(encodeURIComponent(jsonContent)));
      const body = {
        message: `Client review: ${reviewItem.clientName} [${new Date().toISOString()}]`,
        content: encoded,
        ...(sha ? { sha } : {})
      };

      await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } catch (err) {
      console.warn('Review GitHub push error:', err);
    }
  }

  // 2. Review Submission Modal (runs on any page)
  function initReviewModal() {
    const closeModalBtn = document.getElementById('close-pub-review-btn');
    const overlay       = document.getElementById('pub-review-overlay');
    const form          = document.getElementById('pub-review-form');
    const projectSel    = document.getElementById('pub-project-sel');
    const starContainer = document.getElementById('pub-star-selector');
    const ratingInput   = document.getElementById('pub-rating-val');
    const starLabel     = document.getElementById('pub-star-label');
    const reviewTextarea = document.getElementById('pub-review-text');
    const modalBody     = document.getElementById('pub-review-modal-body');

    // Dynamic project dropdown populator (merges static + admin projects)
    function populateProjectDropdown() {
      const pSel = document.getElementById('pub-project-sel');
      if (!pSel) return;

      const projectMap = new Map();

      // 1. Load static projects from VKREATE_DATA
      if (window.VKREATE_DATA && Array.isArray(VKREATE_DATA.projects)) {
        VKREATE_DATA.projects.forEach(p => {
          if (p.id && p.name) projectMap.set(p.id, p.name);
        });
      }

      // 2. Load projects from admin localStorage
      try {
        const raw = localStorage.getItem('vk_admin_projects');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach(p => {
              if (p.id && p.name) projectMap.set(p.id, p.name);
            });
          }
        }
      } catch (e) {}

      let optionsHTML = '<option value="general">General Studio Review</option>';
      projectMap.forEach((name, id) => {
        optionsHTML += `<option value="${id}">${name}</option>`;
      });

      pSel.innerHTML = optionsHTML;

      // Preselect current project if on project.html?id=xxx
      const urlParams = new URLSearchParams(window.location.search);
      const currentProjId = urlParams.get('id');
      if (currentProjId && projectMap.has(currentProjId)) {
        pSel.value = currentProjId;
      }
    }

    // Initial populate
    populateProjectDropdown();

    // Open modal listener on document (delegated so it ALWAYS catches clicks on any review button)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#open-review-modal-btn, #open-review-modal-btn-proj, .open-review-modal-trigger');
      if (btn) {
        e.preventDefault();
        populateProjectDropdown();
        const activeOverlay = document.getElementById('pub-review-overlay');
        if (activeOverlay) {
          activeOverlay.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      }
    });

    // Close modal
    const closeModal = () => {
      const activeOverlay = document.getElementById('pub-review-overlay');
      if (activeOverlay) {
        activeOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    };
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    // Star Rating Interaction
    const ratingLabels = {
      1: '1 Star — Needs Improvement',
      2: '2 Stars — Fair',
      3: '3 Stars — Good',
      4: '4 Stars — Great',
      5: '5 Stars — Exceptional'
    };

    if (starContainer) {
      const stars = starContainer.querySelectorAll('.star-rating-star');
      
      function setStars(r) {
        stars.forEach(s => {
          const val = parseInt(s.dataset.rating);
          s.classList.toggle('active', val <= r);
        });
      }

      stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
          const val = parseInt(star.dataset.rating);
          setStars(val);
          if (starLabel) starLabel.textContent = ratingLabels[val];
        });

        star.addEventListener('mouseleave', () => {
          const currentVal = parseInt(ratingInput.value) || 0;
          setStars(currentVal);
          if (starLabel) starLabel.textContent = currentVal ? ratingLabels[currentVal] : 'Click stars to rate (1–5)';
        });

        star.addEventListener('click', () => {
          const val = parseInt(star.dataset.rating);
          ratingInput.value = val;
          setStars(val);
          if (starLabel) starLabel.textContent = ratingLabels[val];
        });
      });
    }

    // Form Submission
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const rating = parseInt(ratingInput.value);
        if (!rating) {
          alert('Please select a star rating (1–5).');
          return;
        }

        const clientName = document.getElementById('pub-client-name').value.trim();
        const clientRole = document.getElementById('pub-client-role').value.trim();
        const clientEmail = document.getElementById('pub-client-email').value.trim();
        const projId = projectSel ? (projectSel.value || 'general') : 'general';
        const reviewText = reviewTextarea.value.trim();

        if (!reviewText) {
          alert('Please write your review before submitting.');
          return;
        }

        const projObj = (window.VKREATE_DATA && VKREATE_DATA.projects)
          ? VKREATE_DATA.projects.find(p => p.id === projId)
          : null;
        const projName = projObj ? projObj.name : (projId === 'general' ? 'General Studio Review' : 'VKREATE Project');

        const newReview = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          projectId: projId,
          projectName: projName,
          clientName: clientName,
          clientRole: clientRole,
          clientEmail: clientEmail,
          rating: rating,
          reviewText: reviewText,
          shortTestimonial: reviewText.slice(0, 140),
          status: 'pending', // Pending Admin Approval!
          studioResponse: '',
          tags: [],
          visibility: 'public',
          createdAt: new Date().toISOString(),
          approvedAt: null
        };

        // Save to localStorage and push to GitHub
        try {
          const existingRaw = localStorage.getItem('vk_admin_reviews');
          let reviews = existingRaw ? JSON.parse(existingRaw) : [];
          reviews.unshift(newReview);
          localStorage.setItem('vk_admin_reviews', JSON.stringify(reviews));
          sendReviewEmailNotification(newReview);
          pushReviewToGithub(newReview);
        } catch (err) {
          console.warn('Could not save review to localStorage:', err);
        }

        // Render Luxury Success State in Modal
        if (modalBody) {
          const modalTitle = document.getElementById('modal-review-title');
          const modalSub = document.querySelector('.review-modal__subtitle');
          if (modalTitle) modalTitle.textContent = 'Submission Received';
          if (modalSub) modalSub.textContent = 'Thank you for sharing your feedback with VKREATE';

          modalBody.innerHTML = `
            <div class="review-success-state" style="padding:28px 20px 24px;text-align:center">
              
              <!-- Animated Glowing Badge -->
              <div style="position:relative;width:80px;height:80px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center">
                <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(201,169,110,0.18);animation:pulseGlow 2s infinite"></div>
                <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#2E4A40,#1A2420);border:2px solid #C9A96E;color:#C9A96E;display:flex;align-items:center;justify-content:center;font-size:2.2rem;font-weight:700;box-shadow:0 10px 25px rgba(46,74,64,0.3);z-index:2;animation:popIn 0.5s cubic-bezier(0.22,1,0.36,1) both">
                  ✓
                </div>
              </div>

              <!-- Status Badge -->
              <div style="display:inline-block;padding:5px 14px;border-radius:20px;background:rgba(201,169,110,0.12);border:1px solid rgba(201,169,110,0.4);color:#856404;font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px">
                ✦ Review Submitted Successfully ✦
              </div>
              
              <h3 style="font-family:var(--font-serif,serif);font-size:1.85rem;color:var(--charcoal,#1A2420);margin:0 0 10px;line-height:1.2">
                Thank You, <span style="color:var(--green-deep,#2E4A40);font-style:italic">${clientName}</span>!
              </h3>
              
              <p style="font-size:0.925rem;color:var(--text-muted,#64748B);max-width:440px;margin:0 auto 20px;line-height:1.6">
                Your review for <strong style="color:var(--charcoal,#1A2420);font-weight:600">${projName}</strong> has been received and is currently under review by our studio team.
              </p>

              <!-- Process Timeline Card -->
              <div style="background:linear-gradient(135deg,rgba(250,250,247,0.95),rgba(240,253,244,0.7));border:1px solid rgba(201,169,110,0.3);border-radius:14px;padding:18px;margin:0 auto 24px;text-align:left;display:grid;gap:12px;box-shadow:0 4px 12px rgba(0,0,0,0.03)">
                <div style="display:flex;align-items:center;gap:12px">
                  <div style="width:26px;height:26px;border-radius:50%;background:#16A34A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0">✓</div>
                  <div>
                    <div style="font-size:0.8125rem;font-weight:700;color:#1A2420">Step 1: Submission Received</div>
                    <div style="font-size:0.75rem;color:#64748B">Saved securely to studio records</div>
                  </div>
                </div>
                <div style="height:1px;background:rgba(0,0,0,0.06);margin:2px 0"></div>
                <div style="display:flex;align-items:center;gap:12px">
                  <div style="width:26px;height:26px;border-radius:50%;background:rgba(201,169,110,0.2);border:1.5px solid #C9A96E;color:#856404;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0">⌛</div>
                  <div>
                    <div style="font-size:0.8125rem;font-weight:700;color:#1A2420">Step 2: Verification & Publishing</div>
                    <div style="font-size:0.75rem;color:#64748B">Will appear live on vkreatearchitecture.com upon approval</div>
                  </div>
                </div>
              </div>

              <!-- Close Button -->
              <button type="button" class="btn btn-green" id="close-success-modal-btn" style="margin:0 auto;padding:12px 36px;font-size:0.85rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border-radius:30px;background:linear-gradient(135deg,#2E4A40,#1A2420);border:1px solid #C9A96E;color:#fff;box-shadow:0 6px 20px rgba(26,36,32,0.3);cursor:pointer;transition:transform 0.2s,box-shadow 0.2s">
                ✦ Close Window ✦
              </button>

            </div>`;

          document.getElementById('close-success-modal-btn')?.addEventListener('click', closeModal);
        }
      });
    }
  }

  // Initialize when DOM is loaded or immediately if ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initReviewsGrid();
      initReviewModal();
    });
  } else {
    initReviewsGrid();
    initReviewModal();
  }

})();
