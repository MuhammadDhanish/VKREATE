/* ============================================================
   VKREATE Admin — GitHub Sync Module
   Pushes admin project data to js/admin-projects.json on
   GitHub so Vercel can redeploy with latest projects for
   ALL visitors (not just same-device localStorage).
   ============================================================ */

const GithubSync = {

  REPO:      'MuhammadDhanish/VKREATE',
  FILE_PATH: 'js/admin-projects.json',
  TOKEN_KEY: 'vk_github_token',

  // ── Token management ──────────────────────────────────────
  getToken()       { return localStorage.getItem(this.TOKEN_KEY) || ''; },
  setToken(token)  { localStorage.setItem(this.TOKEN_KEY, token.trim()); },
  hasToken()       { return !!this.getToken(); },

  // ── Push published projects to GitHub ─────────────────────
  async push() {
    const token = this.getToken();
    if (!token) {
      UI.toast('⚠️ No GitHub token set. Go to Settings → Deploy Settings to add your token.', 'warning');
      return false;
    }

    UI.toast('🚀 Deploying to live site…', 'info');

    try {
      const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };

      // 1. Get current file SHA (needed for update)
      const getRes = await fetch(
        `https://api.github.com/repos/${this.REPO}/contents/${this.FILE_PATH}`,
        { headers }
      );

      let sha = null;
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      // 2. Build project data — all admin projects (published + draft metadata)
      const allProjects = DB.projects.all();
      const jsonContent = JSON.stringify(allProjects, null, 2);

      // 3. Base64 encode (GitHub API requires it)
      const encoded = btoa(unescape(encodeURIComponent(jsonContent)));

      // 4. Commit the file
      const body = {
        message: `Admin: update projects [${new Date().toISOString()}]`,
        content: encoded,
        ...(sha ? { sha } : {}),
      };

      const putRes = await fetch(
        `https://api.github.com/repos/${this.REPO}/contents/${this.FILE_PATH}`,
        { method: 'PUT', headers, body: JSON.stringify(body) }
      );

      if (putRes.ok) {
        UI.toast('✅ Live site deploying… changes visible in ~60s', 'success');
        return true;
      } else {
        const err = await putRes.json();
        console.error('GitHub sync error:', err);
        if (putRes.status === 401) {
          UI.toast('❌ GitHub token invalid or expired. Go to Settings → Deploy Settings.', 'error');
        } else {
          UI.toast(`❌ Deploy failed: ${err.message || putRes.status}`, 'error');
        }
        return false;
      }

    } catch (e) {
      console.error('GithubSync.push error:', e);
      UI.toast('❌ Deploy failed — check internet connection.', 'error');
      return false;
    }
  },
};
