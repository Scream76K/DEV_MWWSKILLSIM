const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const {evaluateObservedFullBurst:e}=require('../gunlance-observed-handler.js');
const evidence=require('../evidence/gunlance-fullburst-observed-r150.json');
test('r151 video 2 rounds yields shelling-only 68 without inventing slash damage',()=>{const r=e({roundDamages:evidence.observedDamagePerRound,loadedRounds:evidence.loadedRounds,evidenceId:'1a11b59b1c696'});assert.equal(r.shellingHits,2);assert.equal(r.shellingDamage,68);assert.equal(r.totalDamage,null);assert.equal(r.totalHits,null);assert.equal(r.dpsReady,false)});
test('r151 confirmed slash component can be supplied independently',()=>{const r=e({roundDamages:[34,34],loadedRounds:2,physicalDamage:40,physicalHits:1,evidenceId:'test'});assert.equal(r.totalDamage,108);assert.equal(r.totalHits,3)});
test('r151 supports changing rounds without fixed hit count',()=>{assert.equal(e({roundDamages:[34,34,34],loadedRounds:4,evidenceId:'test'}).shellingHits,3)});
test('r151 rejects guessed/inconsistent evidence',()=>{assert.throws(()=>e({roundDamages:[34],loadedRounds:1}),/evidenceId/);assert.throws(()=>e({roundDamages:[34],loadedRounds:1,evidenceId:'x',physicalHits:1}),/physicalHits/)});
test('r151 entry point loads handler after observed utility',()=>{const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');assert.ok(html.indexOf('observed-shelling.js')<html.indexOf('gunlance-observed-handler.js'))});
