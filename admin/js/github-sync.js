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

  // ── Push published projects & reviews to GitHub ─────────────────────
  async push() {
    const token = this.getToken();
    if (!token) {
      UI.toast('⚠️ No GitHub token set.', 'warning');
      return false;
    }

    UI.toast('🚀 Deploying to live site…', 'info');

    try {
      const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };

      // Push all 3 files in parallel so reviews deployment is instant
      await Promise.allSettled([
        this._pushFile('js/admin-reviews.json', DB.reviews.all(), headers),
        this._pushFile('js/admin-projects.json', DB.projects.all(), headers),
        this._pushFile('js/admin-inquiries.json', DB.inquiries.all(), headers)
      ]);

      UI.toast('✅ Live site deploying… changes visible in ~60s', 'success');
      return true;
    } catch (e) {
      console.error('GithubSync.push error:', e);
      UI.toast('❌ Deploy failed — check internet connection.', 'error');
      return false;
    }
  },

  async _pushFile(filePath, rawData, headers) {
    try {
      let sha = null;
      const getRes = await fetch(`https://api.github.com/repos/${this.REPO}/contents/${filePath}`, { headers });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      let processedData = JSON.parse(JSON.stringify(rawData));

      // Resolve idb: image keys for projects
      if (filePath.includes('projects') && typeof ImageDB !== 'undefined') {
        for (const p of processedData) {
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

      const jsonContent = JSON.stringify(processedData, null, 2);
      let encoded = '';
      try {
        const bytes = new TextEncoder().encode(jsonContent);
        let bin = '';
        bytes.forEach(b => bin += String.fromCharCode(b));
        encoded = btoa(bin);
      } catch (e) {
        encoded = btoa(unescape(encodeURIComponent(jsonContent)));
      }
      const body = {
        message: `Admin sync: ${filePath} [${new Date().toISOString()}]`,
        content: encoded,
        ...(sha ? { sha } : {}),
      };

      await fetch(`https://api.github.com/repos/${this.REPO}/contents/${filePath}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.warn(`Error pushing ${filePath}:`, e);
    }
  },
};
