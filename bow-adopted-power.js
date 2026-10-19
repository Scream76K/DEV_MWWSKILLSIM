const BOW_CONVERT_ELEMENT_LV3_SOURCE=Object.freeze({skillId:152,rankId:400,level:3,displayedFlat:180,order:'AFTER_DRAGON_ATTACK_MULTIPLIER',sourceUrl:'https://mobalytics.gg/mhw/guides/convert-element-guide',sourcePublishedAt:'2025-03-28',retrievedAt:'2026-10-19',gameVersion:null,verification:'PROVISIONAL_SOURCE_TEST_REPORT_NOT_GAME_VERIFIED',procDamageIncluded:false,capGuard:{sourceUrl:'https://kuroyonhon.com/mhwilds/memo/31.php',scope:'CONSERVATIVE_PRE_1_04_LIMIT_NOT_CAP_FORMULA_ADOPTION',baseFlat:350,baseMultiplier:1.9}});
const BOW_DECLARATION_I_SOURCE=Object.freeze({parentId:178,rankId:441,multiplier:1.2,flat:20,revision:1,verification:'SOURCE_CONFIRMED_NOT_GAME_VERIFIED',gameVersion:null,sourceUrl:'https://kuroyonhon.com/mhwilds/program/skill.php',orderEvidence:'https://gamewith.jp/mhwilds/534856',retrievedAt:'2026-10-17',order:'WEAPON_BASE_TIMES_MULTIPLIERS_THEN_FLATS'});
const BOW_SCENARIO_FIELDS=Object.freeze({monsterState:['NORMAL','ENRAGED'],frenzy:['NONE','INFECTED','OVERCOME'],weakness:['NONE','EFFECTIVE','WOUNDED'],health:['NOT_FULL','FULL'],rush:['INACTIVE','ACTIVE'],burst:['MAINTAINED_FIVE_HITS'],guts:['BEFORE','AFTER']});

// KAN-108: r250 adapter. Only the adopted bow route enters this producer.
// Motion/hit/state coefficients stay in the existing Technique DB/BowReference.
function bowAdoptedRoute(st){return Array.isArray(st?.activeBonusEffects)&&st.activeBonusEffects.some(e=>[10,62,106,115,155,157,167,178].includes(MHSeriesGroupIdentity.resolveEffect(e).parent?.id));}
function bowAdoptedBaseAffinity(st){if(st.affinityKnown===false||typeof st.affinity!=='number'||!Number.isFinite(st.affinity))throw Error('BOW_AFFINITY_UNKNOWN');return Math.min(100,Math.max(-100,st.affinity));}
function bowAdoptedMaximumAffinity(st,total,w,part){
 return calcMaxAffinity(total,st.affinity,w,part,st.activeBonusEffects);
}
function bowAdoptedInputGuidance(){
 const missing=[],monsterId=$('monster')?.value,partId=$('monsterPart')?.value;
 const target=selectableMonsters().find(m=>String(m.id)===monsterId),state=compareStep5Snapshot().bowState;
 if(!target||target.kind!=='large')missing.push('対象モンスター（最大側は大型）');
 if(!partId||!selectedPart())missing.push('対象部位');
 if(!state.coating)missing.push('ビン');if(state.coating!=='NONE'&&skillLevel(calcState.total||{},['フォースショット','Force Shot'])>0&&!Number.isInteger(state.startShot))missing.push('装填後の開始射撃');
 return missing.length?'⑥で'+missing.join('・')+'を選択してください。ビン・開始射撃を「弓の比較条件」で確認してください。距離の選択値にかかわらず適正距離で計算します。':'';
}
function renderBowAdoptedPowerSummary(){
 if(!window.BowReference||!window.TechniqueDBEngine||!calcState.stats?.weaponKind)return;
 const host=$('buildSummary');if(!host)return;
 if(canonicalWeaponKind(selectedWeapon())!=='bow'||!bowAdoptedRoute(calcState.stats)){$('powerIndexSummary')?.remove();return;}
 let display=$('powerIndexSummary');if(!display){display=document.createElement('div');display.id='powerIndexSummary';display.className='notice';display.style.gridColumn='1 / -1';host.appendChild(display);}
 const p=standardPowerForStats('bow',calcState.stats,compareStep5Snapshot(),calcState.total||{}),n=p.normal?.comparisonPower,m=p.maximum?.comparisonPower;
 display.textContent=(p.normal?.inputReceipt?.convertElement?'属性変換Lv3：通常未発動／最大は龍属性+180を龍属性強化後に暫定加算（資料ベース・実機未照合）。 ':'')+(bowAdoptedInputGuidance()?bowAdoptedInputGuidance()+' ':'')+'火力指数：'+(Number.isFinite(n)?n.toFixed(2):'未算出 — '+(p.reason||'条件未指定'))+' ／ 最大火力指数：'+(Number.isFinite(m)?m.toFixed(2):'未算出 — '+(p.maximumReason||p.reason||'条件未指定'))+'（固定3射'+(compareStep5Snapshot().bowState.coating==='PIERCE'?'・各矢3Hit（計42Hit）':'')+'、連撃5Hit維持。最大側：怒り・克服・傷口・満タン・巧撃、装備時は拘束からの回復・激励・状態異常・属性変換Lv3の条件成立時。正式DPSとは別）'+(hpEffectPolicyText(p.effectPolicy)?'。'+hpEffectPolicyText(p.effectPolicy)+'。':'');
}
document.addEventListener('DOMContentLoaded',()=>{
 for(const id of ['powerBowCoating','powerBowRange','powerBowStartShot','powerGutsState','dCB','dHZ','dEHZ','monster','monsterPart'])for(const event of ['input','change'])$(id)?.addEventListener(event,renderBowAdoptedPowerSummary);
 renderBowAdoptedPowerSummary();
});

