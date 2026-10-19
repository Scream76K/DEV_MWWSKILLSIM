// Existing MHDB identities and adopted coefficient producers remain authoritative.
// This adapter resolves individual effects; it never wraps a computed total as a skill.
function commonEffectRun(baseStats, rows, facts={}) {
 const grouped=new Map(),events=rows.filter(row=>row.environmentalEvent);
 for(const row of rows.filter(row=>!row.environmentalEvent)){
  const id=String(row.skillId),level=row.level??1;
  if(!row.skillId||!Number.isInteger(level)||level<1)throw Error('COMMON_EFFECT_SKILL_IDENTITY_REQUIRED');
  const entry=grouped.get(id)||{id,level,effects:[]};
  if(entry.level!==level)throw Error('COMMON_EFFECT_LEVEL_CONFLICT:'+id);
  entry.effects.push(row);grouped.set(id,entry);
 }
 const adapter={effectsFor(id,level){const entry=grouped.get(String(id));if(!entry||entry.level!==level)throw Error('COMMON_EFFECT_DB_MAPPING_MISSING:'+id);return entry.effects;}};
 const resolved=CommonDamageCore.resolveEffects([...grouped.values()].map(({id,level})=>({id,level})),adapter,{facts,baseStats});
 resolved.effects.push(...events);resolved.effects.sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
 const trace=[],stats=CommonDamageCore.applyEffects(baseStats,resolved.effects,'stats',facts,trace);
 return {stats,trace,effects:resolved.effects,excluded:resolved.excluded};
}
function commonSkillIdentity(name,level,total={}) {
 const skill=DB.skills.find(x=>x.name===name);
 if(!skill)throw Error('COMMON_SKILL_DB_IDENTITY_MISSING:'+name);
 const lv=level??skillLevel(total,[name]);
 const rank=skill.ranks?.find(r=>r.level===lv);
 if(!rank)throw Error('COMMON_SKILL_DB_RANK_MISSING:'+name+':'+lv);
 return {skillId:skill.id,level:lv,rankId:rank.id};
}
function commonEffect(identity,suffix,order,operations,when=true,source=null) {
 return {...identity,id:String(identity.skillId)+':'+suffix,phase:'stats',order,operations,when,source};
}
function commonBaseStats(stats,total) {
 const attack=calcAttackSkill(total),element=calcElementSkill(total,stats.elementType),affinity=calcAffinityBonus(total),rows=[];
 const add=(names,suffix,operations)=>{const skill=DB.skills.find(s=>names.includes(s.name)),level=skillLevel(total,names);if(level)rows.push(commonEffect(commonSkillIdentity(skill?.name,level),suffix,10,operations,true,'EXISTING_ALWAYS_ON_SKILL_PRODUCER'));};
 add(['攻撃','Attack Boost'],'always-attack',[{target:'attack',op:'multiply',value:attack.mult},{target:'attackFlat',op:'add',value:attack.flat}]);
 add(['見切り','Critical Eye'],'always-affinity',[{target:'affinity',op:'add',value:affinity}]);
 const names={fire:['火属性攻撃強化','Fire Attack'],water:['水属性攻撃強化','Water Attack'],thunder:['雷属性攻撃強化','Thunder Attack'],ice:['氷属性攻撃強化','Ice Attack'],dragon:['龍属性攻撃強化','Dragon Attack']}[stats.elementType];
 if(names&&stats.elementKnown)add(names,'always-element',[{target:'element',op:'multiply',value:element.mult},{target:'elementFlat',op:'add',value:element.add}]);
 const result=commonEffectRun({attack:stats.attack,attackFlat:0,affinity:stats.affinityKnown?stats.affinity:0,element:stats.elementKnown?stats.element:0,elementFlat:0},rows);
 return {...result,attackComponents:{weaponBase:stats.attack,normalMultiplier:attack.mult,normalFlat:attack.flat},elementComponents:{weaponBase:stats.element,normalMultiplier:element.mult,normalFlat:element.add}};
}

