const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const fn=app.slice(app.indexOf('function runBuildCompare(){'),app.indexOf('function aiBuildData(){'));
test('cross-weapon saved builds are blocked before any comparison mutation',()=>{assert.match(fn,/new Set\(kinds\)\.size>1/);assert.ok(fn.indexOf('new Set(kinds).size>1')<fn.indexOf('buildSnapshot()'));});
test('legacy saved builds without authoritative kind are blocked',()=>{assert.match(fn,/kinds\.some/);assert.match(fn,/再保存してください/);});
test('diagnostic has contextual navigation rather than floating overlay',()=>{assert.match(app,/実測A\/B成分診断を開く/);assert.doesNotMatch(app,/position:fixed;right:12px;bottom:12px/);});
