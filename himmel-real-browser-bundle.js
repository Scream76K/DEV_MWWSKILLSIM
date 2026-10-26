(function(root){'use strict';
const modules=Object.create(null),cache=Object.create(null);
function define(id,factory){modules[id]=factory;}
function requireModule(id){if(cache[id])return cache[id].exports;if(!modules[id])throw Error('HIMMEL_BUNDLE_MODULE_NOT_FOUND:'+id);const module={exports:{}};cache[id]=module;modules[id](module,module.exports,requireModule);return module.exports;}
define("/core.cjs",function(module,exports,require){
'use strict';
/** V10 min2: pure six-layer evaluation contracts; deliberately no game formulas. */
const WEAPON_TYPES=Object.freeze(['great-sword','long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow']);
const CHANNELS=['normal','maximum'];
const METRICS=['powerIndex','basePower','comboTotalDamage','comboDps','comboDuration','affinity'];
const clone=x=>x===undefined?undefined:structuredClone(x);
const obj=(x,n)=>{if(x===null||typeof x!=='object'||Array.isArray(x))throw new TypeError(n+' must be object');return x};
const str=(x,n)=>{if(typeof x!=='string'||!x.trim())throw new TypeError(n+' must be nonempty string');return x};
const num=(x,n)=>{if(typeof x!=='number'||!Number.isFinite(x))throw new TypeError(n+' must be finite number');return x};
const issue=(code,layer,message)=>({code,layer,message:String(message||code)});
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function datum(status,value){if(!['known','unknown','inactive','not_applicable'].includes(status))throw new TypeError('invalid datum status');if(status==='known'){if(value===null||value===undefined)throw new TypeError('known datum requires value');return {status,value:clone(value)}}if(value!==undefined)throw new TypeError('unexpected datum value');return {status}}
function validateDatum(d,name,numeric=false){obj(d,name);if(d.status==='known'){if(!has(d,'value')||d.value===null||d.value===undefined)throw new TypeError(name+' missing value');if(numeric)num(d.value,name+'.value')}else if(!['unknown','inactive','not_applicable'].includes(d.status)||has(d,'value'))throw new TypeError(name+' invalid datum');return clone(d)}
function inputAdapter(source){obj(source,'source');if(source.schemaVersion!=='v10-min2')throw new TypeError('schemaVersion');const {build,target,conditions,evaluation}=source;obj(build,'build');obj(target,'target');obj(conditions,'conditions');obj(evaluation,'evaluation');str(evaluation.mode,'mode');str(evaluation.kind,'kind');str(evaluation.signature,'signature');str(target.id,'target.id');str(target.hitZoneKey,'target.hitZoneKey');return clone({schemaVersion:'v10-min2',build,target,conditions,evaluation})}
function buildResolver(req,resolver){if(typeof resolver!=='function')throw new TypeError('L2 resolver required');const r=obj(resolver(clone(req.build),clone(req)),'L2');if(!WEAPON_TYPES.includes(r.weaponType))throw new TypeError('invalid weaponType');obj(r.equipment,'equipment');obj(r.skills,'skills');str(r.dbVersion,'dbVersion');str(r.source,'source');if(!Array.isArray(r.equipment.ids))throw new TypeError('equipment.ids');for(const id of r.equipment.ids)str(id,'equipment.id');for(const k of ['trueAttack','displayElement','baseAffinity'])validateDatum(r.equipment[k],k,true);if(r.equipment.elementType!==undefined&&typeof r.equipment.elementType!=='string')throw new TypeError('equipment.elementType');if(!Array.isArray(r.skills.entries))throw new TypeError('skills.entries');for(const s of r.skills.entries){str(s.id,'skill.id');num(s.level,'skill.level');num(s.rank,'skill.rank');str(s.source,'skill.source')}return {weaponType:r.weaponType,elementType:r.equipment.elementType,equipment:clone(r.equipment),skills:clone(r.skills),dbVersion:r.dbVersion,source:r.source,issues:clone(r.issues||[]),extensions:clone(r.extensions||{})}}
function validateEffect(e){str(e.id,'effect.id');str(e.target,'effect.target');str(e.stage,'effect.stage');num(e.order,'effect.order');if(!['add','multiply','cap'].includes(e.operation))throw new TypeError('effect.operation');validateDatum(e.amount,'effect.amount',true);validateDatum(e.condition,'effect.condition');str(e.source,'effect.source');return clone(e)}
function effectResolver(build,req,resolve){if(typeof resolve!=='function')throw new TypeError('L3 resolver required');const out={};for(const ch of CHANNELS){try{const r=obj(resolve(clone(build),clone(req.conditions),ch,clone(req)),'L3 '+ch);if(!Array.isArray(r.effects))throw new TypeError('effects must be array');out[ch]={status:'OK',effects:r.effects.map(validateEffect),issues:clone(r.issues||[])}}catch(e){out[ch]={status:'BLOCKED',effects:[],issues:[issue('EFFECT_RESOLUTION_FAILED','L3',e.message)]}}}return out}
function weaponEngine(build,contexts,req,handlers){obj(handlers,'handlers');const handler=handlers[build.weaponType],out={};for(const ch of CHANNELS){if(contexts[ch].status==='BLOCKED'){out[ch]={status:'BLOCKED',components:[],metrics:{},issues:clone(contexts[ch].issues)};continue}if(typeof handler!=='function'){out[ch]={status:'NOT_IMPLEMENTED',components:[],metrics:{},issues:[issue('HANDLER_NOT_IMPLEMENTED','L4',build.weaponType)]};continue}try{const r=obj(handler({build:clone(build),effects:clone(contexts[ch]),target:clone(req.target),evaluation:clone(req.evaluation),channel:ch}),'L4');if(!['OK','PARTIAL','NOT_IMPLEMENTED','BLOCKED'].includes(r.status)||!Array.isArray(r.components))throw new TypeError('invalid Handler result');out[ch]={status:r.status,components:clone(r.components),metrics:clone(r.metrics||{}),issues:clone(r.issues||[]),techniques:clone(r.techniques||[])}}catch(e){out[ch]={status:'BLOCKED',components:[],metrics:{},issues:[issue('WEAPON_EVALUATION_FAILED','L4',e.message)]}}}return out}
function metricResult(x,name,status){if(status==='BLOCKED'||status==='NOT_IMPLEMENTED')return {status:'unavailable',reason:status};if(x===undefined||x===null)return {status:'unavailable',reason:'NOT_CALCULATED'};if(typeof x==='object'&&x!==null&&x.status==='unavailable')return {status:'unavailable',reason:str(x.reason,'metric.reason')};try{return {status:'available',value:num(x,name)}}catch(e){return {status:'unavailable',reason:'INVALID_METRIC',details:e.message}}}
function resultAggregator(build,contexts,weapon,req){const channels={};for(const ch of CHANNELS){const r=weapon[ch],m={};for(const k of METRICS)m[k]=metricResult(r.metrics?.[k],ch+'.'+k,r.status);const anyInvalid=Object.values(m).some(x=>x.reason==='INVALID_METRIC');channels[ch]={status:anyInvalid&&r.status==='OK'?'PARTIAL':r.status,metrics:m,components:clone(r.components),issues:[...clone(build.issues),...clone(contexts[ch].issues),...clone(r.issues),...(anyInvalid?[issue('INVALID_METRIC','L5',ch)]:[])]}}return {weaponType:build.weaponType,comparisonKey:{weaponType:build.weaponType,targetId:req.target.id,hitZoneKey:req.target.hitZoneKey,evaluationKind:req.evaluation.kind,evaluationSignature:req.evaluation.signature,dbVersion:build.dbVersion,techniqueRevision:req.evaluation.techniqueRevision||null},channels}}
function presentationAdapter(a,b){if(b===undefined)return {displayMode:'single',result:clone(a)};const mismatches=Object.keys(a.comparisonKey).filter(k=>a.comparisonKey[k]!==b.comparisonKey[k]);const relative={};for(const ch of CHANNELS){relative[ch]={};for(const k of ['powerIndex','basePower','comboTotalDamage','comboDps']){const ma=a.channels[ch].metrics[k],mb=b.channels[ch].metrics[k],base=a.channels.normal.metrics[k];if(mismatches.length){relative[ch][k]={status:'unavailable',reason:'CONDITIONS_MISMATCH'};continue}if(ma.status!=='available'||mb.status!=='available'||base.status!=='available'){relative[ch][k]={status:'unavailable',reason:'METRIC_UNAVAILABLE'};continue}if(base.value===0){relative[ch][k]={status:'unavailable',reason:'ZERO_REFERENCE'};continue}relative[ch][k]={status:'available',a:100*ma.value/base.value,b:100*mb.value/base.value,reference:'A_NORMAL'};}}return {displayMode:'comparison',a:clone(a),b:clone(b),status:mismatches.length?'CONDITIONS_MISMATCH':'OK',mismatches,relative}}
function createPipeline({resolveBuild,resolveEffects,handlers}){function evaluate(source){const req=inputAdapter(source),build=buildResolver(req,resolveBuild),effects=effectResolver(build,req,resolveEffects),weapon=weaponEngine(build,effects,req,handlers);return resultAggregator(build,effects,weapon,req)}return Object.freeze({evaluate,present:x=>presentationAdapter(evaluate(x)),compare:(a,b)=>presentationAdapter(evaluate(a),evaluate(b))})}
module.exports={WEAPON_TYPES,CHANNELS,METRICS,datum,validateDatum,inputAdapter,buildResolver,effectResolver,weaponEngine,resultAggregator,presentationAdapter,createPipeline};

});
define("../core.cjs",function(module,exports,require){
'use strict';
/** V10 min2: pure six-layer evaluation contracts; deliberately no game formulas. */
const WEAPON_TYPES=Object.freeze(['great-sword','long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow']);
const CHANNELS=['normal','maximum'];
const METRICS=['powerIndex','basePower','comboTotalDamage','comboDps','comboDuration','affinity'];
const clone=x=>x===undefined?undefined:structuredClone(x);
const obj=(x,n)=>{if(x===null||typeof x!=='object'||Array.isArray(x))throw new TypeError(n+' must be object');return x};
const str=(x,n)=>{if(typeof x!=='string'||!x.trim())throw new TypeError(n+' must be nonempty string');return x};
const num=(x,n)=>{if(typeof x!=='number'||!Number.isFinite(x))throw new TypeError(n+' must be finite number');return x};
const issue=(code,layer,message)=>({code,layer,message:String(message||code)});
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function datum(status,value){if(!['known','unknown','inactive','not_applicable'].includes(status))throw new TypeError('invalid datum status');if(status==='known'){if(value===null||value===undefined)throw new TypeError('known datum requires value');return {status,value:clone(value)}}if(value!==undefined)throw new TypeError('unexpected datum value');return {status}}
function validateDatum(d,name,numeric=false){obj(d,name);if(d.status==='known'){if(!has(d,'value')||d.value===null||d.value===undefined)throw new TypeError(name+' missing value');if(numeric)num(d.value,name+'.value')}else if(!['unknown','inactive','not_applicable'].includes(d.status)||has(d,'value'))throw new TypeError(name+' invalid datum');return clone(d)}
function inputAdapter(source){obj(source,'source');if(source.schemaVersion!=='v10-min2')throw new TypeError('schemaVersion');const {build,target,conditions,evaluation}=source;obj(build,'build');obj(target,'target');obj(conditions,'conditions');obj(evaluation,'evaluation');str(evaluation.mode,'mode');str(evaluation.kind,'kind');str(evaluation.signature,'signature');str(target.id,'target.id');str(target.hitZoneKey,'target.hitZoneKey');return clone({schemaVersion:'v10-min2',build,target,conditions,evaluation})}
function buildResolver(req,resolver){if(typeof resolver!=='function')throw new TypeError('L2 resolver required');const r=obj(resolver(clone(req.build),clone(req)),'L2');if(!WEAPON_TYPES.includes(r.weaponType))throw new TypeError('invalid weaponType');obj(r.equipment,'equipment');obj(r.skills,'skills');str(r.dbVersion,'dbVersion');str(r.source,'source');if(!Array.isArray(r.equipment.ids))throw new TypeError('equipment.ids');for(const id of r.equipment.ids)str(id,'equipment.id');for(const k of ['trueAttack','displayElement','baseAffinity'])validateDatum(r.equipment[k],k,true);if(r.equipment.elementType!==undefined&&typeof r.equipment.elementType!=='string')throw new TypeError('equipment.elementType');if(!Array.isArray(r.skills.entries))throw new TypeError('skills.entries');for(const s of r.skills.entries){str(s.id,'skill.id');num(s.level,'skill.level');num(s.rank,'skill.rank');str(s.source,'skill.source')}return {weaponType:r.weaponType,elementType:r.equipment.elementType,equipment:clone(r.equipment),skills:clone(r.skills),dbVersion:r.dbVersion,source:r.source,issues:clone(r.issues||[]),extensions:clone(r.extensions||{})}}
function validateEffect(e){str(e.id,'effect.id');str(e.target,'effect.target');str(e.stage,'effect.stage');num(e.order,'effect.order');if(!['add','multiply','cap'].includes(e.operation))throw new TypeError('effect.operation');validateDatum(e.amount,'effect.amount',true);validateDatum(e.condition,'effect.condition');str(e.source,'effect.source');return clone(e)}
function effectResolver(build,req,resolve){if(typeof resolve!=='function')throw new TypeError('L3 resolver required');const out={};for(const ch of CHANNELS){try{const r=obj(resolve(clone(build),clone(req.conditions),ch,clone(req)),'L3 '+ch);if(!Array.isArray(r.effects))throw new TypeError('effects must be array');out[ch]={status:'OK',effects:r.effects.map(validateEffect),issues:clone(r.issues||[])}}catch(e){out[ch]={status:'BLOCKED',effects:[],issues:[issue('EFFECT_RESOLUTION_FAILED','L3',e.message)]}}}return out}
function weaponEngine(build,contexts,req,handlers){obj(handlers,'handlers');const handler=handlers[build.weaponType],out={};for(const ch of CHANNELS){if(contexts[ch].status==='BLOCKED'){out[ch]={status:'BLOCKED',components:[],metrics:{},issues:clone(contexts[ch].issues)};continue}if(typeof handler!=='function'){out[ch]={status:'NOT_IMPLEMENTED',components:[],metrics:{},issues:[issue('HANDLER_NOT_IMPLEMENTED','L4',build.weaponType)]};continue}try{const r=obj(handler({build:clone(build),effects:clone(contexts[ch]),target:clone(req.target),evaluation:clone(req.evaluation),channel:ch}),'L4');if(!['OK','PARTIAL','NOT_IMPLEMENTED','BLOCKED'].includes(r.status)||!Array.isArray(r.components))throw new TypeError('invalid Handler result');out[ch]={status:r.status,components:clone(r.components),metrics:clone(r.metrics||{}),issues:clone(r.issues||[]),techniques:clone(r.techniques||[])}}catch(e){out[ch]={status:'BLOCKED',components:[],metrics:{},issues:[issue('WEAPON_EVALUATION_FAILED','L4',e.message)]}}}return out}
function metricResult(x,name,status){if(status==='BLOCKED'||status==='NOT_IMPLEMENTED')return {status:'unavailable',reason:status};if(x===undefined||x===null)return {status:'unavailable',reason:'NOT_CALCULATED'};if(typeof x==='object'&&x!==null&&x.status==='unavailable')return {status:'unavailable',reason:str(x.reason,'metric.reason')};try{return {status:'available',value:num(x,name)}}catch(e){return {status:'unavailable',reason:'INVALID_METRIC',details:e.message}}}
function resultAggregator(build,contexts,weapon,req){const channels={};for(const ch of CHANNELS){const r=weapon[ch],m={};for(const k of METRICS)m[k]=metricResult(r.metrics?.[k],ch+'.'+k,r.status);const anyInvalid=Object.values(m).some(x=>x.reason==='INVALID_METRIC');channels[ch]={status:anyInvalid&&r.status==='OK'?'PARTIAL':r.status,metrics:m,components:clone(r.components),issues:[...clone(build.issues),...clone(contexts[ch].issues),...clone(r.issues),...(anyInvalid?[issue('INVALID_METRIC','L5',ch)]:[])]}}return {weaponType:build.weaponType,comparisonKey:{weaponType:build.weaponType,targetId:req.target.id,hitZoneKey:req.target.hitZoneKey,evaluationKind:req.evaluation.kind,evaluationSignature:req.evaluation.signature,dbVersion:build.dbVersion,techniqueRevision:req.evaluation.techniqueRevision||null},channels}}
function presentationAdapter(a,b){if(b===undefined)return {displayMode:'single',result:clone(a)};const mismatches=Object.keys(a.comparisonKey).filter(k=>a.comparisonKey[k]!==b.comparisonKey[k]);const relative={};for(const ch of CHANNELS){relative[ch]={};for(const k of ['powerIndex','basePower','comboTotalDamage','comboDps']){const ma=a.channels[ch].metrics[k],mb=b.channels[ch].metrics[k],base=a.channels.normal.metrics[k];if(mismatches.length){relative[ch][k]={status:'unavailable',reason:'CONDITIONS_MISMATCH'};continue}if(ma.status!=='available'||mb.status!=='available'||base.status!=='available'){relative[ch][k]={status:'unavailable',reason:'METRIC_UNAVAILABLE'};continue}if(base.value===0){relative[ch][k]={status:'unavailable',reason:'ZERO_REFERENCE'};continue}relative[ch][k]={status:'available',a:100*ma.value/base.value,b:100*mb.value/base.value,reference:'A_NORMAL'};}}return {displayMode:'comparison',a:clone(a),b:clone(b),status:mismatches.length?'CONDITIONS_MISMATCH':'OK',mismatches,relative}}
function createPipeline({resolveBuild,resolveEffects,handlers}){function evaluate(source){const req=inputAdapter(source),build=buildResolver(req,resolveBuild),effects=effectResolver(build,req,resolveEffects),weapon=weaponEngine(build,effects,req,handlers);return resultAggregator(build,effects,weapon,req)}return Object.freeze({evaluate,present:x=>presentationAdapter(evaluate(x)),compare:(a,b)=>presentationAdapter(evaluate(a),evaluate(b))})}
module.exports={WEAPON_TYPES,CHANNELS,METRICS,datum,validateDatum,inputAdapter,buildResolver,effectResolver,weaponEngine,resultAggregator,presentationAdapter,createPipeline};

});
define("/min2-contract.cjs",function(module,exports,require){
'use strict';
// min8 L1/L2 use the already-committed min2 canonical implementations.
// Avoid a second copy of validation rules. Existing contract remains the source of truth.
const { inputAdapter, buildResolver, WEAPON_TYPES, datum, validateDatum } = require('../core.cjs');
module.exports = { inputAdapter, buildResolver, WEAPON_TYPES, datum, validateDatum };

});
define("./min2-contract.cjs",function(module,exports,require){
'use strict';
// min8 L1/L2 use the already-committed min2 canonical implementations.
// Avoid a second copy of validation rules. Existing contract remains the source of truth.
const { inputAdapter, buildResolver, WEAPON_TYPES, datum, validateDatum } = require('../core.cjs');
module.exports = { inputAdapter, buildResolver, WEAPON_TYPES, datum, validateDatum };

});
define("/engine.cjs",function(module,exports,require){
'use strict';
// min8 structural engine: immutable-per-session Technique records, event execution, single L5.
const copy=x=>structuredClone(x), ensure=(x,m)=>{if(!x)throw Error(m)}, num=x=>typeof x==='number'&&Number.isFinite(x);
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const validateState=(value,seen=new Set())=>{
  const t=typeof value;
  ensure(value!==undefined&&t!=='function'&&t!=='symbol'&&t!=='bigint','STATE_VALUE_INVALID');
  if(t==='number')ensure(Number.isFinite(value),'STATE_VALUE_NON_FINITE');
  if(value===null||t!=='object')return;
  ensure(!seen.has(value),'STATE_CYCLE_INVALID');seen.add(value);
  ensure(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null,'STATE_OBJECT_INVALID');
  if(Array.isArray(value)){
    for(let i=0;i<value.length;i++){
      ensure(Object.hasOwn(value,i),'STATE_ARRAY_HOLE_INVALID');
      validateState(value[i],seen);
    }
    for(const key of Reflect.ownKeys(value)){
      if(key==='length')continue;
      ensure(typeof key==='string'&&Number.isSafeInteger(Number(key))&&Number(key)>=0&&String(Number(key))===key&&Number(key)<value.length&&Object.getOwnPropertyDescriptor(value,key)?.enumerable,'STATE_KEY_INVALID');
    }
  }else{
    for(const key of Reflect.ownKeys(value)){
      ensure(typeof key==='string'&&Object.getOwnPropertyDescriptor(value,key)?.enumerable,'STATE_KEY_INVALID');
      validateState(value[key],seen);
    }
  }
  seen.delete(value);
};
const semantic=x=>JSON.stringify(stable(x));
const stateEqual=(a,b)=>{
 validateState(a);validateState(b);
 const compare=(x,y)=>{
  if(Object.is(x,y))return true;
  if(x===null||y===null||typeof x!=='object'||typeof y!=='object')return false;
  if(Array.isArray(x)!==Array.isArray(y))return false;
  const xKeys=Object.keys(x),yKeys=Object.keys(y);
  return xKeys.length===yKeys.length&&xKeys.every(k=>Object.hasOwn(y,k)&&compare(x[k],y[k]));
 };
 return compare(a,b);
};
const pathIdentity=path=>JSON.stringify(path.map(key=>String(key)));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const condition=(rule,ctx)=>{
 ensure(rule&&typeof rule==='object'&&['always','state-equals','target-equals','event-equals'].includes(rule.type),'CONDITION_INVALID');
 if(rule.type==='always')return 'true';
 const root=rule.type==='state-equals'?ctx.state:rule.type==='target-equals'?ctx.target:ctx.event;
 ensure(Object.hasOwn(rule,'value'),'CONDITION_SCHEMA_INVALID');
 const path=rule.path===undefined?[rule.key]:rule.path;
 ensure(Array.isArray(path)&&path.length>0&&path.every(k=>(typeof k==='string'&&k.length>0&&!['__proto__','prototype','constructor'].includes(k))||(Number.isInteger(k)&&k>=0)),'CONDITION_PATH_INVALID');
 let found=root;
 for(const key of path){
   if(!found||typeof found!=='object'||!Object.hasOwn(found,key))return 'unknown';
   found=found[key];
 }
 validateState(rule.value);
 return stateEqual(found,rule.value)?'true':'false';
};
const validPath=p=>Array.isArray(p)&&p.length>0&&p.every(k=>(typeof k==='string'&&k.length>0&&k!=='__proto__'&&k!=='prototype'&&k!=='constructor')||(Number.isInteger(k)&&k>=0));
const readPath=(root,path)=>{let x=root;for(const k of path){if(x===null||typeof x!=='object'||!Object.hasOwn(x,k))return {status:'unknown'};x=x[k]}return {status:'known',value:x}};
const writePath=(root,path,value)=>{let x=root;for(const k of path.slice(0,-1)){ensure(x&&typeof x==='object'&&Object.hasOwn(x,k),'STATE_PATH_UNKNOWN');x=x[k]}const key=path.at(-1);ensure(x&&typeof x==='object'&&Object.hasOwn(x,key),'STATE_PATH_UNKNOWN');x[key]=copy(value)};
const bad=reason=>({status:'unavailable',reason}), good=value=>({status:'available',value});
function createPipeline({versions,openDataSnapshot,initialState,handlers={},formulae={}}){
 const pinned=copy(versions);
 for(const k of ['game','equipment','technique','effects'])ensure(typeof pinned[k]==='string'&&pinned[k], 'VERSION_MISSING_'+k);
 function session(){
  const snap=openDataSnapshot(copy(pinned));
  ensure(snap&&semantic(snap.versions)===semantic(pinned),'SNAPSHOT_VERSION_MISMATCH');
  for(const k of ['readTechnique','resolveBuild','resolveEffects'])ensure(typeof snap[k]==='function','SNAPSHOT_READER_MISSING_'+k);
  const cache=new Map(),buildCache=new Map(),effectCache=new Map(),failures=new Map();
  let sealed=false;
  const requirePreloaded=(map,key,scope)=>{if(failures.has(scope+key))throw Error(failures.get(scope+key));if(sealed&&!map.has(key))throw Error('SNAPSHOT_UNPREPARED_KEY');};
  const capture=(map,key,scope,fn)=>{requirePreloaded(map,key,scope);if(!map.has(key)){try{map.set(key,copy(fn()))}catch(e){failures.set(scope+key,e.message);throw e}}return copy(map.get(key))};
  const readTechnique=(id)=>{const k=id+'@'+pinned.technique;return capture(cache,k,'T:',()=>snap.readTechnique(id,pinned.technique,pinned.game))};
  const resolved={
    ...snap,
    resolveBuild:(raw,db,game)=>{const key=semantic({raw,db,game});return capture(buildCache,key,'B:',()=>snap.resolveBuild(copy(raw),db,game));},
    resolveEffects:(build,conditions,ch,v)=>{const key=semantic({build,conditions,ch,v});return capture(effectCache,key,'E:',()=>snap.resolveEffects(copy(build),copy(conditions),ch,v));}
   };
  return {
    snapshot:resolved,readTechnique,
    prepare(requests){
      ensure(!sealed,'SNAPSHOT_ALREADY_SEALED');
      ensure(Array.isArray(requests),'SNAPSHOT_REQUESTS_INVALID');
      const diagnostics=[];
      for(const [i,req] of requests.entries()){
        try{
          ensure(req&&req.build&&req.evaluation&&Array.isArray(req.evaluation.techniqueIds),'SNAPSHOT_REQUEST_INVALID');
          const build=resolved.resolveBuild(copy(req.build),pinned.equipment,pinned.game);
          for(const ch of ['normal','maximum']){
            try{resolved.resolveEffects(copy(build),copy(req.conditions||{}),ch,pinned.effects)}
            catch(e){diagnostics.push({request:i,channel:ch,reason:e.message})}
          }
          for(const id of req.evaluation.techniqueIds){
            try{readTechnique(id)}catch(e){diagnostics.push({request:i,techniqueId:id,reason:e.message})}
          }
        }catch(e){diagnostics.push({request:i,reason:e.message})}
      }
      sealed=true;
      return {diagnostics:copy(diagnostics),keys:{techniques:cache.size,builds:buildCache.size,effects:effectCache.size}};
    }
   };
 }
 function planFor(req,s){
  const selected=req.evaluation.techniqueIds;ensure(Array.isArray(selected)&&selected.length,'TECHNIQUES_MISSING');
  const events=[],revisions=[];
  selected.forEach((id,step)=>{const t=s.readTechnique(id);ensure(t?.id===id&&t.dataVersion===pinned.technique&&t.revision&&t.definitionStatus==='defined','TECHNIQUE_UNDEFINED');
   ensure(Array.isArray(t.events)&&(t.events.length||t.explicitNoOp===true),'EVENTS_UNDEFINED');revisions.push({id,revision:t.revision});
   t.events.forEach((ev,i)=>{ensure(['hit','consume','transition'].includes(ev.type),'EVENT_TYPE_INVALID');
    if(ev.type==='hit'){ensure(Array.isArray(ev.components)&&ev.components.length,'COMPONENTS_MISSING');const ids=new Set();for(const c of ev.components){ensure(c.id&&!ids.has(c.id)&&c.kind&&c.unit&&c.source&&num(c.coefficient),'DB_COMPONENT_INVALID');ids.add(c.id)}}
    events.push({...copy(ev),id:step+':'+i,techniqueId:id,revision:t.revision});
   });
  });
  return {events,expected:events.map(e=>e.id),signature:semantic(revisions)};
 }
 function applyEffects(component,effects,state,build,target,event,conditions={}){
  const stateKey=component.parameters?.damageStatsState;
  const stateStats=stateKey&&conditions?.stateStatsByState&&typeof conditions.stateStatsByState==='object'?conditions.stateStatsByState[stateKey]:null;
  if(stateKey&&!stateStats)throw Error('REAL_SLICE:STATE_STATS_UNRESOLVED:'+stateKey);
  const stats=stateStats&&typeof stateStats==='object'?{attack:stateStats.attack,element:stateStats.element,affinity:stateStats.affinity}:{attack:build.trueAttack,element:build.element,affinity:build.affinity};
  const sourceAttackComponents=build?.equipment?.attackComponents;
  const attackComponents=sourceAttackComponents&&['weaponBase','normalMultiplier','normalFlat'].every(k=>finite(sourceAttackComponents[k]))?{weaponBase:sourceAttackComponents.weaponBase,normalMultiplier:sourceAttackComponents.normalMultiplier,normalFlat:sourceAttackComponents.normalFlat}:null;
  const sourceElementComponents=build?.equipment?.elementComponents;
  const elementComponents=sourceElementComponents&&['weaponBase','normalMultiplier','normalFlat'].every(k=>finite(sourceElementComponents[k]))?{weaponBase:sourceElementComponents.weaponBase,normalMultiplier:sourceElementComponents.normalMultiplier,normalFlat:sourceElementComponents.normalFlat}:null;
  const out={coefficient:component.coefficient,stats,attackComponents,elementComponents,post:[],trace:[]};
  const appliedAffinityGroups=new Set();
  for(const [k,v] of Object.entries(out.stats))ensure(num(v),'BASE_STAT_INVALID_'+k);
  const targets=Array.isArray(component.parameters?.effectTargets)&&component.parameters.effectTargets.length?component.parameters.effectTargets:[component.kind];
  const stages=Array.isArray(component.parameters?.effectStages)&&component.parameters.effectStages.length?component.parameters.effectStages:null;
  const unit={coefficient:component.unit,attack:'true-attack',element:'display-element',affinity:'percent',damage:'damage'};
  const excludedEffectIds=component.parameters?.excludedEffectIds||[];
  ensure(Array.isArray(excludedEffectIds)&&excludedEffectIds.every(x=>typeof x==='string'),'EFFECT_EXCLUSIONS_INVALID');
  for(const e of [...effects].filter(x=>!excludedEffectIds.includes(x.id)&&targets.includes(x.target)&&(!stages||stages.includes(x.stage))).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id))){
   ensure(unit[e.stage]&&num(e.amount)&&['add','multiply','cap'].includes(e.operation),'EFFECT_INVALID');
   ensure(e.operation==='multiply'?e.unit==='dimensionless':e.unit===unit[e.stage],'EFFECT_UNIT_MISMATCH');
   const active=condition(e.condition,{state,target,event});
   if(active==='unknown')throw Error('EFFECT_CONDITION_UNKNOWN_'+e.id);
   if(active==='false')continue;
   ensure(finite(out.coefficient)&&Object.values(out.stats).every(finite),'EFFECT_RESULT_NON_FINITE');
   if(e.stage==='damage')out.post.push({operation:e.operation,amount:e.amount});
   else if(e.stage==='affinity'){
    const logicalId=String(e.id).replace(/-element$/,'');
    if(appliedAffinityGroups.has(logicalId))continue;
    appliedAffinityGroups.add(logicalId);
    const v=out.stats.affinity;out.stats.affinity=e.operation==='add'?v+e.amount:e.operation==='multiply'?v*e.amount:Math.min(v,e.amount);
   }
   else if(e.stage==='attack'&&out.attackComponents){
    if(e.operation==='multiply')out.attackComponents.normalMultiplier*=e.amount;
    else if(e.operation==='add')out.attackComponents.normalFlat+=e.amount;
    else out.stats.attack=Math.min(out.stats.attack,e.amount);
    out.stats.attack=out.attackComponents.weaponBase*out.attackComponents.normalMultiplier+out.attackComponents.normalFlat;
   }else if(e.stage==='element'&&out.elementComponents){if(e.operation==='multiply')out.elementComponents.normalMultiplier*=e.amount;else if(e.operation==='add')out.elementComponents.normalFlat+=e.amount;else out.stats.element=Math.min(out.stats.element,e.amount);out.stats.element=out.elementComponents.weaponBase*out.elementComponents.normalMultiplier+out.elementComponents.normalFlat;}else {const dest=e.stage==='coefficient'?out:out.stats,key=e.stage;const v=dest[key];dest[key]=e.operation==='add'?v+e.amount:e.operation==='multiply'?v*e.amount:Math.min(v,e.amount);}
   ensure(finite(out.coefficient)&&Object.values(out.stats).every(finite),'EFFECT_RESULT_NON_FINITE');
   out.trace.push({id:e.id,target:e.target,stage:e.stage,unit:e.unit,order:e.order,source:e.source,...(e.status?{status:e.status}: {})});
  }
  return out;
 }
 function aggregate(run,duration){
  const e=run.execution,complete=e.status==='complete'&&e.expected.length===e.executed.length&&e.expected.every((x,i)=>x===e.executed[i]);
  const componentsValid=run.components.every(c=>c.status==='available'&&finite(c.value));
  const sum=componentsValid?run.components.reduce((s,c)=>s+c.value,0):null;
  const total=!complete?bad('EXECUTION_INCOMPLETE'):!componentsValid?bad('COMPONENT_UNAVAILABLE'):!finite(sum)?bad('TOTAL_NON_FINITE'):good(sum);
  const time=num(duration)&&duration>0?good(duration):bad('DURATION_UNAVAILABLE');
  const provisionalEffects=run.components.flatMap(c=>Array.isArray(c.effectsApplied)?c.effectsApplied:[]).filter(e=>['PROVISIONALLY_ADOPTED','OWNER_APPROVED_PROVISIONAL'].includes(e.status));
  return {...run,diagnostics:{formalStatus:provisionalEffects.length?'PROVISIONAL':'UNVERIFIED',provisionalEffects:copy(provisionalEffects)},metrics:{comboTotalDamage:total,comboDuration:time,comboDps:total.status==='available'&&time.status==='available'?(finite(total.value/time.value)?good(total.value/time.value):bad('DPS_NON_FINITE')):bad(total.status==='available'?'DURATION_UNAVAILABLE':total.reason)}};
 }
 function runChannel(build,req,plan,ch,s){
  const executed=[],components=[],issues=[];let state;
  try{
   state=copy(initialState(copy(build),ch,copy(req.conditions)));ensure(state&&typeof state==='object','STATE_INVALID');validateState(state);
   const effects=s.snapshot.resolveEffects(copy(build),copy(req.conditions),ch,pinned.effects);
   ensure(Array.isArray(effects),'EFFECTS_INVALID');
   const handler=handlers[build.weaponType];ensure(typeof handler==='function','HANDLER_NOT_IMPLEMENTED');
   for(const ev of plan.events){
    try{
     const before=copy(state);
     const decision=handler({event:copy(ev),state:copy(state),conditions:copy(req.conditions||{}),channel:ch,build:copy(build),effects:copy(effects),target:copy(req.target)});
     ensure(decision&&typeof decision==='object','DECISION_MISSING');
     if(ev.type==='hit'){
      const emit=decision.emit,inactive=decision.inactive,unresolved=decision.unresolved||[],reasons=decision.reasons&&typeof decision.reasons==='object'?decision.reasons:{};
      ensure(Array.isArray(emit)&&Array.isArray(inactive)&&Array.isArray(unresolved),'DISPOSITIONS_MISSING');
      const all=[...emit,...inactive,...unresolved],allowed=ev.components.map(c=>c.id);
      ensure(all.length===allowed.length&&new Set(all).size===all.length&&all.every(id=>allowed.includes(id)),'DISPOSITION_INVALID');
      for(const c of ev.components){
       const meta={id:c.id,eventId:ev.id,techniqueId:ev.techniqueId,revision:ev.revision,source:c.source,coefficientUnit:c.unit,damageUnit:'damage',...(c.parameters?.adoption?{adoption:copy(c.parameters.adoption)}:{})};
       if(inactive.includes(c.id)){components.push({...meta,...good(0),disposition:'confirmed_inactive'});continue}
       if(unresolved.includes(c.id)){components.push({...meta,...bad(typeof reasons[c.id]==='string'?reasons[c.id]:'UNRESOLVED_DISPOSITION'),disposition:'unresolved'});continue}
       const applied=applyEffects(c,effects,state,build,req.target,ev,req.conditions||{}),f=formulae[c.kind];
       const response=typeof f==='function'?f({kind:c.kind,channel:ch,coefficient:applied.coefficient,coefficientUnit:c.unit,parameters:copy(c.parameters||{}),target:copy(req.target),state:copy(state),stats:{...copy(applied.stats),...(applied.attackComponents?{attackComponents:copy(applied.attackComponents)}:{})},build:copy(build)}):bad('FORMULA_NOT_IMPLEMENTED');
       ensure(response?.status==='unavailable'||response?.status==='available'&&num(response.value),'FORMULA_RESULT_INVALID');
       let result=response.status==='available'?response.value:null;
       if(result!==null){for(const post of applied.post){result=post.operation==='add'?result+post.amount:post.operation==='multiply'?result*post.amount:Math.min(result,post.amount);ensure(num(result),'POST_DAMAGE_NON_FINITE')}}
       components.push({...meta,...(result===null?bad(response.reason):good(result)),...(response?.details?{details:copy(response.details)}:{}),disposition:'emitted',effectsApplied:applied.trace});
      }
     }else{
       ensure(decision.nextState&&typeof decision.nextState==='object','NEXT_STATE_REQUIRED');
       const after=decision.nextState;validateState(after);
       let expected;
       if(ev.type==='consume'){
         const path=ev.resourcePath===undefined?[ev.resource]:ev.resourcePath;
         ensure(validPath(path)&&num(ev.amount)&&ev.amount>=0,'CONSUME_DEFINITION_INVALID');
         const current=readPath(before,path);
         ensure(current.status==='known'&&num(current.value)&&current.value>=ev.amount,'CONSUME_RESOURCE_INVALID');
         expected=copy(before);writePath(expected,path,current.value-ev.amount);
         ensure(stateEqual(after,expected),'CONSUME_TRANSITION_MISMATCH');
       }else if(ev.type==='transition'){
         expected=copy(before);
         if(Array.isArray(ev.operations)){
           const occupied=new Set();
           for(const op of ev.operations){
             ensure(op&&['set','add','transfer'].includes(op.op)&&validPath(op.path),'TRANSITION_OPERATION_INVALID');
             const key=pathIdentity(op.path);ensure(!occupied.has(key),'TRANSITION_DUPLICATE_PATH');occupied.add(key);
             if(op.op==='set'){ensure(Object.hasOwn(op,'value'),'TRANSITION_VALUE_MISSING');writePath(expected,op.path,op.value);}
             else if(op.op==='add'){const curr=readPath(expected,op.path);ensure(curr.status==='known'&&finite(curr.value)&&finite(op.amount),'TRANSITION_ADD_INVALID');let next=curr.value+op.amount;ensure(finite(next),'TRANSITION_OVERFLOW');if(op.cap!==undefined){ensure(finite(op.cap),'TRANSITION_CAP_INVALID');next=Math.min(next,op.cap)}writePath(expected,op.path,next);}
             else {ensure(validPath(op.to)&&pathIdentity(op.to)!==pathIdentity(op.path),'TRANSFER_TARGET_INVALID');ensure(!occupied.has(pathIdentity(op.to)),'TRANSITION_DUPLICATE_PATH');occupied.add(pathIdentity(op.to));const from=readPath(expected,op.path),to=readPath(expected,op.to);ensure(from.status==='known'&&to.status==='known'&&finite(from.value)&&finite(to.value),'TRANSFER_RESOURCE_INVALID');const amount=op.amount==='all'?from.value:op.amount;ensure(finite(amount)&&amount>=0&&from.value>=amount,'TRANSFER_AMOUNT_INVALID');ensure(finite(to.value+amount),'TRANSFER_OVERFLOW');writePath(expected,op.path,from.value-amount);writePath(expected,op.to,to.value+amount);}
           }
         }else{
           ensure(ev.updates&&typeof ev.updates==='object'&&!Array.isArray(ev.updates),'TRANSITION_DEFINITION_MISSING');
           Object.assign(expected,copy(ev.updates));
         }
         ensure(stateEqual(after,expected),'TRANSITION_MISMATCH');
       }
       state=expected;
     }
     executed.push(ev.id);
    }catch(err){issues.push({eventId:ev.id,reason:err.message});break}
   }
  }catch(err){issues.push({reason:err.message})}
  return aggregate({execution:{status:executed.length===plan.expected.length&&!issues.length?'complete':'incomplete',expected:copy(plan.expected),executed,reason:issues[0]?.reason||null},components,issues,finalState:state},req.evaluation.duration);
 }
 function evaluate(req,s=session()){
  ensure(req?.build&&req?.target&&req?.evaluation,'REQUEST_INVALID');
  const build=s.snapshot.resolveBuild(copy(req.build),pinned.equipment,pinned.game);
  ensure(build?.weaponType,'BUILD_INVALID');
  const plan=planFor(req,s),results={};
  for(const ch of ['normal','maximum'])results[ch]=runChannel(build,req,plan,ch,s);
  return {status:'OK',weaponType:build.weaponType,diagnostics:copy(build.diagnostics||[]),versions:copy(pinned),conditionKey:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind}),comparisonContext:{damage:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind}),dps:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind,duration:req.evaluation.duration})},channels:results};
 }
 function safeEvaluate(req,s){try{return evaluate(req,s)}catch(err){return {status:'FAILED',reason:err.message,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{metrics:{comboTotalDamage:bad(err.message),comboDps:bad(err.message)}}]))}}}
 return Object.freeze({evaluate,safeEvaluate,session});
}
module.exports={createPipeline};

});
define("./engine.cjs",function(module,exports,require){
'use strict';
// min8 structural engine: immutable-per-session Technique records, event execution, single L5.
const copy=x=>structuredClone(x), ensure=(x,m)=>{if(!x)throw Error(m)}, num=x=>typeof x==='number'&&Number.isFinite(x);
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const validateState=(value,seen=new Set())=>{
  const t=typeof value;
  ensure(value!==undefined&&t!=='function'&&t!=='symbol'&&t!=='bigint','STATE_VALUE_INVALID');
  if(t==='number')ensure(Number.isFinite(value),'STATE_VALUE_NON_FINITE');
  if(value===null||t!=='object')return;
  ensure(!seen.has(value),'STATE_CYCLE_INVALID');seen.add(value);
  ensure(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null,'STATE_OBJECT_INVALID');
  if(Array.isArray(value)){
    for(let i=0;i<value.length;i++){
      ensure(Object.hasOwn(value,i),'STATE_ARRAY_HOLE_INVALID');
      validateState(value[i],seen);
    }
    for(const key of Reflect.ownKeys(value)){
      if(key==='length')continue;
      ensure(typeof key==='string'&&Number.isSafeInteger(Number(key))&&Number(key)>=0&&String(Number(key))===key&&Number(key)<value.length&&Object.getOwnPropertyDescriptor(value,key)?.enumerable,'STATE_KEY_INVALID');
    }
  }else{
    for(const key of Reflect.ownKeys(value)){
      ensure(typeof key==='string'&&Object.getOwnPropertyDescriptor(value,key)?.enumerable,'STATE_KEY_INVALID');
      validateState(value[key],seen);
    }
  }
  seen.delete(value);
};
const semantic=x=>JSON.stringify(stable(x));
const stateEqual=(a,b)=>{
 validateState(a);validateState(b);
 const compare=(x,y)=>{
  if(Object.is(x,y))return true;
  if(x===null||y===null||typeof x!=='object'||typeof y!=='object')return false;
  if(Array.isArray(x)!==Array.isArray(y))return false;
  const xKeys=Object.keys(x),yKeys=Object.keys(y);
  return xKeys.length===yKeys.length&&xKeys.every(k=>Object.hasOwn(y,k)&&compare(x[k],y[k]));
 };
 return compare(a,b);
};
const pathIdentity=path=>JSON.stringify(path.map(key=>String(key)));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const condition=(rule,ctx)=>{
 ensure(rule&&typeof rule==='object'&&['always','state-equals','target-equals','event-equals'].includes(rule.type),'CONDITION_INVALID');
 if(rule.type==='always')return 'true';
 const root=rule.type==='state-equals'?ctx.state:rule.type==='target-equals'?ctx.target:ctx.event;
 ensure(Object.hasOwn(rule,'value'),'CONDITION_SCHEMA_INVALID');
 const path=rule.path===undefined?[rule.key]:rule.path;
 ensure(Array.isArray(path)&&path.length>0&&path.every(k=>(typeof k==='string'&&k.length>0&&!['__proto__','prototype','constructor'].includes(k))||(Number.isInteger(k)&&k>=0)),'CONDITION_PATH_INVALID');
 let found=root;
 for(const key of path){
   if(!found||typeof found!=='object'||!Object.hasOwn(found,key))return 'unknown';
   found=found[key];
 }
 validateState(rule.value);
 return stateEqual(found,rule.value)?'true':'false';
};
const validPath=p=>Array.isArray(p)&&p.length>0&&p.every(k=>(typeof k==='string'&&k.length>0&&k!=='__proto__'&&k!=='prototype'&&k!=='constructor')||(Number.isInteger(k)&&k>=0));
const readPath=(root,path)=>{let x=root;for(const k of path){if(x===null||typeof x!=='object'||!Object.hasOwn(x,k))return {status:'unknown'};x=x[k]}return {status:'known',value:x}};
const writePath=(root,path,value)=>{let x=root;for(const k of path.slice(0,-1)){ensure(x&&typeof x==='object'&&Object.hasOwn(x,k),'STATE_PATH_UNKNOWN');x=x[k]}const key=path.at(-1);ensure(x&&typeof x==='object'&&Object.hasOwn(x,key),'STATE_PATH_UNKNOWN');x[key]=copy(value)};
const bad=reason=>({status:'unavailable',reason}), good=value=>({status:'available',value});
function createPipeline({versions,openDataSnapshot,initialState,handlers={},formulae={}}){
 const pinned=copy(versions);
 for(const k of ['game','equipment','technique','effects'])ensure(typeof pinned[k]==='string'&&pinned[k], 'VERSION_MISSING_'+k);
 function session(){
  const snap=openDataSnapshot(copy(pinned));
  ensure(snap&&semantic(snap.versions)===semantic(pinned),'SNAPSHOT_VERSION_MISMATCH');
  for(const k of ['readTechnique','resolveBuild','resolveEffects'])ensure(typeof snap[k]==='function','SNAPSHOT_READER_MISSING_'+k);
  const cache=new Map(),buildCache=new Map(),effectCache=new Map(),failures=new Map();
  let sealed=false;
  const requirePreloaded=(map,key,scope)=>{if(failures.has(scope+key))throw Error(failures.get(scope+key));if(sealed&&!map.has(key))throw Error('SNAPSHOT_UNPREPARED_KEY');};
  const capture=(map,key,scope,fn)=>{requirePreloaded(map,key,scope);if(!map.has(key)){try{map.set(key,copy(fn()))}catch(e){failures.set(scope+key,e.message);throw e}}return copy(map.get(key))};
  const readTechnique=(id)=>{const k=id+'@'+pinned.technique;return capture(cache,k,'T:',()=>snap.readTechnique(id,pinned.technique,pinned.game))};
  const resolved={
    ...snap,
    resolveBuild:(raw,db,game)=>{const key=semantic({raw,db,game});return capture(buildCache,key,'B:',()=>snap.resolveBuild(copy(raw),db,game));},
    resolveEffects:(build,conditions,ch,v)=>{const key=semantic({build,conditions,ch,v});return capture(effectCache,key,'E:',()=>snap.resolveEffects(copy(build),copy(conditions),ch,v));}
   };
  return {
    snapshot:resolved,readTechnique,
    prepare(requests){
      ensure(!sealed,'SNAPSHOT_ALREADY_SEALED');
      ensure(Array.isArray(requests),'SNAPSHOT_REQUESTS_INVALID');
      const diagnostics=[];
      for(const [i,req] of requests.entries()){
        try{
          ensure(req&&req.build&&req.evaluation&&Array.isArray(req.evaluation.techniqueIds),'SNAPSHOT_REQUEST_INVALID');
          const build=resolved.resolveBuild(copy(req.build),pinned.equipment,pinned.game);
          for(const ch of ['normal','maximum']){
            try{resolved.resolveEffects(copy(build),copy(req.conditions||{}),ch,pinned.effects)}
            catch(e){diagnostics.push({request:i,channel:ch,reason:e.message})}
          }
          for(const id of req.evaluation.techniqueIds){
            try{readTechnique(id)}catch(e){diagnostics.push({request:i,techniqueId:id,reason:e.message})}
          }
        }catch(e){diagnostics.push({request:i,reason:e.message})}
      }
      sealed=true;
      return {diagnostics:copy(diagnostics),keys:{techniques:cache.size,builds:buildCache.size,effects:effectCache.size}};
    }
   };
 }
 function planFor(req,s){
  const selected=req.evaluation.techniqueIds;ensure(Array.isArray(selected)&&selected.length,'TECHNIQUES_MISSING');
  const events=[],revisions=[];
  selected.forEach((id,step)=>{const t=s.readTechnique(id);ensure(t?.id===id&&t.dataVersion===pinned.technique&&t.revision&&t.definitionStatus==='defined','TECHNIQUE_UNDEFINED');
   ensure(Array.isArray(t.events)&&(t.events.length||t.explicitNoOp===true),'EVENTS_UNDEFINED');revisions.push({id,revision:t.revision});
   t.events.forEach((ev,i)=>{ensure(['hit','consume','transition'].includes(ev.type),'EVENT_TYPE_INVALID');
    if(ev.type==='hit'){ensure(Array.isArray(ev.components)&&ev.components.length,'COMPONENTS_MISSING');const ids=new Set();for(const c of ev.components){ensure(c.id&&!ids.has(c.id)&&c.kind&&c.unit&&c.source&&num(c.coefficient),'DB_COMPONENT_INVALID');ids.add(c.id)}}
    events.push({...copy(ev),id:step+':'+i,techniqueId:id,revision:t.revision});
   });
  });
  return {events,expected:events.map(e=>e.id),signature:semantic(revisions)};
 }
 function applyEffects(component,effects,state,build,target,event,conditions={}){
  const stateKey=component.parameters?.damageStatsState;
  const stateStats=stateKey&&conditions?.stateStatsByState&&typeof conditions.stateStatsByState==='object'?conditions.stateStatsByState[stateKey]:null;
  if(stateKey&&!stateStats)throw Error('REAL_SLICE:STATE_STATS_UNRESOLVED:'+stateKey);
  const stats=stateStats&&typeof stateStats==='object'?{attack:stateStats.attack,element:stateStats.element,affinity:stateStats.affinity}:{attack:build.trueAttack,element:build.element,affinity:build.affinity};
  const sourceAttackComponents=build?.equipment?.attackComponents;
  const attackComponents=sourceAttackComponents&&['weaponBase','normalMultiplier','normalFlat'].every(k=>finite(sourceAttackComponents[k]))?{weaponBase:sourceAttackComponents.weaponBase,normalMultiplier:sourceAttackComponents.normalMultiplier,normalFlat:sourceAttackComponents.normalFlat}:null;
  const sourceElementComponents=build?.equipment?.elementComponents;
  const elementComponents=sourceElementComponents&&['weaponBase','normalMultiplier','normalFlat'].every(k=>finite(sourceElementComponents[k]))?{weaponBase:sourceElementComponents.weaponBase,normalMultiplier:sourceElementComponents.normalMultiplier,normalFlat:sourceElementComponents.normalFlat}:null;
  const out={coefficient:component.coefficient,stats,attackComponents,elementComponents,post:[],trace:[]};
  const appliedAffinityGroups=new Set();
  for(const [k,v] of Object.entries(out.stats))ensure(num(v),'BASE_STAT_INVALID_'+k);
  const targets=Array.isArray(component.parameters?.effectTargets)&&component.parameters.effectTargets.length?component.parameters.effectTargets:[component.kind];
  const stages=Array.isArray(component.parameters?.effectStages)&&component.parameters.effectStages.length?component.parameters.effectStages:null;
  const unit={coefficient:component.unit,attack:'true-attack',element:'display-element',affinity:'percent',damage:'damage'};
  const excludedEffectIds=component.parameters?.excludedEffectIds||[];
  ensure(Array.isArray(excludedEffectIds)&&excludedEffectIds.every(x=>typeof x==='string'),'EFFECT_EXCLUSIONS_INVALID');
  for(const e of [...effects].filter(x=>!excludedEffectIds.includes(x.id)&&targets.includes(x.target)&&(!stages||stages.includes(x.stage))).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id))){
   ensure(unit[e.stage]&&num(e.amount)&&['add','multiply','cap'].includes(e.operation),'EFFECT_INVALID');
   ensure(e.operation==='multiply'?e.unit==='dimensionless':e.unit===unit[e.stage],'EFFECT_UNIT_MISMATCH');
   const active=condition(e.condition,{state,target,event});
   if(active==='unknown')throw Error('EFFECT_CONDITION_UNKNOWN_'+e.id);
   if(active==='false')continue;
   ensure(finite(out.coefficient)&&Object.values(out.stats).every(finite),'EFFECT_RESULT_NON_FINITE');
   if(e.stage==='damage')out.post.push({operation:e.operation,amount:e.amount});
   else if(e.stage==='affinity'){
    const logicalId=String(e.id).replace(/-element$/,'');
    if(appliedAffinityGroups.has(logicalId))continue;
    appliedAffinityGroups.add(logicalId);
    const v=out.stats.affinity;out.stats.affinity=e.operation==='add'?v+e.amount:e.operation==='multiply'?v*e.amount:Math.min(v,e.amount);
   }
   else if(e.stage==='attack'&&out.attackComponents){
    if(e.operation==='multiply')out.attackComponents.normalMultiplier*=e.amount;
    else if(e.operation==='add')out.attackComponents.normalFlat+=e.amount;
    else out.stats.attack=Math.min(out.stats.attack,e.amount);
    out.stats.attack=out.attackComponents.weaponBase*out.attackComponents.normalMultiplier+out.attackComponents.normalFlat;
   }else if(e.stage==='element'&&out.elementComponents){if(e.operation==='multiply')out.elementComponents.normalMultiplier*=e.amount;else if(e.operation==='add')out.elementComponents.normalFlat+=e.amount;else out.stats.element=Math.min(out.stats.element,e.amount);out.stats.element=out.elementComponents.weaponBase*out.elementComponents.normalMultiplier+out.elementComponents.normalFlat;}else {const dest=e.stage==='coefficient'?out:out.stats,key=e.stage;const v=dest[key];dest[key]=e.operation==='add'?v+e.amount:e.operation==='multiply'?v*e.amount:Math.min(v,e.amount);}
   ensure(finite(out.coefficient)&&Object.values(out.stats).every(finite),'EFFECT_RESULT_NON_FINITE');
   out.trace.push({id:e.id,target:e.target,stage:e.stage,unit:e.unit,order:e.order,source:e.source,...(e.status?{status:e.status}: {})});
  }
  return out;
 }
 function aggregate(run,duration){
  const e=run.execution,complete=e.status==='complete'&&e.expected.length===e.executed.length&&e.expected.every((x,i)=>x===e.executed[i]);
  const componentsValid=run.components.every(c=>c.status==='available'&&finite(c.value));
  const sum=componentsValid?run.components.reduce((s,c)=>s+c.value,0):null;
  const total=!complete?bad('EXECUTION_INCOMPLETE'):!componentsValid?bad('COMPONENT_UNAVAILABLE'):!finite(sum)?bad('TOTAL_NON_FINITE'):good(sum);
  const time=num(duration)&&duration>0?good(duration):bad('DURATION_UNAVAILABLE');
  const provisionalEffects=run.components.flatMap(c=>Array.isArray(c.effectsApplied)?c.effectsApplied:[]).filter(e=>['PROVISIONALLY_ADOPTED','OWNER_APPROVED_PROVISIONAL'].includes(e.status));
  return {...run,diagnostics:{formalStatus:provisionalEffects.length?'PROVISIONAL':'UNVERIFIED',provisionalEffects:copy(provisionalEffects)},metrics:{comboTotalDamage:total,comboDuration:time,comboDps:total.status==='available'&&time.status==='available'?(finite(total.value/time.value)?good(total.value/time.value):bad('DPS_NON_FINITE')):bad(total.status==='available'?'DURATION_UNAVAILABLE':total.reason)}};
 }
 function runChannel(build,req,plan,ch,s){
  const executed=[],components=[],issues=[];let state;
  try{
   state=copy(initialState(copy(build),ch,copy(req.conditions)));ensure(state&&typeof state==='object','STATE_INVALID');validateState(state);
   const effects=s.snapshot.resolveEffects(copy(build),copy(req.conditions),ch,pinned.effects);
   ensure(Array.isArray(effects),'EFFECTS_INVALID');
   const handler=handlers[build.weaponType];ensure(typeof handler==='function','HANDLER_NOT_IMPLEMENTED');
   for(const ev of plan.events){
    try{
     const before=copy(state);
     const decision=handler({event:copy(ev),state:copy(state),conditions:copy(req.conditions||{}),channel:ch,build:copy(build),effects:copy(effects),target:copy(req.target)});
     ensure(decision&&typeof decision==='object','DECISION_MISSING');
     if(ev.type==='hit'){
      const emit=decision.emit,inactive=decision.inactive,unresolved=decision.unresolved||[],reasons=decision.reasons&&typeof decision.reasons==='object'?decision.reasons:{};
      ensure(Array.isArray(emit)&&Array.isArray(inactive)&&Array.isArray(unresolved),'DISPOSITIONS_MISSING');
      const all=[...emit,...inactive,...unresolved],allowed=ev.components.map(c=>c.id);
      ensure(all.length===allowed.length&&new Set(all).size===all.length&&all.every(id=>allowed.includes(id)),'DISPOSITION_INVALID');
      for(const c of ev.components){
       const meta={id:c.id,eventId:ev.id,techniqueId:ev.techniqueId,revision:ev.revision,source:c.source,coefficientUnit:c.unit,damageUnit:'damage',...(c.parameters?.adoption?{adoption:copy(c.parameters.adoption)}:{})};
       if(inactive.includes(c.id)){components.push({...meta,...good(0),disposition:'confirmed_inactive'});continue}
       if(unresolved.includes(c.id)){components.push({...meta,...bad(typeof reasons[c.id]==='string'?reasons[c.id]:'UNRESOLVED_DISPOSITION'),disposition:'unresolved'});continue}
       const applied=applyEffects(c,effects,state,build,req.target,ev,req.conditions||{}),f=formulae[c.kind];
       const response=typeof f==='function'?f({kind:c.kind,channel:ch,coefficient:applied.coefficient,coefficientUnit:c.unit,parameters:copy(c.parameters||{}),target:copy(req.target),state:copy(state),stats:{...copy(applied.stats),...(applied.attackComponents?{attackComponents:copy(applied.attackComponents)}:{})},build:copy(build)}):bad('FORMULA_NOT_IMPLEMENTED');
       ensure(response?.status==='unavailable'||response?.status==='available'&&num(response.value),'FORMULA_RESULT_INVALID');
       let result=response.status==='available'?response.value:null;
       if(result!==null){for(const post of applied.post){result=post.operation==='add'?result+post.amount:post.operation==='multiply'?result*post.amount:Math.min(result,post.amount);ensure(num(result),'POST_DAMAGE_NON_FINITE')}}
       components.push({...meta,...(result===null?bad(response.reason):good(result)),...(response?.details?{details:copy(response.details)}:{}),disposition:'emitted',effectsApplied:applied.trace});
      }
     }else{
       ensure(decision.nextState&&typeof decision.nextState==='object','NEXT_STATE_REQUIRED');
       const after=decision.nextState;validateState(after);
       let expected;
       if(ev.type==='consume'){
         const path=ev.resourcePath===undefined?[ev.resource]:ev.resourcePath;
         ensure(validPath(path)&&num(ev.amount)&&ev.amount>=0,'CONSUME_DEFINITION_INVALID');
         const current=readPath(before,path);
         ensure(current.status==='known'&&num(current.value)&&current.value>=ev.amount,'CONSUME_RESOURCE_INVALID');
         expected=copy(before);writePath(expected,path,current.value-ev.amount);
         ensure(stateEqual(after,expected),'CONSUME_TRANSITION_MISMATCH');
       }else if(ev.type==='transition'){
         expected=copy(before);
         if(Array.isArray(ev.operations)){
           const occupied=new Set();
           for(const op of ev.operations){
             ensure(op&&['set','add','transfer'].includes(op.op)&&validPath(op.path),'TRANSITION_OPERATION_INVALID');
             const key=pathIdentity(op.path);ensure(!occupied.has(key),'TRANSITION_DUPLICATE_PATH');occupied.add(key);
             if(op.op==='set'){ensure(Object.hasOwn(op,'value'),'TRANSITION_VALUE_MISSING');writePath(expected,op.path,op.value);}
             else if(op.op==='add'){const curr=readPath(expected,op.path);ensure(curr.status==='known'&&finite(curr.value)&&finite(op.amount),'TRANSITION_ADD_INVALID');let next=curr.value+op.amount;ensure(finite(next),'TRANSITION_OVERFLOW');if(op.cap!==undefined){ensure(finite(op.cap),'TRANSITION_CAP_INVALID');next=Math.min(next,op.cap)}writePath(expected,op.path,next);}
             else {ensure(validPath(op.to)&&pathIdentity(op.to)!==pathIdentity(op.path),'TRANSFER_TARGET_INVALID');ensure(!occupied.has(pathIdentity(op.to)),'TRANSITION_DUPLICATE_PATH');occupied.add(pathIdentity(op.to));const from=readPath(expected,op.path),to=readPath(expected,op.to);ensure(from.status==='known'&&to.status==='known'&&finite(from.value)&&finite(to.value),'TRANSFER_RESOURCE_INVALID');const amount=op.amount==='all'?from.value:op.amount;ensure(finite(amount)&&amount>=0&&from.value>=amount,'TRANSFER_AMOUNT_INVALID');ensure(finite(to.value+amount),'TRANSFER_OVERFLOW');writePath(expected,op.path,from.value-amount);writePath(expected,op.to,to.value+amount);}
           }
         }else{
           ensure(ev.updates&&typeof ev.updates==='object'&&!Array.isArray(ev.updates),'TRANSITION_DEFINITION_MISSING');
           Object.assign(expected,copy(ev.updates));
         }
         ensure(stateEqual(after,expected),'TRANSITION_MISMATCH');
       }
       state=expected;
     }
     executed.push(ev.id);
    }catch(err){issues.push({eventId:ev.id,reason:err.message});break}
   }
  }catch(err){issues.push({reason:err.message})}
  return aggregate({execution:{status:executed.length===plan.expected.length&&!issues.length?'complete':'incomplete',expected:copy(plan.expected),executed,reason:issues[0]?.reason||null},components,issues,finalState:state},req.evaluation.duration);
 }
 function evaluate(req,s=session()){
  ensure(req?.build&&req?.target&&req?.evaluation,'REQUEST_INVALID');
  const build=s.snapshot.resolveBuild(copy(req.build),pinned.equipment,pinned.game);
  ensure(build?.weaponType,'BUILD_INVALID');
  const plan=planFor(req,s),results={};
  for(const ch of ['normal','maximum'])results[ch]=runChannel(build,req,plan,ch,s);
  return {status:'OK',weaponType:build.weaponType,diagnostics:copy(build.diagnostics||[]),versions:copy(pinned),conditionKey:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind}),comparisonContext:{damage:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind}),dps:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind,duration:req.evaluation.duration})},channels:results};
 }
 function safeEvaluate(req,s){try{return evaluate(req,s)}catch(err){return {status:'FAILED',reason:err.message,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{metrics:{comboTotalDamage:bad(err.message),comboDps:bad(err.message)}}]))}}}
 return Object.freeze({evaluate,safeEvaluate,session});
}
module.exports={createPipeline};

});
define("/pipeline.cjs",function(module,exports,require){
'use strict';
// Single public entry point: L1 -> L2 -> L3 -> L4(min7 executor) -> L5(min7 sole aggregator) -> L6.
const {inputAdapter,buildResolver,WEAPON_TYPES}=require('./min2-contract.cjs');
const {createPipeline:engine}=require('./engine.cjs');
const cp=x=>structuredClone(x);
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const semantic=x=>JSON.stringify(stable(x));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const value=(d,name)=>{if(d?.status!=='known'||typeof d.value!=='number'||!Number.isFinite(d.value))throw Error('UNRESOLVED_BASE_'+name);return d.value};
const invalid=r=>({status:'unavailable',reason:r});
function createPipeline({versions,openDataSnapshot,resolveBuild,resolveEffects,readTechnique,initialState,handlers={},formulae={}}){
 if(typeof openDataSnapshot!=='function')throw Error('IMMUTABLE_SNAPSHOT_PROVIDER_REQUIRED');
 const deps={versions,handlers,formulae,initialState,
   openDataSnapshot:pinned=>{
    const snapshot=openDataSnapshot(cp(pinned));
    if(!snapshot || !snapshot.versions || semantic(snapshot.versions)!==semantic(pinned))throw Error('SNAPSHOT_INVALID');
    for(const name of ['resolveBuild','resolveEffects','readTechnique'])if(typeof snapshot[name]!=='function')throw Error('SNAPSHOT_READER_MISSING_'+name);
    return {
      versions:cp(snapshot.versions),
      readTechnique:(id,version,game)=>snapshot.readTechnique(id,version,game),
      resolveBuild:(raw,db,game)=>{
       const request=raw.__request; if(!request)throw Error('L1_REQUEST_NOT_BOUND');
       const resolved=buildResolver(request,(s)=>snapshot.resolveBuild(s,db,game,cp(request)));
       if(resolved.dbVersion!==db)throw Error('EQUIPMENT_DB_VERSION_MISMATCH');
       if(!WEAPON_TYPES.includes(resolved.weaponType))throw Error('WEAPON_KIND_INVALID');
       return {weaponType:resolved.weaponType,elementType:resolved.elementType??resolved.equipment.elementType,trueAttack:value(resolved.equipment.trueAttack,'trueAttack'),element:value(resolved.equipment.displayElement,'displayElement'),affinity:value(resolved.equipment.baseAffinity,'baseAffinity'),equipment:cp(resolved.equipment),skills:cp(resolved.skills),weaponState:cp(resolved.extensions||{}),diagnostics:cp(resolved.issues||[]),source:resolved.source};
      },
      resolveEffects:(build,conditions,ch,version)=>{
       // L3: preserve semantic stage/unit and deferred state predicates; no common effect calculations here.
       const found=snapshot.resolveEffects(cp(build),cp(conditions),ch,version);
       if(!Array.isArray(found))throw Error('L3_EFFECT_LIST_INVALID');
       return found.map(e=>{
        if(!e || typeof e.id!=='string'||typeof e.target!=='string'||typeof e.stage!=='string'||typeof e.unit!=='string'||typeof e.source!=='string')throw Error('L3_EFFECT_SCHEMA_INVALID');
        if(!Number.isInteger(e.order)||!['add','multiply','cap'].includes(e.operation)||typeof e.amount!=='number'||!Number.isFinite(e.amount))throw Error('L3_EFFECT_VALUE_INVALID');
        if(!e.condition || !['always','state-equals','target-equals','event-equals'].includes(e.condition.type))throw Error('L3_CONDITION_INVALID');
        if(e.condition.type!=='always' && (!Object.hasOwn(e.condition,'value') || (e.condition.path===undefined ? (typeof e.condition.key!=='string'||!e.condition.key) : (!Array.isArray(e.condition.path)||!e.condition.path.length||e.condition.path.some(k=>(typeof k!=='string'||!k)&&!Number.isInteger(k))))))throw Error('L3_CONDITION_SCHEMA_INVALID');
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
  let session,sessionError;
  try{session=runner.session();session.prepare([...(ea?[]:[aa]),...(eb?[]:[bb])]);}
  catch(e){sessionError=e;}
  const ra=ea?failure(ea):sessionError?failure(sessionError):runner.safeEvaluate(aa,session);
  const rb=eb?failure(eb):sessionError?failure(sessionError):runner.safeEvaluate(bb,session);
  const sameBuildContext=ra.status==='OK'&&rb.status==='OK'&&ra.weaponType===rb.weaponType;
  const comparable=sameBuildContext&&ra.comparisonContext?.damage===rb.comparisonContext?.damage;
  const relative={};
  for(const ch of ['normal','maximum']){
    relative[ch]={};
    for(const metric of ['comboTotalDamage','comboDps']){
      const context=metric==='comboDps'?'dps':'damage';
      const metricComparable=sameBuildContext&&ra.comparisonContext?.[context]===rb.comparisonContext?.[context];
      const base=ra.channels.normal.metrics[metric];
      const x=ra.channels[ch].metrics[metric],y=rb.channels[ch].metrics[metric];
      relative[ch][metric]=!metricComparable?invalid('NOT_COMPARABLE')
        :base?.status!=='available'||base.value===0||x?.status!=='available'||y?.status!=='available'?invalid('METRIC_UNAVAILABLE')
        :(!finite(100*x.value/base.value)||!finite(100*y.value/base.value)?invalid('RELATIVE_NON_FINITE'):{status:'available',value:{a:100*x.value/base.value,b:100*y.value/base.value,reference:'A_NORMAL'}});
    }
  }
  return {a:ra,b:rb,relative,comparable};
 }
 return Object.freeze({evaluate,safeEvaluate,compare,present:source=>({displayMode:'single',result:safeEvaluate(source)})});
}
module.exports={createPipeline};

});
define("./pipeline.cjs",function(module,exports,require){
'use strict';
// Single public entry point: L1 -> L2 -> L3 -> L4(min7 executor) -> L5(min7 sole aggregator) -> L6.
const {inputAdapter,buildResolver,WEAPON_TYPES}=require('./min2-contract.cjs');
const {createPipeline:engine}=require('./engine.cjs');
const cp=x=>structuredClone(x);
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const semantic=x=>JSON.stringify(stable(x));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const value=(d,name)=>{if(d?.status!=='known'||typeof d.value!=='number'||!Number.isFinite(d.value))throw Error('UNRESOLVED_BASE_'+name);return d.value};
const invalid=r=>({status:'unavailable',reason:r});
function createPipeline({versions,openDataSnapshot,resolveBuild,resolveEffects,readTechnique,initialState,handlers={},formulae={}}){
 if(typeof openDataSnapshot!=='function')throw Error('IMMUTABLE_SNAPSHOT_PROVIDER_REQUIRED');
 const deps={versions,handlers,formulae,initialState,
   openDataSnapshot:pinned=>{
    const snapshot=openDataSnapshot(cp(pinned));
    if(!snapshot || !snapshot.versions || semantic(snapshot.versions)!==semantic(pinned))throw Error('SNAPSHOT_INVALID');
    for(const name of ['resolveBuild','resolveEffects','readTechnique'])if(typeof snapshot[name]!=='function')throw Error('SNAPSHOT_READER_MISSING_'+name);
    return {
      versions:cp(snapshot.versions),
      readTechnique:(id,version,game)=>snapshot.readTechnique(id,version,game),
      resolveBuild:(raw,db,game)=>{
       const request=raw.__request; if(!request)throw Error('L1_REQUEST_NOT_BOUND');
       const resolved=buildResolver(request,(s)=>snapshot.resolveBuild(s,db,game,cp(request)));
       if(resolved.dbVersion!==db)throw Error('EQUIPMENT_DB_VERSION_MISMATCH');
       if(!WEAPON_TYPES.includes(resolved.weaponType))throw Error('WEAPON_KIND_INVALID');
       return {weaponType:resolved.weaponType,elementType:resolved.elementType??resolved.equipment.elementType,trueAttack:value(resolved.equipment.trueAttack,'trueAttack'),element:value(resolved.equipment.displayElement,'displayElement'),affinity:value(resolved.equipment.baseAffinity,'baseAffinity'),equipment:cp(resolved.equipment),skills:cp(resolved.skills),weaponState:cp(resolved.extensions||{}),diagnostics:cp(resolved.issues||[]),source:resolved.source};
      },
      resolveEffects:(build,conditions,ch,version)=>{
       // L3: preserve semantic stage/unit and deferred state predicates; no common effect calculations here.
       const found=snapshot.resolveEffects(cp(build),cp(conditions),ch,version);
       if(!Array.isArray(found))throw Error('L3_EFFECT_LIST_INVALID');
       return found.map(e=>{
        if(!e || typeof e.id!=='string'||typeof e.target!=='string'||typeof e.stage!=='string'||typeof e.unit!=='string'||typeof e.source!=='string')throw Error('L3_EFFECT_SCHEMA_INVALID');
        if(!Number.isInteger(e.order)||!['add','multiply','cap'].includes(e.operation)||typeof e.amount!=='number'||!Number.isFinite(e.amount))throw Error('L3_EFFECT_VALUE_INVALID');
        if(!e.condition || !['always','state-equals','target-equals','event-equals'].includes(e.condition.type))throw Error('L3_CONDITION_INVALID');
        if(e.condition.type!=='always' && (!Object.hasOwn(e.condition,'value') || (e.condition.path===undefined ? (typeof e.condition.key!=='string'||!e.condition.key) : (!Array.isArray(e.condition.path)||!e.condition.path.length||e.condition.path.some(k=>(typeof k!=='string'||!k)&&!Number.isInteger(k))))))throw Error('L3_CONDITION_SCHEMA_INVALID');
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
  let session,sessionError;
  try{session=runner.session();session.prepare([...(ea?[]:[aa]),...(eb?[]:[bb])]);}
  catch(e){sessionError=e;}
  const ra=ea?failure(ea):sessionError?failure(sessionError):runner.safeEvaluate(aa,session);
  const rb=eb?failure(eb):sessionError?failure(sessionError):runner.safeEvaluate(bb,session);
  const sameBuildContext=ra.status==='OK'&&rb.status==='OK'&&ra.weaponType===rb.weaponType;
  const comparable=sameBuildContext&&ra.comparisonContext?.damage===rb.comparisonContext?.damage;
  const relative={};
  for(const ch of ['normal','maximum']){
    relative[ch]={};
    for(const metric of ['comboTotalDamage','comboDps']){
      const context=metric==='comboDps'?'dps':'damage';
      const metricComparable=sameBuildContext&&ra.comparisonContext?.[context]===rb.comparisonContext?.[context];
      const base=ra.channels.normal.metrics[metric];
      const x=ra.channels[ch].metrics[metric],y=rb.channels[ch].metrics[metric];
      relative[ch][metric]=!metricComparable?invalid('NOT_COMPARABLE')
        :base?.status!=='available'||base.value===0||x?.status!=='available'||y?.status!=='available'?invalid('METRIC_UNAVAILABLE')
        :(!finite(100*x.value/base.value)||!finite(100*y.value/base.value)?invalid('RELATIVE_NON_FINITE'):{status:'available',value:{a:100*x.value/base.value,b:100*y.value/base.value,reference:'A_NORMAL'}});
    }
  }
  return {a:ra,b:rb,relative,comparable};
 }
 return Object.freeze({evaluate,safeEvaluate,compare,present:source=>({displayMode:'single',result:safeEvaluate(source)})});
}
module.exports={createPipeline};

});
define("/immutable-provider.cjs",function(module,exports,require){
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

});
define("./immutable-provider.cjs",function(module,exports,require){
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

});
define("/real-technique-one-hit-adapter.cjs",function(module,exports,require){
'use strict';
// Narrow real-Technique-DB bridge candidate; intentionally NOT wired to production.
// Source of all normative values: caller's existing Technique DB record.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function adaptOrdinaryPhysicalHit({weaponType,techniqueId,record,dbVersion,elementContext,allowUnresolvedElement=false}={}){
  if(!weaponType||!techniqueId||!dbVersion)throw Error('REAL_SLICE:IDENTITY_REQUIRED');
  if(!record||record.techniqueId!==techniqueId||(record.weaponType!==undefined&&record.weaponType!==weaponType))throw Error('REAL_SLICE:DB_IDENTITY_MISMATCH');
  if(!Number.isInteger(record.revision)||record.revision<1)throw Error('REAL_SLICE:REVISION_REQUIRED');
  const shelling=Array.isArray(record.specialComponents)&&record.specialComponents.some(x=>String(x).includes('SHELL'));
  const reference=record.referenceKind==='bow'||record.referenceKind==='light-bowgun'||record.referenceKind==='heavy-bowgun'||record.referenceKind==='heavy-bowgun-element'||record.referenceKind==='light-bowgun-element'||record.referenceKind==='charge-blade-saed'||record.referenceKind==='hunting-horn-sound'||record.referenceKind==='heavy-bowgun-wyvern';
  if(shelling){
   const resource=record.shellingResource;
   if(resource&&(resource.id!=='GL_NORMAL_ROUNDS'||record.shellingAction!=='NORMAL'||!Number.isInteger(resource.amount)||resource.amount<=0||!resource.source))throw Error('REAL_SLICE:GL_RESOURCE_CONTRACT_INVALID');
   if(record.weaponType!=='gunlance'||record.numericStatus!=='SOURCE_CONFIRMED'||!record.specialSourceValues)throw Error('REAL_SLICE:SHELLING_SOURCE_PENDING');
   const source=record.evidenceRefs[0];
   return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events:[{type:'hit',components:[{id:techniqueId+':shelling:0',kind:'shelling',unit:'SHELLING',source,coefficient:1,parameters:Object.freeze({hitIndex:0,effectTargets:['physical'],effectStages:['attack'],sourceTechniqueId:techniqueId,sourceRecord:Object.freeze({...record}),shellingSource:record.specialSourceValues,shellingAction:record.shellingAction,shellingInput:record.shellingInput,shellingResource:resource||null})}]},...(resource?[{type:'consume',contract:resource.id,source:resource.source,resourcePath:['gunlance','loadedRounds'],amount:resource.amount}]:[])]});
  }
  if(reference){
   const saed=record.phialReference;
  const kan21=record.referenceKind==='charge-blade-saed'&&['CB_SAED','CB_SAED_AED_DERIVED'].includes(techniqueId)
   &&record.calculationScope==='SAED_SOURCE_REFERENCE_ONLY'&&record.evidenceRefs?.includes('KAN21_SAED_SOURCE')
   &&saed?.status==='PROVISIONALLY_ADOPTED'&&saed.sourceConfirmed===true&&saed.liveGameVerification==='PENDING'
   &&saed.approvalRefs?.includes('KAN-21#10057')&&saed.approvalRefs?.includes('KAN-21#10058')
   &&saed.source==='https://kuroyonhon.com/mhwilds/memo/12.php'
   &&saed.sourceVersion===(techniqueId==='CB_SAED'?'AFTER_VER_1_011':'VER_1_02_ONWARD')
   &&saed.hitPolicy==='FULL_STOCK_FULL_HIT'&&saed.hitCount===5&&saed.eventCount===5&&saed.capacitySkillIncreasesStock===false
   &&JSON.stringify(record.hits?.map(h=>[h.mv,h.elementModifier]))==='[[16,1],[78,1],[45,1]]'
   &&['normal','enhanced'].every(k=>finite(saed.powerElement?.[k])&&saed.powerElement[k]>0)
   &&finite(saed.shieldElementMultiplier)&&finite(saed.shieldPhysicalBodyMultiplier);
  const wyvern=weaponType==='heavy-bowgun'&&techniqueId==='HBG_WYVERN_AMMO'&&record.referenceKind==='heavy-bowgun-wyvern'&&record.wyvernRules?.adoptionStatus==='PROVISIONAL'&&record.sourceScope==='OWNER_FIXED_TWO_HIT_PROVISIONAL_MODEL'&&record.evidenceRefs?.includes('KAN23_OWNER_TWO_HIT_FIX_22_CONDITIONS')&&record.hits?.length===2;
  if(record.numericStatus&&record.numericStatus!=='SOURCE_CONFIRMED'&&!kan21&&!wyvern)throw Error('REAL_SLICE:REFERENCE_SOURCE_PENDING');
   const source=record.evidenceRefs?.[0];if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
   return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events:[{type:'hit',components:[{id:techniqueId+':reference:0',kind:'reference',unit:'REFERENCE',source,coefficient:1,parameters:Object.freeze({hitIndex:0,effectTargets:['physical','element'],effectStages:['attack','affinity','element'],sourceTechniqueId:techniqueId,sourceRecord:Object.freeze({...record}),referenceKind:record.referenceKind,referenceInput:record.referenceInput})}]}]});
  }
  if(!['VERIFIED','PARTIALLY_VERIFIED'].includes(record.verificationStatus))throw Error('REAL_SLICE:VERIFICATION_PENDING');
  if(!Array.isArray(record.evidenceRefs)||record.evidenceRefs.length===0)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  if(!Array.isArray(record.hits)||record.hits.length<1)throw Error('REAL_SLICE:HITS_REQUIRED');
  if((record.specialComponents?.length||0)>0)throw Error('REAL_SLICE:SPECIAL_ROUTE_PENDING');
  const provisionalHpOnly=record.techniqueId==='IG_ENHANCED_DIAGONAL_SLASH'&&record.hpOnlyProvisional==='IG_ENHANCED_DIAGONAL_SLASH_20261025'&&record.numericStatus==='SOURCE_CONFIRMED'&&record.verificationStatus==='PARTIALLY_VERIFIED'&&Array.isArray(record.hits)&&record.hits.length===2&&record.hits.every(hit=>finite(hit.mv)&&hit.mv>=0&&finite(hit.elementModifier)&&hit.elementModifier>=0)&&(!record.specialComponents||record.specialComponents.length===0);
  if(record.calculationStatus==='EVIDENCE_GATED'&&!provisionalHpOnly)throw Error('REAL_SLICE:EVIDENCE_GATED');
  const source=record.evidenceRefs[0];
  if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  const elementResolved=elementContext?.displayElement===0&&elementContext?.effectsResolved===true&&Array.isArray(elementContext.activeElementEffects)&&elementContext.activeElementEffects.length===0;
  const events=[],excludedElements=[];
  record.hits.forEach((hit,index)=>{
   if(!finite(hit.mv)||hit.mv<0||!finite(hit.elementModifier)||hit.elementModifier<0)throw Error('REAL_SLICE:HIT_FIELDS_PENDING:'+index);
   if(hit.elementModifier!==0&&!elementResolved&&!allowUnresolvedElement)throw Error('REAL_SLICE:ELEMENT_COMPONENT_PENDING:'+index);
   // Preserve the sourced part-durability modifier for provenance. The
   // canonical HP formula validates it but does not apply it to HP damage.
   const stateMetadata={resourceContract:record.resourceContract||null,stateRequirement:record.stateRequirement&&Object.keys(record.stateRequirement).length?Object.freeze({...record.stateRequirement}):null,damageStateTransition:record.damageStateTransition?Object.freeze({...record.damageStateTransition}):null,damageStatsState:hit.damageStatsState??record.damageStateTransition?.damageStatsState??(provisionalHpOnly?'TRIPLE_EXTRACT':null),adoption:provisionalHpOnly?Object.freeze({status:'OWNER_APPROVED_PROVISIONAL',approvedAt:'2026-10-25',scope:'HP_DAMAGE_ONLY',sourceGameVersion:record.baselineGameVersion??null,officialVersionAudit:record.currentVersionAudit??'PENDING',unresolvedReasons:Array.isArray(record.unresolvedReasons)?[...record.unresolvedReasons]:[]}):record.adoption||null};
   const partModifierKnown=finite(hit.partModifier);
   const components=[{id:techniqueId+':physical:'+index,kind:'physical',unit:'MV',source,coefficient:hit.mv,parameters:Object.freeze({partModifier:partModifierKnown?hit.partModifier:null,partModifierStatus:partModifierKnown?'RESOLVED':'UNRESOLVED',partModifierSource:hit.partModifierSource??source,shieldBoostAxeBody:record.shieldBoostAxeBody===true,elementModifier:hit.elementModifier,damageType:hit.damageType??null,hitIndex:index,...stateMetadata})}];
   if(hit.elementModifier>0)components.push({id:techniqueId+':element:'+index,kind:'element',unit:'ELEMENT_MODIFIER',source,coefficient:hit.elementModifier,parameters:Object.freeze({elementModifier:hit.elementModifier,elementSource:source,damageType:hit.damageType??null,hitIndex:index,...stateMetadata})});
   events.push({type:'hit',components});
   if(elementResolved&&hit.elementModifier!==0)excludedElements.push({coefficient:hit.elementModifier,source,reason:'CONFIRMED_ZERO_ELEMENT_NO_EFFECTS',hitIndex:index});
  });
  if(record.phialReference?.status==='OBSERVED'&&Number.isInteger(record.phialReference.hitCount)&&record.phialReference.hitCount>0){
   const phialTarget=record.phialState?.phialType==='POWER_ELEMENT'?'element':'physical';
   events[0].components.push({id:techniqueId+':phial:0',kind:'phial',unit:'PHIAL',source:record.phialReference.sourceRefs?.[0]??source,coefficient:1,parameters:Object.freeze({hitIndex:0,phialCount:record.phialReference.hitCount,phialReference:Object.freeze({...record.phialReference}),phialState:record.phialState?Object.freeze({...record.phialState}):null,excludedEffectIds:record.resourceContract?[record.resourceContract.rapidMorphEffectId]:[],effectTargets:[phialTarget],effectStages:[phialTarget==='element'?'element':'attack'],sourceTechniqueId:techniqueId})});
  }
  if(record.resourceContract){
   const r=record.resourceContract;
   if(weaponType!=='charge-blade'||techniqueId!=='CB_ELEMENT_DISCHARGE_1'||r.id!=='CB_ED1_NORMAL_RESOURCE'||r.status!=='OWNER_APPROVED'||!Number.isInteger(r.consumeNormalPhials)||r.consumeNormalPhials<=0)throw Error('REAL_SLICE:CB_ED1_RESOURCE_CONTRACT_INVALID');
   events.push({type:'consume',contract:r.id,source:r.source,resourcePath:['chargeBlade','normalPhials'],amount:r.consumeNormalPhials});
   events.push({type:'transition',contract:r.id,source:r.source,operations:[{op:'set',path:['chargeBlade','previousAction'],value:techniqueId}]});
  }
  return Object.freeze({
    id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',
    elementModifier:record.hits.map(hit=>hit.elementModifier),
    excludedElement:excludedElements.length?excludedElements:null,
    events,
    adoption:provisionalHpOnly?Object.freeze({status:'OWNER_APPROVED_PROVISIONAL',approvedAt:'2026-10-25',scope:'HP_DAMAGE_ONLY',sourceGameVersion:record.baselineGameVersion??null,officialVersionAudit:record.currentVersionAudit??'PENDING',unresolvedReasons:Array.isArray(record.unresolvedReasons)?[...record.unresolvedReasons]:[]}):record.adoption||null
  });
}
module.exports={adaptOrdinaryPhysicalHit};

});
define("./real-technique-one-hit-adapter.cjs",function(module,exports,require){
'use strict';
// Narrow real-Technique-DB bridge candidate; intentionally NOT wired to production.
// Source of all normative values: caller's existing Technique DB record.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function adaptOrdinaryPhysicalHit({weaponType,techniqueId,record,dbVersion,elementContext,allowUnresolvedElement=false}={}){
  if(!weaponType||!techniqueId||!dbVersion)throw Error('REAL_SLICE:IDENTITY_REQUIRED');
  if(!record||record.techniqueId!==techniqueId||(record.weaponType!==undefined&&record.weaponType!==weaponType))throw Error('REAL_SLICE:DB_IDENTITY_MISMATCH');
  if(!Number.isInteger(record.revision)||record.revision<1)throw Error('REAL_SLICE:REVISION_REQUIRED');
  const shelling=Array.isArray(record.specialComponents)&&record.specialComponents.some(x=>String(x).includes('SHELL'));
  const reference=record.referenceKind==='bow'||record.referenceKind==='light-bowgun'||record.referenceKind==='heavy-bowgun'||record.referenceKind==='heavy-bowgun-element'||record.referenceKind==='light-bowgun-element'||record.referenceKind==='charge-blade-saed'||record.referenceKind==='hunting-horn-sound'||record.referenceKind==='heavy-bowgun-wyvern';
  if(shelling){
   const resource=record.shellingResource;
   if(resource&&(resource.id!=='GL_NORMAL_ROUNDS'||record.shellingAction!=='NORMAL'||!Number.isInteger(resource.amount)||resource.amount<=0||!resource.source))throw Error('REAL_SLICE:GL_RESOURCE_CONTRACT_INVALID');
   if(record.weaponType!=='gunlance'||record.numericStatus!=='SOURCE_CONFIRMED'||!record.specialSourceValues)throw Error('REAL_SLICE:SHELLING_SOURCE_PENDING');
   const source=record.evidenceRefs[0];
   return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events:[{type:'hit',components:[{id:techniqueId+':shelling:0',kind:'shelling',unit:'SHELLING',source,coefficient:1,parameters:Object.freeze({hitIndex:0,effectTargets:['physical'],effectStages:['attack'],sourceTechniqueId:techniqueId,sourceRecord:Object.freeze({...record}),shellingSource:record.specialSourceValues,shellingAction:record.shellingAction,shellingInput:record.shellingInput,shellingResource:resource||null})}]},...(resource?[{type:'consume',contract:resource.id,source:resource.source,resourcePath:['gunlance','loadedRounds'],amount:resource.amount}]:[])]});
  }
  if(reference){
   const saed=record.phialReference;
  const kan21=record.referenceKind==='charge-blade-saed'&&['CB_SAED','CB_SAED_AED_DERIVED'].includes(techniqueId)
   &&record.calculationScope==='SAED_SOURCE_REFERENCE_ONLY'&&record.evidenceRefs?.includes('KAN21_SAED_SOURCE')
   &&saed?.status==='PROVISIONALLY_ADOPTED'&&saed.sourceConfirmed===true&&saed.liveGameVerification==='PENDING'
   &&saed.approvalRefs?.includes('KAN-21#10057')&&saed.approvalRefs?.includes('KAN-21#10058')
   &&saed.source==='https://kuroyonhon.com/mhwilds/memo/12.php'
   &&saed.sourceVersion===(techniqueId==='CB_SAED'?'AFTER_VER_1_011':'VER_1_02_ONWARD')
   &&saed.hitPolicy==='FULL_STOCK_FULL_HIT'&&saed.hitCount===5&&saed.eventCount===5&&saed.capacitySkillIncreasesStock===false
   &&JSON.stringify(record.hits?.map(h=>[h.mv,h.elementModifier]))==='[[16,1],[78,1],[45,1]]'
   &&['normal','enhanced'].every(k=>finite(saed.powerElement?.[k])&&saed.powerElement[k]>0)
   &&finite(saed.shieldElementMultiplier)&&finite(saed.shieldPhysicalBodyMultiplier);
  const wyvern=weaponType==='heavy-bowgun'&&techniqueId==='HBG_WYVERN_AMMO'&&record.referenceKind==='heavy-bowgun-wyvern'&&record.wyvernRules?.adoptionStatus==='PROVISIONAL'&&record.sourceScope==='OWNER_FIXED_TWO_HIT_PROVISIONAL_MODEL'&&record.evidenceRefs?.includes('KAN23_OWNER_TWO_HIT_FIX_22_CONDITIONS')&&record.hits?.length===2;
  if(record.numericStatus&&record.numericStatus!=='SOURCE_CONFIRMED'&&!kan21&&!wyvern)throw Error('REAL_SLICE:REFERENCE_SOURCE_PENDING');
   const source=record.evidenceRefs?.[0];if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
   return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events:[{type:'hit',components:[{id:techniqueId+':reference:0',kind:'reference',unit:'REFERENCE',source,coefficient:1,parameters:Object.freeze({hitIndex:0,effectTargets:['physical','element'],effectStages:['attack','affinity','element'],sourceTechniqueId:techniqueId,sourceRecord:Object.freeze({...record}),referenceKind:record.referenceKind,referenceInput:record.referenceInput})}]}]});
  }
  if(!['VERIFIED','PARTIALLY_VERIFIED'].includes(record.verificationStatus))throw Error('REAL_SLICE:VERIFICATION_PENDING');
  if(!Array.isArray(record.evidenceRefs)||record.evidenceRefs.length===0)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  if(!Array.isArray(record.hits)||record.hits.length<1)throw Error('REAL_SLICE:HITS_REQUIRED');
  if((record.specialComponents?.length||0)>0)throw Error('REAL_SLICE:SPECIAL_ROUTE_PENDING');
  const provisionalHpOnly=record.techniqueId==='IG_ENHANCED_DIAGONAL_SLASH'&&record.hpOnlyProvisional==='IG_ENHANCED_DIAGONAL_SLASH_20261025'&&record.numericStatus==='SOURCE_CONFIRMED'&&record.verificationStatus==='PARTIALLY_VERIFIED'&&Array.isArray(record.hits)&&record.hits.length===2&&record.hits.every(hit=>finite(hit.mv)&&hit.mv>=0&&finite(hit.elementModifier)&&hit.elementModifier>=0)&&(!record.specialComponents||record.specialComponents.length===0);
  if(record.calculationStatus==='EVIDENCE_GATED'&&!provisionalHpOnly)throw Error('REAL_SLICE:EVIDENCE_GATED');
  const source=record.evidenceRefs[0];
  if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  const elementResolved=elementContext?.displayElement===0&&elementContext?.effectsResolved===true&&Array.isArray(elementContext.activeElementEffects)&&elementContext.activeElementEffects.length===0;
  const events=[],excludedElements=[];
  record.hits.forEach((hit,index)=>{
   if(!finite(hit.mv)||hit.mv<0||!finite(hit.elementModifier)||hit.elementModifier<0)throw Error('REAL_SLICE:HIT_FIELDS_PENDING:'+index);
   if(hit.elementModifier!==0&&!elementResolved&&!allowUnresolvedElement)throw Error('REAL_SLICE:ELEMENT_COMPONENT_PENDING:'+index);
   // Preserve the sourced part-durability modifier for provenance. The
   // canonical HP formula validates it but does not apply it to HP damage.
   const stateMetadata={resourceContract:record.resourceContract||null,stateRequirement:record.stateRequirement&&Object.keys(record.stateRequirement).length?Object.freeze({...record.stateRequirement}):null,damageStateTransition:record.damageStateTransition?Object.freeze({...record.damageStateTransition}):null,damageStatsState:hit.damageStatsState??record.damageStateTransition?.damageStatsState??(provisionalHpOnly?'TRIPLE_EXTRACT':null),adoption:provisionalHpOnly?Object.freeze({status:'OWNER_APPROVED_PROVISIONAL',approvedAt:'2026-10-25',scope:'HP_DAMAGE_ONLY',sourceGameVersion:record.baselineGameVersion??null,officialVersionAudit:record.currentVersionAudit??'PENDING',unresolvedReasons:Array.isArray(record.unresolvedReasons)?[...record.unresolvedReasons]:[]}):record.adoption||null};
   const partModifierKnown=finite(hit.partModifier);
   const components=[{id:techniqueId+':physical:'+index,kind:'physical',unit:'MV',source,coefficient:hit.mv,parameters:Object.freeze({partModifier:partModifierKnown?hit.partModifier:null,partModifierStatus:partModifierKnown?'RESOLVED':'UNRESOLVED',partModifierSource:hit.partModifierSource??source,shieldBoostAxeBody:record.shieldBoostAxeBody===true,elementModifier:hit.elementModifier,damageType:hit.damageType??null,hitIndex:index,...stateMetadata})}];
   if(hit.elementModifier>0)components.push({id:techniqueId+':element:'+index,kind:'element',unit:'ELEMENT_MODIFIER',source,coefficient:hit.elementModifier,parameters:Object.freeze({elementModifier:hit.elementModifier,elementSource:source,damageType:hit.damageType??null,hitIndex:index,...stateMetadata})});
   events.push({type:'hit',components});
   if(elementResolved&&hit.elementModifier!==0)excludedElements.push({coefficient:hit.elementModifier,source,reason:'CONFIRMED_ZERO_ELEMENT_NO_EFFECTS',hitIndex:index});
  });
  if(record.phialReference?.status==='OBSERVED'&&Number.isInteger(record.phialReference.hitCount)&&record.phialReference.hitCount>0){
   const phialTarget=record.phialState?.phialType==='POWER_ELEMENT'?'element':'physical';
   events[0].components.push({id:techniqueId+':phial:0',kind:'phial',unit:'PHIAL',source:record.phialReference.sourceRefs?.[0]??source,coefficient:1,parameters:Object.freeze({hitIndex:0,phialCount:record.phialReference.hitCount,phialReference:Object.freeze({...record.phialReference}),phialState:record.phialState?Object.freeze({...record.phialState}):null,excludedEffectIds:record.resourceContract?[record.resourceContract.rapidMorphEffectId]:[],effectTargets:[phialTarget],effectStages:[phialTarget==='element'?'element':'attack'],sourceTechniqueId:techniqueId})});
  }
  if(record.resourceContract){
   const r=record.resourceContract;
   if(weaponType!=='charge-blade'||techniqueId!=='CB_ELEMENT_DISCHARGE_1'||r.id!=='CB_ED1_NORMAL_RESOURCE'||r.status!=='OWNER_APPROVED'||!Number.isInteger(r.consumeNormalPhials)||r.consumeNormalPhials<=0)throw Error('REAL_SLICE:CB_ED1_RESOURCE_CONTRACT_INVALID');
   events.push({type:'consume',contract:r.id,source:r.source,resourcePath:['chargeBlade','normalPhials'],amount:r.consumeNormalPhials});
   events.push({type:'transition',contract:r.id,source:r.source,operations:[{op:'set',path:['chargeBlade','previousAction'],value:techniqueId}]});
  }
  return Object.freeze({
    id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',
    elementModifier:record.hits.map(hit=>hit.elementModifier),
    excludedElement:excludedElements.length?excludedElements:null,
    events,
    adoption:provisionalHpOnly?Object.freeze({status:'OWNER_APPROVED_PROVISIONAL',approvedAt:'2026-10-25',scope:'HP_DAMAGE_ONLY',sourceGameVersion:record.baselineGameVersion??null,officialVersionAudit:record.currentVersionAudit??'PENDING',unresolvedReasons:Array.isArray(record.unresolvedReasons)?[...record.unresolvedReasons]:[]}):record.adoption||null
  });
}
module.exports={adaptOrdinaryPhysicalHit};

});
define("/sourced-physical-formula.cjs",function(module,exports,require){
'use strict';
// Physical damage adapter: delegates game arithmetic to the existing canonical formula.
// No MV, sharpness multiplier, hitzone or game constants are embedded here.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const unavailable=reason=>({status:'unavailable',reason});
function createSourcedPhysicalFormula({calculate,resolveSharpness,resolveHitzone,resolvePartModifier,expectedGameVersion}={}){
 if(typeof calculate!=='function'||typeof resolveSharpness!=='function'||typeof resolveHitzone!=='function'||typeof resolvePartModifier!=='function')throw Error('PHYSICAL_SOURCE_RESOLVERS_REQUIRED');
 return function physical({coefficient,coefficientUnit,parameters,target,stats,build,state}={}){
  if(coefficientUnit!=='MV'||!finite(coefficient)||coefficient<0)return unavailable('PHYSICAL_MV_UNRESOLVED');
  if(!finite(stats?.attack)||stats.attack<=0)return unavailable('PHYSICAL_ATTACK_UNRESOLVED');
  if(!finite(stats.element)||stats.element<0)return unavailable('PHYSICAL_ELEMENT_UNRESOLVED');
  if(!finite(stats.affinity))return unavailable('PHYSICAL_AFFINITY_UNRESOLVED');
  if(!expectedGameVersion||typeof expectedGameVersion!=='string')return unavailable('PHYSICAL_VERSION_UNRESOLVED');
  let sharp,hitzone,part=null;
  try{
   sharp=resolveSharpness({build,state,gameVersion:expectedGameVersion});
   hitzone=resolveHitzone({target,state,parameters,gameVersion:expectedGameVersion});
   if(parameters?.partModifier!==null&&parameters?.partModifier!==undefined)part=resolvePartModifier({parameters,build,state,gameVersion:expectedGameVersion});
  }catch(_){return unavailable('PHYSICAL_CONTEXT_RESOLUTION_FAILED')}
  const valid=(x)=>x&&x.gameVersion===expectedGameVersion&&typeof x.evidenceRef==='string'&&x.evidenceRef.length>0&&finite(x.value);
  if(!valid(sharp)||sharp.value<=0)return unavailable('PHYSICAL_SHARPNESS_UNRESOLVED');
  if(!valid(hitzone)||hitzone.value<0||hitzone.value>100)return unavailable('PHYSICAL_HITZONE_UNRESOLVED');
  // partModifier is retained as sourced technique metadata, but the existing
  // HP formula does not apply the part-durability modifier to HP damage.
  // Require a resolved, version-matched value and deliberately leave it out
  // of the canonical HP calculation.
  if(part&&!valid(part))return unavailable('PHYSICAL_PART_MODIFIER_UNRESOLVED');
  let result;
   const shieldState=build?.equipment?.chargeBladeState;
   const shieldBodyMultiplier=parameters?.shieldBoostAxeBody===true&&shieldState?.shieldBoosted===true?(finite(shieldState.shieldBoostAxeBodyMultiplier)?shieldState.shieldBoostAxeBodyMultiplier:null):1;
   if(shieldBodyMultiplier===null)return unavailable('PHYSICAL_SHIELD_BODY_MULTIPLIER_UNRESOLVED');
   try{result=calculate({attack:stats.attack*shieldBodyMultiplier,affinity:stats.affinity,element:0,mv:coefficient,hz:hitzone.value,ehz:0,sharp:sharp.value,esharp:1,critBonus:Number(build?.equipment?.criticalBoostLevel)||0,elementCrit:false,criticalState:'expected'})}
  catch(_){return unavailable('PHYSICAL_CANONICAL_FORMULA_FAILED')}
  if(!result||!finite(result.p)||result.p<0)return unavailable('PHYSICAL_CANONICAL_RESULT_INVALID');
  return {status:'available',value:result.p};
 }
}
function createSourcedElementalFormula({calculate,resolveElementSharpness,resolveHitzone,expectedGameVersion}={}){
 if(typeof calculate!=='function'||typeof resolveElementSharpness!=='function'||typeof resolveHitzone!=='function')throw Error('ELEMENT_SOURCE_RESOLVERS_REQUIRED');
 return function elemental({coefficient,coefficientUnit,target,parameters,stats,build,state}={}){
  if(coefficientUnit!=='ELEMENT_MODIFIER'||!finite(coefficient)||coefficient<0)return unavailable('ELEMENT_MODIFIER_UNRESOLVED');
  if(!finite(stats?.element)||stats.element<0)return unavailable('ELEMENT_VALUE_UNRESOLVED');
  if(!finite(stats?.affinity))return unavailable('ELEMENT_AFFINITY_UNRESOLVED');
  if(!expectedGameVersion)return unavailable('ELEMENT_VERSION_UNRESOLVED');
  let sharp,hitzone;
  try{sharp=resolveElementSharpness({build,state,gameVersion:expectedGameVersion});hitzone=resolveHitzone({target,state,parameters,gameVersion:expectedGameVersion});}
  catch(_){return unavailable('ELEMENT_CONTEXT_RESOLUTION_FAILED')}
  const valid=x=>x&&x.gameVersion===expectedGameVersion&&typeof x.evidenceRef==='string'&&x.evidenceRef.length>0&&finite(x.value);
  if(!valid(sharp)||sharp.value<=0)return unavailable('ELEMENT_SHARPNESS_UNRESOLVED');
  if(!valid(hitzone)||hitzone.value<0||hitzone.value>100)return unavailable('ELEMENT_HITZONE_UNRESOLVED');
  let result;
  const criticalElementLevel=Number(build?.equipment?.criticalElementLevel)||0;
  try{result=calculate({attack:0,affinity:stats.affinity,element:stats.element*coefficient,elementKnown:true,typeKnown:true,elementType:build.elementType||build.equipment?.elementType||'none',mv:0,hz:0,ehz:hitzone.value,sharp:1,esharp:sharp.value,critBonus:0,elementCrit:criticalElementLevel>0,criticalState:'expected'});}
  catch(_){return unavailable('ELEMENT_CANONICAL_FORMULA_FAILED')}
  if(!result||!finite(result.e)||result.e<0)return unavailable('ELEMENT_CANONICAL_RESULT_INVALID');
  return {status:'available',value:result.e};
 };
}
module.exports={createSourcedPhysicalFormula,createSourcedElementalFormula};

});
define("./sourced-physical-formula.cjs",function(module,exports,require){
'use strict';
// Physical damage adapter: delegates game arithmetic to the existing canonical formula.
// No MV, sharpness multiplier, hitzone or game constants are embedded here.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const unavailable=reason=>({status:'unavailable',reason});
function createSourcedPhysicalFormula({calculate,resolveSharpness,resolveHitzone,resolvePartModifier,expectedGameVersion}={}){
 if(typeof calculate!=='function'||typeof resolveSharpness!=='function'||typeof resolveHitzone!=='function'||typeof resolvePartModifier!=='function')throw Error('PHYSICAL_SOURCE_RESOLVERS_REQUIRED');
 return function physical({coefficient,coefficientUnit,parameters,target,stats,build,state}={}){
  if(coefficientUnit!=='MV'||!finite(coefficient)||coefficient<0)return unavailable('PHYSICAL_MV_UNRESOLVED');
  if(!finite(stats?.attack)||stats.attack<=0)return unavailable('PHYSICAL_ATTACK_UNRESOLVED');
  if(!finite(stats.element)||stats.element<0)return unavailable('PHYSICAL_ELEMENT_UNRESOLVED');
  if(!finite(stats.affinity))return unavailable('PHYSICAL_AFFINITY_UNRESOLVED');
  if(!expectedGameVersion||typeof expectedGameVersion!=='string')return unavailable('PHYSICAL_VERSION_UNRESOLVED');
  let sharp,hitzone,part=null;
  try{
   sharp=resolveSharpness({build,state,gameVersion:expectedGameVersion});
   hitzone=resolveHitzone({target,state,parameters,gameVersion:expectedGameVersion});
   if(parameters?.partModifier!==null&&parameters?.partModifier!==undefined)part=resolvePartModifier({parameters,build,state,gameVersion:expectedGameVersion});
  }catch(_){return unavailable('PHYSICAL_CONTEXT_RESOLUTION_FAILED')}
  const valid=(x)=>x&&x.gameVersion===expectedGameVersion&&typeof x.evidenceRef==='string'&&x.evidenceRef.length>0&&finite(x.value);
  if(!valid(sharp)||sharp.value<=0)return unavailable('PHYSICAL_SHARPNESS_UNRESOLVED');
  if(!valid(hitzone)||hitzone.value<0||hitzone.value>100)return unavailable('PHYSICAL_HITZONE_UNRESOLVED');
  // partModifier is retained as sourced technique metadata, but the existing
  // HP formula does not apply the part-durability modifier to HP damage.
  // Require a resolved, version-matched value and deliberately leave it out
  // of the canonical HP calculation.
  if(part&&!valid(part))return unavailable('PHYSICAL_PART_MODIFIER_UNRESOLVED');
  let result;
   const shieldState=build?.equipment?.chargeBladeState;
   const shieldBodyMultiplier=parameters?.shieldBoostAxeBody===true&&shieldState?.shieldBoosted===true?(finite(shieldState.shieldBoostAxeBodyMultiplier)?shieldState.shieldBoostAxeBodyMultiplier:null):1;
   if(shieldBodyMultiplier===null)return unavailable('PHYSICAL_SHIELD_BODY_MULTIPLIER_UNRESOLVED');
   try{result=calculate({attack:stats.attack*shieldBodyMultiplier,affinity:stats.affinity,element:0,mv:coefficient,hz:hitzone.value,ehz:0,sharp:sharp.value,esharp:1,critBonus:Number(build?.equipment?.criticalBoostLevel)||0,elementCrit:false,criticalState:'expected'})}
  catch(_){return unavailable('PHYSICAL_CANONICAL_FORMULA_FAILED')}
  if(!result||!finite(result.p)||result.p<0)return unavailable('PHYSICAL_CANONICAL_RESULT_INVALID');
  return {status:'available',value:result.p};
 }
}
function createSourcedElementalFormula({calculate,resolveElementSharpness,resolveHitzone,expectedGameVersion}={}){
 if(typeof calculate!=='function'||typeof resolveElementSharpness!=='function'||typeof resolveHitzone!=='function')throw Error('ELEMENT_SOURCE_RESOLVERS_REQUIRED');
 return function elemental({coefficient,coefficientUnit,target,parameters,stats,build,state}={}){
  if(coefficientUnit!=='ELEMENT_MODIFIER'||!finite(coefficient)||coefficient<0)return unavailable('ELEMENT_MODIFIER_UNRESOLVED');
  if(!finite(stats?.element)||stats.element<0)return unavailable('ELEMENT_VALUE_UNRESOLVED');
  if(!finite(stats?.affinity))return unavailable('ELEMENT_AFFINITY_UNRESOLVED');
  if(!expectedGameVersion)return unavailable('ELEMENT_VERSION_UNRESOLVED');
  let sharp,hitzone;
  try{sharp=resolveElementSharpness({build,state,gameVersion:expectedGameVersion});hitzone=resolveHitzone({target,state,parameters,gameVersion:expectedGameVersion});}
  catch(_){return unavailable('ELEMENT_CONTEXT_RESOLUTION_FAILED')}
  const valid=x=>x&&x.gameVersion===expectedGameVersion&&typeof x.evidenceRef==='string'&&x.evidenceRef.length>0&&finite(x.value);
  if(!valid(sharp)||sharp.value<=0)return unavailable('ELEMENT_SHARPNESS_UNRESOLVED');
  if(!valid(hitzone)||hitzone.value<0||hitzone.value>100)return unavailable('ELEMENT_HITZONE_UNRESOLVED');
  let result;
  const criticalElementLevel=Number(build?.equipment?.criticalElementLevel)||0;
  try{result=calculate({attack:0,affinity:stats.affinity,element:stats.element*coefficient,elementKnown:true,typeKnown:true,elementType:build.elementType||build.equipment?.elementType||'none',mv:0,hz:0,ehz:hitzone.value,sharp:1,esharp:sharp.value,critBonus:0,elementCrit:criticalElementLevel>0,criticalState:'expected'});}
  catch(_){return unavailable('ELEMENT_CANONICAL_FORMULA_FAILED')}
  if(!result||!finite(result.e)||result.e<0)return unavailable('ELEMENT_CANONICAL_RESULT_INVALID');
  return {status:'available',value:result.e};
 };
}
module.exports={createSourcedPhysicalFormula,createSourcedElementalFormula};

});
define("/real-one-hit-pipeline.cjs",function(module,exports,require){
'use strict';
// Isolated real-DB entry candidate. Does not modify production HTML or define game damage numbers.
// Atomic source.capture must return equipment, effects and raw Technique DB in one immutable version bundle.
const {createImmutableProvider}=require('./immutable-provider.cjs');
const {createPipeline}=require('./pipeline.cjs');
const {adaptOrdinaryPhysicalHit}=require('./real-technique-one-hit-adapter.cjs');
const {createSourcedPhysicalFormula,createSourcedElementalFormula}=require('./sourced-physical-formula.cjs');
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function createRealOneHitPipeline({versions,source,resolveBuild,resolveEffects,resolveSkillApplicability,initialState,formulae,canonicalPhysical,shellingFormula,referenceFormula,phialFormula,weaponType='hammer',techniqueId='HAM_SIDE_SWING',techniqueIds=null}){
 if(typeof source?.capture!=='function')throw Error('REAL_SLICE:ATOMIC_CAPTURE_REQUIRED');
 const physical=canonicalPhysical?createSourcedPhysicalFormula(canonicalPhysical):formulae?.physical;
 const elemental=canonicalPhysical&&typeof canonicalPhysical.resolveElementSharpness==='function'&&typeof canonicalPhysical.resolveElementHitzone==='function'?createSourcedElementalFormula({...canonicalPhysical,resolveElementSharpness:canonicalPhysical.resolveElementSharpness,resolveHitzone:canonicalPhysical.resolveElementHitzone}):formulae?.element;
 if(typeof physical!=='function')throw Error('REAL_SLICE:PHYSICAL_FORMULA_REQUIRED');
 if(canonicalPhysical?.expectedGameVersion!==undefined && canonicalPhysical.expectedGameVersion!==versions?.game)throw Error('REAL_SLICE:GAME_VERSION_MISMATCH');
 if(typeof resolveBuild!=='function'||typeof resolveEffects!=='function'||typeof initialState!=='function')throw Error('REAL_SLICE:RESOLVERS_REQUIRED');
 // The pinned technique is independent of A/B builds; the physical-only disposition is
 // checked against every build and each channel, rather than cached from one build.
 const selectedTechniqueIds=Array.isArray(techniqueIds)&&techniqueIds.length?techniqueIds:[techniqueId];
 const uniqueTechniqueIds=[...new Set(selectedTechniqueIds)];
 const openDataSnapshot=createImmutableProvider({
  capture:pinned=>{
   const image=source.capture(pinned);
   if(!image?.techniques)throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND');
   const techniques={};
   for(const id of uniqueTechniqueIds){
    if(!own(image.techniques,id))throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND:'+id);
    const record=image.techniques[id];
    // The element-disposition proof belongs to L2/L3 and must not be fabricated during capture.
    techniques[id]=adaptOrdinaryPhysicalHit({weaponType,techniqueId:id,record,dbVersion:pinned.technique,allowUnresolvedElement:true});
   }
   return {...image,techniques};
  },
  resolveBuild:(raw,equipment,request)=>{
   const result=resolveBuild(raw,equipment,request);
   if(result?.weaponType!==weaponType)throw Error('REAL_SLICE:WEAPON_MISMATCH');
   if(result&&result.elementType===undefined&&result.equipment?.elementType!==undefined)result.elementType=result.equipment.elementType;
   if(result?.equipment?.displayElement?.status!=='known'||!Number.isFinite(result.equipment.displayElement.value)||result.equipment.displayElement.value<0)throw Error('REAL_SLICE:ELEMENT_NOT_RESOLVED');
   if(result.equipment.displayElement.value>0&&(!result.equipment.elementType||typeof result.equipment.elementType!=='string'))throw Error('REAL_SLICE:ELEMENT_TYPE_NOT_RESOLVED');
   if(!Array.isArray(result.skills?.entries))throw Error('REAL_SLICE:SKILL_EFFECTS_NOT_PROVEN_ABSENT');
   const value=(x)=>x&&x.status==='known'&&Number.isFinite(x.value)?x.value:undefined;
   return {...result,
    trueAttack:result.trueAttack??value(result.equipment?.trueAttack),
    element:result.element??value(result.equipment?.displayElement),
    affinity:result.affinity??value(result.equipment?.baseAffinity)
   };
  },
  resolveEffects:(build,conditions,channel,effects)=>{
   const result=resolveEffects(build,conditions,channel,effects);
   if(!Array.isArray(result))throw Error('REAL_SLICE:EFFECTS_NOT_RESOLVED_ARRAY');
   const applicability=build.skills.entries.length===0?[]:(typeof resolveSkillApplicability==='function'?resolveSkillApplicability(build.skills.entries):null);
   if(!Array.isArray(applicability)||applicability.length!==build.skills.entries.length||applicability.some(x=>!['non_damage','resolved'].includes(x?.effectDisposition)||typeof x.reason!=='string'||typeof x.evidenceRef!=='string'))throw Error('REAL_SLICE:SKILL_APPLICABILITY_UNRESOLVED');
   for(const effect of result){
    if(!effect||typeof effect.id!=='string'||!['physical','element'].includes(effect.target)||!['attack','coefficient','element','affinity'].includes(effect.stage)||!['add','multiply','cap'].includes(effect.operation)||!Number.isFinite(effect.amount)||!Number.isInteger(effect.order)||typeof effect.source!=='string'||!effect.condition)throw Error('REAL_SLICE:EFFECT_SCHEMA_INVALID');
   }
   return result;
  }
 });
 const componentIds=(id,index)=>({physical:id+':physical:'+index,element:id+':element:'+index,shelling:id+':shelling:'+index,reference:id+':reference:'+index,phial:id+':phial:'+index});
 const lookup=(root,key)=>{
  if(!root||typeof root!=='object')return {found:false};
  if(Object.prototype.hasOwnProperty.call(root,key))return {found:true,value:root[key]};
  for(const value of Object.values(root)){if(value&&typeof value==='object'){const result=lookup(value,key);if(result.found)return result;}}
  return {found:false};
 };
 const requirementIssue=(requirement,conditions,damageStatsState)=>{
  for(const [key,expected] of Object.entries(requirement||{})){
   let actual=lookup(conditions,key);
   if(!actual.found&&key==='tripleExtract'){
    const extract=lookup(conditions,'extractState');
    if(extract.found)actual={found:true,value:extract.value==='TRIPLE_EXTRACT'||extract.value==='EXTRACT'};
   }
   if(!actual.found)return 'REAL_SLICE:STATE_REQUIREMENT_UNRESOLVED:'+key;
   if(actual.value!==expected)return 'REAL_SLICE:STATE_REQUIREMENT_MISMATCH:'+key;
  }
  if(damageStatsState!==undefined&&damageStatsState!==null){
   let actual=lookup(conditions,'damageStatsState');
   if(!actual.found){const extract=lookup(conditions,'extractState');if(extract.found)actual={found:true,value:extract.value};}
   if(!actual.found){const triple=lookup(conditions,'tripleExtract');if(triple.found)actual={found:true,value:triple.value?'TRIPLE_EXTRACT':'NO_EXTRACT'};}
   if(!actual.found)return 'REAL_SLICE:DAMAGE_STATS_STATE_UNRESOLVED:'+damageStatsState;
   const normalized=actual.value===true?'TRIPLE_EXTRACT':actual.value===false?'NO_EXTRACT':actual.value;
   if(normalized!==damageStatsState)return 'REAL_SLICE:DAMAGE_STATS_STATE_MISMATCH:'+damageStatsState;
   const stateStats=conditions?.stateStatsByState?.[damageStatsState];
   if(!stateStats||typeof stateStats!=='object'||!Number.isFinite(stateStats.attack)||!Number.isFinite(stateStats.element)||!Number.isFinite(stateStats.affinity))return 'REAL_SLICE:STATE_STATS_UNRESOLVED:'+damageStatsState;
  }
  return null;
 };
 const handlers={[weaponType]:({event,state,build,effects,conditions})=>{
  if(event.type==='consume'&&event.contract==='GL_NORMAL_ROUNDS'&&weaponType==='gunlance'){const nextState=JSON.parse(JSON.stringify(state));nextState.gunlance.loadedRounds-=event.amount;return {nextState};}
  if(event.type!=='hit'&&event.contract==='CB_ED1_NORMAL_RESOURCE'&&weaponType==='charge-blade'&&event.techniqueId==='CB_ELEMENT_DISCHARGE_1'){
   const nextState=JSON.parse(JSON.stringify(state));
   if(event.type==='consume')nextState.chargeBlade.normalPhials-=event.amount;
   else if(event.type==='transition')nextState.chargeBlade.previousAction=event.techniqueId;
   else throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
   return {nextState};
  }
  const resource=event.components?.find(c=>c.parameters?.resourceContract)?.parameters.resourceContract;
  if(resource){
   if(!['CHARGE','AXE_NEUTRAL'].includes(state?.chargeBlade?.previousAction)||!Number.isInteger(state?.chargeBlade?.normalPhials))throw Error('REAL_SLICE:CB_ED1_START_STATE_UNRESOLVED');
   if(state.chargeBlade.normalPhials<resource.consumeNormalPhials)throw Error('REAL_SLICE:CB_ED1_PHIAL_STOCK_INSUFFICIENT');
  }
  if(event.type!=='hit'||!uniqueTechniqueIds.includes(event.techniqueId)||!Array.isArray(event.components))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  const physicalEvents=event.components.filter(c=>c.kind==='physical'),elementEvents=event.components.filter(c=>c.kind==='element'),shellingEvents=event.components.filter(c=>c.kind==='shelling'),referenceEvents=event.components.filter(c=>c.kind==='reference'),phialEvents=event.components.filter(c=>c.kind==='phial');
  if(shellingEvents.length){
   for(const c of shellingEvents){const r=c.parameters?.shellingResource;if(r&&(!Number.isInteger(state?.gunlance?.loadedRounds)||state.gunlance.loadedRounds<r.amount))throw Error('REAL_SLICE:GL_NORMAL_ROUNDS_INSUFFICIENT');}
   if(physicalEvents.length||elementEvents.length||shellingEvents.length!==event.components.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:SHELLING_COMPONENT_MIXED']};
   const unresolved=shellingEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).shelling).map(c=>c.id);
   return {emit:shellingEvents.filter(c=>!unresolved.includes(c.id)).map(c=>c.id),inactive:[],unresolved};
  }
  if(referenceEvents.length){
   if(physicalEvents.length||elementEvents.length||shellingEvents.length||referenceEvents.length!==event.components.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:REFERENCE_COMPONENT_MIXED']};
   const unresolved=referenceEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).reference).map(c=>c.id);
   return {emit:referenceEvents.filter(c=>!unresolved.includes(c.id)).map(c=>c.id),inactive:[],unresolved};
  }
  if(!physicalEvents.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:PHYSICAL_COMPONENTS_UNRESOLVED']};
  const emit=[],inactive=[],unresolved=[],reasons={};
  for(const physicalEvent of physicalEvents){
   const index=physicalEvent.parameters?.hitIndex,ids=componentIds(event.techniqueId,index),elementEvent=elementEvents.find(c=>c.parameters?.hitIndex===index);
   if(physicalEvent.id!==ids.physical||elementEvent&&elementEvent.id!==ids.element||(!elementEvent&&event.components.some(c=>c.id===ids.element)))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
   const modifier=elementEvent?.parameters?.elementModifier??physicalEvent.parameters?.elementModifier;
   const transition=physicalEvent.parameters?.damageStateTransition;
   let stateIssue=requirementIssue(physicalEvent.parameters?.stateRequirement,conditions,transition?null:physicalEvent.parameters?.damageStatsState);
   if(!stateIssue&&transition){
    const activation=transition.requiredAtActivation;
    if(activation==='TRIPLE_EXTRACT')stateIssue=requirementIssue({tripleExtract:true},conditions,null);
    else if(typeof activation!=='string'||!activation)stateIssue='REAL_SLICE:STATE_TRANSITION_UNRESOLVED';
    if(!stateIssue&&typeof transition.damageStatsState!=='string')stateIssue='REAL_SLICE:DAMAGE_STATS_STATE_UNRESOLVED';
    if(!stateIssue){const stateStats=conditions?.stateStatsByState?.[transition.damageStatsState];if(!stateStats||typeof stateStats!=='object'||!Number.isFinite(stateStats.attack)||!Number.isFinite(stateStats.element)||!Number.isFinite(stateStats.affinity))stateIssue='REAL_SLICE:STATE_STATS_UNRESOLVED:'+transition.damageStatsState;}
   }
   if(stateIssue){unresolved.push(ids.physical);reasons[ids.physical]=stateIssue;if(elementEvent){unresolved.push(ids.element);reasons[ids.element]=stateIssue;}continue;}
   if(!Number.isFinite(modifier)||modifier<0){unresolved.push(ids.element);continue;}
   emit.push(ids.physical);
   if(modifier===0){if(elementEvent)inactive.push(ids.element);continue;}
   if(build?.element===0){if(elementEvent)inactive.push(ids.element);continue;}
   if(!Number.isFinite(build?.element)||!Array.isArray(effects)){if(elementEvent)unresolved.push(ids.element);continue;}
   if(elementEvent)emit.push(ids.element);
  }
  const phialUnresolved=phialEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).phial).map(c=>c.id);
  unresolved.push(...phialUnresolved);
  emit.push(...phialEvents.filter(c=>!phialUnresolved.includes(c.id)).map(c=>c.id));
  if(event.components.some(c=>!emit.includes(c.id)&&!inactive.includes(c.id)&&!unresolved.includes(c.id)))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  return {emit,inactive,unresolved,reasons};
 }};
 return createPipeline({versions,openDataSnapshot,initialState,handlers,formulae:{physical,element:elemental,shelling:shellingFormula,reference:referenceFormula,phial:phialFormula}});
}
module.exports={createRealOneHitPipeline};

});
define("./real-one-hit-pipeline.cjs",function(module,exports,require){
'use strict';
// Isolated real-DB entry candidate. Does not modify production HTML or define game damage numbers.
// Atomic source.capture must return equipment, effects and raw Technique DB in one immutable version bundle.
const {createImmutableProvider}=require('./immutable-provider.cjs');
const {createPipeline}=require('./pipeline.cjs');
const {adaptOrdinaryPhysicalHit}=require('./real-technique-one-hit-adapter.cjs');
const {createSourcedPhysicalFormula,createSourcedElementalFormula}=require('./sourced-physical-formula.cjs');
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function createRealOneHitPipeline({versions,source,resolveBuild,resolveEffects,resolveSkillApplicability,initialState,formulae,canonicalPhysical,shellingFormula,referenceFormula,phialFormula,weaponType='hammer',techniqueId='HAM_SIDE_SWING',techniqueIds=null}){
 if(typeof source?.capture!=='function')throw Error('REAL_SLICE:ATOMIC_CAPTURE_REQUIRED');
 const physical=canonicalPhysical?createSourcedPhysicalFormula(canonicalPhysical):formulae?.physical;
 const elemental=canonicalPhysical&&typeof canonicalPhysical.resolveElementSharpness==='function'&&typeof canonicalPhysical.resolveElementHitzone==='function'?createSourcedElementalFormula({...canonicalPhysical,resolveElementSharpness:canonicalPhysical.resolveElementSharpness,resolveHitzone:canonicalPhysical.resolveElementHitzone}):formulae?.element;
 if(typeof physical!=='function')throw Error('REAL_SLICE:PHYSICAL_FORMULA_REQUIRED');
 if(canonicalPhysical?.expectedGameVersion!==undefined && canonicalPhysical.expectedGameVersion!==versions?.game)throw Error('REAL_SLICE:GAME_VERSION_MISMATCH');
 if(typeof resolveBuild!=='function'||typeof resolveEffects!=='function'||typeof initialState!=='function')throw Error('REAL_SLICE:RESOLVERS_REQUIRED');
 // The pinned technique is independent of A/B builds; the physical-only disposition is
 // checked against every build and each channel, rather than cached from one build.
 const selectedTechniqueIds=Array.isArray(techniqueIds)&&techniqueIds.length?techniqueIds:[techniqueId];
 const uniqueTechniqueIds=[...new Set(selectedTechniqueIds)];
 const openDataSnapshot=createImmutableProvider({
  capture:pinned=>{
   const image=source.capture(pinned);
   if(!image?.techniques)throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND');
   const techniques={};
   for(const id of uniqueTechniqueIds){
    if(!own(image.techniques,id))throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND:'+id);
    const record=image.techniques[id];
    // The element-disposition proof belongs to L2/L3 and must not be fabricated during capture.
    techniques[id]=adaptOrdinaryPhysicalHit({weaponType,techniqueId:id,record,dbVersion:pinned.technique,allowUnresolvedElement:true});
   }
   return {...image,techniques};
  },
  resolveBuild:(raw,equipment,request)=>{
   const result=resolveBuild(raw,equipment,request);
   if(result?.weaponType!==weaponType)throw Error('REAL_SLICE:WEAPON_MISMATCH');
   if(result&&result.elementType===undefined&&result.equipment?.elementType!==undefined)result.elementType=result.equipment.elementType;
   if(result?.equipment?.displayElement?.status!=='known'||!Number.isFinite(result.equipment.displayElement.value)||result.equipment.displayElement.value<0)throw Error('REAL_SLICE:ELEMENT_NOT_RESOLVED');
   if(result.equipment.displayElement.value>0&&(!result.equipment.elementType||typeof result.equipment.elementType!=='string'))throw Error('REAL_SLICE:ELEMENT_TYPE_NOT_RESOLVED');
   if(!Array.isArray(result.skills?.entries))throw Error('REAL_SLICE:SKILL_EFFECTS_NOT_PROVEN_ABSENT');
   const value=(x)=>x&&x.status==='known'&&Number.isFinite(x.value)?x.value:undefined;
   return {...result,
    trueAttack:result.trueAttack??value(result.equipment?.trueAttack),
    element:result.element??value(result.equipment?.displayElement),
    affinity:result.affinity??value(result.equipment?.baseAffinity)
   };
  },
  resolveEffects:(build,conditions,channel,effects)=>{
   const result=resolveEffects(build,conditions,channel,effects);
   if(!Array.isArray(result))throw Error('REAL_SLICE:EFFECTS_NOT_RESOLVED_ARRAY');
   const applicability=build.skills.entries.length===0?[]:(typeof resolveSkillApplicability==='function'?resolveSkillApplicability(build.skills.entries):null);
   if(!Array.isArray(applicability)||applicability.length!==build.skills.entries.length||applicability.some(x=>!['non_damage','resolved'].includes(x?.effectDisposition)||typeof x.reason!=='string'||typeof x.evidenceRef!=='string'))throw Error('REAL_SLICE:SKILL_APPLICABILITY_UNRESOLVED');
   for(const effect of result){
    if(!effect||typeof effect.id!=='string'||!['physical','element'].includes(effect.target)||!['attack','coefficient','element','affinity'].includes(effect.stage)||!['add','multiply','cap'].includes(effect.operation)||!Number.isFinite(effect.amount)||!Number.isInteger(effect.order)||typeof effect.source!=='string'||!effect.condition)throw Error('REAL_SLICE:EFFECT_SCHEMA_INVALID');
   }
   return result;
  }
 });
 const componentIds=(id,index)=>({physical:id+':physical:'+index,element:id+':element:'+index,shelling:id+':shelling:'+index,reference:id+':reference:'+index,phial:id+':phial:'+index});
 const lookup=(root,key)=>{
  if(!root||typeof root!=='object')return {found:false};
  if(Object.prototype.hasOwnProperty.call(root,key))return {found:true,value:root[key]};
  for(const value of Object.values(root)){if(value&&typeof value==='object'){const result=lookup(value,key);if(result.found)return result;}}
  return {found:false};
 };
 const requirementIssue=(requirement,conditions,damageStatsState)=>{
  for(const [key,expected] of Object.entries(requirement||{})){
   let actual=lookup(conditions,key);
   if(!actual.found&&key==='tripleExtract'){
    const extract=lookup(conditions,'extractState');
    if(extract.found)actual={found:true,value:extract.value==='TRIPLE_EXTRACT'||extract.value==='EXTRACT'};
   }
   if(!actual.found)return 'REAL_SLICE:STATE_REQUIREMENT_UNRESOLVED:'+key;
   if(actual.value!==expected)return 'REAL_SLICE:STATE_REQUIREMENT_MISMATCH:'+key;
  }
  if(damageStatsState!==undefined&&damageStatsState!==null){
   let actual=lookup(conditions,'damageStatsState');
   if(!actual.found){const extract=lookup(conditions,'extractState');if(extract.found)actual={found:true,value:extract.value};}
   if(!actual.found){const triple=lookup(conditions,'tripleExtract');if(triple.found)actual={found:true,value:triple.value?'TRIPLE_EXTRACT':'NO_EXTRACT'};}
   if(!actual.found)return 'REAL_SLICE:DAMAGE_STATS_STATE_UNRESOLVED:'+damageStatsState;
   const normalized=actual.value===true?'TRIPLE_EXTRACT':actual.value===false?'NO_EXTRACT':actual.value;
   if(normalized!==damageStatsState)return 'REAL_SLICE:DAMAGE_STATS_STATE_MISMATCH:'+damageStatsState;
   const stateStats=conditions?.stateStatsByState?.[damageStatsState];
   if(!stateStats||typeof stateStats!=='object'||!Number.isFinite(stateStats.attack)||!Number.isFinite(stateStats.element)||!Number.isFinite(stateStats.affinity))return 'REAL_SLICE:STATE_STATS_UNRESOLVED:'+damageStatsState;
  }
  return null;
 };
 const handlers={[weaponType]:({event,state,build,effects,conditions})=>{
  if(event.type==='consume'&&event.contract==='GL_NORMAL_ROUNDS'&&weaponType==='gunlance'){const nextState=JSON.parse(JSON.stringify(state));nextState.gunlance.loadedRounds-=event.amount;return {nextState};}
  if(event.type!=='hit'&&event.contract==='CB_ED1_NORMAL_RESOURCE'&&weaponType==='charge-blade'&&event.techniqueId==='CB_ELEMENT_DISCHARGE_1'){
   const nextState=JSON.parse(JSON.stringify(state));
   if(event.type==='consume')nextState.chargeBlade.normalPhials-=event.amount;
   else if(event.type==='transition')nextState.chargeBlade.previousAction=event.techniqueId;
   else throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
   return {nextState};
  }
  const resource=event.components?.find(c=>c.parameters?.resourceContract)?.parameters.resourceContract;
  if(resource){
   if(!['CHARGE','AXE_NEUTRAL'].includes(state?.chargeBlade?.previousAction)||!Number.isInteger(state?.chargeBlade?.normalPhials))throw Error('REAL_SLICE:CB_ED1_START_STATE_UNRESOLVED');
   if(state.chargeBlade.normalPhials<resource.consumeNormalPhials)throw Error('REAL_SLICE:CB_ED1_PHIAL_STOCK_INSUFFICIENT');
  }
  if(event.type!=='hit'||!uniqueTechniqueIds.includes(event.techniqueId)||!Array.isArray(event.components))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  const physicalEvents=event.components.filter(c=>c.kind==='physical'),elementEvents=event.components.filter(c=>c.kind==='element'),shellingEvents=event.components.filter(c=>c.kind==='shelling'),referenceEvents=event.components.filter(c=>c.kind==='reference'),phialEvents=event.components.filter(c=>c.kind==='phial');
  if(shellingEvents.length){
   for(const c of shellingEvents){const r=c.parameters?.shellingResource;if(r&&(!Number.isInteger(state?.gunlance?.loadedRounds)||state.gunlance.loadedRounds<r.amount))throw Error('REAL_SLICE:GL_NORMAL_ROUNDS_INSUFFICIENT');}
   if(physicalEvents.length||elementEvents.length||shellingEvents.length!==event.components.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:SHELLING_COMPONENT_MIXED']};
   const unresolved=shellingEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).shelling).map(c=>c.id);
   return {emit:shellingEvents.filter(c=>!unresolved.includes(c.id)).map(c=>c.id),inactive:[],unresolved};
  }
  if(referenceEvents.length){
   if(physicalEvents.length||elementEvents.length||shellingEvents.length||referenceEvents.length!==event.components.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:REFERENCE_COMPONENT_MIXED']};
   const unresolved=referenceEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).reference).map(c=>c.id);
   return {emit:referenceEvents.filter(c=>!unresolved.includes(c.id)).map(c=>c.id),inactive:[],unresolved};
  }
  if(!physicalEvents.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:PHYSICAL_COMPONENTS_UNRESOLVED']};
  const emit=[],inactive=[],unresolved=[],reasons={};
  for(const physicalEvent of physicalEvents){
   const index=physicalEvent.parameters?.hitIndex,ids=componentIds(event.techniqueId,index),elementEvent=elementEvents.find(c=>c.parameters?.hitIndex===index);
   if(physicalEvent.id!==ids.physical||elementEvent&&elementEvent.id!==ids.element||(!elementEvent&&event.components.some(c=>c.id===ids.element)))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
   const modifier=elementEvent?.parameters?.elementModifier??physicalEvent.parameters?.elementModifier;
   const transition=physicalEvent.parameters?.damageStateTransition;
   let stateIssue=requirementIssue(physicalEvent.parameters?.stateRequirement,conditions,transition?null:physicalEvent.parameters?.damageStatsState);
   if(!stateIssue&&transition){
    const activation=transition.requiredAtActivation;
    if(activation==='TRIPLE_EXTRACT')stateIssue=requirementIssue({tripleExtract:true},conditions,null);
    else if(typeof activation!=='string'||!activation)stateIssue='REAL_SLICE:STATE_TRANSITION_UNRESOLVED';
    if(!stateIssue&&typeof transition.damageStatsState!=='string')stateIssue='REAL_SLICE:DAMAGE_STATS_STATE_UNRESOLVED';
    if(!stateIssue){const stateStats=conditions?.stateStatsByState?.[transition.damageStatsState];if(!stateStats||typeof stateStats!=='object'||!Number.isFinite(stateStats.attack)||!Number.isFinite(stateStats.element)||!Number.isFinite(stateStats.affinity))stateIssue='REAL_SLICE:STATE_STATS_UNRESOLVED:'+transition.damageStatsState;}
   }
   if(stateIssue){unresolved.push(ids.physical);reasons[ids.physical]=stateIssue;if(elementEvent){unresolved.push(ids.element);reasons[ids.element]=stateIssue;}continue;}
   if(!Number.isFinite(modifier)||modifier<0){unresolved.push(ids.element);continue;}
   emit.push(ids.physical);
   if(modifier===0){if(elementEvent)inactive.push(ids.element);continue;}
   if(build?.element===0){if(elementEvent)inactive.push(ids.element);continue;}
   if(!Number.isFinite(build?.element)||!Array.isArray(effects)){if(elementEvent)unresolved.push(ids.element);continue;}
   if(elementEvent)emit.push(ids.element);
  }
  const phialUnresolved=phialEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).phial).map(c=>c.id);
  unresolved.push(...phialUnresolved);
  emit.push(...phialEvents.filter(c=>!phialUnresolved.includes(c.id)).map(c=>c.id));
  if(event.components.some(c=>!emit.includes(c.id)&&!inactive.includes(c.id)&&!unresolved.includes(c.id)))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  return {emit,inactive,unresolved,reasons};
 }};
 return createPipeline({versions,openDataSnapshot,initialState,handlers,formulae:{physical,element:elemental,shelling:shellingFormula,reference:referenceFormula,phial:phialFormula}});
}
module.exports={createRealOneHitPipeline};

});
root.HimmelRealOneHitPipeline=requireModule('/real-one-hit-pipeline.cjs').createRealOneHitPipeline;
})(typeof window!=='undefined'?window:globalThis);
