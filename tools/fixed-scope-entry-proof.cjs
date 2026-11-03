const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const skills=JSON.parse(fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json'));
const fixture=JSON.parse(fs.readFileSync('docs/reports/r258-attribute-conversion/fixture.json'));
const before=process.argv[2]==='before',cases=[];let failed;
function setup(kind){const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://fixed-scope.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}).window;
 const weapon=kind==='long-sword'?{...fixture.weapon,skills:[],specials:[{kind:'element',element:'water',damage:{raw:50,display:500}}]}:{id:999001,gameId:999001,sharpness:{},kind,name:'SYNTHETIC_CONTRACT',damage:{raw:90,display:108},affinity:10,slots:[],skills:[{skill:{id:144,name:'挑戦者'},level:1}],specials:[],coatings:[],ammo:[{kind:'normal',level:1,capacity:4,rapid:true}]};
 w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};DB.skills=${JSON.stringify(skills)};DB.armor=[];DB.decorations=[];weaponIndexByKind['${kind}']=DB.weapons;weaponKind.value='${kind}';weapon.innerHTML='<option value="${weapon.id}">contract</option>';weapon.value='${weapon.id}';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderComboForWeapon();renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';App.state.combo.moves=[{techniqueId:'canonical:${kind==='bow'?'BOW_THOUSAND_DRAGONS':kind==='light-bowgun'?'LBG_NORMAL_RAPID_1':'LS_RED_BLADE_I'}'}];restoreComboRows();`);
 if(kind==='bow')w.eval("powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';");
 if(kind==='light-bowgun')w.restoreComboLBGState({shotMode:'RAPID',ammoType:'NORMAL',ammoLevel:1,range:'CRITICAL',normalModeLevel:0,contactPolicy:'ALL_FIVE',loadedRounds:2,rapidReady:true});
 if(kind==='long-sword')w.eval("comboLSSpiritGauge.value='RED';");
 return w;
}
const take=w=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,stats:calcState.stats,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));
function run(w,label,ids){w.eval(`build.charmCustom.skills=${JSON.stringify(ids.map(id=>({name:skills.find(s=>s.id===id).name,level:1})))};calcBuild();`);const r={label,...take(w)};cases.push(r);return r;}
function valid(r){for(const ch of ['normal','maximum'])assert.equal(r.result.channels?.[ch]?.execution.status,'complete',JSON.stringify(r.result));}
function totals(r){return ['normal','maximum'].map(ch=>r.result.channels[ch].metrics.comboTotalDamage.value);}
try{
 for(const kind of ['bow','light-bowgun','long-sword']){
 const w=setup(kind),base=run(w,kind+'-base',[]);valid(base);
 const extra=run(w,kind+'-ignored',kind==='long-sword'?[84]:[14,37,60,38,166]);
 if(before){assert.ok(!extra.result.channels||extra.result.channels.normal.execution.status!=='complete');w.close();continue;}
 valid(extra);assert.deepEqual(totals(extra),totals(base));
 if(kind==='long-sword'){
  const on=run(w,'water-with-181',[84,181]);valid(on);for(const ch of ['normal','maximum'])assert.equal(on.result.channels[ch].diagnostics.waterResistanceConversion.add,24);
  w.eval(`DB.armor=[${JSON.stringify({...fixture.armor,id:990001,kind:'head',skills:[],resistances:{fire:0,water:-30,thunder:0,ice:0,dragon:0}})}];build.armor.head=DB.armor[0];calcBuild();`);const negative={label:'water-negative',...take(w)};cases.push(negative);assert.ok(JSON.stringify(negative.result).includes('WATER_RESISTANCE_UNRESOLVED'));w.close();continue;
 }
 w.eval(`buildName.value='${kind}-plain';saveNamedBuild();`);
 // Public equipment aggregation: two contract armor pieces with a real DB series record.
 w.eval(`DB.armor=${JSON.stringify(['head','chest'].map((kind,i)=>({...fixture.armor,id:990001+i,kind,skills:[{skill:skills.find(s=>s.id===11),level:1}],resistances:{fire:0,water:0,thunder:0,ice:0,dragon:0}})))};build.armor.head=DB.armor[0];build.armor.chest=DB.armor[1];calcBuild();`);
 const series={label:kind+'-series',...take(w)};cases.push(series);valid(series);assert.deepEqual(totals(series),totals(base));assert.equal(series.stats.conditionalConditionPlan.groupPlan.nonDamageEffects.length,1);
 w.eval(`buildName.value='${kind}-series';saveNamedBuild();`);const current=take(w),storage=JSON.stringify({...w.localStorage});
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");const comparison=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,result:x.oneHitPipeline})))'));assert.equal(comparison.length,2);comparison.forEach(r=>{valid(r);assert.deepEqual(totals(r),totals(base));});assert.deepEqual(take(w),current);assert.equal(JSON.stringify({...w.localStorage}),storage);cases.push({label:kind+'-compare',comparison,conditionsAndCurrentUnchanged:true});
 w.applyBuildSnapshot(extra.snapshot);w.calcBuild();assert.deepEqual(totals(take(w)),totals(base));
 // Invalid Lv must reach the known-skill entry guard (raw weapon record is not clamped).
 w.eval("DB.weapons[0].skills.push({skill:{id:37,name:'ボマー'},level:4});calcBuild();");const badLevel={label:kind+'-bad-level',...take(w)};cases.push(badLevel);assert.ok(JSON.stringify(badLevel.result).includes('SKILL_COMBINATION_NOT_ADOPTED'));w.eval("DB.weapons[0].skills.pop();");
 // Unknown skill is supplied through equipment, not added to the known DB.
 w.eval("DB.weapons[0].skills.push({skill:{id:999991,name:'UNKNOWN_SCOPE_SKILL'},level:1});calcBuild();");const bad={label:kind+'-unknown',...take(w)};cases.push(bad);assert.ok(JSON.stringify(bad.result).includes('SKILL_COMBINATION_NOT_ADOPTED'));w.close();
 }
 // Series public before counterexample on an ordinary body route.
 const w=setup('long-sword');run(w,'series-body-base',[]);w.eval(`DB.armor=${JSON.stringify(['head','chest'].map((kind,i)=>({...fixture.armor,id:990001+i,kind,skills:[{skill:skills.find(s=>s.id===11),level:1}],resistances:{fire:0,water:0,thunder:0,ice:0,dragon:0}})))};build.armor.head=DB.armor[0];build.armor.chest=DB.armor[1];calcBuild();`);const r={label:'series-body',...take(w)};cases.push(r);if(before)assert.ok(JSON.stringify(r.result).includes('BONUS_DAMAGE_EFFECT_PENDING'));else {
 valid(r);
 // Classification-only checks, not 17 complete public builds or new game formulas.
 const ids=[11,17,19,20,26,27,51,54,56,73,74,93,97,132,139,148,157],checks=[];
 for(const id of ids){const skill=skills.find(s=>s.id===id);for(const rank of skill.ranks){const e={bonusSkillId:id,bonusName:skill.name,name:rank.name,source:skill.kind==='set'?'series':'group',rankLevel:rank.level,required:rank.setPiecesRequired,count:rank.setPiecesRequired,level:1};assert.equal(w.MHWValidatedNonDamageBonusEffects([e]).length,1);assert.equal(w.MHWValidatedNonDamageBonusEffects([e,e]).length,0);assert.equal(w.MHWValidatedNonDamageBonusEffects([{...e,rankLevel:99}]).length,0);assert.equal(w.MHWValidatedNonDamageBonusEffects([{...e,level:2}]).length,0);checks.push({id,rank:rank.level,valid:true,duplicateRankLevelRejected:true});}}
 cases.push({label:'series-classification-only',checks});
 // Public calcBuild invocation with one boundary-corrupted activation, recorded separately.
 const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(input){const stats=JSON.parse(JSON.stringify(input.stats));stats.activeBonusEffects[0].rankLevel=99;stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,Object.fromEntries(input.skills),input.weapon.kind,input.conditions);return adapter.evaluateCurrent({...input,stats});}};
 w.calcBuild();const invalid={label:'series-rank-boundary-injection',...take(w)};cases.push(invalid);assert.ok(JSON.stringify(invalid.result).includes('BONUS_DAMAGE_EFFECT_PENDING'));w.MHWRealOneHitBrowserAdapter=adapter;
 }w.close();
}catch(e){failed=String(e.stack||e);process.exitCode=1;}
console.log(JSON.stringify({phase:before?'before':'after',cases,failed,scope:'Synthetic contract equipment, JSDOM real page/public calcBuild; no actual equipment legality or game/Safari verification',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));
