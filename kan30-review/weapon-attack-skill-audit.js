// r189: diagnostic-only attack skill reconciliation; never manufactures damage multipliers.
(function(root){'use strict';
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function audit(handoff,stats,totals){
 if(!handoff||!Array.isArray(handoff.rows))throw new TypeError('engine handoff required');
 const rows=handoff.rows.map(row=>{
  const blockers=[],c=row.context;
  if(row.status!=='ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'||!c)blockers.push('DOCUMENTED_CONTEXT_REQUIRED');
  if(!stats||typeof stats!=='object'||Array.isArray(stats))blockers.push('LIVE_STATS_REQUIRED');
  if(!totals||typeof totals!=='object'||Array.isArray(totals))blockers.push('LIVE_SKILLS_REQUIRED');
  const keys=['攻撃','Attack'];const present=totals&&typeof totals==='object'&&!Array.isArray(totals)?keys.filter(k=>has(totals,k)):[];
  if(present.length>1)blockers.push('ATTACK_SKILL_ALIAS_CONFLICT');
  const level=present.length===1?totals[present[0]]:present.length===0?0:null;
  if(!Number.isInteger(level)||level<0||level>5)blockers.push('ATTACK_SKILL_LEVEL_INVALID');
  const attack=stats?.attackTrue??stats?.attack;
  if(!Number.isFinite(attack)||attack<=0)blockers.push('LIVE_ATTACK_INVALID');
  if(!Number.isFinite(c?.weaponAttack)||!Number.isFinite(attack)||Math.abs(c.weaponAttack-attack)>1e-6)blockers.push('ATTACK_CONTEXT_MISMATCH');
  // Total attack already includes applicable build effects. Do not apply the skill twice.
  blockers.push('ATTACK_SKILL_COMPONENTS_NOT_SEPARATELY_VERIFIED','ACTIVE_SKILL_CONDITIONS_NOT_RECONCILED','MONSTER_AND_HITZONE_NOT_RECONCILED');
  return Object.freeze({stage:row.stage,status:'ATTACK_SKILL_AUDIT_UNVERIFIED',attack:Number.isFinite(attack)?attack:null,attackSkillLevel:Number.isInteger(level)?level:null,blockers:Object.freeze([...new Set(blockers)]),verified:false,damage:null,dps:null});
 });
 return Object.freeze({scope:'R189_READ_ONLY_ATTACK_SKILL_AUDIT',rows:Object.freeze(rows),captureEligible:false,verifiedDps:null});
}
function format(report){return ['攻撃系スキル・装備攻撃力の監査（未検証）',...report.rows.map(r=>r.stage+'. 真攻撃力 '+(r.attack??'不明')+' / 攻撃 Lv'+(r.attackSkillLevel??'不明')+' / '+r.blockers.join(', ')),'※スキル補正の二重加算を防止。発動条件・肉質未照合につきDPS確定不可。'].join('\n');}
const api=Object.freeze({audit,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponAttackSkillAudit=api;
})(typeof window!=='undefined'?window:globalThis);
