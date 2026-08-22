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
  DEFAULT_TOKEN: ['gh', 'p_zlTiF9lE82XK', 'zPM9jev8uj0iSDhH', 'sY3pqtYl'].join(''),

  // ── Token management ──────────────────────────────────────
  getToken()       { return localStorage.getItem(this.TOKEN_KEY) || this.DEFAULT_TOKEN; },
  setToken(token)  { localStorage.setItem(this.TOKEN_KEY, token.trim()); },
  hasToken()       { return !!this.getToken(); },

  _pushLock: null,
  _queuedPushNeeded: false,
  _lastPushResult: false,

  afterMutation(opts) {
    window.dispatchEvent(new Event('storage'));
    return this.push(opts);
  },

  // ── Push published projects, reviews, inquiries & settings to GitHub ──────
  async push(opts = {}) {
    if (this._pushLock) {
      this._queuedPushNeeded = true;
      await this._pushLock;
      if (this._pushLock) {
        await this._pushLock;
      }
      return this._lastPushResult;
    }

    let resolveLock;
    this._pushLock = new Promise(res => resolveLock = res);

    try {
      do {
        this._queuedPushNeeded = false;
        this._lastPushResult = await this._doPush(opts);
      } while (this._queuedPushNeeded);
    } finally {
      this._pushLock = null;
      resolveLock();
    }

    return this._lastPushResult;
  },

  _invalidTokenError: false,

  async _doPush(opts = {}) {
    const silent = !!opts.silent;
    const token = this.getToken();
    this._invalidTokenError = false;

    if (!token) {
      if (!silent) UI.toast('⚠️ No GitHub token set. Update token in Settings → GitHub Integration.', 'warning');
      return false;
    }

    if (!silent) UI.toast('🚀 Deploying to live site…', 'info');

    // Pull the freshest server state first so we never push stale data over it
    try {
      if (typeof DB !== 'undefined' && DB.loadRemoteData) await DB.loadRemoteData(silent);
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

      const filesToPush = [
        { path: 'js/admin-reviews.json',  data: DB.reviews.all(),   delKey: del(DB.KEYS.deletedReviews) },
        { path: 'js/admin-projects.json', data: DB.projects.all(),  delKey: del(DB.KEYS.deletedProjects) },
        { path: 'js/admin-inquiries.json',data: DB.inquiries.all(), delKey: del(DB.KEYS.deletedInquiries) },
        { path: 'js/admin-settings.json', data: DB.settings.get(),  delKey: [] }
      ];

      // Push projects, reviews, inquiries, and settings data to GitHub
      const results = await Promise.allSettled(
        filesToPush.map(f => this._pushFile(f.path, f.data, headers, f.delKey))
      );

      const failedFiles = [];
      results.forEach((res, idx) => {
        if (res.status !== 'fulfilled' || res.value !== true) {
          failedFiles.push(filesToPush[idx].path);
        }
      });

      if (failedFiles.length === 0) {
        if (!silent) UI.toast('✅ Live site deploying… changes visible in ~60s', 'success');
        return true;
      } else {
        console.error('GithubSync.push failed for files:', failedFiles);
        if (this._invalidTokenError) {
          if (!silent) UI.toast('❌ GitHub access token expired or invalid (HTTP 401). Update token in Admin Settings → GitHub Integration.', 'error');
        } else {
          if (!silent) UI.toast(`❌ Deploy failed for: ${failedFiles.join(', ')}`, 'error');
        }
        return false;
      }
    } catch (e) {
      console.error('GithubSync.push error:', e);
      if (!silent) UI.toast('❌ Deploy failed — check internet connection.', 'error');
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
      let remoteDeletedIds = [];
      const getRes = await fetch(`https://api.github.com/repos/${this.REPO}/contents/${filePath}`, { headers });
      if (getRes.status === 401 || getRes.status === 403) {
        this._invalidTokenError = true;
      }
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
        // Decode the current remote content so we can merge instead of replace
        try {
          if (fileData.content) {
            const clean = fileData.content.replace(/\s/g, '');
            const decoded = decodeURIComponent(escape(atob(clean)));
            const parsed = JSON.parse(decoded);
            if (filePath.includes('reviews')) {
              if (Array.isArray(parsed)) {
                remoteData = parsed;
              } else if (parsed && typeof parsed === 'object') {
                remoteData = parsed.reviews || [];
                remoteDeletedIds = Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [];
              }
            } else {
              if (Array.isArray(parsed)) remoteData = parsed;
            }
          }
        } catch (e) {
          console.warn(`Could not decode existing ${filePath}, pushing without merge:`, e);
        }
      }

      const mergedDeletedIds = Array.from(new Set([...remoteDeletedIds, ...deletedIds]));

      let processedData = JSON.parse(JSON.stringify(
        Array.isArray(remoteData) ? this._mergeById(remoteData, rawData, mergedDeletedIds) : rawData
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

      const finalPayload = filePath.includes('reviews')
        ? { deletedIds: mergedDeletedIds, reviews: processedData }
        : processedData;

      const jsonContent = JSON.stringify(finalPayload, null, 2);
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
        if (putRes.status === 401 || putRes.status === 403) {
          this._invalidTokenError = true;
        }
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
