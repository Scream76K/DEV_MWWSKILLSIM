'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {manifest}=require('../tools/capture-manifest.cjs');
test('14武器種の撮影管理票を生成する',()=>{const m=manifest();assert.equal(m.weaponCount,14);assert.equal(new Set(m.entries.map(x=>x.id)).size,14);});
test('固定比較8・参考1・保留5を区別する',()=>{const counts={};for(const e of manifest().entries)counts[e.status]=(counts[e.status]||0)+1;assert.deepEqual(counts,{STANDARD:8,PENDING:5,REFERENCE:1});});
test('撮影データは検証済みに自動昇格しない',()=>{const m=manifest();assert.equal(m.evidenceStatus,'AWAITING_INGAME');assert.ok(m.entries.every(e=>!e.verified&&e.filename.endsWith('.mp4')));});
