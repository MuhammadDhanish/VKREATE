/* ============================================================
   VKREATE Admin — Projects Module  (Rebuilt v2 — clean-room)
   ============================================================
   UI/CSS unchanged. Improvements:
   - _safeAll() safe data accessor with try/catch
   - _rowHTML() separated from _tableHTML()
   - _compressImage() returns Promise (no callbacks)
   - _handleFiles() uses Promise.all for parallel processing
   - _fieldVal() helper removes repetitive querySelector chains
   - _saveProject() dedicated save+retry method
   - setRank / toggleStatus / delete all have proper error handling
   - toggleStatus re-renders on failure to reset UI toggle state
   - _submitting guard resets in finally block (no leaks)
   ============================================================ */

const Projects = {

  /* ── State ─────────────────────────────────────────────── */
  _submitting:    false,
  _isCompressing: false,
  _editId:        null,
  _images:        [],   // [{ ref: 'idb:key' | 'data:…' | 'path', preview: dataUrl }]
  _filter:        { search: '', industry: 'all', status: 'all' },

  /* ── Path helper ────────────────────────────────────────── */
  _fixAdminPath(src) {
    if (!src) return '';
    if (typeof src !== 'string') {
      if (typeof src === 'object' && src !== null) {
        src = src.ref || src.preview || src.url || src.src || '';
      } else {
        src = String(src || '');
      }
    }
    if (!src) return '';
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('idb:')) return src;
    return src.startsWith('../') ? src : '../' + src;
  },

  /* ── Safe data accessor ────────────────────────────────── */
  _safeAll() {
    try {
      return (typeof DB !== 'undefined' && DB.projects && typeof DB.projects.all === 'function')
        ? (DB.projects.all() || [])
        : [];
    } catch (e) { return []; }
  },

  /* ─────────────────────────────────────────────────────────
     RENDER — full page
  ───────────────────────────────────────────────────────── */
  render() {
    try {
      const allProjs       = this._safeAll();
      const publishedProjs = allProjs.filter(p => p && p.status === 'published');
      const draftProjs     = allProjs.filter(p => p && p.status === 'draft');
      const projects       = this._filtered();

      const mainEl = document.getElementById('main-content');
      if (!mainEl) return;

      mainEl.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Projects</h1>
            <p class="page-subtitle">${allProjs.length} total · ${publishedProjs.length} published · ${draftProjs.length} drafts</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-outline btn-sm" onclick="Projects.exportCSV()">
              ${UI.icon('download')} Export
            </button>
            <button class="btn btn-primary" onclick="Projects.openForm()">
              ${UI.icon('plus')} Add Project
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="card mb-24">
          <div class="card-body" style="padding:16px 20px">
            <div class="filters-bar">
              <div class="search-bar">
                ${UI.icon('search', 'search-bar__icon')}
                <input type="search" placeholder="Search projects..." value="${UI.escapeHTML(this._filter.search)}"
                  oninput="Projects._filter.search=this.value;Projects._refreshTable()">
              </div>
              <select class="form-control" style="width:auto;padding:9px 14px"
                onchange="Projects._filter.industry=this.value;Projects._refreshTable()">
                <option value="all">All Industries</option>
                ${this._industryFilterOptions()}
              </select>
              <select class="form-control" style="width:auto;padding:9px 14px"
                onchange="Projects._filter.status=this.value;Projects._refreshTable()">
                <option value="all">All Status</option>
                <option value="published" ${this._filter.status==='published'?'selected':''}>Published</option>
                <option value="draft"     ${this._filter.status==='draft'?'selected':''}>Draft</option>
              </select>
              <span class="text-xs text-muted ml-auto">${projects.length} result${projects.length!==1?'s':''}</span>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card">
          <div class="table-wrap" id="projects-table">
            ${this._tableHTML(projects)}
          </div>
        </div>
      `;
      this._resolveTableThumbnails();
    } catch (err) {
      console.error('Projects render error:', err);
    }
  },

  _industryFilterOptions() {
    const defaultPairs = [
      ['restaurant','Restaurants & Cafes'],
      ['beauty','Beauty & Wellness'],
      ['office','Corporate Office'],
      ['retail','Retail & Jewellery'],
      ['hospitality','Hotels & Hospitality'],
      ['residential','Residential & Villas'],
      ['healthcare','Healthcare & Clinics']
    ];
    const pairsMap = new Map(defaultPairs);
    this._safeAll().forEach(p => {
      if (p && p.industry && typeof p.industry === 'string' && !pairsMap.has(p.industry)) {
        pairsMap.set(p.industry, p.industryLabel || p.industry);
      }
    });
    return Array.from(pairsMap.entries()).map(([v, l]) =>
      `<option value="${v}" ${this._filter.industry===v?'selected':''}>${l}</option>`
    ).join('');
  },

  _filtered() {
    let list = this._safeAll();
    if (this._filter.search) {
      const q = String(this._filter.search).toLowerCase();
      list = list.filter(p => p && ((p.name||'').toLowerCase().includes(q) || (p.location||'').toLowerCase().includes(q)));
    }
    if (this._filter.industry !== 'all') list = list.filter(p => p && p.industry === this._filter.industry);
    if (this._filter.status   !== 'all') list = list.filter(p => p && (p.status || 'published') === this._filter.status);
    return list;
  },

  _refreshTable() {
    const el = document.getElementById('projects-table');
    if (el) {
      el.innerHTML = this._tableHTML(this._filtered());
      this._resolveTableThumbnails();
    }
  },

  _resolveTableThumbnails() {
    setTimeout(() => {
      document.querySelectorAll('.td-thumb[data-idb-key]').forEach(async img => {
        const key = img.dataset.idbKey;
        if (key && typeof ImageDB !== 'undefined') {
          try { const url = await ImageDB.get(key); if (url) img.src = url; } catch (e) {}
        }
      });
    }, 30);
  },

  _tableHTML(projects) {
    if (!Array.isArray(projects) || !projects.length) return `
      <div class="empty-state">
        <div class="empty-state__icon">🏗️</div>
        <div class="empty-state__title">No projects found</div>
        <p class="empty-state__text">Try adjusting your filters or add a new project.</p>
        <button class="btn btn-primary mt-16" onclick="Projects.openForm()">Add Project</button>
      </div>`;

    return `<table>
      <thead><tr>
        <th style="width:48px"></th>
        <th style="width:110px">Top Preference</th>
        <th class="sortable">Project Name</th>
        <th>Industry</th>
        <th>Status</th>
        <th>Location</th>
        <th>Views</th>
        <th>Leads</th>
        <th>Updated</th>
        <th style="width:130px">Actions</th>
      </tr></thead>
      <tbody>
        ${projects.map(p => this._rowHTML(p)).join('')}
      </tbody>
    </table>`;
  },

  _rowHTML(p) {
    if (!p || typeof p !== 'object') return '';
    let rawSrc = p.thumbnail || (Array.isArray(p.images) ? p.images[0] : (typeof p.images === 'string' ? p.images : '')) || '';
    if (rawSrc && typeof rawSrc === 'object') rawSrc = rawSrc.ref || rawSrc.preview || rawSrc.url || rawSrc.src || '';
    rawSrc = String(rawSrc || '');
    const isIdb    = rawSrc.startsWith('idb:');
    const thumbSrc = this._fixAdminPath(rawSrc);
    const pRank    = (typeof p.rank === 'number' && !isNaN(p.rank)) ? p.rank : (parseInt(p.rank) || 99);
    const pStatus  = (p.status || 'published').toLowerCase();
    const pId      = String(p.id || '');
    return `
    <tr>
      <td>
        ${thumbSrc
          ? `<img src="${isIdb ? '../assets/images/project_lilaa_1.jpg' : thumbSrc}" data-idb-key="${isIdb ? rawSrc.slice(4) : ''}" class="td-thumb" alt="" onerror="this.src='../assets/images/project_lilaa_1.jpg'">`
          : `<div class="td-thumb-placeholder">No img</div>`}
      </td>
      <td class="text-sm fw-600">
        <select class="form-control pref-select" style="padding:4px 8px;font-size:0.75rem;font-weight:700;border-radius:20px;width:auto;cursor:pointer;${
          pRank === 1 ? 'background:rgba(201,169,110,0.25);color:#856404;border:1px solid #C9A96E;' :
          pRank === 2 ? 'background:rgba(100,116,139,0.2);color:#1E293B;border:1px solid #64748B;' :
          pRank === 3 ? 'background:rgba(217,119,6,0.2);color:#78350F;border:1px solid #D97706;' :
          pRank <= 5  ? 'background:rgba(16,185,129,0.2);color:#064E3B;border:1px solid #10B981;' :
          pRank <= 10 ? 'background:rgba(59,130,246,0.2);color:#1E3A8A;border:1px solid #3B82F6;' :
                        'background:rgba(0,0,0,0.04);color:var(--text-2);border:1px solid var(--border);'
        }" onchange="Projects.setRank('${pId}', this.value)">
          ${Array.from({length: 10}, (_, i) => i + 1).map(n =>
            `<option value="${n}" ${pRank === n ? 'selected' : ''}>⭐ TOP #${n}</option>`
          ).join('')}
          <option value="99" ${(pRank > 10) ? 'selected' : ''}>Standard (#${pRank <= 99 ? pRank : '99'})</option>
        </select>
      </td>
      <td class="td-name">${UI.escapeHTML(p.name || 'Untitled')}</td>
      <td><span class="text-sm text-muted">${UI.escapeHTML(p.industryLabel||p.industry||'Commercial')}</span></td>
      <td>${UI.badge(pStatus)}</td>
      <td class="text-sm text-muted">${UI.escapeHTML(p.location||'—')}</td>
      <td class="text-sm">${(p.views||0).toLocaleString()}</td>
      <td class="text-sm">${p.leads||0}</td>
      <td class="text-xs text-muted">${UI.dateShort(p.updatedAt || p.createdAt)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="Projects.openForm('${pId}')" title="Edit">✏️</button>
          <label class="toggle" title="${pStatus==='published'?'Unpublish':'Publish'}">
            <input type="checkbox" ${pStatus==='published'?'checked':''}
              onchange="Projects.toggleStatus('${pId}',this.checked)">
            <span class="toggle-slider"></span>
          </label>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="Projects.delete('${pId}')" title="Delete" style="color:var(--danger)">🗑️</button>
        </div>
      </td>
    </tr>`;
  },

  /* ─────────────────────────────────────────────────────────
     ACTIONS
  ───────────────────────────────────────────────────────── */
  async setRank(id, rankVal) {
    if (!id) return;
    const r = Math.max(1, parseInt(rankVal) || 99);
    try {
      const updated = await DB.projects.update(id, { rank: r });
      if (updated) {
        UI.toast(`Project preference set to Top #${r}!`, 'success');
        this._refreshTable();
        if (window.App && App.updateSidebar) App.updateSidebar();
        DB.afterMutation();
      } else {
        UI.toast('Could not update rank. Please try again.', 'error');
      }
    } catch (err) {
      console.error('setRank error:', err);
      UI.toast('Rank update failed: ' + err.message, 'error');
    }
  },

  _updatePrefButtons(rankVal) {
    const val = parseInt(rankVal);
    document.querySelectorAll('#proj-form [data-rank-btn]').forEach(btn => {
      const btnRank = parseInt(btn.dataset.rankBtn);
      btn.classList.toggle('btn-primary', btnRank === val);
      btn.classList.toggle('btn-outline',  btnRank !== val);
    });
  },

  async toggleStatus(id, published) {
    if (!id) return;
    const newStatus = published ? 'published' : 'draft';
    try {
      const updated = await DB.projects.update(id, { status: newStatus });
      if (updated) {
        UI.toast(published ? 'Project published!' : 'Project moved to drafts.', published ? 'success' : 'info');
        this.render();
        DB.afterMutation();
      } else {
        UI.toast('Status update failed. Please try again.', 'error');
        this._refreshTable(); // Reset toggle UI
      }
    } catch (err) {
      console.error('toggleStatus error:', err);
      UI.toast('Status update failed: ' + err.message, 'error');
      this._refreshTable();
    }
  },

  async delete(id) {
    if (!id) return;
    const p = DB.projects.get(id);
    if (!p) return UI.toast('Project not found.', 'error');
    UI.confirm('Delete Project', `Delete "<strong>${UI.escapeHTML(p.name || 'Untitled')}</strong>"? This cannot be undone.`, '🗑️', async () => {
      try {
        const ok = await DB.projects.delete(id);
        if (ok) {
          UI.toast('Project deleted.', 'success');
          UI.closeModal();
          this.render();
          if (window.App && App.updateSidebar) App.updateSidebar();
          DB.afterMutation();
        } else {
          UI.toast('Delete failed. Please try again.', 'error');
        }
      } catch (err) {
        console.error('delete error:', err);
        UI.toast('Delete failed: ' + err.message, 'error');
      }
    }, true);
  },

  exportCSV() {
    const rows = [['Name','Industry','Status','Location','Area','Duration','Budget','Views','Leads','Created']];
    this._safeAll().forEach(p => rows.push([
      `"${(p.name||'').replace(/"/g,'""')}"`,
      `"${(p.industryLabel||p.industry||'').replace(/"/g,'""')}"`,
      p.status || '',
      `"${(p.location||'').replace(/"/g,'""')}"`,
      p.area || '',
      p.duration || '',
      p.budgetRange || '',
      p.views || 0,
      p.leads || 0,
      UI.dateShort(p.createdAt),
    ]));
    UI.downloadCSV(rows, 'vkreate-projects.csv');
  },

  /* ─────────────────────────────────────────────────────────
     FORM — open modal
  ───────────────────────────────────────────────────────── */
  openForm(id) {
    this._editId        = id || null;
    this._submitting    = false;
    this._isCompressing = false;
    const p = id ? DB.projects.get(id) : null;
    if (id && !p) return UI.toast('Project not found.', 'error');

    // Load existing image references synchronously for fast modal render
    this._images = [];
    if (p && p.images && Array.isArray(p.images)) {
      this._images = p.images.map(ref => {
        const rStr = (typeof ref === 'object' && ref !== null) ? (ref.ref || ref.preview || '') : String(ref || '');
        const pStr = (typeof ref === 'object' && ref !== null) ? (ref.preview || ref.ref || '') : String(ref || '');
        return { ref: rStr, preview: pStr };
      }).filter(r => r.ref);
    }

    const stdIndustries = ['restaurant','beauty','office','retail','hospitality','residential','healthcare'];
    const isOther = p?.industry && (!stdIndustries.includes(p.industry) || p.industry.startsWith('other-'));

    UI.modal(`${id ? 'Edit' : 'Add'} Project`, `
      <form id="proj-form" class="form-grid" style="gap:20px" onsubmit="event.preventDefault(); Projects.submitDirect(this);">
        <div style="background:rgba(201,169,110,0.1);padding:14px 18px;border-radius:var(--r-md);border:1px solid rgba(201,169,110,0.3);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <div class="fw-600 text-sm" style="color:var(--text-1)">⭐ Top Preference / Display Order</div>
            <div class="text-xs text-muted">Choose Top #1, #2, #3, #4, #5... to position this project on your live portfolio</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${[1, 2, 3, 4, 5, 6].map(n => `
              <button type="button" class="btn ${(p?.rank || 99) === n ? 'btn-primary' : 'btn-outline'} btn-xs"
                onclick="document.querySelector('#proj-form [name=rank]').value=${n}; Projects._updatePrefButtons(${n}); UI.toast('Set to Top #${n}!','info');"
                data-rank-btn="${n}" style="padding:4px 8px;font-size:0.75rem;font-weight:700">
                ⭐ Top #${n}
              </button>
            `).join('')}
            <span class="text-xs text-muted ml-4">Rank #</span>
            <input type="number" min="1" max="999" class="form-control" name="rank" value="${p?.rank || 99}" style="width:60px;text-align:center;font-weight:700" oninput="Projects._updatePrefButtons(this.value)">
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">Project Name <span>*</span></label>
            <input class="form-control" name="name" placeholder="e.g. Modern Commercial Interior" required value="${UI.escapeHTML(p?.name||'')}">
          </div>
          <div class="form-group">
            <label class="form-label">Industry <span>*</span></label>
            <select class="form-control" name="industry" required onchange="Projects._toggleOtherIndustry(this)">
              <option value="">Select industry...</option>
              <option value="restaurant"  ${p?.industry==='restaurant'?'selected':''}>Restaurants &amp; Cafes</option>
              <option value="beauty"      ${p?.industry==='beauty'?'selected':''}>Beauty &amp; Wellness</option>
              <option value="office"      ${p?.industry==='office'?'selected':''}>Corporate Office</option>
              <option value="retail"      ${p?.industry==='retail'?'selected':''}>Retail &amp; Jewellery</option>
              <option value="hospitality" ${p?.industry==='hospitality'?'selected':''}>Hotels &amp; Hospitality</option>
              <option value="residential" ${p?.industry==='residential'?'selected':''}>Residential &amp; Villas</option>
              <option value="healthcare"  ${p?.industry==='healthcare'?'selected':''}>Healthcare &amp; Clinics</option>
              <option value="other"       ${isOther?'selected':''}>Other (Specify below)...</option>
            </select>
            <div id="other-industry-wrap" style="margin-top:10px; display:${isOther?'block':'none'}">
              <input class="form-control" name="custom_industry" placeholder="Type custom industry (e.g. Educational, Exhibition, Nightclub)" value="${UI.escapeHTML(isOther ? (p?.industryLabel || '') : '')}">
            </div>
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">Location</label>
            <input class="form-control" name="location" placeholder="City, State" value="${UI.escapeHTML(p?.location||'')}">
          </div>
          <div class="form-group">
            <label class="form-label">Area</label>
            <input class="form-control" name="area" placeholder="e.g. 2,500 sq ft" value="${UI.escapeHTML(p?.area||'')}">
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">Duration</label>
            <input class="form-control" name="duration" placeholder="e.g. 4 months" value="${UI.escapeHTML(p?.duration||'')}">
          </div>
          <div class="form-group">
            <label class="form-label">Budget Range</label>
            <input class="form-control" name="budgetRange" placeholder="e.g. ₹25L – ₹35L" value="${UI.escapeHTML(p?.budgetRange||'')}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Challenge</label>
          <textarea class="form-control" name="challenge" placeholder="Describe the project challenge..." rows="3">${UI.escapeHTML(p?.challenge||'')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Solution</label>
          <textarea class="form-control" name="solution" placeholder="How VKREATE solved it..." rows="3">${UI.escapeHTML(p?.solution||'')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Result</label>
          <textarea class="form-control" name="result" placeholder="Measurable outcomes..." rows="2">${UI.escapeHTML(p?.result||'')}</textarea>
        </div>

        <!-- Testimonial -->
        <div style="background:var(--bg);border-radius:var(--r-md);padding:16px">
          <div class="fw-600 text-sm mb-16" style="color:var(--text-2)">Client Testimonial</div>
          <div class="form-grid" style="gap:14px">
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label">Client Name</label>
                <input class="form-control" name="testimonial_author" value="${UI.escapeHTML(p?.testimonial?.author||'')}" placeholder="Full name">
              </div>
              <div class="form-group">
                <label class="form-label">Client Role</label>
                <input class="form-control" name="testimonial_role" value="${UI.escapeHTML(p?.testimonial?.role||'')}" placeholder="Title, Company">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Testimonial Text</label>
              <textarea class="form-control" name="testimonial_text" rows="3" placeholder="Client's quote...">${UI.escapeHTML(p?.testimonial?.text||'')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Rating</label>
              <select class="form-control" name="testimonial_rating">
                ${[5,4,3,2,1].map(r=>`<option value="${r}" ${(p?.testimonial?.rating||5)==r?'selected':''}>${r} Stars</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label class="form-label">Project Images</label>
          <div class="img-upload-zone" id="upload-zone" onclick="document.getElementById('img-input').click()"
            ondragover="event.preventDefault();this.classList.add('drag')"
            ondragleave="this.classList.remove('drag')"
            ondrop="Projects._handleDrop(event)">
            <div class="img-upload-zone__icon">🖼️</div>
            <div class="img-upload-zone__text">Click to browse or drag &amp; drop images</div>
            <div class="img-upload-zone__hint">JPG, PNG, WebP — max 5MB each</div>
          </div>
          <input type="file" id="img-input" accept="image/*" multiple style="display:none" onchange="Projects._handleFiles(this.files)">
          <div class="img-preview-grid" id="img-preview">
            ${(this._images||[]).map((item,i) => `
              <div class="img-preview-item">
                <img src="${this._fixAdminPath(item.preview || item)}" onerror="this.src='../assets/images/project_lilaa_1.jpg'">
                <button class="img-preview-remove" onclick="Projects._removeImg(${i})" type="button">✕</button>
              </div>`).join('')}
          </div>
        </div>

        <!-- Status -->
        <div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg);border-radius:var(--r-md)">
          <label class="toggle">
            <input type="checkbox" name="status" id="pub-toggle" ${(!p || p.status==='published')?'checked':''}>
            <span class="toggle-slider"></span>
          </label>
          <div>
            <div class="fw-600 text-sm">Publish Project</div>
            <div class="text-xs text-muted">Make this project visible on the live website</div>
          </div>
        </div>
      </form>
    `, `
      ${id ? `<button class="btn btn-danger btn-sm" onclick="Projects.delete('${id}')">Delete</button>` : ''}
      <span style="flex:1"></span>
      <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" type="button" onclick="Projects.submitDirect(this)">
        ${UI.icon('check')} ${id ? 'Save Changes' : 'Create Project'}
      </button>
    `, 'modal-lg');
  },

  _toggleOtherIndustry(select) {
    const wrap = document.getElementById('other-industry-wrap');
    if (!wrap) return;
    if (select.value === 'other') {
      wrap.style.display = 'block';
      const input = wrap.querySelector('input');
      if (input) input.focus();
    } else {
      wrap.style.display = 'none';
    }
  },

  /* Returns a Promise<dataUrl> — no callbacks */
  _compressImage(file) {
    return new Promise((resolve) => {
      const maxDim = 1200, quality = 0.82;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height) { if (width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; } }
          else                { if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; } }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  async _handleFiles(files) {
    if (!files || !files.length) return;
    if (!this._images) this._images = [];
    const fileList = Array.from(files);
    this._isCompressing = true;
    UI.toast('Optimizing & storing images...', 'info');
    await Promise.all(fileList.map(async (file) => {
      try {
        const dataUrl = await this._compressImage(file);
        const tempKey = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        try {
          await ImageDB.save(tempKey, dataUrl);
          this._images.push({ ref: 'idb:' + tempKey, preview: dataUrl });
        } catch (e) {
          console.warn('ImageDB save failed, using memory fallback:', e);
          this._images.push({ ref: dataUrl, preview: dataUrl });
        }
      } catch (e) { console.warn('Image compress failed:', e); }
    }));
    this._isCompressing = false;
    this._renderImgPreviews();
    UI.toast(`${fileList.length} image${fileList.length > 1 ? 's' : ''} stored successfully!`, 'success');
  },

  _handleDrop(e) {
    e.preventDefault();
    const zone = document.getElementById('upload-zone');
    if (zone) zone.classList.remove('drag');
    this._handleFiles(e.dataTransfer.files);
  },

  _renderImgPreviews() {
    const grid = document.getElementById('img-preview');
    if (!grid) return;
    grid.innerHTML = (this._images || []).map((item, i) => {
      const src = this._fixAdminPath((typeof item === 'object') ? (item.preview || item.ref || '') : item);
      return `
        <div class="img-preview-item">
          <img src="${src}" onerror="this.src='../assets/images/project_lilaa_1.jpg'">
          <button class="img-preview-remove" type="button" onclick="Projects._removeImg(${i})">✕</button>
        </div>`;
    }).join('');
  },

  _removeImg(idx) {
    if (this._images && idx >= 0 && idx < this._images.length) {
      const item = this._images[idx];
      const ref  = typeof item === 'object' ? item.ref : item;
      if (ref && ref.startsWith('idb:temp_') && typeof ImageDB !== 'undefined') {
        ImageDB.delete(ref.slice(4)).catch(() => {});
      }
      this._images.splice(idx, 1);
    }
    this._renderImgPreviews();
  },

  /* ── Helper: get trimmed value from named form field ────── */
  _fieldVal(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() : '';
  },

  /* ── Save with automatic retry without images ───────────── */
  async _saveProject(data) {
    const isEdit = !!this._editId;
    if (isEdit) {
      const result = await DB.projects.update(this._editId, data);
      if (result) { UI.toast('Project updated successfully!', 'success'); return true; }
    } else {
      const result = await DB.projects.add(data);
      if (result) { UI.toast('Project created successfully!', 'success'); return true; }
    }
    // Retry without images (storage quota issue)
    const fallback = { ...data, images: ['../assets/images/project_lilaa_1.jpg'], thumbnail: '../assets/images/project_lilaa_1.jpg', afterImage: '../assets/images/project_lilaa_1.jpg', beforeImage: '../assets/images/project_lilaa_1.jpg' };
    let retryOk = false;
    if (isEdit) { const r = await DB.projects.update(this._editId, fallback); retryOk = !!r; }
    else        { const r = await DB.projects.add(fallback);                   retryOk = !!r; }
    if (retryOk) { UI.toast(`Project ${isEdit ? 'updated' : 'created'} (images skipped — storage full).`, 'info'); return true; }
    UI.toast('Save failed. Server or storage write rejected.', 'error');
    return false;
  },

  async submitDirect(btnEl) {
    if (this._submitting) return;
    if (this._isCompressing) return UI.toast('Please wait, images are still being saved...', 'info');

    this._submitting = true;
    let btn = (btnEl && btnEl instanceof HTMLElement) ? btnEl : null;
    if (!btn) {
      btn = document.querySelector('#active-modal .btn-primary') || document.querySelector('#proj-form button[type="submit"]');
    }
    const origText = btn ? btn.innerHTML : '';
    if (btn) { btn.dataset.loading = 'true'; btn.disabled = true; }

    const restore = () => {
      this._submitting = false;
      if (btn) { delete btn.dataset.loading; btn.disabled = false; btn.innerHTML = origText; }
    };

    try {
      const f = document.getElementById('proj-form');
      if (!f) { restore(); return; }

      const nameInput = f.querySelector('[name="name"]');
      const indSelect = f.querySelector('[name="industry"]');
      const nameVal   = nameInput ? nameInput.value.trim() : '';
      let   indVal    = indSelect ? indSelect.value : '';
      let   indLabel  = '';

      if (!nameVal) { UI.toast('Please enter a Project Name', 'error'); if (nameInput) nameInput.focus(); restore(); return; }
      if (!indVal)  { UI.toast('Please select an Industry', 'error');   if (indSelect) indSelect.focus(); restore(); return; }

      if (indVal === 'other') {
        const customInput = f.querySelector('[name="custom_industry"]');
        const customText  = customInput ? customInput.value.trim() : '';
        if (!customText) { UI.toast('Please type your custom industry name', 'error'); if (customInput) customInput.focus(); restore(); return; }
        indVal   = 'other-' + customText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        indLabel = customText;
      } else {
        const indOpt = indSelect ? indSelect.selectedOptions[0] : null;
        indLabel = indOpt ? (indOpt.dataset.label || indOpt.textContent.trim()) : indVal;
      }

      // ── Finalize image references & Upload ───────────────────────────
      const projectId = this._editId || DB._id();
      const imageRefs = [];
      let hasIdbOnly  = false;

      for (let i = 0; i < this._images.length; i++) {
        const item    = this._images[i];
        const ref     = typeof item === 'object' ? item.ref : item;
        let   dataUrl = typeof item === 'object' ? item.preview : null;

        if (ref && ref.startsWith('idb:') && typeof ImageDB !== 'undefined') {
          try { dataUrl = (await ImageDB.get(ref.slice(4))) || dataUrl; } catch (e) {}
        } else if (ref && ref.startsWith('data:')) {
          dataUrl = ref;
        }

        let uploadedUrl = null;
        if (dataUrl && typeof DB.uploadImage === 'function') {
          try { uploadedUrl = await DB.uploadImage(dataUrl, `proj_${projectId}_${i}`); } catch (e) {}
        }

        if (uploadedUrl && (uploadedUrl.startsWith('http') || uploadedUrl.startsWith('/assets/'))) {
          imageRefs.push(uploadedUrl);
          if (ref && ref.startsWith('idb:temp_') && typeof ImageDB !== 'undefined') await ImageDB.delete(ref.slice(4)).catch(() => {});
        } else if (ref && ref.startsWith('idb:temp_') && typeof ImageDB !== 'undefined') {
          const finalKey = 'proj_' + projectId + '_' + i;
          if (dataUrl) {
            await ImageDB.save(finalKey, dataUrl).catch(() => {});
            await ImageDB.delete(ref.slice(4)).catch(() => {});
            imageRefs.push('idb:' + finalKey);
          } else { imageRefs.push(ref); }
          hasIdbOnly = true;
        } else {
          if (ref && ref.startsWith('idb:')) hasIdbOnly = true;
          imageRefs.push(ref);
        }
      }

      if (hasIdbOnly) UI.toast('Note: Some images stored locally only (IndexedDB). They may not display on remote devices.', 'info');

      const rawThumbRef = imageRefs.length ? imageRefs[0] : '../assets/images/project_lilaa_1.jpg';
      const imageList   = imageRefs.length ? imageRefs : [rawThumbRef];
      const existing    = this._editId
        ? (DB.projects.get(this._editId) || DB.projects.all().find(p => p && String(p.id) === String(this._editId)))
        : null;

      const data = {
        id:            projectId,
        name:          nameVal,
        industry:      indVal,
        industryLabel: indLabel,
        location:      this._fieldVal(f, 'location'),
        area:          this._fieldVal(f, 'area'),
        duration:      this._fieldVal(f, 'duration'),
        budgetRange:   this._fieldVal(f, 'budgetRange'),
        challenge:     this._fieldVal(f, 'challenge'),
        solution:      this._fieldVal(f, 'solution'),
        result:        this._fieldVal(f, 'result'),
        rank:          Math.max(1, parseInt(this._fieldVal(f, 'rank') || '99')),
        status:        f.querySelector('[name="status"]')?.checked ? 'published' : 'draft',
        images:        imageList,
        thumbnail:     rawThumbRef,
        afterImage:    rawThumbRef,
        beforeImage:   imageList[1] || rawThumbRef,
        testimonial: {
          author: this._fieldVal(f, 'testimonial_author'),
          role:   this._fieldVal(f, 'testimonial_role'),
          text:   this._fieldVal(f, 'testimonial_text'),
          rating: parseInt(this._fieldVal(f, 'testimonial_rating') || '5'),
        },
        processPhases: ['Discovery','Concept','Detailing','Execution','Handover'],
        createdAt: existing?.createdAt || new Date().toISOString(),
        views:     existing?.views     || 0,
        clicks:    existing?.clicks    || 0,
        leads:     existing?.leads     || 0,
      };

      const savedOk = await this._saveProject(data);
      if (!savedOk) { restore(); return; }

      // Reset table filters so newly created/updated project is guaranteed visible
      this._filter = { search: '', industry: 'all', status: 'all' };

      UI.closeModal();
      this.render();
      if (window.App && App.updateSidebar) App.updateSidebar();

      if (typeof GithubSync !== 'undefined' && GithubSync.afterMutation) {
        GithubSync.afterMutation();
      } else {
        DB.afterMutation();
      }
    } catch (errSave) {
      console.error('Projects submitDirect error:', errSave);
      if (window.UI && UI.toast) UI.toast(`Save error: ${errSave.message}`, 'error');
    } finally {
      restore();
    }
  },

  save(e) {
    if (e && e.preventDefault) e.preventDefault();
    this.submitDirect();
  },
};

window.Projects = Projects;

