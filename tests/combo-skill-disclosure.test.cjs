'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.PRODUCT_ROOT||path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const extract=name=>{const start=html.indexOf('function '+name+'(');assert.ok(start>=0);return html.slice(start,html.indexOf('\nfunction ',start+1));};
function setup(){const nodes=Object.fromEntries(['singleTechniqueDamageOut','templateComboDamageOut','userComboDamageOut','comboMovePicker','comboPreset'].map(k=>[k,{innerHTML:'',value:k==='comboPreset'?'preset':'move'}]));const result={damage:10,maximumDamage:12,stages:[],pipeline:{channels:{normal:{diagnostics:{ignoredSkillEffects:[{skillId:24,name:'<Unimplemented>',level:1,reason:'<No evidence>'}],excludedCalculationSkills:[{name:'Owner excluded',reason:'Explicitly excluded'}]}},maximum:{diagnostics:{maximumActivationAssumptions:[{description:'Maximum <clash> assumption; not equipment verified'}],unappliedEffects:[{skillId:137,name:'Unapplied max',level:3,reason:'Effect not verified'}],excludedSkillDamage:[{skill:'Annotation only',referenceRank:'upper',additionalDamage:{status:'available',total:3,fixed:1,element:2,fireHitzone:5}}]}}}}};const c={nodes,result,$:id=>nodes[id],p0DamageRequests:{},comboKind:()=> 'great-sword',selectedWeapon:()=>({}),comboData:()=>({presets:[{id:'preset',moves:['move']}]}),App:{combo:{syncFromDOM(){}},state:{combo:{moves:[{techniqueId:'move'}]}}},evaluateP0DamageRoute:()=>result,esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),comboBlockedMessage:s=>s,damageDisplayNumber:n=>String(n)};vm.createContext(c);for(const n of ['ignoredSkillEffectsDisplay','maximumActivationAssumptionDisplay','excludedSkillDamageDisplay','calcP0Damage'])vm.runInContext(extract(n),c);return c;}
for(const mode of ['single','template'])test(mode+' exposes independent channel skill omissions without changing numbers',()=>{const c=setup(),before=JSON.stringify(c.result),r=c.calcP0Damage(mode),out=c.nodes[{single:'singleTechniqueDamageOut',template:'templateComboDamageOut',user:'userComboDamageOut'}[mode]].innerHTML;assert.ok(out.includes('&lt;Unimplemented&gt;'));assert.ok(out.includes('&lt;No evidence&gt;'));assert.ok(out.includes('Lv1'));assert.ok(out.includes('Unapplied max'));assert.ok(out.includes('Lv3'));assert.ok(out.includes('Owner excluded'));assert.ok(out.includes('Annotation only'));assert.ok(out.includes('Maximum &lt;clash&gt; assumption; not equipment verified'));assert.ok(!out.includes('<Unimplemented>'));assert.equal(r.damage,10);assert.equal(r.maximumDamage,12);assert.equal(JSON.stringify(c.result),before);});
test('user exposes independent channel skill omissions without changing numbers',t=>{
 const {JSDOM,VirtualConsole}=require('jsdom'),{readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
 const dom=new JSDOM(readSimulatorHtml(),{url:'https://skill-disclosure.invalid/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
 t.after(()=>dom.window.close());const w=dom.window,d=w.document;
 const fixture=setup().result;
 for(const [channel,total] of [['normal',10],['maximum',12]]){
  const ch=fixture.pipeline.channels[channel];
  ch.execution={status:'complete'};
  ch.metrics={comboTotalDamage:{status:'available',value:total}};
  ch.components=[{id:'reference',status:'available',value:total,details:{physical:total,element:0}}];
 }
 w.selectedWeapon=()=>({kind:'great-sword'});
 w.eval("App.combo.syncFromDOM=()=>{};App.state.combo.moves=[{techniqueId:'move'}]");
 w.evaluateP0DamageRoute=()=>fixture;
 const legacy=d.getElementById('userComboDamageOut');legacy.innerHTML='';
 const before=JSON.stringify(fixture),r=w.calcUserComboDamage(),out=d.getElementById('compareOut');
 const normal=out.querySelector('[data-combo-skill-channel="normal"]'),maximum=out.querySelector('[data-combo-skill-channel="maximum"]');
 assert.match(normal.innerHTML,/&lt;Unimplemented&gt;/);
 assert.match(normal.innerHTML,/&lt;No evidence&gt;/);
 assert.match(normal.textContent,/Lv1.*Owner excluded/);
 assert.doesNotMatch(normal.textContent,/Unapplied max|Annotation only|Maximum .*clash/);
 assert.match(maximum.textContent,/Unapplied max.*Lv3/);
 assert.match(maximum.textContent,/Annotation only/);
 assert.match(maximum.innerHTML,/Maximum &lt;clash&gt; assumption; not equipment verified/);
 assert.doesNotMatch(maximum.innerHTML,/Unimplemented|Owner excluded/);
 assert.ok(!out.innerHTML.includes('<Unimplemented>'));
 assert.deepEqual([...out.querySelectorAll('[data-custom-damage="total"] td')].map(td=>td.textContent),['10.0','12.0','+20.0%']);
 assert.equal(legacy.innerHTML,'');assert.equal(r.damage,10);assert.equal(r.maximumDamage,12);
 assert.equal(JSON.stringify(fixture),before);
});
test('fully calculable combo does not fabricate a skill-omission warning',()=>{const c=setup();c.result.pipeline.channels.normal.diagnostics={};c.result.pipeline.channels.maximum.diagnostics={};c.calcP0Damage('single');assert.ok(!c.nodes.singleTechniqueDamageOut.innerHTML.includes('data-combo-skill-channel'));});
test('visible current comparison exposes owner exclusions and separate non-total annotations',()=>{const c=setup();c.consumerCoverageSummary=()=>({normal:1,maximum:1,total:1});vm.runInContext(extract('comparisonExcludedNotesHtml'),c);const before=JSON.stringify(c.result),row={name:'<Saved build>',oneHitPipeline:c.result.pipeline},out=c.comparisonExcludedNotesHtml([row]);assert.ok(extract('renderCompareTable').includes('h+=comparisonExcludedNotesHtml(rows);'));assert.ok(!out.includes('id="comparisonReadiness"'));assert.ok(out.includes('Owner excluded'));assert.ok(out.includes('Explicitly excluded'));assert.ok(out.includes('Annotation only'));assert.ok(out.includes('Maximum &lt;clash&gt; assumption; not equipment verified'));assert.ok(out.includes('&lt;Saved build&gt;'));assert.ok(out.includes('data-comparison-excluded-channel="normal"'));assert.ok(out.includes('data-comparison-excluded-channel="maximum"'));assert.equal(JSON.stringify(c.result),before);});
