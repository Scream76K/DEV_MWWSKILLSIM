// Browser fixtures serve production local scripts, while leaving external data blocked.
const fs = require('node:fs');
const path = require('node:path');
async function installLocalModules(page) {
  await page.route('https://simulator.test/**/*.js', async route => {
    const url = new URL(route.request().url());
    const filename = path.basename(url.pathname);
    // The delivered page also imports production scripts from ui/. Keep other paths blocked.
    if (url.pathname !== '/' + filename && url.pathname !== '/ui/' + filename) return route.abort();
    const file = path.join(__dirname, '..', url.pathname);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.abort();
    return route.fulfill({contentType: 'text/javascript', body: fs.readFileSync(file, 'utf8')});
  });
}
module.exports = {installLocalModules};
