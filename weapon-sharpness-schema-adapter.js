// Explicit provenance contract plus the audited MHDB color-keyed base gauge.
(function(root){'use strict';
const COLORS=new Set(['red','orange','yellow','green','blue','white','purple']);
function adapt(weapon){
 const blockers=[];
 if(!weapon||typeof weapon!=='object'||Array.isArray(weapon))return Object.freeze({weapon:null,status:'BLOCKED',blockers:Object.freeze(['WEAPON_REQUIRED'])});
 // Trust only the explicit sourced maximum or the audited seven-color MHDB base gauge.
 // MHDB requires integer segments with a cumulative maximum of 400 (docs.wilds.mhdb.io/#sharpness).
 // Upgrade/Artia states remain separately gated; no variant is inferred.
 let color=weapon.maxSharpness,ref=weapon.maxSharpnessEvidenceRef;
 if(weapon.sharpness!==undefined){
  const gauge=weapon.sharpness,colors=[...COLORS];
  const valid=gauge&&typeof gauge==='object'&&!Array.isArray(gauge)&&Object.keys(gauge).length===colors.length&&colors.every(c=>Object.hasOwn(gauge,c)&&typeof gauge[c]==='number'&&Number.isInteger(gauge[c])&&gauge[c]>=0)&&colors.reduce((sum,c)=>sum+gauge[c],0)<=400&&Number.isInteger(weapon.id)&&weapon.id>0&&typeof weapon.kind==='string';
  if(!valid)return Object.freeze({weapon:null,status:'BLOCKED',blockers:Object.freeze(['MHDB_COLOR_GAUGE_INVALID'])});
  color=colors.filter(c=>gauge[c]>0).pop();
  if(!color)return Object.freeze({weapon:null,status:'BLOCKED',blockers:Object.freeze(['MHDB_COLOR_GAUGE_EMPTY'])});
  if(weapon.maxSharpness!==undefined&&weapon.maxSharpness!==color)blockers.push('WEAPON_SHARPNESS_SOURCE_CONFLICT');
  ref='https://wilds.mhdb.io/ja/weapons/'+weapon.id+'#/sharpness';
 }
 if(typeof color!=='string'||!COLORS.has(color))blockers.push('EXPLICIT_MAX_SHARPNESS_COLOR_REQUIRED');
 if(typeof ref!=='string'||!ref.trim()||ref.length>240)blockers.push('WEAPON_SPECIFIC_EVIDENCE_REQUIRED');
 // Do not trust a conflicting, unselected variant, even if a top-level value exists.
 if(weapon.selectedUpgradeSharpness!==undefined||weapon.selectedArtiaSharpness!==undefined)blockers.push('WEAPON_VARIANT_SELECTION_NOT_AUDITED');
 const missing=weapon.sharpness===undefined&&weapon.maxSharpness===undefined&&weapon.maxSharpnessEvidenceRef===undefined&&weapon.selectedUpgradeSharpness===undefined&&weapon.selectedArtiaSharpness===undefined&&weapon.upgrades===undefined&&weapon.artiaFixedVariants===undefined;
 if(blockers.length)return Object.freeze({weapon:null,status:'BLOCKED',blockers:Object.freeze(blockers),missingReason:missing?'SHARPNESS_FIELDS_ABSENT':null});
 return Object.freeze({weapon:Object.freeze({...weapon,maxSharpness:color,maxSharpnessEvidenceRef:ref.trim()}),status:'EXPLICIT_SCHEMA_ACCEPTED_REFERENCE_ONLY',blockers:Object.freeze([])});
}
function format(report){return report.weapon?'MHDB武器の根拠付き最大斬れ味を確認（参考計算のみ）。':'MHDB斬れ味の自動変換を保留：'+report.blockers.join(', ')+'。入れ子構造・強化段階・アーティア状態を推測しません。';}
const api=Object.freeze({adapt,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponSharpnessSchemaAdapter=api;
})(typeof window!=='undefined'?window:globalThis);
