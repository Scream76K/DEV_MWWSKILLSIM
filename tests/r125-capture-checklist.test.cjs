'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {buildChecklist,renderMarkdown}=require('../tools/capture-checklist.cjs');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../R121_CAPTURE_MANIFEST.json')));
test('fourteen unique weapons preserved',()=>{const p=buildChecklist(manifest);assert.equal(p.rows.length,14);assert.equal(new Set(p.rows.map(r=>r.id)).size,14);});
test('HBG has controlled A/B/C capture',()=>{const h=buildChecklist(manifest).rows.find(r=>r.id==='heavy-bowgun');assert.equal(h.priority,'P0');assert.deepEqual(h.shots.map(x=>x.code),['A','B','C']);});
test('no evidence auto verified',()=>{const p=buildChecklist(manifest);assert.equal(p.verificationStatus,'UNVERIFIED');assert.ok(p.rows.every(x=>x.verified===false));});
test('invalid manifest rejected',()=>{assert.throws(()=>buildChecklist({...manifest,entries:manifest.entries.slice(1)}));assert.throws(()=>buildChecklist({...manifest,entries:[...manifest.entries.slice(0,13),manifest.entries[0]]}));});
test('markdown has filenames and conditions',()=>{const s=renderMarkdown(buildChecklist(manifest));assert.match(s,/ファーストショット/);assert.match(s,/フォースショット/);assert.match(s,/r125_heavy-bowgun_C.mp4/);});
