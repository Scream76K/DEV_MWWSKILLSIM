'use strict';
// UI smoke test against the *actual* index.html with its real local scripts and styles.
// Run: npm ci && npx playwright install chromium && npm run test:browser
// This is not a calculation or full integration acceptance test.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

function staticServer() {
  return http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end(); return; }
    const filename = path.resolve(root, '.' + pathname);
    if (filename !== root && !filename.startsWith(root + path.sep)) {
      res.writeHead(403).end(); return;
    }
    const file = pathname.endsWith('/') ? path.join(filename, 'index.html') : filename;
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

test('real document responsive layout and save controls', { timeout: 120000 }, async t => {
  const server = staticServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const baseUrl = 'http://127.0.0.1:' + server.address().port + '/index.html';

  for (const width of [375, 390, 768, 980, 1024, 1120, 1440]) {
    await t.test('width ' + width, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      try {
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const geometry = await page.evaluate(() => {
          const one = selector => {
            const node = document.querySelector(selector);
            if (!node) throw Error('Missing UI element: ' + selector);
            const r = node.getBoundingClientRect();
            return { x: r.x, y: r.y, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width };
          };
          return {
            build: one('main.wrap > .grid > aside'),
            support: one('main.wrap > .grid > section'),
            saveName: one('#buildName'),
            saveButton: one('#saveBuild'),
            clearButton: one('#clearBuildName'),
            bodyWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
            weaponSelectors: document.querySelectorAll('#weaponKindSelectionBlock').length
          };
        });
        assert.equal(geometry.weaponSelectors, 1, 'weapon kind block must be unique');
        assert.ok(geometry.bodyWidth <= geometry.viewportWidth + 1,
          'page-wide horizontal overflow at ' + width + ': ' + JSON.stringify(geometry));
        if (width <= 980) {
          assert.ok(geometry.support.top >= geometry.build.bottom - 2,
            'Build must precede Support vertically: ' + JSON.stringify(geometry));
        } else {
          assert.ok(geometry.support.left >= geometry.build.right - 2,
            'Build and Support must be adjacent: ' + JSON.stringify(geometry));
        }
        if (width <= 1120) {
          assert.ok(geometry.saveButton.top >= geometry.saveName.bottom - 2,
            'Save buttons must be below name input: ' + JSON.stringify(geometry));
          assert.ok(Math.abs(geometry.saveButton.top - geometry.clearButton.top) <= 2,
            'Save/Clear buttons share a row: ' + JSON.stringify(geometry));
        }
      } finally { await page.close(); }
    });
  }
});
