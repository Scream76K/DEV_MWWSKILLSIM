'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');

test('beta headings follow the weapon, armor/charm, skills, save and compare order',()=>{
 const dom=new JSDOM(html);
 try{
  const doc=dom.window.document;
  const numbered=[...doc.querySelectorAll('main summary.card-summary')]
    .map(x=>x.textContent.trim()).filter(x=>/^[①②③④⑤⑥⑦⑧⑨⑩]/.test(x));
  assert.deepEqual(numbered,[
   '① データ取得','② ビルド読込','③ 武器登録','④ 防具・護石登録','⑤ スキル構成',
   '⑥ ビルド保存','⑦ ビルド火力比較','⑧ コンボ火力',
   '⑨ シリーズスキルから装備を提案 v7.1.0','⑩ AI装備相談',
  ]);
  const headingOf=id=>doc.getElementById(id).closest('details').querySelector(':scope > summary').textContent.trim();
  assert.equal(headingOf('weapon'),'③ 武器登録');
  assert.equal(headingOf('armorSelectors'),'④ 防具・護石登録');
  assert.equal(headingOf('charmEditor'),'④ 防具・護石登録');
  assert.equal(headingOf('skillOutput'),'⑤ スキル構成');
  assert.equal(headingOf('buildName'),'⑥ ビルド保存');
  assert.equal(headingOf('comparisonForm'),'⑦ ビルド火力比較');
  assert.match(doc.querySelector('header .muted').textContent,/①〜⑥.*⑦ ハンターズサポート/);
  assert.match(doc.querySelector('#buildLoadCard .muted').textContent,/③「武器登録」/);
  assert.match(doc.getElementById('buildName').closest('details').querySelector('.muted').textContent,/⑦「ビルド火力比較」/);
  assert.match(doc.getElementById('comparisonInputGuide').textContent,/^⑥で保存.*⑥で保存し直/);
 }finally{dom.window.close();}
});
