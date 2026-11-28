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
 const notes=out.querySelector('details[data-comparison-notes]');
 assert.ok(notes&&!notes.open);
 assert.deepEqual([...notes.querySelectorAll('[data-comparison-skill-omissions] li')].map(e=>e.textContent),['<Unimplemented>：（通常のみ）','Unapplied max：（最大のみ）']);
 const scoped=label=>[...notes.querySelectorAll('[data-comparison-note]')].filter(node=>node.firstElementChild?.textContent===label).map(node=>node.textContent).join(' ');
 assert.match(scoped('（通常のみ）'),/Owner excluded.*Explicitly excluded/);
 assert.doesNotMatch(scoped('（通常のみ）'),/Annotation only|Maximum/);
 assert.match(scoped('（最大のみ）'),/Annotation only/);
 assert.match(scoped('（最大のみ）'),/Maximum <clash> assumption; not equipment verified/);
 assert.doesNotMatch(notes.textContent,/No evidence|\(ID 24\)/);
 assert.ok(!out.innerHTML.includes('<Unimplemented>'));
 assert.deepEqual([...out.querySelectorAll('[data-custom-damage="total"] td')].map(td=>td.textContent),['10.0','12.0','+20.0%']);
 assert.equal(legacy.innerHTML,'');assert.equal(r.damage,10);assert.equal(r.maximumDamage,12);
 assert.equal(JSON.stringify(fixture),before);
});
test('fully calculable combo does not fabricate a skill-omission warning',()=>{const c=setup();c.result.pipeline.channels.normal.diagnostics={};c.result.pipeline.channels.maximum.diagnostics={};c.calcP0Damage('single');assert.ok(!c.nodes.singleTechniqueDamageOut.innerHTML.includes('data-combo-skill-channel'));});
test('saved comparison groups independent annotations without mutating the calculation',()=>{
 const c=setup();Object.assign(c,{attributeConversionDisplay:()=>'',thunderConversionDisplay:()=>''});
 for(const n of ['comparisonNoteScope','createComparisonNotes','addComparisonChannelNotes'])vm.runInContext(extract(n),c);
 const before=JSON.stringify(c.result),row={name:'<Saved build>',oneHitPipeline:c.result.pipeline};
 const notes=c.createComparisonNotes();c.addComparisonChannelNotes([row],notes.add);
 const out=notes.render();
 for(const text of ['Owner excluded','Explicitly excluded','Annotation only','Maximum &lt;clash&gt; assumption; not equipment verified','&lt;Saved build&gt;（通常のみ）','&lt;Saved build&gt;（最大のみ）'])assert.ok(out.includes(text),text);
 assert.equal(JSON.stringify(c.result),before);
});
