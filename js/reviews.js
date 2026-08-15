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
    const PAGE_LIMIT = isFullPage ? 999 : 6;
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

      const visibleReviews = isExpanded ? sorted : sorted.slice(0, PAGE_LIMIT);

      grid.innerHTML = '';
      visibleReviews.forEach((r, idx) => {
        const card = document.createElement('article');
        card.className = 'review-card reveal visible';
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
        if (sorted.length > PAGE_LIMIT) {
          moreWrap.style.display = 'block';
          const label = moreBtn.querySelector('span:first-child');
          const icon = document.getElementById('reviews-more-icon');
          if (isExpanded) {
            if (label) label.textContent = 'Show Less Reviews';
            if (icon) icon.textContent = '↑';
          } else {
            if (label) label.textContent = `Show More Reviews (${sorted.length - PAGE_LIMIT} more)`;
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

    // Initial render
    if (window.VKREATE_DATA && VKREATE_DATA.reviews) {
      renderReviews(VKREATE_DATA.reviews);
    }

    // Dynamic re-render listeners for approved reviews
    window.addEventListener('vkreate:reviews-updated', () => {
      if (window.VKREATE_DATA && VKREATE_DATA.reviews) {
        renderReviews(VKREATE_DATA.reviews);
      }
    });
    window.addEventListener('storage', () => {
      if (window.VKREATE_DATA && VKREATE_DATA.reviews) {
        renderReviews(VKREATE_DATA.reviews);
      }
    });

    // Filter
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        isExpanded = false; // reset expand on filter change
        const filtered = filter === 'all'
          ? VKREATE_DATA.reviews
          : VKREATE_DATA.reviews.filter(r => r.industry === filter);
        renderReviews(filtered);
      });
    });

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
    const charNum       = document.getElementById('pub-char-num');
    const charWrap      = document.getElementById('pub-char-count');
    const photoZone     = document.getElementById('pub-photo-zone');
    const photoInput    = document.getElementById('pub-photo-input');
    const photoPreview  = document.getElementById('pub-photo-preview');
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

    // Character Counter
    if (reviewTextarea && charNum && charWrap) {
      reviewTextarea.addEventListener('input', () => {
        const len = reviewTextarea.value.length;
        charNum.textContent = `${len} / 500`;
        if (len < 50) {
          charWrap.className = 'char-count-wrap invalid';
        } else {
          charWrap.className = 'char-count-wrap valid';
        }
      });
    }

    // Photo Upload Handler
    if (photoZone && photoInput) {
      photoZone.addEventListener('click', () => photoInput.click());
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            uploadedPhoto = ev.target.result;
            if (photoPreview) {
              photoPreview.style.display = 'block';
              photoPreview.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;background:#FAF8F5;padding:8px 12px;border-radius:8px;border:1px solid #E5E7EB">
                  <img src="${uploadedPhoto}" style="width:40px;height:40px;object-fit:cover;border-radius:6px" alt="Preview" />
                  <span style="font-size:0.8125rem;color:var(--charcoal);flex:1">${file.name}</span>
                  <button type="button" id="remove-photo-btn" style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:0.9rem">✕</button>
                </div>`;
              document.getElementById('remove-photo-btn')?.addEventListener('click', () => {
                uploadedPhoto = '';
                photoInput.value = '';
                photoPreview.style.display = 'none';
              });
            }
          };
          reader.readAsDataURL(file);
        }
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

        if (reviewText.length < 50) {
          alert('Your review must be at least 50 characters long.');
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

        // Save to localStorage
        try {
          const existingRaw = localStorage.getItem('vk_admin_reviews');
          let reviews = existingRaw ? JSON.parse(existingRaw) : [];
          reviews.unshift(newReview);
          localStorage.setItem('vk_admin_reviews', JSON.stringify(reviews));
        } catch (err) {
          console.warn('Could not save review to localStorage:', err);
        }

        // Render Success State in Modal
        if (modalBody) {
          modalBody.innerHTML = `
            <div class="review-success-state">
              <div class="review-success-icon">✓</div>
              <h3 class="t-h2" style="color:var(--charcoal);margin-bottom:8px">Thank You, ${clientName}!</h3>
              <p class="t-body" style="color:var(--text-muted);max-width:440px;margin:0 auto 24px;line-height:1.6">
                Your review for <strong>${projName}</strong> has been submitted and is currently pending admin approval. It will appear on our live site once verified!
              </p>
              <button type="button" class="btn btn-green" id="close-success-modal-btn" style="margin:0 auto">
                Close Window
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
