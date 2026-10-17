const BOW_DECLARATION_I_SOURCE=Object.freeze({parentId:178,rankId:441,multiplier:1.2,flat:20,revision:1,verification:'SOURCE_CONFIRMED_NOT_GAME_VERIFIED',gameVersion:null,sourceUrl:'https://kuroyonhon.com/mhwilds/program/skill.php',orderEvidence:'https://gamewith.jp/mhwilds/534856',retrievedAt:'2026-10-17',order:'WEAPON_BASE_TIMES_MULTIPLIERS_THEN_FLATS'});
const BOW_SCENARIO_FIELDS=Object.freeze({monsterState:['NORMAL','ENRAGED'],frenzy:['NONE','INFECTED','OVERCOME'],weakness:['NONE','EFFECTIVE','WOUNDED'],health:['NOT_FULL','FULL'],rush:['INACTIVE','ACTIVE'],burst:['MAINTAINED_FIVE_HITS'],guts:['BEFORE','AFTER']});

// KAN-108: r250 adapter. Only the adopted bow route enters this producer.
// Motion/hit/state coefficients stay in the existing Technique DB/BowReference.
function bowAdoptedRoute(st){return Array.isArray(st?.activeBonusEffects)&&st.activeBonusEffects.some(e=>[106,178].includes(MHSeriesGroupIdentity.resolveEffect(e).parent?.id));}
function bowAdoptedBaseAffinity(st){if(st.affinityKnown===false||typeof st.affinity!=='number'||!Number.isFinite(st.affinity))throw Error('BOW_AFFINITY_UNKNOWN');return Math.min(100,Math.max(-100,st.affinity));}
function bowAdoptedFrenzyBonus(total){
 const level=skillLevel(total,['無我の境地','Antivirus']);if(!Number.isInteger(level)||level<0||level>3)throw Error('BOW_FRENZY_PARAMETERS_UNCONFIRMED');
 if(!level)return 15; // Owner-confirmed Frenzy recovery reward, 2026-10-16.
 const ranks=DB.skills.find(s=>s.id===18)?.ranks?.filter(r=>r.level===level&&r.skill?.id===18)||[];
 const match=ranks.length===1?ranks[0].description?.normalize('NFKC').replace(/\s/g,'').match(/克服状態の時、さらに会心率\+(\d+)%/):null;
 if(!match)throw Error('BOW_FRENZY_PARAMETERS_UNCONFIRMED');return 15+Number(match[1]);
}
function bowAdoptedMaximumAffinity(st,total,w,part){
 const gore=st.activeBonusEffects.some(e=>MHSeriesGroupIdentity.resolveEffect(e).parent?.id===106);
 return gore?calcMaxAffinity({...total,'黒蝕一体':1},st.affinity,w,part):st.maxAffinity;
}
function renderBowAdoptedPowerSummary(){
 if(!window.BowReference||!window.TechniqueDBEngine||!calcState.stats?.weaponKind)return;
 const host=$('buildSummary');if(!host)return;
 if(canonicalWeaponKind(selectedWeapon())!=='bow'||!bowAdoptedRoute(calcState.stats)){$('powerIndexSummary')?.remove();return;}
 let display=$('powerIndexSummary');if(!display){display=document.createElement('div');display.id='powerIndexSummary';display.className='notice';display.style.gridColumn='1 / -1';host.appendChild(display);}
 const p=standardPowerForStats('bow',calcState.stats,compareStep5Snapshot(),calcState.total||{}),n=p.normal?.comparisonPower,m=p.maximum?.comparisonPower;
 display.textContent='火力指数：'+(Number.isFinite(n)?n.toFixed(2):'未算出 — '+(p.reason||'条件未指定'))+' ／ 最大火力指数：'+(Number.isFinite(m)?m.toFixed(2):'未算出 — '+(p.maximumReason||p.reason||'条件未指定'))+'（固定3射'+(compareStep5Snapshot().bowState.coating==='PIERCE'?'・各矢最大Hit':'')+'、連撃5Hit維持。最大側：怒り・克服・傷口・満タン・巧撃の条件成立時。正式DPSとは別）';
}
document.addEventListener('DOMContentLoaded',()=>{
 for(const id of ['powerBowCoating','powerBowRange','powerBowStartShot','powerGutsState','dHZ','dEHZ','monster','monsterPart'])for(const event of ['input','change'])$(id)?.addEventListener(event,renderBowAdoptedPowerSummary);
 renderBowAdoptedPowerSummary();
});

