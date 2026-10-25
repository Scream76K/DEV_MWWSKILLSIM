(function(root){'use strict';
 const SOURCE=Object.freeze({namespace:'github.com/LartTyler/mhdb-wilds-data',commit:'e5676f8d69f9e1c10922bbe5506ba77f6304a941',locator:'output/merged/weapons/Hammer.json#L2-L72',weaponKind:'hammer',gameId:1,sourceGameVersion:'UNKNOWN',attackRaw:90,affinity:0,element:0,maxSharpness:'green'});
 const sourceUrl='https://'+SOURCE.namespace+'/blob/'+SOURCE.commit+'/'+SOURCE.locator;
 function evaluateHopeHammerI(){
  if(typeof root.damageFromParams!=='function'||typeof root.trainingRoomMonster!=='function'||!root.TechniqueDBEngine||!root.MHWWeaponMaxSharpness||typeof root.HimmelRealOneHitPipeline!=='function')throw Error('REAL_SLICE:BROWSER_DEPENDENCIES_UNAVAILABLE');
  const technique=root.TechniqueDBEngine.get('hammer','HAM_SIDE_SWING');
  if(!technique||!Array.isArray(technique.hits)||technique.hits.length!==1)throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND');
  const training=root.trainingRoomMonster(),part=training.parts.find(x=>x.id==='training-front');
  if(!part||!Number.isFinite(part.multipliers?.blunt))throw Error('REAL_SLICE:TRAINING_HITZONE_UNRESOLVED');
  const versions={game:'1.042.00.02',equipment:'mhdb-source-unknown-game-version',technique:'tech-real',effects:'effects-real'};
  const source={capture:pinned=>({versions:pinned,equipment:SOURCE,effects:{},techniques:{'HAM_SIDE_SWING':technique}})};
  const pipeline=root.HimmelRealOneHitPipeline({versions,source,
   resolveBuild:()=>({weaponType:'hammer',dbVersion:versions.equipment,source:'LARTTYLER_MHDB_HOPE_HAMMER_I',equipment:{ids:['game_id:1'],trueAttack:{status:'known',value:SOURCE.attackRaw},displayElement:{status:'known',value:SOURCE.element},baseAffinity:{status:'known',value:SOURCE.affinity}},skills:{entries:[]}}),
   resolveEffects:()=>[],initialState:()=>({}),
   canonicalPhysical:{expectedGameVersion:versions.game,
    resolveSharpness:()=>{const sharp=root.MHWWeaponMaxSharpness.resolve({maxSharpness:SOURCE.maxSharpness,maxSharpnessEvidenceRef:'https://docs.wilds.mhdb.io/#sharpness'},{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});if(!sharp.options)throw Error('REAL_SLICE:SHARPNESS_UNRESOLVED');return {value:sharp.options.sharpnessPhysicalMultiplier,gameVersion:versions.game,evidenceRef:sharp.options.sharpnessEvidenceRef};},
    resolveHitzone:()=>({value:part.multipliers.blunt*100,gameVersion:versions.game,evidenceRef:'index.html:1207 trainingRoomMonster'}),
    resolvePartModifier:({parameters})=>({value:parameters.partModifier,gameVersion:versions.game,evidenceRef:parameters.partModifierSource}),
    calculate:root.damageFromParams}});
  return pipeline.evaluate({schemaVersion:'v10-min2',build:{weapon:'hope-hammer-i'},target:{id:'training-room',hitZoneKey:'training-front'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'hope-hammer-one-hit',techniqueIds:['HAM_SIDE_SWING']}});
 }
 root.MHWRealOneHitBrowserAdapter=Object.freeze({evaluateHopeHammerI});
})(typeof window!=='undefined'?window:globalThis);
