// ============================================================
// VKREATE — Reviews Hub JS
// ============================================================

(function () {
  const grid = document.getElementById('reviews-grid');
  const filterBtns = document.querySelectorAll('#reviews-filters .filter-btn');
  if (!grid) return;

  function getInitials(name) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
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
    grid.innerHTML = '';
    reviews.forEach((r, idx) => {
      const card = document.createElement('article');
      card.className = 'review-card reveal';
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
    setTimeout(() => {
      grid.querySelectorAll('.reveal:not(.visible)').forEach(c => c.classList.add('visible'));
    }, 80);
  }

  // Initial render
  renderReviews(VKREATE_DATA.reviews);

  // Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const filtered = filter === 'all'
        ? VKREATE_DATA.reviews
        : VKREATE_DATA.reviews.filter(r => r.industry === filter);
      renderReviews(filtered);
    });
  });

  // Render aggregate score
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

})();
