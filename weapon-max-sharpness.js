// r183: maximum-only sharpness; no gauge depletion, inferred color, or user-entered multiplier.
(function(root){'use strict';
const MULTIPLIERS=Object.freeze({red:[0.5,0.25],orange:[0.75,0.5],yellow:[1,0.75],green:[1.05,1],blue:[1.2,1.0625],white:[1.32,1.15],purple:[1.39,1.25]});
const ORDER=Object.freeze(Object.keys(MULTIPLIERS));
// MHDB: each entry counts Handicraft levels allocated to successive colors.
function fromMHDB(weapon,level=0){
 const source='https://docs.wilds.mhdb.io/#handicraft';
 if(!Number.isInteger(level)||level<0||level>5)return {reason:'HANDICRAFT_LEVEL_INVALID'};
 const base=ORDER.findLastIndex(c=>Number(weapon?.sharpness?.[c])>0);
 if(base<0)return {reason:'SHARPNESS_UNRESOLVED'};
 if(!level)return {color:ORDER[base],level,source};
 const segments=weapon.handicraft;
 if(!Array.isArray(segments)||!segments.length||segments.some(n=>!Number.isInteger(n)||n<0)||segments.reduce((a,b)=>a+b,0)!==5||base+segments.length>ORDER.length)return {reason:'HANDICRAFT_DATA_UNRESOLVED'};
 let remaining=level,color=ORDER[base];
 for(let i=0;i<segments.length&&remaining>0;i++){const used=Math.min(remaining,segments[i]);if(used>0)color=ORDER[base+i];remaining-=used;}
 return {color,level,source,verified:false};
}
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
function format(r){return r.options?'武器の最大斬れ味：'+r.options.maxSharpness+'（物理 '+r.options.sharpnessPhysicalMultiplier+' / 属性 '+r.options.sharpnessElementMultiplier+'）。武器別根拠：'+r.options.sharpnessEvidenceRef+'。実機検証は未完了。':'武器の最大斬れ味を自動取得できません：'+r.blockers.join(', ')+'。倍率の推測や手入力への代替は行いません。';}
const api=Object.freeze({resolve,fromMHDB,format,colors:ORDER});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponMaxSharpness=api;
})(typeof window!=='undefined'?window:globalThis);
