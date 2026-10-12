// r188: read-only audit of actual build skill levels and affinity, never a DPS authority.
(function(root){'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function audit(handoff,stats,skillTotals){
 if(!handoff||!Array.isArray(handoff.rows))throw new TypeError('engine handoff required');
 const rows=handoff.rows.map(row=>{
  const c=row.context,blockers=[];
  if(row.status!=='ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'||!c)blockers.push('DOCUMENTED_CONTEXT_REQUIRED');
  if(!stats||typeof stats!=='object')blockers.push('LIVE_STATS_REQUIRED');
  if(!skillTotals||typeof skillTotals!=='object'||Array.isArray(skillTotals))blockers.push('LIVE_SKILL_TOTALS_REQUIRED');
  const base=stats?.affinity,max=stats?.maxAffinity;
  if(!Number.isFinite(base)||!Number.isFinite(max)||base< -100||base>100||max< -100||max>100||max<base)blockers.push('AFFINITY_STATS_INVALID');
  if(c&&(!Number.isFinite(c.affinity)||!Number.isFinite(base)||c.affinity!==base))blockers.push('BASE_AFFINITY_MISMATCH');
  const aliases=['超会心','Critical Boost'];
  const levels=skillTotals&&aliases.filter(k=>own(skillTotals,k));
  if(levels?.length>1)blockers.push('CRITICAL_BOOST_ALIAS_CONFLICT');
  const level=levels?.length===1?skillTotals[levels[0]]:levels?.length===0?0:null;
  if(!Number.isInteger(level)||level<0||level>5)blockers.push('CRITICAL_BOOST_LEVEL_INVALID');
  if(c&&(!Number.isInteger(c.criticalBoostLevel)||c.criticalBoostLevel!==level))blockers.push('CRITICAL_BOOST_CONTEXT_MISMATCH');
  // Context.activeSkills has no canonical mapping to live skill totals; never infer parity.
  blockers.push('ACTIVE_SKILL_CONDITIONS_NOT_RECONCILED','MONSTER_AND_HITZONE_NOT_RECONCILED');
  return Object.freeze({stage:row.stage,status:'CRITICAL_SKILL_AUDIT_UNVERIFIED',baseAffinity:Number.isFinite(base)?base:null,maxAffinity:Number.isFinite(max)?max:null,criticalBoostLevel:Number.isInteger(level)?level:null,blockers:Object.freeze([...new Set(blockers)]),verified:false,damage:null,dps:null});
 });
 return Object.freeze({scope:'R188_READ_ONLY_CRITICAL_SKILL_AUDIT',rows:Object.freeze(rows),captureEligible:false,verifiedDps:null});
}
function format(report){return ['装備の会心・超会心・スキル条件の監査（未検証）',...report.rows.map(r=>r.stage+'. 基礎会心 '+(r.baseAffinity??'不明')+'% / 最大会心 '+(r.maxAffinity??'不明')+'% / 超会心 Lv'+(r.criticalBoostLevel??'不明')+' / '+r.blockers.join(', ')),'※最大会心は条件付き参考値。発動スキル・肉質・状態は未照合。DPS確定不可。'].join('\n');}
const api=Object.freeze({audit,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponCriticalSkillAudit=api;
})(typeof window!=='undefined'?window:globalThis);
