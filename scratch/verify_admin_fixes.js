const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Admin Panel Projects Code Path Fixes');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Check server.js fixes
const serverJs = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
assert(serverJs.includes("app.get('/api/auth/credentials', requireAuth"), 'C-1: /api/auth/credentials has requireAuth middleware');
assert(serverJs.includes("app.post('/api/purge-all', requireAuth") && !serverJs.includes("app.all('/api/purge-all'"), 'C-2: Wipe endpoints require authentication and use POST/DELETE');
assert(serverJs.includes("$set: { studio: newStudio"), 'C-4: PUT /api/settings uses $set');
assert(serverJs.includes("$set: newReview") && serverJs.includes("$set: { ...updates, id }"), 'C-5: Reviews findOneAndUpdate uses $set');
assert(serverJs.includes("blockedExact = ['/server.js'") || serverJs.includes("reqPath.startsWith('/lib/')"), 'C-6: express.static protected from serving server source files');
assert(serverJs.includes("notifyClients('reviews-updated')"), 'H-6: POST /api/reviews triggers SSE notification on MongoDB path');
assert(serverJs.includes("$set: { 'credentials.email': email"), 'H-7: syncCredentials uses $set for dot-notation paths');
assert(serverJs.includes("InquiryModel.findOneAndUpdate({ id: inquiry.id }, { $set: inquiry }"), 'H-8: POST /api/inquiries uses findOneAndUpdate upsert');
assert(serverJs.includes("app.get('/api/projects', requireAuth"), 'Bug #8: GET /api/projects requires authentication');

// 2. Check lib/models.js fixes
const modelsJs = fs.readFileSync(path.join(__dirname, '../lib/models.js'), 'utf8');
assert(modelsJs.includes("default: 'pending'"), "H-9: ReviewSchema default status is 'pending'");
assert(modelsJs.includes("default: 'published'"), "Bug #5: ProjectSchema default status is 'published'");

// 3. Check admin/js/data.js fixes
const dataJs = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
assert(dataJs.includes("vk_admin_deleted_inquiries"), 'H-1: DB.inquiries.all filters against deleted inquiry list');
assert(dataJs.includes("isClose = Math.abs(localTs - remoteTs) <= 3000"), 'Bug #4: loadRemoteData project merge has timestamp tolerance');
assert(dataJs.includes("DB._setLastLocalWrite('settings')"), 'S-3: DB.settings.save sets local write guard timestamp');
assert(!dataJs.includes("localStorage.removeItem('vk_admin_projects')"), 'S-6: purgeStaleMobileStorage does not wipe admin storage');
assert(dataJs.includes("adminEvtSource.readyState === EventSource.CLOSED"), 'S-1: SSE error handler allows auto-reconnect');
assert(dataJs.includes("console.warn(`Server project add warning (HTTP ${res.status}): ${err.error || 'Server sync pending'}`);\n        }\n      } catch (e) {\n        console.warn(`Server project add fetch exception: ${e.message} - keeping local save`);\n      }\n      return p;"), 'Bugs #3 & #7: DB.projects.add returns local item when local save succeeded');
assert(dataJs.includes("console.warn(`Server project update warning (HTTP ${res.status}): ${err.error || 'Server sync pending'}`);\n        }\n      } catch (e) {\n        console.warn(`Server project update fetch exception: ${e.message} - keeping local change`);\n      }\n      return l[i];"), 'Bugs #3 & #7: DB.projects.update returns local item when local save succeeded');

// 4. Check admin/js/inquiries.js fixes
const inquiriesJs = fs.readFileSync(path.join(__dirname, '../admin/js/inquiries.js'), 'utf8');
assert(inquiriesJs.includes("UI.escapeHTML(i.name || 'Anonymous')"), 'C-3: Inquiries table escapes user name to prevent XSS');
assert(inquiriesJs.includes("(i.name || '').toLowerCase().includes(q)"), 'S-4: Inquiries filter handles null name/email gracefully');
assert(inquiriesJs.includes("async _saveDetail(id)"), 'S-5: Inquiries _saveDetail is async/awaited');

// 5. Check admin/js/projects.js fixes
const projectsJs = fs.readFileSync(path.join(__dirname, '../admin/js/projects.js'), 'utf8');
assert(projectsJs.includes("async setRank(id, rankVal)") && projectsJs.includes("await DB.projects.update(id, { rank: r })"), 'Bug #1: setRank is async and awaits DB.projects.update');
assert(projectsJs.includes("Please enter a Project Name") && projectsJs.includes("restore();"), 'Bug #2 & #6: Projects.submitDirect calls restore() on validation early return');
assert(projectsJs.includes("const existing = this._editId ? (DB.projects.get(this._editId) || DB.projects.all().find(p => p && String(p.id) === String(this._editId))) : null;"), 'Bug #9: submitDirect preserves analytics counters on edit');

// 6. Check admin/js/reviews.js fixes
const reviewsJs = fs.readFileSync(path.join(__dirname, '../admin/js/reviews.js'), 'utf8');
assert(reviewsJs.includes("overlay.id = 'active-modal'"), 'S-7: Add-review modal uses #active-modal ID for Escape key closure');

// 7. Check admin/js/settings.js fixes
const settingsJs = fs.readFileSync(path.join(__dirname, '../admin/js/settings.js'), 'utf8');
assert(settingsJs.includes("'vk_admin_deleted_projects', 'vk_admin_deleted_reviews', 'vk_admin_deleted_inquiries'"), 'H-2: Settings.resetData clears deleted-id storage keys');
assert(settingsJs.includes("f.querySelector(`[name=\"${name}\"]`)"), 'M-13: saveStudio uses explicit querySelector for form inputs');

// 8. Check admin/css/admin.css fixes
const adminCss = fs.readFileSync(path.join(__dirname, '../admin/css/admin.css'), 'utf8');
assert(adminCss.includes(".header__icon-btn") && adminCss.includes(".max-w-500") && adminCss.includes(".btn-xs"), 'M-2, M-3, M-4: Missing CSS utility classes added');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');
process.exit(failed > 0 ? 1 : 0);
