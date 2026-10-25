(function(root){'use strict';
 function fail(reason){return {status:'UNAVAILABLE',reason};}
 function evaluateCurrent({weapon,stats,target,skills=[],techniqueDb,trainingRoom,retrievedAt='UNKNOWN'}={}){
  if(typeof root.damageFromParams!=='function'||!root.MHWWeaponMaxSharpness||typeof root.HimmelRealOneHitPipeline!=='function')return fail('REAL_SLICE:BROWSER_DEPENDENCIES_UNAVAILABLE');
  if(!weapon||weapon.id!==387||weapon.gameId!==1||weapon.kind!=='hammer'||weapon.name!=='Hope Hammer I')return fail('REAL_SLICE:CURRENT_WEAPON_NOT_SUPPORTED');
  if(!stats||stats.element!==0||stats.elementType||stats.elementKnown===false)return fail('REAL_SLICE:ELEMENT_NOT_ZERO_OR_UNKNOWN');
  if(Array.isArray(weapon.specials)&&weapon.specials.length)return fail('REAL_SLICE:WEAPON_SPECIALS_UNSUPPORTED');
  if(Array.isArray(weapon.skills)&&weapon.skills.length)return fail('REAL_SLICE:WEAPON_SKILLS_UNSUPPORTED');
  if(Array.isArray(skills)&&skills.length)return fail('REAL_SLICE:BUILD_SKILLS_UNSUPPORTED');
  if(target?.monster!=='training-room'||target?.part!=='training-front')return fail('REAL_SLICE:TRAINING_ROOM_FRONT_REQUIRED');
  const technique=techniqueDb?.get?.('hammer','HAM_SIDE_SWING');
  if(!technique||!Array.isArray(technique.hits)||technique.hits.length!==1)return fail('REAL_SLICE:TECHNIQUE_NOT_FOUND');
  const part=trainingRoom?.parts?.find(x=>x.id==='training-front');
  if(!part||!Number.isFinite(part.multipliers?.blunt))return fail('REAL_SLICE:TRAINING_HITZONE_UNRESOLVED');
  const maxSharpness=[...root.MHWWeaponMaxSharpness.colors].reverse().find(color=>Number(weapon.sharpness?.[color])>0);
  if(!maxSharpness)return fail('REAL_SLICE:SHARPNESS_UNRESOLVED');
  const versions={game:'1.042.00.02',equipment:'mhdb-source-unknown-game-version',technique:'tech-real',effects:'effects-real'};
  const provenance={sourceUrl:`https://wilds.mhdb.io/en/weapons/${weapon.id}`,sourceGameVersion:'UNKNOWN',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',targetGameVersion:versions.game,retrievedAt,apiVersion:'UNKNOWN'};
  const equipment={...weapon,apiId:weapon.id,maxSharpness,maxSharpnessEvidenceRef:provenance.sourceUrl,provenance};
  const source={capture:pinned=>({versions:pinned,equipment,effects:{},techniques:{'HAM_SIDE_SWING':technique}})};
  const pipeline=root.HimmelRealOneHitPipeline({versions,source,
   resolveBuild:(_raw,snapshot)=>({weaponType:'hammer',dbVersion:versions.equipment,source:'MHDB_API_CURRENT_SELECTION',equipment:{...snapshot,ids:[`api_id:${snapshot.apiId}`,`game_id:${snapshot.gameId}`],trueAttack:{status:'known',value:stats.attackTrue},displayElement:{status:'known',value:0},baseAffinity:{status:'known',value:stats.affinity},sourceGameVersion:snapshot.provenance.sourceGameVersion},skills:{entries:[]},issues:[{code:'MHDB_SOURCE',apiId:snapshot.apiId,gameId:snapshot.gameId,sourceEndpoint:snapshot.provenance.sourceUrl,apiVersion:snapshot.provenance.apiVersion,retrievedAt:snapshot.provenance.retrievedAt,sourceGameVersion:snapshot.provenance.sourceGameVersion}]}),
   resolveEffects:()=>[],initialState:()=>({}),
   canonicalPhysical:{expectedGameVersion:versions.game,
    resolveSharpness:({build})=>{const r=root.MHWWeaponMaxSharpness.resolve(build.equipment,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});if(!r.options)throw Error('REAL_SLICE:SHARPNESS_UNRESOLVED');return {value:r.options.sharpnessPhysicalMultiplier,gameVersion:versions.game,evidenceRef:r.options.sharpnessEvidenceRef,sourceGameVersion:build.equipment.provenance.sourceGameVersion,status:'PROVISIONAL'};},
    resolveHitzone:()=>({value:part.multipliers.blunt*100,gameVersion:versions.game,evidenceRef:'index.html:trainingRoomMonster:training-front',sourceGameVersion:provenance.sourceGameVersion,status:'PRODUCT_REFERENCE'}),
    resolvePartModifier:({parameters})=>({value:parameters.partModifier,gameVersion:versions.game,evidenceRef:parameters.partModifierSource}),
    calculate:root.damageFromParams}});
  return pipeline.evaluate({schemaVersion:'v10-min2',build:{weapon:'current-selection'},target:{id:'training-room',hitZoneKey:'training-front'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'current-selection-hammer-one-hit',techniqueIds:['HAM_SIDE_SWING']}});
 }
 root.MHWRealOneHitBrowserAdapter=Object.freeze({evaluateCurrent});
})(typeof window!=='undefined'?window:globalThis);