function bowDeclarationElement(st,monsterState){return standardDeclarationElement(st,monsterState);}
function standardDeclarationElement(st,monsterState){
 if(!['NORMAL','ENRAGED'].includes(monsterState))throw Error('DECLARATION_MONSTER_STATE_UNKNOWN');
 if(equipmentElementPendingReason(st))throw Error(equipmentElementPendingReason(st));
 const c=st.elementComponents;if(!c||!['weaponBase','normalMultiplier','normalFlat'].every(k=>typeof c[k]==='number'&&Number.isFinite(c[k]))||Math.abs(c.weaponBase*c.normalMultiplier+c.normalFlat-st.element)>1e-6)throw Error('DECLARATION_ELEMENT_COMPONENTS_UNKNOWN');
 const effect=(st.activeBonusEffects||[]).find(e=>MHSeriesGroupIdentity.resolveEffect(e).parent?.id===178);
 if(!effect)return {...st,elementComponents:{...c}};
 const id=MHSeriesGroupIdentity.resolveEffect(effect);if(id.status!=='IDENTIFIED'||![441,442].includes(id.rank.id)||id.parent.kind!=='set')throw Error('DECLARATION_RANK_UNSUPPORTED');
 // Owner-approved displayed-element formula; retain established I component order.
 // No physical attack multiplier and no displayed-to-internal conversion here.
 const active=monsterState==='ENRAGED',multiplier=id.rank.id===441?1.2:1.3,flat=id.rank.id===441?20:40;
 const trueElement=['fire','water','thunder','ice','dragon'].includes(st.elementType)&&c.weaponBase>0;
 const basis={...c,normalMultiplier:c.normalMultiplier*(active&&trueElement?multiplier:1),normalFlat:c.normalFlat+(active&&trueElement?flat:0)};
 return {...st,element:basis.weaponBase*basis.normalMultiplier+basis.normalFlat,elementComponents:basis};
}

