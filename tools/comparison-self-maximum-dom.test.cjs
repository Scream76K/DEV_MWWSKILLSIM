const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
function setup(t){
 const d=new JSDOM(readSimulatorHtml(),{url:'https://self-maximum.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
 t.after(()=>d.window.close());return d.window;
}
const channel=(physical,element,special=0)=>{
 const value=physical+element+special;
 return {execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value}},components:[{id:'body',status:'available',value,details:{physical,element,fixed:special}}]};
};
const pending={execution:{status:'pending',reason:'PIPELINE_UNAVAILABLE'}};
const row=(name,normal=pending,maximum=pending)=>({name,kind:'great-sword',elementType:'fire',power:{},oneHitPipeline:{channels:{normal,maximum}}});
const metric=(w,key)=>w.document.querySelector('[data-comparison-metric="'+key+'"]');
const vals=(w,key)=>Array.from(metric(w,key).querySelectorAll('td'),td=>td.textContent);
function render(w,rows){w.qa=rows;w.eval('lastBuildComparisonRows=qa;lastBuildComparisonBaselineIndex=0;renderCachedBuildComparison()');}
test('maximum total and its parts use each column’s own normal; picker does not affect those rows',t=>{
 const w=setup(t), rows=[
  row('A',channel(80,20),channel(100,24)),
  row('B',channel(140,60),channel(140,40))
 ];
 const before=JSON.stringify(rows);render(w,rows);
 const check=()=>{
  assert.deepEqual(vals(w,'power-index'),['100.0','200.0']);
  assert.deepEqual(vals(w,'max-power-index'),['124.0\n+24.0%','180.0\n−10.0%']);
  assert.equal(metric(w,'consumer-relative-maximum'),null);
  assert.deepEqual(vals(w,'consumer-normal-physical'),['80.0','140.0']);
  assert.deepEqual(vals(w,'consumer-normal-element'),['20.0','60.0']);
  assert.deepEqual(vals(w,'consumer-maximum-physical'),['100.0\n+25.0%','140.0\n0.0%']);
  assert.deepEqual(vals(w,'consumer-maximum-element'),['24.0\n+20.0%','40.0\n−33.3%']);
  assert.ok(metric(w,'consumer-relative-normal').hidden);
  assert.equal(metric(w,'consumer-normal-special'),null);
  assert.equal(metric(w,'consumer-maximum-special'),null);
  assert.match(metric(w,'max-power-index').querySelector('th').textContent,/最大火力（通常火力比）/);
 };
 check();
 const picker=w.document.getElementById('comparisonBaseline');assert.ok(picker.closest('[hidden]'),'export baseline is not a beta control');
 for(const td of metric(w,'max-power-index').querySelectorAll('td')){
  assert.ok(td.querySelector('.compare-damage-value'));
  assert.match(td.querySelector('.compare-damage-delta').textContent,/^[+−]?[0-9.]+%$/);
 }
 picker.value='1';picker.dispatchEvent(new w.Event('change',{bubbles:true}));
 check();
 assert.deepEqual(vals(w,'consumer-relative-normal'),['50.0','100.0']);
 assert.equal(JSON.stringify(rows),before);
});
test('missing and zero denominators show a dash without discarding raw values or nonzero special',t=>{
 const w=setup(t);
 render(w,[row('Zero',channel(0,0),channel(0,0,7)),row('Missing',undefined,channel(10,0)),row('Pending',channel(8,0),undefined)]);
 assert.deepEqual(vals(w,'max-power-index'),['7.0\n—','10.0\n—','—']);
 assert.deepEqual(vals(w,'consumer-maximum-element'),['0.0\n—','0.0\n—','未算出']);
 assert.deepEqual(vals(w,'consumer-normal-special'),['0.0','未算出','0.0']);
 assert.deepEqual(vals(w,'consumer-maximum-special'),['7.0\n—','0.0\n—','未算出']);
 assert.doesNotMatch(w.document.getElementById('compareOut').textContent,/Infinity|NaN/);
});
test('calculate from unrounded inputs and retain positive normal-only special in both sections',t=>{
 const w=setup(t);
 render(w,[row('Precision',channel(1.026,0,0.01),channel(1.076,0)),row('Zero max',channel(12,0,2),channel(0,0))]);
 assert.deepEqual(vals(w,'power-index'),['1.0','14.0']);
 assert.deepEqual(vals(w,'max-power-index'),['1.1\n+3.9%','0.0\n−100.0%']);
 assert.deepEqual(vals(w,'consumer-maximum-physical'),['1.1\n+4.9%','0.0\n−100.0%']);
 assert.deepEqual(vals(w,'consumer-maximum-special'),['0.0\n−100.0%','0.0\n−100.0%']);
});
