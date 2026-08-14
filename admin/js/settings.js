/* ============================================================
   VKREATE Admin — Settings Module
   ============================================================ */

const Settings = {

  render() {
    const s = DB.settings.get();
    const studio = s.studio || {};
    const notif  = s.notifications || {};
    const creds  = s.credentials || {};

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Manage studio info, notifications, and admin access</p>
        </div>
      </div>

      <div style="display:grid;gap:24px;max-width:800px">

        <!-- Studio Info -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">🏢 Studio Information</span>
          </div>
          <div class="card-body">
            <form id="studio-form" class="form-grid" style="gap:16px" onsubmit="Settings.saveStudio(event)">
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Studio Name</label>
                  <input class="form-control" name="name" value="${studio.name||''}" placeholder="VKREATE Design Studio">
                </div>
                <div class="form-group">
                  <label class="form-label">Tagline</label>
                  <input class="form-control" name="tagline" value="${studio.tagline||''}" placeholder="Where Design Speaks">
                </div>
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input class="form-control" type="email" name="email" value="${studio.email||''}" placeholder="hello@vkreate.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input class="form-control" name="phone" value="${studio.phone||''}" placeholder="+91 98765 00000">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input class="form-control" name="address" value="${studio.address||''}" placeholder="City, State, India">
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Instagram URL</label>
                  <input class="form-control" name="instagram" value="${studio.instagram||''}" placeholder="https://instagram.com/vkreate">
                </div>
                <div class="form-group">
                  <label class="form-label">Website URL</label>
                  <input class="form-control" name="website" value="${studio.website||''}" placeholder="https://vkreate.com">
                </div>
              </div>
              <div>
                <button type="submit" class="btn btn-primary">${UI.icon('check')} Save Studio Info</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Notifications -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">🔔 Notifications</span>
          </div>
          <div class="card-body">
            <div style="display:grid;gap:16px">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:var(--bg);border-radius:var(--r-md)">
                <div>
                  <div class="fw-600 text-sm">New Review Alert</div>
                  <div class="text-xs text-muted">Get notified when a new client review is submitted</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="notif-review" ${notif.newReview?'checked':''} onchange="Settings.saveNotif()">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:var(--bg);border-radius:var(--r-md)">
                <div>
                  <div class="fw-600 text-sm">New Inquiry Alert</div>
                  <div class="text-xs text-muted">Get notified when a contact form is submitted</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="notif-inquiry" ${notif.newInquiry?'checked':''} onchange="Settings.saveNotif()">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="form-group">
                <label class="form-label">Notification Email</label>
                <input class="form-control" id="notif-email" type="email" value="${notif.notifEmail||''}" placeholder="admin@vkreate.com">
                <div class="form-hint">Where notification emails are sent (display only — configure in your mail client)</div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="Settings.saveNotif()">Save Notification Settings</button>
            </div>
          </div>
        </div>

        <!-- Admin Credentials -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">🔐 Admin Credentials</span>
          </div>
          <div class="card-body">
            <form id="creds-form" class="form-grid" style="gap:16px" onsubmit="Settings.saveCredentials(event)">
              <div class="form-group">
                <label class="form-label">Admin Email</label>
                <input class="form-control" name="email" type="email" value="${creds.email||''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input class="form-control" name="currentPw" type="password" placeholder="Enter current password" required>
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <input class="form-control" name="newPw" type="password" placeholder="Minimum 8 characters">
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <input class="form-control" name="confirmPw" type="password" placeholder="Repeat new password">
                </div>
              </div>
              <div class="form-hint">Leave new password fields blank to only update the email.</div>
              <div>
                <button type="submit" class="btn btn-primary">${UI.icon('check')} Update Credentials</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Data Management -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">💾 Data Management & Memory</span>
          </div>
          <div class="card-body">
            <div style="display:grid;gap:14px">

              <!-- localStorage meter -->
              ${(() => {
                let totalBytes = 0;
                try {
                  for (let k in localStorage) {
                    if (!localStorage.hasOwnProperty(k)) continue;
                    const val = localStorage.getItem(k);
                    totalBytes += (val ? val.length * 2 : 0);
                  }
                } catch(e) {}
                const maxBytes = 5 * 1024 * 1024;
                const pct = Math.min(Math.round((totalBytes / maxBytes) * 100), 100);
                const usedKB = Math.round(totalBytes / 1024);
                const color = pct > 80 ? '#dc2626' : pct > 60 ? '#d97706' : '#16a34a';
                return `
                  <div style="padding:14px;background:var(--bg);border-radius:var(--r-md)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                      <span class="text-sm fw-600">📦 localStorage <span style="font-weight:400;opacity:.6">(project metadata)</span></span>
                      <span class="text-xs text-muted">${usedKB} KB / 5120 KB (${pct}%)</span>
                    </div>
                    <div style="background:var(--border);border-radius:4px;height:8px;overflow:hidden">
                      <div style="width:${pct}%;height:100%;background:${color};border-radius:4px"></div>
                    </div>
                    ${pct > 70 ? `<p class="text-xs mt-6" style="color:${color}">⚠️ Storage getting ${pct > 90 ? 'critically full' : 'full'} — clear image cache below.</p>` : '<p class="text-xs mt-6" style="color:#16a34a">✓ Metadata storage is healthy.</p>'}
                  </div>`;
              })()}

              <!-- IndexedDB meter (async loaded) -->
              <div id="idb-meter" style="padding:14px;background:var(--bg);border-radius:var(--r-md)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <span class="text-sm fw-600">🖼️ IndexedDB <span style="font-weight:400;opacity:.6">(uploaded images)</span></span>
                  <span class="text-xs text-muted" id="idb-size-label">Loading...</span>
                </div>
                <div style="background:var(--border);border-radius:4px;height:8px;overflow:hidden">
                  <div id="idb-bar" style="width:0%;height:100%;background:#6366f1;border-radius:4px;transition:width .4s"></div>
                </div>
                <p class="text-xs mt-6 text-muted" id="idb-info">IndexedDB can store up to ~250 MB of images.</p>
              </div>

              <p class="text-sm text-muted">Export data as backup, import, or reset to demo content.</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button class="btn btn-outline btn-sm" onclick="Settings.exportAll()">
                  ${UI.icon('download')} Export All Data
                </button>
                <button class="btn btn-outline btn-sm" onclick="Settings.importData()">
                  📂 Import Data
                </button>
                <button class="btn btn-outline btn-sm" onclick="Settings.clearImageCache()" style="color:#dc2626;border-color:#fca5a5">
                  🖼️ Clear Image Cache
                </button>
                <button class="btn btn-danger btn-sm" onclick="Settings.resetData()">
                  🔄 Reset to Demo Data
                </button>
              </div>
              <div style="background:#fffbeb;border:1px solid #fde68a;padding:10px 14px;border-radius:var(--r-md)">
                <span class="text-xs" style="color:#92400E">⚠️ <strong>Clear Image Cache</strong> removes photos from IndexedDB (projects stay, images reset to placeholders). <strong>Reset</strong> erases everything.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- About Panel -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">ℹ️ About Admin Panel</span>
          </div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              ${[
                ['Version', '1.0.0'],
                ['Built for', 'VKREATE Design Studio'],
                ['Tech Stack', 'HTML · CSS · Vanilla JS'],
                ['Metadata Storage', 'localStorage (5 MB)'],
                ['Image Storage', 'IndexedDB (250 MB+)'],
                ['Last Login', DB.auth.session.get()?.email || '—'],
                ['Admin Panel', new Date().getFullYear()],
              ].map(([k,v]) => `
                <div style="padding:10px;background:var(--bg);border-radius:var(--r-sm)">
                  <div class="text-xs text-muted">${k}</div>
                  <div class="text-sm fw-600 mt-4">${v}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- 🚀 Deploy Settings (GitHub Sync) -->
        <div class="card" style="border:1px solid #4ade80">
          <div class="card-header" style="background:linear-gradient(135deg,#052e16,#14532d);color:#fff">
            <span class="card-title" style="color:#fff">🚀 Deploy Settings — Live Site Sync</span>
          </div>
          <div class="card-body">
            <p class="text-sm text-muted mb-16">
              Enter your <strong>GitHub Personal Access Token</strong> once. Every time you save or delete a project,
              the live website at <strong>vkreatearchitecture.com</strong> will automatically update within ~60 seconds.
            </p>
            <div class="form-group" style="max-width:520px">
              <label class="form-label">GitHub Token <span class="text-xs text-muted">(ghp_...)</span></label>
              <div style="display:flex;gap:10px">
                <input id="gh-token-input" class="form-control" type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value="${GithubSync && GithubSync.getToken() ? '••••••••••••••••••••' : ''}"
                  style="font-family:monospace">
                <button class="btn btn-primary" onclick="Settings.saveGithubToken()">Save</button>
              </div>
              <p class="text-xs text-muted mt-6">
                Token needs <strong>repo</strong> scope. Get one at
                <a href="https://github.com/settings/tokens/new" target="_blank" style="color:#4ade80">github.com/settings/tokens</a>
              </p>
            </div>
            <div style="margin-top:16px;display:flex;gap:10px;align-items:center">
              <button class="btn btn-outline btn-sm" onclick="Settings.testDeploy()"
                style="border-color:#4ade80;color:#16a34a">
                🔁 Test Deploy Now
              </button>
              ${GithubSync && GithubSync.hasToken()
                ? '<span class="text-xs" style="color:#16a34a">✅ Token saved — auto-deploy is active</span>'
                : '<span class="text-xs text-muted">⚠️ No token set — changes will only sync on this device</span>'}
            </div>
          </div>
        </div>

      </div>
    `;
  },

  saveStudio(e) {
    e.preventDefault();
    const f = e.target;
    DB.settings.update('studio', {
      name: f.name.value.trim(), tagline: f.tagline.value.trim(),
      email: f.email.value.trim(), phone: f.phone.value.trim(),
      address: f.address.value.trim(),
      instagram: f.instagram.value.trim(), website: f.website.value.trim(),
    });
    UI.toast('Studio information saved!', 'success');
  },

  saveNotif() {
    DB.settings.update('notifications', {
      newReview:  document.getElementById('notif-review')?.checked,
      newInquiry: document.getElementById('notif-inquiry')?.checked,
      notifEmail: document.getElementById('notif-email')?.value.trim(),
    });
    UI.toast('Notification settings saved!', 'success');
  },

  saveCredentials(e) {
    e.preventDefault();
    const f = e.target;
    const s = DB.settings.get();
    if (f.currentPw.value !== s.credentials.passwordHash) {
      return UI.toast('Current password is incorrect.', 'error');
    }
    const update = { email: f.email.value.trim(), passwordHash: s.credentials.passwordHash };
    if (f.newPw.value) {
      if (f.newPw.value !== f.confirmPw.value) return UI.toast('New passwords do not match.', 'error');
      if (f.newPw.value.length < 8) return UI.toast('Password must be at least 8 characters.', 'error');
      update.passwordHash = f.newPw.value;
    }
    DB.settings.update('credentials', update);
    UI.toast('Credentials updated successfully!', 'success');
    f.currentPw.value = f.newPw.value = f.confirmPw.value = '';
  },

  exportAll() {
    const data = {
      projects:  DB.projects.all(),
      reviews:   DB.reviews.all(),
      inquiries: DB.inquiries.all(),
      settings:  DB.settings.get(),
      exported:  new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vkreate-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    UI.toast('Data exported!', 'success');
  },

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.projects)  DB._set(DB.KEYS.projects,  data.projects);
          if (data.reviews)   DB._set(DB.KEYS.reviews,   data.reviews);
          if (data.inquiries) DB._set(DB.KEYS.inquiries,  data.inquiries);
          if (data.settings)  DB._set(DB.KEYS.settings,  data.settings);
          UI.toast('Data imported successfully!', 'success');
          App.navigate('dashboard');
        } catch {
          UI.toast('Invalid JSON file.', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  clearImageCache() {
    UI.confirm('Clear Image Cache', 'This will remove all uploaded images from storage. Projects will remain but their custom images will be reset to defaults. Continue?', '🗑️', () => {
      try {
        // Strip all base64 data images from projects, keeping metadata
        const projects = DB.projects.all();
        projects.forEach(p => {
          if (p.thumbnail && p.thumbnail.startsWith('data:')) {
            p.thumbnail = '../assets/images/project_lilaa_1.jpg';
          }
          if (p.afterImage && p.afterImage.startsWith('data:')) {
            p.afterImage = p.thumbnail;
          }
          if (p.beforeImage && p.beforeImage.startsWith('data:')) {
            p.beforeImage = p.thumbnail;
          }
          if (p.images && Array.isArray(p.images)) {
            p.images = p.images.map(img => img && img.startsWith('data:') ? p.thumbnail : img).filter(Boolean);
            if (!p.images.length) p.images = [p.thumbnail];
          }
        });
        DB._set(DB.KEYS.projects, projects);
        UI.toast('Image cache cleared! Storage freed up.', 'success');
        Settings.render();
      } catch(e) {
        UI.toast('Error clearing cache: ' + e.message, 'error');
      }
    }, false);
  },

  resetData() {
    UI.confirm('Reset to Demo Data', 'This will erase ALL current data and restore the original demo content. Are you sure?', '⚠️', () => {
      [DB.KEYS.projects, DB.KEYS.reviews, DB.KEYS.inquiries, DB.KEYS.analytics].forEach(k => localStorage.removeItem(k));
      DB.seed();
      UI.toast('Data reset to demo content!', 'success');
      App.navigate('dashboard');
    }, true);
  },

  saveGithubToken() {
    const input = document.getElementById('gh-token-input');
    const val = input ? input.value.trim() : '';
    if (!val || val.startsWith('•')) {
      UI.toast('Please enter your GitHub token (ghp_...)', 'warning');
      return;
    }
    if (!val.startsWith('ghp_') && !val.startsWith('github_pat_')) {
      UI.toast('Token should start with ghp_ — please check and try again.', 'warning');
      return;
    }
    GithubSync.setToken(val);
    UI.toast('✅ GitHub token saved! Auto-deploy is now active.', 'success');
    this.render(); // refresh to show active status
  },

  testDeploy() {
    if (!GithubSync.hasToken()) {
      UI.toast('Please enter and save your GitHub token first.', 'warning');
      return;
    }
    GithubSync.push();
  },
};
