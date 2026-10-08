const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8'),c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const b=c.window.BuildComparisonEngine,stats={baseAttack:200,displayedElement:100,elementalHitzone:20},event=(id,count)=>({techniqueId:id,count,evidenceRef:'EXPLICIT_TEST_SCENARIO'});
test('horn source estimate distinguishes normal echo melody echo and fixed damage',()=>{
 const x=b.huntingHornSpecialSourceEstimate(stats,[event('HH_ECHO_BUBBLE_FOLLOWUP',2),event('HH_ECHO_BUBBLE_MELODY_EVENT',1),event('HH_MELODY_COMPLETION_FIXED_10',1)]);
 assert.equal(x.physical,44);assert.ok(Math.abs(x.element-1.8)<1e-10);assert.equal(x.fixed,10);assert.ok(Math.abs(x.sourceEstimateTotal-55.8)<1e-10);assert.equal(x.comparisonPower,null);assert.equal(x.completeStandard,false);assert.equal(x.status,'SOURCE_ESTIMATE_ONLY');
});
test('horn source estimate ignores normal hit scaling and leaves inputs unchanged',()=>{
 const events=[event('HH_PERFORMANCE_SHOCKWAVE',1)],before=JSON.stringify(events);
 const a=b.huntingHornSpecialSourceEstimate(stats,events),z=b.huntingHornSpecialSourceEstimate({...stats,sharpnessPhysical:9,sharpnessElement:9,affinity:100,physicalHitzone:1},events);
 assert.equal(a.physical,54);assert.equal(a.element,2);assert.equal(a.sourceEstimateTotal,z.sourceEstimateTotal);assert.equal(JSON.stringify(events),before);
});
test('horn source estimate rejects absent ambiguous and invalid events',()=>{
 for(const events of [undefined,[],[{}],[event('HH_ECHO_BUBBLE_PLACE',1)],[event('HH_ECHO_BUBBLE_FOLLOWUP',null)],[event('HH_ECHO_BUBBLE_FOLLOWUP',1.5)],[{...event('HH_ECHO_BUBBLE_FOLLOWUP',1),evidenceRef:''}]])assert.throws(()=>b.huntingHornSpecialSourceEstimate(stats,events),/FAIL_CLOSED/);
 for(const bad of [{...stats,baseAttack:'200'},{...stats,displayedElement:-1},{...stats,elementalHitzone:NaN}])assert.throws(()=>b.huntingHornSpecialSourceEstimate(bad,[event('HH_PERFORMANCE_SHOCKWAVE',1)]),/FAIL_CLOSED/);
});
test('fixed melody damage never scales with weapon statistics',()=>{
 const x=b.huntingHornSpecialSourceEstimate({baseAttack:999,displayedElement:999,elementalHitzone:99},[event('HH_MELODY_COMPLETION_FIXED_10',2)]);assert.equal(x.sourceEstimateTotal,20);assert.equal(x.physical,0);assert.equal(x.element,0);
});
test('source estimate does not adopt horn events or full comparison',()=>{
 b.huntingHornSpecialSourceEstimate(stats,[event('HH_ECHO_BUBBLE_FOLLOWUP',4)]);const p=b.huntingHornComponentPlan();assert.equal(p.calculationReady,false);assert.equal(p.components.echoBubble.eventCount,4);assert.equal(p.components.echoBubble.eventTypeMappingStatus,'PENDING');
 assert.equal(c.window.TechniqueDBEngine.audit('hunting-horn','HH_ECHO_BUBBLE_MELODY_EVENT').calculable,false);
});
test('formula audit preserves both formula source links',()=>{
 const a=c.window.TechniqueDBEngine.audit('hunting-horn','HH_PERFORMANCE_SHOCKWAVE');
 for(const id of ['KUROYONHON_HH_R56_COMPONENTS','MACARONGAMEMO_HH_R61_FORMULA'])assert.ok(a.evidence.some(e=>e.ref===id&&e.registered&&e.url));
});
