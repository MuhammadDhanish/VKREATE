/* ============================================================
   VKREATE Admin — Reviews Module
   ============================================================ */

const Reviews = {

  _filter: { status: 'all', search: '' },

  render() {
    const stats = DB.reviews.stats();
    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Reviews</h1>
          <p class="page-subtitle">${stats.total} total · ${stats.pending} pending · ${stats.approved} approved</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline btn-sm" onclick="Reviews.exportCSV()">
            ${UI.icon('download')} Export CSV
          </button>
          <button class="btn btn-primary" onclick="Reviews.openAddForm()">
            ${UI.icon('plus')} Add Review
          </button>
        </div>
      </div>

      <!-- Status Tabs -->
      <div style="display:flex;gap:4px;background:var(--card);border:1px solid var(--border);border-radius:var(--r-lg);padding:6px;margin-bottom:20px;width:fit-content">
        ${['all','pending','approved','rejected'].map(s => `
          <button class="btn ${this._filter.status===s?'btn-primary':'btn-ghost'} btn-sm"
            style="${this._filter.status===s?'':'color:var(--text-3)'}"
            onclick="Reviews._filter.status='${s}';Reviews._refresh()">
            ${s.charAt(0).toUpperCase()+s.slice(1)}
            ${s==='pending' && stats.pending ? `<span class="nav-item__badge" style="position:static;display:inline-block;margin-left:6px">${stats.pending}</span>` : ''}
          </button>`).join('')}
      </div>

      <!-- Filters bar -->
      <div class="filters-bar mb-16">
        <div class="search-bar">
          ${UI.icon('search','search-bar__icon')}
          <input type="search" placeholder="Search by client name..." value="${this._filter.search}"
            oninput="Reviews._filter.search=this.value;Reviews._refresh()">
        </div>
        <span class="text-xs text-muted ml-auto" id="review-count"></span>
      </div>

      <!-- Pending alert -->
      ${stats.pending > 0 ? `
        <div style="background:var(--warning-bg);border:1px solid var(--warning-border);border-radius:var(--r-md);padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span style="font-size:1.25rem">⚠️</span>
          <div>
            <div class="fw-600 text-sm">${stats.pending} review${stats.pending>1?'s':''} awaiting approval</div>
            <div class="text-xs text-muted">Review and approve client testimonials before they appear on the website.</div>
          </div>
          <button class="btn btn-warning btn-sm ml-auto" style="background:var(--warning);color:#fff"
            onclick="Reviews._filter.status='pending';Reviews._refresh()">Review Now</button>
        </div>` : ''}

      <!-- Cards grid -->
      <div id="reviews-grid"></div>
    `;

    this._refresh();
  },

  _filtered() {
    let list = DB.reviews.all();
    if (this._filter.status !== 'all') list = list.filter(r => r.status === this._filter.status);
    if (this._filter.search) {
      const q = this._filter.search.toLowerCase();
      list = list.filter(r => r.clientName.toLowerCase().includes(q) || r.projectName.toLowerCase().includes(q));
    }
    return list;
  },

  _refresh() {
    const list = this._filtered();
    const cnt = document.getElementById('review-count');
    if (cnt) cnt.textContent = `${list.length} result${list !== 1 ? 's' : ''}`;
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⭐</div>
          <div class="empty-state__title">No reviews found</div>
          <p class="empty-state__text">Try changing filters or add a review manually.</p>
        </div>`;
      return;
    }
    grid.innerHTML = `<div style="display:grid;gap:14px">${list.map(r => this._cardHTML(r)).join('')}</div>`;
  },

  _cardHTML(r) {
    const stars = Array.from({length:5}, (_,i) => `<span class="star ${i < r.rating ? '' : 'empty'}">★</span>`).join('');
    const initials = r.clientName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

    return `
      <div class="review-card" id="review-${r.id}">
        <div class="review-card__header">
          <div class="review-card__author">
            <div class="review-card__avatar">${initials}</div>
            <div>
              <div class="review-card__name">${r.clientName}</div>
              <div class="review-card__meta">${r.clientRole} · ${r.projectName}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="badge" style="background:rgba(201,169,110,0.15);color:var(--text-1);border:1px solid rgba(201,169,110,0.3);font-weight:600">Rank #${r.rank || 99}</span>
            <div class="stars">${stars}</div>
            ${UI.badge(r.status)}
            <span class="text-xs text-muted">${UI.timeAgo(r.createdAt)}</span>
          </div>
        </div>

        <p class="review-card__text">"${r.reviewText}"</p>

        ${r.studioResponse ? `
          <div style="background:var(--gold-faint);border-left:3px solid var(--gold);border-radius:0 var(--r-sm) var(--r-sm) 0;padding:12px 16px">
            <div class="text-xs text-muted mb-4">Studio Response</div>
            <p class="text-sm" style="color:var(--text-2)">${r.studioResponse}</p>
          </div>` : ''}

        <div class="review-card__actions">
          ${r.status === 'pending' ? `
            <button class="btn btn-success btn-sm" onclick="Reviews.approve('${r.id}')">✓ Approve</button>
            <button class="btn btn-outline btn-sm" onclick="Reviews.reject('${r.id}')" style="color:var(--danger);border-color:var(--danger-border)">✕ Reject</button>` : ''}
          ${r.status === 'approved' ? `
            <button class="btn btn-outline btn-sm" onclick="Reviews.reject('${r.id}')" style="color:var(--danger)">Revoke</button>` : ''}
          ${r.status === 'rejected' ? `
            <button class="btn btn-outline btn-sm" onclick="Reviews.approve('${r.id}')">Re-approve</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="Reviews.openRespond('${r.id}')">
            ${r.studioResponse ? '✏️ Edit Response' : '💬 Respond'}
          </button>
          <button class="btn btn-ghost btn-sm" onclick="Reviews.openEdit('${r.id}')">✏️ Edit</button>
          <button class="btn btn-ghost btn-sm" onclick="Reviews.delete('${r.id}')" style="color:var(--danger)">🗑️</button>
        </div>
      </div>`;
  },

  approve(id) {
    DB.reviews.approve(id);
    UI.toast('Review approved and published!', 'success');
    this._refresh();
    App.updateSidebar();
    if (window.GithubSync) GithubSync.push();
  },

  reject(id) {
    DB.reviews.reject(id);
    UI.toast('Review rejected.', 'info');
    this._refresh();
    App.updateSidebar();
    if (window.GithubSync) GithubSync.push();
  },

  delete(id) {
    const r = DB.reviews.get(id);
    UI.confirm('Delete Review', `Delete review by <strong>${r.clientName}</strong>? This cannot be undone.`, '🗑️', () => {
      DB.reviews.delete(id);
      UI.toast('Review deleted.', 'success');
      this._refresh();
      App.updateSidebar();
      if (window.GithubSync) GithubSync.push();
    }, true);
  },

  openRespond(id) {
    const r = DB.reviews.get(id);
    UI.modal('Studio Response', `
      <div style="background:var(--bg);border-radius:var(--r-md);padding:14px;margin-bottom:16px">
        <div class="text-xs text-muted mb-4">Review by ${r.clientName}</div>
        <p class="text-sm" style="font-style:italic;color:var(--text-2)">"${r.reviewText}"</p>
      </div>
      <div class="form-group">
        <label class="form-label">Your Response</label>
        <textarea class="form-control" id="resp-text" rows="5" placeholder="Write a professional, warm studio response...">${r.studioResponse||''}</textarea>
        <div class="form-hint">This response will appear publicly below the review.</div>
      </div>
    `, `
      <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="Reviews._saveResponse('${id}')">
        ${UI.icon('check')} Save Response
      </button>
    `);
  },

  _saveResponse(id) {
    const text = document.getElementById('resp-text').value.trim();
    DB.reviews.update(id, { studioResponse: text });
    UI.toast('Response saved!', 'success');
    UI.closeModal();
    this._refresh();
    if (window.GithubSync) GithubSync.push();
  },

  openEdit(id) {
    const r = DB.reviews.get(id);
    UI.modal('Edit Review', `
      <div class="form-grid" style="gap:16px">
        <div style="background:rgba(201,169,110,0.1);padding:12px 16px;border-radius:var(--r-md);border:1px solid rgba(201,169,110,0.3);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="fw-600 text-sm">🏆 Website Display Position / Rank</div>
            <div class="text-xs text-muted">Set to 1 to show this review in the 1st position on your website</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="text-xs text-muted">Rank #</span>
            <input type="number" min="1" max="999" class="form-control" id="edit-rank" value="${r.rank || 99}" style="width:70px;text-align:center;font-weight:700">
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">Client Name</label>
            <input class="form-control" id="edit-name" value="${r.clientName}">
          </div>
          <div class="form-group">
            <label class="form-label">Client Role</label>
            <input class="form-control" id="edit-role" value="${r.clientRole}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Review Text</label>
          <textarea class="form-control" id="edit-text" rows="5">${r.reviewText}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Short Testimonial (50–150 chars)</label>
          <input class="form-control" id="edit-short" value="${r.shortTestimonial||''}" maxlength="150">
        </div>
        <div class="form-group">
          <label class="form-label">Rating</label>
          <select class="form-control" id="edit-rating">
            ${[5,4,3,2,1].map(n=>`<option value="${n}" ${r.rating==n?'selected':''}>${n} Stars</option>`).join('')}
          </select>
        </div>
      </div>
    `, `
      <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="Reviews._saveEdit('${id}')">
        ${UI.icon('check')} Save Changes
      </button>
    `);
  },

  _saveEdit(id) {
    DB.reviews.update(id, {
      clientName:       document.getElementById('edit-name').value.trim(),
      clientRole:       document.getElementById('edit-role').value.trim(),
      reviewText:       document.getElementById('edit-text').value.trim(),
      shortTestimonial: document.getElementById('edit-short').value.trim(),
      rating:           parseInt(document.getElementById('edit-rating').value),
      rank:             parseInt(document.getElementById('edit-rank')?.value || '99'),
    });
    UI.toast('Review updated!', 'success');
    UI.closeModal();
    this._refresh();
  },

  openAddForm() {
    const projects = DB.projects.all();
    UI.modal('Add Review', `
      <div class="form-grid" style="gap:16px">
        <div style="background:rgba(201,169,110,0.1);padding:12px 16px;border-radius:var(--r-md);border:1px solid rgba(201,169,110,0.3);display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="fw-600 text-sm">🏆 Website Display Position / Rank</div>
            <div class="text-xs text-muted">Set to 1 to show this review in the 1st position on your website</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="text-xs text-muted">Rank #</span>
            <input type="number" min="1" max="999" class="form-control" id="add-rank" value="99" style="width:70px;text-align:center;font-weight:700">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Project <span>*</span></label>
          <select class="form-control" id="add-project" required>
            <option value="">Select project...</option>
            ${projects.map(p=>`<option value="${p.id}" data-name="${p.name}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">Client Name <span>*</span></label>
            <input class="form-control" id="add-name" required placeholder="Full name">
          </div>
          <div class="form-group">
            <label class="form-label">Client Role</label>
            <input class="form-control" id="add-role" placeholder="Title, Company">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Review Text <span>*</span></label>
          <textarea class="form-control" id="add-text" rows="4" required placeholder="Full review text..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Rating</label>
          <select class="form-control" id="add-rating">
            ${[5,4,3,2,1].map(n=>`<option value="${n}" ${n===5?'selected':''}>${n} Stars</option>`).join('')}
          </select>
        </div>
      </div>
    `, `
      <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="Reviews._addReview()">
        ${UI.icon('check')} Add Review
      </button>
    `);
  },

  _addReview() {
    const projSel = document.getElementById('add-project');
    if (!projSel.value) return UI.toast('Please select a project.', 'error');
    const name = document.getElementById('add-name').value.trim();
    if (!name) return UI.toast('Client name is required.', 'error');
    const text = document.getElementById('add-text').value.trim();
    if (!text) return UI.toast('Review text is required.', 'error');

    DB.reviews.add({
      projectId:   projSel.value,
      projectName: projSel.selectedOptions[0].dataset.name,
      clientName:  name,
      clientRole:  document.getElementById('add-role').value.trim(),
      reviewText:  text,
      shortTestimonial: text.slice(0, 140),
      rating:      parseInt(document.getElementById('add-rating').value),
      rank:        parseInt(document.getElementById('add-rank')?.value || '99'),
      status: 'pending',
      studioResponse: '',
      tags: [],
      visibility: 'public',
    });

    UI.toast('Review added to pending queue!', 'success');
    UI.closeModal();
    this.render();
    App.updateSidebar();
  },

  exportCSV() {
    const rows = [['Client','Role','Project','Rating','Status','Review','Response','Date']];
    DB.reviews.all().forEach(r => rows.push([
      `"${r.clientName}"`, `"${r.clientRole}"`, `"${r.projectName}"`,
      r.rating, r.status, `"${r.reviewText.replace(/"/g,'""')}"`,
      `"${(r.studioResponse||'').replace(/"/g,'""')}"`, UI.dateShort(r.createdAt)
    ]));
    UI.downloadCSV(rows, 'vkreate-reviews.csv');
  },
};
