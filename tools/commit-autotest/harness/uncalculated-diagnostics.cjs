'use strict';
const fs=require('node:fs'),path=require('node:path'),{isDeepStrictEqual}=require('node:util');
const {assessFixture}=require('./fixture-applicability.cjs');
const {diagnoseGlGuard}=require('./gl-guard-diagnosis.cjs');
const prior=require('./diagnostic-sources/v7-uncalculated-classification.json');
const base='https://github.com/Scream76K/DEV_MWWSKILLSIM/blob/5f1f733fc00c770073704c699ea7c2641a8bc9fb/';
const rules={
 thunder_conversion_scope:{reason:'雷属性本体と採用済みの技・成分が必要。旧12入力はいずれも無属性。',conditions:'雷属性武器、非負の装備由来雷耐性、対応component。属性弾の専用経路は別枠。',source:'hope-hammer-browser-adapter.js#L671-L685'},
 water_conversion_scope:{reason:'水属性の太刀・弓だけが現在の採用範囲。旧14入力はいずれも無属性。',conditions:'水属性の太刀または弓、非負の装備由来水耐性、採用済み本体/弓経路。他12武器は未採用で、ゲーム上の非対象とは断定しない。',source:'index.html#L7918'},
 charge_master_scope:{reason:'今回の武器・標準技経路では効果採用範囲が確定していない。',conditions:'対象の溜め攻撃・属性成分と武器別の適用根拠が必要。単にスキルを付けても発動の証明にはならない。',source:'hope-hammer-browser-adapter.js#L705-L715'},
 dark_weapon_scope:{reason:'暗黒の既存採用モデルは大剣に限定。他武器は明示的に未確定。',conditions:'武器別の標準列、HP条件と発動モデル。ゲーム上非対象とは断定しない。',source:'index.html#L8651-L8680'},
 airborne_hit_mapping:{reason:'飛燕の技別hit対応が未確定。',conditions:'対象となるhitだけの対応表。未登録の技を無条件で非対象や適用済みにしない。',source:'hope-hammer-browser-adapter.js#L809-L821'},
 partbreaker_coactivated:{reason:'対象オメガレゾナンスではなく、実防具で同時発動した破壊王の技対応が停止理由。',conditions:'傷イベントの有無と技別対応。実防具の副スキルは削除していない。対象シリーズ単独の不具合とは断定できない。',source:'hope-hammer-browser-adapter.js#L785'},
 dark_arts_scope:{reason:'ダークアーツの対象武器/成分が既存採用範囲外。暗黒とは別の効果。',conditions:'ダークアーツの武器別本体成分と追加イベントの適用範囲。',source:'index.html#L7938-L8037'},
 gl_unreviewed_modifiers:{reason:'ガンランス専用経路の未確認modifier検査で停止。対象か同時発動スキルかを帰属欄で区別。',conditions:'斬撃と砲撃を分けた適用の裏付けが必要。共通COMPONENT_UNAVAILABLEは独立した追加失敗ではない。',source:'gunlance-shell-reference.js#L71-L90'},
 cornpopper_technique_scope:{reason:'焼き砲モロコシの杭/多弾フルバースト標準列が未採用。',conditions:'対象砲撃技・装填数の採用範囲。',source:'hope-hammer-browser-adapter.js#L786-L789'},
 gog_component_scope:{reason:'巨戟龍の効果を適用する専用componentが未採用。',conditions:'本体、砲撃、ビン、弾など各成分の適用根拠。',source:'hope-hammer-browser-adapter.js#L721-L729'},
 pierce_effect_scope:{reason:'貫通弾・竜の矢強化の対象弾/技そのものを今回の標準列では試していない。',conditions:'貫通弾または竜の矢の経路とその効果適用根拠。通常の標準列で発動を推定しない。',source:'hope-hammer-browser-adapter.js#L918'},
 cooking_ammo_scope:{reason:'炎の料理人の特殊弾属性加算が既存経路で未対応。',conditions:'弾種・属性加算段階の採用範囲。',source:'hope-hammer-browser-adapter.js#L879'}
};
function reasons(c){const r=Object.values(c.channels||{}).flatMap(x=>[x.reason,...(x.unavailableComponents||[]).map(v=>v.reason)]).filter(Boolean);return [...new Set(r.length?r:[c.reason].filter(Boolean))].sort();}
function annotate(c,context={}){
 if(c.status!=='PRODUCT_UNAVAILABLE_OR_INCOMPLETE')return null;
 const original=prior.cases.find(x=>x.key===c.key),actualReasons=reasons(c);
 const verified=!!original&&isDeepStrictEqual(original.reasons,actualReasons)&&isDeepStrictEqual(original.observedStats,c.stats)&&isDeepStrictEqual(original.observedSkills,c.skills)&&isDeepStrictEqual(original.activeBonusEffects,c.activeBonusEffects)&&isDeepStrictEqual(original.evaluationPlan,c.evaluationPlan);
 const currentGuard=diagnoseGlGuard(c,context);if(currentGuard)return {...currentGuard,priorFixtureEvidenceMatched:verified};
 if(!verified||(original?.primaryRootCauseFamily==='gl_unreviewed_modifiers'&&actualReasons.some(r=>r.startsWith('GL_TARGET:UNREVIEWED_MODIFIER:'))))return {status:'NEW_OR_CHANGED_UNCALCULATED_CASE_REVIEW_REQUIRED',defectProven:false,reasons:actualReasons,reason:'Prior fixture evidence no longer matches. Do not reuse its attribution or prerequisite diagnosis.'};
 const family=original.primaryRootCauseFamily,rule=rules[family];
 const waterOutside=c.skillId===181&&!['long-sword','bow'].includes(c.kind);
 const missingElement=[165,181].includes(c.skillId)&&c.stats.elementType!==(c.skillId===165?'thunder':'water');
 const fixtureApplicability=assessFixture({dimensions:missingElement?{element:{status:'MISSING',value:c.stats.elementType,source:'matched scan '+c.key}}:{},productSupport:waterOutside?{status:'UNSUPPORTED',source:base+'index.html#L7918'}:{}});
 return {fixtureApplicability,status:'CAUSE_AND_CONDITIONS_CLASSIFIED_NOT_A_PROVEN_BUG',defectProven:false,skillEffectValidated:false,reasons:actualReasons,primaryCause:family,additionalCauses:original.additionalRootCauseFamilies,observedAttribution:original.observedAttribution,attributionLabel:original.attributionLabel,reason:rule.reason,requiredConditions:rule.conditions,source:base+rule.source,sourceRunId:prior.sourceRunId,fixtureEvidenceMatched:true,matchingElementMissing:missingElement,waterWeaponOutsideCurrentAdoption:waterOutside,applicabilityStatus:waterOutside?'OUTSIDE_CURRENT_ADOPTED_SCOPE_GAME_APPLICABILITY_UNVERIFIED':missingElement?'SELECTED_FIXTURE_MISSING_ELEMENT_PREREQUISITE':'IMPLEMENTATION_SCOPE_OR_STATE_UNRESOLVED',gunlanceBlockedModifiers:original.gunlanceBlockedModifiers,otherBlockersMayBeHidden:true};
}
function makeReport(scan){
 const cases=scan.cases.filter(c=>c.status==='PRODUCT_UNAVAILABLE_OR_INCOMPLETE').map(c=>({key:c.key,skillId:c.skillId,name:c.name,level:c.level,kind:c.kind,originalStatus:c.status,observedStats:c.stats,diagnosis:annotate(c,{sourceCommit:scan.sourceCommit,runId:scan.runId})}));
 const counts=key=>Object.fromEntries([...new Set(cases.map(c=>c.diagnosis[key]||'UNCLASSIFIED'))].map(k=>[k,cases.filter(c=>(c.diagnosis[key]||'UNCLASSIFIED')===k).length]));
 return {sourceRunId:scan.runId,status:'OBSERVED_UNCALCULATED_CAUSES_NOT_BUG_COUNTS',sourceResultNotModified:true,uniqueCaseCount:cases.length,primaryCauseCounts:counts('primaryCause'),attributionCounts:counts('observedAttribution'),unmatchedEvidenceCount:cases.filter(c=>!c.diagnosis.fixtureEvidenceMatched&&!c.diagnosis.currentGuardEvidenceMatched).length,currentGuardEvidenceCount:cases.filter(c=>c.diagnosis.currentGuardEvidenceMatched===true).length,defectsProven:0,cases,boundaries:prior.boundaries.filter(x=>x!=='No original result files or product code were modified.')};
}
if(require.main===module){const root=process.env.TEST_TOOL_ROOT||'/';const current=path.join(root,'output/skill-scan.json'),useCurrent=fs.existsSync(current);if(!useCurrent)throw Error('CURRENT_SCAN_REQUIRED: historical fallback forbidden');const scan=JSON.parse(fs.readFileSync(current));const report=makeReport(scan);report.historicalSelectionEvidenceOnly=!useCurrent;fs.writeFileSync(path.join(root,'output/uncalculated-diagnostics.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,cases:report.uniqueCaseCount,unmatchedEvidenceCount:report.unmatchedEvidenceCount,counts:report.primaryCauseCounts}));process.exitCode=report.unmatchedEvidenceCount?2:0;}
module.exports={annotate,makeReport,reasons};
