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
              <input class="form-control" type="email" id="login-email" placeholder="admin@vkreate.com" required autocomplete="email">
            </div>
            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <div style="position:relative">
                <input class="form-control" type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password" style="padding-right:44px">
                <button type="button" id="toggle-pw" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-4);font-size:1.1rem;background:none;border:none;cursor:pointer;" title="Show/hide password">👁</button>
              </div>
            </div>
            <button type="submit" class="login-btn">Sign In</button>
          </form>
          <p class="login-hint">Demo: admin@vkreate.com / Admin@123</p>
        </div>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pw    = document.getElementById('login-password').value;
      const errEl = document.getElementById('login-error');
      errEl.classList.remove('show');

      if (DB.auth.login(email, pw)) {
        const settings = DB.settings.get();
        DB.auth.session.set({ email, name: settings.studio?.name || 'Admin' });
        App.init();
      } else {
        errEl.classList.add('show');
        document.getElementById('login-password').value = '';
        document.getElementById('login-password').focus();
      }
    });

    document.getElementById('toggle-pw').addEventListener('click', () => {
      const inp = document.getElementById('login-password');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });
  },

  logout() {
    UI.confirm('Sign Out', 'Are you sure you want to sign out?', '🔒', () => {
      DB.auth.session.clear();
      Auth.renderLogin();
    });
  },
};
