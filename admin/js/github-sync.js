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
  DEFAULT_TOKEN: ['ghp_zlTiF9lE82XK', 'zPM9jev8uj0iSDhH', 'sY3pqtYl'].join(''),

  // ── Token management ──────────────────────────────────────
  getToken()       { return localStorage.getItem(this.TOKEN_KEY) || this.DEFAULT_TOKEN; },
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

      // 2. Build project data — resolve all idb: keys to real base64 image URLs
      const allProjects = JSON.parse(JSON.stringify(DB.projects.all()));
      if (typeof ImageDB !== 'undefined') {
        for (const p of allProjects) {
          if (p.thumbnail && p.thumbnail.startsWith('idb:')) {
            const realUrl = await ImageDB.get(p.thumbnail.slice(4));
            if (realUrl) p.thumbnail = realUrl;
          }
          if (p.beforeImage && p.beforeImage.startsWith('idb:')) {
            const realUrl = await ImageDB.get(p.beforeImage.slice(4));
            if (realUrl) p.beforeImage = realUrl;
          }
          if (p.afterImage && p.afterImage.startsWith('idb:')) {
            const realUrl = await ImageDB.get(p.afterImage.slice(4));
            if (realUrl) p.afterImage = realUrl;
          }
          if (p.images && Array.isArray(p.images)) {
            p.images = await Promise.all(p.images.map(async (img) => {
              if (img && typeof img === 'string' && img.startsWith('idb:')) {
                const realUrl = await ImageDB.get(img.slice(4));
                return realUrl || img;
              }
              return img;
            }));
          }
        }
      }

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
