'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(process.env.PRODUCT_ROOT || path.join(__dirname, '..'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const compact = value => value.replace(/\s/g, '');
const children = element => [...element.children].map(node => node.id);
const oneColumn = 'minmax(0,1fr)';
const wideColumns = 'minmax(0,3fr)minmax(0,2fr)';

test('only Armor/Charm and Skills use the 6:4 row at every viewport; build and support otherwise stack', () => {
  const { window } = new JSDOM(html);
  try {
    const { document } = window;
    const workspace = document.querySelector('main.wrap > #betaWorkspaceGrid');
    assert.ok(workspace);
    assert.deepEqual(children(workspace), ['betaBuildPanel', 'betaSupportPanel']);
    const row = workspace.querySelector('#betaBuildPanel > #armorBuildWorkspace');
    assert.ok(row);
    assert.deepEqual(children(row), ['armorWorkspaceLeft', 'skillWorkspaceRight']);
    assert.match(row.previousElementSibling.querySelector('summary').textContent.trim(), /^③\s*武器登録$/u);
    assert.match(row.nextElementSibling.querySelector('summary').textContent.trim(), /^⑥\s*ビルド保存$/u);
    assert.ok(workspace.querySelector('#betaSupportPanel #comparisonForm'));
    const sheet = document.querySelector('#flamme-ipad-build-skills-layout').sheet;
    const rules = [...sheet.cssRules];
    const grid = (items, selector, columns) => {
      const rule = items.find(x => x.selectorText === selector);
      assert.ok(rule, 'missing CSS rule: ' + selector);
      assert.equal(compact(rule.style.getPropertyValue('grid-template-columns')), columns);
      assert.equal(rule.style.getPropertyPriority('grid-template-columns'), 'important');
    };
    grid(rules, 'main.wrap > #betaWorkspaceGrid', oneColumn);
    grid(rules, '#betaBuildPanel > #armorBuildWorkspace', wideColumns);
    const support = rules.find(x => x.selectorText === '#betaSupportPanel');
    assert.equal(compact(support.style.getPropertyValue('grid-column')), '1/-1');
    // No orientation, hover or touch exception may override the inner split.
    for (const media of rules.filter(x=>x.type===4)) {
      for (const rule of media.cssRules) {
        assert.ok(!rule.style?.getPropertyValue('grid-template-columns')||!rule.selectorText?.includes('#armorBuildWorkspace'));
      }
    }
  } finally {
    window.close();
  }
});

function app() {
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', err => errors.push(err.message));
  const { readSimulatorHtml } = require(path.join(root, 'tools/dom-test-setup.cjs'));
  const { window } = new JSDOM(readSimulatorHtml(), {
    url: 'https://armor-skill-layout.test',
    runScripts: 'dangerously',
    virtualConsole,
    beforeParse(w) {
      w.fetch = () => Promise.reject(Error('offline test'));
      w.structuredClone = global.structuredClone;
    },
  });
  return { window, errors };
}

test('skill overview opens at current level; every level opens separately and descriptions stay text', () => {
  const { window, errors } = app();
  try {
    const d = window.document;
    const output = d.getElementById('skillOutput');
    window.__syntheticSkillRows = [
      {
        id: 701, name: '武器スキル <em>&</em>', kind: 'weapon', description: '概要 <b>文字</b>',
        ranks: [{ level: 3, description: '3段階' }, { level: 1, description: '<q>1段階</q>' },
          { level: 2, description: '今の効果' }, { level: 0, description: '無効な段階' }],
      },
      {
        id: 702, name: 'シリーズ <em>効果</em>', kind: 'set', description: 'シリーズ説明',
        ranks: [{ level: 1, setPiecesRequired: 2, description: '2部位の効果' },
          { level: 2, setPiecesRequired: 4, description: '4部位の効果' }],
      },
      { id: 703, name: 'データなし', kind: 'armor', ranks: [] },
    ];
    output.innerHTML = window.eval("DB.skills=__syntheticSkillRows; renderSkillGameBlock(DB.skills[0].name,2)+renderBonusSkillGameBlock(DB.skills[1].name,4,4,{bonusSkillId:702,rankLevel:2})+renderSkillGameBlock(DB.skills[2].name,1)");
    const all = [...output.querySelectorAll('details.skill-info')];
    assert.equal(all.length, 2);
    const [normal, bonus] = all;
    const normalSummary = normal.querySelector(':scope > summary');
    const ranks = normal.querySelector('details.skill-ranks');
    const ranksSummary = ranks.querySelector(':scope > summary');
    assert.equal(normal.open, false);
    assert.equal(ranks.open, false);
    assert.equal(bonus.open, false);
    normalSummary.click();
    assert.equal(normal.open, true);
    assert.equal(ranks.open, false);
    assert.match(normalSummary.textContent, /武器スキル <em>&<\/em>Lv2/u);
    assert.equal(normalSummary.querySelector('em'), null);
    const body = normal.querySelector('.skill-info-body');
    assert.ok(body.textContent.includes('概要 <b>文字</b>'));
    assert.match(body.querySelector(':scope > p:nth-child(2)').textContent, /Lv2の効果.*今の効果/u);
    assert.equal(body.querySelector('b'), null);
    assert.equal(ranksSummary.textContent, '全Lvの効果を見る');
    ranksSummary.click();
    assert.equal(ranks.open, true);
    assert.equal(normal.open, true);
    assert.deepEqual([...ranks.querySelectorAll('li strong')].map(x => x.textContent), ['Lv1', 'Lv2', 'Lv3']);
    assert.equal(ranks.querySelector('li[aria-current="true"] strong').textContent, 'Lv2');
    assert.ok(ranks.textContent.includes('<q>1段階</q>'));
    assert.equal(ranks.querySelector('q'), null);
    assert.equal(bonus.querySelector('.skill-ranks-toggle').textContent, '全段階の効果を見る');
    assert.equal(bonus.querySelector('li[aria-current="true"] strong').textContent, '4部位');
    assert.deepEqual(errors, []);
  } finally {
    window.close();
  }
});

test('⑤ heroics checkbox defaults OFF and synchronizes the unchanged HP values', () => {
  const { window, errors } = app();
  try {
    const d = window.document;
    const toggle = d.querySelector('#skillWorkspaceRight input[type="checkbox"]#powerHeroicsToggle');
    const bridge = d.querySelector('#skillWorkspaceRight select#powerSelectedHp');
    assert.ok(toggle && bridge);
    assert.equal(d.querySelector('label[for="powerHeroicsToggle"]').textContent, '火事場（HP30%以下）');
    assert.equal(bridge.closest('label').hidden, true);
    assert.deepEqual([...bridge.options].map(x => x.value), ['FULL_HP', 'AT_OR_BELOW_30_PERCENT']);
    assert.equal(toggle.checked, false);
    assert.equal(bridge.value, 'FULL_HP');
    toggle.click();
    assert.equal(bridge.value, 'AT_OR_BELOW_30_PERCENT');
    toggle.click();
    assert.equal(bridge.value, 'FULL_HP');
    bridge.value = 'AT_OR_BELOW_30_PERCENT';
    bridge.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(toggle.checked, true);
    assert.deepEqual(errors, []);
  } finally {
    window.close();
  }
});
