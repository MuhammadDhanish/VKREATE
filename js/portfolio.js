// ============================================================
// VKREATE — Portfolio Gallery JS (with 6-item pagination & ranking)
// ============================================================

(function () {
  const grid = document.getElementById('portfolio-grid');
  const filterBtns = document.querySelectorAll('#portfolio-filters .filter-btn');
  const moreWrap = document.getElementById('portfolio-more-wrap');
  const moreBtn = document.getElementById('portfolio-more-btn');
  if (!grid) return;

  const isFullPage = !!window.IS_FULL_PORTFOLIO_PAGE;
  function getPageLimit() {
    if (isFullPage) return 999;
    const isMobile = window.innerWidth <= 768;
    return isMobile ? 2 : 6;
  }
  let isExpanded = isFullPage;
  let currentList = [];

  // Helper to sort projects by rank
  function sortProjects(list) {
    return [...list].sort((a, b) => {
      const rA = typeof a.rank === 'number' ? a.rank : (parseInt(a.rank) || 999);
      const rB = typeof b.rank === 'number' ? b.rank : (parseInt(b.rank) || 999);
      return rA - rB;
    });
  }

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
    const sorted = sortProjects(projects);
    currentList = sorted;
    const limit = getPageLimit();

    const visibleProjects = isExpanded ? sorted : sorted.slice(0, limit);

    grid.innerHTML = '';
    visibleProjects.forEach((proj, idx) => {
      const card = document.createElement('article');
      card.className = 'portfolio__card card-hover';
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
            onerror="this.onerror=null;this.src='assets/images/project_lilaa_1.jpg'"
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

    // Handle Show More / Show Less button visibility
    if (moreWrap && moreBtn) {
      if (sorted.length > limit) {
        moreWrap.style.display = 'block';
        const label = moreBtn.querySelector('span:first-child');
        const icon = document.getElementById('portfolio-more-icon');
        if (isExpanded) {
          if (label) label.textContent = 'Show Less Projects';
          if (icon) icon.textContent = '↑';
        } else {
          if (label) label.textContent = `Show More Projects (${sorted.length - limit} more)`;
          if (icon) icon.textContent = '↓';
        }
      } else {
        moreWrap.style.display = 'none';
      }
    }

    // Re-trigger reveal observer on new cards
    setTimeout(() => {
      const newCards = grid.querySelectorAll('.reveal:not(.visible)');
      newCards.forEach(c => c.classList.add('visible'));
    }, 80);
  }

  function navigateToProject(id) {
    window.location.href = `project.html?id=${id}`;
  }

  // Toggle button click listener
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      isExpanded = !isExpanded;
      renderCards(currentList);
      if (!isExpanded) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  const getProjectsData = () => {
    return (window.VKREATE_DATA && window.VKREATE_DATA.projects) || (typeof VKREATE_DATA !== 'undefined' && VKREATE_DATA.projects) || [];
  };

  // Initial render
  const doInitialRender = () => {
    const list = getProjectsData();
    if (list && list.length) {
      renderCards(list);
    }
  };

  doInitialRender();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInitialRender);
  }
  window.addEventListener('load', doInitialRender);
  setTimeout(doInitialRender, 50);
  setTimeout(doInitialRender, 200);
  setTimeout(doInitialRender, 600);

  // Event listeners for dynamic updates & resize
  window.addEventListener('resize', () => renderCards(getProjectsData()));
  window.addEventListener('vkreate:idb-resolved', () => renderCards(getProjectsData()));
  window.addEventListener('vkreate:projects-updated', () => renderCards(getProjectsData()));
  window.addEventListener('storage', () => renderCards(getProjectsData()));

  // Filter behavior (Desktop buttons)
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mobileSelect = document.getElementById('portfolio-filter-select');
      if (mobileSelect) mobileSelect.value = filter;

      isExpanded = false;
      const allProjects = getProjectsData();
      const filtered = filter === 'all'
        ? allProjects
        : allProjects.filter(p => p.industry === filter);
      renderCards(filtered);
    });
  });

  // Filter behavior (Mobile Dropdown Select)
  const mobileSelect = document.getElementById('portfolio-filter-select');
  if (mobileSelect) {
    mobileSelect.addEventListener('change', (e) => {
      const filter = e.target.value;
      filterBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.filter === filter);
      });

      isExpanded = false;
      const allProjects = getProjectsData();
      const filtered = filter === 'all'
        ? allProjects
        : allProjects.filter(p => p.industry === filter);
      renderCards(filtered);
    });
  }

})();

