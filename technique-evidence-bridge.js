// r171: read-only provenance projection for Technique DB and combo stages. Never promotes reference damage to verified DPS.
(function(root){'use strict';
function inspect(weaponType,techniqueIds,getAudit){
 if(typeof weaponType!=='string'||!weaponType||!Array.isArray(techniqueIds)||!techniqueIds.length||techniqueIds.length>200||typeof getAudit!=='function')throw new TypeError('weapon, technique IDs and audit reader required');
 const entries=techniqueIds.map((id,index)=>{
  if(typeof id!=='string'||!id)throw new TypeError('invalid technique ID');
  const a=getAudit(weaponType,id);
  if(!a||a.techniqueId!==id||a.weaponType!==weaponType)return Object.freeze({index,techniqueId:id,status:'MISSING_TECHNIQUE',evidenceRefs:Object.freeze([]),calculable:false});
  const evidence=Array.isArray(a.evidence)?a.evidence:[];
  const refs=[...(Array.isArray(a.evidenceRefs)?a.evidenceRefs:[]),...evidence.filter(x=>x&&x.registered===true).map(x=>x.ref)].filter(x=>typeof x==='string'&&x.trim());
  const unresolved=evidence.some(x=>!x||x.registered!==true);
  const reasons=Object.freeze([...(Array.isArray(a.reasons)?a.reasons:[]),...(unresolved?['UNREGISTERED_EVIDENCE_REF']:[])]);
  return Object.freeze({index,techniqueId:id,status:a.calculable===true?'TECHNIQUE_CALCULABLE':'TECHNIQUE_PENDING',verificationStatus:a.verificationStatus||'UNKNOWN',evidenceRefs:Object.freeze([...new Set(refs)]),calculable:a.calculable===true,unresolvedEvidence:unresolved,reasons});
 });
 return Object.freeze({weaponType,scope:'TECHNIQUE_DB_READ_ONLY_PROVENANCE',entries:Object.freeze(entries),captureEligible:false,damage:null,durationSeconds:null,reason:'COMPONENT_DAMAGE_AND_VERIFIED_DURATION_NOT_PROVIDED'});
}
function inspectCombo(weaponType,stages,getAudit){
 if(!Array.isArray(stages)||!stages.length||stages.length>200)throw new TypeError('combo stages required');
 const ids=stages.map(s=>s&&s.techniqueId);
 const provenance=inspect(weaponType,ids,getAudit);
 const entries=provenance.entries.map((p,index)=>{
  const stage=stages[index];
  const pending=[];
  if(!p.calculable)pending.push('TECHNIQUE_NUMERIC_PENDING');
  if(p.unresolvedEvidence||!p.evidenceRefs.length)pending.push('TECHNIQUE_PROVENANCE_PENDING');
  if(stage.calculationBlocked)pending.push('COMBO_STAGE_BLOCKED');
  // A reference must be present in the registered Technique DB evidence set;
  // self-declared stage evidence alone never satisfies provenance checks.
  const timingRef=typeof stage.timingEvidence==='string'?stage.timingEvidence.trim():'';
  const damageRefs=Array.isArray(stage.componentDamageEvidence)?stage.componentDamageEvidence:
    (typeof stage.componentDamageEvidence==='string'?[stage.componentDamageEvidence]:[]);
  const normalizedDamageRefs=damageRefs.filter(ref=>typeof ref==='string'&&ref.trim()).map(ref=>ref.trim());
  if(stage.timingStatus!=='VERIFIED'||!timingRef)pending.push('VERIFIED_STAGE_TIMING_PENDING');
  if(!normalizedDamageRefs.length)pending.push('VERIFIED_COMPONENT_DAMAGE_PENDING');
  if(timingRef&&!p.evidenceRefs.includes(timingRef))pending.push('STAGE_TIMING_EVIDENCE_NOT_REGISTERED');
  if(normalizedDamageRefs.some(ref=>!p.evidenceRefs.includes(ref)))pending.push('COMPONENT_DAMAGE_EVIDENCE_NOT_REGISTERED');
  return Object.freeze({...p,pending:Object.freeze(pending),stageTimingStatus:stage.timingStatus||'PENDING',
    timingEvidenceRegistered:!!timingRef&&p.evidenceRefs.includes(timingRef),
    componentEvidenceRegistered:normalizedDamageRefs.length>0&&normalizedDamageRefs.every(ref=>p.evidenceRefs.includes(ref))});
 });
 return Object.freeze({...provenance,scope:'COMBO_TECHNIQUE_PROVENANCE_AUDIT',entries:Object.freeze(entries),captureEligible:false,reason:'LIVE_GAME_COMPONENT_DAMAGE_AND_COMBO_DURATION_NOT_VERIFIED'});
}
const api=Object.freeze({inspect,inspectCombo});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWTechniqueEvidenceBridge=api;
})(typeof window!=='undefined'?window:globalThis);
