const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const b=c.window.BuildComparisonEngine,e=c.window.TechniqueDBEngine,plain=x=>JSON.parse(JSON.stringify(x));
test('confirmed four echo events do not imply four identical damage coefficients',()=>{
 const p=b.huntingHornComponentPlan();
 assert.equal(p.status,'FAIL_CLOSED');assert.equal(p.calculationReady,false);
 assert.equal(p.verifiedCore.echoBubble.eventCount,4);
 assert.equal(p.verifiedCore.echoBubble.totalFollowupMv,null);
 assert.ok(p.unresolved.includes('ECHO_EVENT_TYPE_MAPPING'));
 assert.ok(p.unresolved.includes('HORN_SPECIAL_FORMULA_RESOLUTION'));
 assert.throws(()=>b.huntingHornAdapter({},null,{}),/EVIDENCE_PENDING/);
});
test('ordinary and melody echo coefficients stay special source values rather than normal hits',()=>{
 const normal=e.get('hunting-horn','HH_ECHO_BUBBLE_FOLLOWUP'),melody=e.get('hunting-horn','HH_ECHO_BUBBLE_MELODY_EVENT');
 assert.deepEqual(plain(normal.hits),[]);assert.equal(normal.specialSourceValues.coefficient,5);
 assert.ok(melody);assert.deepEqual(plain(melody.hits),[]);assert.equal(melody.specialSourceValues.coefficient,12);
 assert.equal(normal.specialSourceValues.elementModifier,.3);assert.equal(melody.specialSourceValues.elementModifier,.3);
 assert.equal(normal.specialSourceValues.formulaStatus,'PENDING');
 for(const id of [normal.techniqueId,melody.techniqueId])assert.throws(()=>e.hits('hunting-horn',id),/FAIL_CLOSED/);
});
test('performance normal-hit reader returns only the body and preserves old mixed data in history',()=>{
 const t=e.get('hunting-horn','HH_SELF_IMPROVEMENT_PERFORMANCE');
 const hits=e.hits('hunting-horn',t.techniqueId);
 assert.equal(hits.length,1);assert.equal(hits[0].mv,35);assert.equal(hits[0].component,'BODY');
 assert.equal(t.specialTechniqueIds[0],'HH_PERFORMANCE_SHOCKWAVE');
 assert.equal(t.revisionHistory[0].hits.length,2);
 assert.equal(t.revisionHistory[0].hits[1].mv,27);
});
test('placement conflict and flat melody event do not get flattened into standard MV',()=>{
 const t=e.get('hunting-horn','HH_ECHO_BUBBLE_PLACE');assert.equal(t.numericStatus,'SOURCE_CONFLICT');
 assert.equal(t.specialSourceValues.bracketedValue,30);
 assert.ok(t.sourceAlternatives.some(x=>x.specialSourceValues.coefficient===45));
 const fixed=e.get('hunting-horn','HH_MELODY_COMPLETION_FIXED_10');
 assert.equal(fixed.specialSourceValues.fixedDamagePerEvent,10);
 assert.equal(fixed.specialSourceValues.attackScaling,false);
 assert.throws(()=>e.hits('hunting-horn',fixed.techniqueId),/FAIL_CLOSED/);
});
test('handler source view reads canonical numeric values rather than storing duplicate MV constants',()=>{
 const evidence=b.huntingHornEvidence;
 assert.equal(evidence.bodyMotions.leftSwing.mv,e.get('hunting-horn','HH_LEFT_SWING').hits[0].mv);
 assert.equal(evidence.echoBubble.followupMv,e.get('hunting-horn','HH_ECHO_BUBBLE_FOLLOWUP').specialSourceValues.coefficient);
 assert.equal(evidence.echoBubble.melodyFollowupCoefficient,12);
 const region=s.slice(s.indexOf('const HUNTING_HORN_EVIDENCE='),s.indexOf('function huntingHornEvidenceReady'));
 assert.ok(!/\b(?:mv|bodyMv|shockwaveMv|placementMv|followupMv|secondHitMvJust)\s*:\s*\d/.test(region));
 assert.equal(e.completion['hunting-horn'].complete,false);
});
test('body-only calculation is useful without claiming complete horn comparison power',()=>{
 assert.equal(typeof b.huntingHornBodyComponents,'function');
 const stats={baseAttack:100,displayedElement:100,physicalHitzone:100,elementalHitzone:100,sharpnessPhysical:1,sharpnessElement:1,affinity:0,maxAffinity:100};
 const x=b.huntingHornBodyComponents(stats,'NORMAL');
 assert.equal(x.status,'PARTIAL_BODY_ONLY');assert.equal(x.comparisonPower,null);
 assert.equal(x.physical,195);assert.equal(x.element,50);assert.equal(x.trace.length,5);
 assert.ok(x.excludedComponents.includes('PERFORMANCE_SHOCKWAVE'));
 assert.equal(b.profileAvailability('dual-blades').status,'READY');
 assert.equal(b.profileAvailability('insect-glaive').status,'EVIDENCE_GATED');
});
test('horn audit shows confirmed event count separately from unresolved event types and full comparison',()=>{
 const elements=Object.fromEntries(['techAuditKind','techAuditId','techAuditOut','techAuditSummary'].map(id=>[id,{value:'',innerHTML:'',addEventListener(event,fn){this[event]=fn;}}]));
 c.document={getElementById:id=>elements[id]||null};
 vm.runInContext(s.match(/<script id="technique-audit-ui">([\s\S]*?)<\/script>/)[1],c);
 elements.techAuditKind.value='hunting-horn';elements.techAuditKind.change();
 assert.ok(elements.techAuditSummary.innerHTML.includes('追撃4回の確認は保持'));
 assert.ok(elements.techAuditSummary.innerHTML.includes('本体5Hit / MV合計195'));
 assert.ok(elements.techAuditSummary.innerHTML.includes('専用STANDARD：計算保留'));
 assert.ok(elements.techAuditSummary.innerHTML.includes('追撃の種類の対応'));
 elements.techAuditId.value='HH_SELF_IMPROVEMENT_PERFORMANCE';elements.techAuditId.change();
 assert.ok(elements.techAuditOut.innerHTML.includes('別計算の成分'));
 assert.ok(elements.techAuditOut.innerHTML.includes('HH_PERFORMANCE_SHOCKWAVE'));
});
