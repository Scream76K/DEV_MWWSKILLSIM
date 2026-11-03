'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const extractStyle = id => {
  const start = '<style id="' + id + '">';
  const from = html.indexOf(start);
  assert.notEqual(from, -1, 'missing style ' + id);
  return html.slice(from + start.length, html.indexOf('</style>', from));
};
test('Build before Support, without duplicated weapon selector', () => {
  const main = html.slice(html.indexOf('<main class="wrap">'), html.indexOf('</main>') + 7);
  assert.ok(main.indexOf('③ 装備登録') > 0);
  assert.ok(main.indexOf('③ 装備登録') < main.indexOf('ここからサポート機能'));
  assert.equal((main.match(/id="weaponKindSelectionBlock"/g) || []).length, 1);
});
test('responsive breakpoints retain phone stack and tablet-landscape columns', () => {
  const css = extractStyle('flamme-ui-responsive-stage1');
  assert.ok(css.includes('max-width: 820px'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr)!important'));
  assert.ok(css.includes('min-width: 821px'));
});
test('reference-only HBG form is visually separated, not deleted', () => {
  const css = extractStyle('flamme-ui-developer-panel-separation-20261103');
  assert.ok(css.includes('section.card:has(> #hbgElementReferenceDetails)'));
  assert.ok(css.includes('display:none!important'));
  assert.ok(html.includes('<details id="hbgElementReferenceDetails">'));
  assert.ok(html.includes('<form id="hbgElementReferenceForm">'));
});
