// Local DB cache only. Saved builds, comparison inputs and numeric results are separate.
(function(root){'use strict';
function validPack(pack){return !!pack&&typeof pack==='object'&&!!pack.data&&['skills','armor','weapons'].every(k=>Array.isArray(pack.data[k])&&pack.data[k].length>0);}
function createCache(indexedDB=root.indexedDB,name='mhwilds-db-cache-v1'){
 let connection=null,queue=Promise.resolve();
 function open(){
  if(!indexedDB)return Promise.reject(Error('CACHE_STORAGE_UNAVAILABLE'));
  if(connection)return connection;
  connection=new Promise((resolve,reject)=>{
   let settled=false;const req=indexedDB.open(name,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('records'))req.result.createObjectStore('records');};
   req.onerror=()=>{settled=true;connection=null;reject(req.error||Error('CACHE_OPEN_FAILED'));};
   req.onblocked=()=>{settled=true;connection=null;reject(Error('CACHE_STORAGE_BLOCKED'));};
   req.onsuccess=()=>{const db=req.result;if(settled){db.close();return;}db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
  });return connection;
 }
 function transaction(mode,operation){
  const task=queue.catch(()=>{}).then(async()=>{const db=await open();return new Promise((resolve,reject)=>{
   let result;const tx=db.transaction('records',mode);tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error||Error('CACHE_TRANSACTION_ABORTED'));tx.onerror=()=>{};
   try{const req=operation(tx.objectStore('records'));req.onsuccess=()=>{result=req.result;};}catch(e){tx.abort();reject(e);}
  });});queue=task;return task;
 }
 return Object.freeze({
  async read(){const record=await transaction('readonly',s=>s.get('data'));if(record==null)return null;if(record.schemaVersion!==1||!validPack(record.pack))throw Error('CACHE_SCHEMA_INVALID');return record.pack;},
  write(pack){if(!validPack(pack))return Promise.reject(Error('CACHE_PACK_INVALID'));return transaction('readwrite',s=>s.put({schemaVersion:1,pack},'data'));},
  clear(){return transaction('readwrite',s=>s.delete('data'));}
 });
}
const api=Object.freeze({createCache,validPack});if(typeof module==='object'&&module.exports)module.exports=api;else root.MHWBrowserPersistence=api;
})(typeof globalThis!=='undefined'?globalThis:this);
