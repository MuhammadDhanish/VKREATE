// Test all Projects actions in projects.js
const fs = require('fs');
const path = require('path');

// Global mock DOM environment
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.dispatchEvent = () => {};
global.document = {
  getElementById: (id) => {
    if (id === 'main-content') return { innerHTML: '' };
    if (id === 'projects-table') return { innerHTML: '' };
    if (id === 'proj-form') return null;
    return null;
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  removeEventListener: () => {},
  body: { appendChild: () => {}, prepend: () => {} }
};

global.UI = {
  escapeHTML: str => str || '',
  icon: () => '',
  toast: (msg, type) => console.log(`[UI.toast ${type}]`, msg),
  confirm: (t, m, i, cb) => cb(),
  modal: (t, b, f) => console.log(`[UI.modal]`, t),
  closeModal: () => {},
  badge: s => s,
  dateShort: d => d
};

global.localStorage = {
  _store: {},
  getItem: function(k) { return this._store[k] || null; },
  setItem: function(k, v) { this._store[k] = String(v); },
  removeItem: function(k) { delete this._store[k]; }
};

global.ImageDB = {
  get: async () => null,
  save: async () => 'key1',
  delete: async () => true
};

global.fetch = async (url, opts) => {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, project: { id: 'test-1', name: 'Test Proj', status: 'published', rank: 1 } })
  };
};

// Load data.js and projects.js
const dataCode = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
eval(dataCode + '\nglobal.DB = DB;');

const projectsCode = fs.readFileSync(path.join(__dirname, '../admin/js/projects.js'), 'utf8');
eval(projectsCode + '\nglobal.Projects = Projects;');

async function runTests() {
  console.log('Testing DB.seed()...');
  DB.seed();

  console.log('Testing Projects.render()...');
  Projects.render();

  console.log('Testing DB.projects.add()...');
  const p1 = await DB.projects.add({
    name: 'Test Interior',
    industry: 'office',
    status: 'published',
    rank: 1
  });
  console.log('Added project:', p1.id);

  console.log('Testing Projects.setRank()...');
  await Projects.setRank(p1.id, 2);

  console.log('Testing Projects.toggleStatus()...');
  await Projects.toggleStatus(p1.id, false); // draft

  console.log('Testing Projects.delete()...');
  await Projects.delete(p1.id);

  console.log('All action tests completed successfully!');
}

runTests().catch(err => {
  console.error('ACTION TEST FAILED:', err);
  process.exit(1);
});
