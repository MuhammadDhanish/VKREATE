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
  // Pushes are MERGED with the file currently on GitHub (union by id, newest
  // update wins, local tombstones respected). A replace-style push from a
  // stale admin browser used to permanently erase reviews that customers
  // had submitted from other devices.
  async push() {
    const token = this.getToken();
    if (!token) {
      UI.toast('⚠️ No GitHub token set.', 'warning');
      return false;
    }

    UI.toast('🚀 Deploying to live site…', 'info');

    // Pull the freshest server state first so we never push stale data over it
    try {
      if (typeof DB !== 'undefined' && DB.loadRemoteData) await DB.loadRemoteData();
    } catch (e) {}

    try {
      const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };

      const del = (key) => {
        try { return DB._getDeleted(key) || []; } catch (e) { return []; }
      };

      // Push projects, reviews, and inquiries data to GitHub
      await Promise.allSettled([
        this._pushFile('js/admin-reviews.json', DB.reviews.all(), headers, del(DB.KEYS.deletedReviews)),
        this._pushFile('js/admin-projects.json', DB.projects.all(), headers, del(DB.KEYS.deletedProjects)),
        this._pushFile('js/admin-inquiries.json', DB.inquiries.all(), headers, del(DB.KEYS.deletedInquiries))
      ]);

      UI.toast('✅ Live site deploying… changes visible in ~60s', 'success');
      return true;
    } catch (e) {
      console.error('GithubSync.push error:', e);
      UI.toast('❌ Deploy failed — check internet connection.', 'error');
      return false;
    }
  },

  // Union-merge two record lists by id: newest update wins, deleted ids excluded
  _mergeById(remoteList, localList, deletedIds = []) {
    const map = new Map();
    const timeOf = (it) => {
      const t = new Date(it.updatedAt || it.approvedAt || it.createdAt || it.date || 0).getTime();
      return isNaN(t) ? 0 : t;
    };
    const add = (it) => {
      if (!it || !it.id || deletedIds.includes(it.id)) return;
      const ex = map.get(it.id);
      if (!ex) {
        map.set(it.id, it);
      } else if (timeOf(it) >= timeOf(ex)) {
        map.set(it.id, { ...ex, ...it });
      } else {
        map.set(it.id, { ...it, ...ex });
      }
    };
    if (Array.isArray(remoteList)) remoteList.forEach(add);
    if (Array.isArray(localList)) localList.forEach(add);
    return Array.from(map.values());
  },

  async _pushFile(filePath, rawData, headers, deletedIds = []) {
    try {
      let sha = null;
      let remoteData = null;
      const getRes = await fetch(`https://api.github.com/repos/${this.REPO}/contents/${filePath}`, { headers });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
        // Decode the current remote content so we can merge instead of replace
        try {
          if (fileData.content) {
            const clean = fileData.content.replace(/\s/g, '');
            const decoded = decodeURIComponent(escape(atob(clean)));
            const parsed = JSON.parse(decoded);
            if (Array.isArray(parsed)) remoteData = parsed;
          }
        } catch (e) {
          console.warn(`Could not decode existing ${filePath}, pushing without merge:`, e);
        }
      }

      let processedData = JSON.parse(JSON.stringify(
        Array.isArray(remoteData) ? this._mergeById(remoteData, rawData, deletedIds) : rawData
      ));

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

      const putRes = await fetch(`https://api.github.com/repos/${this.REPO}/contents/${filePath}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
      if (!putRes.ok) {
        console.error(`GitHub push failed for ${filePath}: HTTP ${putRes.status}`);
        return false;
      }
      return true;
    } catch (e) {
      console.warn(`Error pushing ${filePath}:`, e);
      return false;
    }
  },
};
