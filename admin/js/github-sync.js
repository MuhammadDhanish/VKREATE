/* ============================================================
   VKREATE Admin — GitHub Sync Engine (Legacy Stub)
   Client-side GitHub API calls have been moved server-side to
   server.js with write-through GitHub data branch persistence.
   ============================================================ */

const GithubSync = {
  isConfigured: () => false,
  hasToken: () => false,
  getToken: () => '',
  setToken: () => {},
  push: async () => true,
  afterMutation: async () => true,
  testSync: async () => ({ success: true, message: 'Server write-through persistence active.' })
};

if (typeof window !== 'undefined') {
  window.GithubSync = GithubSync;
}
