(function(root){'use strict';
 const SOURCE=Object.freeze({namespace:'github.com/LartTyler/mhdb-wilds-data',commit:'e5676f8d69f9e1c10922bbe5506ba77f6304a941',locator:'output/merged/weapons/Hammer.json#L2-L72',weaponKind:'hammer',gameId:1,sourceGameVersion:'UNKNOWN',attackRaw:90,affinity:0,element:0,maxSharpness:'green'});
 const sourceUrl='https://'+SOURCE.namespace+'/blob/'+SOURCE.commit+'/'+SOURCE.locator;
 function evaluateHopeHammerI(){
  if(typeof root.damageFromParams!=='function'||typeof root.trainingRoomMonster!=='function'||!root.TechniqueDBEngine||!root.MHWWeaponMaxSharpness)throw Error('REAL_SLICE:BROWSER_DEPENDENCIES_UNAVAILABLE');
  const technique=root.TechniqueDBEngine.get('hammer','HAM_SIDE_SWING');
  if(!technique||!Array.isArray(technique.hits)||technique.hits.length!==1)throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND');
  const training=root.trainingRoomMonster(),part=training.parts.find(x=>x.id==='training-front');
  if(!part||!Number.isFinite(part.multipliers?.blunt))throw Error('REAL_SLICE:TRAINING_HITZONE_UNRESOLVED');
  const sharp=root.MHWWeaponMaxSharpness.resolve({maxSharpness:SOURCE.maxSharpness,maxSharpnessEvidenceRef:'https://docs.wilds.mhdb.io/#sharpness'},{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});
  if(!sharp.options)throw Error('REAL_SLICE:SHARPNESS_UNRESOLVED');
  const hit=technique.hits[0],base={attack:SOURCE.attackRaw,affinity:SOURCE.affinity,element:SOURCE.element,mv:hit.mv,hz:part.multipliers.blunt*100,ehz:0,sharp:sharp.options.sharpnessPhysicalMultiplier,esharp:1,critBonus:0,elementCrit:false,criticalState:'noncritical'};
  const normal=root.damageFromParams(base),maximum=root.damageFromParams({...base});
  return Object.freeze({status:'available',source:{...SOURCE,sourceUrl,techniqueId:technique.techniqueId,techniqueRevision:technique.revision,techniqueSource:technique.evidenceRefs?.[0]||null},channels:{normal:{damage:normal.p},maximum:{damage:maximum.p}},dps:{status:'unavailable',reason:'DPS_BETA_PENDING'}});
 }
 root.MHWRealOneHitBrowserAdapter=Object.freeze({evaluateHopeHammerI});
})(typeof window!=='undefined'?window:globalThis);
