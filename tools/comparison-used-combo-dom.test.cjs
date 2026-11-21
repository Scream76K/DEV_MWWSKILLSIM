const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
function setup(t){
  const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
  t.after(()=>dom.window.close());
  const w=dom.window;
  w.MHWRealOneHitBrowserAdapter={...w.MHWRealOneHitBrowserAdapter,usedComboSteps:r=>displaySteps.get(r?.execution)||null};
  return w;
}
const displaySteps=new WeakMap();
const channel=steps=>{const result={execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value:42}},diagnostics:{}};if(steps)displaySteps.set(result.execution,steps);return result;};
const row=(name,n,m=n)=>({name,kind:'great-sword',power:{},oneHitPipeline:{channels:{normal:n,maximum:m}}});
const out=w=>w.document.getElementById('compareOut');
const panel=w=>out(w).querySelector('[data-used-combo]');
function render(w,rows){out(w).innerHTML=w.renderCompareTable(rows);assert.ok(panel(w),'the combo panel is present');return panel(w);}
test('show the executed sequence once, visibly before the comparison table, when all results match',t=>{
  const w=setup(t),c=channel(['技A','技B']),p=render(w,[row('A',c),row('B',c)]);
  assert.ok(p.compareDocumentPosition(out(w).querySelector('table'))&w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.equal(p.querySelector('h4').textContent,'計算に使用したコンボ');
  assert.equal(p.querySelectorAll('.used-combo-entry').length,1);
  assert.match(p.textContent,/技A → 技B/);
  assert.doesNotMatch(p.textContent,/通常：|最大：/);
});
test('escape names and techniques, split different normal/maximum channels, and distinguish unconfirmed from uncalculated',t=>{
  const w=setup(t),p=render(w,[row('<img src=x>',channel(['<b>技</b>']),channel(['強化技'])),row('B',channel(null),{execution:{status:'pending'}})]);
  assert.equal(p.querySelectorAll('.used-combo-entry').length,2);
  assert.equal(p.querySelector('img'),null);
  assert.match(p.textContent,/<img src=x>.*通常：<b>技<\/b>.*最大：強化技/);
  assert.match(p.textContent,/B.*通常：コンボ未確認.*最大：未算出/);
});
test('show independent charge blade routes without presenting them as one sequence',t=>{
  const w=setup(t), c=channel(null),cb=row('CB',c);
  cb.oneHitPipeline.scope='CB_INDEPENDENT_R_H_SUM';
  cb.oneHitPipeline.routes={R:{channels:{normal:channel(['解放技']),maximum:channel(['解放技'])}},H:{channels:{normal:channel(['高出力技']),maximum:channel(['高出力技'])}}};
  assert.match(render(w,[cb]).textContent,/解放系：解放技.*高出力系：高出力技.*各ルートを別々に計算/);
});
test('baseline changes and resize retain the same combo and invalidation removes it',t=>{
  const w=setup(t);w.qa=[row('A',channel(['技A'])),row('B',channel(['技B']))];
  w.eval('lastBuildComparisonRows=qa;renderCachedBuildComparison()');
  assert.ok(panel(w));const first=panel(w).textContent;
  const baseline=w.document.getElementById('comparisonBaseline');
  baseline.value='1';baseline.dispatchEvent(new w.Event('change',{bubbles:true}));
  w.dispatchEvent(new w.Event('resize'));assert.equal(panel(w).textContent,first);
  w.invalidateComboResults();assert.equal(panel(w),null);
});
test('report export keeps diagnostics but excludes display-only combo data without changing cached rows',t=>{
  const w=setup(t),c=channel(['技A']);
  c.diagnostics.ignoredSkillEffects=[];
  const cb=row('CB',c);cb.oneHitPipeline.scope='CB_INDEPENDENT_R_H_SUM';
  cb.oneHitPipeline.routes={R:{channels:{normal:c,maximum:c}},H:{channels:{normal:c,maximum:c}}};
  w.qa=[cb];w.eval('lastBuildComparisonRows=qa;lastBuildComparisonContext={}');
  const report=JSON.parse(w.eval('JSON.stringify(createBuildComparisonReport())'));
  assert.equal(report.results[0].power.normal.comparisonPower,42);
  assert.deepEqual(report.results[0].oneHitPipeline.channels.normal.diagnostics,{ignoredSkillEffects:[]});
  assert.deepEqual(report.results[0].oneHitPipeline.routes.H.channels.maximum.diagnostics,{ignoredSkillEffects:[]});
  assert.deepEqual(displaySteps.get(c.execution),['技A']);
});
