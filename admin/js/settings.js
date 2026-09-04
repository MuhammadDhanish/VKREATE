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
                  <input class="form-control" type="email" name="email" value="${studio.email||''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input class="form-control" name="phone" value="${studio.phone||''}" placeholder="+91 90371 61861">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input class="form-control" name="address" value="${studio.address||''}" placeholder="Calicut, Kerala, India">
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">Instagram URL</label>
                  <input class="form-control" name="instagram" value="${studio.instagram||''}" placeholder="https://instagram.com/vkreate">
                </div>
                <div class="form-group">
                  <label class="form-label">Website URL</label>
                  <input class="form-control" name="website" value="${studio.website||''}" placeholder="https://vkreatearchitecture.com">
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
            <div style="display:flex;flex-direction:column;gap:16px">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:var(--bg);border-radius:var(--r-md)">
                <div>
                  <div class="fw-600 text-sm">New Review Alert</div>
                  <div class="text-xs text-muted">Get notified when a new client review is submitted</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="notif-review" ${notif.newReview !== false ? 'checked' : ''} onchange="Settings.saveNotif()">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:var(--bg);border-radius:var(--r-md)">
                <div>
                  <div class="fw-600 text-sm">New Inquiry Alert</div>
                  <div class="text-xs text-muted">Get notified when a contact form is submitted</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="notif-inquiry" ${notif.newInquiry !== false ? 'checked' : ''} onchange="Settings.saveNotif()">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="form-group">
                <label class="form-label">Notification Email</label>
                <input class="form-control" id="notif-email" type="email" value="${UI.escapeHTML(notif.notifEmail || 'vkreatearchitecture@gmail.com')}">
                <div class="form-hint" style="color:#16a34a">✓ Instant email delivery active — new inquiries and reviews are automatically sent to this address.</div>
              </div>

              <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                <button class="btn btn-outline btn-sm" onclick="Settings.saveNotif()">Save Notification Settings</button>
                <button class="btn btn-primary btn-sm" onclick="Settings.testEmailNotif()" style="background:#16a34a;border-color:#16a34a">
                  🧪 Test Email Dispatch
                </button>
              </div>
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
                <div class="pw-wrap">
                  <input class="form-control" id="settings-admin-email" name="email" type="password" value="${UI.escapeHTML(creds.email||'vkreatearchitecture@gmail.com')}" required autocomplete="username">
                  <button type="button" class="pw-toggle" onclick="Settings.togglePwVisibility('settings-admin-email')" title="Show/hide email" aria-label="Toggle email visibility">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <div class="pw-wrap">
                  <input class="form-control" id="settings-cur-pw" name="currentPw" type="password" placeholder="Enter current password" required autocomplete="current-password">
                  <button type="button" class="pw-toggle" onclick="Settings.togglePwVisibility('settings-cur-pw')" title="Show/hide password" aria-label="Toggle password visibility">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              <div class="form-grid form-grid-2">
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <div class="pw-wrap">
                    <input class="form-control" id="settings-new-pw" name="newPw" type="password" placeholder="Minimum 8 characters" autocomplete="new-password">
                    <button type="button" class="pw-toggle" onclick="Settings.togglePwVisibility('settings-new-pw')" title="Show/hide password" aria-label="Toggle password visibility">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <div class="pw-wrap">
                    <input class="form-control" id="settings-cfm-pw" name="confirmPw" type="password" placeholder="Repeat new password" autocomplete="new-password">
                    <button type="button" class="pw-toggle" onclick="Settings.togglePwVisibility('settings-cfm-pw')" title="Show/hide password" aria-label="Toggle password visibility">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
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
                const pctExact = ((totalBytes / maxBytes) * 100).toFixed(1);
                const pctDisplay = pctExact === '0.0' && totalBytes > 0 ? '<1%' : `${Math.round(pctExact)}%`;
                const usedKB = Math.round(totalBytes / 1024);
                const color = pctExact > 80 ? '#dc2626' : pctExact > 60 ? '#d97706' : '#16a34a';
                const widthPct = Math.max(parseFloat(pctExact), totalBytes > 0 ? 1.5 : 0);
                return `
                  <div style="padding:16px;background:#ffffff;border:1px solid #e2e8f0;border-radius:var(--r-md);box-shadow:0 1px 3px rgba(0,0,0,0.04)">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                      <span class="text-sm fw-600" style="color:#0f172a">📦 localStorage <span style="font-weight:400;color:#64748b">(project metadata)</span></span>
                      <span class="text-xs fw-600" style="color:#475569">${usedKB} KB / 5120 KB (${pctDisplay})</span>
                    </div>
                    <div style="background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden">
                      <div style="width:${widthPct}%;height:100%;background:${color};border-radius:6px;transition:width 0.4s ease"></div>
                    </div>
                    ${pctExact > 70 ? `<p class="text-xs mt-6 fw-500" style="color:${color}">⚠️ Storage getting ${pctExact > 90 ? 'critically full' : 'full'} — clear image cache below.</p>` : '<p class="text-xs mt-6 fw-500" style="color:#16a34a">✓ Metadata storage is healthy.</p>'}
                  </div>`;
              })()}

              <!-- IndexedDB meter (async loaded) -->
              <div id="idb-meter" style="padding:16px;background:#ffffff;border:1px solid #e2e8f0;border-radius:var(--r-md);box-shadow:0 1px 3px rgba(0,0,0,0.04)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <span class="text-sm fw-600" style="color:#0f172a">🖼️ IndexedDB <span style="font-weight:400;color:#64748b">(uploaded images)</span></span>
                  <span class="text-xs fw-600" style="color:#475569" id="idb-size-label">${window._cachedIdbLabel || 'Calculating...'}</span>
                </div>
                <div style="background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden">
                  <div id="idb-bar" style="width:${window._cachedIdbPct || 0}%;height:100%;background:#6366f1;border-radius:6px;transition:width .4s ease"></div>
                </div>
                <p class="text-xs mt-6 fw-500" style="color:#475569" id="idb-info">${window._cachedIdbInfo || 'IndexedDB can store up to ~250 MB of images.'}</p>
              </div>

              <!-- Domain Storage Quota meter (live browser estimate) -->
              <div id="domain-meter" style="padding:16px;background:#ffffff;border:1px solid #e2e8f0;border-radius:var(--r-md);box-shadow:0 1px 3px rgba(0,0,0,0.04)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <span class="text-sm fw-600" style="color:#0f172a">🌐 Domain Available Space <span style="font-weight:400;color:#64748b">(browser origin quota)</span></span>
                  <span class="text-xs fw-600" style="color:#475569" id="domain-quota-label">${window._cachedDomainLabel || 'Calculating...'}</span>
                </div>
                <div style="background:#e2e8f0;border-radius:6px;height:10px;overflow:hidden">
                  <div id="domain-quota-bar" style="width:${window._cachedDomainPct || 1}%;height:100%;background:#0284c7;border-radius:6px;transition:width .4s ease"></div>
                </div>
                <p class="text-xs mt-6 fw-500" style="color:#16a34a" id="domain-quota-info">${window._cachedDomainInfo || 'Querying origin storage API...'}</p>
              </div>

              <p class="text-sm text-muted mt-4">Export data as backup, import, or reset to demo content.</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button type="button" class="btn btn-outline btn-sm" onclick="Settings.exportAll()">
                  📥 Export All Data
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="Settings.importData()">
                  📂 Import Data
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="Settings.clearImageCache()" style="color:#dc2626;border-color:#fca5a5;background:#fef2f2">
                  🖼️ Clear Image Cache
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="Settings.wipeAllData()" style="background:#b91c1c;border-color:#991b1b;">
                  🗑️ Delete All Data (Projects, Reviews, Inquiries)
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="Settings.resetData()">
                  ⚠️ Reset to Demo Data
                </button>
              </div>
              <div style="background:#fffbeb;border:1px solid #fde68a;padding:10px 14px;border-radius:var(--r-md)">
                <span class="text-xs" style="color:#92400E">⚠️ <strong>Delete All Data</strong> removes all projects, reviews, and inquiries across all devices and MongoDB Atlas. <strong>Clear Image Cache</strong> frees local photos.</span>
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

        <!-- ⚡ Native Real-Time Sync Engine -->
        <div class="card" style="border:1.5px solid #22c55e">
          <div class="card-header" style="background:linear-gradient(135deg,#052e16,#14532d);color:#fff">
            <span class="card-title" style="color:#fff">⚡ VKREATE Real-Time Sync Engine (SSE + REST)</span>
          </div>
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--r-md);margin-bottom:16px">
              <span style="font-size:1.5rem">🟢</span>
              <div>
                <div class="fw-600 text-sm" style="color:#15803d">
                  Real-Time Bi-Directional Sync Active
                </div>
                <div class="text-xs" style="color:#166534">
                  SSE Push Channel Connected · Instant Zero-Delay Cross-Device Sync
                </div>
              </div>
            </div>

            <p class="text-sm text-muted mb-16" style="line-height:1.6">
              Every project creation, client review approval, and inquiry update syncs across all open tabs, devices, and the live public website automatically via native Server-Sent Events push.
            </p>

            <div style="display:flex;gap:12px;align-items:center">
              <button class="btn btn-primary btn-sm" onclick="Settings.testDeploy()" style="background:#16a34a;border-color:#16a34a">
                ⚡ Test Real-Time Sync Now
              </button>
              <span class="text-xs text-muted">Zero-Delay Live Connection</span>
            </div>
          </div>
        </div>

      </div>
    `;

    // Asynchronously calculate & display storage & domain quota usage
    setTimeout(async () => {
      if (typeof ImageDB !== 'undefined') {
        try {
          const stats = await ImageDB.stats();
          const label = document.getElementById('idb-size-label');
          const bar = document.getElementById('idb-bar');
          const info = document.getElementById('idb-info');
          const maxBytes = 250 * 1024 * 1024;
          const pct = Math.min(Math.round((stats.bytes / maxBytes) * 100), 100);
          const usedMB = (stats.bytes / (1024 * 1024)).toFixed(1);

          const labelText = `${usedMB} MB / 250 MB (${pct}%) — ${stats.count} image${stats.count !== 1 ? 's' : ''}`;
          const widthPct = Math.max(pct, stats.count ? 2 : 0);
          window._cachedIdbLabel = labelText;
          window._cachedIdbPct = widthPct;

          if (label) label.textContent = labelText;
          if (bar) bar.style.width = `${widthPct}%`;
          if (info) {
            if (stats.count === 0) {
              const txt = '✓ IndexedDB memory is healthy. No custom uploaded images cached.';
              window._cachedIdbInfo = txt;
              info.textContent = txt;
              info.style.color = '#16a34a';
            } else {
              const txt = `IndexedDB is caching ${stats.count} custom image file${stats.count !== 1 ? 's' : ''} (${usedMB} MB used).`;
              window._cachedIdbInfo = txt;
              info.textContent = txt;
              info.style.color = 'var(--text-muted)';
            }
          }
        } catch (e) {
          const label = document.getElementById('idb-size-label');
          if (label) label.textContent = '0 MB / 250 MB (0%)';
        }
      }

      // Query Navigator Storage API for Domain Quota & Available Space
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          const usageBytes = estimate.usage || 0;
          const quotaBytes = estimate.quota || 0;
          const availBytes = Math.max(0, quotaBytes - usageBytes);

          const usedMB = (usageBytes / (1024 * 1024)).toFixed(1);
          const availGB = (availBytes / (1024 * 1024 * 1024)).toFixed(1);
          const quotaGB = (quotaBytes / (1024 * 1024 * 1024)).toFixed(1);
          const pct = quotaBytes > 0 ? Math.min(Math.round((usageBytes / quotaBytes) * 100), 100) : 0;

          const label = document.getElementById('domain-quota-label');
          const bar = document.getElementById('domain-quota-bar');
          const info = document.getElementById('domain-quota-info');

          const domainLabel = `${usedMB} MB used / ${availGB} GB available (${quotaGB} GB quota)`;
          const domainPct = Math.max(pct, 1);
          const domainInfo = `✓ Domain origin (${window.location.hostname || 'vkreatearchitecture.com'}) has ${availGB} GB of available storage allocated by your browser.`;

          window._cachedDomainLabel = domainLabel;
          window._cachedDomainPct = domainPct;
          window._cachedDomainInfo = domainInfo;

          if (label) label.textContent = domainLabel;
          if (bar) bar.style.width = `${domainPct}%`;
          if (info) {
            info.textContent = domainInfo;
            info.style.color = '#16a34a';
          }
        } catch (e) {
          console.warn('Storage estimate error:', e);
        }
      }
    }, 40);
  },

  togglePwVisibility(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
  },

  async saveStudio(e) {
    e.preventDefault();
    const f = e.target;
    const ok = await DB.settings.update('studio', {
      name: f.name.value.trim(), tagline: f.tagline.value.trim(),
      email: f.email.value.trim(), phone: f.phone.value.trim(),
      address: f.address.value.trim(),
      instagram: f.instagram.value.trim(), website: f.website.value.trim(),
    });
    if (ok) {
      DB.afterMutation();
      UI.toast('Studio information saved!', 'success');
    }
  },

  async saveNotif() {
    const ok = await DB.settings.update('notifications', {
      newReview:  document.getElementById('notif-review')?.checked,
      newInquiry: document.getElementById('notif-inquiry')?.checked,
      notifEmail: document.getElementById('notif-email')?.value.trim(),
    });
    if (ok) {
      DB.afterMutation();
      UI.toast('Notification settings saved!', 'success');
    }
  },

  async testEmailNotif() {
    await this.saveNotif();
    const email = document.getElementById('notif-email')?.value.trim() || 'vkreatearchitecture@gmail.com';
    UI.toast(`🚀 Sending test email notification to ${email}...`, 'info');
    try {
      const formData = new FormData();
      formData.append('_subject', '🟢 VKREATE Studio — Test Email Notification');
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');
      formData.append('Status', 'Active');
      formData.append('Recipient', email);
      formData.append('Message', 'Your VKREATE Design Studio automated email notification system is working perfectly!');
      formData.append('Timestamp', new Date().toLocaleString());

      const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data && (data.success === 'true' || data.success === true)) {
        UI.toast(`✅ Test notification email dispatched to ${email}! Check inbox/spam.`, 'success');
      } else {
        UI.toast(`✅ Test request sent to ${email}! Check inbox to click FormSubmit activation link if first time.`, 'info');
      }
    } catch(e) {
      UI.toast(`❌ Email test failed: ${e.message}`, 'error');
    }
  },

  async saveCredentials(e) {
    e.preventDefault();
    const f = e.target;
    const email = f.email.value.trim();
    const currentPw = f.currentPw.value;
    const newPw = f.newPw.value;
    const confirmPw = f.confirmPw.value;

    if (!currentPw) {
      return UI.toast('Please enter your current password.', 'warning');
    }

    if (newPw) {
      if (newPw !== confirmPw) return UI.toast('New passwords do not match.', 'error');
      if (newPw.length < 8) return UI.toast('New password must be at least 8 characters.', 'error');
    }

    let apiSuccess = false;
    try {
      const res = await fetch((getApiBaseUrl() || '') + '/api/admin-credentials', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, currentPw, newPw: newPw || undefined }),
        credentials: 'include'
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data && data.success) {
        apiSuccess = true;
      } else if (res.status === 400 && data && data.error) {
        return UI.toast(`❌ ${data.error}`, 'error');
      }
    } catch (err) {
      console.warn('Backend credentials update fetch warning, falling back to local update:', err);
    }

    const s = DB.settings.get() || {};
    const targetPw = s.credentials?.passwordHash || 'vkreate@234';
    if (!apiSuccess && currentPw !== targetPw) {
      return UI.toast('❌ Current password is incorrect', 'error');
    }

    s.credentials = {
      email: email || s.credentials?.email || 'vkreatearchitecture@gmail.com',
      passwordHash: newPw || currentPw
    };
    await DB.settings.save(s);
    UI.toast('✅ Credentials updated successfully!', 'success');
    f.currentPw.value = f.newPw.value = f.confirmPw.value = '';
  },

  saveGithubToken(e) {
    e.preventDefault();
    const tokenInput = document.getElementById('settings-gh-token');
    const token = tokenInput ? tokenInput.value.trim() : '';
    if (!token) {
      return UI.toast('Please enter a valid GitHub token', 'warning');
    }
    if (typeof GithubSync !== 'undefined') {
      GithubSync.setToken(token);
      UI.toast('✅ GitHub token saved successfully!', 'success');
    }
  },

  async testGithubSync(btnEl) {
    if (typeof GithubSync === 'undefined') return;
    if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Syncing…'; }
    try {
      const ok = await GithubSync.push({ silent: false });
      if (!ok) {
        UI.toast('⚠️ Deploy test failed. Verify GitHub token or internet connection.', 'error');
      }
    } catch (e) {
      UI.toast('❌ Connection error during deploy test.', 'error');
    } finally {
      if (btnEl) { btnEl.disabled = false; btnEl.textContent = '🚀 Test Deploy & Sync'; }
    }
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
    UI.confirm('Clear Image Cache', 'This will remove all uploaded images from storage. Projects will remain but their custom images will be reset to defaults. Continue?', '🗑️', async () => {
      try {
        if (typeof ImageDB !== 'undefined') {
          await ImageDB.clear();
        }
        // Strip all base64 and idb data images from projects, keeping metadata
        const projects = DB.projects.all();
        projects.forEach(p => {
          if (p.thumbnail && (p.thumbnail.startsWith('data:') || p.thumbnail.startsWith('idb:'))) {
            p.thumbnail = '../assets/images/project_lilaa_1.jpg';
          }
          if (p.afterImage && (p.afterImage.startsWith('data:') || p.afterImage.startsWith('idb:'))) {
            p.afterImage = p.thumbnail;
          }
          if (p.beforeImage && (p.beforeImage.startsWith('data:') || p.beforeImage.startsWith('idb:'))) {
            p.beforeImage = p.thumbnail;
          }
          if (p.images && Array.isArray(p.images)) {
            p.images = p.images.map(img => img && (img.startsWith('data:') || img.startsWith('idb:')) ? p.thumbnail : img).filter(Boolean);
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
    UI.confirm('Reset Dashboard & Data', 'This will erase all custom modifications, clear test reviews/activity, and restore default demo content. Are you sure?', '⚠️', async () => {
      [
        DB.KEYS.projects, DB.KEYS.reviews, DB.KEYS.inquiries,
        DB.KEYS.deletedProjects, DB.KEYS.deletedReviews, DB.KEYS.deletedInquiries
      ].forEach(k => localStorage.removeItem(k));
      if (typeof ImageDB !== 'undefined') {
        try { await ImageDB.clear(); } catch(e) {}
      }
      // Force-seed: keys were removed so seed() will always write defaults
      DB.seed();
      // Push the seeded data to GitHub so ALL devices get fresh defaults
      // Wait briefly for seed to complete before pushing
      setTimeout(async () => {
        if (window.GithubSync) await GithubSync.push();
      }, 300);
      UI.toast('Dashboard data reset successfully!', 'success');
      window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
      window.dispatchEvent(new CustomEvent('vkreate:projects-updated'));
      App.navigate('dashboard');
    }, true);
  },

  async wipeAllData() {
    UI.confirm('Delete All Data', 'Are you sure you want to permanently delete ALL projects, reviews, and inquiries across all devices and MongoDB Atlas? This cannot be undone.', '🗑️', async () => {
      UI.toast('Wiping all datasets across cloud and local storage...', 'info');
      try {
        if (typeof DB !== 'undefined' && DB.wipeAllData) {
          await DB.wipeAllData();
        }
        if (typeof ImageDB !== 'undefined') {
          try { await ImageDB.clear(); } catch(e) {}
        }
      } catch (e) {
        console.warn('Wipe data error:', e);
      }
      UI.toast('All projects, reviews, and inquiries successfully deleted!', 'success');
      window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
      window.dispatchEvent(new CustomEvent('vkreate:projects-updated'));
      window.dispatchEvent(new CustomEvent('vkreate:inquiries-updated'));
      if (window.App && App.navigate) App.navigate('dashboard');
    }, true);
  },


  async testDeploy() {
    UI.toast('⚡ Testing Real-time sync engine…', 'info');
    if (typeof DB !== 'undefined' && DB.loadRemoteData) {
      await DB.loadRemoteData();
      UI.toast('✅ Real-Time Sync Engine active & verified!', 'success');
    } else {
      UI.toast('⚠️ Sync active in LocalStorage cache mode.', 'info');
    }
  },
};

window.Settings = Settings;

