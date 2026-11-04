'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {makeUnresolvedDamagePresentation: present} =
  require('../ui/unresolved-damage-presentation.cjs');

test('known internal error becomes concise Japanese without replacing unavailable status', () => {
  const result=present({status:'unavailable',reason:'BLACK_ECLIPSE_NORMAL_STATE_REQUIRED',value:null});
  assert.equal(result.status,'unavailable');
  assert.equal(result.summary,'必要な発動状態が確認できないため、火力は保留中です。');
  assert.equal(result.technicalReason,'BLACK_ECLIPSE_NORMAL_STATE_REQUIRED');
  assert.equal(result.showTechnicalDetails,true);
  assert.equal('value' in result,false);
});
test('preserves technical reasons with prefixes and variable suffixes', () => {
  const result=present({status:'unavailable',reason:'REAL_SLICE:TECHNIQUE_NOT_FOUND:bow_shot'});
  assert.equal(result.summary,'選択された技の計算データが見つかりません。');
  assert.equal(result.technicalReason,'REAL_SLICE:TECHNIQUE_NOT_FOUND:bow_shot');
});
test('unknown errors have nontechnical default summary, detail remains available', () => {
  const result=present({status:'unavailable',reason:'NEW_INTERNAL_CODE'});
  assert.equal(result.summary,'計算に必要な条件を確認できないため、火力は保留中です。');
  assert.equal(result.technicalReason,'NEW_INTERNAL_CODE');
});
test('missing reason never turns unavailable into zero', () => {
  const result=present({status:'unavailable',value:0});
  assert.equal(result.status,'unavailable');
  assert.equal(result.summary,'火力は現在未算出です。');
  assert.equal(result.technicalReason,null);
  assert.equal('value' in result,false);
});
test('available result does not acquire an unavailable notice', () => {
  const result=present({status:'available',value:512.3,reason:'STALE'});
  assert.equal(result.status,'available');
  assert.equal(result.summary,null);
  assert.equal(result.showTechnicalDetails,false);
});
test('missing or malformed result is unknown, never fabricated available', () => {
  for(const input of [null,undefined,{},'invalid',{status:'complete'}]){
    const result=present(input);
    assert.equal(result.status,'unknown');
    assert.equal(result.summary,'火力は現在未算出です。');
  }
});
test('does not mutate source result and makes frozen output', () => {
  const original=Object.freeze({status:'unavailable',reason:'COMPONENT_UNAVAILABLE',value:null});
  const result=present(original);
  assert.equal(Object.isFrozen(result),true);
  assert.equal(original.reason,'COMPONENT_UNAVAILABLE');
  assert.equal(result.summary,'計算に必要なダメージ成分が揃っていません。');
});

test('browser module mirrors Node presentation and exposes a single safe global', () => {
  const fs=require('node:fs');
  const path=require('node:path');
  const vm=require('node:vm');
  const browserSource=fs.readFileSync(path.join(__dirname,'..','ui/unresolved-damage-presentation.browser.js'),'utf8');
  const browser={};
  vm.runInNewContext(browserSource,{window:browser},{timeout:5000});
  const browserPresent=browser.MHWUnresolvedDamagePresentation?.makeUnresolvedDamagePresentation;
  assert.equal(typeof browserPresent,'function');
  for(const input of [
    {status:'unavailable',reason:'REAL_SLICE:TECHNIQUE_NOT_FOUND:bow_shot'},
    {status:'unavailable',reason:'COMPONENT_UNAVAILABLE'},
    {status:'unavailable',reason:'BLACK_ECLIPSE_NORMAL_STATE_REQUIRED'},
    {status:'unavailable',reason:'UNKNOWN_REASON'},
    {status:'unavailable',reason:null},
    {status:'available',value:525.4}
  ]){
    assert.deepEqual(JSON.parse(JSON.stringify(browserPresent(input))),
      JSON.parse(JSON.stringify(present(input))));
  }
});
test('index.html loads browser presentation before the build-summary rendering code', () => {
  const fs=require('node:fs'),path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const script='<script src="./ui/unresolved-damage-presentation.browser.js"></script>';
  assert.equal(html.split(script).length,2);
  assert.ok(html.indexOf(script)<html.indexOf('function renderSummary()'));
  assert.ok(html.includes('const oneUnresolvedSummary=(reason)=>'));
  assert.ok(html.includes('window.MHWUnresolvedDamagePresentation?.makeUnresolvedDamagePresentation'));
  assert.ok(html.includes("return '未算出（'+oneUnresolvedSummary(reason)+'）'"));
  assert.ok(html.includes("const oneText=one.status==='OK'?"));
  assert.ok(html.includes('<details class="one-hit-diagnostics">'));
});