// The former calcMaxAffinity coefficient definitions live here once. Scenario
// facts select applicability; the display and damage producers consume this list.
function commonAffinityDefinitions(total,effects=[],monsterCanFrenzy=false) {
 const rows=[],add=(names,values,fact)=>{
  const level=skillLevel(total,names);if(!level)return;
  if(!Number.isInteger(level)||level<0||level>=values.length)throw Error('COMMON_AFFINITY_LEVEL_UNKNOWN:'+names[0]);
  const id=commonSkillIdentity(DB.skills.find(s=>names.includes(s.name))?.name,level);
  rows.push(commonEffect(id,'affinity-'+fact,40,[{target:'affinity',op:'add',value:values[level]}],{fact,equals:true},'EXISTING_CALC_MAX_AFFINITY'));
 };
 add(['弱点特効','Weakness Exploit'],[0,5,10,15,20,30],'weakness');
 add(['弱点特効','Weakness Exploit'],[0,3,5,10,15,20],'wounded');
 add(['挑戦者','Agitator'],[0,3,5,7,10,15],'enraged');
 add(['渾身','Maximum Might'],[0,10,20,30],'maximumMight');
 add(['力の解放','Latent Power'],[0,10,20,30,40,50],'latentPower');
 add(['攻勢','Foray'],[0,0,5,10,15,20],'foray');
 add(['抜刀術【技】','抜刀術[技]','Critical Draw'],[0,50,75,100],'criticalDraw');
 add(['濡れ刃紋','Wet Blade Mark'],[0,10,20,30],'wet');
 const gore=goreAffinitySource(effects);if(gore===null)throw Error('COMMON_FRENZY_SOURCE_UNKNOWN');
 if(gore||monsterCanFrenzy){
  // Frenzy recovery is an environmental reward, not a fabricated aggregate skill.
  // Series106 supplies its identity when equipped; otherwise this event is kept
  // separately from resolveEffects' skill namespace by the caller.
  const id={skillId:106,level:1};
  const reward=commonEffect(id,'frenzy-reward',40,[{target:'affinity',op:'add',value:15}],{fact:'overcome',equals:true},'OWNER_FRENZY_OVERCOME_20261016');
  if(!gore){delete reward.skillId;reward.id='environment:frenzy-reward';reward.environmentalEvent=true;}rows.push(reward);
  add(['無我の境地','Antivirus'],[0,3,6,10],'overcome');
 }
 const seen=new Set(),unique=effects.filter(e=>{if(MHSeriesGroupIdentity.resolveEffect(e).parent?.id!==106)return true;const key=JSON.stringify(e);if(seen.has(key))return false;seen.add(key);return true;});
 const series=MHSeriesGroupHpPolicy.activated(unique);
 if(series.some(x=>x.affinityException))rows.push(commonEffect({skillId:162,level:1},'affinity-exception',40,[{target:'affinity',op:'add',value:15}],{fact:'seriesAffinity',equals:true},'EXISTING_C02_AFFINITY_ONLY'));
 return rows;
}
function commonMaximumAffinityFacts(){return {weakness:true,wounded:true,enraged:true,maximumMight:true,latentPower:true,foray:true,criticalDraw:true,wet:true,overcome:true,seriesAffinity:true};}
function commonResolveAffinity(base,total,effects,monsterCanFrenzy,facts) {
 const result=commonEffectRun({affinity:base},commonAffinityDefinitions(total,effects,monsterCanFrenzy),facts);
 return {...result,uncappedAffinity:result.stats.affinity,affinity:Math.min(100,Math.max(-100,result.stats.affinity))};
}

