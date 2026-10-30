'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://guard-proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r250-stage5/evidence/hope-hammer-i.mhdb.api.json'))[0];
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind.hammer=DB.weapons;weaponKind.value='hammer';weapon.innerHTML='<option value="387">Hope Hammer I</option>';weapon.value='387';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

w.eval(`DB.weapons[0].specials=[{element:'thunder',kind:'element',damage:{raw:50,display:500},hidden:false}];App.build.setWeapon(DB.weapons[0]);`);
let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a);}};
const take=()=>JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));

const before=process.argv[2]==='before',results={};
for(const active of [false,true]){w.eval(`build.charmCustom={skills:${active?"[{name:'飛燕',level:1}]":"[]"},slots:[0,0,0],weaponSlots:[]};calcBuild();`);results[active?'on':'off']=take();}
if(before){assert.equal(results.off.channels.normal.execution.status,'complete');assert.match(JSON.stringify(results.on),/AIRBORNE_HIT_SCOPE_PENDING:HAM_MIGHTY_CHARGE_UPPERCUT/);}
else{
 for(const ch of ['normal','maximum']){assert.equal(results.on.channels[ch].execution.status,'complete');assert.deepEqual(results.on.channels[ch].components,results.off.channels[ch].components);assert.deepEqual(results.on.channels[ch].metrics,results.off.channels[ch].metrics);}
 const saved=w.buildSnapshot();w.applyBuildSnapshot(saved);w.calcBuild();assert.deepEqual(take().channels,results.on.channels);results.restored=take();
 const db=JSON.parse(fs.readFileSync('docs/reports/r252-dual-blades/evidence/mhdb-dual-blades-hope-dagger.api.json'));
 w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([db])};weaponIndexByKind['dual-blades']=DB.weapons;weaponKind.value='dual-blades';weapon.innerHTML='<option value="155">Hope</option>';weapon.value='155';App.build.setWeapon(DB.weapons[0]);renderComboForWeapon();document.getElementById('comboDBDemonMode').value='1';`);
 results.positive={};for(const active of [false,true]){w.eval(`build.charmCustom.skills=${active?"[{name:'飛燕',level:1}]":"[]"};calcBuild();`);results.positive[active?'on':'off']=adapter.evaluateCurrent({...captured,dualBladesState:{demonMode:true,requiresDemonGauge:true}});}
 for(const ch of ['normal','maximum']){const a=results.positive.off.channels[ch],b=results.positive.on.channels[ch];assert.equal(b.execution.status,'complete',JSON.stringify(b));let count=0;for(let i=0;i<a.components.length;i++){const x=a.components[i],y=b.components[i];if((y.effectsApplied||[]).some(e=>e.id.startsWith('airborne:'))){count++;assert.ok(Math.abs(y.value-x.value*1.1)<.02);}else assert.equal(y.value,x.value);}assert.equal(count,8,JSON.stringify({selected:captured.techniqueIds,skills:captured.skills,a,b}));}
}
console.log(JSON.stringify({phase:before?'before':'after',scope:'Hammer public calcBuild synthetic thunder500 fixture; DB positive uses captured public input plus explicit requiresDemonGauge:true at adapter boundary (existing evidence contract), not DOM end-to-end or video recreation',results,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,require('crypto').createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
