const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const GH_REPO = process.env.GH_REPO || 'MuhammadDhanish/VKREATE';
const GH_DATA_BRANCH = process.env.GH_DATA_BRANCH || 'data';
const TTL_MS = 30000; // 30-second in-memory cache TTL

// In-memory TTL cache: { [filePath]: { data, timestamp } }
const TTL_CACHE = {};

// Helper to delay execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'VKREATE-Server-Sync'
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  return headers;
}

// Normalize file data to target schema
function normalizeSchema(fileKey, rawObj) {
  if (fileKey === 'js/admin-settings.json' || fileKey.includes('settings')) {
    let settings = {};
    let deletedIds = [];
    if (rawObj && typeof rawObj === 'object') {
      if (rawObj.settings && typeof rawObj.settings === 'object') {
        settings = rawObj.settings;
        deletedIds = Array.isArray(rawObj.deletedIds) ? rawObj.deletedIds : [];
      } else {
        settings = rawObj;
      }
    }
    return { deletedIds, settings };
  }

  let items = [];
  let deletedIds = [];

  if (Array.isArray(rawObj)) {
    items = rawObj;
  } else if (rawObj && typeof rawObj === 'object') {
    if (Array.isArray(rawObj.items)) {
      items = rawObj.items;
    } else if (Array.isArray(rawObj.reviews)) {
      items = rawObj.reviews;
    } else if (Array.isArray(rawObj.projects)) {
      items = rawObj.projects;
    } else if (Array.isArray(rawObj.inquiries)) {
      items = rawObj.inquiries;
    }
    if (Array.isArray(rawObj.deletedIds)) {
      deletedIds = rawObj.deletedIds;
    }
  }

  return { deletedIds, items };
}

// Invalidate TTL cache for a file
function invalidateCache(file) {
  delete TTL_CACHE[file];
}

// Read file through to GitHub with 30s TTL
async function ghRead(file, bypassCache = false) {
  const now = Date.now();
  if (!bypassCache && TTL_CACHE[file] && (now - TTL_CACHE[file].timestamp < TTL_MS)) {
    return { ...TTL_CACHE[file].data, _cached: true };
  }

  if (GITHUB_TOKEN) {
    try {
      const url = `https://api.github.com/repos/${GH_REPO}/contents/${file}?ref=${GH_DATA_BRANCH}&t=${now}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const json = await res.json();
        const contentStr = Buffer.from(json.content, 'base64').toString('utf8');
        const parsedRaw = JSON.parse(contentStr);
        const normalized = normalizeSchema(file, parsedRaw);
        normalized._sha = json.sha;

        TTL_CACHE[file] = { data: normalized, timestamp: now };
        return { ...normalized, _cached: false };
      }
    } catch (e) {
      console.warn(`ghRead GitHub fetch failed for ${file}:`, e.message);
    }
  }

  // Fallback: Read deployed local file from disk
  try {
    const localPath = path.join(__dirname, '..', file);
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, 'utf8');
      if (content.trim()) {
        const parsedRaw = JSON.parse(content);
        const normalized = normalizeSchema(file, parsedRaw);
        normalized._stale = true;
        TTL_CACHE[file] = { data: normalized, timestamp: now };
        return { ...normalized, _cached: false, _stale: true };
      }
    }
  } catch (err) {
    console.warn(`ghRead local fallback failed for ${file}:`, err.message);
  }

  const emptySchema = normalizeSchema(file, []);
  return { ...emptySchema, _stale: true };
}

// Write through to GitHub with up to 3 sha-retries on 409 conflict
async function ghWrite(file, mutateFn) {
  invalidateCache(file);

  if (!GITHUB_TOKEN) {
    // Local dev fallback when GITHUB_TOKEN is not set
    const current = await ghRead(file, true);
    const updated = mutateFn(current);
    try {
      const localPath = path.join(__dirname, '..', file);
      fs.writeFileSync(localPath, JSON.stringify(updated, null, 2), 'utf8');
    } catch (e) {}
    TTL_CACHE[file] = { data: updated, timestamp: Date.now() };
    return { success: true, data: updated };
  }

  const backoffs = [0, 300, 800];
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (backoffs[attempt] > 0) {
      await sleep(backoffs[attempt]);
    }

    try {
      const current = await ghRead(file, true);
      const sha = current._sha;
      const copy = JSON.parse(JSON.stringify(current));
      delete copy._sha;
      delete copy._cached;
      delete copy._stale;

      const mutated = mutateFn(copy);
      delete mutated._sha;
      delete mutated._cached;
      delete mutated._stale;

      // Update TTL cache speculatively so concurrent GETs immediately see updated state
      TTL_CACHE[file] = { data: mutated, timestamp: Date.now() };

      const contentBase64 = Buffer.from(JSON.stringify(mutated, null, 2)).toString('base64');
      const url = `https://api.github.com/repos/${GH_REPO}/contents/${file}`;
      const body = {
        message: `data-sync: update ${file} [${new Date().toISOString()}]`,
        content: contentBase64,
        branch: GH_DATA_BRANCH,
        ...(sha ? { sha } : {})
      };

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (putRes.ok) {
        const resJson = await putRes.json();
        mutated._sha = resJson.content?.sha;
        TTL_CACHE[file] = { data: mutated, timestamp: Date.now() };
        return { success: true, data: mutated };
      }

      if (putRes.status === 409) {
        console.warn(`ghWrite HTTP 409 Conflict for ${file} (attempt ${attempt + 1}/3), retrying...`);
        continue;
      }

      const errJson = await putRes.json().catch(() => ({}));
      lastError = errJson.message || `HTTP ${putRes.status}`;
      if (putRes.status < 500 && putRes.status !== 409) {
        break; // Non-retryable client error (e.g. 401/403)
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  return { success: false, error: lastError || 'ghWrite failed after retries' };
}

// Ensure the dedicated data branch exists on GitHub
async function ensureDataBranch() {
  if (!GITHUB_TOKEN) return;
  try {
    const branchRes = await fetch(`https://api.github.com/repos/${GH_REPO}/branches/${GH_DATA_BRANCH}`, { headers: getHeaders() });
    if (branchRes.ok) return;

    // Fetch main branch SHA
    const mainRes = await fetch(`https://api.github.com/repos/${GH_REPO}/git/ref/heads/main`, { headers: getHeaders() });
    if (!mainRes.ok) return;
    const mainJson = await mainRes.json();
    const mainSha = mainJson.object?.sha;

    if (!mainSha) return;

    // Create branch ref
    await fetch(`https://api.github.com/repos/${GH_REPO}/git/refs`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: `refs/heads/${GH_DATA_BRANCH}`,
        sha: mainSha
      })
    });
    console.log(`✅ Created dedicated data branch: ${GH_DATA_BRANCH}`);
  } catch (e) {
    console.warn('ensureDataBranch error:', e.message);
  }
}

module.exports = {
  ghRead,
  ghWrite,
  invalidateCache,
  ensureDataBranch
};