function commonPowerScenario(kind,channel,st,total,cond={}) {
 const bow=kind==='bow'&&bowAdoptedRoute(st),maximum=channel==='MAXIMUM';
 const has=id=>(st.activeBonusEffects||[]).some(e=>MHSeriesGroupIdentity.resolveEffect(e).parent?.id===id);
 return {schemaVersion:1,confirmed:true,channel,guts:cond.gutsState??'BEFORE',
  monsterState:maximum?'ENRAGED':'NORMAL',frenzy:maximum&&has(106)?'OVERCOME':'NONE',
  weakness:maximum&&skillLevel(total,['弱点特効','Weakness Exploit'])?'WOUNDED':'NONE',
  health:maximum?'FULL':'NOT_FULL',rush:maximum?'ACTIVE':'INACTIVE',
  burst:bow||maximum?'MAINTAINED_FIVE_HITS':'INACTIVE',
  bindingRecovery:maximum?'ACTIVE':'INACTIVE',encouragement:maximum?'ACTIVE':'INACTIVE',
  statusAilment:maximum?'ACTIVE':'INACTIVE',convertElement:maximum?'ACTIVE':'INACTIVE',
  scope:bow?'ADOPTED_BOW_FIXED_SCENARIO':'EXISTING_GENERIC_MAXIMUM_SCENARIO'};
}
function commonScenarioFacts(kind,scenario,adoptedBow=false) {
 if(!['NORMAL','MAXIMUM'].includes(scenario.channel))throw Error('UNKNOWN_CONDITION:channel');
 const max=scenario.channel==='MAXIMUM',bow=adoptedBow||scenario.scope==='ADOPTED_BOW_FIXED_SCENARIO',facts={maximum:max,canGuard:['great-sword','sword-and-shield','lance','gunlance','charge-blade','heavy-bowgun'].includes(kind)};
 const known=(field,values,fn,key)=>{if(!values.includes(scenario[field]))throw Error('UNKNOWN_CONDITION:'+field);facts[key]=fn(scenario[field]);};
 known('monsterState',['NORMAL','ENRAGED'],x=>x==='ENRAGED','enraged');
 known('frenzy',['NONE','INFECTED','OVERCOME'],x=>x==='OVERCOME','overcome');facts.infected=scenario.frenzy==='INFECTED';
 known('weakness',['NONE','EFFECTIVE','WOUNDED'],x=>x!=='NONE','weakness');facts.wounded=scenario.weakness==='WOUNDED';
 for(const [field,key]of [['rush','rush'],['bindingRecovery','bindingRecovery'],['encouragement','encouragement'],['statusAilment','statusAilment'],['convertElement','convertElement']])known(field,['INACTIVE','ACTIVE'],x=>x==='ACTIVE',key);
 known('health',['FULL','NOT_FULL'],x=>x==='FULL','fullHealth');
 known('burst',['INACTIVE','MAINTAINED_FIVE_HITS'],x=>x==='MAINTAINED_FIVE_HITS','burst');
 for(const key of ['maximumMight','latentPower','foray','criticalDraw','wet','seriesAffinity'])facts[key]=max&&!bow;
 return facts;
}
function commonItemCondition(item) {
 if(item.skill==='攻めの守勢')return {all:[{fact:'canGuard',equals:true},{fact:'maximum',equals:true}]};
 const fields={'挑戦者':'enraged','フルチャージ':'fullHealth','巧撃':'rush','連撃':'burst','連撃強化Ⅰ':'burst','連撃強化Ⅱ':'burst','激励':'encouragement','死中に活':'statusAilment','属性変換':'convertElement'};
 if(item.parentId===106)return {fact:'overcome',equals:true};
 if(item.parentId===178)return {fact:'enraged',equals:true};
 if(item.parentId===62)return {all:[{fact:'maximum',equals:true},{fact:'bindingRecovery',equals:true}]};
 if(item.appliesToNormal)return true;
 return {fact:fields[item.skill]||'maximum',equals:true};
}
function commonApplyPowerResolution(st,total,kind,resolution,scenario,context={}) {
 const facts=commonScenarioFacts(kind,scenario,context.adoptedBow===true);if(kind!=='bow'&&facts.maximum&&context.monsterCanFrenzy===true)facts.overcome=true;const c=st.attackComponents,ec=st.elementComponents;
 const valid=x=>x&&['weaponBase','normalMultiplier','normalFlat'].every(k=>typeof x[k]==='number'&&Number.isFinite(x[k]));
 const attackValid=valid(c)&&Math.abs(c.weaponBase*c.normalMultiplier+c.normalFlat-Number(st.attackTrue??st.attack))<1e-6;
 const elementValid=valid(ec)&&Math.abs(ec.weaponBase*ec.normalMultiplier+ec.normalFlat-st.element)<1e-6;
 const base={attack:attackValid?c.weaponBase*c.normalMultiplier:Number(st.attackTrue??st.attack),attackFlat:attackValid?c.normalFlat:0,
  element:elementValid?ec.weaponBase*ec.normalMultiplier:Number(st.element||0),elementFlat:elementValid?ec.normalFlat:0,
  elementConditionalFlat:0,elementMultiplier:1,affinity:st.affinity};
 const rows=[];
 for(const [index,item]of resolution.applied.entries()){
  const original=(st.activeBonusEffects||[]).find(e=>e.name===item.skill);
  const identity=item.bonusSource?{skillId:item.parentId??original?.bonusSkillId,level:1,rankId:item.rankId??original?.rankId}:commonSkillIdentity(item.skill,item.level,total);
  const operations=[],when=commonItemCondition(item);
  if(item.inactiveReason)operations.push({target:'attack',op:'multiply',value:1});
  const multiplier=item.maximumAttackMultiplier??item.attackMultiplier;
  if(multiplier!=null&&multiplier!==1)operations.push({target:'attack',op:'multiply',value:multiplier});
  if(item.attackAdd)operations.push({target:'attackFlat',op:'add',value:item.attackAdd});
  if(item.elementMultiplier!=null&&['fire','water','thunder','ice','dragon'].includes(st.elementType)&&st.element>0){operations.push({target:'element',op:'multiply',value:item.elementMultiplier},{target:'elementMultiplier',op:'multiply',value:item.elementMultiplier});}
  if(item.elementAdd)operations.push({target:item.parentId===178?'elementFlat':'elementConditionalFlat',op:'add',value:item.elementAdd});
  if(operations.length)rows.push(commonEffect(identity,'conditional-'+index,20,operations,when,item));
  if(item.parentId===106&&item.infectedAttackAdd)rows.push(commonEffect(identity,'infected',21,[{target:'attackFlat',op:'add',value:item.infectedAttackAdd}],{fact:'infected',equals:true},item));
 }
 const affinityRows=st.conditionalAffinityEffects||commonAffinityDefinitions(total,st.activeBonusEffects||[],context.monsterCanFrenzy===true);
 // One skill may contribute both attack and affinity. Bonus ranks use level1 at
 // this boundary; exact rank remains attached and authenticated by the resolver.
 rows.push(...affinityRows);
 const out=commonEffectRun(base,rows,facts),v=out.stats,affinity=Math.min(100,Math.max(-100,v.affinity));
 const elementBasis=elementValid?{...ec,normalMultiplier:ec.normalMultiplier*v.elementMultiplier,normalFlat:v.elementFlat,conditionalFlat:v.elementConditionalFlat}:null;
 return {...out,scenario,facts,uncappedAffinity:v.affinity,elementBasis,stats:{...st,attackTrue:v.attack+v.attackFlat,element:v.element+v.elementFlat+v.elementConditionalFlat,affinity,maxAffinity:affinity,activeBonusEffects:[],resolvedBonusEffects:resolution.groupPlan.applied,commonEffects:{trace:out.trace,effects:out.effects,facts,scenario}},bonusPlan:commonBonusReceipt(resolution.groupPlan,facts)};
}
function standardPowerConditionPlan(st,total={},kind=null,cond={}) {
 const resolved=resolveStandardPowerEffects(st,total,kind,cond),context={monsterCanFrenzy:/ゴア|狂竜|狂化|黒蝕/.test(selectedMonsterName())};
 const normal=commonApplyPowerResolution(st,total,kind,resolved,commonPowerScenario(kind,'NORMAL',st,total,cond),context);
 const maximum=commonApplyPowerResolution(st,total,kind,resolved,commonPowerScenario(kind,'MAXIMUM',st,total,cond),context);
 return {...resolved,normal:normal.stats,maximum:maximum.stats,common:{normal,maximum},resolution:resolved};
}

function commonBonusReceipt(plan,facts){
 const applied=plan.applied.map(item=>{const active=CommonDamageCore.condition(commonItemCondition(item),facts);if(active===null)throw Error('UNKNOWN_CONDITION:'+item.skill);const attackAdd=item.parentId===106&&facts.infected?item.infectedAttackAdd:(active?item.attackAdd:0);return {...item,active:active||item.parentId===106&&facts.infected,attackAdd};});
 return {...plan,potentialAttackFlat:plan.maximumFlat,applied,attackFlat:applied.reduce((sum,item)=>sum+item.attackAdd,0)};
}
