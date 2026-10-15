/* DB cache only. Saved builds and other Web Storage keys remain untouched. */
(function(root){
  'use strict';
  const name='kan30-review:v1:mhwilds-db-cache',store='cache',key='kan30-review:v1:mhwilds-data-v700';
  function open(){return new Promise((resolve,reject)=>{
    if(!root.indexedDB){reject(Error('DB_CACHE_IDB_UNAVAILABLE'));return;}
    let request,blocked=false;try{request=root.indexedDB.open(name,1);}catch(e){reject(e);return;}
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(store))request.result.createObjectStore(store);};
    request.onerror=()=>reject(request.error||Error('DB_CACHE_IDB_OPEN'));
    request.onblocked=()=>{blocked=true;reject(Error('DB_CACHE_IDB_BLOCKED'));};
    request.onsuccess=()=>{const db=request.result;if(blocked){db.close();return;}db.onversionchange=()=>db.close();resolve(db);};
  });}
  async function read(){const db=await open();try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly'),request=tx.objectStore(store).get(key);let value;
    request.onsuccess=()=>{value=request.result??null;};
    tx.oncomplete=()=>resolve(value);tx.onabort=()=>reject(tx.error||Error('DB_CACHE_IDB_READ_ABORT'));tx.onerror=()=>{};
  });}finally{db.close();}}
  async function write(pack,expected,guard=()=>{}){const db=await open();try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite'),bucket=tx.objectStore(store),request=bucket.get(key);let cause;
    request.onsuccess=()=>{try{guard();if(JSON.stringify(request.result??null)!==JSON.stringify(expected??null))throw Error('DB_CACHE_CONFLICT');const put=bucket.put(pack,key);put.onsuccess=()=>{try{guard();}catch(e){cause=e;tx.abort();}};}catch(e){cause=e;tx.abort();}};
    tx.oncomplete=()=>resolve();tx.onabort=()=>reject(cause||tx.error||Error('DB_CACHE_IDB_WRITE_ABORT'));tx.onerror=()=>{};
  });}finally{db.close();}}
  async function remove(){const db=await open();try{await new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(key);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('DB_CACHE_IDB_DELETE_ABORT'));tx.onerror=()=>{};});}finally{db.close();}}
  root.DBCacheStore=Object.freeze({read,write,remove});
})(window);