function bowDeclarationElement(st,monsterState){
 if(!['NORMAL','ENRAGED'].includes(monsterState))throw Error('DECLARATION_MONSTER_STATE_UNKNOWN');
 if(equipmentElementPendingReason(st))throw Error(equipmentElementPendingReason(st));
 const c=st.elementComponents;if(!c||!['weaponBase','normalMultiplier','normalFlat'].every(k=>typeof c[k]==='number'&&Number.isFinite(c[k]))||Math.abs(c.weaponBase*c.normalMultiplier+c.normalFlat-st.element)>1e-6)throw Error('DECLARATION_ELEMENT_COMPONENTS_UNKNOWN');
 const effect=(st.activeBonusEffects||[]).find(e=>MHSeriesGroupIdentity.resolveEffect(e).parent?.id===178);
 if(!effect)return {...st,elementComponents:{...c}};
 const id=MHSeriesGroupIdentity.resolveEffect(effect);if(id.status!=='IDENTIFIED'||id.rank.id!==441||id.parent.kind!=='set')throw Error('DECLARATION_RANK_UNSUPPORTED');
 const active=monsterState==='ENRAGED',basis={...c,normalMultiplier:c.normalMultiplier*(active?BOW_DECLARATION_I_SOURCE.multiplier:1),normalFlat:c.normalFlat+(active?BOW_DECLARATION_I_SOURCE.flat:0)};
 return {...st,element:basis.weaponBase*basis.normalMultiplier+basis.normalFlat,elementComponents:basis};
}