// Shared source-backed group amounts; bow snapshots own activation, not new coefficients.
function bowAdoptedBonusPlan(st,total,scenario){
 const effects=hpRelevantBonusEffects(st.activeBonusEffects||[]).filter(e=>[10,62,106,115,131,155,157,167].includes(e.bonusSkillId));
 const plan=standardGroupPowerPlan({...st,activeBonusEffects:effects},scenario.guts,total,'bow');
 const facts={};
 if(scenario.channel!=null)facts.maximum=scenario.channel==='MAXIMUM';
 if(['NONE','INFECTED','OVERCOME'].includes(scenario.frenzy)){facts.overcome=scenario.frenzy==='OVERCOME';facts.infected=scenario.frenzy==='INFECTED';}
 for(const key of ['encouragement','statusAilment','bindingRecovery'])if(['ACTIVE','INACTIVE'].includes(scenario[key]))facts[key]=scenario[key]==='ACTIVE';
 facts.burst=scenario.burst==='MAINTAINED_FIVE_HITS';
 return commonBonusReceipt(plan,facts);
}

function bowConvertElementPlan(st,total,scenario,skills){return standardConvertElementPlan(st,total,scenario,skills);}
function standardConvertElementPlan(st,total,scenario,skills){
 const row=skills.find(x=>x.skillId===152);if(!row)return null;
 if(!['INACTIVE','ACTIVE'].includes(scenario.convertElement))throw Error('BOW_STATE_UNKNOWN:convertElement');
 const active=scenario.convertElement==='ACTIVE',dragon=st.elementType==='dragon';
 if(active&&dragon){
  if(bowReferenceSkills(total).chargeMaster||(scenario.monsterState==='ENRAGED'&&(st.activeBonusEffects||[]).some(e=>MHSeriesGroupIdentity.resolveEffect(e).parent?.id===178)))throw Error('CONVERT_ELEMENT_MULTIPLIER_ORDER_PENDING');
  const level=skillLevel(total,['龍属性攻撃強化','Dragon Attack']),expected=[1,1,1.1,1.2][level];
  if(expected==null||st.elementComponents?.normalMultiplier!==expected)throw Error('CONVERT_ELEMENT_MULTIPLIER_ORDER_PENDING');
 }
 return {...BOW_CONVERT_ELEMENT_LV3_SOURCE,active,dragonWeapon:dragon,appliedFlat:active&&dragon?180:0};
}

