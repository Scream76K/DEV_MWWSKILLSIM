'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://guard-proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;

const fixture=JSON.parse(fs.readFileSync('docs/reports/r252-dual-blades/evidence/mhdb-dual-blades-hope-dagger.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([fixture])};weaponIndexByKind['dual-blades']=DB.weapons;weaponKind.value='dual-blades';weapon.innerHTML='<option value="155">Hope</option>';weapon.value='155';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};comboDBDemonMode.value='1';build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};`);
const take=()=>JSON.parse(w.eval('JSON.stringify({real:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));
const phase=process.argv[2],rows=[];
const available=(r,status)=>{for(const ch of ['normal','maximum'])assert.equal(r.real.channels[ch].metrics.comboTotalDamage.status,status,JSON.stringify(r.real));};
w.calcBuild();const initial=take();available(initial,'unavailable');assert.match(JSON.stringify(initial.real),/STATE_REQUIREMENT_(UNRESOLVED|MISMATCH):requiresDemonGauge/);
let comparison,sharedFalse,oldResult,savedRaw;
if(phase!=='before'){
 for(const [label,gauge,active] of [['false','0',false],['true-off','1',false],['true-on','1',true]]){
  w.eval(`build.charmCustom.skills=${active?"[{name:'飛燕',level:1}]":"[]"};comboDBDemonGauge.value='${gauge}';comboDBDemonGauge.dispatchEvent(new Event('change',{bubbles:true}));calcBuild();`);
  const r={label,...take()};rows.push(r);assert.equal(r.snapshot.combo.dualBladesState.requiresDemonGauge,gauge==='1');available(r,gauge==='1'?'available':'unavailable');
  if(gauge==='0')assert.match(JSON.stringify(r.real),/STATE_REQUIREMENT_MISMATCH:requiresDemonGauge/);
  if(gauge==='1')w.eval(`buildName.value='gauge-${label}';saveNamedBuild();`);
 }
 for(const ch of ['normal','maximum']){let n=0;const a=rows[1].real.channels[ch].components,b=rows[2].real.channels[ch].components;for(let i=0;i<a.length;i++){if((b[i].effectsApplied||[]).some(x=>x.id.startsWith('airborne:'))){n++;assert.ok(Math.abs(b[i].value-a[i].value*1.1)<.02);}else assert.equal(b[i].value,a[i].value);}assert.equal(n,8);}
 w.applyBuildSnapshot(rows[2].snapshot);w.calcBuild();assert.deepEqual(take().real.channels,rows[2].real.channels);
 savedRaw=JSON.stringify(w.localStorage);const current=take();w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");comparison=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))'));assert.equal(comparison.length,2);assert.deepEqual(take(),current);assert.equal(JSON.stringify(w.localStorage),savedRaw);
 for(const x of comparison)assert.deepEqual(x.real.channels,rows[x.name==='gauge-true-on'?2:1].real.channels);
 w.eval("comboDBDemonGauge.value='0';comboDBDemonGauge.dispatchEvent(new Event('change',{bubbles:true}));calcBuild();");const falseCurrent=take();w.runBuildCompare();sharedFalse=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))'));assert.equal(sharedFalse.length,2);for(const x of sharedFalse)available(x,'unavailable');assert.deepEqual(take(),falseCurrent);assert.equal(JSON.stringify(w.localStorage),savedRaw);
 const old=JSON.parse(JSON.stringify(rows[2].snapshot));delete old.combo.dualBladesState.requiresDemonGauge;w.applyBuildSnapshot(old);w.calcBuild();oldResult=take();assert.equal(oldResult.conditions.dualBladesState.requiresDemonGauge,null);assert.equal(w.document.getElementById('comboDBDemonGauge').value,'');available(oldResult,'unavailable');
}
console.log(JSON.stringify({phase,initial,rows,comparison,sharedFalse,oldResult,savedStorageUnchanged:phase==='before'?null:JSON.stringify(w.localStorage)===savedRaw,scope:'JSDOM DOM change -> public calcBuild -> shared Pipeline; explicit boolean only, no adapter injection, no dynamic gauge simulation or game test',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,require('crypto').createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
