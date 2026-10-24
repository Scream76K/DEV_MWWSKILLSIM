'use strict';
// An atomic, detached read view for V10. Source must return all relevant DB records in one capture.
// No live lookup is permitted after capture. This adapter intentionally has no game formulas.
const copy=x=>structuredClone(x);
const fail=m=>{throw new Error(m)};
const key=x=>JSON.stringify(canonical(x));
function canonical(x){return Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x}
function assertRecordMap(x,label){if(!x||typeof x!=='object'||Array.isArray(x))fail('SNAPSHOT_'+label+'_INVALID')}
function createImmutableProvider({capture,resolveBuild,resolveEffects}){
 if(typeof capture!=='function'||typeof resolveBuild!=='function'||typeof resolveEffects!=='function')fail('SNAPSHOT_ADAPTER_DEPENDENCY_MISSING');
 return function openDataSnapshot(versions){
  // Provider must capture an internally consistent source image atomically, or abort.
  // A caller cannot derive this guarantee from cloning alone.
  const image=copy(capture(copy(versions)));
  if(!image||key(image.versions)!==key(versions))fail('SNAPSHOT_VERSION_MISMATCH');
  for(const label of ['equipment','techniques','effects'])assertRecordMap(image[label],label);
  // Copy once: later mutations of the live source cannot affect this view.
  const stable=copy(image);
  return Object.freeze({
   versions:copy(stable.versions),
   readTechnique(id,revision){const item=stable.techniques[id];if(!item)fail('TECHNIQUE_NOT_FOUND');if(item.dataVersion!==revision)fail('TECHNIQUE_VERSION_MISMATCH');return copy(item)},
   resolveBuild(build,dbVersion,gameVersion,request){
    if(dbVersion!==stable.versions.equipment||gameVersion!==stable.versions.game)fail('BUILD_VERSION_MISMATCH');
    return copy(resolveBuild(copy(build),copy(stable.equipment),copy(request)));
   },
   resolveEffects(build,conditions,channel,effectsVersion){
    if(effectsVersion!==stable.versions.effects)fail('EFFECTS_VERSION_MISMATCH');
    return copy(resolveEffects(copy(build),copy(conditions),channel,copy(stable.effects)));
   }
  });
 };
}
module.exports={createImmutableProvider};
