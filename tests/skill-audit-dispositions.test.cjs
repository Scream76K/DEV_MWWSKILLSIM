'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const modulePath=require('node:path').join(__dirname,'../tools/skill-audit-dispositions.cjs');
const api=fs.existsSync(modulePath)?require(modulePath):{};
test('ordinary rank probes subtract known intrinsic levels without hiding unreachable ranks',()=>{
 assert.equal(typeof api.planOrdinaryRank,'function');
 assert.deepEqual(api.planOrdinaryRank(1,1),{status:'REACHABLE',charmLevel:0});
 assert.deepEqual(api.planOrdinaryRank(1,3),{status:'REACHABLE',charmLevel:2});
 assert.deepEqual(api.planOrdinaryRank(2,1),{status:'INTRINSIC_RANK_UNREACHABLE',charmLevel:null});
 assert.deepEqual(api.planOrdinaryRank(0,3),{status:'REACHABLE',charmLevel:3});
 for(const bad of [undefined,null,NaN,-1,1.5,'1'])assert.throws(()=>api.planOrdinaryRank(bad,3),/Invalid baseline/);
 assert.throws(()=>api.planOrdinaryRank(0,0),/Invalid requested/);
});
test('channel classification respects execution and partial flags without conflating owner exclusions',()=>{
 assert.equal(typeof api.classifyChannel,'function');
 const available={execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value:2}},diagnostics:{}};
 assert.equal(api.classifyChannel(available),'AVAILABLE_NO_RECORDED_OMISSION');
 assert.equal(api.classifyChannel({...available,execution:{status:'incomplete'}}),'UNAVAILABLE');
 assert.equal(api.classifyChannel(null),'MISSING_CHANNEL');
 for(const diagnostics of [{formalStatus:'PARTIAL_REFERENCE'},{calculationCompleteness:'PARTIAL_SKILL_EFFECTS'},{componentSkillContinuation:{}}])assert.equal(api.classifyChannel({...available,diagnostics}),'AVAILABLE_PARTIAL');
 assert.equal(api.classifyChannel({...available,metrics:{comboTotalDamage:{status:'available',value:2,completeness:'PARTIAL_REFERENCE'}}}),'AVAILABLE_PARTIAL');
 assert.equal(api.classifyChannel({...available,diagnostics:{excludedCalculationSkills:[{skillId:8}],excludedSkillDamage:[{skillId:38}]}}),'AVAILABLE_NO_RECORDED_OMISSION');
 assert.equal(api.collectDispositions({channels:{normal:{...available,execution:{status:'incomplete'}}}}).normal.channelStatus,'UNAVAILABLE');
});
test('available rapid channels retain unapplied effects independently of ignored and excluded skills',()=>{
 assert.equal(typeof api.collectDispositions,'function');
 const input={channels:{normal:{diagnostics:{unappliedEffects:[{skillId:137,reason:'RAPID_ALL_FIVE_HIT_EFFECT_NOT_VERIFIED'}],excludedCalculationSkills:[{skillId:8}],formalStatus:'PARTIAL_REFERENCE'},metrics:{comboTotalDamage:{status:'available',value:10,completeness:'PARTIAL_REFERENCE'}}}}};
 const before=JSON.stringify(input),out=api.collectDispositions(input);
 assert.equal(out.normal.unapplied[0].skillId,137);assert.deepEqual(out.normal.ignored,[]);assert.equal(out.normal.ownerExcluded[0].skillId,8);assert.equal(out.normal.formalStatus,'PARTIAL_REFERENCE');assert.equal(out.normal.completeness,'PARTIAL_REFERENCE');assert.deepEqual(out.maximum.unapplied,[]);assert.equal(out.maximum.formalStatus,null);
 out.normal.unapplied[0].skillId=999;assert.equal(JSON.stringify(input),before);
});
test('component retention stays separate and both channels carry their own diagnostics',()=>{
 assert.equal(typeof api.collectDispositions,'function');
 const out=api.collectDispositions({channels:{maximum:{diagnostics:{ignoredSkillEffects:[{skillId:24}],componentSkillContinuation:{scope:'BODY_ONLY',components:[{origin:'strict'}]}}}}});
 assert.equal(out.maximum.partialBody,'BODY_ONLY');assert.deepEqual(out.maximum.componentContinuation.components,[{origin:'strict'}]);assert.equal(out.maximum.ignored[0].skillId,24);assert.deepEqual(out.normal.ignored,[]);
});
test('missing and unavailable channels differ; annotation exclusions and continuation completeness survive',()=>{
 const input={channels:{normal:{metrics:{comboTotalDamage:{status:'unavailable',value:null}},diagnostics:{calculationCompleteness:'PARTIAL_SKILL_EFFECTS',excludedSkillDamage:[{skillId:38}],componentSkillContinuation:{components:[{origin:'strict'}]}}},maximum:null}};
 const before=JSON.stringify(input),out=api.collectDispositions(input);
 assert.equal(out.normal.channelStatus,'UNAVAILABLE');assert.equal(out.maximum.channelStatus,'MISSING_CHANNEL');assert.equal(out.maximum.metricStatus,null);assert.equal(out.normal.metricStatus,'unavailable');assert.equal(out.normal.metricValue,null);assert.equal(out.normal.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');assert.equal(out.normal.excludedSkillDamage[0].skillId,38);
 out.normal.componentContinuation.components[0].origin='changed';assert.equal(JSON.stringify(input),before);assert.equal(api.collectDispositions(null).normal.channelStatus,'MISSING_CHANNEL');
 const invalid=api.collectDispositions({channels:{normal:{metrics:{comboTotalDamage:{status:'available',value:NaN}}}}});assert.equal(invalid.normal.channelStatus,'UNAVAILABLE');
});
test('refresh selects thirteen kinds and fourteen named profiles without CB; legacy HALF unchanged',()=>{
 assert.equal(typeof api.selectProfiles,'function');
 const kinds=['great-sword','long-sword','sword-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow'];
 const cases=kinds.map(kind=>({kind,inputSnapshots:[{weaponId:'1169',combo:{moves:[{techniqueId:'OLD'}]}}]}));
 assert.deepEqual(api.selectProfiles(cases,{HALF:'first'}).map(x=>x.kind),kinds.slice(0,7));
 const profiles=api.selectProfiles(cases,{AUDIT_MODE:'current-standard'});
 assert.equal(profiles.length,14);assert.equal(new Set(profiles.map(x=>x.kind)).size,13);assert.ok(profiles.every(x=>x.kind!=='charge-blade'));
 assert.deepEqual(profiles.filter(x=>x.kind==='light-bowgun').map(x=>x.auditWeaponId),['783','773']);assert.equal(profiles.find(x=>x.kind==='heavy-bowgun').auditWeaponId,'469');
 assert.equal(api.selectProfiles(cases,{AUDIT_MODE:'current-standard',WEAPON_KINDS:'light-bowgun',LBG_MODES:'NORMAL'}).length,1);
 assert.throws(()=>api.selectProfiles(cases,{AUDIT_MODE:'current-standard',WEAPON_KINDS:'charge-blade'}),/charge-blade/);
 assert.throws(()=>api.selectProfiles(cases,{WEAPON_KINDS:'typo'}),/Unknown/);
});
test('standard snapshot clears explicit moves on a deep copy and skill selectors reject malformed IDs',()=>{
 assert.equal(typeof api.prepareSnapshot,'function');assert.equal(typeof api.selectSkills,'function');
 const original={weaponId:'1169',combo:{moves:[{techniqueId:'OLD'}],lightBowgunState:{ammoType:'ELEMENT'}},armor:{head:1}};
 const profile={inputSnapshots:[original],auditWeaponId:'783'};
 const copy=api.prepareSnapshot(profile,true);assert.deepEqual(copy.combo.moves,[]);assert.equal(copy.weaponId,'783');copy.combo.lightBowgunState.ammoType='NORMAL';assert.equal(original.combo.lightBowgunState.ammoType,'ELEMENT');assert.equal(original.combo.moves.length,1);assert.deepEqual(copy.armor,{});
 const skills=[{id:137},{id:140},{id:8}];assert.deepEqual(api.selectSkills(skills,'137,140'),skills.slice(0,2));assert.throws(()=>api.selectSkills(skills,'137,bad'),/Invalid/);assert.throws(()=>api.selectSkills(skills,'999'),/Unknown/);
});
