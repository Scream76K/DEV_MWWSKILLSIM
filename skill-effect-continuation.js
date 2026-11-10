(function(root){'use strict';
 const CHANNELS=['normal','maximum'];
 const available=(r,ch)=>{const c=r?.channels?.[ch],m=c?.metrics?.comboTotalDamage;return c?.execution?.status==='complete'&&m?.status==='available'&&Number.isFinite(m.value)&&m.value>=0;};
 const reason=(r,ch)=>{const c=r?.channels?.[ch];return c?.components?.find(x=>x.status!=='available')?.reason||c?.execution?.reason||c?.issues?.[0]?.reason||c?.issues?.[0]?.code||c?.metrics?.comboTotalDamage?.reason||r?.reason||'SKILL_COMBINATION_UNRESOLVED';};
 // C05: the fixed GL target already computes 162 body affinity. Preserve those
 // proven body components while omitting only its explicitly unresolved shell
 // interaction. This is not a general cross-state/component-max composition.
 function retainGLBodyComponents({trial,accepted,entry,weaponKind,techniqueIds}){
  const ids=['GL_SLAM','GL_SWEEP','GL_WYRMSTAKE_FULL_BURST','GL_MULTI_WYRMSTAKE_FULL_BURST'];
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  if(weaponKind!=='gunlance'||!same(techniqueIds,ids)||entry?.skillId!==162||![1,2].includes(entry.rankLevel)||entry.name!=='蒼雷一閃'+(entry.rankLevel===1?'Ⅰ':'Ⅱ'))return null;
  if(!trial||!accepted||![trial,accepted].every(c=>c.execution?.status==='complete'&&!c.execution.reason&&Array.isArray(c.execution.expected)&&same(c.execution.expected,c.execution.executed)&&Array.isArray(c.issues)&&!c.issues.length&&Array.isArray(c.effectPlan?.unresolved)&&!c.effectPlan.unresolved.length&&!c.diagnostics?.healthBranchComparison&&!c.diagnostics?.routeTotals))return null;
  if(![trial,accepted].every(c=>c.finalState&&typeof c.finalState==='object'&&!Array.isArray(c.finalState)&&Object.keys(c.finalState).length>0&&Array.isArray(c.effectPlan.effects)))return null;
  if(accepted.metrics?.comboTotalDamage?.status!=='available'||!Number.isFinite(accepted.metrics.comboTotalDamage.value))return null;
  if(!same(trial.execution.expected,accepted.execution.expected)||!same(trial.finalState,accepted.finalState)||!Array.isArray(trial.components)||!trial.components.length||!Array.isArray(accepted.components)||trial.components.length!==accepted.components.length)return null;
  const identity=c=>[c.eventId,c.id,c.techniqueId,c.revision,c.source,c.coefficientUnit,c.damageUnit];
  const origins=[],components=[],identities=new Set();let unsupported=0;
  for(let i=0;i<trial.components.length;i++){
   const a=trial.components[i],b=accepted.components[i];
   const key=JSON.stringify(identity(a));
   if(!identity(a).every(x=>typeof x==='string'&&x.length>0)||identities.has(key))return null;identities.add(key);
   if(!same(identity(a),identity(b))||b.status!=='available'||!Number.isFinite(b.value)||b.value<0)return null;
   if(a.status==='available'){
    if(!Number.isFinite(a.value)||a.value<0||!/:physical:|:element:/.test(a.id))return null;
    components.push(a);origins.push({identity:identity(a),source:'WITH_BODY_SKILL_TRIAL'});
   }else{
    if(a.status!=='unavailable'||!a.id.includes(':shelling:')||a.reason!=='GL_TARGET:UNREVIEWED_MODIFIER:'+entry.name)return null;
    unsupported++;components.push(b);origins.push({identity:identity(a),source:'WITHOUT_UNSUPPORTED_SKILL_EFFECT',reason:a.reason});
   }
  }
  if(!unsupported||unsupported===components.length)return null;
  const value=components.reduce((n,c)=>n+c.value,0);if(!Number.isFinite(value)||value<0)return null;
  return {...trial,components,effectPlan:{...trial.effectPlan,scope:'RETAINED_BODY_COMPONENTS_ONLY'},metrics:{...trial.metrics,comboTotalDamage:{status:'available',value},comboDps:{status:'unavailable',value:null,reason:'DPS_OUTSIDE_PARTIAL_SKILL_CONTINUATION_SCOPE'}},diagnostics:{...trial.diagnostics,componentSkillContinuation:{scope:'GL_OWNER_FOUR_TECHNIQUES_162_BODY_AFFINITY_RETAINED_SHELL_INTERACTION_OMITTED',skillId:162,origins,partialEffectPlan:accepted.effectPlan,partialDiagnostics:accepted.diagnostics,completeSkillResult:false}}};
 }
 function continueSkillEffects({original,candidates,evaluate,componentContext=null}){
  if(CHANNELS.every(ch=>available(original,ch))||!candidates.length)return original;
  const ordered=[...candidates].sort((a,b)=>Number(b.preserveAdoptedBody===true)-Number(a.preserveAdoptedBody===true)||a.skillId-b.skillId||a.name.localeCompare(b.name)),cache=new Map();
  const budget=1+2*ordered.length*(ordered.length+1);let evaluations=0;
  const run=active=>{const key=active.map(x=>x.name).sort().join('\u0000');if(cache.has(key))return cache.get(key);if(evaluations>=budget)return null;evaluations++;let r;try{r=evaluate(active);}catch(error){r={status:'UNAVAILABLE',reason:String(error?.message||error)};}cache.set(key,r);return r;};
  const empty=run([]);let output=original;
  for(const ch of CHANNELS){
   if(available(original,ch)||!available(empty,ch))continue;
   let active=[],pending=[...ordered],accepted=empty;const failed=new Map();
   // Preserve already-adopted body effects first, then stable source-ID priority. Retry deferred dependencies after every productive
   // pass. This is a bounded calculable subset, not a maximum-damage optimizer.
   for(let pass=0;pass<=ordered.length&&pending.length;pass++){
    let progress=false;const deferred=[];
    for(const entry of pending){const trial=run([...active,entry]);if(available(trial,ch)){active.push(entry);accepted=trial;progress=true;failed.delete(entry.name);}else{deferred.push(entry);failed.set(entry.name,reason(trial,ch));}}
    pending=deferred;if(!progress)break;
   }
   if(!pending.length)continue; // Do not replace an unexplained full-input failure.
   let recovered=accepted.channels[ch],partiallyRetained=null;
   const bodyEntry=pending.find(x=>x.skillId===162);
   if(bodyEntry&&componentContext){
    const trial=run([...active,bodyEntry]);
    const retained=retainGLBodyComponents({...componentContext,trial:trial?.channels?.[ch],accepted:recovered,entry:bodyEntry});
    if(retained){recovered=retained;partiallyRetained=bodyEntry;}
   }
   const ignoredSkillEffects=pending.map(entry=>({...entry,channel:ch,status:entry===partiallyRetained?'PARTIALLY_APPLIED_UNSUPPORTED_COMPONENTS':'IGNORED_UNSUPPORTED_EFFECT',reason:failed.get(entry.name),reasonOrigin:'TRIAL_COMBINATION_NOT_SINGLE_SKILL_CAUSATION',scope:entry===partiallyRetained?'BODY_AFFINITY_RETAINED_ONLY_UNSUPPORTED_SHELL_INTERACTION_OMITTED':'CURRENT_TECHNIQUE_CONDITIONS_AND_RETAINED_SKILL_COMBINATION',...(entry===partiallyRetained?{componentOrigins:recovered.diagnostics.componentSkillContinuation.origins}:{}),retainedSkills:active.map(x=>({skillId:x.skillId,name:x.name,level:x.level})),liveGameVerification:'NOT_VERIFIED'}));
   const skillContinuation={policy:'ADOPTED_BODY_FIRST_THEN_SOURCE_ID_WITH_DEPENDENCY_RETRY',originalReason:reason(original,ch),evaluations,budget,completeSkillResult:false,interactionWarning:'Omitted skills and their interactions are not included. The selected subset is not guaranteed globally maximal.'};
   const annotate=c=>({...c,diagnostics:{...c.diagnostics,calculationCompleteness:'PARTIAL_SKILL_EFFECTS',ignoredSkillEffects,skillContinuation}});
   // A recovered channel is complete only for its disclosed retained subset.
   // Never carry a former global/route failure forward, or copy an unannotated
   // other channel out of a trial. Already available original channels stay exact.
   const {channels:trialChannels,routes:trialRoutes,status:trialStatus,reason:trialReason,...metadata}=accepted;
   output={...metadata,...output,status:'OK',reason:null,channels:{...(output.channels||{}),[ch]:annotate(recovered)}};
   if(accepted.routes){output.routes={...(output.routes||{})};for(const [key,route] of Object.entries(accepted.routes)){
    const {channels:routeChannels,status:routeStatus,reason:routeReason,...routeMetadata}=route;
    output.routes[key]={...routeMetadata,...(output.routes[key]||{}),status:'OK',reason:null,channels:{...(output.routes[key]?.channels||{}),[ch]:annotate(route.channels[ch])}};
   }}
  }
  return output;
 }
 const api=Object.freeze({continueSkillEffects,retainGLBodyComponents});root.MHWSkillEffectContinuation=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
