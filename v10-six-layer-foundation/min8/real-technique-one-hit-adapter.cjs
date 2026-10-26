'use strict';
// Narrow real-Technique-DB bridge candidate; intentionally NOT wired to production.
// Source of all normative values: caller's existing Technique DB record.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function adaptOrdinaryPhysicalHit({weaponType,techniqueId,record,dbVersion,elementContext,allowUnresolvedElement=false}={}){
  if(!weaponType||!techniqueId||!dbVersion)throw Error('REAL_SLICE:IDENTITY_REQUIRED');
  if(!record||record.techniqueId!==techniqueId||(record.weaponType!==undefined&&record.weaponType!==weaponType))throw Error('REAL_SLICE:DB_IDENTITY_MISMATCH');
  if(!Number.isInteger(record.revision)||record.revision<1)throw Error('REAL_SLICE:REVISION_REQUIRED');
  const shelling=Array.isArray(record.specialComponents)&&record.specialComponents.some(x=>String(x).includes('SHELL'));
  const reference=record.referenceKind==='bow'||record.referenceKind==='light-bowgun'||record.referenceKind==='heavy-bowgun'||record.referenceKind==='heavy-bowgun-element'||record.referenceKind==='light-bowgun-element'||record.referenceKind==='charge-blade-saed'||record.referenceKind==='hunting-horn-sound';
  if(shelling){
   if(record.weaponType!=='gunlance'||record.numericStatus!=='SOURCE_CONFIRMED'||!record.specialSourceValues)throw Error('REAL_SLICE:SHELLING_SOURCE_PENDING');
   const source=record.evidenceRefs[0];
   return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events:[{type:'hit',components:[{id:techniqueId+':shelling:0',kind:'shelling',unit:'SHELLING',source,coefficient:1,parameters:Object.freeze({hitIndex:0,effectTargets:['physical'],effectStages:['attack'],sourceTechniqueId:techniqueId,sourceRecord:Object.freeze({...record}),shellingSource:record.specialSourceValues,shellingAction:record.shellingAction,shellingInput:record.shellingInput})}]}]});
  }
  if(reference){
   const saed=record.phialReference;
  const kan21=record.referenceKind==='charge-blade-saed'&&['CB_SAED','CB_SAED_AED_DERIVED'].includes(techniqueId)
   &&record.calculationScope==='SAED_SOURCE_REFERENCE_ONLY'&&record.evidenceRefs?.includes('KAN21_SAED_SOURCE')
   &&saed?.status==='PROVISIONALLY_ADOPTED'&&saed.sourceConfirmed===true&&saed.liveGameVerification==='PENDING'
   &&saed.approvalRefs?.includes('KAN-21#10057')&&saed.approvalRefs?.includes('KAN-21#10058')
   &&saed.source==='https://kuroyonhon.com/mhwilds/memo/12.php'
   &&saed.sourceVersion===(techniqueId==='CB_SAED'?'AFTER_VER_1_011':'VER_1_02_ONWARD')
   &&saed.hitPolicy==='FULL_STOCK_FULL_HIT'&&saed.hitCount===5&&saed.eventCount===5&&saed.capacitySkillIncreasesStock===false
   &&JSON.stringify(record.hits?.map(h=>[h.mv,h.elementModifier]))==='[[16,1],[78,1],[45,1]]'
   &&['normal','enhanced'].every(k=>finite(saed.powerElement?.[k])&&saed.powerElement[k]>0)
   &&finite(saed.shieldElementMultiplier)&&finite(saed.shieldPhysicalBodyMultiplier);
  if(record.numericStatus&&record.numericStatus!=='SOURCE_CONFIRMED'&&!kan21)throw Error('REAL_SLICE:REFERENCE_SOURCE_PENDING');
   const source=record.evidenceRefs?.[0];if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
   return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events:[{type:'hit',components:[{id:techniqueId+':reference:0',kind:'reference',unit:'REFERENCE',source,coefficient:1,parameters:Object.freeze({hitIndex:0,effectTargets:['physical','element'],effectStages:['attack','affinity','element'],sourceTechniqueId:techniqueId,sourceRecord:Object.freeze({...record}),referenceKind:record.referenceKind,referenceInput:record.referenceInput})}]}]});
  }
  if(!['VERIFIED','PARTIALLY_VERIFIED'].includes(record.verificationStatus))throw Error('REAL_SLICE:VERIFICATION_PENDING');
  if(!Array.isArray(record.evidenceRefs)||record.evidenceRefs.length===0)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  if(!Array.isArray(record.hits)||record.hits.length<1)throw Error('REAL_SLICE:HITS_REQUIRED');
  if((record.specialComponents?.length||0)>0)throw Error('REAL_SLICE:SPECIAL_ROUTE_PENDING');
  const provisionalHpOnly=record.techniqueId==='IG_ENHANCED_DIAGONAL_SLASH'&&record.hpOnlyProvisional==='IG_ENHANCED_DIAGONAL_SLASH_20261025'&&record.numericStatus==='SOURCE_CONFIRMED'&&record.verificationStatus==='PARTIALLY_VERIFIED'&&Array.isArray(record.hits)&&record.hits.length===2&&record.hits.every(hit=>finite(hit.mv)&&hit.mv>=0&&finite(hit.elementModifier)&&hit.elementModifier>=0)&&(!record.specialComponents||record.specialComponents.length===0);
  if(record.calculationStatus==='EVIDENCE_GATED'&&!provisionalHpOnly)throw Error('REAL_SLICE:EVIDENCE_GATED');
  const source=record.evidenceRefs[0];
  if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  const elementResolved=elementContext?.displayElement===0&&elementContext?.effectsResolved===true&&Array.isArray(elementContext.activeElementEffects)&&elementContext.activeElementEffects.length===0;
  const events=[],excludedElements=[];
  record.hits.forEach((hit,index)=>{
   if(!finite(hit.mv)||hit.mv<0||!finite(hit.elementModifier)||hit.elementModifier<0)throw Error('REAL_SLICE:HIT_FIELDS_PENDING:'+index);
   if(hit.elementModifier!==0&&!elementResolved&&!allowUnresolvedElement)throw Error('REAL_SLICE:ELEMENT_COMPONENT_PENDING:'+index);
   // Preserve the sourced part-durability modifier for provenance. The
   // canonical HP formula validates it but does not apply it to HP damage.
   const stateMetadata={resourceContract:record.resourceContract||null,stateRequirement:record.stateRequirement&&Object.keys(record.stateRequirement).length?Object.freeze({...record.stateRequirement}):null,damageStateTransition:record.damageStateTransition?Object.freeze({...record.damageStateTransition}):null,damageStatsState:hit.damageStatsState??record.damageStateTransition?.damageStatsState??(provisionalHpOnly?'TRIPLE_EXTRACT':null),adoption:provisionalHpOnly?Object.freeze({status:'OWNER_APPROVED_PROVISIONAL',approvedAt:'2026-10-25',scope:'HP_DAMAGE_ONLY',sourceGameVersion:record.baselineGameVersion??null,officialVersionAudit:record.currentVersionAudit??'PENDING',unresolvedReasons:Array.isArray(record.unresolvedReasons)?[...record.unresolvedReasons]:[]}):null};
   const partModifierKnown=finite(hit.partModifier);
   const components=[{id:techniqueId+':physical:'+index,kind:'physical',unit:'MV',source,coefficient:hit.mv,parameters:Object.freeze({partModifier:partModifierKnown?hit.partModifier:null,partModifierStatus:partModifierKnown?'RESOLVED':'UNRESOLVED',partModifierSource:hit.partModifierSource??source,shieldBoostAxeBody:record.shieldBoostAxeBody===true,elementModifier:hit.elementModifier,damageType:hit.damageType??null,hitIndex:index,...stateMetadata})}];
   if(hit.elementModifier>0)components.push({id:techniqueId+':element:'+index,kind:'element',unit:'ELEMENT_MODIFIER',source,coefficient:hit.elementModifier,parameters:Object.freeze({elementModifier:hit.elementModifier,elementSource:source,damageType:hit.damageType??null,hitIndex:index,...stateMetadata})});
   events.push({type:'hit',components});
   if(elementResolved&&hit.elementModifier!==0)excludedElements.push({coefficient:hit.elementModifier,source,reason:'CONFIRMED_ZERO_ELEMENT_NO_EFFECTS',hitIndex:index});
  });
  if(record.phialReference?.status==='OBSERVED'&&Number.isInteger(record.phialReference.hitCount)&&record.phialReference.hitCount>0){
   const phialTarget=record.phialState?.phialType==='POWER_ELEMENT'?'element':'physical';
   events[0].components.push({id:techniqueId+':phial:0',kind:'phial',unit:'PHIAL',source:record.phialReference.sourceRefs?.[0]??source,coefficient:1,parameters:Object.freeze({hitIndex:0,phialCount:record.phialReference.hitCount,phialReference:Object.freeze({...record.phialReference}),phialState:record.phialState?Object.freeze({...record.phialState}):null,excludedEffectIds:record.resourceContract?[record.resourceContract.rapidMorphEffectId]:[],effectTargets:[phialTarget],effectStages:[phialTarget==='element'?'element':'attack'],sourceTechniqueId:techniqueId})});
  }
  if(record.resourceContract){
   const r=record.resourceContract;
   if(weaponType!=='charge-blade'||techniqueId!=='CB_ELEMENT_DISCHARGE_1'||r.id!=='CB_ED1_NORMAL_RESOURCE'||r.status!=='OWNER_APPROVED'||!Number.isInteger(r.consumeNormalPhials)||r.consumeNormalPhials<=0)throw Error('REAL_SLICE:CB_ED1_RESOURCE_CONTRACT_INVALID');
   events.push({type:'consume',contract:r.id,source:r.source,resourcePath:['chargeBlade','normalPhials'],amount:r.consumeNormalPhials});
   events.push({type:'transition',contract:r.id,source:r.source,operations:[{op:'set',path:['chargeBlade','previousAction'],value:techniqueId}]});
  }
  return Object.freeze({
    id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',
    elementModifier:record.hits.map(hit=>hit.elementModifier),
    excludedElement:excludedElements.length?excludedElements:null,
    events,
    adoption:provisionalHpOnly?Object.freeze({status:'OWNER_APPROVED_PROVISIONAL',approvedAt:'2026-10-25',scope:'HP_DAMAGE_ONLY',sourceGameVersion:record.baselineGameVersion??null,officialVersionAudit:record.currentVersionAudit??'PENDING',unresolvedReasons:Array.isArray(record.unresolvedReasons)?[...record.unresolvedReasons]:[]}):null
  });
}
module.exports={adaptOrdinaryPhysicalHit};
