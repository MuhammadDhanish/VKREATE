/* ============================================================
   VKREATE Admin — Inquiries Module
   ============================================================ */

const Inquiries = {

  _filter: { status: 'all', search: '' },

  render() {
    const stats = DB.inquiries.stats();
    const total = DB.inquiries.all().length;

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Inquiries</h1>
          <p class="page-subtitle">${total} total · ${stats.new} new · ${stats.won} won</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline btn-sm" onclick="Inquiries.exportCSV()">
            ${UI.icon('download')} Export
          </button>
        </div>
      </div>

      <!-- Pipeline Overview -->
      <div class="stats-grid mb-24">
        ${[
          { key: 'new',       label: 'New',       emoji: '📬', color: '#3B82F6', bg: '#EFF6FF' },
          { key: 'contacted', label: 'Contacted',  emoji: '📞', color: '#8B5CF6', bg: '#F5F3FF' },
          { key: 'quoted',    label: 'Quoted',     emoji: '📋', color: '#F59E0B', bg: '#FFFBEB' },
          { key: 'won',       label: 'Won',        emoji: '🏆', color: '#22C55E', bg: '#F0FDF4' },
        ].map(s => `
          <div class="stat-card" onclick="Inquiries._filter.status='${s.key}';Inquiries._refresh()" style="cursor:pointer;border-color:${this._filter.status===s.key?s.color:'var(--border)'}">
            <div class="stat-card__top">
              <span class="stat-card__label">${s.label}</span>
              <div class="stat-card__icon" style="background:${s.bg};font-size:1.2rem">${s.emoji}</div>
            </div>
            <div class="stat-card__value" style="color:${s.color}">${stats[s.key]||0}</div>
          </div>`).join('')}
      </div>

      <!-- Filter bar -->
      <div class="filters-bar mb-16">
        <div class="search-bar">
          ${UI.icon('search','search-bar__icon')}
          <input type="search" placeholder="Search by name, email, industry..." value="${this._filter.search}"
            oninput="Inquiries._filter.search=this.value;Inquiries._refresh()">
        </div>
        <select class="form-control" style="width:auto;padding:9px 14px"
          onchange="Inquiries._filter.status=this.value;Inquiries._refresh()">
          <option value="all">All Status</option>
          ${['new','contacted','quoted','won','lost'].map(s=>`<option value="${s}" ${this._filter.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select>
        <span class="text-xs text-muted ml-auto" id="inq-count"></span>
      </div>

      <!-- Table -->
      <div class="card" id="inquiries-table">
        ${this._tableHTML(this._filtered())}
      </div>
    `;
  },

  _filtered() {
    let list = DB.inquiries.all();
    if (this._filter.status !== 'all') list = list.filter(i => i.status === this._filter.status);
    if (this._filter.search) {
      const q = this._filter.search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.industry||'').toLowerCase().includes(q)
      );
    }
    return list;
  },

  _refresh() {
    const list = this._filtered();
    const cnt = document.getElementById('inq-count');
    if (cnt) cnt.textContent = `${list.length} result${list.length!==1?'s':''}`;
    const el = document.getElementById('inquiries-table');
    if (el) el.innerHTML = this._tableHTML(list);
  },

  _tableHTML(list) {
    if (!list.length) return `
      <div class="empty-state">
        <div class="empty-state__icon">📬</div>
        <div class="empty-state__title">No inquiries found</div>
        <p class="empty-state__text">Inquiries from the contact form will appear here.</p>
      </div>`;

    const statusColors = {
      new:'info', contacted:'badge-gold', quoted:'warning', won:'success', lost:'danger'
    };

    return `
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Name</th><th>Industry</th><th>Budget</th><th>Status</th>
            <th>Date</th><th style="width:120px">Actions</th>
          </tr></thead>
          <tbody>
            ${list.map(i => `
              <tr>
                <td>
                  <div class="td-name">${i.name}</div>
                  <div class="text-xs text-muted">${i.email} · ${i.phone||''}</div>
                </td>
                <td class="text-sm text-muted">${i.industry||'—'}</td>
                <td class="text-sm">${i.projectBudget||'—'}</td>
                <td>
                  <select class="form-control" style="padding:4px 10px;font-size:.75rem;width:auto"
                    onchange="Inquiries.updateStatus('${i.id}',this.value)">
                    ${['new','contacted','quoted','won','lost'].map(s=>`<option value="${s}" ${i.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
                  </select>
                </td>
                <td class="text-xs text-muted">${UI.dateShort(i.createdAt)}</td>
                <td>
                  <div class="td-actions">
                    <button class="btn btn-ghost btn-sm btn-icon" onclick="Inquiries.openDetail('${i.id}')" title="View">👁️</button>
                    <button class="btn btn-ghost btn-sm btn-icon" onclick="Inquiries.delete('${i.id}')" title="Delete" style="color:var(--danger)">🗑️</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  },

  updateStatus(id, status) {
    DB.inquiries.update(id, {
      status,
      respondedAt: ['contacted','quoted','won'].includes(status) ? new Date().toISOString() : null
    });
    UI.toast(`Status updated to "${status}"`, 'success');
    App.updateSidebar();
  },

  delete(id) {
    const i = DB.inquiries.get(id);
    UI.confirm('Delete Inquiry', `Delete inquiry from <strong>${i.name}</strong>?`, '🗑️', () => {
      DB.inquiries.delete(id);
      UI.toast('Inquiry deleted.', 'success');
      this._refresh();
    }, true);
  },

  openDetail(id) {
    const i = DB.inquiries.get(id);
    UI.modal(`Inquiry — ${i.name}`, `
      <div style="display:grid;gap:16px">

        <!-- Contact info -->
        <div style="background:var(--bg);border-radius:var(--r-md);padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <div class="text-xs text-muted mb-4">Name</div>
            <div class="fw-600">${i.name}</div>
          </div>
          <div>
            <div class="text-xs text-muted mb-4">Industry</div>
            <div>${i.industry||'—'}</div>
          </div>
          <div>
            <div class="text-xs text-muted mb-4">Email</div>
            <a href="mailto:${i.email}" style="color:var(--info)">${i.email}</a>
          </div>
          <div>
            <div class="text-xs text-muted mb-4">Phone</div>
            <div>${i.phone||'—'}</div>
          </div>
          <div>
            <div class="text-xs text-muted mb-4">Budget</div>
            <div class="fw-600">${i.projectBudget||'—'}</div>
          </div>
          <div>
            <div class="text-xs text-muted mb-4">Timeline</div>
            <div>${i.timeline||'—'}</div>
          </div>
        </div>

        <!-- Project Brief -->
        <div>
          <div class="text-xs text-muted mb-6">Project Brief</div>
          <p class="text-sm" style="color:var(--text-2);line-height:1.7;background:var(--bg);padding:14px;border-radius:var(--r-md)">${i.brief||'No brief provided.'}</p>
        </div>

        <!-- Status -->
        <div class="form-group">
          <label class="form-label">Pipeline Status</label>
          <select class="form-control" id="detail-status">
            ${['new','contacted','quoted','won','lost'].map(s=>`<option value="${s}" ${i.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
          </select>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label class="form-label">Internal Notes</label>
          <textarea class="form-control" id="detail-notes" rows="4" placeholder="Follow-up notes, meeting summaries, next steps...">${i.notes||''}</textarea>
          <div class="form-hint">Only visible to admins.</div>
        </div>

        <!-- Received -->
        <div class="text-xs text-muted">Received ${UI.dateShort(i.createdAt)} · ${UI.timeAgo(i.createdAt)}</div>
      </div>
    `, `
      <a href="mailto:${i.email}?subject=Re: Your Inquiry to VKREATE" class="btn btn-outline" style="text-decoration:none">
        ✉️ Send Email
      </a>
      <span style="flex:1"></span>
      <button class="btn btn-outline" onclick="UI.closeModal()">Close</button>
      <button class="btn btn-primary" onclick="Inquiries._saveDetail('${id}')">
        ${UI.icon('check')} Save
      </button>
    `);
  },

  _saveDetail(id) {
    const status = document.getElementById('detail-status').value;
    const notes  = document.getElementById('detail-notes').value.trim();
    DB.inquiries.update(id, { status, notes });
    UI.toast('Inquiry updated!', 'success');
    UI.closeModal();
    this._refresh();
    App.updateSidebar();
    if (window.GithubSync) GithubSync.push();
  },

  exportCSV() {
    const rows = [['Name','Email','Phone','Industry','Budget','Timeline','Status','Brief','Notes','Received']];
    DB.inquiries.all().forEach(i => rows.push([
      `"${i.name}"`, i.email, i.phone||'', i.industry||'', i.projectBudget||'', i.timeline||'',
      i.status, `"${(i.brief||'').replace(/"/g,'""')}"`, `"${(i.notes||'').replace(/"/g,'""')}"`,
      UI.dateShort(i.createdAt)
    ]));
    UI.downloadCSV(rows, 'vkreate-inquiries.csv');
  },
};
