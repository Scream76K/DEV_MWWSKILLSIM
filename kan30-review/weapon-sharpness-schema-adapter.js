// r186: conservative MHDB schema adapter. No guessing from gauge arrays or upgrade ordering.
(function(root){'use strict';
const COLORS=new Set(['red','orange','yellow','green','blue','white','purple']);
function adapt(weapon){
 const blockers=[];
 if(!weapon||typeof weapon!=='object'||Array.isArray(weapon))return Object.freeze({weapon:null,status:'BLOCKED',blockers:Object.freeze(['WEAPON_REQUIRED'])});
 // Explicit top-level field is the only established contract. Nested candidates are diagnostics,
 // not trusted as a selected upgrade/Artia state until the actual MHDB schema is validated.
 const color=weapon.maxSharpness,ref=weapon.maxSharpnessEvidenceRef;
 if(typeof color!=='string'||!COLORS.has(color))blockers.push('EXPLICIT_MAX_SHARPNESS_COLOR_REQUIRED');
 if(typeof ref!=='string'||!ref.trim()||ref.length>240)blockers.push('WEAPON_SPECIFIC_EVIDENCE_REQUIRED');
 // Do not trust a conflicting, unselected variant, even if a top-level value exists.
 if(weapon.selectedUpgradeSharpness!==undefined||weapon.selectedArtiaSharpness!==undefined)blockers.push('WEAPON_VARIANT_SELECTION_NOT_AUDITED');
 if(blockers.length)return Object.freeze({weapon:null,status:'BLOCKED',blockers:Object.freeze(blockers)});
 return Object.freeze({weapon:Object.freeze({...weapon,maxSharpness:color,maxSharpnessEvidenceRef:ref.trim()}),status:'EXPLICIT_SCHEMA_ACCEPTED_REFERENCE_ONLY',blockers:Object.freeze([])});
}
function format(report){return report.weapon?'MHDB武器の根拠付き最大斬れ味を確認（参考計算のみ）。':'MHDB斬れ味の自動変換を保留：'+report.blockers.join(', ')+'。入れ子構造・強化段階・アーティア状態を推測しません。';}
const api=Object.freeze({adapt,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponSharpnessSchemaAdapter=api;
})(typeof window!=='undefined'?window:globalThis);
