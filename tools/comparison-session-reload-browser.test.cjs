'use strict';
// Run: node --test tools/comparison-session-reload-browser.test.cjs
// Requires locked Playwright plus its Chromium installation. Uses only committed fixtures and disposable contexts.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),fixture=require('../tests/fixtures/comparison-session-inputs.json');
const cacheSource=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json');
const KEY='mhwilds-comparison-session-v2',OLD='mhwilds-comparison-session-v1',BUILDS='mh-wilds-builds-v625';
let server,browser,base;
test.before(async()=>{server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname,p=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.json')?'application/json':'text/html');res.end(b);});});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});});
test.after(async()=>{await browser?.close();if(server)await new Promise(r=>server.close(r));});
async function pageFor(t){const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();t.after(()=>context.close());page.setDefaultTimeout(10000);const errors=[],api=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('**/*',r=>{if(r.request().url().startsWith(base+'/'))return r.continue();if(r.request().url().includes('wilds.mhdb.io'))api.push(r.request().url());return r.abort();});await page.goto(base+'/index.html');await ready(page);return {page,errors,api};}
async function ready(p){return p.evaluate(()=>window.__comparisonSessionReady||window.__localDBReady);}
async function reload(p){await p.reload();return ready(p);}
async function open(p,s){await p.locator(s).first().evaluate(e=>{for(let n=e;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;});}
async function click(p,s){await open(p,s);await p.locator(s).first().click();}
async function seedCurrent(p){await p.evaluate(async source=>{const data=normalizeDB(source.data);const pack=await MHWLocalDBCache.create(data,null,{legacy:true,savedAt:source.exportedAt});await MHWLocalDBCache.commit(pack);},cacheSource);}
async function seedOld(p,mutation=null){const record={schemaVersion:1,pack:{version:'historical-fixture',savedAt:cacheSource.exportedAt,data:cacheSource.data}};if(mutation==='schema')record.schemaVersion=999;if(mutation==='date')delete record.pack.savedAt;if(mutation==='dataset')record.pack.data={...record.pack.data,skills:[]};await p.evaluate(record=>new Promise((resolve,reject)=>{const r=indexedDB.open('mhwilds-db-cache-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('records','readwrite');tx.objectStore('records').put(record,'data');tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>{db.close();reject(tx.error);};};}),record);return record;}
async function oldRecord(p){return p.evaluate(()=>MHWLocalDBCache.readLegacyCache());}
async function nextSession(p,raw,key=KEY){await p.evaluate(({raw,key})=>localStorage.setItem('test-next-session',JSON.stringify({raw,key})),{raw,key});}
async function installNext(p){await p.addInitScript(()=>{const next=localStorage.getItem('test-next-session');if(next!==null){localStorage.removeItem('test-next-session');const x=JSON.parse(next);localStorage.setItem(x.key,x.raw);}});}
async function state(p){return p.evaluate(()=>({build:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),selected:compareSelectedNames(),baseline:lastBuildComparisonBaselineIndex,rows:lastBuildComparisonRows?.map(r=>r.name)||null,saved:localStorage.getItem('mh-wilds-builds-v625'),session:localStorage.getItem('mhwilds-comparison-session-v2'),legacy:localStorage.getItem('mhwilds-comparison-session-v1'),current:currentConsumerCalculation(),comparison:createBuildComparisonReport(),weapons:DB.weapons.length,status:document.getElementById('status').textContent}));}
async function saveNamed(p,name){await open(p,'#buildName');await p.fill('#buildName',name);await click(p,'#saveBuild');}
async function representative(p,c=fixture.cases[0]){
 await p.evaluate(()=>{localStorage.removeItem('mh-wilds-builds-v625');renderSavedBuilds();});
 const named=[];for(const [i,s]of c.inputSnapshots.entries()){await p.evaluate(s=>applyBuildSnapshot(s),s);await click(p,'#calcBuild');await saveNamed(p,['A','B'][i]);named.push(await p.evaluate(()=>buildSnapshotComparable(buildSnapshot())));}
 await click(p,'[data-build-load="A"]');await open(p,'[data-armor="legs"]');await p.selectOption('[data-armor="legs"]','');
 await p.evaluate(()=>{const e=document.getElementById('powerDragonHz');e.value='17';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));});
 await click(p,'#selectAllCompare');await click(p,'#runCompare');await p.selectOption('#comparisonBaseline','1');
 const before=await state(p);assert.notDeepEqual(before.build,named[0]);assert.deepEqual(before.selected,['A','B']);assert.equal(before.baseline,1);assert.equal(before.comparison.schemaVersion,3);return {before,named};
}

test('all14 reload preserves unsaved input, named A/B bytes, selection and B baseline with current schema3 calculation',async t=>{
 const {page:p,errors,api}=await pageFor(t);await seedCurrent(p);assert.equal(await reload(p),true);
 for(const c of fixture.cases){const {before,named}=await representative(p,c);assert.equal(await reload(p),true);const after=await state(p);
  assert.deepEqual(after.build,before.build,c.kind+' unsaved current');assert.deepEqual(after.conditions,before.conditions,c.kind+' conditions');assert.equal(after.saved,before.saved);assert.deepEqual(after.selected,['A','B']);assert.deepEqual(after.rows,['A','B']);assert.equal(after.baseline,1);assert.equal(after.comparison.schemaVersion,3);
  assert.notEqual(after.current.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');assert.deepEqual(after.current.channels,before.current.channels,c.kind+' current channel values');
  for(const [i,n]of ['A','B'].entries()){await click(p,'[data-build-load="'+n+'"]');assert.deepEqual((await state(p)).build,named[i],c.kind+' named '+n);}
  t.diagnostic(c.kind+' restored');
 }assert.deepEqual(api,[]);assert.deepEqual(errors,[]);
});

test('initial empty startup creates no legacy DB/session; pending session waits for late genuine cache load',async t=>{
 const {page:p,errors}=await pageFor(t);assert.equal((await state(p)).session,null);assert.equal(await p.evaluate(async()=> (await indexedDB.databases()).some(x=>x.name==='mhwilds-db-cache-v1')),false);
 await p.evaluate(x=>{localStorage.setItem('mhwilds-comparison-session-v1',JSON.stringify(x.session));localStorage.setItem('mh-wilds-builds-v625',JSON.stringify(x.savedBuilds));},fixture.legacy);
 const raw=JSON.stringify(fixture.legacy.session);assert.equal(await reload(p),false);assert.equal((await state(p)).legacy,raw);assert.equal((await state(p)).build.weaponId,'');assert.equal((await state(p)).session,null);
 await seedCurrent(p);assert.equal(await p.evaluate(()=>loadDataCache()),true);const after=await state(p);assert.equal(after.build.weaponId,'236');assert.equal(after.baseline,1);assert.deepEqual(after.selected,['A','B']);assert.equal(after.legacy,raw);assert.deepEqual(errors,[]);
});

test('genuine old session and old-IDB cache migrate offline while corrupt legacy localStorage and old bytes remain intact',async t=>{
 const {page:p,errors,api}=await pageFor(t),record=await seedOld(p);await p.evaluate(x=>{localStorage.setItem('mhwilds-comparison-session-v1',JSON.stringify(x.session));localStorage.setItem('mh-wilds-builds-v625',JSON.stringify(x.savedBuilds));localStorage.setItem('mhwilds-data-v700','{bad');},fixture.legacy);
 assert.equal(await reload(p),true);const after=await state(p);assert.equal(after.build.weaponId,'236');assert.deepEqual(after.selected,['A','B']);assert.equal(after.baseline,1);assert.equal(after.comparison.schemaVersion,3);assert.equal(after.saved,JSON.stringify(fixture.legacy.savedBuilds));assert.equal(after.legacy,JSON.stringify(fixture.legacy.session));assert.deepEqual(await oldRecord(p),record.pack);assert.equal(await p.evaluate(()=>localStorage.getItem('mhwilds-data-v700')),'{bad');
 const cache=await p.evaluate(()=>MHWLocalDBCache.read());assert.equal(cache.active.legacy,true);assert.equal(cache.active.apiVersion,null);assert.equal(cache.active.savedAt,record.pack.savedAt);assert.deepEqual(errors,[]);assert.deepEqual(api,[]);
});

test('invalid current sessions do not fall back to older valid state or overwrite raw evidence and named saves',async t=>{
 const {page:p,errors}=await pageFor(t);await seedCurrent(p);await reload(p);const {before}=await representative(p);await p.evaluate(()=>dispatchEvent(new Event('pagehide')));const good=(await state(p)).session;assert.ok(good);await installNext(p);
 await p.evaluate(x=>localStorage.setItem('mhwilds-comparison-session-v1',JSON.stringify(x.session)),fixture.legacy);
 const cases=[['malformed','{bad'],...['schema','target','range','missing-build','combo'].map(mode=>{const s=JSON.parse(good);if(mode==='schema')s.schemaVersion=999;if(mode==='target')s.target.part='missing';if(mode==='range')s.conditions.hbgState.range='UNKNOWN';if(mode==='missing-build')s.selectedNames=['Missing'];if(mode==='combo')s.currentBuild.combo.moves=null;return [mode,JSON.stringify(s)];})];
 for(const [label,raw]of cases){await nextSession(p,raw);assert.equal(await reload(p),false,label);const after=await state(p);assert.equal(after.build.weaponId,'',label);assert.equal(after.session,raw,label);assert.equal(after.saved,before.saved);assert.equal(after.rows,null);assert.match(after.status,/復元できません/);await click(p,'#calcBuild');await p.evaluate(()=>dispatchEvent(new Event('pagehide')));assert.equal((await state(p)).session,raw);}
 assert.deepEqual(errors,[]);
});

test('current valid session wins over legacy, keeps numeric-string charm levels and refuses stale current results after a new edit',async t=>{
 const {page:p,errors}=await pageFor(t);await seedCurrent(p);await reload(p);await p.evaluate(s=>applyBuildSnapshot(s),fixture.cases[0].inputSnapshots[0]);await p.evaluate(()=>{build.charmCustom.skills=[{name:'攻撃',level:'2',type:'weapon'}];calcBuild();dispatchEvent(new Event('pagehide'));});const before=await state(p);assert.equal(before.build.charmCustom.skills[0].level,'2');await p.evaluate(x=>localStorage.setItem('mhwilds-comparison-session-v1',JSON.stringify(x.session)),fixture.legacy);
 assert.equal(await reload(p),true);const after=await state(p);assert.deepEqual(after.build,before.build);assert.equal(after.build.charmCustom.skills[0].level,'2');assert.notEqual(after.current.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');
 await p.evaluate(()=>{document.getElementById('powerDragonHz').value='13';});assert.equal((await state(p)).current.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');assert.deepEqual(errors,[]);
});

test('selection exceeding comparison limit is retained without inventing a completed comparison',async t=>{
 const {page:p,errors}=await pageFor(t);await seedCurrent(p);await reload(p);await p.evaluate(s=>applyBuildSnapshot(s),fixture.cases[0].inputSnapshots[0]);for(const name of ['A','B','C','D'])await saveNamed(p,name);await click(p,'#selectAllCompare');await p.evaluate(()=>dispatchEvent(new Event('pagehide')));assert.equal(await reload(p),true);const after=await state(p);assert.deepEqual(after.selected,['A','B','C','D']);assert.equal(after.rows,null);assert.deepEqual(errors,[]);
});

test('invalid legacy envelope/date/dataset cannot be adopted and never creates a successful current cache',async t=>{
 for(const mutation of ['schema','date','dataset']){const {page:p,errors}=await pageFor(t);await seedOld(p,mutation);assert.equal(await reload(p),false,mutation);assert.equal((await state(p)).weapons,0);const cache=await p.evaluate(()=>MHWLocalDBCache.read());assert.equal(cache.active,null);assert.deepEqual(errors,[]);await p.close();}
});

test('valid active or previous current generation wins over legacy cache',async t=>{
 for(const mode of ['active','previous']){const {page:p,errors}=await pageFor(t);const old=await seedOld(p);await seedCurrent(p);const valid=await p.evaluate(()=>MHWLocalDBCache.read());if(mode==='previous')await p.evaluate(pack=>new Promise((resolve,reject)=>{const r=indexedDB.open(MHWLocalDBCache.DB_NAME,1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('snapshots','readwrite'),s=tx.objectStore('snapshots');s.put(pack,'previous');s.put({...pack,sha256:'invalid'},'active');tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>reject(tx.error);};}),valid.active);
 assert.equal(await reload(p),true);const current=await p.evaluate(()=>MHWLocalDBCache.read());assert.equal(current.active.sha256,valid.active.sha256);assert.equal(current.active.savedAt,valid.active.savedAt);assert.deepEqual(await oldRecord(p),old.pack);assert.deepEqual(errors,[]);await p.close();}
});

test('structurally valid invalid charm-level evidence survives reload without becoming a successful calculation',async t=>{
 const {page:p,errors}=await pageFor(t);await seedCurrent(p);await reload(p);
 for(const value of [null,'','nonsense',1.5,undefined]){const snapshot=structuredClone(fixture.cases[0].inputSnapshots[0]);snapshot.charmCustom.skills=[{name:'攻撃',type:'weapon',...(value===undefined?{}:{level:value})}];await p.evaluate(s=>applyBuildSnapshot(s),snapshot);await click(p,'#calcBuild');await p.evaluate(()=>dispatchEvent(new Event('pagehide')));const before=await state(p);assert.equal(await reload(p),true);const after=await state(p);assert.deepEqual(after.build,before.build);assert.deepEqual(after.current,before.current);assert.notEqual(after.current.status,'OK');assert.notEqual(after.current.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');}
 assert.deepEqual(errors,[]);
});

test('late condition-roundtrip rejection restores the exact prior model, calculations and conditions',async t=>{
 const {page:source}=await pageFor(t);await seedCurrent(source);await reload(source);await representative(source);await source.evaluate(()=>dispatchEvent(new Event('pagehide')));const invalid=JSON.parse((await state(source)).session);invalid.conditions.gutsState='UNRECOGNIZED_STATE';
 const {page:p,errors}=await pageFor(t);await p.evaluate(({data,invalid,snapshot})=>{DB=normalizeDB(data);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snapshot);localStorage.setItem('mhwilds-comparison-session-v2',JSON.stringify(invalid));localStorage.setItem('mh-wilds-builds-v625',JSON.stringify({A:snapshot,B:snapshot}));}, {data:cacheSource.data,invalid,snapshot:fixture.cases[1].inputSnapshots[0]});
 // The invalid session names must refer to its own weapon kind; state to roll back remains a different current weapon.
 await p.evaluate(saved=>localStorage.setItem('mh-wilds-builds-v625',saved),(await state(source)).saved);
 const capture=()=>p.evaluate(()=>JSON.parse(JSON.stringify({model:build,calc:calcState,combo:App.state.combo,conditions:compareStep5Snapshot()}))),before=await capture();await p.evaluate(()=>dispatchEvent(new Event('mhwilds-data-ready')));assert.deepEqual(await capture(),before);assert.equal((await state(p)).session,JSON.stringify(invalid));assert.match((await state(p)).status,/SESSION_CONDITION_ROUNDTRIP/);assert.deepEqual(errors,[]);
});

test('actual opaque-origin unavailable storage fails harmlessly with no uncaught async exception',async t=>{
 const context=await browser.newContext(),p=await context.newPage(),errors=[];t.after(()=>context.close());p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.abort());const html=require('./dom-test-setup.cjs').readSimulatorHtml();await p.setContent(html);assert.equal(await ready(p),false);await p.evaluate(()=>dispatchEvent(new Event('pagehide')));assert.deepEqual(errors,[]);assert.match(await p.locator('#status').innerText(),/保存|読み込めません|取得/);
});


test('unknown stored technique remains explicit and unavailable instead of falling back to a standard route',async t=>{
 const {page:p,errors}=await pageFor(t);await seedCurrent(p);await reload(p);const snapshot=structuredClone(fixture.cases[0].inputSnapshots[0]);snapshot.combo.moves=[{techniqueId:'missing-technique'}];await p.evaluate(s=>applyBuildSnapshot(s),snapshot);await click(p,'#calcBuild');await p.evaluate(()=>dispatchEvent(new Event('pagehide')));const before=await state(p);assert.equal(await reload(p),true);const after=await state(p);assert.deepEqual(after.build.combo.moves,[{techniqueId:'missing-technique'}]);assert.deepEqual(after.current,before.current);assert.equal(after.current.status,'UNAVAILABLE');assert.match(after.current.reason,/TECHNIQUE/);assert.notEqual(after.current.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');assert.deepEqual(errors,[]);
});

async function prepareMemorySession(p,raw){
 await p.evaluate(async raw=>{const legacy=JSON.parse(raw),pack=await MHWLocalDBCache.create(normalizeDB(legacy.data),null,{legacy:true,savedAt:legacy.savedAt});adoptDataPack(pack);applyBuildSnapshot({weaponId:String(DB.weapons.find(w=>w.kind==='great-sword').id),weaponKind:'great-sword'});calcBuild();dispatchEvent(new Event('mhwilds-data-ready'));dispatchEvent(new Event('pagehide'));},raw);
 const before=await state(p);assert.ok(before.session);return before;
}

test('verified legacy localStorage remains usable in memory on a real quota-aborted migration',async t=>{
 const {page:p,errors}=await pageFor(t);const data=structuredClone(cacheSource.data);data.weapons=data.weapons.filter((w,i,rows)=>rows.findIndex(x=>x.kind===w.kind)===i);data.armor=data.armor.filter((a,i,rows)=>rows.findIndex(x=>x.kind===a.kind)===i);data.decorations=data.decorations.slice(0,1);data.charms=data.charms.slice(0,1);data.sets=data.sets.slice(0,1);data.monsters=data.monsters.slice(0,1);const raw=JSON.stringify({savedAt:cacheSource.exportedAt,data});
 await p.evaluate(raw=>localStorage.setItem('mhwilds-data-v700',raw),raw);const before=await prepareMemorySession(p,raw);const cdp=await p.context().newCDPSession(p);await cdp.send('Storage.overrideQuotaForOrigin',{origin:base,quotaSize:1});
 try{assert.equal(await reload(p),true);const after=await state(p);assert.equal(after.weapons,14);assert.deepEqual(after.build,before.build);assert.match(after.status,/移行.*未完了|保存.*未完了/);assert.equal(await p.evaluate(()=>localStorage.getItem('mhwilds-data-v700')),raw);assert.equal((await p.evaluate(()=>MHWLocalDBCache.read())).active,null);assert.deepEqual(errors,[]);}finally{await cdp.send('Storage.overrideQuotaForOrigin',{origin:base});}
});

test('unreadable newer current DB preserves its sentinel and uses validated legacy localStorage only in memory',async t=>{
 const {page:p,errors}=await pageFor(t),data=structuredClone(cacheSource.data);data.weapons=data.weapons.filter((w,i,rows)=>rows.findIndex(x=>x.kind===w.kind)===i);data.armor=data.armor.filter((a,i,rows)=>rows.findIndex(x=>x.kind===a.kind)===i);for(const key of ['decorations','charms','sets','monsters'])data[key]=data[key].slice(0,1);const raw=JSON.stringify({savedAt:cacheSource.exportedAt,data});
 await p.evaluate(raw=>{localStorage.setItem('mhwilds-data-v700',raw);return new Promise((resolve,reject)=>{const r=indexedDB.open('mhwilds-api-cache-v1',2);r.onupgradeneeded=()=>r.result.createObjectStore('future-sentinel');r.onsuccess=()=>{const db=r.result,tx=db.transaction('future-sentinel','readwrite');tx.objectStore('future-sentinel').put({untouched:'future-cache'},'evidence');tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>reject(tx.error);};r.onerror=()=>reject(r.error);});},raw);const before=await prepareMemorySession(p,raw);
 assert.equal(await reload(p),true);const after=await state(p);assert.equal(after.weapons,14);assert.deepEqual(after.build,before.build);assert.match(after.status,/現行.*確認できない|現行.*未確認/);assert.match(after.status,/移行.*行っていません|移行.*未実施/);assert.equal(await p.evaluate(()=>localStorage.getItem('mhwilds-data-v700')),raw);
 const evidence=await p.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('mhwilds-api-cache-v1',2);r.onsuccess=()=>{const db=r.result,tx=db.transaction(['future-sentinel','snapshots'],'readonly'),s=tx.objectStore('future-sentinel').get('evidence'),a=tx.objectStore('snapshots').get('active');tx.oncomplete=()=>{resolve({version:db.version,sentinel:s.result,active:a.result??null});db.close();};};r.onerror=()=>reject(r.error);}));assert.deepEqual(evidence,{version:2,sentinel:{untouched:'future-cache'},active:null});assert.deepEqual(errors,[]);
});

test('concurrent native current and legacy cache commits never replace a successfully committed current generation',async t=>{
 const {page:p,errors}=await pageFor(t);const results=await p.evaluate(async source=>{
  const data=normalizeDB(source.data);data.weapons=data.weapons.filter((w,i,rows)=>rows.findIndex(x=>x.kind===w.kind)===i);data.armor=data.armor.slice(0,1);for(const key of ['decorations','charms','sets','monsters'])data[key]=data[key].slice(0,1);
  const current=await MHWLocalDBCache.create(data,source.exportedAt),legacy=await MHWLocalDBCache.create(data,null,{legacy:true,savedAt:source.exportedAt}),results=[];
  for(let i=0;i<12;i++){await MHWLocalDBCache.clear();const out=await Promise.allSettled([MHWLocalDBCache.commitUpdate(current),MHWLocalDBCache.commitLegacy(legacy)]),pair=await MHWLocalDBCache.read();await MHWLocalDBCache.verify(pair.active);results.push({out:out.map(r=>({status:r.status,reason:r.reason?.message,unknown:r.value?.currentCacheUnknown,memory:r.value?.migrationNotPersisted})),apiVersion:pair.active.apiVersion});}
  return {results,version:source.exportedAt};
 },cacheSource);
 let casConflicts=0;for(const row of results.results){if(row.out[0].status==='fulfilled')assert.equal(row.apiVersion,results.version);for(const r of row.out){if(r.status==='rejected'){assert.equal(r.reason,'CACHE_CHANGED_IN_OTHER_TAB');casConflicts++;}assert.notEqual(r.unknown,true);assert.notEqual(r.memory,true);}}assert.ok(casConflicts>0,'native overlap must actually exercise the CAS rejection path');assert.deepEqual(errors,[]);t.diagnostic(casConflicts+' native CAS conflicts rejected without memory fallback');
});

test('selected HP has two choices, defaults FULL and retains explicit LOW through reload without rewriting named legacy data',async t=>{
 const {page:p,errors}=await pageFor(t);await seedCurrent(p);assert.equal(await reload(p),true);
 assert.deepEqual(await p.locator('#powerSelectedHp option').evaluateAll(xs=>xs.map(x=>x.value)),['FULL_HP','AT_OR_BELOW_30_PERCENT']);
 assert.equal(await p.locator('#powerSelectedHp').inputValue(),'FULL_HP');
 const input=fixture.cases[0].inputSnapshots[0];
 await p.evaluate(input=>{const legacy={...input,selectedHp:'UNSELECTED'};localStorage.setItem('mh-wilds-builds-v625',JSON.stringify({legacy}));renderSavedBuilds();},input);
 const raw=await p.evaluate(()=>localStorage.getItem('mh-wilds-builds-v625'));
 await click(p,'[data-build-load="legacy"]');assert.equal(await p.locator('#powerSelectedHp').inputValue(),'FULL_HP');
 for(const hp of ['AT_OR_BELOW_30_PERCENT','FULL_HP']){
  await open(p,'#powerSelectedHp');await p.selectOption('#powerSelectedHp',hp);await click(p,'#calcBuild');assert.equal(await reload(p),true);
  assert.equal(await p.locator('#powerSelectedHp').inputValue(),hp);assert.equal((await state(p)).conditions.selectedHp,hp);assert.equal(await p.evaluate(()=>localStorage.getItem('mh-wilds-builds-v625')),raw);
 }
 assert.deepEqual(errors,[]);
});
