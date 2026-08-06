// ============================================================
// VKREATE — Portfolio Gallery JS
// ============================================================

(function () {
  const grid = document.getElementById('portfolio-grid');
  const filterBtns = document.querySelectorAll('#portfolio-filters .filter-btn');
  if (!grid) return;

  // Render star rating HTML
  function renderStars(rating) {
    let html = '<div class="portfolio__stars" aria-label="Rating: ' + rating + ' out of 5">';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        html += '<span class="star">★</span>';
      } else if (i - 0.5 <= rating) {
        html += '<span class="star" style="opacity:.5">★</span>';
      } else {
        html += '<span class="star" style="opacity:.2">★</span>';
      }
    }
    html += '</div>';
    return html;
  }

  // Render portfolio cards from data
  function renderCards(projects) {
    grid.innerHTML = '';
    projects.forEach((proj, idx) => {
      const card = document.createElement('article');
      card.className = 'portfolio__card reveal card-hover';
      card.dataset.industry = proj.industry;
      card.style.animationDelay = `${idx * 80}ms`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View ${proj.name} project`);
      card.innerHTML = `
        <div class="portfolio__img-wrap">
          <img
            class="portfolio__img"
            src="${proj.thumbnail}"
            alt="${proj.name} interior design project by VKREATE"
            loading="lazy"
          />
          <div class="portfolio__overlay">
            <span class="portfolio__overlay-cta">View Project →</span>
          </div>
          <span class="portfolio__badge">${proj.industryLabel}</span>
        </div>
        <div class="portfolio__info">
          <h3 class="portfolio__title">${proj.name}</h3>
          <div class="portfolio__meta">
            <span class="portfolio__meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              ${proj.location}
            </span>
            <span class="portfolio__meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
              </svg>
              ${proj.area}
            </span>
            <span class="portfolio__meta-item">${proj.duration}</span>
          </div>
          ${renderStars(proj.rating)}
        </div>
      `;
      card.addEventListener('click', () => navigateToProject(proj.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') navigateToProject(proj.id);
      });
      grid.appendChild(card);
    });

    // Re-trigger reveal observer on new cards
    setTimeout(() => {
      const newCards = grid.querySelectorAll('.reveal:not(.visible)');
      newCards.forEach(c => c.classList.add('visible'));
    }, 80);
  }

  function navigateToProject(id) {
    window.location.href = `project.html?id=${id}`;
  }

  // Initial render
  renderCards(VKREATE_DATA.projects);

  // Filter behaviour
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filtered = filter === 'all'
        ? VKREATE_DATA.projects
        : VKREATE_DATA.projects.filter(p => p.industry === filter);
      renderCards(filtered);
    });
  });

})();
