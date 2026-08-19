/* ============================================================
   VKREATE Admin — Reviews Management Module & Studio Response
   ============================================================ */

const Reviews = {
  _filter: 'all',

  render() {
    try {
      const allReviews = DB.reviews.all() || [];
      const stats = DB.reviews.stats();

      let filtered = allReviews;
      if (this._filter === 'pending') {
        filtered = allReviews.filter(r => r.status === 'pending');
      } else if (this._filter === 'approved') {
        filtered = allReviews.filter(r => r.status === 'approved');
      } else if (this._filter === 'rejected') {
        filtered = allReviews.filter(r => r.status === 'rejected');
      }

      const content = document.getElementById('main-content');
      if (!content) return;

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Client Reviews &amp; Testimonials</h1>
            <p class="page-subtitle">Manage, approve, reject, and respond to client reviews</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-outline btn-sm" onclick="Reviews.deployLive()" title="Sync approved reviews & studio responses to production live site">
              🚀 Deploy to Live Site
            </button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="tabs-nav mb-24">
          <button class="tab-btn ${this._filter === 'all' ? 'active' : ''}" onclick="Reviews.setFilter('all')">
            All Reviews (${stats.total || 0})
          </button>
          <button class="tab-btn ${this._filter === 'pending' ? 'active' : ''}" onclick="Reviews.setFilter('pending')">
            Pending Approval ${stats.pending ? `<span class="badge badge-warning ml-6">${stats.pending}</span>` : ''}
          </button>
          <button class="tab-btn ${this._filter === 'approved' ? 'active' : ''}" onclick="Reviews.setFilter('approved')">
            Approved (${stats.approved || 0})
          </button>
          <button class="tab-btn ${this._filter === 'rejected' ? 'active' : ''}" onclick="Reviews.setFilter('rejected')">
            Rejected (${stats.rejected || 0})
          </button>
        </div>

        <!-- Reviews Grid -->
        ${filtered.length ? `
          <div style="display:grid;gap:16px;">
            ${filtered.map(r => this._reviewCard(r)).join('')}
          </div>` : `
          <div class="card" style="padding:48px;text-align:center">
            <div style="font-size:2.5rem;margin-bottom:12px">⭐</div>
            <h3 class="fw-600 text-lg">No Reviews Found</h3>
            <p class="text-muted text-sm mt-4">No reviews match the selected filter category.</p>
          </div>`}
      `;
    } catch (err) {
      console.error('Reviews render error:', err);
    }
  },

  setFilter(f) {
    this._filter = f;
    this.render();
  },

  _reviewCard(r) {
    const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
    const isPending = r.status === 'pending';
    const isApproved = r.status === 'approved';
    const isRejected = r.status === 'rejected';

    const clientName = UI.escapeHTML(r.clientName || r.author || 'Anonymous Client');
    const clientRole = UI.escapeHTML(r.clientRole || r.role || 'Client');
    const clientEmail = UI.escapeHTML(r.clientEmail || 'No email provided');
    const reviewText = UI.escapeHTML(r.reviewText || r.text || '');
    const dateStr = UI.dateShort(r.createdAt || r.approvedAt || r.date);
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
            ${!isApproved ? `<button class="btn btn-sm" onclick="Reviews.approve('${r.id}')" style="background:#22C55E;color:#fff;border:none;">✓ Approve</button>` : ''}
            ${!isRejected ? `<button class="btn btn-outline btn-sm" onclick="Reviews.reject('${r.id}')" style="color:#EF4444;border-color:#FCA5A5;">✕ Reject</button>` : ''}
            <button class="btn btn-danger btn-sm" onclick="Reviews.delete('${r.id}')">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  approve(id) {
    const updated = DB.reviews.approve(id);
    if (updated) {
      UI.toast('Review approved!', 'success');
      if (typeof App !== 'undefined') App.updateSidebar();
      this.render();
    }
  },

  reject(id) {
    const updated = DB.reviews.reject(id);
    if (updated) {
      UI.toast('Review set to rejected', 'warning');
      if (typeof App !== 'undefined') App.updateSidebar();
      this.render();
    }
  },

  delete(id) {
    UI.confirm('Delete Review', 'Are you sure you want to delete this review?', '🗑️', () => {
      DB.reviews.delete(id);
      UI.toast('Review deleted', 'info');
      if (typeof App !== 'undefined') App.updateSidebar();
      this.render();
    }, true);
  },

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
      <button class="btn btn-primary" onclick="Reviews.saveResponse('${r.id}')">Save &amp; Update Live Review</button>
    `;

    UI.modal('💬 Studio Response', body, footer, 'max-w-500');
  },

  saveResponse(id) {
    const textEl = document.getElementById('modal-studio-response');
    if (!textEl) return;

    const text = textEl.value.trim();
    DB.reviews.update(id, { studioResponse: text });
    UI.closeModal();
    UI.toast('Studio response saved successfully!', 'success');
    this.render();
  },

  async deployLive() {
    if (typeof GithubSync !== 'undefined' && GithubSync.push) {
      const ok = await GithubSync.push();
      if (ok) {
        UI.toast('🚀 Reviews & Responses deployed to Live Site!', 'success');
      }
    } else {
      UI.toast('Local storage reviews synced across tabs!', 'info');
    }
  }
};
