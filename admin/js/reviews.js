/* ============================================================
   VKREATE Admin — Reviews Moderation Module (Rebuilt)
   ============================================================ */

const Reviews = {

  _filter: { status: 'all', search: '' },

  render() {
    const stats = DB.reviews.stats();
    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Client Reviews & Testimonials</h1>
          <p class="page-subtitle">${stats.total} total reviews · ${stats.pending} pending approval · ${stats.approved} live on site</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline btn-sm" onclick="Reviews.exportCSV()">
            ${UI.icon('download')} Export CSV
          </button>
          <button class="btn btn-primary" onclick="Reviews.openAddModal()">
            ${UI.icon('plus')} Add Manual Review
          </button>
        </div>
      </div>

      <!-- Status Tabs -->
      <div style="display:flex;gap:6px;background:var(--card);border:1px solid var(--border);border-radius:var(--r-lg);padding:6px;margin-bottom:20px;width:fit-content;flex-wrap:wrap">
        ${['all','pending','approved','rejected'].map(s => `
          <button class="btn ${this._filter.status===s ? 'btn-primary' : 'btn-ghost'} btn-sm"
            style="${this._filter.status===s ? '' : 'color:var(--text-3)'}"
            onclick="Reviews.setTab('${s}')">
            ${s.charAt(0).toUpperCase() + s.slice(1)}
            ${s === 'pending' && stats.pending ? `<span class="nav-item__badge" style="position:static;display:inline-block;margin-left:6px;background:#eab308;color:#000">${stats.pending}</span>` : ''}
          </button>`).join('')}
      </div>

      <!-- Filters & Search -->
      <div class="filters-bar mb-16">
        <div class="search-bar">
          ${UI.icon('search','search-bar__icon')}
          <input type="search" placeholder="Search by client name, project, or review text..." value="${this._filter.search}"
            oninput="Reviews._filter.search=this.value;Reviews._refresh()">
        </div>
        <span class="text-xs text-muted ml-auto" id="review-count"></span>
      </div>

      <!-- Pending Reviews Banner Alert -->
      ${stats.pending > 0 ? `
        <div style="background:#fefce8;border:1px solid #fef08a;border-radius:var(--r-md);padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span style="font-size:1.5rem">⚠️</span>
          <div>
            <div class="fw-600 text-sm" style="color:#854d0e">${stats.pending} client review${stats.pending > 1 ? 's' : ''} awaiting approval</div>
            <div class="text-xs" style="color:#a16207">Client reviews are held in pending status until you approve them for the live website.</div>
          </div>
          <button class="btn btn-warning btn-sm ml-auto" style="background:#eab308;color:#000;border:none;font-weight:600"
            onclick="Reviews.setTab('pending')">Review Pending (${stats.pending})</button>
        </div>` : ''}

      <!-- Reviews Grid -->
      <div id="reviews-list-container"></div>
    `;

    this._refresh();
  },

  setTab(s) {
    this._filter.status = s;
    this.render();
  },

  _filtered() {
    let list = DB.reviews.all();
    if (this._filter.status !== 'all') {
      list = list.filter(r => r.status === this._filter.status);
    }
    if (this._filter.search) {
      const q = this._filter.search.toLowerCase().trim();
      list = list.filter(r => 
        (r.clientName && r.clientName.toLowerCase().includes(q)) ||
        (r.clientRole && r.clientRole.toLowerCase().includes(q)) ||
        (r.projectName && r.projectName.toLowerCase().includes(q)) ||
        (r.reviewText && r.reviewText.toLowerCase().includes(q))
      );
    }
    return list;
  },

  _refresh() {
    const list = this._filtered();
    const countEl = document.getElementById('review-count');
    if (countEl) countEl.textContent = `${list.length} review${list.length !== 1 ? 's' : ''} showing`;

    const container = document.getElementById('reviews-list-container');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⭐</div>
          <div class="empty-state__title">No reviews found</div>
          <p class="empty-state__text">There are no reviews matching your filter criteria.</p>
        </div>`;
      return;
    }

    container.innerHTML = `<div style="display:grid;gap:16px">${list.map(r => this._cardHTML(r)).join('')}</div>`;
  },

  _escapeHTML(str) {
    if (typeof UI !== 'undefined' && typeof UI.escapeHTML === 'function') {
      return UI.escapeHTML(str);
    }
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  _cardHTML(r) {
    const stars = Array.from({ length: 5 }, (_, i) => 
      `<span style="color:${i < (r.rating || 5) ? '#f59e0b' : '#d1d5db'};font-size:1.1rem">★</span>`
    ).join('');

    const statusBadge = r.status === 'approved' 
      ? `<span class="badge badge-success">Approved</span>`
      : r.status === 'pending'
      ? `<span class="badge badge-warning" style="background:#fef08a;color:#854d0e">Pending Approval</span>`
      : `<span class="badge badge-danger">Rejected</span>`;

    const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

    return `
      <div class="card" style="padding:20px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--card)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:12px">
          <div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="fw-700 text-base">${this._escapeHTML(r.clientName || 'Anonymous')}</span>
              ${statusBadge}
            </div>
            <div class="text-xs text-muted mt-2">
              ${this._escapeHTML(r.clientRole || 'Client')} ${r.clientEmail ? `· <a href="mailto:${r.clientEmail}" style="color:inherit">${this._escapeHTML(r.clientEmail)}</a>` : ''} · ${dateStr}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            ${stars}
            <span class="text-xs fw-600 ml-4" style="color:#f59e0b">${r.rating || 5}/5</span>
          </div>
        </div>

        ${r.projectName ? `
          <div style="margin-bottom:10px">
            <span style="font-size:0.75rem;background:var(--bg);padding:4px 8px;border-radius:4px;color:var(--text-2);border:1px solid var(--border)">
              🏷️ ${this._escapeHTML(r.projectName)}
            </span>
          </div>` : ''}

        <blockquote style="margin:10px 0;padding:12px 16px;background:var(--bg);border-left:3px solid #16a34a;border-radius:0 var(--r-sm) var(--r-sm) 0;font-style:italic;color:var(--text-1);font-size:0.9rem;line-height:1.6">
          "${this._escapeHTML(r.reviewText || r.shortTestimonial || '')}"
        </blockquote>

        ${r.studioResponse ? `
          <div style="margin-top:12px;padding:12px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--r-sm)">
            <div style="font-size:0.75rem;font-weight:700;color:#15803d;margin-bottom:4px">💬 Studio Response:</div>
            <div style="font-size:0.85rem;color:#166534">${this._escapeHTML(r.studioResponse)}</div>
          </div>` : ''}

        <div style="display:flex;gap:8px;margin-top:16px;align-items:center;flex-wrap:wrap">
          ${r.status !== 'approved' ? `
            <button class="btn btn-primary btn-sm" style="background:#16a34a;border-color:#16a34a" onclick="Reviews.approve('${r.id}')">
              ✅ Approve for Website
            </button>` : ''}

          ${r.status !== 'rejected' ? `
            <button class="btn btn-outline btn-sm" onclick="Reviews.reject('${r.id}')">
              ❌ Reject
            </button>` : ''}

          <button class="btn btn-outline btn-sm" onclick="Reviews.openReplyModal('${r.id}')">
            💬 ${r.studioResponse ? 'Edit Reply' : 'Add Reply'}
          </button>

          <button class="btn btn-outline btn-sm" onclick="Reviews.openEditModal('${r.id}')">
            ✏️ Edit Review
          </button>

          <button class="btn btn-outline btn-sm text-danger ml-auto" onclick="Reviews.delete('${r.id}')" style="color:#dc2626">
            🗑️ Delete
          </button>
        </div>
      </div>`;
  },

  approve(id) {
    const updated = DB.reviews.approve(id);
    if (updated) {
      UI.toast('✅ Review approved! It is now live on the website.', 'success');
      this._notifyUpdate();
      this.render();
    }
  },

  reject(id) {
    const updated = DB.reviews.reject(id);
    if (updated) {
      UI.toast('Review set to rejected.', 'info');
      this._notifyUpdate();
      this.render();
    }
  },

  delete(id) {
    UI.confirm('Delete Review', 'Are you sure you want to permanently delete this client review?', '🗑️', () => {
      DB.reviews.delete(id);
      UI.toast('Review deleted.', 'success');
      this._notifyUpdate();
      this.render();
    }, true);
  },

  openReplyModal(id) {
    const r = DB.reviews.get(id);
    if (!r) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:500px">
        <div class="modal__header">
          <h3 class="modal__title">💬 Studio Response</h3>
          <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal__body" style="padding:20px">
          <p class="text-sm text-muted mb-12">Write an official reply to <strong>${this._escapeHTML(r.clientName)}</strong>'s review. This will be displayed publicly under their testimonial.</p>
          <div class="form-group">
            <label class="form-label">Studio Reply</label>
            <textarea class="form-control" id="reply-text" rows="4" placeholder="e.g. Thank you for your kind words! It was a pleasure designing your space.">${this._escapeHTML(r.studioResponse || '')}</textarea>
          </div>
        </div>
        <div class="modal__footer">
          <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" id="save-reply-btn">Save Response</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#save-reply-btn').onclick = () => {
      const text = overlay.querySelector('#reply-text').value.trim();
      DB.reviews.update(id, { studioResponse: text });
      overlay.remove();
      UI.toast('Studio response saved!', 'success');
      this._notifyUpdate();
      this.render();
    };
  },

  openAddModal() {
    this._showReviewFormModal(null);
  },

  openEditModal(id) {
    const r = DB.reviews.get(id);
    if (r) this._showReviewFormModal(r);
  },

  _showReviewFormModal(existing) {
    const projects = DB.projects.all();
    const isEdit = !!existing;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:550px">
        <div class="modal__header">
          <h3 class="modal__title">${isEdit ? '✏️ Edit Review' : '➕ Add Manual Review'}</h3>
          <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal__body" style="padding:20px">
          <form id="admin-review-form" style="display:grid;gap:14px">
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label">Client Name *</label>
                <input class="form-control" name="clientName" value="${this._escapeHTML(existing?.clientName || '')}" required placeholder="e.g. Unnikrishnan Nair">
              </div>
              <div class="form-group">
                <label class="form-label">Client Role / Company *</label>
                <input class="form-control" name="clientRole" value="${this._escapeHTML(existing?.clientRole || '')}" required placeholder="e.g. Founder, Lilaa Hospitality">
              </div>
            </div>

            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label">Client Email</label>
                <input class="form-control" type="email" name="clientEmail" value="${this._escapeHTML(existing?.clientEmail || '')}" placeholder="client@example.com">
              </div>
              <div class="form-group">
                <label class="form-label">Star Rating (1 - 5) *</label>
                <select class="form-control" name="rating">
                  <option value="5" ${existing?.rating === 5 ? 'selected' : ''}>★★★★★ (5 Stars)</option>
                  <option value="4" ${existing?.rating === 4 ? 'selected' : ''}>★★★★☆ (4 Stars)</option>
                  <option value="3" ${existing?.rating === 3 ? 'selected' : ''}>★★★☆☆ (3 Stars)</option>
                  <option value="2" ${existing?.rating === 2 ? 'selected' : ''}>★★☆☆☆ (2 Stars)</option>
                  <option value="1" ${existing?.rating === 1 ? 'selected' : ''}>★☆☆☆☆ (1 Star)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Associated Project</label>
              <select class="form-control" name="projectId">
                <option value="">General Studio Review</option>
                ${projects.map(p => `
                  <option value="${p.id}" ${existing?.projectId === p.id ? 'selected' : ''}>${this._escapeHTML(p.name)}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Review Text *</label>
              <textarea class="form-control" name="reviewText" rows="4" required placeholder="Write client feedback details...">${this._escapeHTML(existing?.reviewText || '')}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Approval Status</label>
              <select class="form-control" name="status">
                <option value="approved" ${existing?.status === 'approved' || !isEdit ? 'selected' : ''}>Approved (Live on website)</option>
                <option value="pending" ${existing?.status === 'pending' ? 'selected' : ''}>Pending Approval</option>
                <option value="rejected" ${existing?.status === 'rejected' ? 'selected' : ''}>Rejected</option>
              </select>
            </div>

            <div class="modal__footer" style="padding:10px 0 0 0">
              <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Review'}</button>
            </div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#admin-review-form').onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      const projId = f.projectId.value;
      const proj = projects.find(p => p.id === projId);

      const reviewData = {
        clientName: f.clientName.value.trim(),
        clientRole: f.clientRole.value.trim(),
        clientEmail: f.clientEmail.value.trim(),
        rating: parseInt(f.rating.value) || 5,
        projectId: projId || '',
        projectName: proj ? proj.name : 'General Studio Review',
        reviewText: f.reviewText.value.trim(),
        status: f.status.value,
        ...(f.status.value === 'approved' ? { approvedAt: new Date().toISOString() } : {})
      };

      if (isEdit) {
        DB.reviews.update(existing.id, reviewData);
        UI.toast('Review updated successfully!', 'success');
      } else {
        DB.reviews.add(reviewData);
        UI.toast('Review added successfully!', 'success');
      }

      overlay.remove();
      this._notifyUpdate();
      this.render();
    };
  },

  exportCSV() {
    const list = DB.reviews.all();
    if (!list.length) {
      UI.toast('No reviews to export.', 'warning');
      return;
    }
    const headers = ['ID', 'Client Name', 'Role', 'Email', 'Rating', 'Project', 'Status', 'Review Text', 'Studio Response', 'Date'];
    const rows = list.map(r => [
      r.id, r.clientName, r.clientRole, r.clientEmail, r.rating, r.projectName, r.status,
      `"${(r.reviewText || '').replace(/"/g, '""')}"`,
      `"${(r.studioResponse || '').replace(/"/g, '""')}"`,
      r.createdAt
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vkreate-reviews-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    UI.toast('Reviews exported to CSV!', 'success');
  },

  _notifyUpdate() {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
    if (typeof App !== 'undefined' && App.updateSidebar) {
      App.updateSidebar();
    }
    if (typeof GithubSync !== 'undefined' && GithubSync.push) {
      GithubSync.push();
    }
  }
};
