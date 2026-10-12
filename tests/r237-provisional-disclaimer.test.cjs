'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
test('r237 comparison readiness explains provisional values and in-game discrepancy',()=>{
  assert.match(html,/id="comparisonReadiness"[\s\S]{0,700}暫定採用/);
  assert.match(html,/id="comparisonReadiness"[\s\S]{0,800}ゲーム内の実ダメージと一致しない場合/);
});
test('r237 comparison results preserve reference-value caveat',()=>{
  assert.match(html,/AのNORMALを唯一の比較基準とします。暫定採用データを含む参考値/);
});