function bowAdoptedScenarioResult(scenario,conditions,inputs){
 const reasons=[],pending=()=>({schemaVersion:1,channel:'NORMAL',scope:'BOW_ADOPTED_FIXED_THREE_SHOTS_V1',status:'NOT_EVALUATED',evaluationStatus:'NOT_EVALUATED',value:null,damage:null,physical:null,element:null,dps:null,completeness:'UNAVAILABLE',verification:'UNRESOLVED',baseline100Eligible:false,reasons:[...new Set(reasons)]});
 try{
  if(scenario?.schemaVersion!==1||scenario.confirmed!==true)throw Error('BOW_SCENARIO_UNCONFIRMED');
  for(const [k,values]of Object.entries(BOW_SCENARIO_FIELDS))if(!values.includes(scenario[k]))reasons.push('BOW_STATE_UNKNOWN:'+k);
  if(reasons.length)return pending();
  if(!$('monster')?.value||!$('monsterPart')?.value)throw Error('BOW_TARGET_UNCONFIRMED');
  const st=inputs?.stats||calcState.stats,total=inputs?.total||calcState.total||{};if(canonicalWeaponKind(selectedWeapon())!=='bow')throw Error('BOW_WEAPON_REQUIRED');
  if(st.attackKnown===false||st.affinityKnown===false)throw Error(st.attackKnown===false?'WEAPON_ATTACK_MISSING':'WEAPON_AFFINITY_MISSING');
  const active=st.activeBonusEffects||[],allowed=new Map([[106,[267]],[178,[441]],[26,[60,61]],[131,[344]]]),seen=new Set();
  for(const e of active){const x=MHSeriesGroupIdentity.resolveEffect(e);if(x.status!=='IDENTIFIED'||!allowed.get(x.parent.id)?.includes(x.rank.id)||seen.has(x.parent.id))throw Error('BOW_BONUS_IDENTITY_OR_SCOPE_UNSUPPORTED');seen.add(x.parent.id);}
  // These IDs cover the adopted bow3 build. Unknown damage/utility skills never
  // acquire a guessed applicability through their display name.
  const ordinary=new Set([3,14,18,22,24,38,41,57,58,63,95,100,120,137,144,147,154]),skills=[];
  for(const [name,level]of Object.entries(total)){if(active.some(e=>e.name===name))continue;const skill=DB.skills.find(s=>s.name===name),rank=skill?.ranks?.find(r=>r.level===level);if(!skill||!ordinary.has(skill.id)||!rank)throw Error('BOW_SKILL_SCOPE_UNSUPPORTED:'+name);skills.push({skillId:skill.id,rankId:rank.id,level,name});}
  const row=id=>skills.find(x=>x.skillId===id),text=id=>{const x=row(id);return x?DB.skills.find(s=>s.id===id).ranks.find(r=>r.id===x.rankId).description.normalize('NFKC').replace(/\s/g,''):'';};
  const numbers=(id,pattern)=>{if(!row(id))return [];const values=[...text(id).matchAll(pattern)].map(m=>Number(m[1]));if(!values.length)throw Error('BOW_SKILL_PARAMETER_UNCONFIRMED:'+id);return values;};
  const attackAdd=id=>row(id)?numbers(id,/基礎攻撃力\+(\d+)/g)[0]:0,affinityAdd=id=>row(id)?numbers(id,/会心率\+(\d+)%/g)[0]:0;
  const enraged=scenario.monsterState==='ENRAGED',overcome=scenario.frenzy==='OVERCOME';
  const target=selectableMonsters().find(m=>String(m.id)===$('monster').value);if(!target)throw Error('BOW_TARGET_UNCONFIRMED');if(enraged&&target.kind!=='large')throw Error('BOW_RAGE_REQUIRES_LARGE_MONSTER');
  let affinity=bowAdoptedBaseAffinity(st)+(enraged?affinityAdd(144):0);
  if(scenario.weakness!=='NONE'&&row(57)){const values=numbers(57,/会心率\+(\d+)%/g);if(values.length!==2)throw Error('BOW_WEAKNESS_PARAMETERS_UNCONFIRMED');affinity+=values[0]+(scenario.weakness==='WOUNDED'?values[1]:0);}
  if(overcome){if(!seen.has(106))throw Error('BOW_FRENZY_SOURCE_UNCONFIRMED');affinity+=bowAdoptedFrenzyBonus(total);}
  const uncappedAffinity=affinity;affinity=Math.min(100,Math.max(-100,affinity));
  const c=st.attackComponents;if(!c||!['weaponBase','normalMultiplier','normalFlat'].every(k=>typeof c[k]==='number'&&Number.isFinite(c[k]))||Math.abs(c.weaponBase*c.normalMultiplier+c.normalFlat-st.attackTrue)>1e-6)throw Error('BOW_ATTACK_COMPONENTS_UNKNOWN');
  const burst=STANDARD_BURST_SOURCE.groups.find(g=>g.kinds.includes('bow')),lv=row(95)?.level||0;if(!burst||!Object.hasOwn(burst.attack,lv)||!Object.hasOwn(burst.element,lv))throw Error('BOW_BURST_PARAMETERS_UNKNOWN');
  const guts=seen.has(131)&&scenario.guts==='BEFORE'?STANDARD_GROUP_POWER_RULES['根性【果敢】'].attackMultiplier:1;
  const attack=c.weaponBase*c.normalMultiplier*guts+c.normalFlat+(enraged?attackAdd(144):0)+(scenario.health==='FULL'?attackAdd(154):0)+(scenario.rush==='ACTIVE'?attackAdd(120):0)+burst.attack[lv];
  const declared=bowDeclarationElement(st,scenario.monsterState),element=declared.element+burst.element[lv],basis={...declared.elementComponents,conditionalFlat:burst.element[lv]};
  const stored=scenario.calculationConditions;if(stored){const mismatch=[];for(const k of ['hz','ehz'])if(Number(stored[k])!==Number(conditions[k]))mismatch.push(k);for(const k of ['chargeLevel','coating','range','startShot'])if(stored.bowState?.[k]!==conditions.bowState?.[k])mismatch.push('bowState.'+k);if(stored.monsterId!==$('monster').value)mismatch.push('monsterId');if(stored.partId!==$('monsterPart').value)mismatch.push('partId');if(mismatch.length)throw Error('BOW_SAVED_CONDITIONS_MISMATCH:'+mismatch.join(','));}
  const hz=Number(conditions.hz),ehz=Number(conditions.ehz);if(conditions.hz==null||conditions.hz===''||conditions.ehz==null||conditions.ehz===''||![hz,ehz].every(v=>Number.isFinite(v)&&v>=0&&v<=100))throw Error('BOW_HITZONES_UNCONFIRMED');
  const plan=bowComparisonStatePlan(conditions.bowState);if(plan.status!=='REFERENCE_READY')throw Error('BOW_SHOT_STATE_UNCONFIRMED');
  const cb=row(22)?.level||0;if(!Number.isInteger(cb)||cb<0||cb>5)throw Error('BOW_CRITICAL_BOOST_UNSUPPORTED');
  const result=window.BowReference.standard({attack,element,affinity,criticalMultiplier:criticalMultiplierForState(100,cb,'critical'),physicalHitzone:hz,elementalHitzone:ehz,skills:bowReferenceSkills(total),elementBasis:basis,bladescaleLoadingActive:false,state:plan.state},window.TechniqueDBEngine,BOW_STANDARD_PROFILE.sequence);
  const signature=JSON.stringify(buildSnapshotComparable(buildSnapshot())),receipt={equipment:{signature,weaponId:selectedWeapon().id},scenario:JSON.parse(JSON.stringify(scenario)),conditions:{hz,ehz,bowState:{...plan.state}},attack,affinity,uncappedAffinity,element,elementBasis:basis,skills,sourceGameVersion:null};
  return {...pending(),status:'EVALUATED',evaluationStatus:'EVALUATED',value:result.comparisonPower,damage:result.comparisonPower,physical:result.physical,element:result.element,special:null,completeness:'COMPLETE',verification:'PROVISIONAL',modelVerification:'ENGINE_REGRESSION_TESTED',liveGameVerification:'PENDING',reasons:['TARGET_GAME_DAMAGE_VALIDATION_PENDING','BOW_TIMING_UNCONFIRMED'],inputReceipt:receipt,trace:result.trace,excludedEffects:skills.filter(x=>x.skillId===38).map(x=>({...x,reason:'OWNER_EXCLUDED_ADDITIONAL_DAMAGE'})),sourceRefs:[BOW_DECLARATION_I_SOURCE.sourceUrl,BOW_DECLARATION_I_SOURCE.orderEvidence,STANDARD_BURST_SOURCE.url,'OWNER_FRENZY_OVERCOME_20261016'],modelRevision:'BOW_ADOPTED_SCENARIO_V1'};
 }catch(e){reasons.push(String(e.message||e));return pending();}
}

