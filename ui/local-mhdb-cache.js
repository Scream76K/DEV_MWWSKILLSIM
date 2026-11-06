/* Per-device MHDB API cache. No bundled API responses; no saved-build storage access. */
(function(root){
'use strict';
const KEYS=['skills','armor','decorations','charms','sets','weapons','monsters'];
const WEAPON_KINDS=['great-sword','long-sword','sword-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow'];
const DB_NAME='mhwilds-api-cache-v1';
function check(ok,reason){if(!ok)throw Error(reason);}
function validateData(data){
  check(data&&typeof data==='object','CACHE_SCHEMA');
  for(const key of KEYS){
    const rows=data[key];check(Array.isArray(rows)&&(key==='monsters'||rows.length>0),'CACHE_DATASET:'+key);
    const ids=new Set();for(const row of rows){check(row&&Number.isInteger(row.id)&&row.id>0&&!ids.has(row.id),'CACHE_ID:'+key);ids.add(row.id);}
  }
  check(WEAPON_KINDS.every(k=>data.weapons.some(w=>w.kind===k)),'CACHE_WEAPON_KINDS');
  check(data.weapons.every(w=>WEAPON_KINDS.includes(w.kind)&&typeof w.name==='string'&&Number.isFinite(w.damage?.raw)),'CACHE_WEAPON_SCHEMA');
  check(data.armor.every(a=>['head','chest','arms','waist','legs'].includes(a.kind)&&typeof a.name==='string'),'CACHE_ARMOR_SCHEMA');
  const skills=new Map(data.skills.map(s=>[s.id,s]));
  for(const charm of data.charms)check(Array.isArray(charm.ranks),'CACHE_CHARM_RANKS');
  for(const row of [...data.weapons,...data.armor,...data.decorations,...data.charms.flatMap(c=>c.ranks)]){
    check(Array.isArray(row.skills),'CACHE_SKILL_ARRAY');
    for(const rank of row.skills){const canonical=skills.get(rank.skill?.id);check(canonical&&Number.isInteger(rank.level)&&rank.level>0&&typeof canonical.name==='string'&&rank.skill.name===canonical.name,'CACHE_SKILL_REFERENCE');}}
  return Object.fromEntries(KEYS.map(k=>[k,data[k].length]));
}
function identity(row){return JSON.stringify([row.gameId??null,row.kind??null,row.name??null]);}
function assertCompatible(oldData,next){
  if(!oldData?.weapons?.length)return;
  for(const key of KEYS){
    const map=new Map(next[key].map(x=>[x.id,x]));
    for(const old of oldData[key]||[]){const row=map.get(old.id);check(row,'CACHE_MISSING_ID:'+key+':'+old.id);check(identity(row)===identity(old),'CACHE_IDENTITY:'+key+':'+old.id);
      if(key==='charms')for(const rank of old.ranks||[]){const r=row.ranks?.find(x=>x.id===rank.id);check(r&&r.name===rank.name,'CACHE_IDENTITY:charm-rank:'+rank.id);}
    }
  }
}
async function hash(data){
  check(root.crypto?.subtle,'CACHE_CRYPTO_UNAVAILABLE');
  const bytes=new TextEncoder().encode(JSON.stringify(data));
  return [...new Uint8Array(await root.crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function validVersion(v){return typeof v==='string'&&/^\d{4}-\d\d-\d\dT/.test(v)&&Number.isFinite(Date.parse(v));}
async function create(data,apiVersion,{legacy=false,savedAt=new Date().toISOString()}={}){
  check(validVersion(apiVersion)||(legacy&&apiVersion===null),'CACHE_VERSION');
  const counts=validateData(data),copy=JSON.parse(JSON.stringify(data));
  return {schemaVersion:1,locale:'ja',adapterVersion:'api-artia-v1',apiVersion,legacy,savedAt,counts,sha256:await hash(copy),data:copy};
}
async function verify(pack){
  check(pack?.schemaVersion===1&&pack.locale==='ja'&&pack.adapterVersion==='api-artia-v1','CACHE_SCHEMA');
  check(validVersion(pack.apiVersion)||(pack.legacy===true&&pack.apiVersion===null),'CACHE_VERSION');
  check(Number.isFinite(Date.parse(pack.savedAt)),'CACHE_CAPTURE_DATE');
  const counts=validateData(pack.data);
  check(KEYS.every(k=>counts[k]===pack.counts?.[k]),'CACHE_COUNT');
  check(pack.sha256===await hash(pack.data),'CACHE_HASH');return pack;
}
function open(){return new Promise((resolve,reject)=>{
  if(!root.indexedDB)return reject(Error('CACHE_IDB_UNAVAILABLE'));
  let settled=false,request;const finish=(error,db)=>{if(settled){db?.close();return;}settled=true;clearTimeout(timer);error?reject(error):resolve(db);};
  const timer=setTimeout(()=>finish(Error('CACHE_IDB_TIMEOUT')),5000);
  try{request=root.indexedDB.open(DB_NAME,1);}catch(e){finish(e);return;}
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('snapshots'))request.result.createObjectStore('snapshots');};
  request.onsuccess=()=>finish(null,request.result);request.onerror=()=>finish(request.error||Error('CACHE_IDB_OPEN'));request.onblocked=()=>finish(Error('CACHE_IDB_BLOCKED'));
});}
async function transact(mode,action){
  const db=await open();try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction('snapshots',mode),store=tx.objectStore('snapshots');let value,error;
    tx.oncomplete=()=>resolve(value);tx.onabort=()=>reject(error||tx.error||Error('CACHE_TRANSACTION_ABORTED'));tx.onerror=()=>{};
    const run=fn=>{try{fn();}catch(e){error=e;tx.abort();}};
    run(()=>action(store,x=>{value=x;},run));
  });}finally{db.close();}
}
async function read(){return transact('readonly',(s,done)=>{const a=s.get('active'),p=s.get('previous');p.onsuccess=()=>done({active:a.result||null,previous:p.result||null});});}
async function replacePair(before,after){
  return transact('readwrite',(s,done,run)=>{const a=s.get('active'),p=s.get('previous');p.onsuccess=()=>run(()=>{
    check(JSON.stringify({active:a.result||null,previous:p.result||null})===JSON.stringify(before),'CACHE_CHANGED_IN_OTHER_TAB');
    if(JSON.stringify(before)!==JSON.stringify(after))for(const key of ['active','previous'])after[key]?s.put(after[key],key):s.delete(key);
    done(after);
  });});
}
async function verifiedOrNull(pack){try{return pack?await verify(pack):null;}catch{return null;}}
async function commitUpdate(pack){
  await verify(pack);const before=await read(),old=await verifiedOrNull(before.active),previous=await verifiedOrNull(before.previous);
  const base=old||previous;
  if(base){check(!base.apiVersion||!pack.apiVersion||Date.parse(pack.apiVersion)>=Date.parse(base.apiVersion),'CACHE_VERSION_DOWNGRADE');assertCompatible(base.data,pack.data);}
  if(old?.sha256===pack.sha256&&old.apiVersion===pack.apiVersion){await replacePair(before,before);return {pack:old,before,after:before,changed:false};}
  const after={active:pack,previous:base};await replacePair(before,after);return {pack,before,after,changed:true};
}
async function rollbackUpdate(){
  const before=await read();check(before.previous,'CACHE_NO_PREVIOUS');
  const previous=await verify(before.previous),active=await verify(before.active);
  assertCompatible(active.data,previous.data);
  const after={active:previous,previous:active};await replacePair(before,after);return {pack:previous,before,after,changed:true};
}
// A corrupt active is never a compatibility authority. Preserve the validated
// previous generation and compare both stored records before promoting it.
async function rescuePrevious(){
  const before=await read();check(!await verifiedOrNull(before.active),'CACHE_ACTIVE_VALID');
  const pack=await verify(before.previous),after={active:pack,previous:pack};
  await replacePair(before,after);return {pack,before,after,changed:true};
}
async function undo(receipt){if(receipt?.changed)await replacePair(receipt.after,receipt.before);}
async function commit(pack){return (await commitUpdate(pack)).pack;}
async function rollback(){return (await rollbackUpdate()).pack;}
async function clear(){return transact('readwrite',(s)=>s.clear());}
const api={KEYS,WEAPON_KINDS,DB_NAME,validateData,assertCompatible,create,verify,read,commit,rollback,commitUpdate,rollbackUpdate,rescuePrevious,undo,clear};
if(typeof module==='object'&&module.exports)module.exports=api;else root.MHWLocalDBCache=api;
})(typeof globalThis==='object'?globalThis:this);
