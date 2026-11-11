'use strict';
// Audit-only pure helpers. Never infer that an available metric applied every skill.
const clone=x=>JSON.parse(JSON.stringify(x));
function classifyChannel(result){
 if(!result)return 'MISSING_CHANNEL';
 const metric=result.metrics?.comboTotalDamage,d=result.diagnostics||{};
 if(result.execution?.status!=='complete'||metric?.status!=='available'||!Number.isFinite(metric.value)||metric.value<0)return 'UNAVAILABLE';
 const partial=d.ignoredSkillEffects?.length||d.unappliedEffects?.length||d.componentSkillContinuation||[d.formalStatus,d.calculationCompleteness,metric.completeness].some(x=>typeof x==='string'&&x.startsWith('PARTIAL'));
 return partial?'AVAILABLE_PARTIAL':'AVAILABLE_NO_RECORDED_OMISSION';
}
function planOrdinaryRank(baselineLevel,requestedLevel){
 if(!Number.isInteger(baselineLevel)||baselineLevel<0)throw Error('Invalid baseline skill level');
 if(!Number.isInteger(requestedLevel)||requestedLevel<1)throw Error('Invalid requested skill level');
 return baselineLevel>requestedLevel?{status:'INTRINSIC_RANK_UNREACHABLE',charmLevel:null}:{status:'REACHABLE',charmLevel:requestedLevel-baselineLevel};
}
function collectDispositions(real){
 return Object.fromEntries(['normal','maximum'].map(channel=>{
  const result=real?.channels?.[channel],d=result?.diagnostics||{},metric=result?.metrics?.comboTotalDamage;
  const available=classifyChannel(result).startsWith('AVAILABLE_');
  return [channel,clone({channelStatus:!result?'MISSING_CHANNEL':available?'AVAILABLE':'UNAVAILABLE',metricStatus:metric?.status||null,metricValue:Number.isFinite(metric?.value)?metric.value:null,ignored:d.ignoredSkillEffects||[],unapplied:d.unappliedEffects||[],ownerExcluded:d.excludedCalculationSkills||[],excludedSkillDamage:d.excludedSkillDamage||[],partialBody:d.componentSkillContinuation?.scope||null,componentContinuation:d.componentSkillContinuation||null,formalStatus:d.formalStatus||null,calculationCompleteness:d.calculationCompleteness||null,completeness:metric?.completeness||null})];
 }));
}
function list(value){return value?value.split(',').map(x=>x.trim()).filter(Boolean):[];}
function selectSkills(skills,value){
 const ids=list(value);if(!ids.length)return skills;
 if(ids.some(x=>!/^\d+$/.test(x)))throw Error('Invalid SKILL_IDS');
 if(ids.some(x=>!skills.some(s=>s.id===Number(x))))throw Error('Unknown SKILL_IDS');
 return skills.filter(s=>ids.includes(String(s.id)));
}
function selectProfiles(cases,env={}){
 if(env.AUDIT_MODE&&env.AUDIT_MODE!=='current-standard')throw Error('Unknown AUDIT_MODE');
 const refresh=env.AUDIT_MODE==='current-standard',kinds=list(env.WEAPON_KINDS),modes=list(env.LBG_MODES);
 if(kinds.some(k=>!cases.some(c=>c.kind===k)))throw Error('Unknown WEAPON_KINDS');
 if(refresh&&kinds.includes('charge-blade'))throw Error('charge-blade is static-only in current-standard audit');
 if(modes.some(m=>!['RAPID','NORMAL'].includes(m))||modes.length&&!refresh)throw Error('Invalid LBG_MODES; requires current-standard');
 let selected=cases.filter((c,i)=>(!env.HALF||(env.HALF==='first'?i<7:i>=7))&&(!refresh||c.kind!=='charge-blade')&&(!kinds.length||kinds.includes(c.kind)));
 return selected.flatMap(c=>{
  if(refresh&&c.kind==='light-bowgun')return [['RAPID','783'],['NORMAL','773']].filter(([m])=>!modes.length||modes.includes(m)).map(([mode,id])=>({...c,auditProfileId:c.kind+'-'+mode.toLowerCase()+'-lv1',auditWeaponId:id,expectedAmmo:{level:1,shotMode:mode,shotCount:5}}));
  return [{...c,auditProfileId:c.kind,...(refresh&&c.kind==='heavy-bowgun'?{auditWeaponId:'469',expectedAmmo:{level:1,shotCount:10}}:{})}];
 });
}
function prepareSnapshot(profile,standard){
 const snapshot=clone(profile.inputSnapshots[0]);
 Object.assign(snapshot,{armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}});
 if(profile.auditWeaponId)snapshot.weaponId=profile.auditWeaponId;
 if(standard)snapshot.combo={...(snapshot.combo||{}),moves:[]};
 return snapshot;
}
module.exports={collectDispositions,classifyChannel,planOrdinaryRank,selectSkills,selectProfiles,prepareSnapshot};
