'use strict';
const {isDeepStrictEqual}=require('node:util');
const PREFIX='GL_TARGET:UNREVIEWED_MODIFIER:';
// Interpret only current emitted shell-component guards. This does not establish
// activation, damage applicability, numerical accuracy, or absence of hidden guards.
function diagnoseGlGuard(c,{sourceCommit,runId}={}){
 if(c?.kind!=='gunlance'||c.status!=='PRODUCT_UNAVAILABLE_OR_INCOMPLETE'||!Number.isInteger(c.skillId)||typeof c.name!=='string'||!/^[0-9a-f]{40}$/.test(sourceCommit||'')||typeof runId!=='string'||!runId)return null;
 if(!c.skills||typeof c.skills!=='object'||Array.isArray(c.skills)||!Array.isArray(c.activeBonusEffects))return null;
 const evidence={},modifierSets=[];
 for(const channel of ['normal','maximum']){
  const x=c.channels?.[channel];if(x?.status!=='unavailable'||x.reason!=='COMPONENT_UNAVAILABLE'||!Array.isArray(x.unavailableComponents)||!x.unavailableComponents.length)return null;
  evidence[channel]=[];const componentIds=new Set();
  for(const p of x.unavailableComponents){
   if(p?.status!=='unavailable'||p.coefficientUnit!=='SHELLING'||typeof p.id!=='string'||!p.id||typeof p.reason!=='string'||!p.reason.startsWith(PREFIX))return null;
   if(componentIds.has(p.id))return null;componentIds.add(p.id);
   const names=p.reason.slice(PREFIX.length).split('/');if(names.some(n=>!n||n!==n.trim()||/[\r\n]/.test(n))||new Set(names).size!==names.length)return null;
   const sorted=[...names].sort();if(modifierSets.length&&!isDeepStrictEqual(sorted,modifierSets[0]))return null;modifierSets.push(sorted);
   evidence[channel].push({componentId:p.id,coefficientUnit:p.coefficientUnit,reason:p.reason});
  }
 }
 const currentReasons=[...new Set(['COMPONENT_UNAVAILABLE',...Object.values(evidence).flat().map(p=>p.reason)])].sort();
 if(c.reason!=null&&(typeof c.reason!=='string'||!isDeepStrictEqual(c.reason.split(';').map(s=>s.trim()).sort(),currentReasons)))return null;
 const modifiers=modifierSets[0],origins=[];
 for(const name of modifiers){
  const level=c.skills[name];if(!Number.isInteger(level)||level<1)return null;
  const bonuses=c.activeBonusEffects.filter(e=>e?.name===name);if(bonuses.length>1)return null;
  const bonus=bonuses[0];if(bonus&&(!Number.isInteger(bonus.level)||bonus.level<1||bonus.level!==level||!Number.isInteger(bonus.bonusSkillId)||bonus.bonusSkillId<1||typeof bonus.bonusName!=='string'||!bonus.bonusName))return null;
  if(bonus&&(bonus.bonusSkillId===c.skillId)!==(bonus.bonusName===c.name))return null;
  const relation=bonus?(bonus.bonusSkillId===c.skillId&&bonus.bonusName===c.name?'TARGET_BONUS':'COACTIVATED_BONUS'):name===c.name?'TARGET_SKILL':'COACTIVATED_SKILL';
  origins.push({name,observedSkillLevel:level,relation,...(bonus?{observedBonus:{name:bonus.name,level:bonus.level,bonusSkillId:bonus.bonusSkillId,bonusName:bonus.bonusName}}:{})});
 }
 const targets=origins.filter(e=>e.relation.startsWith('TARGET_')).length;
 const attribution=targets===0?'coactivated_only':targets<origins.length?'target_and_coactivated_modifiers':origins.every(e=>e.relation==='TARGET_BONUS')?'target_bonus_effect':'target_skill_modifier';
 return {status:'CURRENT_COMPONENT_GUARD_CLASSIFIED_NOT_A_PROVEN_BUG',primaryCause:'gl_unreviewed_modifiers',additionalCauses:[],defectProven:false,skillEffectValidated:false,reasons:currentReasons,observedAttribution:attribution,attributionLabel:'今回返却された砲撃ガード名と実際のスキル・ボーナス名を照合',modifierOrigins:origins,gunlanceBlockedModifiers:modifiers,guardEvidence:evidence,reason:'現在の通常・最大チャネルの砲撃成分が、実在する未確認modifierを理由に停止。過去の理由や帰属を転記していない。',requiredConditions:'残存modifierごとの砲撃・斬撃適用根拠と必要な発動条件を確認。ガード解除や不具合認定は行わない。',source:`https://github.com/Scream76K/DEV_MWWSKILLSIM/blob/${sourceCommit}/gunlance-shell-reference.js`,sourceCommit,sourceRunId:runId,fixtureEvidenceMatched:false,currentGuardEvidenceMatched:true,evidenceMatchKind:'CURRENT_SCAN_COMPONENT_GUARDS_AND_OBSERVED_GRANTS',applicabilityStatus:'IMPLEMENTATION_SCOPE_OR_STATE_UNRESOLVED',otherBlockersMayBeHidden:true};
}
module.exports={diagnoseGlGuard};
