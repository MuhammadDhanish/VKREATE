/* ============================================================
   VKREATE Admin — Projects Module
   ============================================================ */

const Projects = {

  _filter: { search: '', industry: 'all', status: 'all' },
  _editId: null,
  _images: [],       // Array of { ref: 'idb:key' | 'data:...' | 'path', preview: dataUrl }
  _isCompressing: false,

  _fixAdminPath(src) {
    if (!src) return '';
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('idb:')) return src;
    return src.startsWith('../') ? src : '../' + src;
  },

  render() {
    const projects = this._filtered();
    const allProjs = DB.projects.all();
    const publishedProjs = DB.projects.published();
    const draftProjs = DB.projects.drafts();

    document.getElementById('main-content').innerHTML = `
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
              <input type="search" placeholder="Search projects..." value="${this._filter.search}"
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

    DB.projects.all().forEach(p => {
      if (p.industry && !pairsMap.has(p.industry)) {
        pairsMap.set(p.industry, p.industryLabel || p.industry);
      }
    });

    return Array.from(pairsMap.entries()).map(([v, l]) =>
      `<option value="${v}" ${this._filter.industry===v?'selected':''}>${l}</option>`
    ).join('');
  },

  _filtered() {
    let list = DB.projects.all();
    if (this._filter.search) {
      const q = this._filter.search.toLowerCase();
      list = list.filter(p => (p.name||'').toLowerCase().includes(q) || (p.location||'').toLowerCase().includes(q));
    }
    if (this._filter.industry !== 'all') list = list.filter(p => p.industry === this._filter.industry);
    if (this._filter.status   !== 'all') list = list.filter(p => p.status   === this._filter.status);
    return list;
  },

  _refreshTable() {
    const el = document.getElementById('projects-table');
    if (el) el.innerHTML = this._tableHTML(this._filtered());
  },

  _tableHTML(projects) {
    if (!projects.length) return `
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
        ${projects.map(p => {
          const rawSrc = p.thumbnail || (p.images && p.images[0]) || '';
          const isIdb = rawSrc.startsWith('idb:');
          const thumbSrc = this._fixAdminPath(rawSrc);
          return `
          <tr>
            <td>
              ${thumbSrc
                ? `<img src="${isIdb ? '../assets/images/project_lilaa_1.jpg' : thumbSrc}" data-idb-key="${isIdb ? rawSrc.slice(4) : ''}" class="td-thumb" alt="" onerror="this.src='../assets/images/project_lilaa_1.jpg'">`
                : `<div class="td-thumb-placeholder">No img</div>`}
            </td>
            <td class="text-sm fw-600">
              <select class="form-control pref-select" style="padding:4px 8px;font-size:0.75rem;font-weight:700;border-radius:20px;width:auto;cursor:pointer;${
                p.rank === 1 ? 'background:rgba(201,169,110,0.25);color:#856404;border:1px solid #C9A96E;' :
                p.rank === 2 ? 'background:rgba(100,116,139,0.2);color:#1E293B;border:1px solid #64748B;' :
                p.rank === 3 ? 'background:rgba(217,119,6,0.2);color:#78350F;border:1px solid #D97706;' :
                p.rank <= 5 ? 'background:rgba(16,185,129,0.2);color:#064E3B;border:1px solid #10B981;' :
                p.rank <= 10 ? 'background:rgba(59,130,246,0.2);color:#1E3A8A;border:1px solid #3B82F6;' :
                'background:rgba(0,0,0,0.04);color:var(--text-2);border:1px solid var(--border);'
              }" onchange="Projects.setRank('${p.id}', this.value)">
                ${Array.from({length: 10}, (_, i) => i + 1).map(n => `
                  <option value="${n}" ${p.rank === n ? 'selected' : ''}>⭐ TOP #${n}</option>
                `).join('')}
                <option value="99" ${(!p.rank || p.rank > 10) ? 'selected' : ''}>Standard (#${p.rank && p.rank <= 99 ? p.rank : '99'})</option>
              </select>
            </td>
            <td class="td-name">${p.name || 'Untitled'}</td>
            <td><span class="text-sm text-muted">${p.industryLabel||p.industry||'Commercial'}</span></td>
            <td>${UI.badge(p.status)}</td>
            <td class="text-sm text-muted">${p.location||'—'}</td>
            <td class="text-sm">${(p.views||0).toLocaleString()}</td>
            <td class="text-sm">${p.leads||0}</td>
            <td class="text-xs text-muted">${UI.dateShort(p.updatedAt)}</td>
            <td>
              <div class="td-actions">
                <button class="btn btn-ghost btn-sm btn-icon" onclick="Projects.openForm('${p.id}')" title="Edit">✏️</button>
                <label class="toggle" title="${p.status==='published'?'Unpublish':'Publish'}">
                  <input type="checkbox" ${p.status==='published'?'checked':''}
                    onchange="Projects.toggleStatus('${p.id}',this.checked)">
                  <span class="toggle-slider"></span>
                </label>
                <button class="btn btn-ghost btn-sm btn-icon" onclick="Projects.delete('${p.id}')" title="Delete" style="color:var(--danger)">🗑️</button>
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;

    // Resolve idb: thumbnails in table asynchronously
    setTimeout(() => {
      document.querySelectorAll('.td-thumb[data-idb-key]').forEach(async img => {
        const key = img.dataset.idbKey;
        if (key && typeof ImageDB !== 'undefined') {
          const url = await ImageDB.get(key);
          if (url) img.src = url;
        }
      });
    }, 30);
  },

  setRank(id, rankVal) {
    const r = parseInt(rankVal) || 99;
    DB.projects.update(id, { rank: r });
    UI.toast(`Project preference set to Top #${r}!`, 'success');
    this._refreshTable();
    if (window.App && App.updateSidebar) App.updateSidebar();
    window.dispatchEvent(new Event('storage'));
    if (window.GithubSync) GithubSync.push();
  },

  _updatePrefButtons(rankVal) {
    const val = parseInt(rankVal);
    document.querySelectorAll('#proj-form [data-rank-btn]').forEach(btn => {
      const btnRank = parseInt(btn.dataset.rankBtn);
      if (btnRank === val) {
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      }
    });
  },

  toggleStatus(id, published) {
    DB.projects.update(id, { status: published ? 'published' : 'draft' });
    UI.toast(published ? 'Project published!' : 'Project moved to drafts.', published ? 'success' : 'info');
    this.render();
    window.dispatchEvent(new Event('storage'));
  },

  delete(id) {
    const p = DB.projects.get(id);
    if (!p) return;
    UI.confirm('Delete Project', `Delete "<strong>${p.name}</strong>"? This cannot be undone.`, '🗑️', () => {
      DB.projects.delete(id);
      UI.toast('Project deleted.', 'success');
      this.render();
      if (window.App && App.updateSidebar) App.updateSidebar();
      window.dispatchEvent(new Event('storage'));
      // Push to GitHub so Vercel redeploys and all visitors see the change
      if (window.GithubSync) GithubSync.push();
    }, true);
  },

  exportCSV() {
    const rows = [['Name','Industry','Status','Location','Area','Duration','Budget','Views','Leads','Created']];
    DB.projects.all().forEach(p => rows.push([
      `"${(p.name||'').replace(/"/g, '""')}"`, `"${(p.industryLabel||p.industry||'').replace(/"/g, '""')}"`, p.status||'', `"${(p.location||'').replace(/"/g, '""')}"`, p.area||'', p.duration||'', p.budgetRange||'',
      p.views||0, p.leads||0, UI.dateShort(p.createdAt)
    ]));
    UI.downloadCSV(rows, 'vkreate-projects.csv');
  },

  async openForm(id) {
    this._editId = id || null;
    const p = id ? DB.projects.get(id) : null;
    if (id && !p) return UI.toast('Project not found.', 'error');

    // Load existing image references and resolve previews
    this._images = [];
    if (p && p.images && p.images.length) {
      const resolved = await Promise.all(p.images.map(async ref => {
        let preview = ref;
        if (ref && ref.startsWith('idb:')) {
          preview = await ImageDB.get(ref.slice(4)) || '../assets/images/project_lilaa_1.jpg';
        }
        return { ref, preview };
      }));
      this._images = resolved.filter(r => r.ref);
    }

    const stdIndustries = ['restaurant','beauty','office','retail','hospitality','residential','healthcare'];
    const isOther = p?.industry && (!stdIndustries.includes(p.industry) || p.industry.startsWith('other-'));

    UI.modal(`${id ? 'Edit' : 'Add'} Project`, `
      <form id="proj-form" class="form-grid" style="gap:20px" onsubmit="event.preventDefault(); Projects.submitDirect();">
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
            <input class="form-control" name="name" placeholder="e.g. Lilaa — Malayali Cuisine" required value="${p?.name||''}">
          </div>
          <div class="form-group">
            <label class="form-label">Industry <span>*</span></label>
            <select class="form-control" name="industry" required onchange="Projects._toggleOtherIndustry(this)">
              <option value="">Select industry...</option>
              <option value="restaurant" ${p?.industry==='restaurant'?'selected':''}>Restaurants & Cafes</option>
              <option value="beauty"     ${p?.industry==='beauty'?'selected':''}>Beauty & Wellness</option>
              <option value="office"     ${p?.industry==='office'?'selected':''}>Corporate Office</option>
              <option value="retail"     ${p?.industry==='retail'?'selected':''}>Retail & Jewellery</option>
              <option value="hospitality"${p?.industry==='hospitality'?'selected':''}>Hotels & Hospitality</option>
              <option value="residential"${p?.industry==='residential'?'selected':''}>Residential & Villas</option>
              <option value="healthcare" ${p?.industry==='healthcare'?'selected':''}>Healthcare & Clinics</option>
              <option value="other"      ${isOther?'selected':''}>Other (Specify below)...</option>
            </select>
            <div id="other-industry-wrap" style="margin-top:10px; display:${isOther?'block':'none'}">
              <input class="form-control" name="custom_industry" placeholder="Type custom industry (e.g. Educational, Exhibition, Nightclub)" value="${isOther ? (p?.industryLabel || '') : ''}">
            </div>
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">Location</label>
            <input class="form-control" name="location" placeholder="City, State" value="${p?.location||''}">
          </div>
          <div class="form-group">
            <label class="form-label">Area</label>
            <input class="form-control" name="area" placeholder="e.g. 2,500 sq ft" value="${p?.area||''}">
          </div>
        </div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label">Duration</label>
            <input class="form-control" name="duration" placeholder="e.g. 4 months" value="${p?.duration||''}">
          </div>
          <div class="form-group">
            <label class="form-label">Budget Range</label>
            <input class="form-control" name="budgetRange" placeholder="e.g. ₹25L – ₹35L" value="${p?.budgetRange||''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Challenge</label>
          <textarea class="form-control" name="challenge" placeholder="Describe the project challenge..." rows="3">${p?.challenge||''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Solution</label>
          <textarea class="form-control" name="solution" placeholder="How VKREATE solved it..." rows="3">${p?.solution||''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Result</label>
          <textarea class="form-control" name="result" placeholder="Measurable outcomes..." rows="2">${p?.result||''}</textarea>
        </div>

        <!-- Testimonial -->
        <div style="background:var(--bg);border-radius:var(--r-md);padding:16px">
          <div class="fw-600 text-sm mb-16" style="color:var(--text-2)">Client Testimonial</div>
          <div class="form-grid" style="gap:14px">
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label">Client Name</label>
                <input class="form-control" name="testimonial_author" value="${p?.testimonial?.author||''}" placeholder="Full name">
              </div>
              <div class="form-group">
                <label class="form-label">Client Role</label>
                <input class="form-control" name="testimonial_role" value="${p?.testimonial?.role||''}" placeholder="Title, Company">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Testimonial Text</label>
              <textarea class="form-control" name="testimonial_text" rows="3" placeholder="Client's quote...">${p?.testimonial?.text||''}</textarea>
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
            <div class="img-upload-zone__text">Click to browse or drag & drop images</div>
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
      ${id ? `<button class="btn btn-danger btn-sm" onclick="Projects.delete('${id}');UI.closeModal()">Delete</button>` : ''}
      <span style="flex:1"></span>
      <button class="btn btn-outline" onclick="UI.closeModal()">Cancel</button>
      <button class="btn btn-primary" type="button" onclick="Projects.submitDirect()">
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

  _compressImage(file, callback) {
    const maxWidth = 1200;
    const maxHeight = 1200;
    const quality = 0.82;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        callback(compressedDataUrl);
      };
      img.onerror = () => callback(e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  _handleFiles(files) {
    if (!this._images) this._images = [];
    const fileList = Array.from(files);
    if (!fileList.length) return;

    this._isCompressing = true;
    UI.toast('Optimizing & storing images...', 'info');
    let processed = 0;

    fileList.forEach(file => {
      this._compressImage(file, async (compressedDataUrl) => {
        // Save to IndexedDB immediately — keep only a reference
        const tempKey = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        try {
          await ImageDB.save(tempKey, compressedDataUrl);
          this._images.push({ ref: 'idb:' + tempKey, preview: compressedDataUrl });
        } catch (e) {
          // IndexedDB failed — fall back to in-memory only
          console.warn('ImageDB save failed:', e);
          this._images.push({ ref: compressedDataUrl, preview: compressedDataUrl });
        }
        processed++;
        if (processed === fileList.length) {
          this._isCompressing = false;
          this._renderImgPreviews();
          UI.toast(`${fileList.length} image${fileList.length > 1 ? 's' : ''} stored successfully!`, 'success');
        }
      });
    });
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
      const src = this._fixAdminPath((typeof item === 'object') ? item.preview : item);
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
      // Clean up from IndexedDB if it was a temp key
      const ref = typeof item === 'object' ? item.ref : item;
      if (ref && ref.startsWith('idb:temp_')) {
        ImageDB.delete(ref.slice(4)).catch(() => {});
      }
      this._images.splice(idx, 1);
    }
    this._renderImgPreviews();
  },

  async submitDirect() {
    if (this._isCompressing) {
      return UI.toast('Please wait, images are still being saved...', 'info');
    }

    const f = document.getElementById('proj-form');
    if (!f) return;

    const nameInput = f.querySelector('[name="name"]');
    const indSelect = f.querySelector('[name="industry"]');
    const nameVal = nameInput ? nameInput.value.trim() : '';
    let indVal = indSelect ? indSelect.value : '';
    let indLabel = '';

    if (!nameVal) {
      UI.toast('Please enter a Project Name', 'error');
      if (nameInput) nameInput.focus();
      return;
    }
    if (!indVal) {
      UI.toast('Please select an Industry', 'error');
      if (indSelect) indSelect.focus();
      return;
    }

    if (indVal === 'other') {
      const customInput = f.querySelector('[name="custom_industry"]');
      const customText = customInput ? customInput.value.trim() : '';
      if (!customText) {
        UI.toast('Please type your custom industry name', 'error');
        if (customInput) customInput.focus();
        return;
      }
      indVal = 'other-' + customText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      indLabel = customText;
    } else {
      const indOpt = indSelect ? indSelect.selectedOptions[0] : null;
      indLabel = indOpt ? (indOpt.dataset.label || indOpt.textContent) : indVal;
    }

    // ── Finalize image references ───────────────────────────
    const projectId = this._editId || DB._id();
    const imageRefs = [];
    for (let i = 0; i < this._images.length; i++) {
      const item = this._images[i];
      const ref = typeof item === 'object' ? item.ref : item;
      if (ref && ref.startsWith('idb:temp_')) {
        const finalKey = 'proj_' + projectId + '_' + i;
        const dataUrl = await ImageDB.get(ref.slice(4));
        if (dataUrl) {
          await ImageDB.save(finalKey, dataUrl);
          await ImageDB.delete(ref.slice(4));
          imageRefs.push('idb:' + finalKey);
        } else {
          imageRefs.push(ref);
        }
      } else {
        imageRefs.push(ref);
      }
    }

    const thumbRef = imageRefs.length ? imageRefs[0] : '../assets/images/project_lilaa_1.jpg';
    const imageList = imageRefs.length ? imageRefs : [thumbRef];

    const data = {
      id:           projectId,
      name:         nameVal,
      industry:     indVal,
      industryLabel: indLabel,
      location:     f.querySelector('[name="location"]')?.value.trim() || '',
      area:         f.querySelector('[name="area"]')?.value.trim() || '',
      duration:     f.querySelector('[name="duration"]')?.value.trim() || '',
      budgetRange:  f.querySelector('[name="budgetRange"]')?.value.trim() || '',
      challenge:    f.querySelector('[name="challenge"]')?.value.trim() || '',
      solution:     f.querySelector('[name="solution"]')?.value.trim() || '',
      result:       f.querySelector('[name="result"]')?.value.trim() || '',
      rank:         parseInt(f.querySelector('[name="rank"]')?.value || '99'),
      status:       f.querySelector('[name="status"]')?.checked ? 'published' : 'draft',
      images:       imageList,
      thumbnail:    thumbRef,
      afterImage:   thumbRef,
      beforeImage:  imageList[1] || thumbRef,
      testimonial: {
        author: f.querySelector('[name="testimonial_author"]')?.value.trim() || '',
        role:   f.querySelector('[name="testimonial_role"]')?.value.trim() || '',
        text:   f.querySelector('[name="testimonial_text"]')?.value.trim() || '',
        rating: parseInt(f.querySelector('[name="testimonial_rating"]')?.value || '5'),
      },
      processPhases: ['Discovery','Concept','Detailing','Execution','Handover'],
      views: 0, clicks: 0, leads: 0,
    };

    let savedOk = false;
    if (this._editId) {
      const result = DB.projects.update(this._editId, data);
      savedOk = !!result;
      if (savedOk) {
        UI.toast('Project updated successfully!', 'success');
      } else {
        // Storage may be full — try saving without images (idb refs are tiny, so this is about localStorage)
        const dataNoImages = { ...data, images: ['../assets/images/project_lilaa_1.jpg'], thumbnail: '../assets/images/project_lilaa_1.jpg', afterImage: '../assets/images/project_lilaa_1.jpg', beforeImage: '../assets/images/project_lilaa_1.jpg' };
        const retry = DB.projects.update(this._editId, dataNoImages);
        if (retry) {
          UI.toast('Project updated (images skipped — storage full). Try clearing image cache.', 'info');
          savedOk = true;
        } else {
          UI.toast('Save failed: storage is full. Go to Settings → Clear Image Cache.', 'error');
          return;
        }
      }
    } else {
      const added = DB.projects.add(data);
      savedOk = !!added;
      if (!savedOk) {
        // Storage may be full — try saving without images
        const dataNoImages = { ...data, images: ['../assets/images/project_lilaa_1.jpg'], thumbnail: '../assets/images/project_lilaa_1.jpg', afterImage: '../assets/images/project_lilaa_1.jpg', beforeImage: '../assets/images/project_lilaa_1.jpg' };
        const retry = DB.projects.add(dataNoImages);
        if (retry) {
          UI.toast('Project created (images skipped — storage full). Try smaller images.', 'info');
          savedOk = true;
        } else {
          UI.toast('Save failed: storage is full. Please clear browser storage or use smaller images.', 'error');
          return;
        }
      } else {
        UI.toast('Project created successfully!', 'success');
      }
    }

    if (!savedOk) return;

    // Reset table filters so newly created/updated project is guaranteed visible
    this._filter = { search: '', industry: 'all', status: 'all' };

    UI.closeModal();
    this.render();
    if (window.App && App.updateSidebar) App.updateSidebar();

    // Broadcast storage sync event for instant live website updates
    window.dispatchEvent(new Event('storage'));

    // Push to GitHub so Vercel redeploys and all visitors see the change
    if (window.GithubSync) GithubSync.push();
  },

  save(e) {
    if (e && e.preventDefault) e.preventDefault();
    this.submitDirect();
  },
};

window.Projects = Projects;

