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
test('responsive breakpoints stack tablet portrait and retain landscape columns', () => {
  const css = extractStyle('flamme-ui-responsive-stage1');
  assert.ok(css.includes('max-width: 980px'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr)!important'));
  assert.ok(css.includes('min-width: 981px'));
  const workspace = extractStyle('flamme-ui-workspace-stage4');
  assert.ok(workspace.includes('min-width:981px'));
  assert.ok(workspace.includes('max-width:980px'));
  assert.ok(workspace.includes('max-width:1120px'));
  assert.ok(!css.includes('min-width: 821px'));
});
test('reference-only HBG form is visually separated, not deleted', () => {
  const css = extractStyle('flamme-ui-developer-panel-separation-20261103');
  assert.ok(css.includes('section.card:has(> #hbgElementReferenceDetails)'));
  assert.ok(css.includes('display:none!important'));
  assert.ok(html.includes('<details id="hbgElementReferenceDetails">'));
  assert.ok(html.includes('<form id="hbgElementReferenceForm">'));
});

test('A/B comparison occupies the available panel width without page overflow', () => {
  const css = extractStyle('flamme-ui-comparison-readability-stage5');
  assert.ok(css.includes('#compareOut .compare-results'));
  assert.ok(css.includes('max-width:none'));
  assert.ok(css.includes('#compareOut .compare-table'));
  assert.ok(css.includes('overflow-x:auto'));
  assert.ok(css.includes('overscroll-behavior-x:contain'));
  assert.ok(html.includes('function renderCompareTableChunk('));
  assert.ok(html.includes('data-comparison-pending'));
});

test('charm controls retain accessible widths and the original editor', () => {
  const css = extractStyle('flamme-ui-edit-controls-stage6');
  assert.ok(css.includes('#charmEditor .charm-slot-row'));
  assert.ok(css.includes('#charmEditor .charm-deco-row'));
  assert.ok(css.includes('min-height:42px'));
  assert.ok(html.includes('id="charmEditor"'));
  assert.ok(html.includes('function renderCharmDecos()'));
});
test('saved build names occupy the flexible middle column', () => {
  const css = extractStyle('flamme-ui-edit-controls-stage6');
  assert.ok(css.includes('#savedBuilds .saved-build-item'));
  assert.ok(css.includes('grid-template-columns:auto minmax(0,1fr) auto'));
  assert.ok(css.includes('overflow-wrap:anywhere'));
  assert.ok(html.includes('data-build-load'));
  assert.ok(html.includes('data-build-del'));
});

test('skill entries remain readable in narrow build workspace', () => {
  const css = extractStyle('flamme-ui-skill-deco-readability-stage7');
  assert.ok(css.includes('#skillWorkspaceRight #skillOutput .skill-game-grid'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr)'));
  assert.ok(css.includes('#skillWorkspaceRight #skillOutput .skill-level'));
  assert.ok(css.includes('white-space:nowrap'));
  assert.ok(html.includes('function renderSkillGameBlock('));
  assert.ok(html.includes('function renderBonusSkillGameBlock('));
});
test('decoration selectors retain their original data bindings', () => {
  const css = extractStyle('flamme-ui-skill-deco-readability-stage7');
  assert.ok(css.includes('#armorSelectors .slot-line select.decoSel'));
  assert.ok(css.includes('#charmEditor .charm-deco-row select.decoSel'));
  assert.ok(css.includes('min-height:42px!important'));
  assert.ok(html.includes('function bindInlineDecos('));
  assert.ok(html.includes('data-deco-kind='));
});

test('save-build name is full-width at phone and tablet widths', () => {
  const css = extractStyle('flamme-ui-save-layout-stage8');
  assert.ok(css.includes('#buildName'));
  assert.ok(css.includes('min-height:42px'));
  assert.ok(css.includes('@media (max-width:1120px)'));
  assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
  assert.ok(css.includes('grid-column:1/-1'));
  assert.ok(html.includes('id="saveBuild"'));
  assert.ok(html.includes('id="clearBuildName"'));
});

test('owner review keeps desktop chapters equal and desktop skill blocks in two columns', () => {
  const css = extractStyle('flamme-ui-owner-review-stage9');
  assert.ok(css.includes('@media (min-width:1121px)'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important'));
  assert.ok(css.includes('#skillWorkspaceRight #skillOutput .skill-game-grid'));
  assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
  assert.ok(html.includes('id="armorBuildWorkspace"'));
  assert.ok(html.includes('id="skillOutput"'));
});
test('consumer UI hides diagnostics without deleting comparison results or calculations', () => {
  const css = extractStyle('flamme-ui-owner-review-stage9');
  for (const selector of ['#weaponKindDiag', '#powerCoverageDetails',
    '#comparisonReadiness', '#comparisonVerifiedTransfer',
    'tr[data-comparison-metric="relative-power-100"]',
    'tr[data-comparison-metric="relative-max-power-100"]']) {
    assert.ok(css.includes(selector), 'missing consumer UI separation: ' + selector);
  }
  assert.ok(html.includes('data-comparison-metric="power-index"'));
  assert.ok(html.includes('data-comparison-metric="max-power-index"'));
  assert.ok(html.includes('function renderCompareTableChunk('));
  assert.ok(html.includes('function renderArtia('));
  assert.ok(!html.includes('防具・護石は④の左ペインで編集します。'));
});
