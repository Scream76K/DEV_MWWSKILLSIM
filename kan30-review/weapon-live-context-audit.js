// r187: read-only comparison between documented stage contexts and actual selected build stats.
(function(root){'use strict';
function audit(handoff,selectedWeapon,stats,expectedVersion){
 if(!handoff||!Array.isArray(handoff.rows))throw new TypeError('engine handoff required');
 const rows=handoff.rows.map(row=>{
  const blockers=[];const c=row.context;
  if(row.status!=='ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'||!c)blockers.push('DOCUMENTED_CONTEXT_REQUIRED');
  if(!selectedWeapon||typeof selectedWeapon!=='object'||selectedWeapon.id==null)blockers.push('SELECTED_WEAPON_ID_REQUIRED');
  if(!stats||typeof stats!=='object')blockers.push('LIVE_BUILD_STATS_REQUIRED');
  if(c&&selectedWeapon&&String(c.weaponId)!==String(selectedWeapon.id))blockers.push('WEAPON_ID_MISMATCH');
  const attack=stats&&(stats.attackTrue??stats.attack);
  if(c&&(!Number.isFinite(attack)||attack<=0||!Number.isFinite(c.weaponAttack)||Math.abs(attack-c.weaponAttack)>1e-6))blockers.push('ATTACK_MISMATCH');
  if(c&&(!Number.isFinite(stats?.element)||!Number.isFinite(c.weaponElement)||Math.abs(stats.element-c.weaponElement)>1e-6))blockers.push('ELEMENT_MISMATCH');
  // Context must describe the actual base affinity, not maximum conditional affinity.
  if(c&&(!Number.isFinite(stats?.affinity)||!Number.isFinite(c.affinity)||Math.abs(stats.affinity-c.affinity)>1e-6))blockers.push('AFFINITY_MISMATCH');
  if(c&&c.gameVersion!==expectedVersion)blockers.push('GAME_VERSION_MISMATCH');
  // Live skill, monster and attack-state parity is not proven by a numerical snapshot.
  blockers.push('LIVE_SKILLS_AND_MONSTER_STATE_NOT_RECONCILED');
  return Object.freeze({stage:row.stage,status:blockers.length?'LIVE_CONTEXT_NOT_VERIFIED':'LIVE_CONTEXT_MATCHED',blockers:Object.freeze([...new Set(blockers)]),verified:false});
 });
 return Object.freeze({scope:'R187_LIVE_CONTEXT_DIAGNOSTIC_ONLY',rows:Object.freeze(rows),verified:false,captureEligible:false,verifiedDps:null});
}
function format(r){return ['選択装備と実機計算条件の一致診断（読取専用）',...r.rows.map(x=>x.stage+'. '+x.status+' / '+x.blockers.join(', ')),'※スキル・肉質・モンスター状態の一致は未確認。DPSの検証済み判定には使用しません。'].join('\n');}
const api=Object.freeze({audit,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponLiveContextAudit=api;
})(typeof window!=='undefined'?window:globalThis);
