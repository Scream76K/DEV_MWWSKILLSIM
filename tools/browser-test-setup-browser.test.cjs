'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const {installLocalModules} = require('./browser-test-setup.cjs');
const root = path.resolve(__dirname, '..');

async function fixture(t) {
  const browser = await chromium.launch({headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? {
    executablePath: process.env.CHROMIUM_EXECUTABLE,
    args: JSON.parse(process.env.CHROMIUM_ARGS || '["--no-sandbox"]')
  } : {})});
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.route('**/*', route => route.request().url() === 'https://simulator.test/'
    ? route.fulfill({contentType: 'text/html', body: fs.readFileSync(path.join(root, 'index.html'), 'utf8')})
    : route.abort());
  await installLocalModules(page);
  await page.goto('https://simulator.test/');
  return page;
}

test('browser fixture loads delivered root and nested production scripts unchanged', async t => {
  const page = await fixture(t);
  const available = await page.evaluate(() => ({
    adapter: typeof window.MHWRealOneHitBrowserAdapter?.evaluateCurrent,
    cache: typeof window.MHWLocalDBCache?.validateData,
    presentation: typeof window.MHWUnresolvedDamagePresentation?.makeUnresolvedDamagePresentation
  }));
  assert.deepEqual(available, {adapter: 'function', cache: 'function', presentation: 'function'});
  for (const name of ['skill-calculation-policy.js', 'ui/local-mhdb-cache.js', 'ui/unresolved-damage-presentation.browser.js']) {
    const body = await page.evaluate(async name => (await fetch('/' + name)).text(), name);
    assert.equal(body, fs.readFileSync(path.join(root, name), 'utf8'), name);
  }
});

test('browser fixture keeps external data, non-script files and missing modules blocked', async t => {
  const page = await fixture(t);
  const blocked = await page.evaluate(async () => Promise.all([
    'https://external.invalid/skills.js', '/package.json', '/missing.js', '/ui/missing.js'
  ].map(async url => { try { await fetch(url); return false; } catch { return true; } })));
  assert.deepEqual(blocked, [true, true, true, true]);
});
