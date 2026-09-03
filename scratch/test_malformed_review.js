const fs = require('fs');
const path = require('path');

console.log('--- 🧪 VERIFICATION TEST 1: MALFORMED REVIEW rendering ---');

const reviewsJs = fs.readFileSync(path.join(__dirname, '../admin/js/reviews.js'), 'utf8');

global.window = {};
global.UI = {
  escapeHTML: (str) => String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
  dateShort: () => '23 Aug 2026',
  badge: (st) => `<span>${st}</span>`
};

global.DB = {
  reviews: {
    all: () => [
      { id: 'eviltral', rating: Object.create(null), clientName: { corrupt: true }, reviewText: 'Bad rating test' },
      { id: 'good-1', rating: 5, clientName: 'Good', reviewText: 'Normal review' }
    ],
    stats: () => ({ total: 2, pending: 1, approved: 1, rejected: 0 })
  }
};

eval(reviewsJs);
const Reviews = window.Reviews;

const html = Reviews._cardsHTML(DB.reviews.all());
console.log('Cards HTML generated without crashing!');
console.log('Contains fallback notice:', html.includes('⚠️ This review has malformed data and could not be displayed'));
console.log('Contains working Delete button:', html.includes('data-action="delete"') && html.includes('data-id="eviltral"'));

if (html.includes('⚠️ This review has malformed data and could not be displayed') && html.includes('data-id="eviltral"')) {
  console.log('✅ VERIFICATION TEST 1 PASSED!');
} else {
  console.error('❌ VERIFICATION TEST 1 FAILED!');
  process.exit(1);
}
