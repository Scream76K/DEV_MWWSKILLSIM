const {legacyReportRow}=require('./legacy-comparison-report-test-helper.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createSyntheticCombatDom,equipSyntheticWeapon}=require('./synthetic-combat-fixture.cjs');
// Synthetic identity 987 and a one-unit white segment are explicit test inputs.
// White preserves the legacy page's 1.32/1.15 sharpness premise, not real equipment evidence.
function setup(t,a=0,r=0,f=0,charm='YES'){const w=createSyntheticCombatDom(t);equipSyntheticWeapon(w,{id:987,gameId:987,sharpness:{white:1},kind:'heavy-bowgun',name:'HBG',damage:{raw:160,display:160},affinity:0,specials:[],slots:[],ammo:[{kind:'wyvern',capacity:1}],skills:[{name:'攻撃',level:a},{name:'砲術',level:r},{name:'火属性攻撃強化',level:f}].filter(skill=>skill.level!==0)});w.eval(`monsterHZ=()=>({hz:45,ehz:20});`);for(const [id,value] of Object.entries({wyvernMeal:'AZUZ',wyvernCharm:charm,wyvernOther:'NONE',wyvernMode:'STANDARD',wyvernFireHz:'30'})){const el=w.document.getElementById(id);assert.ok(el,`missing ${id}`);el.value=value;}w.document.getElementById('comboMovePicker').value='canonical:HBG_WYVERN_AMMO';return w;}
const cases=[...[148.8,151.2,152.8,154.4,157.8,161.1].map((v,a)=>[a,0,0,'YES',0,v]),...[148.8,161.6,174.4,187.2].map((v,r)=>[0,r,0,'YES',0,v]),[5,0,0,'YES',0,161.1],[5,2,0,'YES',0,187.7],...[38.5,39.7,40.6,41.5].map((v,f)=>[0,0,f,'YES',1,v]),[3,0,0,'YES',1,39.8],[5,0,0,'YES',1,41.4],[0,0,0,'NO',0,144],[0,0,0,'NO',1,37.4],[0,2,0,'NO',0,169.6],[0,2,0,'NO',1,37.4]];
for(const [i,c] of cases.entries())test(`product Wyvern measured condition ${i+1}`,t=>{const [a,r,f,charm,hit,expected]=c,w=setup(t,a,r,f,charm),x=w.calcSelectedTechniqueDamage();assert.ok(x.damage>0,JSON.stringify(x.blocked));const details=currentWyvernDetails(x,w);assert.equal(details.hits.length,2);assert.equal(details.displayHits[hit],expected);});
test('Wyvern single template free save comparison share two hit provisional route',t=>{const w=setup(t,5,2);const one=w.calcSelectedTechniqueDamage();w.document.getElementById('comboPreset').value='adopted:hbg_wyvern';assert.equal(w.calcTemplateComboDamage().damage,one.damage);w.addCombo('canonical:HBG_WYVERN_AMMO');assert.equal(w.calcUserComboDamage().damage,one.damage);const snap=w.eval('buildSnapshot()');w.applyBuildSnapshot(JSON.parse(JSON.stringify(snap)));assert.equal(w.calcUserComboDamage().damage,one.damage);w.eval("buildName.value='HBG';saveNamedBuild();selectAllCompare.click();runBuildCompare();window.report=createBuildComparisonReport();");assert.equal(legacyReportRow(w.report).referenceCombo.damage,one.damage);assert.equal(legacyReportRow(w.report).referenceComboChange.index,100);const db=w.TechniqueDBEngine.get('heavy-bowgun','HBG_WYVERN_AMMO');assert.equal(db.verificationStatus,'PROVISIONAL');assert.ok(db.replacedRecord);});
test('Wyvern missing buff target mode and unknown skills withhold complete damage',t=>{const w=setup(t);for(const id of ['wyvernMeal','wyvernCharm','wyvernOther','wyvernMode','wyvernFireHz']){const el=w.document.getElementById(id),v=el.value;el.value='';assert.equal(w.calcSelectedTechniqueDamage().damage,null,id);el.value=v;}w.eval("calcState.total['連撃']=1");assert.equal(w.calcSelectedTechniqueDamage().damage,null);});
test('Wyvern fire hitzone comes from target and known zero remains valid',t=>{const w=setup(t);w.document.getElementById('wyvernFireHz').value='0';let x=w.calcSelectedTechniqueDamage();assert.equal(x.stages[0].result.hits[0].e,0);assert.equal(x.stages[0].result.hits[1].e,0);w.eval("selectedPart=()=>({multipliers:{fire:.5}})");x=w.calcSelectedTechniqueDamage();assert.equal(x.stages[0].result.hits[0].e,20);assert.equal(x.stages[0].result.hits[1].e,10);});
test('shared attack aggregation retains decimal and rejects duplicate or unknown external buffs',t=>{const w=setup(t);const g=w.CombatAttackAggregation.aggregate;const x=g({weaponBase:160,normalMultiplier:1.04,normalFlat:9},[{id:'meal',value:5},{id:'charm',value:6}]);assert.equal(x.attackTrue,186.4);assert.throws(()=>g({weaponBase:160,normalMultiplier:1,normalFlat:0},[{id:'charm',value:6},{id:'charm',value:6}]));assert.throws(()=>g({weaponBase:160,normalMultiplier:1,normalFlat:0},[{id:'meal',value:null}]));});
test('old JSON missing food charm or mode never assumes neutral buffs',t=>{const w=setup(t);w.addCombo('canonical:HBG_WYVERN_AMMO');const s=w.eval('buildSnapshot()');delete s.combatBuffs;delete s.combo.hbgWyvernState;w.applyBuildSnapshot(s);assert.equal(w.calcUserComboDamage().damage,null);});
test('unsupported mixed ammo and explicit ammo incompatibility remain unresolved',t=>{const w=setup(t);w.addCombo('canonical:HBG_WYVERN_AMMO');w.addCombo('canonical:HBG_NORMAL_AMMO_1');assert.equal(w.calcUserComboDamage().damage,null);w.eval("selectedWeapon().ammo=[{kind:'normal',level:1,capacity:3}]");w.document.getElementById('combo').innerHTML='';w.addCombo('canonical:HBG_WYVERN_AMMO');assert.equal(w.calcUserComboDamage().damage,null);});
test('saved comparison preserves distinct buff inputs and provisional provenance without double adding',t=>{const w=setup(t);w.addCombo('canonical:HBG_WYVERN_AMMO');w.eval("buildName.value='Charm';saveNamedBuild();wyvernCharm.value='NO';buildName.value='No Charm';saveNamedBuild();selectAllCompare.click();runBuildCompare();window.report=createBuildComparisonReport();");const rows=w.report.results;const [a,b]=rows;assert.equal(a.referenceCombo.stages[0].attackComponents.attackTrue,171);assert.equal(b.referenceCombo.stages[0].attackComponents.attackTrue,165);assert.equal(a.referenceCombo.stages[0].verificationStatus,'PROVISIONAL');assert.ok(a.referenceCombo.stages[0].evidenceRefs.includes('KAN23_OWNER_TWO_HIT_FIX_22_CONDITIONS'));assert.equal(w.document.getElementById('wyvernCharm').value,'NO');assert.equal(a.powerIndex,b.powerIndex);});
test('save restoration invariant includes food and charm but accepts missing legacy fields as unknown',t=>{const w=setup(t),a=w.eval('buildSnapshot()');const b=JSON.parse(JSON.stringify(a));b.combatBuffs.charm='NO';assert.equal(w.buildSnapshotMatches(a,b),false);const old={weaponId:987},restored={weaponId:987,combatBuffs:{meal:null,charm:null,otherBuffs:null}};assert.equal(w.buildSnapshotMatches(old,restored),true);});

// evaluateP0DamageRoute keeps only total/trace in legacy stages. The unchanged
// HBGWyvernReference.calculate result is attached by the real adapter as the
// single reference component's details. Require that exact identity; no fallback.
function currentWyvernDetails(result,w){
 assert.ok(result.pipeline,'pipeline required');
 assert.ok(result.pipeline.channels,'pipeline channels required');
 assert.ok(result.pipeline.channels.normal,'normal channel required');
 const channel=result.pipeline.channels.normal;
 assert.equal(channel.execution.status,'complete');
 assert.ok(Array.isArray(channel.components),'components required');
 assert.equal(channel.components.length,1);
 const component=channel.components[0];
 assert.equal(component.id,'HBG_WYVERN_AMMO:reference:0');
 assert.equal(component.techniqueId,'HBG_WYVERN_AMMO');
 assert.equal(component.eventId,'0:0');
 assert.equal(component.status,'available');
 assert.ok(component.details,'reference details required');
 const details=component.details,record=w.TechniqueDBEngine.get('heavy-bowgun','HBG_WYVERN_AMMO');
 assert.equal(record.techniqueId,'HBG_WYVERN_AMMO');
 assert.equal(record.hits.length,2);
 assert.equal(details.scope,'STANDARD_MODE_FULL_TWO_HIT_PROVISIONAL');
 assert.equal(details.verificationStatus,'PROVISIONAL');
 assert.ok(Array.isArray(details.hits),'two hit details required');
 assert.ok(Array.isArray(details.displayHits),'two displayed hit values required');
 assert.equal(details.hits.length,2);
 assert.equal(details.displayHits.length,2);
 for(let index=0;index<2;index++){
  const actual=details.hits[index],source=record.hits[index];
  assert.equal(actual.mv,source.mv);
  assert.equal(actual.artilleryTarget,source.artilleryTarget);
  assert.equal(actual.fireSkillTarget,source.fireSkillTarget);
  assert.equal(actual.component,'RAW_AND_FIRE');
  assert.equal(actual.criticalState,'NO_CRITICAL');
  for(const key of ['p','e','total','fireValue'])assert.ok(Number.isFinite(actual[key]),key+' must be finite');
  assert.equal(actual.total,actual.p+actual.e);
  assert.equal(details.displayHits[index],Math.round((actual.total+Number.EPSILON)*10)/10);
 }
 assert.equal(details.total,details.hits.reduce((sum,hit)=>sum+hit.total,0));
 assert.equal(component.value,details.total);
 assert.equal(result.damage,details.total);
 return details;
}
test('Wyvern current details mapping rejects missing or mismatched output instead of falling back',t=>{
 const w=setup(t),valid=w.calcSelectedTechniqueDamage();
 const corruptions=[
  r=>{delete r.pipeline;},
  r=>{delete r.pipeline.channels.normal;},
  r=>{r.pipeline.channels.normal.components=[];},
  r=>{delete r.pipeline.channels.normal.components[0].details;},
  r=>{r.pipeline.channels.normal.components[0].techniqueId='HBG_NORMAL_AMMO_1';},
  r=>{r.pipeline.channels.normal.components[0].eventId='1:0';},
  r=>{r.pipeline.channels.normal.components[0].details.hits.pop();},
  r=>{r.pipeline.channels.normal.components[0].details.hits.reverse();},
  r=>{r.pipeline.channels.normal.components[0].details.displayHits.pop();},
  r=>{r.pipeline.channels.normal.components[0].details.hits[0].total=NaN;},
  r=>{r.pipeline.channels.normal.components[0].details.displayHits[0]+=1;}
 ];
 for(const corrupt of corruptions){const broken=structuredClone(valid);corrupt(broken);assert.throws(()=>currentWyvernDetails(broken,w));}
});
