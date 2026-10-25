(function(root){'use strict';
 function fail(reason){return {status:'UNAVAILABLE',reason};}
 function normalizeTechniqueIds(ids,{fallback=null}={}){
  const input=Array.isArray(ids)?ids:(fallback?[fallback]:[]),unresolved=[];
  const normalized=input.map(raw=>{
   if(raw===null||raw===undefined||String(raw).trim()==='')return null;
   const value=String(raw),id=value==='hm_side'?'HAM_SIDE_SWING':value.startsWith('canonical:')?value.slice('canonical:'.length):value;
   if(!id)unresolved.push(value);
   return id||null;
  }).filter(Boolean);
  return {ids:normalized,unresolved};
 }
 function evaluateCurrent({weapon,stats,target,skills=[],techniqueDb,trainingRoom,techniqueId,techniqueIds,retrievedAt='UNKNOWN'}={}){
  if(typeof root.damageFromParams!=='function'||!root.MHWWeaponMaxSharpness||typeof root.HimmelRealOneHitPipeline!=='function')return fail('REAL_SLICE:BROWSER_DEPENDENCIES_UNAVAILABLE');
  if(!weapon||!Number.isInteger(weapon.id)||!Number.isInteger(weapon.gameId)||typeof weapon.kind!=='string'||weapon.kind==='charge-blade')return fail('REAL_SLICE:CURRENT_WEAPON_NOT_SUPPORTED');
  if(!Array.isArray(weapon.specials))return fail('REAL_SLICE:WEAPON_SPECIALS_UNKNOWN');
  const elementSpecials=weapon.specials.filter(x=>x?.kind==='element');
  if(weapon.specials.some(x=>x?.kind!=='element'))return fail('REAL_SLICE:WEAPON_SPECIALS_UNSUPPORTED');
  if(elementSpecials.length>1)return fail('REAL_SLICE:MULTIPLE_ELEMENTS_UNSUPPORTED');
  if(!Array.isArray(weapon.skills))return fail('REAL_SLICE:WEAPON_SKILLS_UNKNOWN');
  const skillSource=`https://wilds.mhdb.io/en/weapons/${weapon.id}`;
  const classifySkill=(entry,source)=>{
   const name=entry?.skill?.name||entry?.name;
   const level=Number(entry?.level);
   if(!name||!Number.isFinite(level)||level<0)return {id:String(entry?.id||'unknown'),name:name||'UNKNOWN',level:Number.isFinite(level)?level:0,rank:0,source,effectDisposition:'unknown'};
   const skillId=entry?.skill?.id??entry?.id??null,description=entry?.description||entry?.skill?.description||null;
   const skillKey=(name==='Slugger'||name==='KO術'||name==='ＫＯ術')?'slugger':(name==='Attack Boost'||name==='攻撃')?'attack':(name==='Critical Eye'||name==='見切り')?'affinity':(name==='Critical Boost'||name==='超会心')?'criticalBoost':({'火属性攻撃強化':'fire','Fire Attack':'fire','水属性攻撃強化':'water','Water Attack':'water','雷属性攻撃強化':'thunder','Thunder Attack':'thunder','氷属性攻撃強化':'ice','Ice Attack':'ice','龍属性攻撃強化':'dragon','Dragon Attack':'dragon'}[name]||'unknown');
   return {id:String(entry?.id||entry?.skill?.id||name),name,level,rank:0,source,skillId,description,skillKey};
  };
  const rawSkills=weapon.skills.map(x=>classifySkill(x,skillSource));
  const canonicalSlugger=rawSkills.find(x=>x.skillKey==='slugger'&&String(x.skillId)==='36'&&Number.isInteger(x.level)&&x.level===1);
  const buildSkills=Array.isArray(skills)?skills.map(([name,level])=>{const ui=classifySkill({name,level},'index.html:calcBuild');return ui.skillKey==='slugger'&&canonicalSlugger?{...canonicalSlugger,level:ui.level,source:`${canonicalSlugger.source};index.html:calcBuild`}:ui;}):[];
  const allSkills=[...rawSkills,...buildSkills.filter(x=>!rawSkills.some(y=>String(y.skillId)===String(x.skillId)&&y.level===x.level))];
  if(target?.monster!=='training-room'||target?.part!=='training-front')return fail('REAL_SLICE:TRAINING_ROOM_FRONT_REQUIRED');
  const normalized=normalizeTechniqueIds(Array.isArray(techniqueIds)?techniqueIds:null,{fallback:techniqueId});
  const resolvedTechniqueIds=normalized.ids;
  if(normalized.unresolved.length)return fail('REAL_SLICE:TECHNIQUE_ID_UNRESOLVED:'+normalized.unresolved.join(','));
  if(!resolvedTechniqueIds.length)return fail('REAL_SLICE:TECHNIQUE_NOT_SELECTED');
  const techniques={};
  for(const id of [...new Set(resolvedTechniqueIds)]){
   const technique=techniqueDb?.get?.(weapon.kind,id);
   if(!technique||!Array.isArray(technique.hits)||!technique.hits.length)return fail('REAL_SLICE:TECHNIQUE_NOT_FOUND:'+id);
   techniques[id]=technique;
  }
  techniqueId=resolvedTechniqueIds[0];
  const technique=techniques[techniqueId];
  const part=trainingRoom?.parts?.find(x=>x.id==='training-front');
  const physicalKeyForTechnique=id=>{const hits=techniques[id]?.hits||[],keys=hits.map(hit=>{const kind=hit?.damageType;return kind==='blunt'||kind==='slash'||kind==='pierce'?kind:['hammer','hunting-horn'].includes(weapon.kind)?'blunt':null;});return keys.length&&keys.every(Boolean)&&new Set(keys).size===1?keys[0]:null;};
  const physicalKeys=resolvedTechniqueIds.map(physicalKeyForTechnique);
  if(physicalKeys.some(x=>!x))return fail('REAL_SLICE:DAMAGE_TYPE_UNRESOLVED');
  if(new Set(physicalKeys).size>1)return fail('REAL_SLICE:MIXED_DAMAGE_TYPES_UNSUPPORTED');
  const physicalKey=physicalKeys[0];
  if(!physicalKey)return fail('REAL_SLICE:DAMAGE_TYPE_UNRESOLVED');
  if(!part||!Number.isFinite(part.multipliers?.[physicalKey]))return fail('REAL_SLICE:TRAINING_HITZONE_UNRESOLVED');
  const maxSharpness=[...root.MHWWeaponMaxSharpness.colors].reverse().find(color=>Number(weapon.sharpness?.[color])>0);
  if(!maxSharpness)return fail('REAL_SLICE:SHARPNESS_UNRESOLVED');
  if(!weapon.damage||!Number.isFinite(weapon.damage.raw)||!Number.isFinite(weapon.affinity))return fail('REAL_SLICE:MHDB_BASE_STATS_UNKNOWN');
  const attackEntries=allSkills.filter(x=>x.skillKey==='attack');
  if(attackEntries.some(x=>!Number.isInteger(x.level)||x.level<1||x.level>5))return fail('REAL_SLICE:ATTACK_SKILL_LEVEL_UNSUPPORTED');
  const attackLevel=attackEntries.length?Math.max(...attackEntries.map(x=>x.level)):0;
  if(attackLevel&&!root.MHWAttackSkillResolver)return fail('REAL_SLICE:ATTACK_RULE_UNAVAILABLE');
  const attackRule=root.MHWAttackSkillResolver?root.MHWAttackSkillResolver({攻撃:attackLevel}):{flat:0,mult:1};
  const attackFlat=Number(attackRule.flat),attackMult=Number(attackRule.mult);
  if(!Number.isFinite(attackFlat)||!Number.isFinite(attackMult))return fail('REAL_SLICE:ATTACK_RULE_INVALID');
  const expectedAttack=weapon.damage.raw*attackMult+attackFlat;
  const affinityEntries=allSkills.filter(x=>x.skillKey==='affinity');
  if(affinityEntries.some(x=>!Number.isInteger(x.level)||x.level<1||x.level>5))return fail('REAL_SLICE:AFFINITY_SKILL_LEVEL_UNSUPPORTED');
  const affinityLevel=affinityEntries.length?Math.max(...affinityEntries.map(x=>x.level)):0;
  if(affinityLevel&&!root.MHWAffinitySkillResolver)return fail('REAL_SLICE:AFFINITY_RULE_UNAVAILABLE');
  const affinityBonus=affinityLevel?Number(root.MHWAffinitySkillResolver({'見切り':affinityLevel})):0;
  if(!Number.isFinite(affinityBonus))return fail('REAL_SLICE:AFFINITY_RULE_INVALID');
  const criticalBoostEntries=allSkills.filter(x=>x.skillKey==='criticalBoost'),criticalBoostLevel=criticalBoostEntries.length?Math.max(...criticalBoostEntries.map(x=>x.level)):0;
  if(criticalBoostEntries.some(x=>!Number.isInteger(x.level)||x.level<1||x.level>5))return fail('REAL_SLICE:CRITICAL_BOOST_LEVEL_UNSUPPORTED');
  const elementSpecial=elementSpecials[0], elementType=elementSpecial?.element||'none', elementRawValue=elementSpecial?.damage?.display??0;
  const elementEntries=allSkills.filter(x=>x.skillKey===elementType),elementSkillNames={fire:'火属性攻撃強化',water:'水属性攻撃強化',thunder:'雷属性攻撃強化',ice:'氷属性攻撃強化',dragon:'龍属性攻撃強化'},elementSkillName=elementSkillNames[elementType],elementLevel=Math.max(...elementEntries.map(x=>x.level),0),elementRule=root.MHWElementSkillResolver&&elementSpecial?root.MHWElementSkillResolver({[elementSkillName]:elementLevel}):{add:0,mult:1},elementValue=elementSpecial?elementRawValue*(elementRule?.mult??1)+(elementRule?.add??0):0;
  if(elementSpecial && (!Number.isFinite(elementRawValue)||elementRawValue<0||!elementRule||stats.element!==elementValue||stats.elementType!==elementType))return fail('REAL_SLICE:CALCULATED_ELEMENT_NOT_PROVEN');
  if(!elementSpecial && (!([0,null].includes(stats.element))||stats.elementType&&!['none',''].includes(String(stats.elementType))))return fail('REAL_SLICE:ELEMENT_NOT_ZERO_OR_UNKNOWN');
  const versions={game:'1.042.00.02',equipment:'mhdb-source-unknown-game-version',technique:'tech-real',effects:'effects-real'};
  const provenance={sourceUrl:`https://wilds.mhdb.io/en/weapons/${weapon.id}`,sourceGameVersion:'UNKNOWN',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',targetGameVersion:versions.game,retrievedAt,apiVersion:'UNKNOWN'};
  const equipment={...weapon,apiId:weapon.id,maxSharpness,maxSharpnessEvidenceRef:provenance.sourceUrl,elementType,criticalBoostLevel,elementCalculatedValue:elementValue,elementEvidence:elementSpecial?{sourceUrl:provenance.sourceUrl,raw:elementSpecial.damage.raw,display:elementRawValue,kind:'element'}:{sourceUrl:provenance.sourceUrl,confirmedNone:true},provenance};
  const source={capture:pinned=>({versions:pinned,equipment,effects:{},techniques})};
  const pipeline=root.HimmelRealOneHitPipeline({versions,source,techniqueId,techniqueIds:resolvedTechniqueIds,weaponType:weapon.kind,
   resolveBuild:(_raw,snapshot)=>({weaponType:weapon.kind,dbVersion:versions.equipment,source:'MHDB_API_CURRENT_SELECTION',equipment:{...snapshot,ids:[`api_id:${snapshot.apiId}`,`game_id:${snapshot.gameId}`],trueAttack:{status:'known',value:snapshot.damage.raw},displayElement:{status:'known',value:snapshot.elementEvidence.confirmedNone?0:snapshot.elementCalculatedValue},baseAffinity:{status:'known',value:snapshot.affinity},elementType:snapshot.elementType,sourceGameVersion:snapshot.provenance.sourceGameVersion},skills:{entries:allSkills},issues:[{code:'MHDB_SOURCE',apiId:snapshot.apiId,gameId:snapshot.gameId,sourceEndpoint:snapshot.provenance.sourceUrl,apiVersion:snapshot.provenance.apiVersion,retrievedAt:snapshot.provenance.retrievedAt,sourceGameVersion:snapshot.provenance.sourceGameVersion}]}),
   resolveEffects:(build,_conditions)=>{const entries=build.skills.entries||[],effects=[],attack=entries.filter(x=>x.skillKey==='attack'),affinity=entries.filter(x=>x.skillKey==='affinity'),criticalBoost=entries.filter(x=>x.skillKey==='criticalBoost'),elementEntries=entries.filter(x=>['fire','water','thunder','ice','dragon'].includes(x.skillKey));if(attack.length){if(!root.MHWAttackSkillResolver)throw Error('REAL_SLICE:ATTACK_RULE_UNAVAILABLE');const level=Math.max(...attack.map(x=>x.level)),rule=root.MHWAttackSkillResolver({攻撃:level});if(!Number.isFinite(Number(rule.flat))||!Number.isFinite(Number(rule.mult)))throw Error('REAL_SLICE:ATTACK_RULE_INVALID');effects.push({id:'attack-boost-multiply',target:'physical',stage:'attack',unit:'dimensionless',amount:Number(rule.mult),operation:'multiply',order:10,source:'index.html:calcAttackSkill',condition:{type:'always'}},{id:'attack-boost-flat',target:'physical',stage:'attack',unit:'true-attack',amount:Number(rule.flat),operation:'add',order:20,source:'index.html:calcAttackSkill',condition:{type:'always'}});}if(affinity.length){if(!root.MHWAffinitySkillResolver)throw Error('REAL_SLICE:AFFINITY_RULE_UNAVAILABLE');const level=Math.max(...affinity.map(x=>x.level)),amount=Number(root.MHWAffinitySkillResolver({'見切り':level}));if(!Number.isFinite(amount))throw Error('REAL_SLICE:AFFINITY_RULE_INVALID');if(amount)effects.push({id:'critical-eye-affinity',target:'physical',stage:'affinity',unit:'percent',amount,operation:'add',order:30,source:'index.html:calcAffinityBonus',condition:{type:'always'}});}if(criticalBoost.length){const level=Math.max(...criticalBoost.map(x=>x.level));if(!Number.isInteger(level)||level<1||level>5)throw Error('REAL_SLICE:CRITICAL_BOOST_LEVEL_UNSUPPORTED');}if(elementEntries.length){if(!root.MHWElementSkillResolver)throw Error('REAL_SLICE:ELEMENT_RULE_UNAVAILABLE');const level=Math.max(...elementEntries.map(x=>x.level)),type=elementEntries[0].skillKey,labels={fire:'火属性攻撃強化',water:'水属性攻撃強化',thunder:'雷属性攻撃強化',ice:'氷属性攻撃強化',dragon:'龍属性攻撃強化'},rule=root.MHWElementSkillResolver({[labels[type]]:level});if(!rule||!Number.isFinite(Number(rule.add))||!Number.isFinite(Number(rule.mult)))throw Error('REAL_SLICE:ELEMENT_RULE_INVALID');if(rule.add)effects.push({id:type+'-element-add',target:'element',stage:'element',unit:'display-element',amount:Number(rule.add),operation:'add',order:40,source:'index.html:calcElementSkill',condition:{type:'always'}});if(rule.mult!==1)effects.push({id:type+'-element-multiply',target:'element',stage:'element',unit:'dimensionless',amount:Number(rule.mult),operation:'multiply',order:50,source:'index.html:calcElementSkill',condition:{type:'always'}});}return effects;},resolveSkillApplicability:entries=>entries.map(entry=>{if(entry.skillKey==='slugger'&&String(entry.skillId)==='36'&&Number.isInteger(entry.level)&&entry.level===1)return {...entry,effectDisposition:'non_damage',reason:'stun accumulation only; no HP-damage modifier',evidenceRef:`MHDB skill.id=36;level=1;${entry.source}`};if(entry.skillKey==='attack'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'HP attack effect is resolved by the shared L3 effect list',evidenceRef:'index.html:calcAttackSkill'};if(entry.skillKey==='affinity'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'critical-eye affinity is resolved by the shared L3 effect list',evidenceRef:'index.html:calcAffinityBonus'};if(entry.skillKey==='criticalBoost'&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=5)return {...entry,effectDisposition:'resolved',reason:'critical multiplier is supplied to the canonical Formula',evidenceRef:'index.html:criticalMultiplierForState'};if(['fire','water','thunder','ice','dragon'].includes(entry.skillKey)&&Number.isInteger(entry.level)&&entry.level>=1&&entry.level<=3)return {...entry,effectDisposition:'resolved',reason:'element value is resolved by the shared L3 effect list',evidenceRef:'index.html:calcElementSkill'};throw Error('REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:'+entry.name);}),initialState:()=>({}),
   canonicalPhysical:{expectedGameVersion:versions.game,
    resolveSharpness:({build})=>{const r=root.MHWWeaponMaxSharpness.resolve(build.equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});if(!r.options)throw Error('REAL_SLICE:SHARPNESS_UNRESOLVED');return {value:r.options.sharpnessPhysicalMultiplier,gameVersion:versions.game,evidenceRef:r.options.sharpnessEvidenceRef,sourceGameVersion:build.equipment.provenance.sourceGameVersion,status:'PROVISIONAL'};},
    resolveElementSharpness:({build})=>{const r=root.MHWWeaponMaxSharpness.resolve(build.equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});if(!r.options)throw Error('REAL_SLICE:ELEMENT_SHARPNESS_UNRESOLVED');return {value:r.options.sharpnessElementMultiplier,gameVersion:versions.game,evidenceRef:r.options.sharpnessEvidenceRef,sourceGameVersion:build.equipment.provenance.sourceGameVersion,status:'PROVISIONAL'};},
    resolveHitzone:({parameters}={})=>{const key=parameters?.damageType||physicalKey,value=part.multipliers?.[key];if(typeof value!=='number'||!Number.isFinite(value))throw Error('REAL_SLICE:TRAINING_HITZONE_UNRESOLVED:'+key);return {value:value*100,gameVersion:versions.game,evidenceRef:`index.html:trainingRoomMonster:training-front:${key}`,sourceGameVersion:provenance.sourceGameVersion,status:'PRODUCT_REFERENCE'};},
    resolveElementHitzone:()=>{if(!elementSpecial)return {value:0,gameVersion:versions.game,evidenceRef:`index.html:trainingRoomMonster:training-front:none`,sourceGameVersion:provenance.sourceGameVersion,status:'PRODUCT_REFERENCE'};const value=part.multipliers?.[elementType];if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)throw Error('REAL_SLICE:ELEMENT_HITZONE_UNRESOLVED');return {value:value*100,gameVersion:versions.game,evidenceRef:`index.html:trainingRoomMonster:training-front:${elementType}`,sourceGameVersion:provenance.sourceGameVersion,status:'PRODUCT_REFERENCE'};},
    resolvePartModifier:({parameters})=>({value:parameters.partModifier,gameVersion:versions.game,evidenceRef:parameters.partModifierSource}),
    calculate:root.damageFromParams}});
  try{return pipeline.evaluate({schemaVersion:'v10-min2',build:{weapon:'current-selection'},target:{id:'training-room',hitZoneKey:'training-front'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'current-selection-hammer-combo',techniqueIds:resolvedTechniqueIds}});}catch(e){return fail(e?.message||'REAL_SLICE:EVALUATION_FAILED');}
 }
 root.MHWRealOneHitBrowserAdapter=Object.freeze({evaluateCurrent,normalizeTechniqueIds});
})(typeof window!=='undefined'?window:globalThis);
