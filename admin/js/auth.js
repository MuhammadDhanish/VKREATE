/* ============================================================
   VKREATE Admin — Auth Module
   ============================================================ */

const Auth = {

  renderLogin() {
    document.getElementById('admin-app').innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-logo">VKREATE</div>
          <div class="login-sub">Admin Panel</div>
          <h2 class="login-title">Welcome back</h2>
          <div class="login-error" id="login-error">Invalid email or password. Please try again.</div>
          <form id="login-form" class="form-grid" style="gap:16px">
            <div class="form-group">
              <label class="form-label" for="login-email">Email Address</label>
              <input class="form-control" type="email" id="login-email" placeholder="vkreatearchitecture@gmail.com" required autocomplete="email">
            </div>
            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <div style="position:relative">
                <input class="form-control" type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password" style="padding-right:44px">
                <button type="button" id="toggle-pw" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-4);font-size:1.1rem;background:none;border:none;cursor:pointer;" title="Show/hide password">👁</button>
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:-4px;">
              <label style="display:flex;align-items:center;gap:8px;font-size:0.8125rem;color:var(--text-3);cursor:pointer;user-select:none;">
                <input type="checkbox" id="login-remember" style="accent-color:var(--green-mid);cursor:pointer;" checked>
                <span>Keep me signed in</span>
              </label>
            </div>
            <button type="submit" class="login-btn">Sign In</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const remember = document.getElementById('login-remember')?.checked !== false;
      const errEl = document.getElementById('login-error');
      const submitBtn = e.target.querySelector('button[type="submit"]');

      if (errEl) errEl.classList.remove('show');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in…'; }

      let authenticated = false;
      let token = '';
      let serverError = '';

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data && data.success) {
          authenticated = true;
          token = data.token || '';
        } else if (res.status === 401) {
          serverError = data.error || 'Invalid email or password. Please try again.';
        }
      } catch (err) {
        // Connection error or static server
      }

      // If backend login didn't succeed, check local DB fallback
      if (!authenticated && !serverError) {
        if (DB.auth.login(email, password)) {
          authenticated = true;
        }
      }

      if (authenticated) {
        const settings = DB.settings.get();
        const activeToken = (token && typeof token === 'string' && token.trim()) ? token.trim() : ('vk_sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
        DB.auth.session.set({
          token: activeToken,
          email: email,
          name: settings.studio?.name || 'Admin',
          remember
        });
        App.init();
      } else {
        if (errEl) {
          errEl.textContent = serverError || 'Invalid email or password. Please try again.';
          errEl.classList.add('show');
        }
        const pwInp = document.getElementById('login-password');
        if (pwInp) {
          pwInp.value = '';
          pwInp.focus();
        }
      }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
    });

    document.getElementById('toggle-pw').addEventListener('click', () => {
      const inp = document.getElementById('login-password');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });
  },

  logout() {
    UI.confirm('Sign Out', 'Are you sure you want to sign out?', '🔒', () => {
      fetch('/api/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
      DB.auth.session.clear();
      Auth.renderLogin();
    });
  },
};
