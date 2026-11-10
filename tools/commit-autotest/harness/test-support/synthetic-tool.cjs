'use strict';
// Tiny, invented inputs for Git binding and tamper-rejection tests only.
// These bytes are not MHDB records, product code, or numeric game evidence.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function createSyntheticTool(root, sourceRoot) {
  const write = (relative, bytes) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  };
  const json = (relative, value) => write(relative, JSON.stringify(value));
  for (const relative of [
    'harness/commit-snapshot.cjs', 'harness/run-commit.cjs',
    'run-commit.sh', 'run-isolated.sh', 'run-all.sh',
    'input/tools/dom-test-setup.cjs'
  ]) write(relative, fs.readFileSync(path.join(sourceRoot, relative)));
  const code = {
    'index.html': '<!doctype html><script src="element-state.js"></script><script src="ui/fixture.js"></script>\n',
    'element-state.js': '// Synthetic input. Never evaluated by snapshot unit tests.\n',
    'ui/fixture.js': '// Synthetic nested file.\n'
  };
  for (const [name, bytes] of Object.entries(code)) write('input/' + name, bytes);
  write('input/normalized-data.json', '{"synthetic":true}\n');
  write('contracts/extracted-converter.js', '// Synthetic converter identity only.\n');
  json('harness/skill-sources/classification.candidate.json', { synthetic: true });
  json('harness/oracle/synthetic.json', { synthetic: true });
  json('contracts/database-provenance.json', { status: 'SYNTHETIC_UNIT_TEST_ONLY' });
  json('contracts/converter-provenance.json', { status: 'SYNTHETIC_UNIT_TEST_ONLY' });
  json('dependencies/package.json', { private: true, dependencies: {} });
  const fileHash = name => hash(fs.readFileSync(path.join(root, name)));
  const codeFiles = Object.entries(code).map(([name, bytes]) => ({ path: name, sha256: hash(bytes) }));
  json('contracts/baseline.json', {
    schemaVersion: 1, sourceCommit: '0'.repeat(40), codeFiles,
    databaseSha256: fileHash('input/normalized-data.json'),
    converterSha256: fileHash('contracts/extracted-converter.js'),
    classificationSha256: fileHash('harness/skill-sources/classification.candidate.json'),
    oracleFiles: { 'oracle/synthetic.json': fileHash('harness/oracle/synthetic.json') },
    loaderSha256: fileHash('input/tools/dom-test-setup.cjs'), excludedScriptSources: []
  });
  const inputs = [...codeFiles, ...['normalized-data.json', 'tools/dom-test-setup.cjs'].map(name => ({
    path: name, sha256: fileHash('input/' + name)
  }))];
  json('input-manifest.json', inputs);
  json('harness/expected-inputs.json', inputs);
  return root;
}

module.exports = { createSyntheticTool };
