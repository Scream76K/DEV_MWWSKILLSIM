// r181: guarded physical-only reference formula, never a verified game-damage claim.
(function(root){'use strict';
function inspect(handoff, engine, formula, options){
 if(!handoff||!Array.isArray(handoff.rows)||!engine||typeof engine.hits!=='function'||typeof formula!=='function')throw new TypeError('handoff, canonical hit reader and formula required');
 const rows=handoff.rows.map(row=>{
  const blockers=[...(Array.isArray(row.blockers)?row.blockers:[])];let hits=null,physical=null;
  if(row.status!=='ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'||!row.context)blockers.push('CONTEXT_HANDOFF_BLOCKED');
  const c=row.context;
  if(c){
   if(!Number.isFinite(c.weaponAttack)||c.weaponAttack<=0||!Number.isFinite(c.hitZonePhysical)||c.hitZonePhysical<0||c.hitZonePhysical>100)blockers.push('PHYSICAL_INPUT_INVALID');
   if(!Array.isArray(c.activeSkills)||c.activeSkills.length||c.criticalBoostLevel!==0||c.affinity!==0)blockers.push('SKILL_OR_AFFINITY_FORMULA_NOT_RESOLVED');
   if(c.attackConditions&&Object.keys(c.attackConditions).length)blockers.push('ATTACK_CONDITIONS_NOT_RESOLVED');
  }
  const sharp=options&&options.sharpnessPhysicalMultiplier;
  if(!Number.isFinite(sharp)||sharp<=0||!options||options.sharpnessEvidenceRef?.trim?.()===undefined||!options.sharpnessEvidenceRef.trim())blockers.push('SHARPNESS_MULTIPLIER_EVIDENCE_REQUIRED');
  if(!blockers.length){try{hits=engine.hits(options.weaponType,row.canonicalTechniqueId);}catch(e){blockers.push('CANONICAL_HITS_UNAVAILABLE');}}
  if(!blockers.length&&(!Array.isArray(hits)||hits.length!==row.hitCount||hits.some(h=>!Number.isFinite(h.mv)||h.mv<0||h.partModifier!==1)))blockers.push('HIT_OR_PART_MODIFIER_UNSUPPORTED');
  if(!blockers.length){try{
   physical=hits.map(h=>{const d=formula({attack:c.weaponAttack,affinity:0,element:0,mv:h.mv,hz:c.hitZonePhysical,ehz:0,sharp,esharp:1,critBonus:0,elementCrit:false,criticalState:'noncritical'});if(!d||!Number.isFinite(d.p)||d.p<0)throw new Error('invalid physical');return d.p;});
  }catch(e){physical=null;blockers.push('REFERENCE_FORMULA_FAILED');}}
  return Object.freeze({stage:row.stage,canonicalTechniqueId:row.canonicalTechniqueId,status:physical?'PHYSICAL_REFERENCE_ONLY':'PHYSICAL_REFERENCE_BLOCKED',physicalHits:physical?Object.freeze(physical):null,physicalTotal:physical?physical.reduce((a,b)=>a+b,0):null,blockers:Object.freeze([...new Set(blockers)]),verified:false,dps:null});
 });
 return Object.freeze({scope:'R181_PHYSICAL_REFERENCE_FORMULA_ONLY',rows:Object.freeze(rows),verifiedDps:null,captureEligible:false});
}
function format(report){return ['物理ダメージ参考計算（未検証）',...report.rows.map(r=>r.stage+'. '+(r.canonicalTechniqueId||'未対応')+'：'+r.status+(r.physicalTotal===null?' / '+r.blockers.join(', '):' / 物理参考合計 '+r.physicalTotal.toFixed(2))),'※肉質・斬れ味の条件、スキル、部位補正等が未解決の場合は計算しません。参考計算は実機検証済みではありません。'].join('\n');}
const api=Object.freeze({inspect,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWTechniquePhysicalFormulaBridge=api;
})(typeof window!=='undefined'?window:globalThis);
