const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const source=fs.readFileSync(process.env.UI_SOURCE||path.join(__dirname,'..','index.html'),'utf8');
function extract(name){
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,'missing function: '+name);
  const end=source.indexOf('\nfunction ',start+1);
  return source.slice(start,end<0?undefined:end);
}
const context={esc:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')};
vm.createContext(context);
for(const name of ['equipmentElementPendingReason','equipmentElementDisplay','isChargeBladeKind','comparisonPowerIndex','comparisonPowerChange','comparisonDisplayNumber','comparisonChangeText','comparisonReasonText','comparisonReadinessHtml','comparisonDpsValue','comparisonDpsIndex','renderCompareTableChunk','comparisonCoverageReason','comparisonCoverageSummary','renderCompareTable','referenceComboChange'])vm.runInContext(extract(name),context);
function row(name,normal,maximum){
  return {name,kind:'great-sword',attack:200,attackTrue:200,affinity:20,maxAffinity:50,element:0,elementType:'none',elementKnown:true,typeKnown:true,damage:10,dps:null,dpsStatus:'NOT_CALCULATED',dpsReason:'COMBO_NOT_SELECTED',power:{profileId:'UI_FIXTURE',normal:{comparisonPower:normal,physical:normal,element:0,special:0},maximum:maximum==null?null:{comparisonPower:maximum,physical:maximum,element:0,special:0},maximumReason:maximum==null?'MAX_FIXTURE':null}};
}
function visible(markup){
  return markup.replace(/<div class="comparison-development-tools" hidden>[\s\S]*?<\/div>(?=<pre id="comparisonReportOut")/,'').replace(/<[^>]*>/g,' ');
}
function metric(markup,name){return markup.match(new RegExp('<tr data-comparison-metric="'+name+'">([\\s\\S]*?)</tr>'))?.[1];}
test('missing DPS does not present fixed-route firepower as pending',()=>{
  const rows=[row('A',100,150),row('B',120,180)];
  const h=context.renderCompareTable(rows),text=visible(h);
  assert.doesNotMatch(text,/⑦|コンボ登録|DPS|算出不能/);
  assert.doesNotMatch(h,/data-comparison-pending=/);
  assert.match(text,/通常 2\/2件 ／ 最大 2\/2件/);
  assert.match(h,/id="comparisonReportDownload"/);
  assert.match(h,/id="comparisonBaseline"/);
});
test('comparison renders firepower without DPS or reference DPS metrics',()=>{
  const rows=[row('A',100,150),{...row('B',120,180),dps:60,dpsStatus:'VERIFIED',referenceDps:59,referenceDpsStatus:'PROVISIONAL_REFERENCE',comboVerification:{referenceDpsStatus:'PROVISIONAL_REFERENCE'}}];
  const h=context.renderCompareTable(rows);
  for(const name of ['dps','dps-index','dps-change','reference-dps'])assert.equal(metric(h,name),undefined,name+' must not be shown');
  assert.match(metric(h,'power-index'),/100\.0/);
  assert.match(metric(h,'max-power-index'),/180\.0/);
});
test('maximum-only blocker is counted once and leaves ordinary values intact on baseline change',()=>{
  const rows=[row('A',100,150),row('B',120,null)];
  const a=context.renderCompareTable(rows),b=context.renderCompareTable(rows,{baselineIndex:1});
  assert.match(visible(a),/比較保留の原因を確認（1項目）/);
  assert.match(a,/MAX_FIXTURE/);
  assert.equal(metric(a,'power-index'),metric(b,'power-index'));
  assert.equal(metric(a,'max-power-index'),metric(b,'max-power-index'));
  assert.match(visible(a),/通常 2\/2件 ／ 最大 1\/2件/);
});
test('default JSON coverage retains DPS and the original pending entries',()=>{
  const rows=[row('A',100,150),row('B',120,null)];
  const before=JSON.stringify(rows);
  const coverage=JSON.parse(JSON.stringify(context.comparisonCoverageSummary(rows,rows[0])));
  assert.equal(coverage.dps,0);
  assert.deepEqual(coverage.pending.map(x=>({name:x.name,metric:x.metric,reason:x.reason})),[
    {name:'A',metric:'dps',reason:'COMBO_NOT_SELECTED'},
    {name:'B',metric:'maximum',reason:'MAX_FIXTURE'},
    {name:'B',metric:'dps',reason:'COMBO_NOT_SELECTED'}
  ]);
  context.renderCompareTable(rows);
  assert.equal(JSON.stringify(context.comparisonCoverageSummary(rows,rows[0])),JSON.stringify(coverage));
  assert.equal(JSON.stringify(rows),before);
});