function bowAdoptedScenarioResult(scenario,conditions,inputs){
 const reasons=[],pending=()=>({schemaVersion:1,channel:'NORMAL',scope:'BOW_ADOPTED_FIXED_THREE_SHOTS_V1',status:'NOT_EVALUATED',evaluationStatus:'NOT_EVALUATED',value:null,damage:null,physical:null,element:null,dps:null,completeness:'UNAVAILABLE',verification:'UNRESOLVED',baseline100Eligible:false,reasons:[...new Set(reasons)]});
 try{
  if(scenario?.schemaVersion!==1||scenario.confirmed!==true)throw Error('BOW_SCENARIO_UNCONFIRMED');
  for(const [k,values]of Object.entries(BOW_SCENARIO_FIELDS))if(!values.includes(scenario[k]))reasons.push('BOW_STATE_UNKNOWN:'+k);
  if(reasons.length)return pending();
  const frame=inputs?.capture,weapon=frame?.weapon||selectedWeapon(),monsterId=frame?frame.target.monsterId:$('monster')?.value,partId=frame?frame.target.partId:$('monsterPart')?.value;
  if(!monsterId||!partId)throw Error('BOW_TARGET_UNCONFIRMED');
  const st=inputs?.stats||calcState.stats,total=inputs?.total||calcState.total||{};if(canonicalWeaponKind(weapon)!=='bow')throw Error('BOW_WEAPON_REQUIRED');
  if(st.attackKnown===false||st.affinityKnown===false)throw Error(st.attackKnown===false?'WEAPON_ATTACK_MISSING':'WEAPON_AFFINITY_MISSING');
  const originalActive=st.activeBonusEffects||[],classified=classifyHpBonusEffects(originalActive),effectPolicy=hpEffectPolicy(st,total);
  if(classified.effects.some(e=>HP_COMPONENT_POLICIES.series[MHSeriesGroupIdentity.resolveEffect(e).parent?.id]))throw Error('BOW_BONUS_IDENTITY_OR_SCOPE_UNSUPPORTED');
  const active=classified.effects,allowed=new Map([[10,[22]],[62,[152,153]],[157,[412]],[167,[424]],[106,[267,268]],[115,[292,293]],[155,[408]],[178,[441,442]],[26,[60,61]],[131,[344]]]),seen=new Set();
  for(const e of active){const x=MHSeriesGroupIdentity.resolveEffect(e);if(x.status!=='IDENTIFIED'||!allowed.get(x.parent.id)?.includes(x.rank.id)||seen.has(x.parent.id))throw Error('BOW_BONUS_IDENTITY_OR_SCOPE_UNSUPPORTED');seen.add(x.parent.id);}
  // Exact fixed Shot / Power Shot / Power Volley scope. Blight Resistance (49)
  // has no HP modifier; Partbreaker (129) modifies part accumulation and Focus
  // wound destruction, neither of which is an event in this fixed sequence.
  // Ballistics (53) does not change the fixed critical-range modifier; Evade Window
  // (77) changes the evade window, not the preactivated Adrenaline Rush amount.
  // Divine Blessing (122) reduces incoming damage, not this outgoing snapshot.
  // Normal/Rapid Up (6) and Spread/Power Shots (2) flow to bowReferenceSkills below.
  // Keep rank validation; Convert Element is restricted to sourced Lv3 below.
  const ordinary=new Set([2,3,6,14,18,22,24,38,41,49,53,57,58,63,66,72,77,95,100,120,122,129,137,144,147,152,154]),skills=[];
  for(const [name,level]of Object.entries(total)){if(originalActive.some(e=>e.name===name))continue;const skill=DB.skills.find(s=>s.name===name),rank=skill?.ranks?.find(r=>r.level===level);if(!skill||!ordinary.has(skill.id)||!rank)throw Error('BOW_SKILL_SCOPE_UNSUPPORTED:'+name);if(skill.id===152&&(level!==3||rank.id!==400||rank.skill?.id!==152))throw Error('CONVERT_ELEMENT_LEVEL_UNSUPPORTED');if(skill.id===72&&(!Number.isInteger(level)||level<1||level>5||rank.id!==174+level||rank.skill?.id!==72))throw Error('BOW_ATTACK_RANK_UNCONFIRMED');skills.push({skillId:skill.id,rankId:rank.id,level,name});}
  const target=frame?frame.target.monster:selectableMonsters().find(m=>String(m.id)===monsterId);if(!target)throw Error('BOW_TARGET_UNCONFIRMED');if(scenario.monsterState==='ENRAGED'&&target.kind!=='large')throw Error('BOW_RAGE_REQUIRES_LARGE_MONSTER');
  const commonPlan=inputs.commonPlan||standardPowerConditionPlan(st,total,'bow',conditions);
  const scenarioFacts=commonScenarioFacts('bow',scenario,true);
  const pendingReasons=commonPlan.pending.filter(reason=>{
   if(reason.startsWith('CONVERT_ELEMENT'))return scenarioFacts.convertElement;
   if(reason.startsWith('DECLARATION')||reason.startsWith('巨戟龍の黙示録'))return scenarioFacts.enraged;
   return scenarioFacts.maximum||['enraged','overcome','fullHealth','rush','bindingRecovery','encouragement','statusAilment','convertElement'].some(key=>scenarioFacts[key]);
  });
  if(pendingReasons.length)throw Error(pendingReasons.join(' / '));
  const resolved=commonApplyPowerResolution(st,total,'bow',commonPlan.resolution,scenario,{monsterCanFrenzy:false,adoptedBow:true});
  const attack=resolved.stats.attackTrue,element=resolved.stats.element,affinity=resolved.stats.affinity,uncappedAffinity=resolved.uncappedAffinity,basis=resolved.elementBasis;
  const bonusPlan=resolved.bonusPlan;
  const convertItem=commonPlan.applied.find(item=>item.convertElement),convertElement=convertItem?{...convertItem.convertElement,active:resolved.facts.convertElement,appliedFlat:resolved.facts.convertElement?convertItem.elementAdd:0}:null;
  if(convertElement)effectPolicy.excludedEffects.push({name:'属性変換',skillId:152,rankId:400,level:3,component:'PROC_DAMAGE',includedInDamage:false,sourceRef:convertElement.sourceUrl});
  const stored=scenario.calculationConditions;if(stored){const mismatch=[];for(const k of ['hz','ehz'])if(Number(stored[k])!==Number(conditions[k]))mismatch.push(k);const sourceState={...stored.bowState},targetState={...conditions.bowState};for(const state of [sourceState,targetState])if(state.range==null||['','CRITICAL','NEAR','FAR'].includes(state.range))state.range='CRITICAL';for(const k of ['chargeLevel','coating','range','startShot'])if(sourceState[k]!==targetState[k])mismatch.push('bowState.'+k);if(stored.monsterId!==monsterId)mismatch.push('monsterId');if(stored.partId!==partId)mismatch.push('partId');if(mismatch.length)throw Error('BOW_SAVED_CONDITIONS_MISMATCH:'+mismatch.join(','));}
  const hz=Number(conditions.hz),ehz=Number(conditions.ehz);if(conditions.hz==null||conditions.hz===''||conditions.ehz==null||conditions.ehz===''||![hz,ehz].every(v=>Number.isFinite(v)&&v>=0&&v<=100))throw Error('BOW_HITZONES_UNCONFIRMED');
  const plan=bowComparisonStatePlan(conditions.bowState);if(plan.status!=='REFERENCE_READY')throw Error('BOW_SHOT_STATE_UNCONFIRMED');
  const cb=resolveCriticalBoostInput(conditions.cb,total);if(!Number.isInteger(cb)||cb<0||cb>5)throw Error('BOW_CRITICAL_BOOST_UNSUPPORTED');
  const result=window.BowReference.standard({attack,element,affinity,criticalMultiplier:criticalMultiplierForState(100,cb,'critical'),physicalHitzone:hz,elementalHitzone:ehz,skills:bowReferenceSkills(total),elementBasis:basis,bladescaleLoadingActive:false,state:plan.state},window.TechniqueDBEngine,BOW_STANDARD_PROFILE.sequence);
  const signature=frame?.signature||JSON.stringify(buildSnapshotComparable(buildSnapshot())),receipt={equipment:{signature,weaponId:weapon.id},scenario:JSON.parse(JSON.stringify(scenario)),conditions:{hz,ehz,bowState:{...plan.state}},attack,affinity,uncappedAffinity,element,elementBasis:basis,skills,bonusPlan,convertElement,commonEffects:resolved.stats.commonEffects,sourceGameVersion:null};
  return {...pending(),status:'EVALUATED',evaluationStatus:'EVALUATED',value:result.comparisonPower,damage:result.comparisonPower,physical:result.physical,element:result.element,special:null,completeness:'COMPLETE',verification:'PROVISIONAL',modelVerification:'ENGINE_REGRESSION_TESTED',liveGameVerification:'PENDING',reasons:['TARGET_GAME_DAMAGE_VALIDATION_PENDING','BOW_TIMING_UNCONFIRMED'],inputReceipt:receipt,trace:result.trace,effectPolicy,excludedEffects:effectPolicy.excludedEffects,sourceRefs:[...(convertElement?[convertElement.sourceUrl]:[]),BOW_DECLARATION_I_SOURCE.sourceUrl,BOW_DECLARATION_I_SOURCE.orderEvidence,'OWNER_DECLARATION_ELEMENT_FORMULA_20261019',STANDARD_BURST_SOURCE.url,...bonusPlan.applied.map(x=>x.evidenceRef),'OWNER_FRENZY_OVERCOME_20261016'],modelRevision:'BOW_ADOPTED_SCENARIO_V1'};
 }catch(e){reasons.push(String(e.message||e));return pending();}
}

