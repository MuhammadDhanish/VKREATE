/* ============================================================
   VKREATE Admin — GitHub Sync Engine (Legacy Stub)
   Client-side GitHub API calls have been moved server-side to
   server.js with write-through GitHub data branch persistence.
   ============================================================ */

const GithubSync = {
  isConfigured: async () => {
    try {
      const res = await fetch((getApiBaseUrl() || '') + '/api/sync-status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return !!data.isProductionPersistent;
      }
    } catch (e) {}
    return false;
  },
  hasToken: () => false,
  getToken: () => '',
  setToken: () => {},
  push: async (opts = {}) => {
    try {
      const res = await fetch((getApiBaseUrl() || '') + '/api/sync-status', { credentials: 'include' });
      if (res.ok) {
        const status = await res.json();
        if (status.ok) {
          if (!opts || !opts.silent) {
            if (window.UI && UI.toast) {
              UI.toast(`✅ Sync status verified: ${status.storageBackend} active`, 'success');
            }
          }
          return true;
        }
      }
    } catch (e) {}
    if (!opts || !opts.silent) {
      if (window.UI && UI.toast) {
        UI.toast('⚠️ Sync test could not reach server backend', 'warning');
      }
    }
    return false;
  },
  afterMutation: async () => true,
  testSync: async () => {
    const res = await fetch((getApiBaseUrl() || '') + '/api/health', { credentials: 'include' }).catch(() => null);
    if (res && res.ok) {
      return { success: true, message: 'Server persistence active.' };
    }
    return { success: false, message: 'Server endpoint unreachable.' };
  }
};

if (typeof window !== 'undefined') {
  window.GithubSync = GithubSync;
}
