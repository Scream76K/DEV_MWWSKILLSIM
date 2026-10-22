'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const snapshotStart=src.indexOf('function compareSnapshot(');
const snapshotEnd=src.indexOf('function comparisonReasonText(',snapshotStart);
const tableStart=src.indexOf('function renderCompareTable(');
const tableEnd=src.indexOf('function ',tableStart+20);
assert.ok(snapshotStart>=0&&snapshotEnd>snapshotStart,'live compare snapshot missing');
assert.ok(tableStart>=0&&tableEnd>tableStart,'live compare renderer missing');
test('saved-build live snapshot gets its own ammo loading skill level',()=>{
  const body=src.slice(snapshotStart,snapshotEnd);
  assert.match(body,/ammoLoadingLevel:validCombatSkillLevel\(calcState\.total\|\|\{\},\['砲弾装填'\],2\)/);
  assert.match(body,/saedReference=chargeBladeSaedComparisonChannel\(compareStats,state\)/);
  assert.match(body,/saedReference=\{NORMAL:\{status:'PENDING',reason\},MAX:/);
});
test('real comparison table surfaces SAED but keeps index and DPS separate',()=>{
  const body=src.slice(tableStart,tableEnd);
  assert.match(body,/row\.saedReference\?\.\[mode\]/);
  assert.match(body,/超高出力属性解放斬り（参考ダメージ）/);
  assert.match(body,/火力指数・DPSには加算しません/);
  assert.match(body,/esc\(row\.name\)/);
  assert.match(body,/保留/);
});
