'use strict';
const TOLERANCE=1e-9;
const elementSkillTypes={41:'dragon',50:'fire',91:'water',121:'ice',127:'thunder'};
function expectedChange(job,control,channel){
 const stat=control.stats||{},aff=Number(channel==='maximum'?stat.maxAffinity:stat.affinity);
 const basis={source:'Original MHDB description/rank in skill-sources/raw-skills.json',skillId:job.skillId,level:job.level,status:'CANDIDATE_MONOTONIC_REQUIREMENT_NOT_NUMERIC_ORACLE'};
 if(job.skillId===72&&Number(stat.attackTrue)>0)return {...basis,expectation:'INCREASE_EXPECTED',reason:'Attack Boost explicitly raises raw attack; positive standard damage with the same weapon/target is the candidate test premise. Formula magnitude, caps and game-version correctness remain unverified.'};
 if(job.skillId===3&&job.kind==='great-sword'&&aff>=0&&aff<100)return {...basis,expectation:'INCREASE_EXPECTED',reason:'Critical Eye raises affinity below the cap; the existing source-backed GS charged-slash physical route can crit. This checks direction, not an exact damage coefficient.'};
 if(job.skillId===22&&aff<=0)return {...basis,expectation:'NOT_EXERCISED',reason:'Control has no positive affinity, so Critical Boost has no positive-crit opportunity in this fixture.'};
 if(job.skillId===22&&job.kind==='great-sword'&&aff>0)return {...basis,expectation:'INCREASE_EXPECTED',reason:'Critical Boost increases positive critical damage on the source-backed GS physical route with nonzero affinity.'};
 if(elementSkillTypes[job.skillId]){
  if(['light-bowgun','heavy-bowgun','gunlance'].includes(job.kind))return {...basis,expectation:'UNRESOLVED',reason:'Ammo or shell element is separate from weapon element. This comparison has not established special-component and element-cap applicability.'};
  if(Number(stat.element)<=0||stat.elementType!==elementSkillTypes[job.skillId])return {...basis,expectation:'NOT_EXERCISED',reason:'Control weapon has no positive matching '+elementSkillTypes[job.skillId]+' element. A zero damage delta does not demonstrate a missing skill effect.'};
  return {...basis,expectation:'UNRESOLVED',reason:'Matching element exists, but element-hit participation, cap and conditional interaction have not independently been established.'};
 }
 if(job.skillId===119)return {...basis,expectation:'CHANGE_NOT_REQUIRED',reason:'Handicraft promises gauge length, not necessarily a higher damage multiplier. Gauge duration/color transition is not tested by this fixed standard combo.'};
 return {...basis,expectation:'UNRESOLVED',reason:'Candidate rank is in scope, but weapon/move, activation state, component or cap prerequisites for a required damage change have not been established.'};
}
function compareSkill(job,control,actual,options={}){
 const result={decision:null,absoluteTolerance:TOLERANCE,scope:'MATCHED_CONTROL_DIRECTION_AND_CHANGE_CHECK_NOT_NUMERIC_ACCURACY',numericAccuracyVerified:false,channels:{}};
 if(!options.inputGrantObserved)return {...result,decision:'INPUT_SKILL_NOT_ESTABLISHED',reason:'Requested input skill/rank was not observed.'};
 if(job.equipmentRoute==='REAL_DATABASE_ARMOR_PIECES')return {...result,decision:'MATCHED_CONTROL_UNAVAILABLE',reason:'Removing the set/group requires changing real armor, co-granted skills and resistance. No single-skill counterfactual was fabricated.'};
 if(!options.sameContext)return {...result,decision:'MATCHED_CONTROL_UNAVAILABLE',reason:'Unrelated equipment/skills, target, selected actions or external conditions differ from the no-target-skill control.'};
 for(const channel of ['normal','maximum']){
  const a=actual.channels?.[channel],b=control.channels?.[channel];const expected=expectedChange(job,control,channel);
  if(a?.status!=='available'||b?.status!=='available'||a.executionStatus!=='complete'||b.executionStatus!=='complete'||!Number.isFinite(a.value)||!Number.isFinite(b.value)){result.channels[channel]={decision:'NOT_COMPARABLE_UNCALCULATED',expectation:expected,control:b?.value??null,observed:a?.value??null};continue;}
  const delta=a.value-b.value,changed=Math.abs(delta)>TOLERANCE;
  const decision=expected.expectation==='INCREASE_EXPECTED'?(delta>TOLERANCE?'CHANGE_OBSERVED_ACCURACY_UNVERIFIED':'REVIEW_REQUIRED_EXPECTED_CHANGE_MISSING'):expected.expectation==='CHANGE_NOT_REQUIRED'?(changed?'CHANGE_OBSERVED_ACCURACY_UNVERIFIED':'NOT_EXERCISED_BY_THIS_FIXTURE'):expected.expectation==='NOT_EXERCISED'?(changed?'REVIEW_REQUIRED_UNEXPECTED_CHANGE':'NOT_EXERCISED_BY_THIS_FIXTURE'):changed?'CHANGE_OBSERVED_ACCURACY_UNVERIFIED':'REVIEW_CONDITIONS_UNRESOLVED';
  result.channels[channel]={decision,control:b.value,observed:a.value,delta,changed,expectation:expected};
 }
 const states=Object.values(result.channels).map(x=>x.decision);
 result.decision=['NOT_COMPARABLE_UNCALCULATED','REVIEW_REQUIRED_EXPECTED_CHANGE_MISSING','REVIEW_REQUIRED_UNEXPECTED_CHANGE','REVIEW_CONDITIONS_UNRESOLVED'].find(x=>states.includes(x))||(states.every(x=>x==='NOT_EXERCISED_BY_THIS_FIXTURE')?'NOT_EXERCISED_BY_THIS_FIXTURE':'CHANGE_OBSERVED_ACCURACY_UNVERIFIED');
 return result;
}
module.exports={compareSkill,expectedChange};
