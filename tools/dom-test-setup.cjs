const fs = require('node:fs');
const path = require('node:path');

// JSDOM executes inline scripts synchronously, but these offline fixtures do not
// fetch external resources. Preserve the real page's local script order instead
// of silently exercising the inline code without its production modules.
function readSimulatorHtml({excludeLocalScripts=[]}={}) {
  const excluded = new Set(excludeLocalScripts);
  const found = new Set();
  const root = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(
    /<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
    (tag, before, src, after) => {
      if (/^(?:[a-z]+:)?\/\//i.test(src)) return tag;
      const filename = path.resolve(root, src);
      if (!filename.startsWith(root + path.sep)) throw new Error('Script outside fixture root: ' + src);
      if (excluded.has(path.relative(root, filename))) {
        found.add(path.relative(root, filename));
        return ''; // Deliberately absent module, never a replacement implementation.
      }
      const source = fs.readFileSync(filename, 'utf8').replace(/<\/script/gi, '<\\/script');
      return `<script${before}${after}>\n${source}\n</script>`;
    }
  );
  for (const filename of excluded) if (!found.has(filename)) throw new Error('Unknown excluded local script: ' + filename);
  return html;
}
module.exports = { readSimulatorHtml };