function bowAdoptedStandardPower(st,cond,total,commonPlan=null){
 const normalState=commonPowerScenario('bow','NORMAL',st,total,cond),maxState=commonPowerScenario('bow','MAXIMUM',st,total,cond);
 const evaluate=state=>bowAdoptedScenarioResult(state,cond,{stats:st,total,commonPlan});
 const n=evaluate(normalState),m=evaluate(maxState),pack=x=>x.value===null?null:{comparisonPower:x.value,physical:x.physical,element:x.element,special:0,trace:x.trace,scope:x.scope,inputReceipt:x.inputReceipt,verification:x.verification};
 return {status:n.value===null?'PENDING':m.value===null?'MAXIMUM_PENDING':'REFERENCE_ONLY',profileId:BOW_STANDARD_PROFILE.id,normal:pack(n),maximum:pack(m),reason:n.value===null?n.reasons.join(' / '):null,maximumReason:m.value===null?m.reasons.join(' / '):null,normalScope:'BOW_ADOPTED_STANDARD_NORMAL',maximumScope:'BOW_ADOPTED_COMPATIBLE_STATE_SNAPSHOT',scenarioEvidence:{normal:normalState,maximum:maxState,conditions:'連撃5Hit強化維持。最大側は怒り・克服・傷口・体力満タン・巧撃、装備時は拘束からの回復・激励・状態異常（狂竜症克服とは別）の同時成立snapshot。現在の発動状態ではない。'},liveGameVerification:'PENDING',effectPolicy:n.effectPolicy||m.effectPolicy};
}

