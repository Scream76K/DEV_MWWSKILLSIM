'use strict';
// Narrow real-Technique-DB bridge candidate; intentionally NOT wired to production.
// Source of all normative values: caller's existing Technique DB record.
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function adaptOrdinaryPhysicalHit({weaponType,techniqueId,record,dbVersion}={}){
  if(!weaponType||weaponType==='charge-blade'||!techniqueId||!dbVersion)throw Error('REAL_SLICE:IDENTITY_REQUIRED');
  if(!record||record.techniqueId!==techniqueId||(record.weaponType!==undefined&&record.weaponType!==weaponType))throw Error('REAL_SLICE:DB_IDENTITY_MISMATCH');
  if(!Number.isInteger(record.revision)||record.revision<1)throw Error('REAL_SLICE:REVISION_REQUIRED');
  if(!['VERIFIED','PARTIALLY_VERIFIED'].includes(record.verificationStatus))throw Error('REAL_SLICE:VERIFICATION_PENDING');
  if(!Array.isArray(record.evidenceRefs)||record.evidenceRefs.length===0)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  if(!Array.isArray(record.hits)||record.hits.length!==1)throw Error('REAL_SLICE:SINGLE_HIT_REQUIRED');
  if((record.specialComponents?.length||0)>0||record.stateRequirement&&Object.keys(record.stateRequirement).length>0||record.damageStateTransition)throw Error('REAL_SLICE:SPECIAL_ROUTE_PENDING');
  const hit=record.hits[0];
  if(!finite(hit.mv)||hit.mv<0||!finite(hit.elementModifier)||hit.elementModifier<0)throw Error('REAL_SLICE:HIT_FIELDS_PENDING');
  if(hit.damageStatsState!==undefined&&hit.damageStatsState!==null)throw Error('REAL_SLICE:STATE_DEPENDENT_HIT');
  if(hit.elementModifier!==0)throw Error('REAL_SLICE:ELEMENT_COMPONENT_PENDING');
  if(record.calculationStatus==='EVIDENCE_GATED')throw Error('REAL_SLICE:EVIDENCE_GATED');
  const source=record.evidenceRefs[0];
  if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  return Object.freeze({
    id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',
    events:[{type:'hit',components:[{id:techniqueId+':physical:0',kind:'physical',unit:'MV',source,coefficient:hit.mv}]}]
  });
}
module.exports={adaptOrdinaryPhysicalHit};
