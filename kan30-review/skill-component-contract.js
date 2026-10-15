/* KAN-27 stage 1: metadata only. Never changes legacy damage inputs. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./skill-component-policy.js'):root.MHSkillComponentPolicy);if(typeof module==='object'&&module.exports)module.exports=api;root.MHSkillComponentContract=api;})(typeof globalThis!=='undefined'?globalThis:this,function(P){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const states=['ACTIVE','INACTIVE','UNKNOWN','NOT_APPLICABLE'];
const provenances=['USER_EXPLICIT','EQUIPMENT_DERIVED','RESTORED','UNKNOWN'];
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const strings=x=>Array.isArray(x)&&x.every(v=>typeof v==='string');
function numeric(v){return typeof v==='number'&&Number.isFinite(v)?{value:v,state:'KNOWN'}:{value:null,state:v==null?'UNKNOWN':'INVALID'};}
function evaluate(c={},condition={},channel,scenario={}){
 const decision=['INCLUDE','EXCLUDE','UNRESOLVED'].includes(c.decision)?c.decision:'UNRESOLVED';
 const activation=states.includes(condition.state)?condition.state:'UNKNOWN';
 const result={decision,activation,status:'PENDING',reasons:[]};
 if(decision==='EXCLUDE'){result.status='EXCLUDED';return result;}
 if(decision==='UNRESOLVED'){result.reasons=['COMPONENT_DECISION_UNRESOLVED'];return result;}
 if(channel==='LEGACY_P0'){result.status='CHANNEL_EXCLUDED';return result;}
 if(!['NORMAL','MAXIMUM'].includes(channel)){result.reasons=['CHANNEL_UNRESOLVED'];return result;}
 if(c.conditionClass==='CONDITIONAL'&&channel==='NORMAL'){result.status='CHANNEL_EXCLUDED';return result;}
 if(activation==='UNKNOWN'){result.reasons=['ACTIVATION_UNRESOLVED'];return result;}
 if(activation!=='ACTIVE'){result.status='INACTIVE';return result;}
 if(!['CONSTANT','CONDITIONAL'].includes(c.conditionClass)||!c.applicationStage||!object(c.targets)||!strings(c.targets.damageComponents)||!c.targets.damageComponents.length){result.reasons=['APPLICATION_SCOPE_UNRESOLVED'];return result;}
 if(c.conditionClass==='CONDITIONAL'&&scenario.feasibility!=='CONFIRMED'){result.reasons=['SCENARIO_FEASIBILITY_UNRESOLVED'];return result;}
 result.status='ELIGIBLE';return result;
}
function adaptEffects(effects){
 if(!Array.isArray(effects))return [];
 const out=new Map();
 for(const e of effects){
  if(!object(e))continue;
  const identity=P.identity([e.name,e.bonusName,e.parentName].filter(x=>typeof x==='string'),e.rankLevel);
  const components=['ATTACK','AFFINITY','ELEMENT','EXTRA_DAMAGE','ACTION_MODIFIER','DURATION'];
  for(const component of components){
   const parent=identity?.parent,rank=identity?.rank;
   const id=parent?`${parent.sourceId}:${rank.level}:${component}`:`unresolved:${String(e.name||'')}:${component}`;
   if(out.has(id))continue;
   if(parent){const existing=[...out.values()].filter(c=>c.parent.skillId===parent.sourceId&&c.component===component);if(existing.some(c=>c.effect.rankLevel>rank.level&&c.decision!=='UNRESOLVED'))continue;for(const c of existing)if(c.effect.rankLevel<rank.level&&typeof e.count==='number'&&e.count>=rank.required)out.delete(c.id);}
   const policy=P.resolve(parent?.name,component);
   if(parent&&(!(typeof e.count==='number'&&Number.isFinite(e.count))||e.count<rank.required))policy.decision='UNRESOLVED';
   out.set(id,{id,parent:{skillId:parent?.sourceId??null,name:parent?.name??String(e.bonusName||e.name||''),decision:parent?.decision==='OUT_OF_SCOPE'?'EXCLUDE':parent?.decision??'UNRESOLVED'},effect:{skillId:e.bonusSkillId??null,name:rank?.name??String(e.name||''),rankLevel:rank?.level??null},requiredParts:rank?.required??null,observedParts:numeric(e.count).value,component,...policy,conditionClass:'UNRESOLVED',conditionId:id+':activation',targets:null,applicationStage:null,parameterRefs:[]});
  }
 }
 return [...out.values()];
}
function signature(equipment){return JSON.stringify(equipment);}
function emptyContext(equipmentSignature){return {schemaVersion:1,policyRevision:P.revision,equipmentSignature,conditions:[],scenarioSet:{id:null,definitionRevision:null,coverage:'UNRESOLVED',scenarios:[]},sourceRefs:[]};}
function validCondition(x){return object(x)&&typeof x.id==='string'&&x.id.length>0&&states.includes(x.state)&&provenances.includes(x.provenance)&&strings(x.evidenceRefs)&&strings(x.reasons);}
function validate(x){
 if(!object(x)||typeof x.schemaVersion!=='number'||!Number.isInteger(x.schemaVersion)||x.schemaVersion<1)return 'INVALID_SCHEMA';
 if(x.schemaVersion!==1)return 'UNSUPPORTED_SCHEMA';
 if(x.policyRevision!==P.revision||typeof x.equipmentSignature!=='string'||!Array.isArray(x.conditions)||!x.conditions.every(validCondition)||new Set(x.conditions.map(c=>c.id)).size!==x.conditions.length||!strings(x.sourceRefs)||!object(x.scenarioSet)||!['CONFIRMED','UNRESOLVED'].includes(x.scenarioSet.coverage)||!Array.isArray(x.scenarioSet.scenarios)||new Set(x.scenarioSet.scenarios.map(s=>s?.id)).size!==x.scenarioSet.scenarios.length)return 'INVALID_SCHEMA';
 for(const s of x.scenarioSet.scenarios)if(!object(s)||typeof s.id!=='string'||!['CONFIRMED','UNRESOLVED','INFEASIBLE'].includes(s.feasibility)||!Array.isArray(s.conditionStates)||!s.conditionStates.every(validCondition))return 'INVALID_SCHEMA';
 return 'VALID';
}
function restore(raw,{equipmentSignature,validConditionIds=[],validateCondition}={}){
 if(raw==null)return {status:'ABSENT',context:null,raw:null};
 const status=validate(raw);
 if(status!=='VALID')return {status,context:null,raw:clone(raw)};
 const context=clone(raw),allowed=new Set(validConditionIds),same=typeof equipmentSignature==='string'&&equipmentSignature.length>0&&equipmentSignature===context.equipmentSignature;
 const revalidate=c=>{const valid=same&&allowed.has(c.id)&&c.evidenceRefs.length>0&&typeof validateCondition==='function'&&validateCondition(clone(c))===true;c.provenance='RESTORED';if(!valid){c.state='UNKNOWN';c.reasons=[...new Set([...c.reasons,'RESTORED_CONDITION_NOT_VALIDATED'])];}return c;};
 context.conditions=context.conditions.map(revalidate);
 context.scenarioSet.coverage='UNRESOLVED';
 context.scenarioSet.scenarios=context.scenarioSet.scenarios.map(s=>({...s,conditionStates:s.conditionStates.map(revalidate),feasibility:'UNRESOLVED'}));
 context.equipmentSignature=equipmentSignature??context.equipmentSignature;
 return {status:'VALID',context,raw:null};
}
function pendingProfiles(){const profile=maximum=>({evaluationStatus:'NOT_EVALUATED',damage:null,knownSubtotal:null,referenceProjection:null,completeness:'UNAVAILABLE',verification:'UNRESOLVED',selectionStatus:maximum?'NOT_SELECTED':'NOT_APPLICABLE',isMaximumEstablished:maximum?false:null,stats:null,representativeScenarioId:null,scope:null,missingEffects:[],excludedEffects:[],applicationLedger:[],reasons:['PROFILE_CALCULATION_NOT_CONNECTED']});return {schemaVersion:1,policyRevision:P.revision,legacySource:'EXISTING_FIELDS',profiles:{NORMAL:profile(false),MAXIMUM:profile(true)}};}
return Object.freeze({numeric,evaluate,adaptEffects,signature,emptyContext,validate,restore,pendingProfiles});
});