// Exact CANONICAL_DB three-shot adapter. Time remains owned by those same IDs.
function bowAdoptedComboContext(input,ctx){
 if(!exactAdoptedBowCombo(input))throw Error('BOW_ADOPTED_EXACT_THREE_SHOTS_REQUIRED');
 if(!['NORMAL','MAXIMUM'].includes(input.channel))throw Error('BOW_CHANNEL_REQUIRED');
 const total=input.total,has=id=>(input.stats.activeBonusEffects||[]).some(e=>MHSeriesGroupIdentity.resolveEffect(e).parent?.id===id);
 const common={schemaVersion:1,confirmed:true,burst:'MAINTAINED_FIVE_HITS',guts:input.conditions.gutsState??'BEFORE'};
 const scenario=(input.scenario?{...input.scenario,channel:input.channel}:null)||(input.channel==='NORMAL'?{...common,channel:'NORMAL',bindingRecovery:'INACTIVE',monsterState:'NORMAL',frenzy:'NONE',weakness:'NONE',health:'NOT_FULL',rush:'INACTIVE',encouragement:'INACTIVE',statusAilment:'INACTIVE',convertElement:'INACTIVE'}:{...common,channel:'MAXIMUM',bindingRecovery:'ACTIVE',monsterState:'ENRAGED',frenzy:has(106)?'OVERCOME':'NONE',weakness:skillLevel(total,['弱点特効','Weakness Exploit'])?'WOUNDED':'NONE',health:'FULL',rush:'ACTIVE',encouragement:'ACTIVE',statusAilment:'ACTIVE',convertElement:'ACTIVE'});
 const result=bowAdoptedScenarioResult(scenario,input.conditions,{stats:input.stats,total,capture:input});
 if(result.value===null)throw Error(result.reasons.join(' / '));
 const results=input.moves.map(move=>{const trace=result.trace.filter(h=>h.techniqueId===move.canonicalTechniqueId),physical=trace.reduce((n,h)=>n+h.physical,0),element=trace.reduce((n,h)=>n+h.element,0);return {techniqueId:move.canonicalTechniqueId,handler:'RangedReferenceHandler',physical,element,special:0,total:physical+element,trace,hits:trace.map(h=>({p:h.physical,e:h.element,total:h.physical+h.element})),status:'CALCULATED'};});
 return {...ctx,p0RangedResults:results,adoptedBowReceipt:{...result.inputReceipt,channel:input.channel,signature:input.signature}};
}
