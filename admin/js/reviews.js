/* ============================================================
   VKREATE Admin — Reviews Management Module & Studio Response
   Synchronization: mirrors Projects-section pattern —
   _refreshCards() for partial DOM, GithubSync.push() after
   every CRUD action, _refreshTabState() for smooth tab switching.
   ============================================================ */

const Reviews = {
  _filter: 'all',
  _renderPending: false,

  // ── Batched render request (prevents double-renders in same frame) ─────
  requestRender() {
    if (this._renderPending) return;
    this._renderPending = true;
    requestAnimationFrame(() => {
      this._renderPending = false;
      this.render();
    });
  },

  // ── Full page render (first load / sync / restore) ────────────────────
  render() {
    try {
      const allReviews = DB.reviews.all() || [];
      const stats = DB.reviews.stats();
      const curFilter = (this._filter || 'all').toLowerCase().trim();
      const filtered = this._filtered(allReviews, curFilter);

      const content = document.getElementById('main-content');
      if (!content) return;

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Client Reviews &amp; Testimonials</h1>
            <p class="page-subtitle">Manage, approve, reject, and respond to client reviews</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-gold btn-sm" onclick="Reviews.openAddModal()" title="Add a new client review directly from Admin">
              ➕ Add Review
            </button>
            <button class="btn btn-outline btn-sm" onclick="Reviews.refreshSync(this)" title="Force merge sync from localStorage, JSON, and Firestore">
              <span class="refresh-icon" style="display:inline-block;transition:transform 0.5s ease;">🔄</span> Refresh &amp; Sync
            </button>
            <button class="btn btn-primary btn-sm" onclick="Reviews.deployLive()" title="Sync approved reviews &amp; studio responses to production live site">
              🚀 Deploy to Live Site
            </button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="tabs-nav mb-24" id="reviews-filter-tabs">
          ${this._tabsHTML(stats, curFilter)}
        </div>

        <!-- Reviews Cards — only this div is updated by _refreshCards() -->
        <div id="reviews-list">
          ${this._cardsHTML(filtered)}
        </div>
      `;
    } catch (err) {
      console.error('Reviews render error:', err);
    }
  },

  // ── Partial refresh helpers (Projects._refreshTable() equivalent) ──────

  /** Re-renders only the cards list — leaves header, tabs, buttons untouched */
  _refreshCards() {
    const el = document.getElementById('reviews-list');
    if (!el) { this.render(); return; }
    const allReviews = DB.reviews.all() || [];
    const curFilter = (this._filter || 'all').toLowerCase().trim();
    el.innerHTML = this._cardsHTML(this._filtered(allReviews, curFilter));
  },

  /** Re-renders only the filter tab bar — leaves everything else untouched */
  _refreshTabState() {
    const el = document.getElementById('reviews-filter-tabs');
    if (!el) return;
    const stats = DB.reviews.stats();
    const curFilter = (this._filter || 'all').toLowerCase().trim();
    el.innerHTML = this._tabsHTML(stats, curFilter);
  },

  // ── Filter helpers ─────────────────────────────────────────────────────
  _filtered(allReviews, curFilter) {
    if (curFilter === 'pending')  return allReviews.filter(r => (r.status || 'pending').toLowerCase().trim() === 'pending');
    if (curFilter === 'approved') return allReviews.filter(r => (r.status || 'pending').toLowerCase().trim() === 'approved');
    if (curFilter === 'rejected') return allReviews.filter(r => (r.status || 'pending').toLowerCase().trim() === 'rejected');
    return allReviews;
  },

  // ── Switch filter — partial update only (no full re-render) ───────────
  setFilter(f) {
    this._filter = f;
    this._refreshTabState();
    this._refreshCards();
  },

  // ── HTML generators ────────────────────────────────────────────────────
  _tabsHTML(stats, curFilter) {
    return `
      <button type="button" class="tab-btn ${curFilter === 'all' ? 'active' : ''}" onclick="Reviews.setFilter('all')">
        All Reviews <span class="badge ${curFilter === 'all' ? 'badge-gold' : 'badge-gray'}">${stats.total || 0}</span>
      </button>
      <button type="button" class="tab-btn ${curFilter === 'pending' ? 'active' : ''}" onclick="Reviews.setFilter('pending')">
        ⏳ Pending Approval ${stats.pending ? `<span class="badge badge-warning">${stats.pending}</span>` : '<span class="badge badge-gray">0</span>'}
      </button>
      <button type="button" class="tab-btn ${curFilter === 'approved' ? 'active' : ''}" onclick="Reviews.setFilter('approved')">
        ✅ Approved <span class="badge ${curFilter === 'approved' ? 'badge-success' : 'badge-gray'}">${stats.approved || 0}</span>
      </button>
      <button type="button" class="tab-btn ${curFilter === 'rejected' ? 'active' : ''}" onclick="Reviews.setFilter('rejected')">
        🚫 Rejected <span class="badge ${curFilter === 'rejected' ? 'badge-danger' : 'badge-gray'}">${stats.rejected || 0}</span>
      </button>
    `;
  },

  _cardsHTML(filtered) {
    if (!filtered.length) {
      return `
        <div class="card" style="padding:48px;text-align:center">
          <div style="font-size:2.5rem;margin-bottom:12px">⭐</div>
          <h3 class="fw-600 text-lg">No Reviews Found</h3>
          <p class="text-muted text-sm mt-4">No reviews match the selected filter category.</p>
          <div style="margin-top:16px;">
            <button class="btn btn-outline btn-sm" onclick="Reviews.restoreSeedReviews()">
              🔄 Restore Sample Reviews &amp; Reset Storage
            </button>
          </div>
        </div>`;
    }
    return `<div style="display:grid;gap:16px;">${filtered.map(r => this._reviewCard(r)).join('')}</div>`;
  },

  _reviewCard(r) {
    const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
    const isApproved = r.status === 'approved';
    const isRejected = r.status === 'rejected';

    const clientName    = UI.escapeHTML(r.clientName || r.author || 'Anonymous Client');
    const clientRole    = UI.escapeHTML(r.clientRole || r.role || 'Client');
    const clientEmail   = UI.escapeHTML(r.clientEmail || 'No email provided');
    const reviewText    = UI.escapeHTML(r.reviewText || r.text || '');
    const dateStr       = UI.dateShort(r.createdAt || r.approvedAt || r.date);
    const studioResponse = r.studioResponse ? UI.escapeHTML(r.studioResponse) : '';

    return `
      <div class="card" style="padding:20px;border-left:4px solid ${isApproved ? '#22C55E' : isRejected ? '#EF4444' : '#F59E0B'}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
          <div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#C9A96E;font-size:1.1rem;letter-spacing:2px;">${stars}</span>
              ${UI.badge(r.status || 'pending')}
            </div>
            <h3 style="font-size:1.05rem;font-weight:600;color:var(--text-1);margin-top:6px;">${clientName}</h3>
            <div style="font-size:0.8125rem;color:var(--text-3);margin-top:2px;">
              ${clientRole} &middot; <a href="mailto:${clientEmail}" style="color:var(--green-mid);text-decoration:none;">${clientEmail}</a>
            </div>
          </div>
          <div style="font-size:0.78rem;color:var(--text-4);">${dateStr}</div>
        </div>

        <p style="font-size:0.9375rem;color:var(--text-2);line-height:1.6;margin-top:14px;background:var(--bg);padding:12px 16px;border-radius:var(--r-md);font-style:italic;">
          "${reviewText}"
        </p>

        <!-- Studio Response Section -->
        ${studioResponse ? `
          <div style="margin-top:12px;padding:12px 16px;background:rgba(46,74,64,0.06);border-left:3px solid var(--green-deep);border-radius:var(--r-sm);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-weight:600;font-size:0.8125rem;color:var(--green-deep)">💬 Official Studio Response:</span>
              <button class="btn btn-ghost btn-sm" onclick="Reviews.openResponseModal('${r.id}')" style="padding:2px 8px;font-size:0.75rem;">Edit Response</button>
            </div>
            <p style="font-size:0.875rem;color:var(--text-1);margin:0;">"${studioResponse}"</p>
          </div>` : ''}

        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
          <button class="btn btn-outline btn-sm" onclick="Reviews.openResponseModal('${r.id}')">
            ${studioResponse ? '✏️ Edit Studio Response' : '💬 Add Studio Response'}
          </button>

          <div style="display:flex;gap:8px;">
            ${!isApproved ? `<button class="btn btn-sm" onclick="Reviews.approve('${r.id}', this)" style="background:#22C55E;color:#fff;border:none;">✓ Approve</button>` : ''}
            ${!isRejected ? `<button class="btn btn-outline btn-sm" onclick="Reviews.reject('${r.id}', this)" style="color:#EF4444;border-color:#FCA5A5;">✕ Reject</button>` : ''}
            <button class="btn btn-danger btn-sm" onclick="Reviews.delete('${r.id}', this)">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  // ── CRUD Actions ───────────────────────────────────────────────────────

  async approve(id, btn) {
    if (btn && btn.dataset.loading === 'true') return;
    const origText = btn ? btn.innerText : '';
    if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; btn.innerText = 'Approving...'; }

    const updated = await DB.reviews.approve(id);
    if (updated) {
      UI.toast('Review approved!', 'success');
      if (typeof App !== 'undefined') App.updateSidebar();
      // Clear loading guard BEFORE refresh so _refreshCurrentView doesn't block
      if (btn) { delete btn.dataset.loading; }
      // Partial DOM update — only cards, matching Projects._refreshTable() pattern
      requestAnimationFrame(() => {
        this._refreshCards();
        this._refreshTabState();
      });
      // Auto-push to GitHub/live site — same as Projects.toggleStatus() and setRank()
      if (window.GithubSync) GithubSync.push();
    } else if (btn) {
      btn.disabled = false;
      btn.innerText = origText;
      delete btn.dataset.loading;
    }
  },

  async reject(id, btn) {
    if (btn && btn.dataset.loading === 'true') return;
    const origText = btn ? btn.innerText : '';
    if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; btn.innerText = 'Rejecting...'; }

    const updated = await DB.reviews.reject(id);
    if (updated) {
      UI.toast('Review set to rejected', 'warning');
      if (typeof App !== 'undefined') App.updateSidebar();
      if (btn) { delete btn.dataset.loading; }
      requestAnimationFrame(() => {
        this._refreshCards();
        this._refreshTabState();
      });
      // Auto-push to GitHub — matches Projects pattern
      if (window.GithubSync) GithubSync.push();
    } else if (btn) {
      btn.disabled = false;
      btn.innerText = origText;
      delete btn.dataset.loading;
    }
  },

  delete(id, btn) {
    if (btn && btn.dataset.loading === 'true') return;
    UI.confirm('Delete Review', 'Are you sure you want to delete this review?', '🗑️', async () => {
      if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; }
      const ok = await DB.reviews.delete(id);
      if (ok) {
        UI.toast('Review deleted', 'info');
        if (typeof App !== 'undefined') App.updateSidebar();
        if (btn) { delete btn.dataset.loading; }
        requestAnimationFrame(() => {
          this._refreshCards();
          this._refreshTabState();
        });
        // Auto-push to GitHub — matches Projects.delete() pattern
        if (window.GithubSync) GithubSync.push();
      } else if (btn) {
        btn.disabled = false;
        delete btn.dataset.loading;
      }
    }, true);
  },

  // ── Studio Response ────────────────────────────────────────────────────

  openResponseModal(id) {
    const r = DB.reviews.get(id);
    if (!r) return;

    const currentResp = r.studioResponse || '';
    const body = `
      <div>
        <p style="font-size:0.875rem;color:var(--text-3);margin-bottom:12px">
          Write an official studio response to <strong>${UI.escapeHTML(r.clientName || r.author || 'Client')}</strong>'s review. This will be publicly displayed under their review card on the live website.
        </p>
        <div class="form-group">
          <label class="form-label">Studio Response Message</label>
          <textarea class="form-control" id="modal-studio-response" rows="4" placeholder="e.g. Thank you for working with VKREATE! We loved executing your vision...">${currentResp}</textarea>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="Reviews.saveResponse('${r.id}', this)">Save &amp; Update Live Review</button>
    `;

    UI.modal('💬 Studio Response', body, footer, 'max-w-500');
  },

  async saveResponse(id, btn) {
    const textEl = document.getElementById('modal-studio-response');
    if (!textEl) return;

    if (btn && btn.dataset.loading === 'true') return;
    const origText = btn ? btn.innerText : '';
    if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; btn.innerText = 'Saving...'; }

    const text = textEl.value.trim();
    const updated = await DB.reviews.update(id, { studioResponse: text });
    if (updated) {
      UI.closeModal();
      UI.toast('Studio response saved successfully!', 'success');
      // Partial update only — no full page destroy
      this._refreshCards();
      // Auto-push to GitHub so live site gets the response immediately
      if (window.GithubSync) GithubSync.push();
    } else if (btn) {
      btn.disabled = false;
      btn.innerText = origText;
      delete btn.dataset.loading;
    }
  },

  // ── Deploy & Sync ──────────────────────────────────────────────────────

  async deployLive() {
    if (typeof GithubSync !== 'undefined' && GithubSync.push) {
      const ok = await GithubSync.push();
      if (ok) {
        UI.toast('🚀 Reviews & Responses deployed to Live Site!', 'success');
      }
    } else {
      UI.toast('Local storage reviews synced across tabs!', 'info');
    }
  },

  async refreshSync(btn) {
    const icon = btn ? btn.querySelector('.refresh-icon') : null;
    if (btn) btn.disabled = true;
    if (icon) icon.style.transform = 'rotate(360deg)';

    try {
      if (typeof DB.loadRemoteData === 'function') {
        await DB.loadRemoteData();
      }
    } catch (e) {}

    if (typeof App !== 'undefined' && App.updateSidebar) App.updateSidebar();
    // Full re-render after a manual sync (data may have changed substantially)
    this.render();

    // Re-enable button after animation
    setTimeout(() => {
      if (btn) { btn.disabled = false; }
      if (icon) icon.style.transform = '';
    }, 600);

    const all = DB.reviews.all() || [];
    const pendingCount  = all.filter(r => r && r.status === 'pending').length;
    const approvedCount = all.filter(r => r && r.status === 'approved').length;
    UI.toast(`✓ Synced successfully! (${pendingCount} pending, ${approvedCount} approved)`, 'success');
  },

  restoreSeedReviews() {
    try {
      const deletedIds = DB._getDeleted(DB.KEYS.deletedReviews) || [];
      const defaults = DB._defaultReviews().filter(r => r && r.id && !deletedIds.includes(r.id));
      DB.reviews.save(defaults);
      UI.toast('✓ Restored missing sample reviews!', 'success');
      this.render();
      if (typeof App !== 'undefined') App.updateSidebar();
    } catch (e) {
      console.warn('restoreSeedReviews error:', e);
    }
  },

  // ── Add Review Modal ───────────────────────────────────────────────────

  openAddModal() {
    const projects = DB.projects.all() || [];
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = 'admin-add-review-modal';

    overlay.innerHTML = `
      <div class="modal card" style="max-width:560px;width:100%;padding:28px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h2 style="font-family:var(--font-serif);font-size:1.4rem;font-weight:400;color:var(--text-1);margin:0;">➕ Add Client Review</h2>
          <button class="btn btn-ghost btn-icon" onclick="document.getElementById('admin-add-review-modal').remove()" style="font-size:1.2rem;">✕</button>
        </div>

        <form id="admin-add-review-form" onsubmit="Reviews.submitAddForm(event)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label" style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;">Client Name *</label>
              <input type="text" id="adm-rev-name" class="form-control" placeholder="e.g. Unnikrishnan Nair" required />
            </div>
            <div class="form-group">
              <label class="form-label" style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;">Role / Title *</label>
              <input type="text" id="adm-rev-role" class="form-control" placeholder="e.g. Founder, Lilaa Restaurants" required />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label" style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;">Email Address</label>
              <input type="email" id="adm-rev-email" class="form-control" placeholder="client@company.com" />
            </div>
            <div class="form-group">
              <label class="form-label" style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;">Rating *</label>
              <select id="adm-rev-rating" class="form-control">
                <option value="5" selected>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;">Select Project (Optional)</label>
            <select id="adm-rev-project" class="form-control">
              <option value="general">General Studio Testimonial</option>
              ${projects.map(p => `<option value="${p.id}">${UI.escapeHTML(p.name)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;">Review Text *</label>
            <textarea id="adm-rev-text" class="form-control" rows="4" placeholder="Write the client's review text..." required></textarea>
          </div>

          <div class="form-group" style="margin-bottom:24px;">
            <label class="form-label" style="display:block;font-size:0.8125rem;font-weight:600;margin-bottom:6px;">Status *</label>
            <select id="adm-rev-status" class="form-control">
              <option value="approved" selected>✅ Approved (Publish to Live Site Immediately)</option>
              <option value="pending">⏳ Pending Approval</option>
            </select>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:12px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('admin-add-review-modal').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Save &amp; Publish Review</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  async submitAddForm(e) {
    e.preventDefault();
    const name      = (document.getElementById('adm-rev-name')?.value    || '').trim();
    const role      = (document.getElementById('adm-rev-role')?.value    || '').trim();
    const email     = (document.getElementById('adm-rev-email')?.value   || '').trim();
    const rating    = parseInt(document.getElementById('adm-rev-rating')?.value  || '5', 10);
    const projectId = document.getElementById('adm-rev-project')?.value  || 'general';
    const text      = (document.getElementById('adm-rev-text')?.value    || '').trim();
    const status    = document.getElementById('adm-rev-status')?.value   || 'approved';

    if (!name || !text) {
      UI.toast('Please provide a client name and review text.', 'warning');
      return;
    }

    const newRev = {
      id:          'rev-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      clientName:  name,
      author:      name,
      clientRole:  role || 'Client',
      role:        role || 'Client',
      clientEmail: email,
      projectId,
      rating,
      reviewText:  text,
      text,
      status,
      createdAt:   new Date().toISOString(),
      approvedAt:  status === 'approved' ? new Date().toISOString() : null,
    };

    // Close modal first so the user sees progress
    const modal = document.getElementById('admin-add-review-modal');
    if (modal) modal.remove();

    await DB.reviews.add(newRev);

    UI.toast(`✓ Review from ${name} added successfully!`, 'success');
    if (typeof App !== 'undefined') App.updateSidebar();

    // Reset filter to show all reviews so new card is always visible (matches Projects pattern)
    this._filter = 'all';
    this._refreshTabState();
    this._refreshCards();

    // Auto-push to GitHub — matches Projects.submitDirect() behaviour
    if (window.GithubSync) GithubSync.push();
  },
};

// ── Real-time sync event listeners ────────────────────────────────────────
// Use _refreshCards() for background sync events — preserves header/buttons
window.addEventListener('storage', () => {
  if (typeof App !== 'undefined' && App._current === 'reviews') {
    // Only do partial update if page is already rendered
    const listEl = document.getElementById('reviews-list');
    if (listEl) {
      Reviews._refreshCards();
      Reviews._refreshTabState();
    } else {
      Reviews.requestRender();
    }
  }
  if (typeof App !== 'undefined') App.updateSidebar();
});

window.addEventListener('vkreate:reviews-updated', () => {
  if (typeof App !== 'undefined' && App._current === 'reviews') {
    const listEl = document.getElementById('reviews-list');
    if (listEl) {
      Reviews._refreshCards();
      Reviews._refreshTabState();
    } else {
      Reviews.requestRender();
    }
  }
  if (typeof App !== 'undefined') App.updateSidebar();
});
