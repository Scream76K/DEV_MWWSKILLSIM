const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync('docs/reports/stage4-bow-representatives/lance-counter-before-index.html','utf8').replace(/<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,(tag,a,src,b)=>{if(/^(?:[a-z]+:)?\/\//i.test(src))return tag;const file=src==='hope-hammer-browser-adapter.js'?'docs/reports/stage4-bow-representatives/lance-counter-before-hope-hammer-browser-adapter.js':src;return '<script'+a+b+'>'+fs.readFileSync(file,'utf8').replace(/<\/script/gi,'<\\/script')+'</script>';}),{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
const out={sourceProductHashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js'].map(n=>[n,hash('docs/reports/stage4-bow-representatives/lance-counter-before-'+n)])),environment:'JSDOM, actual exported application MHDB; no synthetic equipment; DOM template load button; not Safari or game',source:{...pack,data:undefined},hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',input,__filename].map(p=>[p,hash(p)])),cases:[],errors};
try{
 w.__stage4DB=pack.data;
 w.eval(`DB=normalizeDB(window.__stage4DB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();`);
 w.document.getElementById('buildTemplateWeaponKind').value='lance';w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value='KOTATU_LAN_01';w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:LAN_COUNTER_DOUBLE_THRUST',{allowMissing:true});monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';App.combo.syncFromDOM();calcBuild();`);
 out.publicResult=read('calcState.realOneHit');out.ui=read('({moves:App.state.combo.moves,summary:buildSummary.textContent})');
 assert.equal(out.publicResult.status,'UNAVAILABLE');out.verdict='EXPECTED_RED: prior public catalog does not adopt the counter technique';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
