/* ============================================================
   VKREATE Admin — ImageDB (IndexedDB Image Storage)
   Keeps large base64 images out of localStorage to prevent
   the 5MB quota from filling up.
   ============================================================ */

const ImageDB = {
  _db: null,
  DB_NAME: 'vkreate_images',
  DB_VERSION: 1,
  STORE: 'images',

  // ── Open / Init ──────────────────────────────────────────
  open() {
    return new Promise((resolve, reject) => {
      if (this._db) return resolve(this._db);
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE)) {
          db.createObjectStore(this.STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
      req.onerror   = (e) => reject(e.target.error);
    });
  },

  // ── Save image ───────────────────────────────────────────
  async save(id, dataUrl) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      const store = tx.objectStore(this.STORE);
      const req = store.put({ id, dataUrl, savedAt: Date.now() });
      req.onsuccess = () => resolve(id);
      req.onerror   = (e) => reject(e.target.error);
    });
  },

  // ── Get image ────────────────────────────────────────────
  async get(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readonly');
      const store = tx.objectStore(this.STORE);
      const req = store.get(id);
      req.onsuccess = (e) => resolve(e.target.result?.dataUrl || null);
      req.onerror   = (e) => reject(e.target.error);
    });
  },

  // ── Delete image ─────────────────────────────────────────
  async delete(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      const store = tx.objectStore(this.STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror   = (e) => reject(e.target.error);
    });
  },

  // ── Get all entries (for stats) ──────────────────────────
  async all() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readonly');
      const store = tx.objectStore(this.STORE);
      const req = store.getAll();
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror   = (e) => reject(e.target.error);
    });
  },

  // ── Clear all images ─────────────────────────────────────
  async clear() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      const store = tx.objectStore(this.STORE);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror   = (e) => reject(e.target.error);
    });
  },

  // ── Storage stats ────────────────────────────────────────
  async stats() {
    try {
      const all = await this.all();
      let totalBytes = 0;
      all.forEach(entry => {
        totalBytes += (entry.dataUrl || '').length * 0.75; // base64 → bytes approx
      });
      return { count: all.length, bytes: totalBytes, kb: Math.round(totalBytes / 1024) };
    } catch {
      return { count: 0, bytes: 0, kb: 0 };
    }
  },

  // ── Generate a unique image key ───────────────────────────
  key(projectId, index) {
    return `proj_${projectId}_img_${index}`;
  },

  // ── Save all images for a project, return reference keys ──
  async saveProjectImages(projectId, dataUrls) {
    const keys = [];
    for (let i = 0; i < dataUrls.length; i++) {
      const url = dataUrls[i];
      if (url && url.startsWith('data:')) {
        const k = this.key(projectId, i);
        await this.save(k, url);
        keys.push('idb:' + k);
      } else {
        keys.push(url); // keep non-base64 paths as-is
      }
    }
    return keys;
  },

  // ── Load a single image reference (resolves idb: prefix) ─
  async resolve(ref) {
    if (!ref) return null;
    if (ref.startsWith('idb:')) {
      return await this.get(ref.slice(4));
    }
    return ref;
  },

  // ── Resolve all image refs for a project ─────────────────
  async resolveAll(refs) {
    if (!refs || !refs.length) return [];
    return Promise.all(refs.map(r => this.resolve(r)));
  },

  // ── Delete all images for a project ─────────────────────
  async deleteProject(projectId) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      const store = tx.objectStore(this.STORE);
      const req = store.openCursor();
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error || tx.error);
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.key.startsWith(`proj_${projectId}_`) || cursor.key.startsWith(`proj_${projectId}`)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
      req.onerror = (e) => reject(e.target.error);
    });
  },

  // ── Clean up stale temp keys older than 24h ──────────────
  async cleanOrphanedTemps() {
    try {
      const db = await this.open();
      const tx = db.transaction(this.STORE, 'readwrite');
      const store = tx.objectStore(this.STORE);
      const req = store.openCursor();
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const entry = cursor.value;
          if (cursor.key.startsWith('temp_') && (entry.savedAt || 0) < oneDayAgo) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    } catch (e) {}
  },
};