function bowAdoptedStandardPower(st,cond,total){
 const effects=st.activeBonusEffects||[],has=id=>effects.some(e=>MHSeriesGroupIdentity.resolveEffect(e).parent?.id===id);
 const common={schemaVersion:1,confirmed:true,burst:'MAINTAINED_FIVE_HITS',guts:cond.gutsState??'BEFORE'};
 const normalState={...common,monsterState:'NORMAL',frenzy:'NONE',weakness:'NONE',health:'NOT_FULL',rush:'INACTIVE'};
 const maxState={...common,monsterState:'ENRAGED',frenzy:has(106)?'OVERCOME':'NONE',weakness:skillLevel(total,['弱点特効','Weakness Exploit'])?'WOUNDED':'NONE',health:'FULL',rush:'ACTIVE'};
 const evaluate=state=>bowAdoptedScenarioResult(state,cond,{stats:st,total});
 const n=evaluate(normalState),m=evaluate(maxState),pack=x=>x.value===null?null:{comparisonPower:x.value,physical:x.physical,element:x.element,special:0,trace:x.trace,scope:x.scope,inputReceipt:x.inputReceipt,verification:x.verification};
 return {status:n.value===null?'PENDING':m.value===null?'MAXIMUM_PENDING':'REFERENCE_ONLY',profileId:BOW_STANDARD_PROFILE.id,normal:pack(n),maximum:pack(m),reason:n.value===null?n.reasons.join(' / '):null,maximumReason:m.value===null?m.reasons.join(' / '):null,normalScope:'BOW_ADOPTED_STANDARD_NORMAL',maximumScope:'BOW_ADOPTED_COMPATIBLE_STATE_SNAPSHOT',scenarioEvidence:{normal:normalState,maximum:maxState,conditions:'連撃5Hit強化維持。最大側は怒り・克服・傷口・体力満タン・巧撃の同時成立snapshot。現在の発動状態ではない。'},liveGameVerification:'PENDING'};
}
