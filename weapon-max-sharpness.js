// r183: maximum-only sharpness; no gauge depletion, inferred color, or user-entered multiplier.
(function(root){'use strict';
const MULTIPLIERS=Object.freeze({red:[0.5,0.25],orange:[0.75,0.5],yellow:[1,0.75],green:[1.05,1],blue:[1.2,1.0625],white:[1.32,1.15],purple:[1.39,1.25]});
const ORDER=Object.freeze(Object.keys(MULTIPLIERS));
function resolve(weapon,context){
 const blockers=[];
 if(!weapon||typeof weapon!=='object'||Array.isArray(weapon))blockers.push('WEAPON_REQUIRED');
 const value=weapon?.maxSharpness;
 if(typeof value!=='string'||!Object.hasOwn(MULTIPLIERS,value))blockers.push('WEAPON_MAX_SHARPNESS_NOT_RECORDED');
 // A maxSharpness field is only trusted when accompanied by a weapon-specific provenance reference.
 const ref=weapon?.maxSharpnessEvidenceRef;
 if(typeof ref!=='string'||!ref.trim()||ref.length>240)blockers.push('WEAPON_SHARPNESS_SOURCE_REQUIRED');
 if(!context||!Array.isArray(context.rows)||!context.rows.length)blockers.push('HANDOFF_REQUIRED');
 else if(context.rows.some(r=>r.status!=='ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'))blockers.push('CONTEXT_HANDOFF_NOT_READY');
 const result=blockers.length?null:Object.freeze({sharpnessPhysicalMultiplier:MULTIPLIERS[value][0],sharpnessElementMultiplier:MULTIPLIERS[value][1],sharpnessEvidenceRef:ref.trim(),maxSharpness:value});
 return Object.freeze({status:result?'WEAPON_MAX_SHARPNESS_REFERENCE_ONLY':'WEAPON_MAX_SHARPNESS_BLOCKED',options:result,blockers:Object.freeze(blockers),verified:false,sharpnessDepletionApplied:false});
}
// Equipment calculation has no engine-handoff prerequisite; retain resolve's audit contract.
function resolveEquipment(weapon,{handicraftLevel=0,artia=false,allowOwnerProvisional=false}={}){
 const blockers=[];
 if(!Number.isInteger(handicraftLevel)||handicraftLevel!==0)blockers.push('HANDICRAFT_SHARPNESS_NOT_AUDITED');
 if(artia||weapon?.selectedUpgradeSharpness!==undefined||weapon?.selectedArtiaSharpness!==undefined||weapon?.artiaFixedVariants!==undefined)blockers.push('WEAPON_VARIANT_SELECTION_NOT_AUDITED');
 const adapter=typeof module!=='undefined'&&module.exports?require('./weapon-sharpness-schema-adapter.js'):root.MHWWeaponSharpnessSchemaAdapter;
 const adapted=adapter?.adapt(weapon);
 // Opt-in applies only to genuinely absent fields; malformed or unsourced data never qualifies.
 if(!blockers.length&&allowOwnerProvisional===true&&adapted?.missingReason==='SHARPNESS_FIELDS_ABSENT'){
  if(!Number.isInteger(weapon.id)||weapon.id<=0)blockers.push('WEAPON_ID_REQUIRED_FOR_OWNER_PROVISIONAL');
  else{
   const ref='owner-decision:KAN-47/10735;KAN-72/10736';
   const provenance=Object.freeze({schemaVersion:1,weaponId:weapon.id,basis:'OWNER_PROVISIONAL_MISSING_WHITE',ownerProvisional:true,missingReason:adapted.missingReason,decisionRef:'KAN-47:10735;KAN-72:10736',evidenceRef:ref,verificationStatus:'UNVERIFIED',liveGameVerification:'PENDING'});
   return Object.freeze({status:'WEAPON_MAX_SHARPNESS_OWNER_PROVISIONAL',options:Object.freeze({sharpnessPhysicalMultiplier:MULTIPLIERS.white[0],sharpnessElementMultiplier:MULTIPLIERS.white[1],sharpnessEvidenceRef:ref,maxSharpness:'white',sharpnessProvenance:provenance}),blockers:Object.freeze([]),verified:false,sharpnessDepletionApplied:false});
  }
 }
 if(!adapted?.weapon)blockers.push(...(adapted?.blockers||['SHARPNESS_SCHEMA_ADAPTER_UNAVAILABLE']));
 if(blockers.length)return Object.freeze({status:'WEAPON_MAX_SHARPNESS_BLOCKED',options:null,blockers:Object.freeze(blockers),verified:false,sharpnessDepletionApplied:false});
 const w=adapted.weapon,color=w.maxSharpness;
 const provenance=Object.freeze({schemaVersion:1,weaponId:w.id??null,basis:'WEAPON_RECORD_MAXIMUM',ownerProvisional:false,missingReason:null,decisionRef:null,evidenceRef:w.maxSharpnessEvidenceRef,verificationStatus:'UNVERIFIED',liveGameVerification:'PENDING'});
 return Object.freeze({status:'WEAPON_MAX_SHARPNESS_REFERENCE_ONLY',options:Object.freeze({sharpnessPhysicalMultiplier:MULTIPLIERS[color][0],sharpnessElementMultiplier:MULTIPLIERS[color][1],sharpnessEvidenceRef:w.maxSharpnessEvidenceRef,maxSharpness:color,sharpnessProvenance:provenance}),blockers:Object.freeze([]),verified:false,sharpnessDepletionApplied:false});
}
function format(r){return r.options?'武器の最大斬れ味：'+r.options.maxSharpness+'（物理 '+r.options.sharpnessPhysicalMultiplier+' / 属性 '+r.options.sharpnessElementMultiplier+'）。武器別根拠：'+r.options.sharpnessEvidenceRef+'。実機検証は未完了。':'武器の最大斬れ味を自動取得できません：'+r.blockers.join(', ')+'。倍率の推測や手入力への代替は行いません。';}
const api=Object.freeze({resolve,resolveEquipment,format,colors:ORDER});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponMaxSharpness=api;
})(typeof window!=='undefined'?window:globalThis);
