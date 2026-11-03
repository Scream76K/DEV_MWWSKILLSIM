'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
test('saved comparison forwards independent H start condition',()=>{
  const start=html.indexOf('function chargeBladeStateFromBuildStats(');
  const end=html.indexOf('function chargeBladeStatsFromCalcState(',start);
  assert.ok(start>=0&&end>start);
  const f=Function(html.slice(start,end)+';return chargeBladeStateFromBuildStats;')();
  const state=f({rapidMorphLevel:2},{phialType:'IMPACT',mixMode:'INDEPENDENT',mixH:{mode:'SWORD',normalPhials:3,enhancedPhials:2}});
  assert.equal(state.mixMode,'INDEPENDENT');
  assert.equal(state.mixH.mode,'SWORD');
  assert.equal(state.mixH.normalPhials,3);
  assert.equal(state.mixH.enhancedPhials,2);
  assert.equal(state.rapidMorphLevel,2);
});
