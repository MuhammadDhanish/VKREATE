/* ============================================================
   VKREATE Admin — Reviews Management Module & Studio Response
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
            <button type="button" class="btn btn-gold btn-sm" onclick="if(event)event.preventDefault();Reviews.openAddModal()" title="Add a new client review directly from Admin">
              ✍️ Write / Add Client Review
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="if(event)event.preventDefault();Reviews.refreshSync(this)" title="Force merge sync from localStorage, JSON, and Firestore">
              <span class="refresh-icon" style="display:inline-block;transition:transform 0.5s ease;">🔄</span> Refresh &amp; Sync
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="if(event)event.preventDefault();Reviews.deployLive()" title="Fetch fresh data from server database">
              🔄 Refresh from Server
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

      const listEl = document.getElementById('reviews-list');
      if (listEl && !listEl.dataset.delegated) {
        listEl.dataset.delegated = 'true';
        listEl.addEventListener('click', async (e) => {
          const btn = e.target.closest('[data-action]');
          if (!btn) return;
          e.preventDefault();
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          if (!id) return;
          if (action === 'approve') await Reviews.approve(id, btn);
          else if (action === 'reject') await Reviews.reject(id, btn);
          else if (action === 'delete') await Reviews.delete(id, btn);
          else if (action === 'open-response') Reviews.openResponseModal(id);
        });
      }
    } catch (err) {
      console.error('Reviews render error:', err);
    }
  },

  // ── Partial refresh helpers (Projects._refreshTable() equivalent) ──────

  /** Re-renders only the cards list — leaves header, tabs, buttons untouched */
  _refreshCards() {
    try {
      const el = document.getElementById('reviews-list');
      if (!el) { this.render(); return; }
      const allReviews = DB.reviews.all() || [];
      const curFilter = (this._filter || 'all').toLowerCase().trim();
      el.innerHTML = this._cardsHTML(this._filtered(allReviews, curFilter));
    } catch (err) {
      console.error('_refreshCards error:', err);
      try {
        this.render();
      } catch (renderErr) {
        console.error('Full render fallback error:', renderErr);
        const listEl = document.getElementById('reviews-list');
        if (listEl) {
          listEl.innerHTML = `<div class="card" style="padding:24px;color:#DC2626;">⚠️ Failed to display reviews. Please refresh the page.</div>`;
        }
      }
    }
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
  // ── Filter helpers ─────────────────────────────────────────────────────
  _filtered(allReviews, curFilter) {
    if (!Array.isArray(allReviews)) return [];
    const valid = allReviews.filter(r => r && typeof r === 'object' && r.id);
    const f = (curFilter || 'all').toLowerCase().trim();
    if (f === 'pending')  return valid.filter(r => (r.status || 'pending').toString().toLowerCase().trim() === 'pending');
    if (f === 'approved') return valid.filter(r => (r.status || 'pending').toString().toLowerCase().trim() === 'approved');
    if (f === 'rejected') return valid.filter(r => (r.status || 'pending').toString().toLowerCase().trim() === 'rejected');
    return valid;
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
        ✅ Approved ${stats.approved ? `<span class="badge badge-success">${stats.approved}</span>` : '<span class="badge badge-gray">0</span>'}
      </button>
      <button type="button" class="tab-btn ${curFilter === 'rejected' ? 'active' : ''}" onclick="Reviews.setFilter('rejected')">
        🚫 Rejected ${stats.rejected ? `<span class="badge badge-danger">${stats.rejected}</span>` : '<span class="badge badge-gray">0</span>'}
      </button>
    `;
  },

  _cardsHTML(filtered) {
    if (!Array.isArray(filtered) || !filtered.length) {
      return `
        <div class="card" style="padding:48px;text-align:center">
          <div style="font-size:2.5rem;margin-bottom:12px">⭐</div>
          <h3 class="fw-600 text-lg">No Reviews Found</h3>
          <p class="text-muted text-sm mt-4">No reviews match the selected filter category.</p>
        </div>`;
    }

    const cards = filtered.map(r => {
      try {
        return this._reviewCard(r);
      } catch (err) {
        console.error('Malformed review card error:', err, r);
        const rId = (r && r.id) ? UI.escapeHTML(String(r.id)) : 'unknown';
        return `
          <div class="card" style="padding:16px;border-left:4px solid #EF4444;background:#FEF2F2;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span class="text-xs fw-600" style="color:#DC2626;">⚠️ This review has malformed data and could not be displayed</span>
                <div class="text-xs text-muted mt-4">Review ID: <code>${rId}</code></div>
              </div>
              <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${rId}">🗑️ Delete</button>
            </div>
          </div>`;
      }
    });

    return `<div style="display:grid;gap:16px;">${cards.join('')}</div>`;
  },

  _reviewCard(r) {
    if (!r || typeof r !== 'object' || !r.id) {
      throw new Error('Invalid review object');
    }
    let ratingNum = 5;
    try {
      const num = Number(r.rating);
      if (!isNaN(num) && num >= 1 && num <= 5) ratingNum = Math.round(num);
      else {
        const parsed = parseInt(String(r.rating || 5), 10);
        if (!isNaN(parsed)) ratingNum = Math.min(5, Math.max(1, parsed));
      }
    } catch (e) {}

    const stars = '★'.repeat(ratingNum) + '☆'.repeat(5 - ratingNum);
    const status = String(r.status || 'pending').toLowerCase().trim();
    const isApproved = status === 'approved';
    const isRejected = status === 'rejected';

    const clientName    = UI.escapeHTML(String(r.clientName || r.author || 'Anonymous Client'));
    const clientRole    = UI.escapeHTML(String(r.clientRole || r.role || 'Client'));
    const clientEmail   = UI.escapeHTML(String(r.clientEmail || 'No email provided'));
    const reviewText    = UI.escapeHTML(String(r.reviewText || r.text || ''));
    const dateStr       = UI.dateShort(r.createdAt || r.approvedAt || r.date);
    const studioResponse = r.studioResponse ? UI.escapeHTML(String(r.studioResponse)) : '';

    return `
      <div class="card" style="padding:20px;border-left:4px solid ${isApproved ? '#22C55E' : isRejected ? '#EF4444' : '#F59E0B'}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
          <div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:#C9A96E;font-size:1.1rem;letter-spacing:2px;">${stars}</span>
              ${UI.badge(status)}
            </div>
            <h3 style="font-size:1.05rem;font-weight:600;color:var(--text-1);margin-top:6px;">${clientName}</h3>
            <div style="font-size:0.8125rem;color:var(--text-3);margin-top:2px;">
              ${clientRole} &middot; <a href="mailto:${clientEmail}" style="color:var(--green-mid);text-decoration:none;">${clientEmail}</a>
            </div>
          </div>
          <div style="font-size:0.78rem;color:var(--text-4);">${dateStr}</div>
        </div>

        <p style="font-size:0.9375rem;color:var(--text-2);line-height:1.6;margin-top:14px;background:var(--bg);padding:12px 16px;border-radius:var(--r-md);font-style:italic;word-break:break-word;">
          "${reviewText}"
        </p>

        <!-- Studio Response Section -->
        ${studioResponse ? `
          <div style="margin-top:12px;padding:12px 16px;background:rgba(46,74,64,0.06);border-left:3px solid var(--green-deep);border-radius:var(--r-sm);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-weight:600;font-size:0.8125rem;color:var(--green-deep)">💬 Official Studio Response:</span>
              <button type="button" class="btn btn-ghost btn-sm" data-action="open-response" data-id="${UI.escapeHTML(r.id)}" style="padding:2px 8px;font-size:0.75rem;">Edit Response</button>
            </div>
            <p style="font-size:0.875rem;color:var(--text-1);margin:0;word-break:break-word;">"${studioResponse}"</p>
          </div>` : ''}

        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
          <button type="button" class="btn btn-outline btn-sm" data-action="open-response" data-id="${UI.escapeHTML(r.id)}">
            ${studioResponse ? '✏️ Edit Studio Response' : '💬 Add Studio Response'}
          </button>

          <div style="display:flex;gap:8px;">
            ${!isApproved ? `<button type="button" class="btn btn-approve btn-sm" data-action="approve" data-id="${UI.escapeHTML(r.id)}">✓ Approve</button>` : ''}
            ${!isRejected ? `<button type="button" class="btn btn-reject btn-sm" data-action="reject" data-id="${UI.escapeHTML(r.id)}">✕ Reject</button>` : ''}
            <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${UI.escapeHTML(r.id)}">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  // ── CRUD Actions ───────────────────────────────────────────────────────

  async approve(id, btn) {
    if (btn && btn.dataset.loading === 'true') return;
    const origText = btn ? btn.innerText : '✓ Approve';
    if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; btn.innerText = 'Approving...'; }

    try {
      const updated = await DB.reviews.approve(id);
      if (btn) {
        btn.disabled = false;
        btn.innerText = origText;
        delete btn.dataset.loading;
      }

      if (updated) {
        UI.toast('Review approved!', 'success');
        if (typeof App !== 'undefined') App.updateSidebar();
        requestAnimationFrame(() => {
          try {
            this._refreshCards();
            this._refreshTabState();
          } catch (rErr) {
            console.error('rAF refresh error:', rErr);
          }
        });
      }
    } catch (e) {
      console.error('Approve error:', e);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = origText;
        delete btn.dataset.loading;
      }
    }
  },

  async reject(id, btn) {
    if (btn && btn.dataset.loading === 'true') return;
    const origText = btn ? btn.innerText : '✕ Reject';
    if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; btn.innerText = 'Rejecting...'; }

    try {
      const updated = await DB.reviews.reject(id);
      if (btn) {
        btn.disabled = false;
        btn.innerText = origText;
        delete btn.dataset.loading;
      }

      if (updated) {
        UI.toast('Review rejected.', 'warning');
        if (typeof App !== 'undefined') App.updateSidebar();
        requestAnimationFrame(() => {
          try {
            this._refreshCards();
            this._refreshTabState();
          } catch (rErr) {
            console.error('rAF refresh error:', rErr);
          }
        });
      }
    } catch (e) {
      console.error('Reject error:', e);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = origText;
        delete btn.dataset.loading;
      }
    }
  },

  async delete(id, btn) {
    if (btn && btn.dataset.loading === 'true') return;
    const r = DB.reviews.get(id);
    const rawName = r ? (r.clientName || r.author || 'this review') : 'this review';
    const nameStr = (rawName && typeof rawName === 'object') ? 'this review' : String(rawName);

    UI.confirm('Delete Review', `Delete review from "<strong>${UI.escapeHTML(nameStr)}</strong>"? This cannot be undone.`, '🗑️', async () => {
      if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; }
      try {
        const ok = await DB.reviews.delete(id);
        if (ok) {
          UI.toast('Review deleted.', 'success');
          if (typeof App !== 'undefined' && App.updateSidebar) App.updateSidebar();
          DB.afterMutation();
          UI.closeModal();
          const doRefresh = () => {
            try {
              this._refreshCards();
              this._refreshTabState();
            } catch (rErr) {
              console.error('rAF refresh error:', rErr);
            }
          };
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(doRefresh);
          } else {
            doRefresh();
          }
        }
      } catch (e) {
        console.error('Delete error:', e);
        UI.toast('Failed to delete review.', 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          delete btn.dataset.loading;
        }
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
          <textarea class="form-control" id="modal-studio-response" rows="4" placeholder="e.g. Thank you for working with VKREATE! We loved executing your vision...">${UI.escapeHTML(currentResp)}</textarea>
        </div>
      </div>
    `;

    const footer = `
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
        <button type="button" class="btn btn-danger btn-sm" onclick="Reviews.delete('${UI.escapeHTML(r.id)}')">🗑️ Delete Review</button>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
          <button class="btn btn-primary" id="save-studio-response-btn" data-id="${UI.escapeHTML(r.id)}">Save &amp; Update Live Review</button>
        </div>
      </div>
    `;

    UI.modal('💬 Studio Response', body, footer, 'max-w-500');

    const saveBtn = document.getElementById('save-studio-response-btn');
    if (saveBtn) {
      saveBtn.onclick = async (e) => {
        e.preventDefault();
        await Reviews.saveResponse(r.id, saveBtn);
      };
    }
  },

  async saveResponse(id, btn) {
    const textEl = document.getElementById('modal-studio-response');
    if (!textEl) return;

    if (btn && btn.dataset.loading === 'true') return;
    const origText = btn ? btn.innerText : 'Save & Update Live Review';
    if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; btn.innerText = 'Saving...'; }

    try {
      const text = textEl.value.trim();
      const updated = await DB.reviews.update(id, { studioResponse: text });

      if (btn) {
        btn.disabled = false;
        btn.innerText = origText;
        delete btn.dataset.loading;
      }

      if (updated) {
        UI.closeModal();
        UI.toast('Studio response saved!', 'success');
        requestAnimationFrame(() => {
          try {
            this._refreshCards();
          } catch (rErr) {
            console.error('rAF refresh error:', rErr);
          }
        });
      } else if (btn) {
        btn.innerText = origText;
      }
    } catch (e) {
      console.error('Save response error:', e);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = origText;
        delete btn.dataset.loading;
      }
    }
  },

  async refreshSync(btn) {
    const icon = btn ? btn.querySelector('.refresh-icon') : null;
    if (btn) btn.disabled = true;
    if (icon) icon.style.transform = 'rotate(360deg)';

    try {
      await DB.loadRemoteData();
      this.render();
      UI.toast('Reviews refreshed and synced!', 'success');
    } catch (e) {
      UI.toast('Failed to sync reviews.', 'error');
    } finally {
      if (btn) btn.disabled = false;
      if (icon) icon.style.transform = 'rotate(0deg)';
    }
  },

  restoreSeedReviews() {
    UI.confirm(
      'Reset Reviews',
      'This will reset all reviews to default demo reviews. Any newly added reviews will be cleared from local view. Proceed?',
      '🔄',
      async () => {
        const seedData = DB._defaultReviews ? DB._defaultReviews() : [];
        DB._set(DB.KEYS.reviews, seedData);
        DB.reviews._syncPublicMirror(seedData);
        this.render();
        UI.toast('Reviews reset to demo state.', 'info');
        window.dispatchEvent(new Event('storage'));
      },
      true
    );
  },

  openAddModal() {
    const projects = (window.VKREATE_DATA && window.VKREATE_DATA.projects) ? window.VKREATE_DATA.projects : DB.projects.all();
    const projOptions = projects.map(p =>
      `<option value="${p.id}">${UI.escapeHTML(p.name)} (${UI.escapeHTML(p.industryLabel || p.industry || 'Project')})</option>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal';
    overlay.innerHTML = `
      <div class="modal max-w-500" style="padding:28px;">
        <div class="modal__header" style="margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border)">
          <h2 class="modal__title">✍️ Write / Add Client Review</h2>
          <button class="modal__close" type="button" id="close-add-modal-btn">✕</button>
        </div>
        <form id="adm-add-review-form" onsubmit="Reviews.submitAddForm(event)">
          <div class="form-group mb-16">
            <label class="form-label" for="adm-rev-name">Client Name *</label>
            <input id="adm-rev-name" type="text" class="form-control" placeholder="e.g. Dr. Priya Nair" required autocomplete="off">
          </div>
          <div class="form-group mb-16">
            <label class="form-label" for="adm-rev-role">Client Role / Title</label>
            <input id="adm-rev-role" type="text" class="form-control" placeholder="e.g. Managing Director, Retail Group" autocomplete="off">
          </div>
          <div class="form-group mb-16">
            <label class="form-label" for="adm-rev-email">Client Email (Optional)</label>
            <input id="adm-rev-email" type="email" class="form-control" placeholder="e.g. client@example.com" autocomplete="off">
          </div>
          <div class="form-group mb-16">
            <label class="form-label" for="adm-rev-project">Associated Project</label>
            <select id="adm-rev-project" class="form-control">
              <option value="general">General Studio Review</option>
              ${projOptions}
            </select>
          </div>
          <div class="form-group mb-16">
            <label class="form-label" for="adm-rev-rating">Star Rating *</label>
            <select id="adm-rev-rating" class="form-control">
              <option value="5" selected>★★★★★ (5 Stars — Excellent)</option>
              <option value="4">★★★★☆ (4 Stars — Very Good)</option>
              <option value="3">★★★☆☆ (3 Stars — Good)</option>
              <option value="2">★★☆☆☆ (2 Stars — Fair)</option>
              <option value="1">★☆☆☆☆ (1 Star — Poor)</option>
            </select>
          </div>
          <div class="form-group mb-20">
            <label class="form-label" for="adm-rev-text">Review Testimonial Text *</label>
            <textarea id="adm-rev-text" class="form-control" rows="4" placeholder="Type the client's testimonial message..." required></textarea>
          </div>
          <div class="form-group mb-24">
            <label class="form-label" for="adm-rev-status">Initial Status</label>
            <select id="adm-rev-status" class="form-control">
              <option value="approved" selected>✅ Approved (Publish to Live Site Immediately)</option>
              <option value="pending">⏳ Pending Approval</option>
            </select>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:12px;">
            <button type="button" class="btn btn-outline btn-sm" id="cancel-add-modal-btn">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Save &amp; Publish Review</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    const removeModal = () => {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    };

    const escHandler = (e) => {
      if (e.key === 'Escape') removeModal();
    };

    document.addEventListener('keydown', escHandler);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) removeModal(); });
    overlay.querySelector('#close-add-modal-btn')?.addEventListener('click', removeModal);
    overlay.querySelector('#cancel-add-modal-btn')?.addEventListener('click', removeModal);
  },

  async submitAddForm(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Saving...'; }

    try {
      const name      = (document.getElementById('adm-rev-name')?.value    || '').trim();
      const role      = (document.getElementById('adm-rev-role')?.value    || '').trim();
      const email     = (document.getElementById('adm-rev-email')?.value   || '').trim();
      const rating    = parseInt(document.getElementById('adm-rev-rating')?.value  || '5', 10);
      const projectId = document.getElementById('adm-rev-project')?.value  || 'general';
      const text      = (document.getElementById('adm-rev-text')?.value    || '').trim();
      const status    = document.getElementById('adm-rev-status')?.value   || 'approved';

      if (!name || name.length < 2) {
        UI.toast('Client name must be at least 2 characters.', 'warning');
        document.getElementById('adm-rev-name')?.focus();
        return;
      }
      if (!text || text.length < 5) {
        UI.toast('Review text must be at least 5 characters.', 'warning');
        document.getElementById('adm-rev-text')?.focus();
        return;
      }

      const newRev = {
        id:          'rev-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        clientName:  name,
        clientRole:  role || 'Client',
        clientEmail: email,
        projectId,
        rating,
        reviewText:  text,
        status,
        createdAt:   new Date().toISOString(),
        approvedAt:  status === 'approved' ? new Date().toISOString() : null,
      };

      const added = await DB.reviews.add(newRev);
      if (added) {
        const modal = document.getElementById('active-modal');
        if (modal) modal.remove();
        UI.toast(`✓ Review from ${UI.escapeHTML(name)} added!`, 'success');
        if (typeof App !== 'undefined') App.updateSidebar();

        this._filter = 'all';
        this._refreshTabState();
        this._refreshCards();
      }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'Save & Publish Review'; }
    }
  },

  // ── Deploy & Sync ──────────────────────────────────────────────────────

  async deployLive() {
    await DB.loadRemoteData();
    this.render();
    if (window.UI && UI.toast) UI.toast('Refreshed data from server database!', 'success');
  },
};

window.Reviews = Reviews;





