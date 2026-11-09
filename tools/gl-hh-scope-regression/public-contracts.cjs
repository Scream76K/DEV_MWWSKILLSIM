'use strict';
// All states below are handwritten synthetic fixtures, never selected equipment,
// saved builds, database exports or captured private results. Source records are
// evaluated from the existing public index.html, independently of gate fingerprints.
const prior=require('../sa-hh-scope-regression/public-contracts.cjs');
const fs=require('node:fs'),path=require('node:path');
const {clone,plain,line,section,publicDb,run,hhSynthetic,components,result}=prior;
const adapter=fs.readFileSync(process.env.GL_HH_ADAPTER_FILE||path.join(prior.root,'hope-hammer-browser-adapter.js'),'utf8');
const helpers=['const chargeIdentity=','const knownNoElement=','const zeroElementComponents=','const noAddedElement='].map(m=>line(adapter,m)).join('\n');
const componentHook=line(adapter,'resolveComponentIssue:');
const hhApply=line(adapter,'if(hhThunderZeroResolved&&entry.skillId===165)');
const hhGuard=line(adapter,'if(hhThunderZeroResolved&&Object.values(evaluated.channels||{}).some(');
const hhProduction=[helpers,line(adapter,'const emptyResistance='),line(adapter,'const zeroBodyState='),section(adapter,'  const hhChargeEqual=','  let conditionPlan='),'({resolved:hhThunderZeroResolved,issue:conversionMaximumIssue,apply:entries=>entries.map(entry=>{'+hhApply+'return {unhandled:true,entry};}),componentValid:hhChargeComponentValid,resultValid:hhChargeResultValid,componentIssue:({'+componentHook+'}).resolveComponentIssue,guardResult:evaluated=>{'+hhGuard+'return {accepted:true};}})'].join('\n');
const glApply=line(adapter,'if((glOrdinaryAirborne&&Number(entry.skillId)===86)');
const glGuard=line(adapter,'if(glOrdinaryActive&&Object.values(evaluated.channels||{}).some(');
const glProduction=[helpers,line(adapter,'const glTargetIds='),section(adapter,'  const glChargeNoAlternate=','  const glChargeNonchargedResolved='),section(adapter,'  const glOrdinaryRecords=','  const partbreakerBodyIds='),'({resolved:glOrdinaryResolved,active:glOrdinaryActive,airborne:glOrdinaryAirborne,partbreaker:glOrdinaryPartbreaker,omega:glOrdinaryOmegaInactive,apply:entries=>entries.map(entry=>{'+glApply+'return {unhandled:true,entry};}),componentValid:glOrdinaryComponentValid,resultValid:glOrdinaryResultValid,componentIssue:({'+componentHook+'}).resolveComponentIssue,guardResult:evaluated=>{'+glGuard+'return {accepted:true};}})'].join('\n');
const glIds=['GL_SLAM','GL_SWEEP','GL_WYRMSTAKE_FULL_BURST','GL_MULTI_WYRMSTAKE_FULL_BURST'];
const element=()=>({element:0,elementType:'none',elementKnown:true,typeKnown:true,elementStatus:'CONFIRMED_NONE',elementComponents:{weaponBase:0,normalMultiplier:1,normalFlat:0},activeBonusEffects:[]});
function hhThunderSynthetic(){
 const s=hhSynthetic(),c=s.c,p=c.resolvedConditionPlan;
 // Synthetic identity shape, not an imported private MHDB record.
 const skill={id:165,gameId:30201,name:'耐性変換【雷】',kind:'weapon',ranks:[{skill:{id:165},level:1,name:null,description:'スキル効果発動',setPiecesRequired:null,id:422}]};
 s.skill=skill;c.root.__getBetaDB=()=>({skills:[skill]});
 c.weapon.damage={raw:1,display:1};c.weapon.affinity=0;c.weapon.skills=[];
 const rows=()=>['head','chest','arms','waist','legs'].map(slot=>({slot,equipped:false,value:0}));
 for(const x of [c.stats,p.normal,p.maximum])Object.assign(x,{attackKnown:true,affinityKnown:true,weaponKind:'hunting-horn',attackTrue:1,attack:1,affinity:0,maxAffinity:0,attackComponents:{weaponBase:1,normalMultiplier:1,normalFlat:0},thunderResistanceInput:{status:'KNOWN_LIMITED',armorBase:0,total:0,rows:rows(),missing:[],reason:null,contributions:[],scope:'ARMOR_SKILLS_PLUS_EXPLICIT_GUTS_VEIL_NO_FOOD_OR_AMMO',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',source:'https://kuroyonhon.com/mhwilds/program/skill.php',verificationStatus:'UNVERIFIED'},armorThunderResistanceInput:{status:'ARMOR_BASE_ONLY',armorBase:0,total:null,rows:rows(),missing:[],reason:'SKILL_BUFF_TOTAL_AND_CONVERSION_ACTIVATION_NOT_RESOLVED'}});
 Object.assign(p,{attackComponents:{weaponBase:1,normalMultiplier:1,normalFlat:0,conditionalMultiplier:1,groupMultiplier:1,conditionalFlat:0},applied:[],groupPlan:{applied:[],unresolvedEffects:[],nonDamageEffects:[],attackMultiplier:1,maximumFlat:0,gutsState:'BEFORE'},selfStatePlan:{normal:[],maximum:[],ids:[],pending:[]},blackEclipse:null,frenzyAffinity:{active:false}});
 Object.assign(c.conditions,{absorbedElement:null,gutsState:'BEFORE',selfSkillState:{shared:{omega:'INACTIVE'}},combatBuffs:{meal:null,charm:null,otherBuffs:null}});
 Object.assign(c,{chargeNoElementEntries:[],skills:[['耐性変換【雷】',1]],buildSkills:[{skillId:165,id:'165',name:'耐性変換【雷】',level:1,rank:0,skillKey:'resistanceConversionThunder',source:'index.html:calcBuild',effectCategory:null}],standardConversion:true,resistanceConversionLevel:1,resistanceConversionCoefficient:5,resistanceConversionAdd:0,absorptionConversionPlan:null,conversionComponentsSupported:true,conversionMaximumIssue:'REAL_SLICE:THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED'});
 c.allSkills=clone(c.buildSkills);c.root.MHWElementCapRule={status:'OWNER_APPROVED_PROVISIONAL',flat:1,multiplier:1};return s;
}
function glSynthetic(id=86,level=1){
 const raw=Object.fromEntries([...glIds,'GL_SHELL_NORMAL_MEDIUM'].map(id=>[id,clone(publicDb.get('gunlance',id))])),canonical=clone(raw),stats=element();
 const name=id===86?'飛燕':'破壊王',entry={skillId:id,name,level};
 const state={shellingType:'NORMAL',shellingPower:'MEDIUM',loadedRounds:6,chargedRounds:null,stakeLoaded:true,fireHitzone:0},plan={normal:element(),maximum:element(),maximumElementComponents:{weaponBase:0,normalMultiplier:1,normalFlat:0,conditionalFlat:0},applied:[],groupPlan:{applied:[]},selfStatePlan:{normal:[],maximum:[]}};
 const c={weapon:{kind:'gunlance',shell:'normal',shellLevel:2,phial:null,artiaShellEvidence:null,specials:[],skills:[]},conditions:{standardEvaluation:true,mounted:false,gunlanceState:clone(state),selfSkillState:{shared:{omega:'INACTIVE'}}},gunlanceState:state,stats,resolvedConditionPlan:plan,activeBonusEffects:stats.activeBonusEffects,allSkills:[clone(entry)],rawSkills:[],buildSkills:[clone(entry)],skills:[[name,level]],attributeConversionLevel:0,resistanceConversionLevel:0,waterEntries:[],resolvedTechniqueIds:[...glIds],techniques:{},shellingInput:{loadShellsLevel:0,unreviewedSkills:[name]},root:{TechniqueDBEngine:{get:(_kind,id)=>canonical[id]}},techniqueDb:{get:(_kind,id)=>raw[id]},hhThunderZeroResolved:false,hhChargeNoElementResolved:false,contextAttackEntries:[],fail:reason=>({accepted:false,reason})};
 function generate(){const rules=raw[glIds[2]].glTargetRules;c.glTargetContext={rules,row:rules.powerRows.NORMAL_MEDIUM,capacity:6,input:c.shellingInput};for(const [i,id]of glIds.entries()){const r=raw[id],a=rules.actions[id];c.techniques[id]=i<2?clone(r):{...r,specialComponents:[],calculationStatus:'READY_BODY_COMPONENT',hits:[...rules.body.map(h=>({...h,damageType:'slash'})),...Array.from({length:a.burstCount},()=>({mv:c.glTargetContext.row.burstMv,elementModifier:rules.burstElementModifier,damageType:'slash',glComponent:'STAKE_BURST'}))],glModel:{...c.glTargetContext,action:a,id},glComponentContract:{status:rules.status,source:rules.source,noSharpnessMultiplier:rules.noSharpnessMultiplier}};}}
 generate();return {c,raw,canonical,generate};
}
function omegaSynthetic(rank=1){
 const s=glSynthetic(),c=s.c,count=rank===1?2:4,name=rank===1?'レゾナンスⅠ':'レゾナンスⅡ';
 c.allSkills=[{name,level:1,skillKey:'unknown'}];c.buildSkills=clone(c.allSkills);c.skills=[[name,1]];c.shellingInput.unreviewedSkills=[name];
 c.stats.activeBonusEffects.push({name,level:1,source:'series',displayType:'series',bonusName:'オメガレゾナンス',bonusSkillId:173,rankLevel:rank,count,required:count});
 const slots=['head','chest','arms','waist','legs'];
 // Fictional armor identifiers and zero resistance. These exercise the exact
 // predicate interface, not the real UI armor/bonus producers or game database.
 s.armor=slots.slice(0,count).map((kind,i)=>({id:'synthetic-armor-'+i,kind,resistances:{thunder:0}}));
 c.stats.armorThunderResistanceInput={status:'ARMOR_BASE_ONLY',armorBase:0,missing:[],rows:slots.map((slot,i)=>i<count?{slot,equipped:true,id:s.armor[i].id,value:0,sourceUrl:'https://wilds.mhdb.io/ja/armor/'+s.armor[i].id}:{slot,equipped:false,value:0})};
 c.root.__getBetaDB=()=>({armor:s.armor});c.root.armorBonusSkillObjects=()=>[{id:173,name:'オメガレゾナンス'}];c.root.bonusSkillObjects=()=>[];c.root.groupSetData=()=>null;
 const row={skillId:173,skill:'オメガレゾナンス',attackAdd:0,affinityAdd:0,elementAdd:0,source:'https://kuroyonhon.com/mhwilds/program/skill.php',status:'OWNER_APPROVED_PROVISIONAL',scope:'EXPLICIT_SELF_STATE;WEAPON_ELEMENT_ONLY;NO_TIME_INFERENCE'};
 const plan=c.resolvedConditionPlan;plan.selfStatePlan={normal:[clone(row)],maximum:[clone(row)],ids:[173],pending:[]};s.producedSelf={normal:[clone(row)],maximum:[clone(row)],pending:[]};c.root.MHWAdoptedSelfStatePlan=()=>s.producedSelf;
 const applied={skill:name,parent:'オメガレゾナンス',skillId:173,attackAdd:0,attackMultiplier:1,bonusSource:true,appliesToNormal:true,condition:'EXPLICIT_SELF_STATE',numericOrigin:'OWNER_APPROVED_PROVISIONAL'};plan.applied=[clone(applied)];plan.groupPlan.applied=[clone(applied)];return s;
}
function glComponents(s){
 const c=s.c,rows=[],build={element:0,elementType:'none',equipment:{elementComponents:{weaponBase:0,normalMultiplier:1,normalFlat:0}}};
 const body=(id,t,h,i,kind)=>({id:id+':'+kind+':'+i,kind,unit:kind==='physical'?'MV':'ELEMENT_MODIFIER',source:t.evidenceRefs[0],coefficient:kind==='physical'?h.mv:h.elementModifier,parameters:{...(kind==='physical'?{partModifier:null,partModifierStatus:'UNRESOLVED',partModifierSource:t.evidenceRefs[0],shieldBoostAxeBody:false}:{elementModifier:h.elementModifier,elementSource:t.evidenceRefs[0]}),...(kind==='physical'?{elementModifier:h.elementModifier}:{}),damageType:'slash',hitIndex:i,glComponent:h.glComponent??null,glSharpnessOverride:h.glComponent?{value:1,source:c.glTargetContext.rules.source}:null,excludedEffectIds:[],saHitMode:null,resourceContract:null,stateRequirement:null,damageStateTransition:null,damageStatsState:null,adoption:null}});
 for(const [ordinal,id]of glIds.entries()){
  const t=c.techniques[id];
  for(const [i,h]of t.hits.entries()){const pair=['physical','element'].map(k=>body(id,t,h,i,k)),step=ordinal<2?0:i===0?1:i+3,rounds=ordinal<2||i===0?6:0;for(const component of pair)rows.push({component,event:{type:'hit',components:pair,id:ordinal+':'+step,techniqueId:id,revision:'2'},state:{gunlance:{loadedRounds:rounds,stakeLoaded:true}},build:clone(build),effects:[]});}
  if(ordinal>=2)for(const i of [0,1]){const component={id:id+':shelling:'+i,kind:'shelling',unit:'SHELLING',source:c.glTargetContext.rules.source,coefficient:1,parameters:{hitIndex:i,effectTargets:['physical'],effectStages:['attack'],glTarget:{component:i===0?'FULL_BURST':'FINAL_EXPLOSION',model:t.glModel},sourceTechniqueId:id}};rows.push({component,event:{type:'hit',components:[component],id:ordinal+':'+(i===0?2:t.hits.length+3),techniqueId:id,revision:'2'},state:{gunlance:{loadedRounds:i===0?6:0,stakeLoaded:true}},build:clone(build),effects:[]});}
 }return rows;
}
function glResult(s){
 const rows=[];for(const [ordinal,id]of glIds.entries()){const hits=s.c.techniques[id].hits;for(const [i]of hits.entries()){for(const kind of ['physical','element'])rows.push({id:id+':'+kind+':'+i,status:'available',value:kind==='element'?0:1});if(ordinal>=2&&i===0)rows.push(shell(id,0));}if(ordinal>=2)rows.push(shell(id,1));}
 function shell(id,i){return {id:id+':shelling:'+i,status:'available',value:1,details:{component:i===0?'FULL_BURST':'FINAL_EXPLOSION',count:i===0?6:1,trace:Array.from({length:i===0?6:1},()=>({synthetic:true})),element:1,source:s.c.glTargetContext.rules.source}};}
 const steps=['0:0','1:0',...Array.from({length:16},(_,i)=>'2:'+i),...Array.from({length:22},(_,i)=>'3:'+i)];return {metrics:{comboTotalDamage:{status:'available'}},execution:{status:'complete',expected:clone(steps),executed:clone(steps)},finalState:{gunlance:{loadedRounds:0,stakeLoaded:false}},components:rows};
}
module.exports={...prior,adapter,hhProduction,glProduction,glIds,hhThunderSynthetic,glSynthetic,omegaSynthetic,glComponents,glResult};
