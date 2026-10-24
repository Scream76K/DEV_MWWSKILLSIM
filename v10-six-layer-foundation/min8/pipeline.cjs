'use strict';
// Single public entry point: L1 -> L2 -> L3 -> L4(min7 executor) -> L5(min7 sole aggregator) -> L6.
const {inputAdapter,buildResolver,WEAPON_TYPES}=require('./min2-contract.cjs');
const {createPipeline:engine}=require('./engine.cjs');
const cp=x=>structuredClone(x);
const value=(d,name)=>{if(d?.status!=='known'||typeof d.value!=='number'||!Number.isFinite(d.value))throw Error('UNRESOLVED_BASE_'+name);return d.value};
const invalid=r=>({status:'unavailable',reason:r});
function createPipeline({versions,openDataSnapshot,resolveBuild,resolveEffects,readTechnique,initialState,handlers={},formulae={}}){
 if(typeof openDataSnapshot!=='function')throw Error('IMMUTABLE_SNAPSHOT_PROVIDER_REQUIRED');
 const deps={versions,handlers,formulae,initialState,
   openDataSnapshot:pinned=>{
    const snapshot=openDataSnapshot(cp(pinned));
    if(!snapshot || !snapshot.versions || JSON.stringify(snapshot.versions)!==JSON.stringify(pinned))throw Error('SNAPSHOT_INVALID');
    for(const name of ['resolveBuild','resolveEffects','readTechnique'])if(typeof snapshot[name]!=='function')throw Error('SNAPSHOT_READER_MISSING_'+name);
    return {
      versions:cp(snapshot.versions),
      readTechnique:(id,version,game)=>snapshot.readTechnique(id,version,game),
      resolveBuild:(raw,db,game)=>{
       const request=raw.__request; if(!request)throw Error('L1_REQUEST_NOT_BOUND');
       const resolved=buildResolver(request,(s)=>snapshot.resolveBuild(s,db,game,cp(request)));
       if(resolved.dbVersion!==db)throw Error('EQUIPMENT_DB_VERSION_MISMATCH');
       if(!WEAPON_TYPES.includes(resolved.weaponType))throw Error('WEAPON_KIND_INVALID');
       return {weaponType:resolved.weaponType,trueAttack:value(resolved.equipment.trueAttack,'trueAttack'),element:value(resolved.equipment.displayElement,'displayElement'),affinity:value(resolved.equipment.baseAffinity,'baseAffinity'),equipment:cp(resolved.equipment),skills:cp(resolved.skills),weaponState:cp(resolved.extensions||{}),diagnostics:cp(resolved.issues||[]),source:resolved.source};
      },
      resolveEffects:(build,conditions,ch,version)=>{
       // L3: preserve semantic stage/unit and deferred state predicates; no common effect calculations here.
       const found=snapshot.resolveEffects(cp(build),cp(conditions),ch,version);
       if(!Array.isArray(found))throw Error('L3_EFFECT_LIST_INVALID');
       return found.map(e=>{
        if(!e || typeof e.id!=='string'||typeof e.target!=='string'||typeof e.stage!=='string'||typeof e.unit!=='string'||typeof e.source!=='string')throw Error('L3_EFFECT_SCHEMA_INVALID');
        if(!Number.isInteger(e.order)||!['add','multiply','cap'].includes(e.operation)||typeof e.amount!=='number'||!Number.isFinite(e.amount))throw Error('L3_EFFECT_VALUE_INVALID');
        if(!e.condition || !['always','state-equals','target-equals','event-equals'].includes(e.condition.type))throw Error('L3_CONDITION_INVALID');
        if(e.condition.type!=='always' && (typeof e.condition.key!=='string'||!e.condition.key||!Object.hasOwn(e.condition,'value')))throw Error('L3_CONDITION_SCHEMA_INVALID');
        return cp(e);
       });
      }
    };
   },
   readTechnique:()=>{throw Error('UNSNAPSHOTTED_TECHNIQUE_FORBIDDEN');},
   resolveBuild:()=>{throw Error('UNSNAPSHOTTED_BUILD_FORBIDDEN');},
   resolveEffects:()=>{throw Error('UNSNAPSHOTTED_EFFECT_FORBIDDEN');}
 };
 const runner=engine(deps);
 function adapt(source){const req=inputAdapter(source);if(!Array.isArray(req.evaluation.techniqueIds))throw Error('L1_TECHNIQUES_INVALID');return {...req,build:{...cp(req.build),__request:cp(req)}};}
 function evaluate(source){return runner.evaluate(adapt(source));}
 function failure(e){return {status:'FAILED',reason:e.message,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{metrics:{comboTotalDamage:invalid(e.message),comboDps:invalid(e.message)}}]))};}
 function safeEvaluate(source){try{return evaluate(source)}catch(e){return failure(e)}}
 function compare(a,b){
  // L6: one session through the engine; validate L1 separately to preserve A/B isolation.
  let aa,bb,ea,eb;try{aa=adapt(a)}catch(e){ea=e}try{bb=adapt(b)}catch(e){eb=e}
  // Even if one input is invalid, evaluate the other with the same session.
  const session=runner.session();
  const ra=ea?failure(ea):runner.safeEvaluate(aa,session);
  const rb=eb?failure(eb):runner.safeEvaluate(bb,session);
  const sameBuildContext=ra.status==='OK'&&rb.status==='OK'&&ra.weaponType===rb.weaponType;
  const comparable=sameBuildContext&&ra.comparisonContext?.damage===rb.comparisonContext?.damage;
  const relative={};for(const ch of ['normal','maximum']){const base=ra.channels.normal.metrics.comboTotalDamage,x=ra.channels[ch].metrics.comboTotalDamage,y=rb.channels[ch].metrics.comboTotalDamage;
   relative[ch]=!(sameBuildContext && ra.comparisonContext?.damage===rb.comparisonContext?.damage)?invalid('NOT_COMPARABLE'):base?.status!=='available'||base.value===0||x?.status!=='available'||y?.status!=='available'?invalid('METRIC_UNAVAILABLE'):{status:'available',value:{a:100*x.value/base.value,b:100*y.value/base.value,reference:'A_NORMAL'}};}
  return {a:ra,b:rb,relative,comparable};
 }
 return Object.freeze({evaluate,safeEvaluate,compare,present:source=>({displayMode:'single',result:safeEvaluate(source)})});
}
module.exports={createPipeline};
