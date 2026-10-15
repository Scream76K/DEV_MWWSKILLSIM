// r189: read-only audit of calculated attack components and currently selected target hitzones.
(function(root){'use strict';
const finite=n=>typeof n==='number'&&Number.isFinite(n);
function audit(handoff,stats,target){
 if(!handoff||!Array.isArray(handoff.rows))throw new TypeError('engine handoff required');
 const rows=handoff.rows.map(row=>{
  const c=row.context,blockers=[];
  if(row.status!=='ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'||!c)blockers.push('DOCUMENTED_CONTEXT_REQUIRED');
  const a=stats?.attackComponents,attack=stats?.attackTrue;
  if(!a||!finite(a.weaponBase)||a.weaponBase<0||!finite(a.normalMultiplier)||a.normalMultiplier<=0||!finite(a.normalFlat)||!finite(attack)||attack<=0||Math.abs(a.weaponBase*a.normalMultiplier+a.normalFlat-attack)>1e-6)blockers.push('LIVE_ATTACK_COMPONENTS_INVALID');
  if(!c||!finite(c.weaponAttack)||!finite(attack)||Math.abs(c.weaponAttack-attack)>1e-6)blockers.push('ATTACK_CONTEXT_MISMATCH');
  if(!target||typeof target!=='object'||target.monsterId==null||!String(target.monsterId).trim()||target.partId==null||!String(target.partId).trim())blockers.push('TARGET_IDENTITY_REQUIRED');
  if(!c||!target||String(c.monsterId)!==String(target.monsterId))blockers.push('MONSTER_ID_MISMATCH');
  // A numeric hitzone alone cannot identify a monster part or its break/phase state.
  if(c&&Object.hasOwn(c,'partId')&&String(c.partId)!==String(target?.partId))blockers.push('PART_ID_MISMATCH');
  if(c&&Object.hasOwn(c,'partState')&&String(c.partState)!==String(target?.partState))blockers.push('PART_STATE_MISMATCH');
  if(c&&Object.hasOwn(c,'monsterState')&&String(c.monsterState)!==String(target?.monsterState))blockers.push('MONSTER_STATE_MISMATCH');
  if(target&&Object.hasOwn(target,'partState')&&(typeof target.partState!=='string'||!target.partState.trim()))blockers.push('TARGET_PART_STATE_INVALID');
  if(target&&Object.hasOwn(target,'monsterState')&&(typeof target.monsterState!=='string'||!target.monsterState.trim()))blockers.push('TARGET_MONSTER_STATE_INVALID');
  for(const [field,key] of [['hitZonePhysical','physical'],['hitZoneElement','element']]){
   if(!finite(target?.[key])||target[key]<0||target[key]>100)blockers.push('LIVE_'+key.toUpperCase()+'_HITZONE_INVALID');
   else if(!c||!finite(c[field])||Math.abs(c[field]-target[key])>1e-6)blockers.push(key.toUpperCase()+'_HITZONE_MISMATCH');
  }
  // Even matching state labels are user-supplied and do not verify gameplay activation.
  blockers.push('ATTACK_SKILL_ACTIVATION_NOT_RECONCILED','TARGET_STATE_NOT_RECONCILED','ATTACK_CONDITIONS_NOT_RECONCILED');
  return Object.freeze({stage:row.stage,status:'ATTACK_TARGET_AUDIT_UNVERIFIED',attackTrue:finite(attack)?attack:null,monsterId:target?.monsterId??null,partId:target?.partId??null,physicalHitzone:finite(target?.physical)?target.physical:null,elementHitzone:finite(target?.element)?target.element:null,blockers:Object.freeze([...new Set(blockers)]),verified:false,damage:null,dps:null});
 });
 return Object.freeze({scope:'R189_READ_ONLY_ATTACK_TARGET_AUDIT',rows:Object.freeze(rows),captureEligible:false,verifiedDps:null});
}
function format(report){return ['攻撃補正・モンスター肉質の照合（未検証）',...report.rows.map(r=>r.stage+'. 真攻撃力 '+(r.attackTrue??'不明')+' / モンスター '+(r.monsterId??'不明')+' / 部位 '+(r.partId??'不明')+' / 物理肉質 '+(r.physicalHitzone??'不明')+' / 属性肉質 '+(r.elementHitzone??'不明')+' / '+r.blockers.join(', ')),'※攻撃系スキルの発動状態、部位状態、攻撃条件は未検証。DPS確定不可。'].join('\n');}
const api=Object.freeze({audit,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponAttackTargetAudit=api;
})(typeof window!=='undefined'?window:globalThis);
