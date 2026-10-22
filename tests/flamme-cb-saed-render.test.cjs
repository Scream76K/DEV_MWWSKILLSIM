'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=source.indexOf('function renderSaedReferenceComparison(');
const end=source.indexOf('function comparisonPowerViewModel(',start);
assert.ok(start!==-1&&end>start,'production SAED renderer absent');
const render=new Function('esc',source.slice(start,end)+';return renderSaedReferenceComparison;')(
  v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;'));
test('SAED reference displays real values and holds pending conditions',()=>{
  const input={saedReference:{A:{NORMAL:{status:'REFERENCE_ONLY',total:612.5},MAX:{status:'PENDING',reason:'CB_SAED:SOURCE_REQUIRED'}},
    B:{NORMAL:{status:'REFERENCE_ONLY',total:687.5},MAX:{status:'REFERENCE_ONLY',total:700}}}};
  const html=render(input,['A','B']);
  for(const expected of ['612.5','687.5','700.0','CB_SAED:SOURCE_REQUIRED','火力指数には加算していません'])assert.ok(html.includes(expected),expected);
});
test('SAED reference HTML escapes unexpected reason text',()=>{
  const html=render({saedReference:{A:{NORMAL:{status:'PENDING',reason:'<bad>'}}}});
  assert.ok(html.includes('&lt;bad>'));assert.ok(!html.includes('<bad>'));
});
