// r177: observational context audit. Context equality is not a damage verification.
(function(root){'use strict';
const REQUIRED=Object.freeze(['weaponId','weaponAttack','weaponElement','sharpness','affinity','criticalBoostLevel','activeSkills','monsterId','hitZonePhysical','hitZoneElement','targetState','attackConditions','gameVersion']);
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object'){const o={};for(const k of Object.keys(value).sort())o[k]=canonical(value[k]);return o;}return value;}
function valid(k,v){if(['weaponAttack','weaponElement','hitZonePhysical','hitZoneElement'].includes(k))return typeof v==='number'&&Number.isFinite(v)&&v>=0;
 if(k==='affinity')return typeof v==='number'&&Number.isFinite(v)&&v>=-100&&v<=100;
 if(k==='criticalBoostLevel')return Number.isInteger(v)&&v>=0&&v<=5;
 if(k==='activeSkills')return Array.isArray(v)&&v.every(s=>typeof s==='string'&&s.trim());
 if(k==='attackConditions')return v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length>0&&Object.values(v).every(x=>typeof x==='boolean'||typeof x==='string'||typeof x==='number'&&Number.isFinite(x));
 return typeof v==='string'&&v.trim().length>0&&v.length<=200;}
function audit(provenance,measurements,contexts,expectedVersion){
 if(!provenance||!Array.isArray(provenance.entries)||!measurements||!Array.isArray(measurements.accepted)||!Array.isArray(contexts)||contexts.length>200)throw new TypeError('provenance, accepted measurements and context array required');
 const seen=new Set(),records=new Map(),rejected=[];
 contexts.forEach((r,i)=>{if(!r||typeof r!=='object'||Array.isArray(r)||!Number.isInteger(r.stage)||r.stage<1||!provenance.entries[r.stage-1]||r.techniqueId!==provenance.entries[r.stage-1].techniqueId){rejected.push({index:i,reason:'STAGE_TECHNIQUE_MISMATCH'});return;}
 if(seen.has(r.stage)){rejected.push({index:i,reason:'DUPLICATE_STAGE'});records.delete(r.stage);return;}
 seen.add(r.stage);records.set(r.stage,r);
 });
 const rows=measurements.accepted.map(m=>{const r=records.get(m.stage),c=r?.context;const missing=[],invalid=[],mismatched=[];
 for(const k of REQUIRED){if(!c||!Object.hasOwn(c,k)||c[k]===null)missing.push(k);else if(!valid(k,c[k]))invalid.push(k);}
 if(c&&typeof c==='object'&&!Array.isArray(c)&&!missing.length&&!invalid.length){if(c.gameVersion!==m.gameVersion||expectedVersion&&c.gameVersion!==expectedVersion)mismatched.push('gameVersion');}
 if(r&&r.evidenceRef!==m.evidenceRef)mismatched.push('evidenceRef');
 const status=!r?'CONTEXT_MISSING':missing.length||invalid.length?'CONTEXT_INCOMPLETE':mismatched.length?'CONTEXT_MISMATCH':'CONTEXT_DOCUMENTED_UNVERIFIED';
 return Object.freeze({stage:m.stage,techniqueId:m.techniqueId,status,missing:Object.freeze(missing),invalid:Object.freeze(invalid),mismatched:Object.freeze(mismatched),contextFingerprint:status==='CONTEXT_DOCUMENTED_UNVERIFIED'?JSON.stringify(canonical(c)):null,damageComparable:false});});
 return Object.freeze({status:'DAMAGE_CONTEXT_AUDIT_ONLY',rows:Object.freeze(rows),rejected:Object.freeze(rejected.map(Object.freeze)),captureEligible:false,verifiedDps:null});
}
function format(report){return ['ダメージ計算条件の記録監査（未検証）',...report.rows.map(r=>r.stage+'. '+r.techniqueId+'：'+r.status+(r.missing.length?' / 未入力 '+r.missing.join(', '):'')+(r.invalid.length?' / 無効 '+r.invalid.join(', '):'')+(r.mismatched.length?' / 不一致 '+r.mismatched.join(', '):'')),...report.rejected.map(r=>'入力'+(r.index+1)+'：'+r.reason),'※条件が揃っても、実機との独立照合・技別ダメージ再計算は未完了です。DPS確定不可。'].join('\n');}
const api=Object.freeze({audit,format,required:REQUIRED});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWComboDamageContextAudit=api;
})(typeof window!=='undefined'?window:globalThis);
